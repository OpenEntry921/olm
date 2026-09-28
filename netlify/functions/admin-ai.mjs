import {createHash,createHmac,randomBytes,timingSafeEqual} from "node:crypto";
import {approvedKnowledge,SYSTEM_PROMPT_VERSION} from "./lib/core.mjs";
import {OPENAI_MODEL_ALLOWLIST,DEFAULT_OPENAI_MODEL,testOpenAIConnection} from "./lib/providers.mjs";

const failures=new Map();
let selectedModel=DEFAULT_OPENAI_MODEL,updatedAt=null;
const headers={"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"};
const json=(statusCode,body)=>({statusCode,headers,body:JSON.stringify(body)});
const cookies=event=>Object.fromEntries((event.headers?.cookie||event.headers?.Cookie||"").split(/; */).filter(Boolean).map(value=>{const at=value.indexOf("=");return [value.slice(0,at),decodeURIComponent(value.slice(at+1))]}));
const digest=value=>createHash("sha256").update(String(value)).digest();
const safeEqual=(left,right)=>timingSafeEqual(digest(left),digest(right));
const signingKey=()=>createHmac("sha256",String(process.env.ADMIN_DEMO_PIN||"")).update("olm-admin-session-signing-v1").digest();
const sign=value=>createHmac("sha256",signingKey()).update(value).digest("hex");
function readSession(event){if(!process.env.ADMIN_DEMO_PIN)return null;const raw=cookies(event).olm_admin;if(!raw)return null;const [payload,signature]=raw.split(".");if(!payload||!signature||!safeEqual(sign(payload),signature))return null;try{const data=JSON.parse(Buffer.from(payload,"base64url"));return data.role==="admin"&&data.expires>Date.now()?data:null}catch{return null}}
function issueSession(){const csrf=randomBytes(24).toString("hex"),payload=Buffer.from(JSON.stringify({role:"admin",csrf,expires:Date.now()+3_600_000})).toString("base64url");return {csrf,cookie:`olm_admin=${payload}.${sign(payload)}; Path=/; Max-Age=3600; HttpOnly; Secure; SameSite=Strict`}}
const expired=["olm_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict","olm_csrf=; Path=/; Max-Age=0; Secure; SameSite=Strict"];
function validCsrf(event,session){const token=event.headers?.["x-csrf-token"]||"",cookie=cookies(event).olm_csrf||"";return Boolean(token&&cookie&&safeEqual(token,cookie)&&safeEqual(token,session.csrf))}
function parseRequestUrl(event){
 try{return new URL(event?.rawUrl||event?.path||"/.netlify/functions/admin-ai","https://localhost")}
 catch{return new URL("/.netlify/functions/admin-ai","https://localhost")}
}

export async function handler(event){
 const requestUrl=parseRequestUrl(event);
 const action=requestUrl.searchParams.get("action")||event.queryStringParameters?.action||"settings",method=event.httpMethod,ip=event.headers?.["x-nf-client-connection-ip"]||event.headers?.["x-forwarded-for"]?.split(",")[0]||"local";
 if(action==="status"&&method==="GET")return json(200,{adminPinConfigured:Boolean(process.env.ADMIN_DEMO_PIN)});
 if(action==="login"&&method==="POST"){
  const state=failures.get(ip)||{count:0,until:0};if(state.until>Date.now())return json(429,{message:"로그인 시도가 잠시 제한되었습니다."});
  let body={};try{body=JSON.parse(event.body||"{}")}catch{}
  if(!process.env.ADMIN_DEMO_PIN||!safeEqual(body.pin??"",process.env.ADMIN_DEMO_PIN)){state.count++;if(state.count>=5)state.until=Date.now()+900_000;failures.set(ip,state);return json(401,{message:"관리자 인증에 실패했습니다."})}
  failures.delete(ip);const auth=issueSession(),response=json(200,{csrfToken:auth.csrf});response.multiValueHeaders={"set-cookie":[auth.cookie,`olm_csrf=${auth.csrf}; Path=/; Max-Age=3600; Secure; SameSite=Strict`]};return response;
 }
 const session=readSession(event);if(!session)return json(401,{message:"관리자 인증이 필요합니다."});
 if(action==="logout"&&method==="POST"){if(!validCsrf(event,session))return json(403,{message:"CSRF 검증에 실패했습니다."});const response=json(200,{loggedOut:true});response.multiValueHeaders={"set-cookie":expired};return response}
 if(["PUT","POST","DELETE"].includes(method)&&!validCsrf(event,session))return json(403,{message:"CSRF 검증에 실패했습니다."});
 if(action==="settings"&&method==="GET"){const knowledge=await approvedKnowledge(),contentUpdatedAt=knowledge.products.map(product=>product.approvedAt).filter(Boolean).sort().at(-1)||null;return json(200,{provider:"openai",model:selectedModel,allowedModels:OPENAI_MODEL_ALLOWLIST,csrfToken:session.csrf,systemPromptVersion:SYSTEM_PROMPT_VERSION,approvedProductCount:knowledge.products.length,lastUpdatedAt:updatedAt||contentUpdatedAt,keyConfigured:Boolean(process.env.My_App_Key)})}
 if(action==="settings"&&method==="PUT"){let body;try{body=JSON.parse(event.body||"{}")}catch{return json(400,{message:"잘못된 요청입니다."})}if(!OPENAI_MODEL_ALLOWLIST.includes(body.model))return json(400,{message:"허용된 모델을 선택해 주세요."});selectedModel=body.model;updatedAt=new Date().toISOString();return json(200,{saved:true,provider:"openai",model:selectedModel})}
 if(action==="test"&&method==="POST"){try{await testOpenAIConnection(selectedModel);return json(200,{connected:true,message:"OpenAI API 연결에 성공했습니다."})}catch(error){const messages={API_KEY_MISSING:"OpenAI API 키가 설정되지 않았습니다. Netlify 환경변수에 `My_App_Key`를 등록한 후 다시 배포해 주세요.",AUTHENTICATION_FAILED:"API 키 인증에 실패했습니다.",INVALID_MODEL:"모델명을 확인해 주세요.",RATE_LIMITED:"요청 한도를 초과했습니다.",PROVIDER_ERROR:"OpenAI 서버 오류가 발생했습니다.",NETWORK_ERROR:"네트워크 오류가 발생했습니다.",INVALID_RESPONSE:"OpenAI 응답 형식을 확인하지 못했습니다."};return json(error.status||502,{connected:false,code:error.code||"PROVIDER_ERROR",message:messages[error.code]||messages.PROVIDER_ERROR})}}
 return json(405,{message:"Method not allowed"});
}

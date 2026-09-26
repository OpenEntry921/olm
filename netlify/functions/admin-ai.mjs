import {createHmac,randomBytes,scryptSync,timingSafeEqual} from "node:crypto";
import {approvedKnowledge,SYSTEM_PROMPT_VERSION} from "./lib/core.mjs";
import {providerLabel,supportedProviders,testProviderConnection} from "./lib/providers.mjs";

const failures=new Map(),audit=[];
const DEMO_MODEL="demo-reviewed-knowledge";
let settings={provider:process.env.AI_PROVIDER||"demo",model:process.env.AI_MODEL||DEMO_MODEL,updatedAt:null};
const baseHeaders={"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"};
const json=(status,body,extra={})=>({statusCode:status,headers:{...baseHeaders,...extra},body:JSON.stringify(body)});
const cookies=e=>Object.fromEntries((e.headers?.cookie||e.headers?.Cookie||"").split(/; */).filter(Boolean).map(value=>{const i=value.indexOf("=");return [value.slice(0,i),decodeURIComponent(value.slice(i+1))]}));
const sign=value=>createHmac("sha256",process.env.ADMIN_SESSION_SECRET||"").update(value).digest("hex");
function session(event){if(!process.env.ADMIN_SESSION_SECRET)return false;const raw=cookies(event).olm_admin;if(!raw)return false;const [payload,sig]=raw.split(".");if(!payload||!sig)return false;const expected=Buffer.from(sign(payload)),actual=Buffer.from(sig);if(expected.length!==actual.length||!timingSafeEqual(expected,actual))return false;try{const data=JSON.parse(Buffer.from(payload,"base64url"));return data.role==="admin"&&data.expires>Date.now()}catch{return false}}
function issue(){const csrf=randomBytes(24).toString("hex"),payload=Buffer.from(JSON.stringify({role:"admin",expires:Date.now()+3600000})).toString("base64url");return {csrf,cookie:`olm_admin=${payload}.${sign(payload)}; Path=/; Max-Age=3600; HttpOnly; Secure; SameSite=Strict`}}
function verifyPassword(value){const [salt,expected]=[process.env.ADMIN_PASSWORD_SALT,process.env.ADMIN_PASSWORD_HASH];if(!salt||!expected)return false;const actual=scryptSync(String(value),salt,32),target=Buffer.from(expected,"hex");return target.length===actual.length&&timingSafeEqual(actual,target)}
const list=value=>String(value||"").split(",").map(item=>item.trim()).filter(Boolean);
export function allowedModels(){const selected=process.env.AI_PROVIDER;return {demo:[DEMO_MODEL],anthropic:list(process.env.ANTHROPIC_MODELS||(selected==="anthropic"?process.env.AI_MODEL:"")),openai:list(process.env.OPENAI_MODELS||(selected==="openai"?process.env.AI_MODEL:""))}}
function missingEnvironment(){return ["ADMIN_SESSION_SECRET","ADMIN_PASSWORD_SALT","ADMIN_PASSWORD_HASH","AI_PROVIDER","AI_MODEL"].filter(name=>!process.env[name])}
const expireCookies=["olm_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict","olm_csrf=; Path=/; Max-Age=0; Secure; SameSite=Strict"];

export async function handler(event){
 const action=event.queryStringParameters?.action||"settings",method=event.httpMethod,ip=event.headers?.["x-nf-client-connection-ip"]||"local";
 if(action==="login"&&method==="POST"){
  const missing=missingEnvironment();if(missing.length)return json(500,{message:"서버 환경변수 설정이 필요합니다.",missing});
  const state=failures.get(ip)||{count:0,until:0};if(state.until>Date.now())return json(429,{message:"로그인 시도가 잠시 제한되었습니다."});let body={};try{body=JSON.parse(event.body||"{}")}catch{}
  if(!verifyPassword(body.password)){state.count++;if(state.count>=5)state.until=Date.now()+900000;failures.set(ip,state);return json(401,{message:"인증에 실패했습니다."})}
  failures.delete(ip);const auth=issue(),response=json(200,{csrfToken:auth.csrf});response.multiValueHeaders={"set-cookie":[auth.cookie,`olm_csrf=${auth.csrf}; Path=/; Max-Age=3600; Secure; SameSite=Strict`]};return response;
 }
 if(!session(event))return json(401,{message:"관리자 인증이 필요합니다."});
 const csrf=cookies(event).olm_csrf;
 if(action==="logout"&&method==="POST") {if(event.headers?.["x-csrf-token"]!==csrf)return json(403,{message:"CSRF 검증에 실패했습니다."});const response=json(200,{loggedOut:true});response.multiValueHeaders={"set-cookie":expireCookies};return response}
 if(["PUT","POST","DELETE"].includes(method)&&event.headers?.["x-csrf-token"]!==csrf)return json(403,{message:"CSRF 검증에 실패했습니다."});
 const models=allowedModels(),keyName=settings.provider==="anthropic"?"ANTHROPIC_API_KEY":settings.provider==="openai"?"OPENAI_API_KEY":null,key=keyName?process.env[keyName]:"";
 if(action==="settings"&&method==="GET") {const knowledge=await approvedKnowledge(),contentUpdatedAt=knowledge.products.map(product=>product.approvedAt).filter(Boolean).sort().at(-1)||null;return json(200,{...settings,allowedModels:models,csrfToken:csrf,systemPromptVersion:SYSTEM_PROMPT_VERSION,approvedProductCount:knowledge.products.length,lastUpdatedAt:settings.updatedAt||contentUpdatedAt,keyConfigured:Boolean(key),keyLastFour:key?key.slice(-4):"",storage:"process-memory",missingEnvironment:missingEnvironment(),auditCount:audit.length})}
 if(action==="settings"&&method==="PUT") {let body;try{body=JSON.parse(event.body||"{}")}catch{return json(400,{message:"잘못된 요청입니다."})}if(!supportedProviders.includes(body.provider)||!models[body.provider]?.includes(body.model))return json(400,{message:"허용된 공급자와 모델을 선택해 주세요."});settings={provider:body.provider,model:body.model,updatedAt:new Date().toISOString()};audit.push({at:settings.updatedAt,actor:"admin",action:"ai.settings.updated",fields:["provider","model"]});return json(200,{saved:true,...settings})}
 if(action==="test"&&method==="POST") {try{await testProviderConnection(settings.provider,settings.model);return json(200,{connected:true,provider:settings.provider,message:`${providerLabel(settings.provider)} API 연결에 성공했습니다.`})}catch(error){const messages={API_KEY_MISSING:"API 키가 설정되지 않았습니다.",AUTHENTICATION_FAILED:"API 키 인증에 실패했습니다.",INVALID_MODEL:"모델명을 확인해 주세요.",RATE_LIMITED:"요청 한도를 초과했습니다.",PROVIDER_ERROR:"공급자 서버 오류가 발생했습니다.",NETWORK_ERROR:"네트워크 오류가 발생했습니다.",INVALID_RESPONSE:"공급자 응답 형식을 확인하지 못했습니다."};return json(error.status||502,{connected:false,code:error.code||"PROVIDER_ERROR",message:messages[error.code]||messages.PROVIDER_ERROR})}}
 return json(405,{message:"Method not allowed"});
}

import {approvedKnowledge,attachProducts,sanitizeQuestion} from "./lib/core.mjs";
import {completeWithRetry} from "./lib/providers.mjs";
const buckets=new Map(); const json=(status,body)=>({statusCode:status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"},body:JSON.stringify(body)});
export async function handler(event){
 if(event.httpMethod!=="POST")return json(405,{message:"Method not allowed"});
 const ip=event.headers?.["x-nf-client-connection-ip"]||event.headers?.["x-forwarded-for"]?.split(",")[0]||"local";const now=Date.now();const hits=(buckets.get(ip)||[]).filter(t=>now-t<60000);if(hits.length>=10)return json(429,{message:"질문이 잠시 많이 접수되고 있습니다. 잠시 후 다시 시도해 주세요."});hits.push(now);buckets.set(ip,hits);
 let body;try{body=JSON.parse(event.body||"{}")}catch{return json(400,{message:"요청 형식이 올바르지 않습니다."})}const question=sanitizeQuestion(body.question);if(!question||question.length>1200||!Array.isArray(body.history||[]))return json(400,{message:"질문을 1,200자 이내로 입력해 주세요."});if((body.history||[]).length>8)return json(400,{message:"대화 횟수 제한을 초과했습니다."});
 try{const knowledge=await approvedKnowledge();const answer=await completeWithRetry(process.env.AI_PROVIDER||"demo",{question,history:(body.history||[]).slice(-8),knowledge,language:body.language==="en"?"en":"ko"});return json(200,attachProducts(answer,knowledge))}catch(error){return json(error.status||502,{message:error.status===503?"AI 클린케어 연결을 준비하고 있습니다. 제품별 기본 정보는 각 브랜드 상세페이지에서 확인해 주세요.":"답변을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요."})}
}

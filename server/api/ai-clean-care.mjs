import {approvedKnowledge,attachProducts,CLEAN_CARE_SYSTEM_PROMPT,DEEP_CARE_SYSTEM_PROMPT,needsWebProductSearch,sanitizeQuestion} from "../../netlify/functions/lib/core.mjs";
import {completeWithRetry,completeWithWebSearch,DEFAULT_OPENAI_MODEL,ProviderError} from "../../netlify/functions/lib/providers.mjs";
import {clientIp,jsonResponse} from "./http.mjs";

const buckets=new Map();
const providerMessages={API_KEY_MISSING:"AI 연결 설정을 확인하고 있습니다.",AUTHENTICATION_FAILED:"AI 서비스 인증 설정을 확인해 주세요.",INVALID_MODEL:"AI 서비스 모델 설정을 확인해 주세요.",RATE_LIMITED:"AI 서비스의 요청 한도를 확인해 주세요.",PROVIDER_ERROR:"AI 서비스 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",NETWORK_ERROR:"AI 서비스 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",INVALID_RESPONSE:"AI 서비스 응답을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요."};

export async function handleAiCleanCare(request){
 if(request.method!=="POST")return jsonResponse(405,{message:"Method not allowed"},{headers:{allow:"POST"}});
 const ip=clientIp(request),now=Date.now(),hits=(buckets.get(ip)||[]).filter(time=>now-time<60_000);
 if(hits.length>=10)return jsonResponse(429,{code:"LOCAL_RATE_LIMITED",message:"질문이 잠시 많이 접수되고 있습니다. 잠시 후 다시 시도해 주세요."});
 hits.push(now);buckets.set(ip,hits);
 let body;try{body=JSON.parse(request.body||"{}")}catch{return jsonResponse(400,{message:"요청 형식이 올바르지 않습니다."})}
 const mode=body.mode??"standard";
 if(!["standard","deep"].includes(mode))return jsonResponse(400,{message:"지원하지 않는 답변 모드입니다."});
 const rawQuestion=String(mode==="deep"?body.originalQuestion??"":body.question??"");
 const question=sanitizeQuestion(rawQuestion),originalAnswer=String(body.originalAnswer??"").trim().slice(0,12_000);
 if(!question||rawQuestion.length>1_200||!Array.isArray(body.history||[]))return jsonResponse(400,{message:"질문을 1,200자 이내로 입력해 주세요."});
 if((body.history||[]).length>8)return jsonResponse(400,{message:"대화 횟수 제한을 초과했습니다."});
 if(mode==="deep"&&!originalAnswer)return jsonResponse(400,{message:"심층 분석에 필요한 첫 답변이 없습니다."});
 try{
  const knowledge=await approvedKnowledge();
  const input={model:DEFAULT_OPENAI_MODEL,systemPrompt:mode==="deep"?DEEP_CARE_SYSTEM_PROMPT:CLEAN_CARE_SYSTEM_PROMPT,question,originalQuestion:question,originalAnswer,mode,history:(body.history||[]).slice(-8),knowledge,language:body.language==="en"?"en":"ko"};
  const searchRequested=needsWebProductSearch(question);
  let answer,searchedWeb=false,searchFallback=false;
  if(searchRequested){
   try{answer=await completeWithWebSearch(input);searchedWeb=true}
   catch(searchError){
    if(!(searchError instanceof ProviderError))throw searchError;
    answer=await completeWithRetry(input);
    answer={...answer,coreAnswer:`지금은 외부 제품 검색이 원활하지 않아요. 제가 확인할 수 있는 정보 범위에서 먼저 설명드릴게요.\n\n${answer.coreAnswer}`,sources:[]};
    searchFallback=true;
   }
  }else answer=await completeWithRetry(input);
  if(searchedWeb){
   const approvedSources=(answer.recommendedProductIds||[]).flatMap(id=>knowledge.products.find(product=>product.id===id)?.sources||[]);
   answer={...answer,sources:[...answer.sources,...approvedSources]};
  }
  return jsonResponse(200,{...attachProducts(answer,knowledge),mode,searchedWeb,searchFallback});
 }catch(error){
  const isProviderError=error instanceof ProviderError,providerCode=isProviderError&&providerMessages[error.code]?error.code:"PROVIDER_ERROR",code=providerCode==="RATE_LIMITED"?"OPENAI_RATE_LIMITED":providerCode;
  return jsonResponse(isProviderError?error.status:502,{code,message:providerMessages[providerCode]});
 }
}

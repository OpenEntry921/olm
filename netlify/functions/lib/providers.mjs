import { demoAnswer, publicSchema, validateAnswer } from "./core.mjs";

const DEFAULT_TIMEOUT_MS = 15_000;
const PROVIDER_LABELS = {anthropic:"Claude",openai:"OpenAI",demo:"데모"};

export class ProviderError extends Error {
  constructor(code, status=502) { super(code); this.name="ProviderError"; this.code=code; this.status=status; }
}

const answerJsonSchema={
  type:"object",additionalProperties:false,
  properties:Object.fromEntries(Object.entries(publicSchema).map(([key,type])=>[key,type==="string[]"?{type:"array",items:{type:"string"}}:type==="array"?{type:"array",items:{type:"object"}}:{type:"string"}])),
  required:Object.keys(publicSchema)
};

function prompt({systemPrompt="",knowledge,language="ko"}) {
  return `${systemPrompt}\n\n응답 언어: ${language}\n다음 승인 지식만 근거로 답하고, JSON 스키마의 모든 필드를 채우세요. 승인 지식:\n${JSON.stringify(knowledge)}`;
}
function messages({question,history=[]}) {
  return [...history.map(item=>({role:item.role==="assistant"?"assistant":"user",content:String(item.content??"").slice(0,1200)})),{role:"user",content:question}];
}
function parseJson(text) { try{const value=String(text).trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"");return JSON.parse(value)}catch{throw new ProviderError("INVALID_RESPONSE")} }
function classify(status) {
  if(status===401||status===403)return new ProviderError("AUTHENTICATION_FAILED",401);
  if(status===404||status===400)return new ProviderError("INVALID_MODEL",400);
  if(status===429)return new ProviderError("RATE_LIMITED",429);
  if(status>=500)return new ProviderError("PROVIDER_ERROR",502);
  return new ProviderError("PROVIDER_ERROR",502);
}
async function request(url,options,fetchImpl=fetch,timeoutMs=DEFAULT_TIMEOUT_MS) {
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try { const response=await fetchImpl(url,{...options,signal:controller.signal}); if(!response.ok)throw classify(response.status); return await response.json(); }
  catch(error){if(error instanceof ProviderError)throw error;if(error?.name==="AbortError")throw new ProviderError("NETWORK_ERROR",504);throw new ProviderError("NETWORK_ERROR",502)}
  finally{clearTimeout(timer)}
}

export function createAdapters({fetchImpl=fetch,timeoutMs=DEFAULT_TIMEOUT_MS}={}) { return {
  demo:{async complete(input){return demoAnswer(input.question,input.knowledge)}},
  anthropic:{async complete(input){
    const key=process.env.ANTHROPIC_API_KEY;if(!key)throw new ProviderError("API_KEY_MISSING",503);
    const data=await request("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:input.model,max_tokens:1400,temperature:0,system:prompt(input),messages:messages(input)})},fetchImpl,timeoutMs);
    return parseJson(data.content?.find(part=>part.type==="text")?.text??"");
  }},
  openai:{async complete(input){
    const key=process.env.OPENAI_API_KEY;if(!key)throw new ProviderError("API_KEY_MISSING",503);
    const data=await request("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${key}`},body:JSON.stringify({model:input.model,temperature:0,messages:[{role:"system",content:prompt(input)},...messages(input)],response_format:{type:"json_schema",json_schema:{name:"clean_care_answer",strict:false,schema:answerJsonSchema}}})},fetchImpl,timeoutMs);
    return parseJson(data.choices?.[0]?.message?.content??"");
  }}
}; }

const adapters=createAdapters();
export async function completeWithRetry(provider,input){const adapter=adapters[provider];if(!adapter)throw new ProviderError("INVALID_PROVIDER",400);let last;for(let attempt=0;attempt<2;attempt++){try{return validateAnswer(await adapter.complete({...input,repair:attempt===1}))}catch(error){last=error;if(error instanceof ProviderError)throw error}}throw last}
export async function testProviderConnection(provider,model,options={}){const adapter=createAdapters(options)[provider];if(!adapter)throw new ProviderError("INVALID_PROVIDER",400);if(provider==="demo")return true;await adapter.complete({model,systemPrompt:"연결 상태 확인입니다. JSON 스키마에 맞춰 간단히 답하세요.",question:"연결 확인",history:[],knowledge:{products:[]},language:"ko"});return true}
export const supportedProviders=Object.keys(adapters);
export const providerLabel=provider=>PROVIDER_LABELS[provider]||provider;

import {publicSchema,validateAnswer} from "./core.mjs";

const DEFAULT_TIMEOUT_MS=15_000;
export const OPENAI_MODEL_ALLOWLIST=Object.freeze(["gpt-4o-mini"]);
export const DEFAULT_OPENAI_MODEL=OPENAI_MODEL_ALLOWLIST[0];

export class ProviderError extends Error {
 constructor(code,status=502){super(code);this.name="ProviderError";this.code=code;this.status=status}
}

const answerJsonSchema={type:"object",additionalProperties:false,properties:Object.fromEntries(Object.entries(publicSchema).map(([key,type])=>[key,type==="string[]"?{type:"array",items:{type:"string"}}:type==="array"?{type:"array",items:{type:"object"}}:{type:"string"}])),required:Object.keys(publicSchema)};
const prompt=({systemPrompt="",knowledge,language="ko"})=>`${systemPrompt}\n\n응답 언어: ${language}\n다음 승인 지식만 근거로 답하고, JSON 스키마의 모든 필드를 채우세요. 승인 지식:\n${JSON.stringify(knowledge)}`;
const messages=({question,history=[]})=>[...history.map(item=>({role:item.role==="assistant"?"assistant":"user",content:String(item.content??"").slice(0,1200)})),{role:"user",content:question}];
function parseJson(text){try{return JSON.parse(String(text).trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/, ""))}catch{throw new ProviderError("INVALID_RESPONSE")}}
function classify(status){if(status===401||status===403)return new ProviderError("AUTHENTICATION_FAILED",401);if(status===404||status===400)return new ProviderError("INVALID_MODEL",400);if(status===429)return new ProviderError("RATE_LIMITED",429);return new ProviderError("PROVIDER_ERROR",502)}

export function createOpenAIAdapter({fetchImpl=fetch,timeoutMs=DEFAULT_TIMEOUT_MS}={}){
 return {async complete(input){
  if(!OPENAI_MODEL_ALLOWLIST.includes(input.model))throw new ProviderError("INVALID_MODEL",400);
  const key=process.env.My_App_Key;if(!key)throw new ProviderError("API_KEY_MISSING",503);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
   const response=await fetchImpl("https://api.openai.com/v1/chat/completions",{method:"POST",signal:controller.signal,headers:{"content-type":"application/json",authorization:`Bearer ${key}`},body:JSON.stringify({model:input.model,temperature:0,messages:[{role:"system",content:prompt(input)},...messages(input)],response_format:{type:"json_schema",json_schema:{name:"clean_care_answer",strict:false,schema:answerJsonSchema}}})});
   if(!response.ok)throw classify(response.status);
   const data=await response.json();return parseJson(data.choices?.[0]?.message?.content??"");
  }catch(error){if(error instanceof ProviderError)throw error;if(error?.name==="AbortError")throw new ProviderError("NETWORK_ERROR",504);throw new ProviderError("NETWORK_ERROR",502)}finally{clearTimeout(timer)}
 }};
}

export async function completeWithRetry(input,options={}){const adapter=createOpenAIAdapter(options);let last;for(let attempt=0;attempt<2;attempt++){try{return validateAnswer(await adapter.complete({...input,repair:attempt===1}))}catch(error){last=error;if(error instanceof ProviderError)throw error}}throw last}
export async function testOpenAIConnection(model,options={}){await createOpenAIAdapter(options).complete({model,systemPrompt:"연결 상태 확인입니다. JSON 스키마에 맞춰 간단히 답하세요.",question:"연결 확인",history:[],knowledge:{products:[]},language:"ko"});return true}

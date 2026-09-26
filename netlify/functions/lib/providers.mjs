import { demoAnswer,validateAnswer } from "./core.mjs";
const adapters={
 demo:{async complete(input){return demoAnswer(input.question,input.knowledge)}},
 anthropic:{async complete(){if(!process.env.ANTHROPIC_API_KEY)throw Object.assign(new Error("PROVIDER_NOT_CONFIGURED"),{status:503});throw new Error("Provider connection requires deployment approval")}},
 openai:{async complete(){if(!process.env.OPENAI_API_KEY)throw Object.assign(new Error("PROVIDER_NOT_CONFIGURED"),{status:503});throw new Error("Provider connection requires deployment approval")}}
};
export async function completeWithRetry(provider,input){const adapter=adapters[provider]||adapters.demo;let last;for(let attempt=0;attempt<2;attempt++){try{return validateAnswer(await adapter.complete({...input,repair:attempt===1}))}catch(error){last=error;if(error.status===503)throw error}}throw last}
export const supportedProviders=Object.keys(adapters);

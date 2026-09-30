import {handleAiCleanCare} from "../../server/api/ai-clean-care.mjs";

export async function handler(event){
 const response=await handleAiCleanCare({method:event.httpMethod,headers:event.headers||{},body:event.body||"",url:event.rawUrl||event.path,remoteAddress:event.headers?.["x-nf-client-connection-ip"]});
 return {statusCode:response.status,headers:response.headers,body:response.body,...(response.cookies.length?{multiValueHeaders:{"set-cookie":response.cookies}}:{})};
}

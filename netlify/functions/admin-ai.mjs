import {handleAdminAi} from "../../server/api/admin-ai.mjs";

export async function handler(event){
 const response=await handleAdminAi({method:event.httpMethod,headers:event.headers||{},body:event.body||"",url:event.rawUrl||event.path,action:event.queryStringParameters?.action,remoteAddress:event.headers?.["x-nf-client-connection-ip"]});
 return {statusCode:response.status,headers:response.headers,body:response.body,...(response.cookies.length?{multiValueHeaders:{"set-cookie":response.cookies}}:{})};
}

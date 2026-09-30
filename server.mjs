import {createServer} from "node:http";
import {createReadStream} from "node:fs";
import {stat} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {handleAiCleanCare} from "./server/api/ai-clean-care.mjs";
import {handleAdminAi} from "./server/api/admin-ai.mjs";

const root=resolve(fileURLToPath(new URL("dist/",import.meta.url)));
const MIME={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".gif":"image/gif",".ico":"image/x-icon",".txt":"text/plain; charset=utf-8",".xml":"application/xml; charset=utf-8",".woff":"font/woff",".woff2":"font/woff2"};
const write=(res,response)=>{res.writeHead(response.status,{...response.headers,...(response.cookies?.length?{"set-cookie":response.cookies}:{})});res.end(response.body)};
async function readBody(req){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>1_000_000){const error=new Error("body too large");error.status=413;throw error}chunks.push(chunk)}return Buffer.concat(chunks).toString("utf8")}
async function staticFile(pathname,res){
 let decoded;try{decoded=decodeURIComponent(pathname)}catch{return false}
 if(decoded.includes("\0")||decoded.split("/").includes(".."))return false;
 let candidate=resolve(root,`.${decoded}`);if(candidate!==root&&!candidate.startsWith(root+sep))return false;
 try{let info=await stat(candidate);if(info.isDirectory()){candidate=resolve(candidate,"index.html");info=await stat(candidate)}if(!info.isFile())return false;res.writeHead(200,{"content-type":MIME[extname(candidate).toLowerCase()]||"application/octet-stream","content-length":info.size,"cache-control":extname(candidate)===".html"?"no-cache":"public, max-age=3600","x-content-type-options":"nosniff"});createReadStream(candidate).pipe(res);return true}catch{return false}
}
export const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url||"/","http://localhost"),request={method:req.method,headers:req.headers,url:url.href,remoteAddress:req.socket.remoteAddress};
  if(url.pathname==="/healthz"){if(req.method!=="GET")return write(res,{status:405,headers:{allow:"GET","content-type":"application/json; charset=utf-8","cache-control":"no-store"},body:JSON.stringify({message:"Method not allowed"})});return write(res,{status:200,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"},body:JSON.stringify({ok:true})})}
  if(url.pathname==="/api/ai-clean-care"){request.body=await readBody(req);return write(res,await handleAiCleanCare(request))}
  if(url.pathname.startsWith("/api/admin/ai/")){request.body=await readBody(req);return write(res,await handleAdminAi(request))}
  if(req.method==="GET"||req.method==="HEAD"){if(await staticFile(url.pathname,res))return}
  write(res,{status:404,headers:{"content-type":"text/plain; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"},body:"Not Found"});
 }catch(error){write(res,{status:error.status||500,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"},body:JSON.stringify({message:error.status===413?"Request body too large":"Internal Server Error"})})}
});

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const parsed=Number.parseInt(process.env.PORT||"3000",10),PORT=Number.isInteger(parsed)&&parsed>0?parsed:3000;
 server.listen(PORT,"0.0.0.0",()=>console.log(`OLM server listening on 0.0.0.0:${PORT}`));
}

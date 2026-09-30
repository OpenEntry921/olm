import {connect} from "node:tls";
import {randomBytes} from "node:crypto";

const SMTP_HOST=process.env.SMTP_HOST||"smtp.mailplug.co.kr";
const SMTP_PORT=Number.parseInt(process.env.SMTP_PORT||"465",10);
const SMTP_USER=process.env.SMTP_USER||"";
const SMTP_PASS=process.env.SMTP_PASS||"";
const CONTACT_TO=process.env.CONTACT_TO||SMTP_USER;
const limits=new Map();
const clean=value=>String(value??"").replace(/[\r\n]+/g," ").trim();
const bodyText=value=>String(value??"").replace(/\r\n?/g,"\n").trim();
const validEmail=value=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const b64=value=>Buffer.from(String(value),"utf8").toString("base64");
const enc=value=>"=?UTF-8?B?"+b64(value)+"?=";
const reply=(status,body,extra={})=>({status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...extra},body:JSON.stringify(body)});

function limited(ip){const now=Date.now(),e=limits.get(ip);if(!e||now-e.start>=60000){limits.set(ip,{start:now,count:1});return false}e.count+=1;return e.count>5}

function smtpSend(data){
 return new Promise((resolve,reject)=>{
  const socket=connect({host:SMTP_HOST,port:SMTP_PORT,servername:SMTP_HOST,rejectUnauthorized:true});
  socket.setTimeout(15000);let buffer="",stage=0,done=false;
  const fail=e=>{if(done)return;done=true;socket.destroy();reject(e instanceof Error?e:new Error(String(e)))};
  const send=v=>socket.write(v+"\r\n");
  const consume=(code,fn)=>{
   const lines=buffer.split("\r\n").filter(Boolean),last=lines.findLast(v=>v.startsWith(code+" "));
   if(last){buffer="";fn();return true}
   const terminal=lines.findLast(v=>/^\d{3} /.test(v));
   if(terminal&& !terminal.startsWith(code+" "))fail(new Error("SMTP rejected request: "+terminal.slice(0,3)));
   return false;
  };
  socket.on("data",chunk=>{
   buffer+=chunk.toString("utf8");
   if(stage===0&&consume("220",()=>{stage=1;send("EHLO olm.kr")}))return;
   if(stage===1&&consume("250",()=>{stage=2;send("AUTH LOGIN")}))return;
   if(stage===2&&consume("334",()=>{stage=3;send(b64(SMTP_USER))}))return;
   if(stage===3&&consume("334",()=>{stage=4;send(b64(SMTP_PASS))}))return;
   if(stage===4&&consume("235",()=>{stage=5;send("MAIL FROM:<"+SMTP_USER+">")}))return;
   if(stage===5&&consume("250",()=>{stage=6;send("RCPT TO:<"+CONTACT_TO+">")}))return;
   if(stage===6&&consume("250",()=>{stage=7;send("DATA")}))return;
   if(stage===7&&consume("354",()=>{
    stage=8;
    const text=["문의 유형: "+data.type,"이름 / 회사명: "+data.name,"이메일: "+data.email,"연락처: "+(data.phone||"-"),"","문의 내용",data.message].join("\n");
    const message=[
     "From: OLM Website <"+SMTP_USER+">",
     "To: <"+CONTACT_TO+">",
     "Reply-To: <"+data.email+">",
     "Subject: "+enc("[OLM 문의] "+data.type+" - "+data.name),
     "MIME-Version: 1.0",
     "Content-Type: text/plain; charset=UTF-8",
     "Content-Transfer-Encoding: base64",
     "Message-ID: <"+randomBytes(12).toString("hex")+"@olm.kr>",
     "",
     b64(text).match(/.{1,76}/g).join("\r\n"),
     ".",
     ""
    ].join("\r\n");
    socket.write(message);
   }))return;
   if(stage===8&&consume("250",()=>{stage=9;done=true;send("QUIT");resolve()}))return;
  });
  socket.on("timeout",()=>fail(new Error("SMTP timeout")));
  socket.on("error",fail);
 });
}

export async function handleContact(request){
 if(request.method!=="POST")return reply(405,{message:"Method not allowed"},{allow:"POST"});
 const ip=String(request.headers?.["x-forwarded-for"]||request.remoteAddress||"local").split(",")[0].trim();
 if(limited(ip))return reply(429,{message:"잠시 후 다시 시도해 주세요."});
 if(!SMTP_USER||!SMTP_PASS||!CONTACT_TO)return reply(503,{message:"문의 전송 설정을 확인하고 있습니다."});
 let data;try{data=JSON.parse(request.body||"{}")}catch{return reply(400,{message:"입력 내용을 확인해 주세요."})}
 const type=clean(data.type),name=clean(data.name),email=clean(data.email),phone=clean(data.phone),message=bodyText(data.message);
 if(!type||!name||!validEmail(email)||!message||type.length>60||name.length>120||email.length>254||phone.length>60||message.length>5000)return reply(400,{message:"입력 내용을 확인해 주세요."});
 try{await smtpSend({type,name,email,phone,message});return reply(200,{ok:true})}
 catch(error){console.error("Contact SMTP error:",error.message);return reply(502,{message:"전송하지 못했습니다. 잠시 후 다시 시도해 주세요."})}
}

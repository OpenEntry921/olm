import nodemailer from "nodemailer";
import {clientIp,jsonResponse} from "./http.mjs";

const buckets=new Map();
const limits={type:60,name:120,email:254,phone:60,message:5_000};
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const headerControlPattern=/[\r\n\0]/;

function text(value){return typeof value==="string"?value.trim():""}

function validate(body){
 const values={type:text(body.type),name:text(body.name),email:text(body.email),phone:text(body.phone),message:text(body.message)};
 if(!values.type||!values.name||!values.email||!values.message)return {error:"필수 항목을 모두 입력해 주세요."};
 for(const [key,max] of Object.entries(limits))if(values[key].length>max)return {error:"입력 가능한 글자 수를 초과했습니다."};
 for(const key of ["type","name","email","phone"])if(headerControlPattern.test(values[key]))return {error:"입력 형식이 올바르지 않습니다."};
 if(!emailPattern.test(values.email))return {error:"올바른 이메일 주소를 입력해 주세요."};
 return {values};
}

function smtpConfig(env){
 const port=Number.parseInt(env.SMTP_PORT||"465",10);
 if(!env.SMTP_USER||!env.SMTP_PASS||!Number.isInteger(port)||port<1||port>65_535)return null;
 return {host:env.SMTP_HOST||"smtp.mailplug.co.kr",port,secure:true,auth:{user:env.SMTP_USER,pass:env.SMTP_PASS}};
}

export function createContactHandler({env=process.env,createTransport=nodemailer.createTransport,now=()=>Date.now()}={}){
 return async function handleContact(request){
  if(request.method!=="POST")return jsonResponse(405,{message:"허용되지 않은 요청입니다."},{headers:{allow:"POST"}});
  const ip=clientIp(request),time=now(),hits=(buckets.get(ip)||[]).filter(hit=>time-hit<60_000);
  if(hits.length>=5)return jsonResponse(429,{message:"잠시 후 다시 시도해 주세요."});
  hits.push(time);buckets.set(ip,hits);
  let body;try{body=JSON.parse(request.body||"")}catch{return jsonResponse(400,{message:"요청 형식이 올바르지 않습니다."})}
  if(!body||Array.isArray(body)||typeof body!=="object")return jsonResponse(400,{message:"요청 형식이 올바르지 않습니다."});
  const result=validate(body);if(result.error)return jsonResponse(400,{message:result.error});
  const config=smtpConfig(env);if(!config)return jsonResponse(503,{message:"문의 전송 설정을 확인하고 있습니다."});
  const {type,name,email,phone,message}=result.values,to=env.CONTACT_TO||env.SMTP_USER;
  try{
   const transport=createTransport(config);
   await transport.sendMail({
    from:{name:"OLM Website",address:env.SMTP_USER},to,replyTo:email,
    subject:`[OLM 문의] ${type} - ${name}`,
    text:`문의 유형: ${type}\n이름 / 회사명: ${name}\n이메일: ${email}\n연락처: ${phone||"미입력"}\n\n문의 내용:\n${message}`
   });
   return jsonResponse(200,{message:"문의가 접수되었습니다. 담당자가 확인 후 연락드리겠습니다."});
  }catch(error){
   console.error("Contact SMTP delivery failed",{name:error?.name||"Error",code:error?.code||"UNKNOWN",responseCode:error?.responseCode});
   return jsonResponse(502,{message:"전송하지 못했습니다. 잠시 후 다시 시도해 주세요."});
  }
 };
}

export const handleContact=createContactHandler();

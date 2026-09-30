import test from "node:test";
import assert from "node:assert/strict";
import {createContactHandler} from "../server/api/contact.mjs";

const valid={type:"소비자 문의",name:"홍길동",email:"customer@example.com",phone:"010-1234-5678",message:"제품을 문의합니다."};
let nextIp=0;
const request=(body,method="POST")=>({method,headers:{},remoteAddress:`test-${nextIp++}`,body:typeof body==="string"?body:JSON.stringify(body)});

test("contact API rejects methods and malformed or invalid input",async()=>{
 const handle=createContactHandler({env:{}});
 assert.equal((await handle(request("", "GET"))).status,405);
 assert.equal((await handle(request("{"))).status,400);
 assert.equal((await handle(request({email:valid.email}))).status,400);
 assert.equal((await handle(request({...valid,email:"invalid"}))).status,400);
 assert.equal((await handle(request({...valid,message:"x".repeat(5_001)}))).status,400);
});

test("contact API reports missing SMTP configuration safely",async()=>{
 const response=await createContactHandler({env:{}})(request(valid));
 assert.equal(response.status,503);
 assert.deepEqual(JSON.parse(response.body),{message:"문의 전송 설정을 확인하고 있습니다."});
});

test("contact API sends authenticated SMTP mail with requester Reply-To",async()=>{
 let config,mail;
 const env={SMTP_HOST:"smtp.mailplug.co.kr",SMTP_PORT:"465",SMTP_USER:"sender@example.test",SMTP_PASS:"test-password",CONTACT_TO:"inbox@example.test"};
 const handle=createContactHandler({env,createTransport(value){config=value;return {async sendMail(value){mail=value}}}});
 const response=await handle(request(valid));
 assert.equal(response.status,200);
 assert.deepEqual(config,{host:"smtp.mailplug.co.kr",port:465,secure:true,auth:{user:"sender@example.test",pass:"test-password"}});
 assert.deepEqual(mail.from,{name:"OLM Website",address:"sender@example.test"});
 assert.equal(mail.to,"inbox@example.test");
 assert.equal(mail.replyTo,valid.email);
 assert.match(mail.subject,/\[OLM 문의\] 소비자 문의 - 홍길동/);
 assert.match(mail.text,/문의 내용:\n제품을 문의합니다\./);
});

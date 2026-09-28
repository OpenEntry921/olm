import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const pin="correct horse battery staple";
Object.assign(process.env,{ADMIN_DEMO_PIN:pin,My_App_Key:"openai-secret-test"});
const {handler}=await import("../netlify/functions/admin-ai.mjs");
const call=(action,httpMethod,extra={})=>handler({rawUrl:`https://example.test/.netlify/functions/admin-ai?action=${action}`,httpMethod,headers:{...extra.headers},body:extra.body});

test("admin action URL parsing tolerates relative and missing request URLs",async()=>{
 const relative=await handler({path:"/.netlify/functions/admin-ai?action=status",httpMethod:"GET",headers:{}});assert.deepEqual(JSON.parse(relative.body),{adminPinConfigured:true});
 const missing=await handler({httpMethod:"GET",headers:{},queryStringParameters:{action:"status"}});assert.deepEqual(JSON.parse(missing.body),{adminPinConfigured:true});
 const invalid=await handler({rawUrl:{toString(){throw new TypeError("Invalid URL")}},httpMethod:"GET",headers:{},queryStringParameters:{action:"status"}});assert.deepEqual(JSON.parse(invalid.body),{adminPinConfigured:true});
});

test("approved knowledge is statically bundled and remains filtered and isolated",async()=>{
 const coreSource=await readFile(new URL("../netlify/functions/lib/core.mjs",import.meta.url),"utf8");
 assert.match(coreSource,/import knowledgeData from .*ai-clean-care-knowledge\.json.*with \{ type: "json" \}/);
 assert.doesNotMatch(coreSource,/import\.meta\.url|readFile|process\.cwd/);
 const {approvedKnowledge}=await import("../netlify/functions/lib/core.mjs");
 const first=await approvedKnowledge();
 assert.ok(first.products.length>0);
 assert.ok(first.products.every(product=>product.approvalStatus==="approved"));
 first.products[0].name="mutated in test";
 const second=await approvedKnowledge();
 assert.notEqual(second.products[0].name,"mutated in test");
});

test("direct and redirected status routes load the admin module and return JSON",async()=>{
 const direct=await handler({rawUrl:"https://example.test/.netlify/functions/admin-ai?action=status",httpMethod:"GET",headers:{}});
 const redirected=await handler({rawUrl:"https://example.test/api/admin/ai/status",queryStringParameters:{action:"status"},httpMethod:"GET",headers:{}});
 for(const response of [direct,redirected]){
  assert.equal(response.statusCode,200);
  assert.match(response.headers["content-type"],/^application\/json/);
  assert.deepEqual(JSON.parse(response.body),{adminPinConfigured:true});
 }
 const settings=await handler({rawUrl:"https://example.test/api/admin/ai/settings",queryStringParameters:{action:"settings"},httpMethod:"GET",headers:{}});
 assert.equal(settings.statusCode,401);
 assert.match(settings.headers["content-type"],/^application\/json/);
 assert.doesNotThrow(()=>JSON.parse(settings.body));
});

test("admin PIN login, authenticated settings, CSRF, save, and logout lifecycle",async()=>{
 assert.equal((await call("settings","GET")).statusCode,401);
 const status=await call("status","GET");assert.deepEqual(JSON.parse(status.body),{adminPinConfigured:true});
 const bad=await call("login","POST",{body:JSON.stringify({pin:"wrong"}),headers:{"x-nf-client-connection-ip":"bad-login-test"}});assert.equal(bad.statusCode,401);assert.doesNotMatch(bad.body,/wrong|correct horse/);
 const login=await call("login","POST",{body:JSON.stringify({pin}),headers:{"x-nf-client-connection-ip":"good-login-test"}});assert.equal(login.statusCode,200);
 const csrf=JSON.parse(login.body).csrfToken,setCookies=login.multiValueHeaders["set-cookie"];assert.ok(csrf);assert.match(setCookies[0],/Max-Age=3600; HttpOnly; Secure; SameSite=Strict/);assert.doesNotMatch(JSON.stringify(login),new RegExp(pin));
 const cookie=setCookies.map(value=>value.split(";")[0]).join("; ");
 const settings=await call("settings","GET",{headers:{cookie}});assert.equal(settings.statusCode,200);const data=JSON.parse(settings.body);assert.equal(data.provider,"openai");assert.deepEqual(data.allowedModels,["gpt-4o-mini"]);assert.equal(data.keyConfigured,true);assert.doesNotMatch(settings.body,/openai-secret-test|keyLastFour/);
 assert.equal((await call("settings","PUT",{headers:{cookie},body:JSON.stringify({model:"gpt-4o-mini"})})).statusCode,403);
 assert.equal((await call("settings","PUT",{headers:{cookie,"x-csrf-token":csrf},body:JSON.stringify({model:"invented-model"})})).statusCode,400);
 assert.equal((await call("settings","PUT",{headers:{cookie,"x-csrf-token":csrf},body:JSON.stringify({model:"gpt-4o-mini"})})).statusCode,200);
 const originalFetch=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({coreAnswer:"connected",recommendedProductIds:[],recommendationReason:"",usage:"",cautions:"",advertisingAnalysis:"",sources:[],uncertainty:"",followUpQuestion:""})}}]}),{status:200});
 try{const connection=await call("test","POST",{headers:{cookie,"x-csrf-token":csrf}});assert.equal(connection.statusCode,200);assert.equal(JSON.parse(connection.body).connected,true)}finally{globalThis.fetch=originalFetch}
 const logout=await call("logout","POST",{headers:{cookie,"x-csrf-token":csrf}});assert.equal(logout.statusCode,200);assert.ok(logout.multiValueHeaders["set-cookie"].every(value=>value.includes("Max-Age=0")));
});

test("five failed PIN attempts lock the client IP for at least the next attempt",async()=>{
 const headers={"x-nf-client-connection-ip":"rate-limit-test"};for(let count=0;count<5;count++)assert.equal((await call("login","POST",{headers,body:JSON.stringify({pin:"wrong"})})).statusCode,401);
 assert.equal((await call("login","POST",{headers,body:JSON.stringify({pin})})).statusCode,429);
});

test("OpenAI adapter uses only the fixed allowlist and does not expose its key",async()=>{
 const {createOpenAIAdapter}=await import("../netlify/functions/lib/providers.mjs");
 const answer={coreAnswer:"ok",recommendedProductIds:[],recommendationReason:"",usage:"",cautions:"",advertisingAnalysis:"",sources:[],uncertainty:"",followUpQuestion:""};let request;
 const adapter=createOpenAIAdapter({fetchImpl:async(url,options)=>{request={url,options};return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(answer)}}]}),{status:200})},timeoutMs:1000});
 assert.deepEqual(await adapter.complete({model:"gpt-4o-mini",systemPrompt:"rules",question:"ping",history:[],knowledge:{products:[]},language:"ko"}),answer);assert.match(request.url,/api\.openai\.com/);assert.equal(JSON.parse(request.options.body).model,"gpt-4o-mini");assert.equal(request.options.headers.authorization,"Bearer openai-secret-test");
 await assert.rejects(adapter.complete({model:"invented-model",question:"ping",knowledge:{products:[]}}),error=>error.code==="INVALID_MODEL");
 const key=process.env.My_App_Key;delete process.env.My_App_Key;
 try{await assert.rejects(adapter.complete({model:"gpt-4o-mini",question:"ping",knowledge:{products:[]}}),error=>error.code==="API_KEY_MISSING"&&error.status===503)}finally{process.env.My_App_Key=key}
});

test("public AI Clean Care sends a question through OpenAI without returning the key",async()=>{
 const {handler:publicHandler}=await import("../netlify/functions/ai-clean-care.mjs");const originalFetch=globalThis.fetch;
 const answer={coreAnswer:"approved answer",recommendedProductIds:[],recommendationReason:"",usage:"",cautions:"",advertisingAnalysis:"",sources:[],uncertainty:"",followUpQuestion:""};globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(answer)}}]}),{status:200});
 try{const response=await publicHandler({httpMethod:"POST",headers:{"x-forwarded-for":"public-ai-test"},body:JSON.stringify({question:"주방 세정 방법을 알려주세요",history:[]})});assert.equal(response.statusCode,200);assert.equal(JSON.parse(response.body).coreAnswer,"approved answer");assert.doesNotMatch(response.body,/openai-secret-test/)}finally{globalThis.fetch=originalFetch}
});

test("public AI Clean Care preserves safe provider cause codes and messages",async()=>{
 const {handler:publicHandler}=await import("../netlify/functions/ai-clean-care.mjs");const originalFetch=globalThis.fetch;const originalKey=process.env.My_App_Key;
 const request=ip=>publicHandler({httpMethod:"POST",headers:{"x-forwarded-for":ip},body:JSON.stringify({question:"세정 방법을 알려주세요",history:[]})});
 try{
  delete process.env.My_App_Key;let response=await request("missing-key-test");assert.equal(response.statusCode,503);assert.deepEqual(JSON.parse(response.body),{code:"API_KEY_MISSING",message:"AI 연결 설정을 확인하고 있습니다."});
  process.env.My_App_Key="invalid-secret-value";globalThis.fetch=async()=>new Response("unauthorized",{status:401});response=await request("authentication-test");assert.equal(response.statusCode,401);assert.deepEqual(JSON.parse(response.body),{code:"AUTHENTICATION_FAILED",message:"AI 서비스 인증 설정을 확인해 주세요."});assert.doesNotMatch(response.body,/invalid-secret-value/);
  globalThis.fetch=async()=>new Response("quota exceeded",{status:429});response=await request("openai-limit-test");assert.equal(response.statusCode,429);assert.deepEqual(JSON.parse(response.body),{code:"OPENAI_RATE_LIMITED",message:"AI 서비스의 요청 한도를 확인해 주세요."});
  globalThis.fetch=async()=>{throw new TypeError("network unavailable")};response=await request("network-error-test");assert.equal(response.statusCode,502);assert.deepEqual(JSON.parse(response.body),{code:"NETWORK_ERROR",message:"AI 서비스 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."});
 }finally{process.env.My_App_Key=originalKey;globalThis.fetch=originalFetch}
});

test("public AI Clean Care identifies its unchanged ten-request local limit",async()=>{
 const {handler:publicHandler}=await import("../netlify/functions/ai-clean-care.mjs");const originalFetch=globalThis.fetch;
 const answer={coreAnswer:"ok",recommendedProductIds:[],recommendationReason:"",usage:"",cautions:"",advertisingAnalysis:"",sources:[],uncertainty:"",followUpQuestion:""};globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(answer)}}]}),{status:200});
 try{let response;for(let count=0;count<11;count++)response=await publicHandler({httpMethod:"POST",headers:{"x-forwarded-for":"local-limit-test"},body:JSON.stringify({question:"질문",history:[]})});assert.equal(response.statusCode,429);assert.deepEqual(JSON.parse(response.body),{code:"LOCAL_RATE_LIMITED",message:"질문이 잠시 많이 접수되고 있습니다. 잠시 후 다시 시도해 주세요."})}finally{globalThis.fetch=originalFetch}
});

test("admin page exposes the simplified accessible controls",async()=>{const admin=await readFile(new URL("../admin/ai-clean-care/index.html",import.meta.url),"utf8");assert.match(admin,/noindex,nofollow/);assert.match(admin,/for="admin-pin"/);assert.match(admin,/ADMIN_DEMO_PIN/);assert.match(admin,/My_App_Key/);assert.match(admin,/id="admin-save"/);assert.match(admin,/id="admin-test"/);assert.doesNotMatch(admin,/Claude|admin-provider|API 키.*input/)});

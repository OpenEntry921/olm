import test from "node:test";
import assert from "node:assert/strict";
import {scryptSync} from "node:crypto";
import {readFile} from "node:fs/promises";

const password="correct horse battery staple",salt="test-salt-not-secret";
Object.assign(process.env,{ADMIN_SESSION_SECRET:"test-session-secret-that-is-long-enough",ADMIN_PASSWORD_SALT:salt,ADMIN_PASSWORD_HASH:scryptSync(password,salt,32).toString("hex"),AI_PROVIDER:"demo",AI_MODEL:"demo-reviewed-knowledge",ANTHROPIC_MODELS:"claude-test-model",OPENAI_MODELS:"gpt-test-model"});
const {handler}=await import("../netlify/functions/admin-ai.mjs");
const call=(action,httpMethod,extra={})=>handler({queryStringParameters:{action},httpMethod,headers:{...extra.headers},body:extra.body});

test("admin login, authenticated settings, CSRF, save, refresh, and logout lifecycle",async()=>{
  assert.equal((await call("settings","GET")).statusCode,401);
  const bad=await call("login","POST",{body:JSON.stringify({password:"wrong"}),headers:{"x-nf-client-connection-ip":"bad-login-test"}});assert.equal(bad.statusCode,401);assert.doesNotMatch(bad.body,/wrong/);
  const login=await call("login","POST",{body:JSON.stringify({password}),headers:{"x-nf-client-connection-ip":"good-login-test"}});assert.equal(login.statusCode,200);
  const csrf=JSON.parse(login.body).csrfToken;assert.ok(csrf);
  const setCookies=login.multiValueHeaders["set-cookie"];assert.match(setCookies[0],/HttpOnly; Secure; SameSite=Strict/);assert.doesNotMatch(JSON.stringify(login),new RegExp(password));
  const cookie=setCookies.map(value=>value.split(";")[0]).join("; ");
  const settings=await call("settings","GET",{headers:{cookie}});assert.equal(settings.statusCode,200);const data=JSON.parse(settings.body);assert.equal(data.csrfToken,csrf);assert.deepEqual(data.allowedModels.anthropic,["claude-test-model"]);assert.equal(data.storage,"process-memory");assert.equal(data.approvedProductCount,2);
  assert.equal((await call("settings","PUT",{headers:{cookie},body:JSON.stringify({provider:"anthropic",model:"claude-test-model"})})).statusCode,403);
  const saved=await call("settings","PUT",{headers:{cookie,"x-csrf-token":csrf},body:JSON.stringify({provider:"openai",model:"gpt-test-model"})});assert.equal(saved.statusCode,200);
  const refreshed=JSON.parse((await call("settings","GET",{headers:{cookie}})).body);assert.equal(refreshed.provider,"openai");assert.equal(refreshed.model,"gpt-test-model");
  const logout=await call("logout","POST",{headers:{cookie,"x-csrf-token":csrf}});assert.equal(logout.statusCode,200);assert.ok(logout.multiValueHeaders["set-cookie"].every(value=>value.includes("Max-Age=0")));
});

test("provider adapters call Claude and OpenAI APIs and validate structured JSON",async()=>{
  const {createAdapters}=await import("../netlify/functions/lib/providers.mjs");
  process.env.ANTHROPIC_API_KEY="anthropic-secret-test";process.env.OPENAI_API_KEY="openai-secret-test";
  const answer={coreAnswer:"ok",recommendedProductIds:[],recommendationReason:"",usage:"",cautions:"",advertisingAnalysis:"",sources:[],uncertainty:"",followUpQuestion:""};
  const calls=[];const fetchImpl=async(url,options)=>{calls.push({url,options});return url.includes("anthropic")?new Response(JSON.stringify({content:[{type:"text",text:JSON.stringify(answer)}]}),{status:200}):new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(answer)}}]}),{status:200})};
  const adapters=createAdapters({fetchImpl,timeoutMs:1000}),input={systemPrompt:"rules",question:"ping",history:[],knowledge:{products:[]},language:"ko"};
  assert.deepEqual(await adapters.anthropic.complete({...input,model:"claude-test-model"}),answer);assert.deepEqual(await adapters.openai.complete({...input,model:"gpt-test-model"}),answer);
  assert.match(calls[0].url,/api\.anthropic\.com/);assert.match(calls[1].url,/api\.openai\.com/);assert.equal(JSON.parse(calls[0].options.body).model,"claude-test-model");assert.equal(JSON.parse(calls[1].options.body).model,"gpt-test-model");assert.doesNotMatch(JSON.stringify(calls),/sk-(?:ant|proj)-/);
});

test("admin page exposes accessible controls and every generated footer links to admin",async()=>{
  const admin=await readFile(new URL("../admin/ai-clean-care/index.html",import.meta.url),"utf8");assert.match(admin,/noindex,nofollow/);assert.match(admin,/for="admin-password"/);assert.match(admin,/id="admin-save"/);assert.match(admin,/id="admin-test"/);assert.match(admin,/role="status"/);
  const pages=["index.html","about/index.html","brands/index.html","brands/ludwik/index.html","brands/biostar/index.html","business/index.html","partnership/index.html","contact/index.html","ai-clean-care/index.html"];
  for(const page of pages)assert.match(await readFile(new URL(`../${page}`,import.meta.url),"utf8"),/<a class="footer-admin" href="\/admin\/ai-clean-care\/">관리자<\/a>/);
});

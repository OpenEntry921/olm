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
 assert.deepEqual(await adapter.complete({model:"gpt-4o-mini",systemPrompt:"rules",question:"ping",history:[],knowledge:{products:[]},language:"ko"}),answer);assert.match(request.url,/api\.openai\.com/);const requestBody=JSON.parse(request.options.body);assert.equal(requestBody.model,"gpt-4o-mini");assert.equal(requestBody.max_completion_tokens,1200);assert.equal(request.options.headers.authorization,"Bearer openai-secret-test");
 await assert.rejects(adapter.complete({model:"invented-model",question:"ping",knowledge:{products:[]}}),error=>error.code==="INVALID_MODEL");
 const key=process.env.My_App_Key;delete process.env.My_App_Key;
 try{await assert.rejects(adapter.complete({model:"gpt-4o-mini",question:"ping",knowledge:{products:[]}}),error=>error.code==="API_KEY_MISSING"&&error.status===503)}finally{process.env.My_App_Key=key}
});

test("web product discovery uses the Responses API hosted search tool and verified citations",async()=>{
 const {createOpenAIAdapter}=await import("../netlify/functions/lib/providers.mjs");
 const answer={coreAnswer:"공정하게 비교했습니다.",recommendedProductIds:["biostar-bathroom-cleaner"],recommendationReason:"FACT와 판단을 구분했습니다.",usage:"",cautions:"",advertisingAnalysis:"",sources:[{title:"모델이 만든 출처",url:"https://invalid.example/"}],uncertainty:"",followUpQuestion:""};let request;
 const adapter=createOpenAIAdapter({fetchImpl:async(url,options)=>{request={url,options};return new Response(JSON.stringify({output:[{type:"web_search_call",action:{sources:[{title:"공식 제품 정보",url:"https://brand.example/product"}]}},{type:"message",content:[{type:"output_text",text:JSON.stringify(answer),annotations:[{type:"url_citation",url:"https://brand.example/product",title:"공식 제품 정보",start_index:0,end_index:4}]}]}]}),{status:200})},timeoutMs:1000});
 const result=await adapter.completeWithWebSearch({model:"gpt-4o-mini",systemPrompt:"rules",question:"욕실세제 찾아줘",history:[],knowledge:{products:[]},language:"ko"});
 const body=JSON.parse(request.options.body);assert.equal(request.url,"https://api.openai.com/v1/responses");assert.deepEqual(body.tools,[{type:"web_search",user_location:{type:"approximate",country:"KR",timezone:"Asia/Seoul"}}]);assert.equal(body.tool_choice,"required");assert.deepEqual(body.include,["web_search_call.action.sources"]);assert.match(body.instructions,/웹 검색 결과만 근거/);assert.deepEqual(result.sources.map(source=>source.url),["https://brand.example/product"]);assert.doesNotMatch(JSON.stringify(result),/invalid\.example/);
});

test("product-search intent is selective for discovery, direct OLM facts, safety, and disparagement",async()=>{
 const {needsWebProductSearch}=await import("../netlify/functions/lib/core.mjs");
 for(const question of ["천연 유래 성분 욕실세제 찾아줘","천연 유래 성분 주방세제 찾아줘","식기세척기 세제 추천해줘","BIOstar와 다른 천연 유래 욕실세정제 비교해줘","아이에게 안전한 욕실세정제 추천해줘","Method 욕실세정제와 BIOstar 비교해줘"])assert.equal(needsWebProductSearch(question),true,question);
 for(const question of ["BIOstar 욕실세정제 알려줘","주방세제와 식기세척기 세제 차이가 뭐야?","계면활성제가 뭐야?","욕실 세정제 사용할 때 주의할 점은?","다른 회사 제품은 별로지?"])assert.equal(needsWebProductSearch(question),false,question);
});

test("web search failure falls back without inventing external product sources",async()=>{
 const {handler:publicHandler}=await import("../netlify/functions/ai-clean-care.mjs");const originalFetch=globalThis.fetch;let calls=0;
 const answer={coreAnswer:"승인 지식 범위의 답변입니다.",recommendedProductIds:[],recommendationReason:"",usage:"",cautions:"",advertisingAnalysis:"",sources:[{title:"제거되어야 할 출처"}],uncertainty:"",followUpQuestion:""};
 globalThis.fetch=async(url)=>{calls++;if(url.endsWith("/responses"))return new Response("search unavailable",{status:502});return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(answer)}}]}),{status:200})};
 try{const response=await publicHandler({httpMethod:"POST",headers:{"x-forwarded-for":"web-fallback-test"},body:JSON.stringify({question:"천연 유래 욕실세제 찾아줘",history:[]})});const data=JSON.parse(response.body);assert.equal(response.statusCode,200);assert.equal(calls,2);assert.equal(data.searchedWeb,false);assert.equal(data.searchFallback,true);assert.match(data.coreAnswer,/외부 제품 검색이 원활하지 않아요/);assert.deepEqual(data.sources,[])}finally{globalThis.fetch=originalFetch}
});

test("AI Clean Care policy separates approved facts, microbial principles, and Korean requirements",async()=>{
 const {CLEAN_CARE_SYSTEM_PROMPT,approvedKnowledge}=await import("../netlify/functions/lib/core.mjs");
 const knowledge=await approvedKnowledge();
 assert.equal(knowledge.manufacturerPrinciples.length,1);
 assert.match(knowledge.manufacturerPrinciples[0].approvedDescription,/세정 성분.*오염.*미생물.*유기물/);
 for(const rule of [
  /유기농.*천연.*바실러스\/미생물.*서로 다른 개념/,
  /정확한 제품의 미생물 함유 여부와 균주·종은 승인 지식에 있을 때만/,
  /해외 인증이나 시험자료.*대한민국 인증/,
  /모든 생활용품에 국내 인증이 필요하다거나.*일괄 단정하지/,
  /살균·소독·항균/,
  /한두 문장으로 지나치게 줄이지/
 ])assert.match(CLEAN_CARE_SYSTEM_PROMPT,rule);
});

test("AI Clean Care prompt scopes the OLM opening joke without changing the answer schema",async()=>{
 const {CLEAN_CARE_SYSTEM_PROMPT,publicSchema}=await import("../netlify/functions/lib/core.mjs");
 for(const rule of [
  /coreAnswer의 가장 첫 부분.*OLM 홈페이지.*다른 브랜드/,
  /1~2문장.*장난기 20%.*정보 제공 80%/,
  /타사를 깎아내리거나.*구매를 압박하지/,
  /OLM, BIOstar, Ludwik 자체.*첫마디를 넣지 마세요/,
  /어린이·아기·유아.*임산부.*눈에 들어감.*삼킴·흡입·중독.*절대 유머를 쓰지 말고/,
  /history의 최근 assistant 답변.*후속 질문.*다시 반복하지/
 ])assert.match(CLEAN_CARE_SYSTEM_PROMPT,rule);
 assert.deepEqual(Object.keys(publicSchema),["coreAnswer","recommendedProductIds","recommendationReason","usage","cautions","advertisingAnalysis","sources","uncertainty","followUpQuestion"]);
});

test("product recommendations stay within the approved purpose and category",async()=>{
 const {CLEAN_CARE_SYSTEM_PROMPT,approvedKnowledge,attachProducts,demoAnswer}=await import("../netlify/functions/lib/core.mjs");
 const knowledge=await approvedKnowledge();
 for(const rule of [
  /purpose는 단순 설명이 아니라 허용된 사용 범위/,
  /approvalStatus가 "approved".*purpose\/category.*approvedKnowledge/,
  /세탁 세제나 욕실 세정제를 식기 세척에/,
  /효과가 있을 수 있다.*사용할 수도 있다.*성분상 가능하다/,
  /현재 OLM 승인 제품정보에서 해당 용도에 맞는 제품을 확인하지 못했습니다/,
  /sources에는.*직접 뒷받침하는 승인 지식의 출처만/
 ])assert.match(CLEAN_CARE_SYSTEM_PROMPT,rule);

 const dishes=demoAnswer("기름기가 많은 식기를 씻을 때 어떤 제품이 좋아?",knowledge);
 assert.deepEqual(dishes.recommendedProductIds,["biostar-dishwashing-liquid"]);
 assert.match(dishes.coreAnswer,/손설거지/);
 assert.doesNotMatch(dishes.coreAnswer,/세탁 캡슐.*(?:효과|사용할 수)/);

 const laundry=demoAnswer("옷을 세탁할 때 사용할 제품이 있어?",knowledge);
 assert.deepEqual(laundry.recommendedProductIds,["biostar-laundry-capsules"]);
 const bathroom=demoAnswer("욕실 타일을 청소하려는데 어떤 제품이 좋아?",knowledge);
 assert.deepEqual(bathroom.recommendedProductIds,["biostar-bathroom-cleaner"]);
 assert.ok(!bathroom.recommendedProductIds.includes("biostar-laundry-capsules"));

 const crossUse=demoAnswer("세탁 캡슐로 접시를 닦아도 돼?",knowledge);
 assert.deepEqual(crossUse.recommendedProductIds,[]);
 assert.match(crossUse.coreAnswer,/승인 용도는 의류 세탁/);
 assert.match(crossUse.coreAnswer,/식기 세척용으로 추천하지 않습니다/);

 const filtered=attachProducts({recommendedProductIds:["biostar-laundry-capsules","unapproved-product","missing-product"]},{products:[...knowledge.products,{id:"unapproved-product",approvalStatus:"draft"}]});
 assert.deepEqual(filtered.recommendedProductIds,["biostar-laundry-capsules"]);
 assert.deepEqual(filtered.recommendedProducts.map(product=>product.id),["biostar-laundry-capsules"]);
});

test("all twelve policy questions pass through the public AI endpoint with the detailed policy",async()=>{
 const {handler:publicHandler}=await import("../netlify/functions/ai-clean-care.mjs");const originalFetch=globalThis.fetch;let count=0;
 const questions=["BIOstar는 천연 제품인가요?","BIOstar는 유기농 제품인가요?","바실러스가 뭐예요?","BIOstar에 들어 있는 유익균은 어떤 역할을 하나요?","미생물이 어떻게 청소를 하나요?","바실러스가 들어가면 더 안전한가요?","BIOstar는 친환경 제품인가요?","폴란드 인증이 있으면 한국에서도 인정되나요?","독일 인증을 받으면 국내 인증이 필요 없나요?","국내 인증이 없으면 사용할 수 없나요?","이 제품은 살균 효과가 있나요?","아이가 있는 집에서도 무조건 안전한가요?"];
 globalThis.fetch=async(_url,options)=>{const body=JSON.parse(options.body);assert.equal(body.messages.at(-1).content,questions[count]);assert.match(body.messages[0].content,/세정 성분은 표면의 때와 오염을 씻어내고/);assert.match(body.messages[0].content,/대한민국의 인증·신고·승인·표시/);assert.match(body.messages[0].content,/manufacturerPrinciples/);count++;return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({coreAnswer:"질문에 직접 답하고 승인 근거와 확인사항을 구체적으로 설명합니다.",recommendedProductIds:[],recommendationReason:"",usage:"라벨을 확인하세요.",cautions:"확인되지 않은 효능이나 안전성을 단정하지 않습니다.",advertisingAnalysis:"기술적 특징, 해외 자료와 국내 요건은 별개입니다.",sources:[],uncertainty:"제품별 승인 정보 밖의 사실은 확인이 필요합니다.",followUpQuestion:"정확한 제품명을 알려주시겠어요?"})}}]}),{status:200})};
 try{for(const [index,question] of questions.entries()){const response=await publicHandler({httpMethod:"POST",headers:{"x-forwarded-for":`policy-question-${index}`},body:JSON.stringify({question,history:[]})});assert.equal(response.statusCode,200);assert.match(JSON.parse(response.body).coreAnswer,/직접 답/)}assert.equal(count,questions.length)}finally{globalThis.fetch=originalFetch}
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

test("standard and deep modes preserve the full question and safely expand the previous answer",async()=>{
 const {handler:publicHandler}=await import("../netlify/functions/ai-clean-care.mjs");const originalFetch=globalThis.fetch;
 const scenarios=[
  ["프로쉬가 세제에 식용색소를 쓴다고 알려져 있는데 이것이 사실인지 알고 싶고 왜 식용색소를 쓰는지 알고 싶습니다",/외부 브랜드|경쟁 제품/],
  ["BIOstar의 바실러스는 어떤 역할을 하나요?",/세정 성분은 표면의 때와 오염을 씻어내고/],
  ["폴란드 인증을 받았으면 한국에서도 사용할 수 있나요?",/대한민국의 인증·신고·승인·표시/]
 ];
 const requests=[];
 globalThis.fetch=async(_url,options)=>{const request=JSON.parse(options.body);requests.push(request);const deep=request.max_completion_tokens===1800;const answer={coreAnswer:deep?"첫 답변에서 부족했던 쟁점을 나누어 심층 분석합니다.":"승인 지식을 우선한 기본 답변입니다.",recommendedProductIds:[],recommendationReason:deep?"확인된 내용":"",usage:"",cautions:deep?"대한민국의 제품 분류별 요건을 확인합니다.":"",advertisingAnalysis:deep?"일반 원리와 제품 사실을 구분합니다.":"",sources:[],uncertainty:deep?"현재 자료만으로 단정할 수 없습니다.":"추가 확인이 필요합니다.",followUpQuestion:""};return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(answer)}}]}),{status:200})};
 try{
  for(const [index,[question,policy]] of scenarios.entries()){
   const standard=await publicHandler({httpMethod:"POST",headers:{"x-forwarded-for":`deep-scenario-${index}`},body:JSON.stringify({question,history:[],mode:"standard"})});const standardData=JSON.parse(standard.body);assert.equal(standard.statusCode,200);assert.equal(standardData.mode,"standard");assert.equal(standardData.searchedWeb,false);
   const originalAnswer=JSON.stringify(standardData);const deep=await publicHandler({httpMethod:"POST",headers:{"x-forwarded-for":`deep-scenario-${index}`},body:JSON.stringify({originalQuestion:question,originalAnswer,history:[{role:"user",content:question},{role:"assistant",content:originalAnswer}],mode:"deep"})});const deepData=JSON.parse(deep.body);assert.equal(deep.statusCode,200);assert.equal(deepData.mode,"deep");assert.equal(deepData.searchedWeb,false);assert.match(deepData.coreAnswer,/심층 분석/);
   const deepRequest=requests.at(-1);assert.equal(deepRequest.max_completion_tokens,1800);assert.match(deepRequest.messages[0].content,/도구가 제공되지 않은 호출/);assert.match(deepRequest.messages[0].content,policy);assert.ok(deepRequest.messages.at(-1).content.includes(question));assert.ok(deepRequest.messages.some(message=>message.content.includes(originalAnswer)));
  }
 }finally{globalThis.fetch=originalFetch}
});

test("deep mode validates its context and does not expose an unimplemented research mode",async()=>{
 const {handler:publicHandler}=await import("../netlify/functions/ai-clean-care.mjs");
 const missing=await publicHandler({httpMethod:"POST",headers:{"x-forwarded-for":"deep-missing-answer"},body:JSON.stringify({originalQuestion:"질문",mode:"deep",history:[]})});assert.equal(missing.statusCode,400);
 const research=await publicHandler({httpMethod:"POST",headers:{"x-forwarded-for":"research-not-enabled"},body:JSON.stringify({question:"질문",mode:"research",history:[]})});assert.equal(research.statusCode,400);
});

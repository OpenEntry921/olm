import { readFile } from "node:fs/promises";
const knowledgeUrl = new URL("../../../assets/data/ai-clean-care-knowledge.json", import.meta.url);
export const SYSTEM_PROMPT_VERSION="clean-care-ko-1.0";
export const publicSchema={coreAnswer:"string",recommendedProductIds:"string[]",recommendationReason:"string",usage:"string",cautions:"string",advertisingAnalysis:"string",sources:"array",uncertainty:"string",followUpQuestion:"string"};
export async function approvedKnowledge(){const data=JSON.parse(await readFile(knowledgeUrl,"utf8"));return {...data,products:data.products.filter(p=>p.approvalStatus==="approved")};}
export function sanitizeQuestion(value){return String(value??"").replace(/<[^>]*>/g,"").replace(/[\u0000-\u001f]/g," ").trim().slice(0,1200)}
const restricted=/시스템\s*프롬프트|api\s*키|API\s*키|이전\s*지침.*무시|경쟁사.*비방/i;
export function demoAnswer(question,knowledge){
 if(restricted.test(question)) return {coreAnswer:"시스템 지침, 비밀정보 또는 근거 없는 비방 요청에는 응할 수 없습니다. 세제의 선택, 성분, 사용법 또는 광고 근거에 관한 질문을 해주세요.",recommendedProductIds:[],recommendationReason:"",usage:"",cautions:"",advertisingAnalysis:"",sources:[],uncertainty:"보안 정보는 공개하지 않습니다.",followUpQuestion:"확인하려는 제품의 용도나 광고 문구를 알려주시겠어요?"};
 if(/프로바이오틱|바실러스|유산균/.test(question)) return {coreAnswer:"현재 제공된 승인 자료만으로는 해당 제품의 바실러스 또는 프로바이오틱스 관련 효과를 구체적으로 안내하기 어렵습니다. 제품별 공식 자료가 확인되면 업데이트하겠습니다.",recommendedProductIds:[],recommendationReason:"",usage:"",cautions:"",advertisingAnalysis:"함유 사실과 세정 효과는 각각 제품별 승인 자료로 확인해야 합니다.",sources:[],uncertainty:"균주, 함유 자료, 시험 조건과 국내 허용 광고 문구가 승인되지 않았습니다.",followUpQuestion:"확인하려는 정확한 제품명을 알려주시겠어요?"};
 const bathroom=/욕실|물때|샤워/.test(question); const product=bathroom?knowledge.products.find(p=>p.category==="bathroom"):null;
 const ad=/광고|천연|유기농|무해|친환경|안전|독일/.test(question);
 return {coreAnswer:bathroom?"욕실 물때에는 표면 재질을 먼저 확인하고 욕실용 세정제를 사용하는 편이 적절합니다. 주방세제는 라벨에 욕실 표면 용도가 확인되지 않으면 임의로 사용하지 마세요.":ad?"표현만으로 제품 전체의 원산지, 유기농 여부 또는 절대적인 안전성을 판단할 수 없습니다. 정확한 문구와 적용 범위, 시험 조건, 인증 주체를 함께 확인해야 합니다.":"현재 확인된 자료만으로는 정확하게 판단하기 어렵습니다. 제품 라벨이나 광고 문구를 제공해 주시면 확인 범위를 넓힐 수 있습니다.",recommendedProductIds:product?[product.id]:[],recommendationReason:product?"질문한 사용 공간과 승인된 제품 용도가 욕실로 일치합니다. 표면별 사용 제한은 반드시 함께 확인해야 합니다.":"",usage:product?.usage??"",cautions:product?.cautions??"서로 다른 세정제를 혼합하지 말고 제품 라벨의 용도와 응급조치를 우선하세요.",advertisingAnalysis:ad?"판정: 근거 확인 필요. ‘천연 유래’, ‘유기농’, ‘친환경’, ‘무해’는 서로 다른 주장입니다. 제조사 자료, 라벨, 인증 범위와 공공기관 정보를 동일 기준으로 확인해야 합니다.":"",sources:product?product.sources:[],uncertainty:ad?"정확한 제품명, 광고 원문, 라벨 또는 링크가 없어 최신 주장과 근거는 확인하지 못했습니다.":"",followUpQuestion:ad?"정확한 광고 문구나 라벨 사진, 링크를 제공해 주시겠어요?":"사용할 표면 재질과 오염 종류를 알려주시겠어요?"};
}
export function attachProducts(result,knowledge){return {...result,recommendedProducts:(result.recommendedProductIds||[]).map(id=>knowledge.products.find(p=>p.id===id)).filter(Boolean).map(p=>({id:p.id,brand:p.brand,name:p.name,image:p.image,purpose:p.purpose,url:p.url}))};}
export function validateAnswer(value){if(!value||typeof value.coreAnswer!=="string"||!Array.isArray(value.recommendedProductIds)||!Array.isArray(value.sources))throw new Error("INVALID_AI_SCHEMA");return value;}

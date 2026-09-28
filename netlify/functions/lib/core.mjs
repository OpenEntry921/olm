import knowledgeData from "../../../assets/data/ai-clean-care-knowledge.json" with { type: "json" };
export const SYSTEM_PROMPT_VERSION="clean-care-ko-1.1";
export const CLEAN_CARE_SYSTEM_PROMPT=`당신은 OLM AI Clean Care 제품 안내 도우미입니다.

[근거와 제품 안내]
- OLM, BIOstar, Ludwik에 관한 사실은 제공된 승인 지식을 최우선이자 유일한 제품 사실 근거로 사용하세요. 관련 승인 제품이 있을 때만 자연스럽게 먼저 설명하고, 관련 없는 제품을 억지로 추천하지 마세요.
- 승인 지식에 없는 성분, 효능, 균주·종, 시험 결과, 인증, 안전성 또는 환경성을 일반 지식으로 보충하거나 제품 사실처럼 말하지 마세요. 살균·소독·항균, 병원균 제거, 지속 세정, 절대적 안전성도 근거 없이 주장하지 마세요.
- 모르는 사항은 모른다고 명확히 밝히고, 확인할 라벨·공식 자료 또는 담당 기관을 안내하세요. 경쟁 제품을 근거 없이 평가하거나 비방하지 마세요.

[답변 방식]
- 먼저 질문에 직접 답한 뒤, 이해와 행동에 필요한 제품·원리, 사용 시 확인사항, 관련되는 경우 국내 규제 주의사항을 구체적으로 설명하세요. 모든 답변을 같은 서식에 끼워 맞추지는 말되, 설명이 필요한 성분·미생물·친환경·인증·안전성 질문을 한두 문장으로 지나치게 줄이지 마세요.
- 각 JSON 필드를 중복 문장으로 채우지 말고, coreAnswer에는 직접 답과 핵심 맥락을 충분히 담으세요. usage와 cautions는 승인 지식 또는 일반적인 확인 절차의 범위에서 실용적으로 작성하세요.

[미생물과 환경 표현]
- '유기농', '천연', '자연', '친환경', '무화학'과 '바실러스/미생물을 활용함'은 서로 다른 개념이라고 설명하세요. 미생물을 사용했다는 이유만으로 100% 천연, 유기농, 무화학, 친환경 인증, 인체 무해 또는 더 안전하다고 결론 내리지 마세요.
- 승인 지식에 관련 근거가 있을 때에는 다음 역할을 구분해 설명할 수 있습니다: 세정 성분은 표면의 때와 오염을 씻어내고, 미생물은 제조사 설명에 따라 남은 유기물의 분해를 돕습니다. 이는 서로 다른 역할입니다. 바실러스는 다양한 환경에서 발견되는 미생물의 한 종류라고 설명할 수 있습니다.
- 정확한 제품의 미생물 함유 여부와 균주·종은 승인 지식에 있을 때만 말하세요. 바실러스를 인체 유익균이라고 부르거나 유해균 제거, 살균, 소독, 항균, 수일간 지속 세정, 어린이·반려동물 안전을 주장하지 마세요.

[해외 자료와 대한민국 요건]
- A) 기술적·성분적 특징, B) 제조사의 해외 인증·시험자료, C) 대한민국의 인증·신고·승인·표시는 별개입니다. A가 B나 C를, B가 C를 자동으로 성립시키지 않는다고 설명하세요.
- 독일·폴란드·EU 등 해외 인증이나 시험자료는 참고자료가 될 수 있지만 그 자체를 대한민국 인증 또는 국내 법적 적합성으로 표현하지 마세요.
- 국내 판매·유통·사용 가능 여부는 제품의 정확한 국내 법적 분류와 최신 적용 법령에 따른 신고·승인·인증·표시 요건을 우선 확인하도록 안내하세요. 다만 모든 생활용품에 국내 인증이 필요하다거나, 국내 인증이 없으면 불법·판매 또는 사용 불가라고 일괄 단정하지 마세요. '법적으로 요구되는 경우 해당 요건 충족 여부를 확인해야 한다'고 조건부로 설명하고 최종 법률 판단을 내리지 마세요.`;
export const publicSchema={coreAnswer:"string",recommendedProductIds:"string[]",recommendationReason:"string",usage:"string",cautions:"string",advertisingAnalysis:"string",sources:"array",uncertainty:"string",followUpQuestion:"string"};
export async function approvedKnowledge(){const data=structuredClone(knowledgeData);return {...data,manufacturerPrinciples:(data.manufacturerPrinciples||[]).filter(item=>item.approvalStatus==="approved"),products:data.products.filter(p=>p.approvalStatus==="approved")};}
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

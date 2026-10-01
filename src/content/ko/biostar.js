/** Korean BIOstar brand settings. Product facts come only from the approved AI Clean Care knowledge file. */
import knowledgeData from "../../../assets/data/ai-clean-care-knowledge.json" with { type: "json" };

export const biostarBrand = {
  name: "BIOstar",
  // TODO: 공식 BIOstar 로고 업로드 후 교체
  logo: { path: null, alt: "BIOstar", width: null, height: null },
  officialPurchaseUrl: null,
  purchaseFallbackUrl: "https://smartstore.naver.com/olmmall"
};

export const biostarProducts = knowledgeData.products
  .filter(product => product.brand === biostarBrand.name && product.approvalStatus === "approved")
  .map(product => ({
    ...product,
    id: product.id.replace(/^biostar-/, ""),
    name: product.name.replace(/^BIOstar\s+/, ""),
    space: product.useSpace,
    use: product.purpose,
    width: product.imageWidth,
    height: product.imageHeight,
    alt: product.imageAlt,
    purchaseUrl: product.seller?.url || null
  }));

/** The website and AI API consume these same approved records. */
export const biostarProductGuideData = knowledgeData.products.filter(product => product.brand === biostarBrand.name && product.approvalStatus === "approved");

const categories = [
  { id: "kitchen", label: "주방" }, { id: "dishwasher", label: "식기세척기" },
  { id: "bathroom", label: "욕실" }, { id: "toilet", label: "변기" },
  { id: "glass", label: "유리·거울" }, { id: "multipurpose", label: "다목적" },
  { id: "laundry", label: "세탁" }
].filter(category => biostarProducts.some(product => product.category === category.id));

const guideItems = [
  ["space", "공간별 세정 제품", "주방과 욕실 등 사용하는 공간에 맞춰 제품을 살펴볼 수 있습니다."],
  ["purpose", "용도에 맞춘 제품 구성", "주방세제부터 욕실·다목적 세정제까지 용도에 따라 확인할 수 있습니다."],
  ["info", "확인 가능한 제품 정보", "제품별 용도와 용량, 표시된 성분과 사용 정보를 안내합니다."],
  ["label", "제품별 사용 안내", "제품 라벨에 표시된 사용 방법과 주의사항을 확인한 후 사용하세요."]
];

const guideIcon = type => {
  const paths = {
    space: '<path d="M4 10.5 12 4l8 6.5V20H4Z"/><path d="M9 20v-6h6v6"/>',
    purpose: '<path d="M5 20V9h14v11Z"/><path d="M8 9V6h8v3M8 14h8M8 17h5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    label: '<path d="M6 3h9l3 3v15H6Z"/><path d="M15 3v4h4M9 12h6M9 16h6"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[type]}</svg>`;
};

const productImage = (product, { decorative = false, eager = false } = {}) => `<img class="biostar-product-image" src="${product.image}" width="${product.width}" height="${product.height}" alt="${decorative ? "" : product.alt}" loading="${eager ? "eager" : "lazy"}" decoding="async">`;
const productCard = product => `<article class="biostar-product reveal-step" data-product-id="${product.id}"><div class="biostar-product-visual">${productImage(product)}</div><div class="biostar-product-copy"><h3>${product.name}</h3>${product.nameOriginal ? `<p class="biostar-product-subtitle">${product.nameOriginal}</p>` : ""}<p class="biostar-product-volume">${product.volume}</p><dl><div><dt>사용 공간</dt><dd>${product.space}</dd></div><div><dt>제품 용도</dt><dd>${product.use}</dd></div></dl><a class="biostar-product-link" href="/products/biostar/${product.id}/">제품 정보 보기 <span aria-hidden="true">→</span></a></div></article>`;
const productDetail = (product, purchaseUrl) => `<article class="biostar-detail-item reveal" id="detail-${product.id}"><header><p>${product.space}</p><h3>${product.name}</h3><strong>${product.volume}</strong></header><dl><div><dt>용도</dt><dd>${product.use}</dd></div><div><dt>제품 특징</dt><dd>${product.allowedClaims.join(" · ")}</dd></div><div><dt>사용 방법</dt><dd>${product.usage}</dd></div><div><dt>주의사항</dt><dd>${product.cautions}</dd></div><div><dt>성분 정보</dt><dd>${product.ingredients.length ? product.ingredients.join(", ") : product.ingredientsNote}</dd></div><div><dt>인증</dt><dd>${product.certifications.length ? product.certifications.join(", ") : "제품별 공개 자료에서 확인된 인증 정보 없음"}</dd></div><div><dt>정보 확인일</dt><dd>${product.sources[0].checkedAt.replaceAll("-", ".")}</dd></div></dl><a href="${product.purchaseUrl || purchaseUrl}" target="_blank" rel="noopener noreferrer">판매처 정보 문의하기 <span aria-hidden="true">→</span></a></article>`;

/** Standalone placeholder that can receive biostarProductGuideData when the approved API is connected. */
const renderAiProductGuide = () => `<section class="section biostar-ai-guide reveal" aria-labelledby="biostar-ai-title"><div class="container biostar-ai-layout"><div><span class="eyebrow">PRODUCT GUIDE</span><h2 class="title" id="biostar-ai-title">어떤 제품이 필요한지 쉽게 찾아보세요</h2><p>사용할 공간과 목적에 맞는 BIOstar 제품 정보를 안내하는 AI 제품 가이드를 준비하고 있습니다.</p><strong>AI 제품 가이드 준비 중</strong></div><nav aria-label="BIOstar 제품 안내"><a class="btn btn-light" href="#biostar-products-title">제품 목록 보기</a><a class="btn btn-light" href="/ai-clean-care/">제품 문의하기</a></nav></div><!-- FUTURE API: 승인된 biostarProductGuideData를 이 독립 영역에 연결합니다. --></section>`;

export const biostarContentKo = () => {
  const logo = biostarBrand.logo.path
    ? `<img class="brand-wordmark" src="${biostarBrand.logo.path}" width="${biostarBrand.logo.width}" height="${biostarBrand.logo.height}" alt="${biostarBrand.logo.alt}">`
    : `<span class="eyebrow">BIOSTAR · POLAND</span>`;
  const purchaseUrl = biostarBrand.officialPurchaseUrl || biostarBrand.purchaseFallbackUrl;
  const purchaseNote = biostarBrand.officialPurchaseUrl ? "공식 판매처로 이동합니다." : "공식 판매처 정보를 준비하고 있습니다. 문의 페이지에서 제품 정보를 확인해 주세요.";
  const heroProducts = biostarProducts.slice(0, 3);

  return `<section class="biostar-page-hero"><div class="container"><div class="breadcrumb"><a href="/">홈</a> / <a href="/brands/">브랜드</a> / BIOstar</div><div class="biostar-hero-grid"><div class="biostar-hero-copy">${logo}<span class="eyebrow">POLISH HOMECARE</span><h1 class="display">일상 공간에 맞춘<br>폴란드 홈케어 브랜드</h1><p class="lead">BIOstar는 폴란드 INCO 그룹이 선보이는 홈케어 브랜드입니다. 주방과 욕실 등 생활공간에 맞춘 다양한 세정 제품을 소개합니다.</p></div><div class="biostar-hero-products" aria-hidden="true">${heroProducts.map(product => productImage(product, { decorative: true, eager: true })).join("")}</div></div></div></section>
  <section class="section biostar-principles"><div class="container"><span class="eyebrow">BIOSTAR ESSENTIALS</span><h2 class="title">공간과 제품에 맞춘<br>홈케어 기준</h2><p class="section-lead">BIOstar의 제품 구성과 제품별 용도, 표시 정보를 차례로 확인해 보세요.</p></div></section>
  <section class="section biostar-story" aria-labelledby="biostar-story-title"><div class="container"><div class="biostar-story-intro reveal"><div class="biostar-story-copy"><span class="eyebrow">BIOSTAR STORY</span><h2 class="title" id="biostar-story-title">청소가 끝난 뒤에도,<br>남은 유기물 분해를 돕는 미생물</h2><p class="lead">BIOstar는 세정 성분과 함께 미생물을 활용하는 제품을 선보입니다. 세정 성분이 표면의 오염을 씻어내는 역할을 하고, 제품에 포함된 미생물은 제조사 설명에 따라 표면에 남은 유기물의 분해를 돕는 방식으로 작용합니다.</p><p>눈에 보이는 오염을 닦아내는 세정 과정과 미생물이 유기물의 분해를 돕는 과정은 서로 다른 역할입니다.</p><p class="biostar-story-note">바실러스(Bacillus)는 다양한 환경에서 발견되는 미생물의 한 종류입니다. BIOstar에서는 이러한 미생물을 활용한 청소 원리를 제품 설명에 적용하고 있습니다.</p></div><div class="biostar-story-video"><video controls playsinline preload="metadata" aria-label="BIOstar 세정 성분과 미생물 기반 청소 원리 설명 영상"><source src="/assets/biostar/videos/bacillus-beneficial-bacteria.mp4" type="video/mp4">영상을 재생할 수 없는 브라우저입니다. 페이지의 텍스트와 원리 설명 이미지에서 같은 내용을 확인할 수 있습니다.</video></div></div><div class="biostar-story-explainer reveal"><div class="biostar-story-explainer-copy"><h3>세정과 미생물, 서로 다른 역할</h3><p>청소할 때 세정 성분은 표면의 때와 오염을 씻어내는 역할을 합니다. BIOstar의 미생물 기반 제품은 여기에 또 하나의 작용 원리를 더합니다.</p><p>제조사 설명에 따르면 제품에 포함된 미생물은 표면에 남은 유기물의 분해를 돕는 효소를 만들어 작용합니다.</p><p>즉, 세정 성분이 오염을 씻어내는 과정과 미생물이 남은 유기물의 분해를 돕는 과정이 서로 다른 역할을 하는 방식입니다.</p></div><figure class="biostar-story-image"><img src="/assets/biostar/images/bacillus-beneficial-bacteria.png" width="1024" height="1536" alt="BIOstar 세정 성분과 미생물이 청소 과정에서 서로 다른 역할을 하는 원리 설명" loading="lazy" decoding="async"></figure></div><footer class="biostar-story-disclaimer"><p>제조사 설명에 따른 작용 원리를 이해하기 쉽게 설명한 내용입니다. 실제 작용은 제품과 사용 환경에 따라 달라질 수 있으며, 살균·소독 효과를 의미하지 않습니다.</p><p>자료: BIOstar 공식 제품·원료 설명</p></footer></div></section>
  <section class="section biostar-guide reveal" aria-labelledby="biostar-guide-title"><div class="container"><header class="biostar-guide-heading"><span class="eyebrow">PRODUCT INFORMATION</span><h2 class="title" id="biostar-guide-title">BIOstar 제품을 살펴보세요</h2><p class="lead">사용하는 공간과 목적에 맞는 제품을 찾고, 제품별 용도와 사용 정보를 확인해 보세요.</p></header><div class="biostar-guide-grid">${guideItems.map(([type, title, copy]) => `<article class="biostar-guide-item reveal-step">${guideIcon(type)}<h3>${title}</h3><p>${copy}</p></article>`).join("")}</div></div></section>
  <section class="biostar-catalogue" aria-labelledby="biostar-products-title"><div class="container"><span class="eyebrow">HOMECARE RANGE</span><h2 class="title" id="biostar-products-title">사용 공간별 제품</h2><nav class="biostar-category-nav" aria-label="사용 공간별 제품 카테고리">${categories.map(category => `<a href="#category-${category.id}">${category.label}</a>`).join("")}</nav>${categories.map(category => `<section class="biostar-category reveal" id="category-${category.id}" aria-labelledby="category-title-${category.id}"><div class="biostar-category-heading"><span>USE AREA</span><h3 id="category-title-${category.id}">${category.label}</h3></div><div class="biostar-category-products">${biostarProducts.filter(product => product.category === category.id).map(productCard).join("")}</div></section>`).join("")}</div></section>
  <section class="section biostar-details" aria-labelledby="biostar-details-title"><div class="container"><span class="eyebrow">PRODUCT DETAILS</span><h2 class="title" id="biostar-details-title">제품별 상세 정보</h2><p class="section-lead">사용 전 제품 라벨의 최신 표시사항을 함께 확인해 주세요.</p><div class="biostar-detail-list">${biostarProducts.map(product => productDetail(product, purchaseUrl)).join("")}</div></div></section>
  ${renderAiProductGuide()}
  <section class="section biostar-cta"><div class="container"><div><span class="eyebrow">OFFICIAL RETAILER</span><h2 class="title">BIOstar 제품 판매처가 궁금하신가요?</h2><p>${purchaseNote}</p></div><a class="btn biostar-cta-button" href="${biostarBrand.officialPurchaseUrl ? purchaseUrl : "/ai-clean-care/"}"${biostarBrand.officialPurchaseUrl ? ' target="_blank" rel="noopener noreferrer"' : ""}>${biostarBrand.officialPurchaseUrl ? "공식 판매처 보기" : "제품 문의하기"}</a></div></section>`;
};

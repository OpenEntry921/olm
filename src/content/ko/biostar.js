/** Korean BIOstar brand settings and reviewed product catalogue. */
export const biostarBrand = {
  name: "BIOstar",
  // TODO: 공식 BIOstar 로고 업로드 후 교체
  logo: { path: null, alt: "BIOstar", width: null, height: null },
  officialPurchaseUrl: null,
  purchaseFallbackUrl: "/contact/?type=consumer"
};

const productImagePath = fileName => `/docs/source-images/${fileName}`;

export const biostarProducts = [
  { id: "dishwashing-liquid", name: "주방세제", volume: "700ml", category: "kitchen", space: "주방", use: "식기·조리도구 세척", description: "손설거지할 때 식기와 조리도구를 세척하는 주방세제입니다.", image: productImagePath("biostar-dishwashing-liquid-700ml.png"), width: 854, height: 2143, alt: "BIOstar 주방세제 700ml 용기", ingredients: null, certifications: [], purchaseUrl: null },
  { id: "kitchen-cleaner", name: "주방 세정 폼", volume: "700ml", category: "kitchen", space: "주방", use: "주방 표면", description: "주방의 세척 가능한 표면을 용도에 맞게 관리하는 세정 폼입니다.", image: productImagePath("biostar-kitchen-cleaner-700ml.png"), width: 854, height: 2270, alt: "BIOstar 주방 세정 폼 700ml 스프레이 용기", ingredients: null, certifications: [], purchaseUrl: null },
  { id: "dishwasher-tablets", name: "식기세척기 세제", volume: "50개입", category: "dishwasher", space: "식기세척기", use: "식기세척기용", description: "식기세척기에 한 개씩 넣어 사용하는 정제형 세제입니다.", image: productImagePath("biostar-dishwasher-tablets-50pcs.png"), width: 2000, height: 2000, alt: "BIOstar 식기세척기 세제 50개입 패키지", ingredients: null, certifications: [], purchaseUrl: null },
  { id: "bathroom-cleaner", name: "욕실 세정 폼", volume: "700ml", category: "bathroom", space: "욕실", use: "욕실 타일·세면대·욕조", description: "욕실의 세척 가능한 표면을 관리하는 세정 폼입니다.", image: productImagePath("biostar-bathroom-cleaner-700ml.png"), width: 854, height: 2270, alt: "BIOstar 욕실 세정 폼 700ml 스프레이 용기", ingredients: null, certifications: [], purchaseUrl: null },
  { id: "shower-cabin-cleaner", name: "샤워부스 세정제", volume: "700ml", category: "bathroom", space: "욕실", use: "샤워부스", description: "샤워부스의 세척 가능한 표면을 관리하는 전용 세정제입니다.", image: productImagePath("biostar-shower-cabin-cleaner-700ml.png"), width: 854, height: 2270, alt: "BIOstar 샤워부스 세정제 700ml 스프레이 용기", ingredients: null, certifications: [], purchaseUrl: null },
  { id: "toilet-gel", name: "변기 세정 젤", volume: "750ml", category: "toilet", space: "변기", use: "변기 내부", description: "변기 내부를 용도에 맞게 세정하는 젤 타입 제품입니다.", image: productImagePath("biostar-toilet-gel-750ml.png"), width: 814, height: 2208, alt: "BIOstar 변기 세정 젤 750ml 용기", ingredients: null, certifications: [], purchaseUrl: null },
  { id: "glass-mirror-cleaner", name: "유리·거울 세정제", volume: "700ml", category: "glass", space: "유리·거울", use: "유리·거울", description: "유리와 거울 등 세척 가능한 표면을 관리하는 세정제입니다.", image: productImagePath("biostar-glass-and-mirror-cleaner-700ml.png"), width: 1006, height: 2354, alt: "BIOstar 유리·거울 세정제 700ml 스프레이 용기", ingredients: null, certifications: [], purchaseUrl: null },
  { id: "universal-cleaner", name: "다목적 세정제", volume: "800ml", category: "multipurpose", space: "생활 공간", use: "다목적 표면", description: "생활 공간의 다양한 세척 가능한 표면에 사용하는 다목적 세정제입니다.", image: productImagePath("biostar-universal-cleaner-800ml.png"), width: 830, height: 2216, alt: "BIOstar 다목적 세정제 800ml 용기", ingredients: null, certifications: [], purchaseUrl: null }
];

/** Reviewed records for the future guide API. Null means no verified label data is published. */
export const biostarProductGuideData = biostarProducts.map(product => ({
  id: `biostar-${product.id}`, brand: biostarBrand.name, nameKo: product.name, nameOriginal: null,
  category: product.category, volume: product.volume, image: product.image,
  approvedDescription: product.description, usage: product.use, cautions: null,
  ingredients: product.ingredients, retailerUrl: product.purchaseUrl, regulatoryCategory: null,
  allowedClaims: [product.description], restrictedClaims: ["확인되지 않은 성분·효능·안전성 표현"],
  source: "제품 패키지 및 제공된 브랜드 자료", lastReviewedAt: "2026-09-26"
}));

const categories = [
  { id: "kitchen", label: "주방" }, { id: "dishwasher", label: "식기세척기" },
  { id: "bathroom", label: "욕실" }, { id: "toilet", label: "변기" },
  { id: "glass", label: "유리·거울" }, { id: "multipurpose", label: "다목적" }
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
const productCard = product => `<article class="biostar-product reveal-step" data-product-id="${product.id}"><div class="biostar-product-visual">${productImage(product)}</div><div class="biostar-product-copy"><h3>${product.name}</h3><p class="biostar-product-volume">${product.volume}</p><dl><div><dt>사용 공간</dt><dd>${product.space}</dd></div><div><dt>제품 용도</dt><dd>${product.use}</dd></div></dl><a class="biostar-product-link" href="#detail-${product.id}">제품 정보 보기 <span aria-hidden="true">→</span></a></div></article>`;
const productDetail = (product, purchaseUrl) => `<article class="biostar-detail-item reveal" id="detail-${product.id}"><header><p>${product.space}</p><h3>${product.name}</h3><strong>${product.volume}</strong></header><dl><div><dt>용도</dt><dd>${product.use}</dd></div><div><dt>사용 방법</dt><dd>제품 라벨에 표시된 권장량에 맞춰 사용하세요.</dd></div><div><dt>주의사항</dt><dd>제품 라벨에 표시된 주의사항을 확인한 후 사용하세요.</dd></div><div><dt>성분 정보</dt><dd>제품 라벨에 표시된 성분 정보를 확인할 수 있습니다.</dd></div><div><dt>정보 확인일</dt><dd>2026년 9월 26일</dd></div></dl><a href="${product.purchaseUrl || purchaseUrl}">판매처 정보 문의하기 <span aria-hidden="true">→</span></a></article>`;

/** Standalone placeholder that can receive biostarProductGuideData when the approved API is connected. */
const renderAiProductGuide = () => `<section class="section biostar-ai-guide reveal" aria-labelledby="biostar-ai-title"><div class="container biostar-ai-layout"><div><span class="eyebrow">PRODUCT GUIDE</span><h2 class="title" id="biostar-ai-title">어떤 제품이 필요한지 쉽게 찾아보세요</h2><p>사용할 공간과 목적에 맞는 BIOstar 제품 정보를 안내하는 AI 제품 가이드를 준비하고 있습니다.</p><strong>AI 제품 가이드 준비 중</strong></div><nav aria-label="BIOstar 제품 안내"><a class="btn btn-light" href="#biostar-products-title">제품 목록 보기</a><a class="btn btn-light" href="/contact/?type=consumer">제품 문의하기</a></nav></div><!-- FUTURE API: 승인된 biostarProductGuideData를 이 독립 영역에 연결합니다. --></section>`;

export const biostarContentKo = () => {
  const logo = biostarBrand.logo.path
    ? `<img class="brand-wordmark" src="${biostarBrand.logo.path}" width="${biostarBrand.logo.width}" height="${biostarBrand.logo.height}" alt="${biostarBrand.logo.alt}">`
    : `<span class="eyebrow">BIOSTAR · POLAND</span>`;
  const purchaseUrl = biostarBrand.officialPurchaseUrl || biostarBrand.purchaseFallbackUrl;
  const purchaseNote = biostarBrand.officialPurchaseUrl ? "공식 판매처로 이동합니다." : "공식 판매처 정보를 준비하고 있습니다. 문의 페이지에서 제품 정보를 확인해 주세요.";
  const heroProducts = biostarProducts.slice(0, 3);

  return `<section class="biostar-page-hero"><div class="container"><div class="breadcrumb"><a href="/">홈</a> / <a href="/brands/">브랜드</a> / BIOstar</div><div class="biostar-hero-grid"><div class="biostar-hero-copy">${logo}<span class="eyebrow">POLISH HOMECARE</span><h1 class="display">일상의 공간에 맞춘<br>폴란드 홈케어 브랜드</h1><p class="lead">BIOstar는 폴란드 INCO 그룹이 선보이는 홈케어 브랜드입니다. 주방과 욕실 등 생활공간에 맞춘 다양한 세정 제품을 소개합니다.</p></div><div class="biostar-hero-products" aria-hidden="true">${heroProducts.map(product => productImage(product, { decorative: true, eager: true })).join("")}</div></div></div></section>
  <section class="section biostar-principles"><div class="container"><span class="eyebrow">BIOSTAR ESSENTIALS</span><h2 class="title">공간과 제품에 맞춘<br>홈케어의 기준</h2><p class="section-lead">BIOstar의 제품 구성과 제품별 용도, 표시 정보를 차례로 확인해 보세요.</p></div></section>
  <section class="section biostar-guide reveal" aria-labelledby="biostar-guide-title"><div class="container"><header class="biostar-guide-heading"><span class="eyebrow">PRODUCT INFORMATION</span><h2 class="title" id="biostar-guide-title">BIOstar 제품을 살펴보세요</h2><p class="lead">사용하는 공간과 목적에 맞는 제품을 찾고, 제품별 용도와 사용 정보를 확인해 보세요.</p></header><div class="biostar-guide-grid">${guideItems.map(([type, title, copy]) => `<article class="biostar-guide-item reveal-step">${guideIcon(type)}<h3>${title}</h3><p>${copy}</p></article>`).join("")}</div></div></section>
  <section class="biostar-catalogue" aria-labelledby="biostar-products-title"><div class="container"><span class="eyebrow">HOMECARE RANGE</span><h2 class="title" id="biostar-products-title">사용 공간별 제품</h2><nav class="biostar-category-nav" aria-label="사용 공간별 제품 카테고리">${categories.map(category => `<a href="#category-${category.id}">${category.label}</a>`).join("")}</nav>${categories.map(category => `<section class="biostar-category reveal" id="category-${category.id}" aria-labelledby="category-title-${category.id}"><div class="biostar-category-heading"><span>USE AREA</span><h3 id="category-title-${category.id}">${category.label}</h3></div><div class="biostar-category-products">${biostarProducts.filter(product => product.category === category.id).map(productCard).join("")}</div></section>`).join("")}</div></section>
  <section class="section biostar-details" aria-labelledby="biostar-details-title"><div class="container"><span class="eyebrow">PRODUCT DETAILS</span><h2 class="title" id="biostar-details-title">제품별 상세 정보</h2><p class="section-lead">사용 전 제품 라벨의 최신 표시사항을 함께 확인해 주세요.</p><div class="biostar-detail-list">${biostarProducts.map(product => productDetail(product, purchaseUrl)).join("")}</div></div></section>
  ${renderAiProductGuide()}
  <section class="section biostar-cta"><div class="container"><div><span class="eyebrow">OFFICIAL RETAILER</span><h2 class="title">BIOstar 제품 판매처가 궁금하신가요?</h2><p>${purchaseNote}</p></div><a class="btn biostar-cta-button" href="${purchaseUrl}">${biostarBrand.officialPurchaseUrl ? "공식 판매처 보기" : "제품 문의하기"}</a></div></section>`;
};

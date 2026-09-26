/** Korean BIOstar brand settings and product catalogue. */
export const biostarBrand = {
  name: "BIOstar",
  // TODO: 공식 BIOstar 로고 업로드 후 교체
  logo: { path: null, alt: "BIOstar", width: null, height: null },
  officialPurchaseUrl: null,
  purchaseFallbackUrl: "/contact/?type=consumer"
};

const productImagePath = fileName => `/docs/source-images/${fileName}`;

export const biostarProducts = [
  { id: "dishwashing-liquid", name: "주방세제", volume: "700ml", category: "kitchen", use: "식기 세척", description: "손설거지할 때 식기와 조리도구를 세척하는 주방세제입니다.", image: productImagePath("biostar-dishwashing-liquid-700ml.png"), width: 854, height: 2143, alt: "BIOstar 주방세제 700ml 용기", certifications: [], purchaseUrl: null },
  { id: "kitchen-cleaner", name: "주방 세정 폼", volume: "700ml", category: "kitchen", use: "주방 표면 관리", description: "주방의 세척 가능한 표면을 용도에 맞게 관리하는 세정 폼입니다.", image: productImagePath("biostar-kitchen-cleaner-700ml.png"), width: 854, height: 2270, alt: "BIOstar 주방 세정 폼 700ml 스프레이 용기", certifications: [], purchaseUrl: null },
  { id: "dishwasher-tablets", name: "식기세척기 세제", volume: "50개입", category: "kitchen", use: "식기세척기용", description: "식기세척기에 한 개씩 넣어 사용하는 정제형 세제입니다.", image: productImagePath("biostar-dishwasher-tablets-50pcs.png"), width: 2000, height: 2000, alt: "BIOstar 식기세척기 세제 50개입 패키지", certifications: [], purchaseUrl: null },
  { id: "bathroom-cleaner", name: "욕실 세정 폼", volume: "700ml", category: "bathroom", use: "욕실 표면 관리", description: "욕실의 세척 가능한 표면을 관리하는 세정 폼입니다.", image: productImagePath("biostar-bathroom-cleaner-700ml.png"), width: 854, height: 2270, alt: "BIOstar 욕실 세정 폼 700ml 스프레이 용기", certifications: [], purchaseUrl: null },
  { id: "shower-cabin-cleaner", name: "샤워부스 세정제", volume: "700ml", category: "bathroom", use: "샤워부스 관리", description: "샤워부스의 세척 가능한 표면을 관리하는 전용 세정제입니다.", image: productImagePath("biostar-shower-cabin-cleaner-700ml.png"), width: 854, height: 2270, alt: "BIOstar 샤워부스 세정제 700ml 스프레이 용기", certifications: [], purchaseUrl: null },
  { id: "toilet-gel", name: "변기 세정 젤", volume: "750ml", category: "bathroom", use: "변기 내부 세정", description: "변기 내부를 용도에 맞게 세정하는 젤 타입 제품입니다.", image: productImagePath("biostar-toilet-gel-750ml.png"), width: 814, height: 2208, alt: "BIOstar 변기 세정 젤 750ml 용기", certifications: [], purchaseUrl: null },
  { id: "glass-mirror-cleaner", name: "유리·거울 세정제", volume: "700ml", category: "living", use: "유리·거울 관리", description: "유리와 거울 등 세척 가능한 표면을 관리하는 세정제입니다.", image: productImagePath("biostar-glass-and-mirror-cleaner-700ml.png"), width: 1006, height: 2354, alt: "BIOstar 유리·거울 세정제 700ml 스프레이 용기", certifications: [], purchaseUrl: null },
  { id: "universal-cleaner", name: "다목적 세정제", volume: "800ml", category: "living", use: "생활 공간 표면 관리", description: "생활 공간의 다양한 세척 가능한 표면에 사용하는 다목적 세정제입니다.", image: productImagePath("biostar-universal-cleaner-800ml.png"), width: 830, height: 2216, alt: "BIOstar 다목적 세정제 800ml 용기", certifications: [], purchaseUrl: null }
];

/** Reviewed product records reserved for a future product-guide API. Not all fields are rendered. */
export const biostarProductGuideData = biostarProducts.map(product => ({
  id: `biostar-${product.id}`,
  brand: biostarBrand.name,
  nameKo: product.name,
  nameOriginal: null,
  category: product.category,
  volume: product.volume,
  image: product.image,
  approvedDescription: product.description,
  usage: product.use,
  cautions: null,
  retailerUrl: product.purchaseUrl,
  regulatoryCategory: null,
  allowedClaims: [product.description],
  restrictedClaims: ["확인되지 않은 성분·효능·안전성 표현"],
  source: "제품 패키지 및 제공된 브랜드 자료",
  lastReviewedAt: "2026-09-26"
}));

const categories = [
  { id: "kitchen", eyebrow: "KITCHEN CARE", title: "주방 관리" },
  { id: "bathroom", eyebrow: "BATHROOM CARE", title: "욕실 관리" },
  { id: "living", eyebrow: "LIVING CARE", title: "생활 공간 관리" }
];

const productImage = (product, { decorative = false, eager = false } = {}) => `<img class="biostar-product-image" src="${product.image}" width="${product.width}" height="${product.height}" alt="${decorative ? "" : product.alt}" loading="${eager ? "eager" : "lazy"}" decoding="async">`;
const productCard = product => `<article class="biostar-product" data-product-id="${product.id}"><div class="biostar-product-visual">${productImage(product)}</div><div class="biostar-product-copy"><p class="biostar-product-use">${product.use}</p><h3>${product.name}</h3><p class="biostar-product-volume">${product.volume}</p><p>${product.description}</p></div></article>`;

export const biostarContentKo = () => {
  const logo = biostarBrand.logo.path
    ? `<img class="brand-wordmark" src="${biostarBrand.logo.path}" width="${biostarBrand.logo.width}" height="${biostarBrand.logo.height}" alt="${biostarBrand.logo.alt}">`
    : `<span class="eyebrow">BIOSTAR · POLAND</span>`;
  const purchaseUrl = biostarBrand.officialPurchaseUrl || biostarBrand.purchaseFallbackUrl;
  const purchaseNote = biostarBrand.officialPurchaseUrl ? "공식 판매처로 이동합니다." : "공식 판매처 URL 준비 중 · 제품 문의 페이지로 연결됩니다.";
  const kitchen = biostarProducts.filter(product => product.category === "kitchen");

  return `<section class="biostar-page-hero"><div class="container"><div class="breadcrumb"><a href="/">홈</a> / <a href="/brands/">브랜드</a> / BIOstar</div><div class="biostar-hero-grid"><div class="biostar-hero-copy">${logo}<span class="eyebrow">POLISH HOMECARE</span><h1 class="display">일상의 공간에 맞춘<br>폴란드 홈케어 브랜드</h1><p class="lead">BIOstar는 폴란드 INCO 그룹이 선보이는 홈케어 브랜드입니다. 주방과 욕실 등 생활공간에 맞춘 다양한 세정 제품을 소개합니다.</p></div><div class="biostar-hero-products" aria-hidden="true">${productImage(kitchen[0], { decorative: true, eager: true })}${productImage(kitchen[1], { decorative: true, eager: true })}${productImage(kitchen[2], { decorative: true, eager: true })}</div></div></div></section>
  <section class="section biostar-principles"><div class="container"><span class="eyebrow">BIOSTAR ESSENTIALS</span><h2 class="title">공간과 제품에 맞춘<br>홈케어의 기준</h2><p class="section-lead">제품별 용도와 사용 방법은 상세 페이지에서 확인할 수 있습니다.</p><ul class="biostar-keywords"><li>주방 관리</li><li>욕실 관리</li><li>다목적 관리</li><li>식기세척기 관리</li></ul></div></section>
  <section class="biostar-catalogue" aria-labelledby="biostar-products-title"><div class="container"><span class="eyebrow">HOMECARE RANGE</span><h2 class="title" id="biostar-products-title">BIOstar 제품 라인업</h2>${categories.map((category, index) => `<section class="biostar-category biostar-category-${category.id}" aria-labelledby="category-${category.id}"><div class="biostar-category-heading"><span>${category.eyebrow}</span><h3 id="category-${category.id}">${category.title}</h3><b>0${index + 1}</b></div><div class="biostar-category-products">${biostarProducts.filter(product => product.category === category.id).map(productCard).join("")}</div></section>`).join("")}</div></section>
  <section class="section biostar-certifications"><div class="container biostar-info-grid"><div><span class="eyebrow">PRODUCT INFORMATION</span><h2 class="title">제품별 인증 안내</h2></div><div><p class="lead">인증과 성분 정보는 제품별로 다를 수 있으므로 각 제품의 공식 표시사항을 확인해 주세요.</p><p class="biostar-data-note">현재 별도로 등록된 제품별 인증 정보는 없습니다.</p></div></div></section>
  <section class="section biostar-cta"><div class="container"><div><span class="eyebrow">OFFICIAL RETAILER</span><h2 class="title">BIOstar 제품을<br>공식 판매처에서 만나보세요</h2><p>${purchaseNote}</p></div><a class="btn biostar-cta-button" href="${purchaseUrl}">공식 판매처 보기</a></div></section>`;
};

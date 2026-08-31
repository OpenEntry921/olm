/** Korean BIOstar content and product-image readiness data. */
export const biostarBrand = {
  name: "BIOstar",
  // TODO: 공식 BIOstar 웹용 로고 PNG 또는 SVG 업로드 후 image 경로로 교체
  // 권장 경로: /assets/biostar/logo/biostar-logo.png
  logo: { path: "/assets/biostar/logo/biostar-logo.png", ready: false, alt: "BIOstar", width: 720, height: 240 }
};

export const biostarProducts = [
  { id: "biostar-dishwashing-liquid-700ml", name: "BIOstar 주방세제", variant: "700ml", description: "손설거지를 위한 주방세제로, 음식물과 기름때가 남은 식기를 깨끗하게 관리할 수 있도록 설계된 제품입니다. 천연 알로에 추출물을 활용한 제품 구성이 특징입니다.", futureImage: "/assets/biostar/products/biostar-dishwashing-liquid-700ml.png", imageReady: false, placeholderLabel: "제품 이미지 준비 중", order: 1, visible: true },
  { id: "biostar-kitchen-foam-700ml", name: "BIOstar 주방 클리닝 폼", variant: "700ml", description: "조리대, 후드, 싱크대, 전자레인지 등 세척 가능한 주방 표면의 기름때와 음식물 오염 관리에 사용하는 주방용 클리닝 폼입니다. 천연 알로에 추출물을 활용합니다.", futureImage: "/assets/biostar/products/biostar-kitchen-foam-700ml.png", imageReady: false, placeholderLabel: "제품 이미지 준비 중", order: 2, visible: true },
  { id: "biostar-bathroom-foam-700ml", name: "BIOstar 욕실 클리닝 폼", variant: "700ml", description: "세라믹, 크롬, 유리, 스테인리스와 타일 등 세척 가능한 욕실 표면의 물때와 비누 잔여물을 관리하기 위한 욕실용 클리닝 폼입니다. 천연 라벤더 추출물을 활용합니다.", futureImage: "/assets/biostar/products/biostar-bathroom-foam-700ml.png", imageReady: false, placeholderLabel: "제품 이미지 준비 중", order: 3, visible: true },
  { id: "biostar-shower-cleaner-700ml", name: "BIOstar 샤워부스 클리너", variant: "700ml", description: "샤워부스의 유리와 타일, 크롬 및 세라믹 표면에 남는 물자국, 비누 잔여물과 석회성 오염을 관리하기 위한 전용 클리너입니다. 천연 라벤더 추출물을 활용합니다.", futureImage: "/assets/biostar/products/biostar-shower-cleaner-700ml.png", imageReady: false, placeholderLabel: "제품 이미지 준비 중", order: 4, visible: true },
  { id: "biostar-glass-mirror-cleaner-700ml", name: "BIOstar 유리·거울 클리너", variant: "700ml", description: "유리와 거울 등 광택 표면에 남는 먼지, 얼룩과 생활 오염을 관리하기 위한 클리너입니다.", futureImage: "/assets/biostar/products/biostar-glass-mirror-cleaner-700ml.png", imageReady: false, placeholderLabel: "제품 이미지 준비 중", order: 5, visible: true }
];

// 검사 결과 확인 후 비활성화 또는 교체 예정
export const biostarPendingInfographics = {
  enabled: true,
  status: "pending-review",
  items: [
    { src: "/docs/source-images/ChatGPT Image 2026년 8월 22일 오후 02_10_04.png", alt: "BIOstar 제품 특징 안내", width: 1817, height: 866, order: 1 },
    { src: "/docs/source-images/ChatGPT Image 2026년 8월 22일 오후 02_15_58.png", alt: "BIOstar 세정 아이디어 안내", width: 1024, height: 1535, order: 2 }
  ]
};

const stagingImages = {
  hero: { src: "/docs/source-images/ChatGPT Image 2026년 8월 22일 오후 01_55_15 (6).png", alt: "BIOstar 홈케어 제품 라인업", width: 1942, height: 809 },
  approach: { src: "/docs/source-images/ChatGPT Image 2026년 8월 22일 오후 01_55_15 (5).png", alt: "BIOstar 제품을 사용하는 주방 공간", width: 1942, height: 809 }
};
const imageTag = (image, className = "") => `<img${className ? ` class="${className}"` : ""} src="${image.src}" width="${image.width}" height="${image.height}" alt="${image.alt}">`;
const productVisual = product => product.imageReady
  ? `<img class="product-image" src="${product.futureImage}" width="720" height="900" alt="${product.name} ${product.variant}">`
  : `<div class="product-placeholder" role="img" aria-label="${product.name} ${product.variant} ${product.placeholderLabel}"><strong>${biostarBrand.name}</strong><span>${product.name}</span><b>${product.variant}</b><small>${product.placeholderLabel}</small></div>`;
const productCard = product => `<article class="product-card" data-product-id="${product.id}">${productVisual(product)}<div class="product-copy"><h3>${product.name}</h3><p class="product-variant">${product.variant}</p><p>${product.description}</p></div></article>`;

export const biostarContentKo = () => {
  const products = biostarProducts.filter(product => product.visible).sort((a, b) => a.order - b.order);
  const wordmark = biostarBrand.logo.ready
    ? `<img class="brand-wordmark" src="${biostarBrand.logo.path}" width="${biostarBrand.logo.width}" height="${biostarBrand.logo.height}" alt="${biostarBrand.logo.alt}">`
    : `<span class="brand-name biostar-name">${biostarBrand.name}</span>`;
  const infographics = biostarPendingInfographics.enabled
    ? `<div class="infographic-grid">${biostarPendingInfographics.items.sort((a, b) => a.order - b.order).map(item => `<figure>${imageTag(item)}</figure>`).join("")}</div>` : "";
  return `<section class="brand-detail-hero biostar-detail"><div class="container"><div class="breadcrumb"><a href="/">홈</a> / <a href="/brands/">브랜드</a> / BIOstar</div><div class="brand-intro">${wordmark}<div><span class="eyebrow">NATURAL-ORIGIN HOMECARE</span><h1 class="display">자연에서 찾은 성분에<br>클리닝 기술을 더하다</h1><p class="lead">BIOstar는 자연 유래 성분과 식물 추출물을 바탕으로 주방, 욕실, 유리와 거울 등 집 안의 다양한 공간을 관리할 수 있는 홈케어 제품을 제안합니다.</p></div></div>${imageTag(stagingImages.hero, "brand-banner")}</div></section>
  <section class="section approach-section"><div class="container split"><div class="visual natural-visual">${imageTag(stagingImages.approach)}</div><div><span class="eyebrow">OUR APPROACH</span><h2 class="title">일상의 공간에서 시작하는 새로운 홈케어</h2><p class="lead">자연 유래 성분과 세정 기술을 결합해 제품이 사용되는 공간과 목적에 맞춘 세분화된 클리닝 제품군을 구성합니다.</p></div></div></section>
  <section class="section product-section biostar-products"><div class="container"><span class="eyebrow">HOMECARE RANGE</span><h2 class="title">공간과 목적에 맞춘 제품 라인업</h2><div class="product-grid biostar-product-grid">${products.map(productCard).join("")}</div></div></section>
  ${biostarPendingInfographics.enabled ? `<section class="section infographic-section"><div class="container"><span class="eyebrow">CLEANING IDEAS</span><h2 class="title">BIOstar가 제안하는 클리닝 아이디어</h2><p class="section-lead">자연 유래 성분과 브랜드의 세정 기술을 결합해 일상적인 오염 관리에 새로운 접근을 제안합니다.</p>${infographics}</div></section>` : ""}`;
};

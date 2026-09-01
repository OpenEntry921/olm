/** Korean Ludwik brand and product catalogue. */
const productImage = filename => `/docs/source-images/${filename}`;

export const ludwikBrand = {
  name: "Ludwik",
  logo: { path: productImage("Ludwik-logo.png"), alt: "Ludwik", width: 1216, height: 304 },
  officialPurchaseUrl: null, // TODO: 공식 판매처 URL 확정 후 입력
  purchaseFallbackUrl: "/contact/?type=retailer"
};

export const ludwikProducts = [
  { id: "ludwik-eko-tablets-40", familyId: "ludwik-eko-dishwasher-tablets", name: "Ludwik EKO 식기세척기용 태블릿", type: "태블릿", quantity: "40개입", category: "식기세척기용 세제", description: "필요한 사용량에 맞춰 선택할 수 있는 Ludwik EKO 식기세척기용 태블릿 제품군입니다.", image: productImage("ludwik-eko-dishwasher-tablets-40pcs.png"), width: 2503, height: 2142, alt: "Ludwik EKO 식기세척기용 태블릿 40개입 패키지", purchaseUrl: null, availableInKorea: true },
  { id: "ludwik-eko-tablets-75", familyId: "ludwik-eko-dishwasher-tablets", name: "Ludwik EKO 식기세척기용 태블릿", type: "태블릿", quantity: "75개입", category: "식기세척기용 세제", description: "필요한 사용량에 맞춰 선택할 수 있는 Ludwik EKO 식기세척기용 태블릿 제품군입니다.", image: productImage("ludwik-eko-dishwasher-tablets-75pcs.png"), width: 2542, height: 2898, alt: "Ludwik EKO 식기세척기용 태블릿 75개입 패키지", purchaseUrl: null, availableInKorea: true },
  { id: "ludwik-eko-tablets-120", familyId: "ludwik-eko-dishwasher-tablets", name: "Ludwik EKO 식기세척기용 태블릿", type: "태블릿", quantity: "120개입", category: "식기세척기용 세제", description: "필요한 사용량에 맞춰 선택할 수 있는 Ludwik EKO 식기세척기용 태블릿 제품군입니다.", image: productImage("ludwik-eko-dishwasher-tablets-120pcs.png"), width: 2724, height: 3587, alt: "Ludwik EKO 식기세척기용 태블릿 120개입 패키지", purchaseUrl: null, availableInKorea: true },
  { id: "ludwik-eko-powder-1-2kg", familyId: "ludwik-eko-dishwasher-powder", name: "Ludwik EKO 식기세척기용 분말 세제", type: "분말", quantity: "1.2kg", category: "식기세척기용 세제", description: "사용 환경과 세척량에 맞게 양을 조절해 사용할 수 있는 식기세척기용 분말 세제입니다.", image: productImage("ludwik-eko-dishwasher-powder-1-2kg.png"), width: 2362, height: 3154, alt: "Ludwik EKO 식기세척기용 분말 세제 1.2kg 패키지", purchaseUrl: null, availableInKorea: true }
];

const productImageTag = (product, className = "ludwik-product-image") => `<img class="${className}" src="${product.image}" width="${product.width}" height="${product.height}" alt="${product.alt}" loading="lazy" decoding="async">`;
const tabletVariant = product => `<article class="ludwik-tablet" data-product-id="${product.id}"><div class="ludwik-tablet-visual">${productImageTag(product)}</div><div class="ludwik-tablet-copy"><h4>${product.quantity}</h4><p>${product.name}</p></div></article>`;

export const ludwikContentKo = () => {
  const tablets = ludwikProducts.filter(product => product.familyId === "ludwik-eko-dishwasher-tablets");
  const heroProduct = tablets.find(product => product.quantity === "120개입");
  const powder = ludwikProducts.find(product => product.type === "분말");
  const purchaseUrl = ludwikBrand.officialPurchaseUrl || ludwikBrand.purchaseFallbackUrl;
  const purchaseNote = ludwikBrand.officialPurchaseUrl ? "오름인터내셔널이 공식적으로 소개하는 Ludwik 제품과 판매 정보를 확인하세요." : "오름인터내셔널이 공식적으로 소개하는 Ludwik 제품과 판매 정보를 확인하세요. 현재 판매처 URL은 준비 중이며 제품 문의 페이지로 연결됩니다.";
  return `<section class="ludwik-page-hero"><div class="container"><nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a> / <a href="/brands/">브랜드</a> / <span aria-current="page">Ludwik</span></nav><div class="ludwik-hero-grid"><div class="ludwik-hero-copy"><div class="ludwik-brand-logo"><span class="brand-logo-fallback">Ludwik</span><img src="${ludwikBrand.logo.path}" width="${ludwikBrand.logo.width}" height="${ludwikBrand.logo.height}" alt="${ludwikBrand.logo.alt}" onerror="this.hidden=true"></div><span class="eyebrow">SINCE 1964</span><h1 class="display">폴란드의 주방에서 시작해 생활 전반으로 확장된 클리닝 브랜드</h1><p class="lead">1964년부터 이어온 폴란드의 생활 세정 브랜드, Ludwik. 주방에서 시작한 오랜 경험을 바탕으로 일상의 다양한 공간을 위한 홈케어 제품을 선보입니다.</p></div><div class="ludwik-hero-product"><span aria-hidden="true">1964</span><img src="${heroProduct.image}" width="${heroProduct.width}" height="${heroProduct.height}" alt="" loading="eager" fetchpriority="high" decoding="async"></div></div></div></section>
  <section class="section ludwik-heritage" aria-labelledby="ludwik-heritage-title"><div class="container ludwik-heritage-grid"><div class="ludwik-year"><small>SINCE</small><strong>1964</strong></div><div><span class="eyebrow">BRAND HERITAGE</span><h2 class="title" id="ludwik-heritage-title">주방에서 시작된 생활 세정의 경험</h2><p class="lead">1964년 폴란드의 주방에서 시작한 Ludwik는 오랜 시간 생활 속 세정 경험을 축적하며 주방부터 세탁과 홈케어까지 제품 영역을 확장해 왔습니다.</p><ul class="ludwik-heritage-notes"><li>1964년 시작된 폴란드 생활 세정 브랜드</li><li>주방세제에서 출발해 종합 홈케어로 이어진 경험</li></ul></div></div></section>
  <section class="section ludwik-catalogue" aria-labelledby="ludwik-products-title"><div class="container"><span class="eyebrow">AVAILABLE IN KOREA</span><h2 class="title" id="ludwik-products-title">국내에서 만나는 Ludwik EKO 식기세척기 제품</h2><p class="section-lead">생활 방식과 사용량에 맞게 선택할 수 있는 식기세척기용 태블릿과 분말 세제를 소개합니다.</p><section class="ludwik-tablet-family" aria-labelledby="tablet-family-title"><div class="ludwik-family-heading"><span>01 · TABLETS</span><h3 id="tablet-family-title">식기세척기용 태블릿</h3><p>필요한 사용량에 맞춰 선택할 수 있는 Ludwik EKO 식기세척기용 태블릿 제품군입니다.</p></div><div class="ludwik-tablet-grid">${tablets.map(tabletVariant).join("")}</div></section><section class="ludwik-powder" aria-labelledby="powder-title"><div class="ludwik-powder-visual">${productImageTag(powder)}</div><div class="ludwik-powder-copy"><span>02 · POWDER</span><h3 id="powder-title">${powder.name}</h3><strong>${powder.quantity}</strong><p>${powder.description}</p></div></section></div></section>
  <section class="section ludwik-choice"><div class="container ludwik-editorial-grid"><span class="ludwik-section-number" aria-hidden="true">04</span><div><span class="eyebrow">PACKAGE GUIDE</span><h2 class="title">사용량에 맞춘 패키지 선택</h2><p class="lead">40개입, 75개입, 120개입으로 구성된 태블릿 제품군은 가정의 사용 빈도와 보관 환경에 맞게 선택할 수 있습니다. 분말형 제품은 세척량에 맞춰 사용량을 조절하기 좋은 선택지입니다.</p></div></div></section>
  <section class="section ludwik-expansion"><div class="container ludwik-editorial-grid"><span class="ludwik-section-number" aria-hidden="true">1964—</span><div><span class="eyebrow">BEYOND THE KITCHEN</span><h2 class="title">주방에서 시작해 생활 전반으로</h2><p class="lead">주방세제에서 시작한 Ludwik는 세탁과 다양한 생활 공간을 위한 홈케어 영역으로 제품 경험을 확장해 왔습니다.</p></div></div></section>
  <section class="section ludwik-cta"><div class="container"><div><span class="eyebrow">OFFICIAL RETAILER</span><h2 class="title">Ludwik 제품을 공식 판매처에서 만나보세요</h2><p>${purchaseNote}</p></div><a class="btn ludwik-cta-button" href="${purchaseUrl}">공식 판매처 보기</a></div></section>`;
};

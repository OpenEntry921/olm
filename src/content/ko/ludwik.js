/** Korean Ludwik content and product-image readiness data. */
export const ludwikBrand = {
  name: "Ludwik",
  logo: {
    path: "/docs/source-images/Ludwik-logo.png",
    ready: true,
    alt: "Ludwik",
    width: 1216,
    height: 304
  }
};

export const ludwikProducts = [
  { id: "ludwik-eko-tablets-40", name: "Ludwik EKOlogiczny 식기세척기 타블렛", variant: "40개입", description: "", futureImage: "/assets/ludwik/products/ludwik-eko-tablets-40.png", imageReady: false, placeholderLabel: "제품 이미지 준비 중", order: 1, visible: true },
  { id: "ludwik-eko-tablets-75", name: "Ludwik EKOlogiczny 식기세척기 타블렛", variant: "75개입", description: "", futureImage: "/assets/ludwik/products/ludwik-eko-tablets-75.png", imageReady: false, placeholderLabel: "제품 이미지 준비 중", order: 2, visible: true },
  { id: "ludwik-eko-tablets-120", name: "Ludwik EKOlogiczny 식기세척기 타블렛", variant: "120개입", description: "", futureImage: "/assets/ludwik/products/ludwik-eko-tablets-120.png", imageReady: false, placeholderLabel: "제품 이미지 준비 중", order: 3, visible: true },
  { id: "ludwik-eko-powder-1-2kg", name: "Ludwik EKOlogiczny 식기세척기 분말세제", variant: "1.2kg", description: "세척량과 사용 환경에 맞춰 사용량을 조절할 수 있는 분말형 식기세척기 세제입니다.", futureImage: "/assets/ludwik/products/ludwik-eko-powder-1-2kg.png", imageReady: false, placeholderLabel: "제품 이미지 준비 중", order: 4, visible: true }
];

const productVisual = product => product.imageReady
  ? `<img class="product-image" src="${product.futureImage}" width="720" height="900" alt="${product.name} ${product.variant}">`
  : `<div class="product-placeholder" role="img" aria-label="${product.name} ${product.variant} ${product.placeholderLabel}"><strong>${ludwikBrand.name}</strong><span>${product.name}</span><b>${product.variant}</b><small>${product.placeholderLabel}</small></div>`;

const productCard = product => `<article class="product-card" data-product-id="${product.id}">${productVisual(product)}<div class="product-copy"><h3>${product.name}</h3><p class="product-variant">${product.variant}</p>${product.description ? `<p>${product.description}</p>` : ""}</div></article>`;

export const ludwikContentKo = () => {
  const products = ludwikProducts.filter(product => product.visible).sort((a, b) => a.order - b.order);
  const tablets = products.filter(product => product.id.includes("tablets"));
  const powder = products.find(product => product.id.includes("powder"));
  const logo = ludwikBrand.logo.ready
    ? `<img class="brand-wordmark" src="${ludwikBrand.logo.path}" width="${ludwikBrand.logo.width}" height="${ludwikBrand.logo.height}" alt="${ludwikBrand.logo.alt}">`
    : `<span class="brand-name">${ludwikBrand.name}</span>`;
  return `<section class="brand-detail-hero ludwik-detail"><div class="container"><div class="breadcrumb"><a href="/">홈</a> / <a href="/brands/">브랜드</a> / Ludwik</div><div class="brand-intro">${logo}<div><span class="eyebrow">SINCE 1964 · POLAND</span><h1 class="display">폴란드의 주방에서 시작해<br>생활 전반으로 확장된 클리닝 브랜드</h1><p class="lead">1964년부터 이어온 폴란드 생활 세정 브랜드 Ludwik.<br>오랜 브랜드 경험을 바탕으로 일상적인 설거지와<br>식기세척기 관리를 위한 다양한 제품을 선보입니다.</p></div></div></div></section>
  <section class="section heritage"><div class="container heritage-grid"><div class="heritage-year"><small>SINCE</small><strong>1964</strong></div><div><span class="eyebrow">BRAND HERITAGE</span><h2 class="title">주방에서 시작된<br>생활 세정의 경험</h2><p class="lead">1964년 폴란드의 주방세제에서 시작한 Ludwik는 주방과 식기 관리에서 출발해 세탁과 홈케어까지 제품 영역을 확장해 온 생활 세정 브랜드입니다.</p></div></div></section>
  <section class="section product-section ludwik-products"><div class="container"><span class="eyebrow">DISHWASHER TABLETS</span><h2 class="title">생활 방식에 맞춰 선택하는 타블렛 구성</h2><p class="section-lead">동일한 Ludwik EKOlogiczny 식기세척기 타블렛을 가정의 사용량과 보관 방식에 따라 40개입, 75개입, 120개입으로 선택할 수 있습니다.</p><div class="product-grid product-grid-three">${tablets.map(productCard).join("")}</div></div></section>
  <section class="section powder-section"><div class="container powder-grid"><div><span class="eyebrow">DISHWASHER POWDER</span><h2 class="title">필요한 만큼 조절하는 분말 타입</h2><p class="lead">${powder.description}</p></div>${productCard(powder)}</div></section>`;
};

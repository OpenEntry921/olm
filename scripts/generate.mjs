import { mkdir, readFile, writeFile } from "node:fs/promises";
import { commonContentKo, companyInfoKo, pageMetaKo } from "../src/content/ko/common.js";
import { homeContentKo } from "../src/content/ko/home.js";
import { aboutContentKo } from "../src/content/ko/about.js";
import { brandsContentKo } from "../src/content/ko/brands.js";
import { ludwikBrand, ludwikContentKo, ludwikProducts } from "../src/content/ko/ludwik.js";
import { biostarBrand, biostarContentKo, biostarProducts } from "../src/content/ko/biostar.js";
import { businessContentKo } from "../src/content/ko/business.js";
import { partnershipContentKo } from "../src/content/ko/partnership.js";
import { contactContentKo } from "../src/content/ko/contact.js";
import { aiCleanCareContentKo } from "../src/content/ko/ai-clean-care.js";
import { renderLanguageSwitcher } from "../src/components/language-switcher.js";
import { createMetadata, renderMetadata } from "../src/seo/metadata.js";
import productMaster from "../assets/data/product-master.json" with { type: "json" };

const root = new URL("../", import.meta.url);
const media = JSON.parse(await readFile(new URL("assets/data/media-data.json", root), "utf8"));
const image = key => media.images[key];
const imageTag = (key, decorative = false) => {
  const item = image(key);
  return `<img src="${item.src}" width="${item.width}" height="${item.height}" alt="${decorative ? "" : item.alt}">`;
};
const pathOf = id => id === "home" ? "/" : id === "ludwik" || id === "biostar" ? `/brands/${id}/` : `/${id}/`;
const logoPath = "/docs/source-images/ChatGPT Image 2026년 8월 22일 오후 01_09_56.png";
const logo = `<a class="logo" href="/"><img src="${logoPath}" width="320" height="120" alt="오름인터내셔널 OLM"></a>`;
const header = current => `<a class="skip-link" href="#main">${commonContentKo.skipLink}</a><header class="header"><div class="container header-inner">${logo}<button class="menu-button" id="menu-open" aria-controls="primary-nav" aria-expanded="false"><span></span><span></span><span></span><span class="sr-only">${commonContentKo.menu.open}</span></button><nav class="nav" id="primary-nav" aria-label="${commonContentKo.menu.ariaLabel}"><button class="menu-close" id="menu-close" aria-label="${commonContentKo.menu.close}">✕</button>${commonContentKo.navigation.map(item=>`<a href="${item.href}"${current===item.id?' aria-current="page"':''}>${item.label}</a>`).join("")}${renderLanguageSwitcher(commonContentKo.languageSwitcher)}</nav></div></header>`;
const f = commonContentKo.footer;
const footer = `<footer class="footer"><div class="container"><div class="footer-top">${logo}<div class="footer-info"><span><b>${f.companyLabel}</b> ${f.companyName}</span><span><b>${f.emailLabel}</b> <a href="${f.emailHref}">${f.email}</a></span><span><b>${f.phoneLabel}</b> <a href="${f.phoneHref}">${f.phone}</a></span><span><b>${f.addressLabel}</b> ${f.address}</span></div></div><div class="footer-bottom">${f.copyright} &nbsp; <a href="/contact/">${f.contactLabel}</a><a class="footer-admin" href="/admin/ai-clean-care/">${f.adminLabel}</a></div></div></footer>`;
const absoluteUrl = path => new URL(path, commonContentKo.siteUrl).href;
const organizationId = absoluteUrl("#organization");
const websiteId = absoluteUrl("#website");
const organization = {"@type":"Organization","@id":organizationId,"name":commonContentKo.organization.name,"alternateName":[commonContentKo.organization.alternateName,"오름인터내셔널","OLM"],"description":commonContentKo.organization.description,"url":commonContentKo.siteUrl,"logo":{"@type":"ImageObject","url":absoluteUrl("/docs/source-images/olm_logo.png")},"email":commonContentKo.organization.email,"telephone":commonContentKo.organization.telephone,"address":{"@type":"PostalAddress","streetAddress":commonContentKo.organization.address,"addressCountry":"KR"}};
const website = {"@type":"WebSite","@id":websiteId,"name":"OLM International","alternateName":"오름인터내셔널","url":commonContentKo.siteUrl,"publisher":{"@id":organizationId},"inLanguage":"ko-KR"};
const brandNodes = {
  ludwik: {"@type":"Brand","@id":absoluteUrl("/brands/ludwik/#brand"),"name":ludwikBrand.name,"url":absoluteUrl("/brands/ludwik/")},
  biostar: {"@type":"Brand","@id":absoluteUrl("/brands/biostar/#brand"),"name":biostarBrand.name,"url":absoluteUrl("/brands/biostar/")}
};
const productNode = (product, brand, pagePath) => ({"@type":"Product","@id":absoluteUrl(`${pagePath}#product-${product.id}`),"name":`${product.name} ${product.quantity || product.volume}`,"description":product.description,"image":absoluteUrl(product.image),"category":product.category,"brand":{"@id":brand["@id"]},...(product.manufacturer?{"manufacturer":{"@type":"Organization","name":product.manufacturer}}:{}),...(product.countryOfOrigin?{"countryOfOrigin":{"@type":"Country","name":product.countryOfOrigin}}:{}),"url":brand.name === "BIOstar" ? absoluteUrl(`${pagePath}#detail-${product.id}`) : absoluteUrl(pagePath),"additionalProperty":(product.structuredFacts || product.allowedClaims || []).map(fact=>typeof fact === "string" ? ({"@type":"PropertyValue","name":"제품 특징","value":fact}) : ({"@type":"PropertyValue",...fact}))});
const breadcrumbNode = id => {
  const entries = [{name:commonContentKo.breadcrumb.home,path:"/"}];
  if (["ludwik","biostar"].includes(id)) entries.push({name:commonContentKo.breadcrumb.brands,path:"/brands/"});
  if (id !== "home") entries.push({name:id === "ludwik" ? "Ludwik" : id === "biostar" ? "BIOstar" : pageMetaKo[id][0].split(" |")[0],path:pathOf(id)});
  return {"@type":"BreadcrumbList","@id":absoluteUrl(`${pathOf(id)}#breadcrumb`),"itemListElement":entries.map(({name,path},index)=>({"@type":"ListItem","position":index+1,"name":name,"item":absoluteUrl(path)}))};
};
const structuredData = (id, metadata) => {
  const page = {"@type":"WebPage","@id":`${metadata.canonical}#webpage`,"url":metadata.canonical,"name":metadata.title,"description":metadata.description,"isPartOf":{"@id":websiteId},"about":{"@id":organizationId},"breadcrumb":{"@id":absoluteUrl(`${pathOf(id)}#breadcrumb`)},"inLanguage":"ko-KR"};
  const graph = [organization,website,page,breadcrumbNode(id)];
  if (id === "brands") graph.push(brandNodes.ludwik,brandNodes.biostar);
  if (id === "ludwik") graph.push(brandNodes.ludwik,...ludwikProducts.map(product=>productNode(product,brandNodes.ludwik,"/brands/ludwik/")));
  if (id === "biostar") graph.push(brandNodes.biostar,...biostarProducts.map(product=>productNode(product,brandNodes.biostar,"/brands/biostar/")));
  return JSON.stringify({"@context":"https://schema.org","@graph":graph}).replaceAll("<","\\u003c");
};
const layout = (id, body) => { const metadata=createMetadata({common:commonContentKo,id,pathname:pathOf(id),pageMeta:pageMetaKo,imagePath:image("commonOg").src}); return `<!doctype html><html lang="${metadata.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${renderMetadata(metadata)}<link rel="icon" href="${image("favicon").src}" type="image/png"><link rel="stylesheet" href="/assets/css/style.css"><script type="application/ld+json">${structuredData(id,metadata)}</script></head><body>${header(id)}<main id="main">${body}</main>${footer}<script src="/assets/data/site-data.js"></script><script src="/assets/js/main.js"></script></body></html>`};
const pageHero=(eyebrow,title,lead)=>`<section class="page-hero"><div class="container"><div class="breadcrumb"><a href="/">${commonContentKo.breadcrumb.home}</a> / ${eyebrow}</div><span class="eyebrow">${eyebrow}</span><h1 class="display">${title}</h1><p class="lead">${lead}</p></div></section>`;
const pages={home:homeContentKo({imageTag}),about:aboutContentKo({pageHero,companyInfo:companyInfoKo}),brands:brandsContentKo({imageTag,pageHero}),ludwik:ludwikContentKo({imageTag}),biostar:biostarContentKo({imageTag}),business:businessContentKo({pageHero}),partnership:partnershipContentKo({pageHero}),contact:contactContentKo({pageHero,companyInfo:companyInfoKo}),"ai-clean-care":aiCleanCareContentKo()};
for (const [id,body] of Object.entries(pages)) {
  const folder = id === "home" ? root : id === "ludwik" || id === "biostar" ? new URL(`brands/${id}/`,root) : new URL(`${id}/`,root);
  await mkdir(folder,{recursive:true});
  await writeFile(new URL("index.html",folder),layout(id,body));
}


const htmlEscape = value => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const productMetadata = product => {
  const canonical = absoluteUrl(product.url);
  const description = `${product.name} ${product.volume}. ${product.description} 용도, 사용 공간, 사용 방법, 주의사항과 확인된 제품정보를 제공합니다.`;
  return {lang:"ko",title:`${product.name} ${product.volume} | 오름인터내셔널`,description,canonical,openGraph:{title:`${product.name} ${product.volume}`,description,locale:"ko_KR",url:canonical,image:absoluteUrl(product.image)}};
};
const productStructuredData = (product, metadata) => JSON.stringify({"@context":"https://schema.org","@graph":[
  organization, website,
  {"@type":"WebPage","@id":`${metadata.canonical}#webpage`,"url":metadata.canonical,"name":metadata.title,"description":metadata.description,"isPartOf":{"@id":websiteId},"about":{"@id":`${metadata.canonical}#product`},"breadcrumb":{"@id":`${metadata.canonical}#breadcrumb`},"inLanguage":"ko-KR"},
  {"@type":"BreadcrumbList","@id":`${metadata.canonical}#breadcrumb`,"itemListElement":[
    {"@type":"ListItem","position":1,"name":"홈","item":absoluteUrl("/")},
    {"@type":"ListItem","position":2,"name":"BIOstar","item":absoluteUrl("/brands/biostar/")},
    {"@type":"ListItem","position":3,"name":product.name,"item":metadata.canonical}
  ]},
  {"@type":"Product","@id":`${metadata.canonical}#product`,"name":product.name,"brand":{"@type":"Brand","name":product.brand,"url":absoluteUrl("/brands/biostar/")},"manufacturer":{"@type":"Organization","name":product.manufacturer},"category":product.category,"description":product.description,"image":absoluteUrl(product.image),"url":metadata.canonical,"seller":{"@type":"Organization","name":product.distributor,"url":commonContentKo.siteUrl}}
]}).replaceAll("<","\\u003c");
const productBody = product => {
  const ingredients = product.ingredients.length ? product.ingredients.join(", ") : product.ingredientsNote;
  const claims = product.allowedClaims.map(claim=>`<li>${htmlEscape(claim)}</li>`).join("");
  const sources = product.sources.map(source=>`${htmlEscape(source.title)} (확인일 ${htmlEscape(source.checkedAt)})`).join(", ");
  const facts = [
    ["브랜드명",product.brand],["용도",product.purpose],["사용 공간",product.useSpace],["용량",product.volume],
    ["사용 방법",product.usage],["주의사항",product.cautions],["확인된 성분",ingredients],
    ["검증된 특징 / claim",`<ul>${claims}</ul>`],["제조사",product.manufacturer],["한국 공식 유통사",product.distributor],
    ["공식 판매처",`<a href="${product.seller.url}" target="_blank" rel="noopener noreferrer">${htmlEscape(product.seller.name)}</a>`],
    ["정보 확인일",product.sources[0].checkedAt],["출처",sources]
  ];
  return `<article class="product-page"><section class="product-hero"><div class="container product-hero-grid"><figure><img src="${product.image}" width="${product.imageWidth}" height="${product.imageHeight}" alt="${htmlEscape(product.imageAlt)}"></figure><div><div class="breadcrumb"><a href="/">홈</a> / <a href="/brands/biostar/">BIOstar</a> / 제품</div><span class="eyebrow">${product.brand} · PRODUCT INFORMATION</span><h1>${htmlEscape(product.name)}</h1>${product.nameOriginal?`<p>${htmlEscape(product.nameOriginal)}</p>`:""}<p class="product-volume">${htmlEscape(product.volume)}</p><p class="lead">${htmlEscape(product.description)}</p><p>${htmlEscape(product.purpose)} 용도로 사용하는 제품입니다. ${htmlEscape(product.useSpace)}에서 제품 라벨의 사용 방법과 주의사항에 따라 사용하세요.</p><div class="product-actions"><a class="btn btn-primary" href="${product.seller.url}" target="_blank" rel="noopener noreferrer">공식 판매처 보기</a><a class="btn" href="/ai-clean-care/">제품 문의하기</a></div></div></div></section><section class="product-facts" aria-labelledby="product-facts-title"><div class="container"><span class="eyebrow">VERIFIED PRODUCT FACTS</span><h2 class="title" id="product-facts-title">승인된 제품정보</h2><p>아래 정보는 오름인터내셔널의 승인 제품 데이터와 동기화되어 있습니다. 확인되지 않은 천연·친환경·안전성·살균 주장은 포함하지 않습니다.</p><dl class="product-facts-grid">${facts.map(([term,value])=>`<div class="product-fact"><dt>${term}</dt><dd>${value}</dd></div>`).join("")}</dl><p class="product-source-note">제품 표시사항은 변경될 수 있으므로 실제 구매 제품의 최신 한글 라벨을 우선 확인하세요.</p></div></section></article>`;
};
for (const product of biostarProducts) {
  const metadata=productMetadata(product);
  const folder=new URL(product.url.slice(1),root);
  await mkdir(folder,{recursive:true});
  const document=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${renderMetadata(metadata)}<link rel="icon" href="${image("favicon").src}" type="image/png"><link rel="stylesheet" href="/assets/css/style.css"><script type="application/ld+json">${productStructuredData(product,metadata)}</script></head><body>${header("brands")}<main id="main">${productBody(product)}</main>${footer}<script src="/assets/data/site-data.js"></script><script src="/assets/js/main.js"></script></body></html>`;
  await writeFile(new URL("index.html",folder),document);
}

// Product Knowledge Layer: generated independently of the existing brand and AI Clean Care runtimes.
const knowledgeProducts = productMaster.products.filter(product => product.approvalStatus === "approved");
const knowledgeUrl = product => `/products/${product.brandSlug}/${product.slug}/`;
const brandUrl = product => `/brands/${product.brandSlug}/`;
const verifiedOr = value => value || "확인된 자료 없음";
const knowledgeMetadata = product => {
  const canonical = absoluteUrl(knowledgeUrl(product));
  const description = `${product.name} ${product.volume}. ${product.description}`;
  return {lang:"ko",title:`${product.name} ${product.volume} | 오름인터내셔널`,description,canonical,openGraph:{title:`${product.name} ${product.volume}`,description,locale:"ko_KR",url:canonical,image:absoluteUrl(product.images[0].src)}};
};
const knowledgeStructuredData = (product, metadata) => {
  const node = {"@type":"Product","@id":`${metadata.canonical}#product`,"name":product.name,"description":product.description,"image":product.images.map(item=>absoluteUrl(item.src)),"brand":{"@type":"Brand","name":product.brand,"url":absoluteUrl(brandUrl(product))},"category":product.category,"url":metadata.canonical};
  if (product.sku) node.sku=product.sku;
  if (product.gtin) node.gtin=product.gtin;
  if (product.manufacturer) node.manufacturer={"@type":"Organization","name":product.manufacturer};
  if (product.countryOfOrigin) node.countryOfOrigin={"@type":"Country","name":product.countryOfOrigin};
  node.additionalProperty=(product.additionalProperty||[]).map(property=>({"@type":"PropertyValue",...property}));
  return JSON.stringify({"@context":"https://schema.org","@graph":[organization,website,{"@type":"WebPage","@id":`${metadata.canonical}#webpage`,"url":metadata.canonical,"name":metadata.title,"description":metadata.description,"isPartOf":{"@id":websiteId},"about":{"@id":node["@id"]},"breadcrumb":{"@id":`${metadata.canonical}#breadcrumb`},"inLanguage":"ko-KR"},{"@type":"BreadcrumbList","@id":`${metadata.canonical}#breadcrumb`,"itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":absoluteUrl("/")},{"@type":"ListItem","position":2,"name":"제품","item":absoluteUrl("/products/")},{"@type":"ListItem","position":3,"name":product.brand,"item":absoluteUrl(`/products/${product.brandSlug}/`)},{"@type":"ListItem","position":4,"name":product.name,"item":metadata.canonical}]},node]}).replaceAll("<","\\u003c");
};
const knowledgeBody = product => {
  const image=product.images[0];
  const features=(product.features||[]).map(feature=>`<li>${htmlEscape(feature)}</li>`).join("");
  const sources=(product.source||[]).map(source=>`<a href="${htmlEscape(source.sourceUrl)}"${source.sourceUrl.startsWith("http")?' target="_blank" rel="noopener noreferrer"':''}>${htmlEscape(source.title)}</a> (확인일 ${htmlEscape(source.lastVerifiedAt || source.checkedAt)})`).join(", ");
  const facts=[["브랜드",product.brand],["분류",product.category],["용도",product.purpose],["용량",product.volume],["사용 방법",verifiedOr(product.usage)],["주의사항",verifiedOr(product.cautions)],["제조사",verifiedOr(product.manufacturer)],["제조국",verifiedOr(product.countryOfOrigin)],["국내 유통사",verifiedOr(product.distributor)],["근거 자료",sources],["최종 검토일",product.lastReviewedAt]];
  const qna=(product.factualQna||[]).map(item=>`<div class="product-fact"><dt>${htmlEscape(item.question)}</dt><dd>${htmlEscape(item.answer)}</dd></div>`).join("");
  return `<article class="product-page"><section class="product-hero"><div class="container product-hero-grid"><figure><img src="${image.src}" width="${image.width}" height="${image.height}" alt="${htmlEscape(image.alt)}"></figure><div><nav class="breadcrumb" aria-label="현재 위치"><a href="/">홈</a> / <a href="/products/">제품</a> / <a href="/products/${product.brandSlug}/">${product.brand}</a></nav><span class="eyebrow">${product.brand} · PRODUCT KNOWLEDGE</span><h1>${htmlEscape(product.name)}</h1><p class="product-volume">${htmlEscape(product.volume)}</p><p class="lead">${htmlEscape(product.description)}</p><p><strong>용도:</strong> ${htmlEscape(product.purpose)}</p><div class="product-actions"><a class="btn btn-primary" href="${brandUrl(product)}">${product.brand} 브랜드 페이지</a><a class="btn" href="/products/${product.brandSlug}/">${product.brand} 제품 목록</a></div></div></div></section><section class="product-facts" aria-labelledby="product-facts-title"><div class="container"><span class="eyebrow">VERIFIED PRODUCT FACTS</span><h2 class="title" id="product-facts-title">확인된 제품 정보</h2><dl class="product-facts-grid">${facts.map(([term,value])=>`<div class="product-fact"><dt>${term}</dt><dd>${term === "근거 자료" ? value : htmlEscape(value)}</dd></div>`).join("")}</dl><h2 class="title">확인된 특징</h2><ul>${features}</ul>${qna?`<h2 class="title">제품 정보 Q&amp;A</h2><dl class="product-facts-grid">${qna}</dl>`:""}<p class="product-source-note">확인되지 않은 성분, 효능, 인증, 가격, 재고 정보는 제공하지 않습니다. 실제 사용 전 구매 제품의 최신 한글 라벨을 확인하세요.</p></div></section></article>`;
};
const productIndexBody = (products, title, lead) => `<section class="page-hero"><div class="container"><div class="breadcrumb"><a href="/">홈</a> / 제품</div><span class="eyebrow">PRODUCT KNOWLEDGE</span><h1 class="display">${title}</h1><p class="lead">${lead}</p></div></section><section class="section"><div class="container product-index-grid">${products.map(product=>`<article class="product-index-card"><img src="${product.images[0].src}" width="${product.images[0].width}" height="${product.images[0].height}" alt="${htmlEscape(product.images[0].alt)}" loading="lazy"><div><span class="eyebrow">${product.brand}</span><h2>${htmlEscape(product.name)}</h2><p><strong>${htmlEscape(product.volume)}</strong> · ${htmlEscape(product.purpose)}</p><p>${htmlEscape(product.description)}</p><a class="btn" href="${knowledgeUrl(product)}">제품 상세 정보</a></div></article>`).join("")}</div></section>`;
const knowledgeLayout = (pathname, title, description, body, jsonLd) => {const metadata={lang:"ko",title,description,canonical:absoluteUrl(pathname),openGraph:{title,description,locale:"ko_KR",url:absoluteUrl(pathname),image:absoluteUrl(image("commonOg").src)}};return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${renderMetadata(metadata)}<link rel="icon" href="${image("favicon").src}" type="image/png"><link rel="stylesheet" href="/assets/css/style.css">${jsonLd?`<script type="application/ld+json">${jsonLd}</script>`:""}</head><body>${header("brands")}<main id="main">${body}</main>${footer}<script src="/assets/data/site-data.js"></script><script src="/assets/js/main.js"></script></body></html>`};
for (const product of knowledgeProducts) {
  const metadata=knowledgeMetadata(product), folder=new URL(knowledgeUrl(product).slice(1),root);
  await mkdir(folder,{recursive:true});
  await writeFile(new URL("index.html",folder),knowledgeLayout(knowledgeUrl(product),metadata.title,metadata.description,knowledgeBody(product),knowledgeStructuredData(product,metadata)));
}
const productIndexes=[{path:"/products/",products:knowledgeProducts,title:"제품 지식 목록",lead:"오름인터내셔널이 취급하는 BIOstar와 Ludwik 제품의 확인된 정보를 브랜드별로 살펴보세요."},...['biostar','ludwik'].map(slug=>{const products=knowledgeProducts.filter(product=>product.brandSlug===slug),brand=products[0].brand;return {path:`/products/${slug}/`,products,title:`${brand} 제품`,lead:`${brand} 제품의 용도, 용량과 확인된 상세 정보를 살펴보세요.`}})];
for(const entry of productIndexes){const folder=new URL(entry.path.slice(1),root);await mkdir(folder,{recursive:true});await writeFile(new URL("index.html",folder),knowledgeLayout(entry.path,`${entry.title} | 오름인터내셔널`,entry.lead,productIndexBody(entry.products,entry.title,entry.lead)));}

const publicRoutes = ["/","/about/","/brands/","/brands/ludwik/","/brands/biostar/","/business/","/partnership/","/contact/","/ai-clean-care/",...biostarProducts.map(product=>product.url),...productIndexes.map(entry=>entry.path),...knowledgeProducts.map(knowledgeUrl)];
await writeFile(new URL("sitemap.xml",root),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicRoutes.map(route=>`  <url><loc>${absoluteUrl(route)}</loc></url>`).join("\n")}\n</urlset>\n`);
const productLinks=knowledgeProducts.map(product=>`- [${product.name} ${product.volume}](${absoluteUrl(knowledgeUrl(product))}): ${product.description}`).join("\n");
const legacyProductLinks=biostarProducts.map(product=>`- [기존 BIOstar 제품 문서: ${product.name} ${product.volume}](${absoluteUrl(product.url)})`).join("\n");
const llms=await readFile(new URL("llms.txt",root),"utf8");
const marker="\n## 제품 지식 문서";
const legacyMarker="\n## BIOstar 개별 제품 문서";
await writeFile(new URL("llms.txt",root),`${llms.split(marker)[0].split(legacyMarker)[0]}${marker}\n- [전체 제품 목록](${absoluteUrl("/products/")})\n- [BIOstar 제품 목록](${absoluteUrl("/products/biostar/")})\n- [Ludwik 제품 목록](${absoluteUrl("/products/ludwik/")})\n${productLinks}\n\n### 기존 BIOstar 제품 URL\n${legacyProductLinks}\n\n각 문서는 저장소 자료에서 확인된 제품명, 용도, 용량과 제품정보만 제공합니다. llms.txt는 검색·생성형 AI를 위한 보조 탐색 정보이며 노출이나 색인을 보장하지 않습니다.\n`);

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
const productNode = (product, brand, pagePath) => ({"@type":"Product","@id":absoluteUrl(`${pagePath}#product-${product.id}`),"name":`${product.name} ${product.quantity || product.volume}`,"description":product.description,"image":absoluteUrl(product.image),"category":product.category,"brand":{"@id":brand["@id"]},"url":brand.name === "BIOstar" ? absoluteUrl(`${pagePath}#detail-${product.id}`) : absoluteUrl(pagePath)});
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

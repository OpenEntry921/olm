import { mkdir, readFile, writeFile } from "node:fs/promises";
import { commonContentKo, pageMetaKo } from "../src/content/ko/common.js";
import { homeContentKo } from "../src/content/ko/home.js";
import { aboutContentKo } from "../src/content/ko/about.js";
import { brandsContentKo } from "../src/content/ko/brands.js";
import { ludwikContentKo } from "../src/content/ko/ludwik.js";
import { biostarContentKo } from "../src/content/ko/biostar.js";
import { businessContentKo } from "../src/content/ko/business.js";
import { partnershipContentKo } from "../src/content/ko/partnership.js";
import { contactContentKo } from "../src/content/ko/contact.js";
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
const header = current => `<a class="skip-link" href="#main">${commonContentKo.skipLink}</a><header class="header"><div class="container header-inner"><a class="logo" href="/" aria-label="${commonContentKo.homeAriaLabel}"><span class="logo-mark" aria-hidden="true"></span><span>OLM</span></a><button class="menu-button" id="menu-open" aria-controls="primary-nav" aria-expanded="false"><span></span><span></span><span></span><span class="sr-only">${commonContentKo.menu.open}</span></button><nav class="nav" id="primary-nav" aria-label="${commonContentKo.menu.ariaLabel}"><button class="menu-close" id="menu-close" aria-label="${commonContentKo.menu.close}">✕</button>${commonContentKo.navigation.map(item=>`<a href="${item.href}"${current===item.id?' aria-current="page"':''}>${item.label}</a>`).join("")}${renderLanguageSwitcher(commonContentKo.languageSwitcher)}</nav></div></header>`;
const f = commonContentKo.footer;
const footer = `<footer class="footer"><div class="container"><div class="footer-top"><a class="logo" href="/"><span class="logo-mark" aria-hidden="true"></span><span>${f.wordmark}</span></a><div class="footer-info"><span><b>${f.companyLabel}</b> ${f.companyName}</span><span><b>${f.emailLabel}</b> ${f.email}</span><span><b>${f.phoneLabel}</b> ${f.phone}</span><span><b>${f.addressLabel}</b> ${f.address}</span></div></div><div class="footer-bottom">${f.copyright} &nbsp; <a href="/contact/">${f.contactLabel}</a></div></div></footer>`;
const organizationSchema = JSON.stringify({"@context":"https://schema.org","@type":"Organization","name":commonContentKo.organization.name,"description":commonContentKo.organization.description,"url":commonContentKo.siteUrl,"email":commonContentKo.organization.email});
const layout = (id, body, schema="") => { const metadata=createMetadata({common:commonContentKo,id,pathname:pathOf(id),pageMeta:pageMetaKo,imagePath:image("commonOg").src}); return `<!doctype html><html lang="${metadata.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${renderMetadata(metadata)}<link rel="icon" href="${image("favicon").src}" type="image/svg+xml"><link rel="stylesheet" href="/assets/css/style.css"><script type="application/ld+json">${schema||organizationSchema}</script></head><body>${header(id)}<main id="main">${body}</main>${footer}<script src="/assets/data/site-data.js"></script><script src="/assets/js/main.js"></script></body></html>`};
const pageHero=(eyebrow,title,lead)=>`<section class="page-hero"><div class="container"><div class="breadcrumb"><a href="/">${commonContentKo.breadcrumb.home}</a> / ${eyebrow}</div><span class="eyebrow">${eyebrow}</span><h1 class="display">${title}</h1><p class="lead">${lead}</p></div></section>`;
const breadcrumbSchema = id => JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":commonContentKo.breadcrumb.home,"item":commonContentKo.siteUrl+"/"},{"@type":"ListItem","position":2,"name":commonContentKo.breadcrumb.brands,"item":commonContentKo.siteUrl+"/brands/"},{"@type":"ListItem","position":3,"name":id === "ludwik" ? "Ludwik":"BIOstar","item":commonContentKo.siteUrl+`/brands/${id}/`} ]});
const pages={home:homeContentKo({imageTag}),about:aboutContentKo({pageHero}),brands:brandsContentKo({imageTag,pageHero}),ludwik:ludwikContentKo({imageTag}),biostar:biostarContentKo({imageTag}),business:businessContentKo({pageHero}),partnership:partnershipContentKo({pageHero}),contact:contactContentKo({pageHero})};
for (const [id,body] of Object.entries(pages)) {
  const folder = id === "home" ? root : id === "ludwik" || id === "biostar" ? new URL(`brands/${id}/`,root) : new URL(`${id}/`,root);
  await mkdir(folder,{recursive:true});
  await writeFile(new URL("index.html",folder),layout(id,body,["ludwik","biostar"].includes(id)?breadcrumbSchema(id):""));
}

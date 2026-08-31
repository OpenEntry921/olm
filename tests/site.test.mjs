import test from "node:test";
import assert from "node:assert/strict";
import {readFile,access,readdir} from "node:fs/promises";
import {spawnSync} from "node:child_process";

const root=new URL("../",import.meta.url);
const pages=["index.html","about/index.html","brands/index.html","brands/ludwik/index.html","brands/biostar/index.html","business/index.html","partnership/index.html","contact/index.html"];
const logoPath="/docs/source-images/ChatGPT Image 2026년 8월 22일 오후 01_09_56.png";
const landingName="랜딩페이지이미지.png";

const build=spawnSync(process.execPath,[new URL("../scripts/build.mjs",import.meta.url).pathname],{stdio:"inherit"});
assert.equal(build.status,0,"fixture build must succeed");

test("all routes exist",async()=>{for(const p of pages)await access(new URL(p,root))});
test("local absolute links resolve",async()=>{for(const p of pages){const html=await readFile(new URL(p,root),"utf8");for(const [,href] of html.matchAll(/href="(\/[^"]*)"/g)){const clean=href.split("#")[0].split("?")[0];if(!clean||clean==="/"){await access(new URL("index.html",root));continue}if(clean.includes("."))await access(new URL(clean.slice(1),root));else await access(new URL(`${clean.slice(1)}index.html`,root));}}});
test("images have dimensions and alt",async()=>{for(const p of pages){const html=await readFile(new URL(p,root),"utf8");for(const [tag] of html.matchAll(/<img\b[^>]*>/g)){assert.match(tag,/alt="[^"]*"/);assert.match(tag,/width="\d+"/);assert.match(tag,/height="\d+"/)}}});
test("rendered pages use the original image logo",async()=>{for(const p of pages){const html=await readFile(new URL(p,root),"utf8");assert.doesNotMatch(html,/OREUM|<span>OLM<\/span>|olm_logo\.png/);const expected=`<a class="logo" href="/"><img src="${logoPath}" width="320" height="120" alt="오름인터내셔널 OLM"></a>`;assert.match(html,new RegExp(`<header[^>]*>[\\s\\S]*?${expected.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}`));assert.match(html,new RegExp(`<footer[^>]*>[\\s\\S]*?${expected.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}`));}});
test("mobile header keeps the image logo visible",async()=>{const html=await readFile(new URL("index.html",root),"utf8");assert.match(html,/<div class="container header-inner"><a class="logo"[^>]*><img[^>]+alt="오름인터내셔널 OLM"[^>]*><\/a><button class="menu-button"/);const css=await readFile(new URL("assets/css/style.css",root),"utf8");assert.match(css,/@media\(max-width:800px\)\{\.logo\{/)});
test("hero uses the sharp original landing PNG and reduced motion",async()=>{const html=await readFile(new URL("index.html",root),"utf8");assert.match(html,/class="hero-background"/);const css=await readFile(new URL("assets/css/style.css",root),"utf8");assert.ok(css.includes(`/docs/source-images/${landingName}`));const backgroundRule=css.match(/\.hero-background\{([^}]*)\}/)?.[1]??"";assert.doesNotMatch(backgroundRule,/(?:backdrop-)?filter\s*:\s*blur\(/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);assert.match(css,/\.hero-background\{animation:none/)});
test("hero CTAs keep valid links and the retailer CTA has readable colors",async()=>{const html=await readFile(new URL("index.html",root),"utf8");assert.match(html,/<a class="btn btn-primary" href="\/brands\/">브랜드 살펴보기<\/a>/);assert.match(html,/<a class="btn btn-light" href="#retailers">공식 판매처 보기<\/a>/);const css=await readFile(new URL("assets/css/style.css",root),"utf8");const retailerRule=css.match(/\.hero \.btn-light\{([^}]*)\}/)?.[1]??"";assert.match(retailerRule,/background:#fff/);assert.match(retailerRule,/color:#0b2239/);assert.match(css,/\.hero \.btn-light:focus-visible\{outline:3px solid #ffc857/)});
test("build copies only the two requested source PNGs",async()=>{const names=await readdir(new URL("dist/docs/source-images/",root));assert.deepEqual(names.sort(),[logoPath.split("/").at(-1),landingName].sort())});
test("only Korean locale SEO is published",async()=>{for(const p of pages){const html=await readFile(new URL(p,root),"utf8");assert.match(html,/<html lang="ko">/);assert.match(html,/property="og:locale" content="ko_KR"/);assert.doesNotMatch(html,/hreflang=|lang="en"|https:\/\/example\.com\/en\//)}await assert.rejects(access(new URL("en/index.html",root)))});
test("sitemap contains no unpublished English routes",async()=>{const sitemap=await readFile(new URL("sitemap.xml",root),"utf8");assert.doesNotMatch(sitemap,/\/en\//)});

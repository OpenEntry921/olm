import { cp, mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const root = new URL("../", import.meta.url);
const generated = spawnSync(process.execPath,[new URL("generate.mjs",import.meta.url).pathname],{stdio:"inherit"});
if(generated.status) process.exit(generated.status);
const dist=new URL("dist/",root); await rm(dist,{recursive:true,force:true}); await mkdir(dist);
for(const name of ["index.html","about","brands","business","partnership","contact","assets","robots.txt","sitemap.xml"]){await cp(new URL(name,root),new URL(name,dist),{recursive:true});}
const sourceImages = [
  "ChatGPT Image 2026년 8월 22일 오후 01_09_56.png",
  "랜딩페이지이미지.png",
  "Ludwik-logo.png",
  "ChatGPT Image 2026년 8월 22일 오후 01_55_15 (5).png",
  "ChatGPT Image 2026년 8월 22일 오후 01_55_15 (6).png",
  "ChatGPT Image 2026년 8월 22일 오후 02_10_04.png",
  "ChatGPT Image 2026년 8월 22일 오후 02_15_58.png"
];
const sourceImageDist = new URL("docs/source-images/",dist);
await mkdir(sourceImageDist,{recursive:true});
for(const name of sourceImages){await cp(new URL(`docs/source-images/${name}`,root),new URL(name,sourceImageDist));}
console.log("Static build created: dist/");

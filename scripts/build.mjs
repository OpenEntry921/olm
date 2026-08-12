import { cp, mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const root = new URL("../", import.meta.url);
const generated = spawnSync(process.execPath,[new URL("generate.mjs",import.meta.url).pathname],{stdio:"inherit"});
if(generated.status) process.exit(generated.status);
const dist=new URL("dist/",root); await rm(dist,{recursive:true,force:true}); await mkdir(dist);
for(const name of ["index.html","about","brands","business","partnership","contact","assets","robots.txt","sitemap.xml"]){await cp(new URL(name,root),new URL(name,dist),{recursive:true});}
console.log("Static build created: dist/");

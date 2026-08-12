import { readFile } from "node:fs/promises"; import { spawnSync } from "node:child_process";
const generated=spawnSync(process.execPath,[new URL("generate.mjs",import.meta.url).pathname],{stdio:"inherit"}); if(generated.status)process.exit(generated.status);
const files=["index.html","about/index.html","brands/index.html","brands/ludwik/index.html","brands/biostar/index.html","business/index.html","partnership/index.html","contact/index.html"];
const banned=["프로바이오틱스","3일간 지속","표면에 정착","99% 천연"];
for(const file of files){const s=await readFile(new URL(`../${file}`,import.meta.url),"utf8");for(const token of ["<title>","meta name=\"description\"","rel=\"canonical\"","<h1","og:title"]){if(!s.includes(token))throw new Error(`${file}: missing ${token}`)}for(const token of banned){if(s.includes(token))throw new Error(`${file}: prohibited phrase ${token}`)}}
console.log(`Validated ${files.length} pages: metadata, headings, content rules`);

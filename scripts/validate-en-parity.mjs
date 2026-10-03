import { readdir, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const directories = async path => (await readdir(new URL(path, root), { withFileTypes: true }))
  .filter(entry => entry.isDirectory())
  .map(entry => `${path}${entry.name}/`);

const routes = [
  "", "about/", "brands/", "brands/biostar/", "brands/ludwik/", "business/",
  "partnership/", "ai-clean-care/", "contact/",
  ...await directories("brands/biostar/"),
  ...await directories("brands/ludwik/")
];

const structuralSignature = html => {
  const body = html.match(/<body>([\s\S]*?)<\/body>/)?.[1];
  if (!body) throw new Error("Document has no body");
  return [...body.matchAll(/<(\/?)([a-z][\w-]*)([^>]*)>/gi)].map(match => {
    if (match[1]) return `/${match[2]}`;
    const attributes = match[3];
    const className = attributes.match(/class="([^"]*)"/)?.[1] ?? "";
    const imageSource = match[2] === "img" ? attributes.match(/src="([^"]*)"/)?.[1] ?? "" : "";
    const inlineStyle = attributes.match(/style="([^"]*)"/)?.[1] ?? "";
    return `${match[2]}[${className}][${imageSource}][${inlineStyle}]`;
  });
};

for (const route of routes) {
  const [korean, english] = await Promise.all([
    readFile(new URL(`${route}index.html`, root), "utf8"),
    readFile(new URL(`en/${route}index.html`, root), "utf8")
  ]);
  const ko = structuralSignature(korean);
  const en = structuralSignature(english);
  const mismatch = ko.findIndex((token, index) => token !== en[index]);
  if (ko.length !== en.length || mismatch !== -1) {
    const index = mismatch === -1 ? Math.min(ko.length, en.length) : mismatch;
    throw new Error(`KO/EN structural mismatch at /${route} (token ${index}: ${ko[index]} !== ${en[index]})`);
  }
}

console.log(`Validated KO/EN structure, classes, image assets and inline backgrounds for ${routes.length} page pairs`);

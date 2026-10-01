import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const master = JSON.parse(await readFile(new URL("assets/data/product-master.json", root), "utf8"));
const approved = master.products.filter(product => product.approvalStatus === "approved");
const route = product => `/products/${product.brandSlug}/${product.slug}/`;

test("product master covers both brands without unverified commerce fields", () => {
  assert.equal(approved.filter(product => product.brand === "BIOstar").length, 9);
  assert.equal(approved.filter(product => product.brand === "Ludwik").length, 4);
  for (const product of approved) {
    for (const field of ["id", "slug", "brand", "brandSlug", "name", "category", "purpose", "description", "volume", "images", "source", "lastReviewedAt"])
      assert.ok(product[field], `${product.id} missing ${field}`);
    assert.equal(product.price, undefined);
    assert.equal(product.stock, undefined);
    assert.equal(product.rating, undefined);
  }
});

test("every knowledge page is static, self-canonical, structured and discoverable", async () => {
  const sitemap = await readFile(new URL("sitemap.xml", root), "utf8");
  const llms = await readFile(new URL("llms.txt", root), "utf8");
  for (const product of approved) {
    const pathname = route(product);
    const file = new URL(`${pathname.slice(1)}index.html`, root);
    await access(file);
    const html = await readFile(file, "utf8");
    assert.ok(html.includes(product.name));
    assert.ok(html.includes(product.brand));
    assert.ok(html.includes(product.purpose));
    assert.match(html, new RegExp(`rel="canonical" href="https://olm\\.kr${pathname}"`));
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
    const schema = data["@graph"].find(node => node["@type"] === "Product");
    assert.equal(schema.name, product.name);
    assert.equal(schema.description, product.description);
    assert.equal(schema.url, `https://olm.kr${pathname}`);
    assert.equal(schema.offers, undefined);
    assert.equal(schema.aggregateRating, undefined);
    assert.equal(schema.review, undefined);
    assert.ok(sitemap.includes(`https://olm.kr${pathname}`));
    assert.ok(llms.includes(`https://olm.kr${pathname}`));
    assert.match(html, new RegExp(`href="/brands/${product.brandSlug}/"`));
  }
});

test("brand pages expose ordinary links and legacy BIOstar URLs remain built", async () => {
  for (const brandSlug of ["biostar", "ludwik"]) {
    const html = await readFile(new URL(`brands/${brandSlug}/index.html`, root), "utf8");
    for (const product of approved.filter(item => item.brandSlug === brandSlug))
      assert.match(html, new RegExp(`href="${route(product)}"`));
  }
  for (const product of approved.filter(item => item.brandSlug === "biostar"))
    await access(new URL(`products/biostar-${product.slug}/index.html`, root));
});

test("product indexes expose both brands and all static product links", async () => {
  for (const pathname of ["products/index.html", "products/biostar/index.html", "products/ludwik/index.html"])
    await access(new URL(pathname, root));
  const index = await readFile(new URL("products/index.html", root), "utf8");
  for (const product of approved) assert.match(index, new RegExp(`href="${route(product)}"`));
});

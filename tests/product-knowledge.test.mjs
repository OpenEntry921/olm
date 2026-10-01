import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const master = JSON.parse(await readFile(new URL("assets/data/product-master.json", root), "utf8"));
const approved = master.products.filter(product => product.approvalStatus === "approved");
const route = product => `/products/${product.brandSlug}/${product.slug}/`;
const primaryRoute = product => `/brands/${product.brandSlug}/${product.brandSlug === "ludwik" ? product.slug.replace(/-\d+(?:-\d+)?(?:pcs|kg)$/, "") : product.slug}/`;

test("product master covers both brands without unverified commerce fields", () => {
  assert.equal(approved.filter(product => product.brand === "BIOstar").length, 9);
  assert.equal(approved.filter(product => product.brand === "Ludwik").length, 4);
  for (const product of approved) {
    for (const field of ["id", "slug", "brand", "brandSlug", "name", "category", "purpose", "description", "volume", "images", "source", "lastReviewedAt", "countryOfOrigin"])
      assert.ok(product[field], `${product.id} missing ${field}`);
    assert.ok(product.source.every(source => source.sourceUrl && source.sourceType && source.lastVerifiedAt));
    assert.equal(product.price, undefined);
    assert.equal(product.stock, undefined);
    assert.equal(product.rating, undefined);
  }
});

test("every legacy knowledge page points to its representative brand URL", async () => {
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
    const primary = primaryRoute(product);
    assert.match(html, new RegExp(`rel="canonical" href="https://olm\\.kr${primary}"`));
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
    const schema = data["@graph"].find(node => node["@type"] === "Product");
    assert.equal(schema.name, product.name);
    assert.equal(schema.description, product.description);
    assert.equal(schema.url, `https://olm.kr${primary}`);
    assert.equal(schema.countryOfOrigin.name, "폴란드");
    assert.equal(schema.offers, undefined);
    assert.equal(schema.aggregateRating, undefined);
    assert.equal(schema.review, undefined);
    assert.ok(sitemap.includes(`https://olm.kr${primary}`));
    assert.ok(llms.includes(`https://olm.kr${primary}`));
    assert.ok(!sitemap.includes(`https://olm.kr${pathname}`));
    assert.ok(!llms.includes(`https://olm.kr${pathname}`));
    assert.match(html, new RegExp(`href="/brands/${product.brandSlug}/"`));
  }
});

test("natural-origin percentages and ingredient-only 100% claims remain product-specific", async () => {
  const dishLiquid = approved.find(product => product.id === "biostar-dishwashing-liquid");
  const dishwasher = approved.find(product => product.id === "biostar-dishwasher-tablets");
  assert.equal(dishLiquid.additionalProperty.find(property => property.name === "천연 유래 성분 비율").value, "97%");
  assert.match(dishLiquid.factualQna[0].answer, /100%.*아니며.*97%/);
  assert.match(dishwasher.additionalProperty.find(property => property.name === "원료 특징").value, /100% 천연 유래 소다.*제품 전체 비율 아님/);
  assert.match(dishwasher.factualQna[0].answer, /제품 전체의 천연 유래 성분 비율을 뜻하지 않습니다/);
  const liquidHtml = await readFile(new URL(`${route(dishLiquid).slice(1)}index.html`, root), "utf8");
  assert.match(liquidHtml, /EU Ecolabel PL\/019\/009/);
  assert.match(liquidHtml, /BIOstar 공식 제조사 웹사이트/);
});

test("brand pages expose ordinary links and legacy BIOstar URLs remain built", async () => {
  for (const brandSlug of ["biostar", "ludwik"]) {
    const html = await readFile(new URL(`brands/${brandSlug}/index.html`, root), "utf8");
    const products = approved.filter(item => item.brandSlug === brandSlug);
    const brandRoutes = new Set(products.map(product => brandSlug === "ludwik"
      ? `/brands/ludwik/${product.slug.replace(/-\d+(?:-\d+)?(?:pcs|kg)$/, "")}/`
      : `/brands/biostar/${product.slug}/`));
    for (const pathname of brandRoutes) {
      assert.match(html, new RegExp(`href="${pathname}"`));
      const productHtml = await readFile(new URL(`${pathname.slice(1)}index.html`, root), "utf8");
      assert.match(productHtml, new RegExp(`rel="canonical" href="https://olm\\.kr${pathname}"`));
      const data = JSON.parse(productHtml.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
      assert.equal(data["@graph"].find(node => node["@type"] === "Product").url, `https://olm.kr${pathname}`);
    }
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

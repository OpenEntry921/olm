export function createMetadata({ common, id, pathname, pageMeta, imagePath }) {
  const [title, description] = pageMeta[id];
  const canonical = new URL(pathname, common.siteUrl).href;
  return { lang: common.locale, title, description, canonical, openGraph: { title, description, locale: common.openGraphLocale, url: canonical, image: new URL(imagePath, common.siteUrl).href } };
}

export function renderMetadata(metadata) {
  return `<title>${metadata.title}</title><meta name="description" content="${metadata.description}"><link rel="canonical" href="${metadata.canonical}"><meta property="og:type" content="website"><meta property="og:locale" content="${metadata.openGraph.locale}"><meta property="og:title" content="${metadata.openGraph.title}"><meta property="og:description" content="${metadata.openGraph.description}"><meta property="og:image" content="${metadata.openGraph.image}"><meta property="og:url" content="${metadata.openGraph.url}"><meta name="twitter:card" content="summary_large_image">`;
}

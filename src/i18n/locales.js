export const locales = {
  ko: { lang: "ko", pathPrefix: "", openGraphLocale: "ko_KR" },
  // Add `en` only when the complete English site is approved and published.
};

export const defaultLocale = "ko";

export function localizedPath(path, locale = defaultLocale) {
  const config = locales[locale];
  if (!config) throw new Error(`Unavailable locale: ${locale}`);
  return `${config.pathPrefix}${path}` || "/";
}

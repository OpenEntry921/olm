export const locales = {
  ko: { lang: "ko", pathPrefix: "", openGraphLocale: "ko_KR" },
  en: { lang: "en", pathPrefix: "/en", openGraphLocale: "en_US" },
};

export const defaultLocale = "ko";

export function localizedPath(path, locale = defaultLocale) {
  const config = locales[locale];
  if (!config) throw new Error(`Unavailable locale: ${locale}`);
  return `${config.pathPrefix}${path}` || "/";
}

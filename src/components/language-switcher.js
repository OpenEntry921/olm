/**
 * Reserved language-switcher rendering point. It intentionally emits nothing
 * while Korean is the only published locale, avoiding an inaccessible dead EN link.
 */
export function renderLanguageSwitcher({ enabledLocales }) {
  if (enabledLocales.length < 2) return "";
  return `<div class="language-switcher"></div>`;
}

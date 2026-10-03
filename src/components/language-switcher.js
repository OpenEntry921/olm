export function renderLanguageSwitcher({ currentLocale, koreanPath = "/", englishPath = "/en/" }) {
  return `<div class="language-switcher" aria-label="Language"><a href="${koreanPath}" lang="ko"${currentLocale === "ko" ? ' aria-current="page"' : ""}>KR</a><span aria-hidden="true">/</span><a href="${englishPath}" lang="en"${currentLocale === "en" ? ' aria-current="page"' : ""}>EN</a></div>`;
}

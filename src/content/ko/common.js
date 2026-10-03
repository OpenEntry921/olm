/** @typedef {{ title: string, description: string, openGraph: { title: string, description: string } }} PageMeta */

export const companyInfoKo = {
  name: "주식회사 오름인터내셔널",
  alternateName: "OLM International Corp.",
  email: "khs@olm.kr",
  emailHref: "mailto:khs@olm.kr",
  phone: "070-8779-9669",
  phoneHref: "tel:07087799669",
  address: "경기도 수원시 팔달구 효원로249번길 46-15, 5층 85호"
};

export const commonContentKo = {
  locale: "ko",
  openGraphLocale: "ko_KR",
  siteUrl: "https://olm.kr/",
  skipLink: "본문 바로가기",
  homeAriaLabel: "오름인터내셔널 홈",
  menu: { open: "메뉴 열기", close: "메뉴 닫기", ariaLabel: "주요 메뉴" },
  navigation: [
    { label: "회사소개", id: "about", href: "/about/" },
    { label: "브랜드", id: "brands", href: "/brands/" },
    { label: "사업영역", id: "business", href: "/business/" },
    { label: "파트너십", id: "partnership", href: "/partnership/" },
    { label: "AI 클린케어", id: "ai-clean-care", href: "/ai-clean-care/" },
    { label: "문의", id: "contact", href: "/contact/" }
  ],
  footer: {
    wordmark: "OLM",
    companyLabel: "회사명", companyName: `${companyInfoKo.name} (${companyInfoKo.alternateName})`,
    emailLabel: "이메일", email: companyInfoKo.email, emailHref: companyInfoKo.emailHref,
    phoneLabel: "대표 연락처", phone: companyInfoKo.phone, phoneHref: companyInfoKo.phoneHref,
    addressLabel: "주소", address: companyInfoKo.address,
    copyright: "© 2026 OLM International Corp. All rights reserved.",
    contactLabel: "문의 안내",
    adminLabel: "관리자"
  },
  breadcrumb: { home: "홈", brands: "브랜드" },
  organization: {
    name: companyInfoKo.name,
    alternateName: companyInfoKo.alternateName,
    description: "유럽 프리미엄 생활용품 브랜드 한국 공식 파트너",
    email: companyInfoKo.email,
    telephone: companyInfoKo.phone,
    address: companyInfoKo.address
  },
  languageSwitcher: { currentLocale: "ko", enabledLocales: ["ko", "en"] }
};

export const pageMetaKo = {
  home: ["오름인터내셔널 | 유럽 프리미엄 생활용품 브랜드 공식 파트너", "Ludwik와 BIOstar의 대한민국 공식 파트너, 오름인터내셔널을 소개합니다."],
  about: ["회사소개 | 오름인터내셔널", "브랜드와 시장을 이해하고 오래가는 성장을 설계하는 오름인터내셔널입니다."],
  brands: ["브랜드 | 오름인터내셔널", "오름인터내셔널의 공식 파트너 브랜드 Ludwik와 BIOstar를 만나보세요."],
  ludwik: ["Ludwik | 1964년부터 이어온 폴란드 홈케어 브랜드", "1964년 폴란드의 주방에서 시작한 Ludwik와 국내에서 만날 수 있는 식기세척기용 태블릿 및 분말 세제를 소개합니다."],
  biostar: ["BIOstar 홈케어 제품 | 오름인터내셔널", "폴란드 INCO 그룹의 BIOstar 주방·욕실·생활 공간별 홈케어 제품 9종을 소개합니다."],
  business: ["사업영역 | 오름인터내셔널", "해외 브랜드 소싱부터 국내 유통과 브랜드 빌딩까지 연결합니다."],
  partnership: ["한국 시장 파트너십 | 오름인터내셔널", "해외 생활용품 브랜드의 성공적인 한국 시장 진출을 함께 설계합니다."],
  contact: ["문의 | 오름인터내셔널", "소비자, 유통·입점, 해외 브랜드 파트너십 문의를 안내합니다."],
  "ai-clean-care": ["AI 클린케어 | 오름인터내셔널", "제품 선택부터 성분, 사용법과 광고 문구 확인까지 근거를 중심으로 안내합니다."]
};

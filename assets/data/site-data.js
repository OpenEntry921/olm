/** 승인 전 교체 항목은 TODO 주석을 유지합니다. */
window.OREUM_DATA = {
  canonicalBase: "https://olm.kr/",
  formEndpoint: "/api/contact",
  company: {
    name: "주식회사 오름인터내셔널",
    legalName: "주식회사 오름인터내셔널",
    email: "khs@olm.kr",
    phone: "070-8779-9669",
    address: "경기도 수원시 팔달구 효원로249번길 46-15, 5층 85호"
  },
  navigation: [
    ["회사소개", "/about/"], ["브랜드", "/brands/"], ["사업영역", "/business/"],
    ["파트너십", "/partnership/"], ["문의", "/contact/"]
  ],
  brands: [
    { id: "ludwik", name: "Ludwik", since: "1964", origin: "Poland", href: "/brands/ludwik/", keywords: ["브랜드 헤리티지", "주방", "세탁", "홈케어"] },
    { id: "biostar", name: "BIOstar", href: "/brands/biostar/", keywords: ["주방 관리", "욕실 관리", "다목적 관리", "식기세척기 관리"] }
  ],
  categories: {
    ludwik: ["주방 세정", "세탁 케어", "홈케어"],
    biostar: ["주방 관리", "욕실 관리", "다목적 관리", "식기세척기 관리"]
  },
  products: [], // FUTURE API: 브랜드 상세 페이지의 검토된 제품 레코드와 동일한 스키마로 연결
  productGuide: { status: "preparing", apiEndpoint: "" }, // FUTURE API: 승인 후 독립 ProductGuide 컴포넌트가 참조
  certifications: [], // TODO: 확인된 제품별 인증 데이터
  retailers: [], // TODO: 공식 판매처명과 URL
  socialLinks: [] // TODO: 공식 소셜 링크
};

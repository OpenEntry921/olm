# 콘텐츠 및 자산 교체 가이드

이 프로젝트는 프레임워크 없이 빌드 스크립트로 HTML을 생성하는 정적 사이트이며, 기존 정적 자산 루트인 `assets/` 아래에서 모든 웹 자산을 관리합니다. 공식 자료가 오기 전까지 가짜 로고나 가짜 제품 이미지는 추가하지 않습니다.

## 디렉터리 분류

- `assets/common/{icons,backgrounds,og}`: 사이트 공통 아이콘, 배경, 공유 이미지
- `assets/olm/{logos,company}`: 오름인터내셔널 로고와 회사 이미지
- `assets/ludwik/{logos,hero,products,heritage,certifications}`: Ludwik 브랜드 자산
- `assets/biostar/{logos,hero,products,ingredients,certifications}`: BIOstar 브랜드 자산

## 현재 플레이스홀더 교체 대응표

| 현재 파일 | 사용 영역 | 공식 자산 권장 파일명 | 데이터 키 |
| --- | --- | --- | --- |
| `assets/common/icons/olm-icon-favicon.svg` | 파비콘 | `olm-icon-favicon.svg` | `favicon` |
| `assets/common/og/olm-og-default.svg` | 전 페이지 OG 공유 이미지 | `olm-og-default-1200x630.webp` | `commonOg` |
| `assets/ludwik/hero/ludwik-hero-placeholder.svg` | 홈·브랜드 목록·Ludwik 히어로 | `ludwik-hero-products-large-front.webp` | `ludwikHero` |
| `assets/biostar/hero/biostar-hero-placeholder.svg` | 홈·브랜드 목록·BIOstar 히어로 | `biostar-hero-products-large-front.webp` | `biostarHero` |
| 위 BIOstar 임시 비주얼 재사용 | BIOstar 성분 소개 | `biostar-ingredients-aloe-lavender-large.webp` | `biostarIngredients` |
| CSS로 표현한 텍스트 로고 | 헤더·푸터 오름 로고 | `olm-logo-primary.svg`, `olm-logo-white.svg` | 새 이미지 키 추가 필요 |

`status`가 `placeholder`인 항목은 승인된 공식 자산으로 교체해야 합니다. 파일 교체 후 HTML을 직접 수정하지 말고 `assets/data/media-data.json`의 경로, 한국어 `alt`, 실제 `width`·`height`, 상태를 갱신한 다음 빌드합니다. 생성기는 이 데이터를 모든 페이지에 반영하며 CSS의 4:3 이미지 영역과 명시적 크기가 로딩 전후 레이아웃을 유지합니다.

## 전달이 필요한 공식 이미지

- 오름인터내셔널: 기본/흰색 로고 SVG, 파비콘용 심볼 SVG, 회사 소개 이미지, 1200×630 OG 이미지
- Ludwik: 기본/흰색 로고 SVG, 대표 히어로 이미지, 국내 공식 취급 제품별 정면 투명 WebP(필요 시 PNG), 헤리티지 이미지, 제품별 확인된 인증 이미지
- BIOstar: 기본/흰색 로고 SVG, 대표 히어로 이미지, 국내 공식 취급 제품별 정면 투명 WebP(필요 시 PNG), 알로에·라벤더 등 공식 성분 이미지, 제품별 확인된 인증 이미지

제품 파일은 `brand-category-feature-size-view.ext` 형식을 따릅니다. 예: `ludwik-dishwashing-liquid-lemon-500ml-front.webp`, `biostar-kitchen-foam-aloe-700ml-front.webp`. 로고는 SVG를 우선하며, 원본 PSD·AI·EPS나 코드에서 사용하지 않는 대용량 파일은 웹 정적 자산 폴더에 넣지 않습니다.

## 함께 갱신할 데이터

- 이미지 경로·크기·한국어 대체 텍스트: `assets/data/media-data.json`
- 국내 취급 제품명·제품별 인증·판매처 및 회사 정보: `assets/data/site-data.js`
- 실제 운영 도메인과 문의 엔드포인트: `assets/data/site-data.js`의 `canonicalBase`, `formEndpoint`

제품을 등록할 때 `media-data.json`의 `products`에 이미지 키, `src`, `alt`, `width`, `height`를 두고, `site-data.js`의 제품 정보에서 해당 이미지 키를 참조합니다. 인증 역시 확인된 제품과의 연결이 있을 때만 두 데이터 파일에 등록합니다.

## Cafe24 배포

`npm run build` 후 `dist/`의 정적 파일을 웹 루트에 업로드합니다. Node.js 런타임은 필요하지 않습니다.

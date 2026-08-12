# 콘텐츠 및 자산 교체 가이드

이 문서는 공식 자료가 전달되기 전까지 사용한 임시 항목과 교체 위치를 기록합니다.

## 교체가 필요한 항목

- `assets/images/`의 브랜드·제품 비주얼: 현재 저작권 문제가 없는 추상 SVG 플레이스홀더입니다.
- `assets/data/site-data.js`의 회사 주소, 대표 전화, 이메일, 판매처 URL, 소셜 링크
- 같은 파일의 국내 취급 제품명, 제품별 인증명과 인증 자료 URL
- `assets/images/og-default.svg`: 최종 공유용 1200×630 이미지
- `assets/images/favicon.svg`: 오름인터내셔널 공식 심볼
- `assets/data/site-data.js`의 `canonicalBase`: 실제 운영 도메인
- `assets/data/site-data.js`의 `formEndpoint`: 문의 수신 시스템 확정 후 HTTPS 엔드포인트

## 이미지 원칙

공식 브랜드/제품 이미지는 로컬 파일로 저장하고 HTML의 `width`, `height`, `alt`를 유지·갱신합니다. 외부 공식 사이트 이미지는 직접 링크하지 않습니다. 제품별 인증은 확인된 자료와 해당 제품의 연결 관계가 있을 때만 등록합니다.

## Cafe24 배포

프로젝트 루트의 정적 파일(`index.html`, 각 페이지 폴더, `assets`, `robots.txt`, `sitemap.xml`)을 웹 루트에 업로드합니다. Node.js 런타임은 필요하지 않습니다.

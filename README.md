# 오름인터내셔널 웹사이트

Cafe24 일반 웹호스팅용 정적 멀티페이지 사이트입니다.

```bash
npm install
npm run dev       # http://localhost:4173
npm run lint
npm run typecheck
npm test
npm run build     # dist/ 생성
```

배포 시 `dist/` 안의 내용 전체를 Cafe24 웹 루트에 업로드합니다. 실제 콘텐츠와 자산 교체 위치는 [`docs/content-replacement-guide.md`](docs/content-replacement-guide.md)를 확인합니다.

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

## AI 클린케어 서버 설정

정적 페이지는 `/ai-clean-care/`에 배포되며 API 키는 포함하지 않습니다. Netlify Functions 또는 동등한 서버에서 `netlify/functions/`를 배포하고 다음 환경변수를 비밀 저장소에 설정합니다.

| 변수 | 용도 |
| --- | --- |
| `AI_PROVIDER` | `demo`(기본), `anthropic`, `openai` |
| `AI_MODEL` | 공급자 모델명 |
| `ANTHROPIC_API_KEY` | Anthropic 선택 시 서버 전용 키 |
| `OPENAI_API_KEY` | OpenAI 선택 시 서버 전용 키 |
| `ADMIN_SESSION_SECRET` | 관리자 세션 HMAC 비밀값(충분히 긴 무작위 값) |
| `ADMIN_PASSWORD_SALT` | 관리자 비밀번호 scrypt salt |
| `ADMIN_PASSWORD_HASH` | `scrypt(password, salt, 32)`의 hex 결과 |

외부 공급자 호출은 배포 대상과 모델을 승인한 뒤 각 어댑터에 연결해야 합니다. 현재 `demo` 어댑터는 승인 상태가 `approved`인 로컬 지식만 사용하며, 관리자 설정은 서버 저장소 연결 전 프로세스 메모리에만 유지됩니다. 운영 배포 전 영속 설정·감사 로그 저장소와 기존 사내 인증 연동을 구성하세요. Cafe24 정적 호스팅을 유지하는 경우 `/api/*`는 별도의 HTTPS 서버리스 백엔드로 프록시해야 합니다.

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

배포 시 `dist/` 안의 내용 전체를 웹 루트에 업로드합니다. 실제 콘텐츠와 자산 교체 위치는 [`docs/content-replacement-guide.md`](docs/content-replacement-guide.md)를 확인합니다.

## AI 클린케어와 관리자 설정

사용자 화면은 `/ai-clean-care/`, 관리자 화면은 `/admin/ai-clean-care/`입니다. 관리자 API와 공급자 키는 브라우저 번들에 포함하지 않고 Netlify Functions에서만 사용합니다.

### Netlify 환경변수

| 구분 | 변수 | 용도 |
| --- | --- | --- |
| 필수 | `ADMIN_DEMO_PIN` | 관리자 로그인 PIN |
| 필수 | `My_App_Key` | AI 클린케어 OpenAI API 연결 |

`ADMIN_SESSION_SECRET`, `ADMIN_PASSWORD_SALT`, `ADMIN_PASSWORD_HASH`, `AI_PROVIDER`, `AI_MODEL`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODELS`, `OPENAI_MODELS`는 더 이상 필요하지 않습니다. 관리자 PIN과 API 키는 Netlify Function에서만 읽고, API 키 상태는 `설정됨` 또는 `설정되지 않음`으로만 제공합니다.

Netlify의 **Site configuration → Environment variables**에 위 두 값을 등록한 뒤 반드시 새로 배포합니다. AI 공급자는 OpenAI로 고정되며 모델은 서버 코드의 허용 목록에서만 선택됩니다. OpenAI 요청에는 15초 시간 제한, 안전한 오류 분류, 구조화 JSON 검증을 적용합니다.

> 관리자에서 선택한 모델은 **함수 프로세스 메모리에서만 유지**되며 함수 재시작 또는 재배포 시 서버 기본 모델로 돌아갑니다. 질문과 답변을 사이트의 데이터베이스, 파일 또는 브라우저 영구 저장소에 저장하지 않습니다. 다만 OpenAI와 Netlify에는 각 서비스의 운영·보안 로그 및 데이터 처리 정책이 적용될 수 있습니다. Cafe24 정적 호스팅을 유지하는 경우 `/api/*`를 Netlify Functions 또는 별도 HTTPS 백엔드로 프록시해야 합니다.

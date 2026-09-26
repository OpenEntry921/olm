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
| 필수 | `ADMIN_SESSION_SECRET` | 관리자 세션 서명용 비밀값 |
| 필수 | `ADMIN_PASSWORD_SALT` | 관리자 비밀번호 scrypt salt |
| 필수 | `ADMIN_PASSWORD_HASH` | `scrypt(password, salt, 32)`의 hex 결과 |
| 필수 | `AI_PROVIDER` | `demo`, `anthropic`, `openai` 중 기본 공급자 |
| 필수 | `AI_MODEL` | 기본 공급자의 정확한 모델명 |
| 선택 | `ANTHROPIC_API_KEY` | Claude 서버 전용 API 키 |
| 선택 | `OPENAI_API_KEY` | OpenAI 서버 전용 API 키 |
| 선택 | `ANTHROPIC_MODELS` | 관리자에서 허용할 Claude 모델명(쉼표 구분) |
| 선택 | `OPENAI_MODELS` | 관리자에서 허용할 OpenAI 모델명(쉼표 구분) |

모델명은 공급자의 최신 콘솔과 계약에서 실제 사용할 수 있는 값을 확인해 설정합니다. 코드가 임의의 외부 모델을 기본값으로 가정하지 않으며, `AI_MODEL`은 각 공급자의 허용 목록이 별도로 없을 때 사용됩니다. 키 원문은 환경변수에서만 읽고 관리자 API에는 설정 여부와 끝 4자리만 반환합니다.

관리자 비밀번호 salt/hash는 로컬 대화형 터미널에서 다음 명령으로 생성합니다. 입력은 화면에 나타나지 않고 원문을 출력하거나 파일에 저장하지 않습니다.

```bash
npm run admin:hash-password
```

출력된 두 값만 Netlify 환경변수에 등록합니다. 세션 비밀값은 비밀번호와 별개로 충분히 긴 무작위 값으로 만듭니다.

```bash
openssl rand -hex 32 # 출력값을 ADMIN_SESSION_SECRET에 등록
```

Netlify의 Site configuration → Environment variables에 값을 등록한 뒤 재배포합니다. Claude와 OpenAI 어댑터는 표준 서버 `fetch`로 공급자 API에 요청하며 15초 시간 제한, 안전한 오류 분류, 구조화 JSON 검증을 적용합니다.

> 현재 관리자에서 변경한 공급자/모델은 **함수 프로세스 메모리에서만 유지**됩니다. 함수 재시작 또는 재배포 시 `AI_PROVIDER`와 `AI_MODEL`로 돌아갑니다. 다중 인스턴스 운영 전에 영구 설정·감사 로그 저장소를 연결해야 합니다. Cafe24 정적 호스팅을 유지하는 경우 `/api/*`를 Netlify Functions 또는 별도 HTTPS 백엔드로 프록시해야 합니다.

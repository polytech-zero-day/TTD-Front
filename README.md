# TTD-Front

**TTD(Text To Develop)** — "코드를 직접 짜는 능력"이 아니라 **AI에게 원하는 결과물을 정확히 지시하고 검증하는 능력**을 진단하는 플랫폼의 프론트엔드입니다.

응시자는 문제를 읽고 **프롬프트를 작성**해 LLM과 대화하며 산출물을 만들어 제출하고, 루브릭 채점 결과·리더보드·리포트를 확인합니다.

---

## 기술 스택

| 구분 | 사용 기술 |
|---|---|
| Language | TypeScript 6 |
| UI | React 19, Tailwind CSS 4 |
| 빌드 | Vite 8 |
| 라우팅 | React Router 7 |
| 결제 | PortOne Browser SDK (V2) |
| 에디터/마크다운 | `@uiw/react-textarea-code-editor`, `react-markdown` + `remark-gfm` + `rehype-highlight` |
| 레이아웃/UX | `react-resizable-panels`, `react-textarea-autosize`, `sonner`(토스트), `react-spinners` |
| 테스트 | Vitest + Testing Library(단위/훅), Playwright(E2E) |
| 품질 | ESLint, Prettier |

---

## 주요 기능

- **문제 카탈로그/상세** — 공개 조회. 난이도·유형 필터.
- **응시(Attempt)** — 좌측 문제·우측 프롬프트 대화 분할 패널. LLM과 프롬프트를 주고받으며 산출물 작성, 초안 저장 후 제출.
- **결과(Result)** — 정확성·효율성 점수, 채점 근거, 산출물 확인.
- **리더보드** — 공개 점수 랭킹.
- **마이페이지** — 내 응시 이력·통계·구독 상태.
- **요금제/결제** — 무료(FREE)/유료(PAID) 요금제 비교, PortOne 구독 결제. 유료 혜택: 상위 AI 모델 응시, 응시 무제한, 프롬프트 무제한.
- **관리자** — 대시보드, 회원·문제 관리, AI 모델 설정, 캘리브레이션 뷰.
- **인증 가드** — 공개 라우트(카탈로그·상세·리더보드·요금제)와 보호 라우트(응시·결제·마이페이지·관리자)를 `ProtectedRoute`로 분리. 관리자 전용은 `requireAdmin`.

---

## 프로젝트 구조

```
src
├── components
│   ├── ui             # 공통 UI 컴포넌트
│   └── feature        # 도메인별 (admin / attempt / auth / pricing / result)
├── pages              # 라우트 페이지
│   └── admin          # 관리자 페이지
├── hooks              # 커스텀 훅
├── lib
│   ├── api            # 백엔드 API 클라이언트
│   ├── auth           # 세션·ProtectedRoute
│   ├── payment        # PortOne 연동
│   └── subscription   # 구독 상태
├── data               # 정적 데이터(요금제 등)
├── types              # 공유 타입
└── styles             # 전역 스타일
```

경로 별칭 `@/` → `src/`.

---

## 라우트

| 구분 | 경로 |
|---|---|
| 공개 | `/login`, `/signup`, `/`, `/problems`, `/problems/:id`, `/leaderboard`, `/pricing` |
| 보호(로그인) | `/problems/:id/attempt`, `/result/:attemptId`, `/mypage`, `/payment`, `/payment/complete` |
| 관리자 | `/admin` (index=대시보드), `/admin/users`, `/admin/problems`, `/admin/ai-models`, `/admin/calibration` |

---

## 로컬 실행

### 사전 준비
- Node.js 22+
- 실행 중인 [TTD-Backend](../TTD-Backend) (기본 `http://localhost:8080`)

### 실행
```bash
npm install
npm run dev        # http://localhost:5173
```

> PortOne 등 공개 키가 필요한 경우 `.env.local`에 `VITE_` 접두사 변수로 설정합니다. (시크릿은 프론트에 두지 않고 백엔드에서만 관리)

---

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입체크(`tsc -b`) + 프로덕션 빌드 |
| `npm run lint` | ESLint |
| `npm run format:check` / `format` | Prettier 검사 / 자동 정렬 |
| `npm test` | Vitest 단위·훅 테스트 |
| `npm run test:e2e` | Playwright E2E |

---

## 테스트 & CI

- **단위/훅**: Vitest + Testing Library (`vite.config.ts`에서 `e2e/**` 제외).
- **E2E**: Playwright(chromium). `playwright.config.ts`가 dev 서버를 자동 기동(127.0.0.1:4173)합니다.
- **CI**: `develop` 대상 push·PR에서 GitHub Actions가 `quality`(lint · format:check · build · vitest) → `e2e`(Playwright) 순으로 검증합니다. (`.github/workflows/ci.yml`)

---

## 팀

폴리텍 웹개발 프로젝트 — TTD(Text To Develop)

| 파트 | 담당 | 영역 |
|---|---|---|
| A | 윤여훈 | 문제 도메인 |
| B | 고윤 | 백오피스 · 인증 · 결제 |
| C | 한성민 | 응시 · 실행 · 채점 |
| D | 차윤희 | 리포트 · 리더보드 |

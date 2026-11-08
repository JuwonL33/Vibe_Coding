# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 제목

TaskFlow

## 프로젝트 개요

React(Vite) 프론트엔드와 Hono 백엔드로 이루어진 풀스택 웹 애플리케이션입니다. 백엔드는 Drizzle ORM으로 SQLite 데이터베이스를 다루고 Zod로 API 입출력을 검증하며, 프론트엔드는 이 API를 호출합니다. 테스트는 Vitest(단위/통합)와 Playwright(E2E)로 구성됩니다.

<!-- TODO: 앱의 목적, 주요 사용자, 핵심 기능을 여기에 적어 주세요. -->

## 프로젝트 상태

이 저장소는 아직 코드가 없는 초기 상태이며, git 저장소도 아닙니다. 프론트엔드·백엔드·테스트 스택은 정해졌습니다(아래 참고). 패키지 매니저, 백엔드 런타임, SQLite 드라이버, 린트 도구는 아직 정해지지 않았습니다. 임의로 가정하지 말고 사용자에게 물어보세요.

## 디렉터리 구성

최상위 디렉터리는 현재 비어 있으며, 다음 용도로 사용할 예정입니다.

- `frontend/` — 클라이언트 애플리케이션
- `backend/` — 서버 / API
- `e2e/` — 프론트엔드와 백엔드를 함께 검증하는 E2E 테스트

## 프론트엔드 스택

- **React** — UI
- **Vite** — 개발 서버 및 빌드
- **Tailwind CSS** — 스타일링

## 백엔드 스택

- **Hono** — HTTP 프레임워크 / 라우팅
- **Drizzle ORM** — 스키마 정의, 쿼리, 마이그레이션(drizzle-kit 사용)
- **SQLite** — 데이터베이스
- **Zod** — 요청/응답 검증. 직접 검증 코드를 작성하기보다 Hono 라우트에 연결해서 사용하세요(예: `@hono/zod-validator`).

데이터베이스 스키마는 Drizzle에서 한 번만 정의하고, 타입은 직접 인터페이스로 중복 작성하지 말고 스키마에서 추론해서 사용하세요.

## 테스트

- **Vitest** — `frontend/`, `backend/`의 단위/통합 테스트
- **Playwright** — E2E 테스트(`e2e/`에 위치, 의존성과 `playwright.config.ts`는 저장소 루트)

## 주요 명령어

> ⚠️ 아직 `package.json`이 없어 아래 명령어는 **예정된 것**입니다. 패키지 매니저는 미정이라 npm(`npx`) 기준으로 적었고, 각 도구의 CLI를 직접 호출하는 형태라 `package.json` 스크립트가 생기면 그에 맞게 바꿔 주세요. 각 명령어는 해당 디렉터리(`frontend/`, `backend/`, `e2e/`) 안에서 실행합니다.

### 프론트엔드 (`frontend/`)

```bash
npm install
npx vite                 # 개발 서버 (기본 http://localhost:5173)
npx vite build           # 프로덕션 빌드 (dist/)
npx vite preview         # 빌드 결과 미리보기
```

### 백엔드 (`backend/`)

```bash
npm install
npm run dev               # tsx watch src/index.ts → http://localhost:3000 (PORT로 변경)
npm run start             # 감시 없이 실행 (E2E가 사용)
npm run db:generate      # schema.ts 변경 후 drizzle/ 에 마이그레이션 SQL 생성 (반드시 커밋)
npm run db:studio        # DB 브라우저 GUI
# 마이그레이션 적용은 별도 명령이 없다: src/db/index.ts가 import될 때 자동으로 migrate() 실행
```

### 테스트

```bash
# 백엔드 (backend/ 에서, package.json 스크립트)
npm test                 # vitest run (tests/**/*.test.ts)
npm run test:watch       # watch 모드
npm run test:coverage    # v8 커버리지 (coverage/)
npm run typecheck        # tsc --noEmit
npm test -- tests/tasks.test.ts       # 단일 파일
npm test -- -t "테스트 이름"           # 이름으로 단일 테스트

# 프론트엔드 (frontend/ 에서) — jsdom + Testing Library, 설정은 vitest.config.ts / tests/setup.ts
npm test                 # vitest run (tests/**, src/** 의 *.test.ts(x))
npm run test:watch       # watch 모드

# 단위/통합 테스트 - 직접 호출 (frontend/ 또는 backend/ 에서)
npx vitest               # watch 모드
npx vitest run           # 한 번만 실행 (CI용)
npx vitest run path/to/file.test.ts   # 단일 파일
npx vitest run -t "테스트 이름"        # 이름으로 단일 테스트

# E2E 테스트 (저장소 루트에서) — 설정: playwright.config.ts, 테스트: e2e/*.spec.ts
npm install && npx playwright install chromium   # 최초 1회
npm run test:e2e                        # 전체 (전용 포트로 백엔드 :3001(메모리 DB) + 프론트 :5174 자동 실행)
npx playwright test e2e/home.spec.ts    # 단일 파일
# 실행 순서: auth 프로젝트(auth.spec.ts, test@example.com 가입) → chromium 프로젝트(나머지, tasks.spec.ts는 그 계정으로 로그인)
# 그래서 파일 하나만 실행해도 auth.spec.ts가 먼저 돈다. 독립 실행은 --no-deps
npx playwright test -g "테스트 이름"     # 이름으로 단일 테스트
npm run test:e2e:ui                     # UI 모드로 디버깅
npm run test:e2e:report                 # 마지막 HTML 리포트 열기
```

실제 코드가 추가되면 이 섹션을 실제 스크립트에 맞게 갱신하고, 프론트엔드·백엔드·E2E가 어떻게 연결되는지(API 기본 URL, 포트, Playwright가 서비스를 어떻게 띄우는지 등)도 짧게 적어 주세요.

## 백엔드 구조

- `src/app.ts` — Hono 앱 조립(라우트 마운트, 404/에러 핸들러). 테스트는 서버를 띄우지 않고 `app.request()`로 직접 호출한다.
- `src/routes/*.ts` — 기능별 라우터(`/api/auth` 등). 입력은 `validateJson(zod스키마)` 미들웨어로 검증하고 `c.req.valid("json")`으로 꺼낸다.
- `src/middleware/auth.ts` — `requireAuth`: `Authorization: Bearer <JWT>` 검증 후 `c.get("userId")` 제공. 보호할 라우터는 `new Hono<AuthEnv>()` + `.use("*", requireAuth)`. 사용자 소유 리소스는 항상 `userId` 조건을 함께 걸어 조회하고, 남의 리소스는 403이 아닌 404로 응답한다.
- `src/db/` — Drizzle 스키마와 연결. `DATABASE_URL`이 없으면 Vitest 실행 중엔 `:memory:`, 그 외엔 `sqlite.db`를 쓴다. 테스트 파일마다 빈 메모리 DB에서 시작한다. DB 경로 규칙은 `src/db/path.ts`: `file:`/`sqlite:` 접두사 제거, 상대 경로는 cwd가 아닌 `backend/` 기준, 없는 폴더는 자동 생성.
- `src/lib/errors.ts` — **모든 에러 응답은 `{ "error": string, "details"?: unknown }` 포맷**. 직접 `c.json({...}, 4xx)`를 만들지 말고 `errorResponse()`를 쓰거나 `HTTPException`을 던진다(`app.onError`가 변환).
- 인증: bcryptjs(10 rounds)로 해싱, `hono/jwt`의 HS256 토큰(`sub`=userId, 7일 만료). 키는 `JWT_SECRET`(운영에서 미설정 시 시작 실패).

## 프론트엔드 구조

- 라우팅: `react-router`(v8). `src/App.tsx`가 `<Routes>`를 정의하고, `BrowserRouter`는 `src/main.tsx`에서 감싼다. 테스트에서는 `<MemoryRouter initialEntries={["/경로"]}><App /></MemoryRouter>`로 렌더링한다.
- `src/pages/*Page.tsx` — 라우트 단위 페이지(`/`, `/login`, `/register`, `/dashboard`, `/logout`, `*`=404). 페이지가 상태·API 호출을 담당하고, 폼 UI는 `src/components`에 둔다.
- 인증/API: `src/lib/api.ts`가 유일한 fetch 지점(`/api` 접두사, Bearer 토큰, 에러 응답을 `ApiError`로 변환, 화면 문구는 `toErrorMessage(err, {상태코드: 문구})`). 토큰은 `src/auth/AuthProvider.tsx`가 localStorage(`taskflow.token`)에 저장하고, 컴포넌트는 `useAuth()`로 접근한다. 보호 페이지는 `<RequireAuth>`로 감싼다. 로그아웃은 `/logout` 라우트로 이동해서 처리한다(보호 영역 안에서 바로 토큰을 지우면 RequireAuth가 먼저 /login으로 보내기 때문).
- 개발 시 Vite가 `/api`를 `API_PROXY_TARGET`(기본 `http://localhost:3000`)으로 프록시한다. 프론트와 백엔드를 각각 `npm run dev`로 띄운다.
- `src/lib/validation.ts` — 이메일/비밀번호 검증 규칙(백엔드 Zod 스키마와 같은 기준). 폼마다 규칙을 따로 만들지 않는다.
- `src/components/*.tsx` — 기능 컴포넌트(default export). 데이터 요청은 하지 않고 props 콜백(`onLogin` 등)으로 부모에 위임한다.
- `src/components/ui/` — 공통 UI. **폼 입력은 `FormField`를 사용**한다(`useId`로 label `htmlFor`↔input `id` 자동 연결, 에러 시 `aria-invalid` + `aria-describedby` + 빨간 테두리). 여러 줄 입력은 `TextAreaField`(같은 에러 표시). 폼 전체/서버 에러는 `FormAlert`(`role="alert"`, `.error-message`)로 표시한다. 모달은 `Modal`, 삭제 등 확인은 `ConfirmDialog`(`role="alertdialog"`)를 쓴다. 에러 표시를 컴포넌트마다 새로 만들지 않는다.
- `src/types/task.ts` — 백엔드 `tasks` 스키마와 맞춘 `Task` 타입(id는 UUID 문자열, status는 `"pending" | "in_progress" | "completed"`, 화면 라벨은 `STATUS_LABEL`: 대기/진행중/완료). 백엔드 스키마/상태 값을 바꾸면 이 파일도 함께 바꾼다.
- 스타일은 Tailwind v4(`@tailwindcss/vite`, `src/index.css`의 `@import "tailwindcss"`)만 사용한다. 레이어 밖 전역 CSS는 유틸리티를 덮어쓰므로 추가하지 않는다.
- `npm run build`는 앱 코드만 타입 검사한다. 테스트 포함 전체 타입 검사는 `npm run typecheck`(`tsc -b`).

## 코드 컨벤션

- Typescript strict mode
- 함수형 컴포넌트 + Hooks
- 에러는 Zod 스키마로 검증
- 한글 주석 허용

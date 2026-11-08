# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**TaskFlow** — TDD(테스트 주도 개발)를 기반으로, AI와 대화하며 함께 개발해 나가는 프로젝트입니다.

React(Vite) 프론트엔드와 Hono 백엔드로 이루어진 풀스택 웹 애플리케이션입니다. 백엔드는 Drizzle ORM으로 SQLite 데이터베이스를 다루고 Zod로 API 입출력을 검증하며, 프론트엔드는 이 API를 호출합니다. 테스트는 Vitest(단위/통합)와 Playwright(E2E)로 구성됩니다.

<!-- TODO: 앱의 주요 사용자와 핵심 기능을 여기에 적어 주세요. -->

## 개발 방식 (TDD)

이 프로젝트는 TDD로 진행합니다. 기능을 추가하거나 버그를 고칠 때는 다음 순서를 지키세요.

1. **Red** — 원하는 동작을 표현하는 실패하는 테스트를 먼저 작성하고, 실제로 실패하는지 실행해서 확인합니다.
2. **Green** — 테스트를 통과시키는 최소한의 코드만 작성합니다.
3. **Refactor** — 테스트가 통과하는 상태를 유지하면서 코드를 정리합니다.

- 테스트 없이 구현 코드부터 작성하지 마세요.
- 테스트를 통과시키기 위해 테스트를 수정하거나 삭제하지 마세요. 테스트가 잘못됐다고 판단되면 먼저 사용자에게 알리세요.
- 한 사이클은 작게 유지하고, 각 단계(Red/Green/Refactor)가 끝날 때마다 무엇을 했는지 사용자에게 짧게 공유하세요.

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
- **Playwright** — E2E 테스트(`e2e/`에 위치)

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
# 개발 서버: 런타임 미정 (Node: npx tsx watch src/index.ts / Bun: bun --hot src/index.ts)
npx drizzle-kit generate # 스키마 변경으로부터 마이그레이션 파일 생성
npx drizzle-kit migrate  # 마이그레이션을 SQLite DB에 적용
npx drizzle-kit studio   # DB 브라우저 GUI
```

### 테스트

```bash
# 단위/통합 테스트 (frontend/ 또는 backend/ 에서)
npx vitest               # watch 모드
npx vitest run           # 한 번만 실행 (CI용)
npx vitest run path/to/file.test.ts   # 단일 파일
npx vitest run -t "테스트 이름"        # 이름으로 단일 테스트

# E2E 테스트 (e2e/ 에서)
npx playwright install   # 최초 1회: 브라우저 설치
npx playwright test                     # 전체
npx playwright test tests/login.spec.ts # 단일 파일
npx playwright test -g "테스트 이름"     # 이름으로 단일 테스트
npx playwright test --ui                # UI 모드로 디버깅
```

실제 코드가 추가되면 이 섹션을 실제 스크립트에 맞게 갱신하고, 프론트엔드·백엔드·E2E가 어떻게 연결되는지(API 기본 URL, 포트, Playwright가 서비스를 어떻게 띄우는지 등)도 짧게 적어 주세요.

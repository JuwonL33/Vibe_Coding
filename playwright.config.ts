import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
// 평소 개발 서버(프론트 5173 / 백엔드 3000)와 겹치지 않도록 E2E 전용 포트를 쓴다.
const FRONTEND_PORT = 5174
const BACKEND_PORT = 3001
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`

/**
 * E2E 테스트 설정. 테스트는 e2e/ 에 *.spec.ts 로 작성한다.
 * 실행: 루트에서 `npm run test:e2e`
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  // CI에서 test.only가 남아 있으면 실패시킨다.
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: FRONTEND_URL,
    // 실패 원인 분석용: 재시도 때 trace, 실패 시 스크린샷
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'ko-KR',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // 필요하면 주석을 풀어 다른 브라우저도 검증한다.
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  // 테스트 전에 백엔드와 프론트엔드를 띄운다.
  // 백엔드는 메모리 DB를 쓰므로 매 실행마다 빈 DB에서 시작한다(같은 이메일로 회원가입해도 충돌 없음).
  // 그래서 이미 떠 있는 서버를 재사용하지 않는다(reuseExistingServer: false).
  webServer: [
    {
      command: 'npm run start',
      cwd: './backend',
      url: `${BACKEND_URL}/api/health`,
      env: { PORT: String(BACKEND_PORT), DATABASE_URL: ':memory:' },
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `npm run dev -- --port ${FRONTEND_PORT} --strictPort`,
      cwd: './frontend',
      url: FRONTEND_URL,
      env: { API_PROXY_TARGET: BACKEND_URL },
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
})

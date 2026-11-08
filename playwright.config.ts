import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
const FRONTEND_PORT = 5173
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`

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

  // 테스트 전에 프론트엔드 개발 서버를 띄운다(이미 떠 있으면 로컬에서는 재사용).
  // TODO: 백엔드 서버 진입점(backend/src/index.ts)이 생기면 여기에 백엔드 webServer도 추가한다.
  webServer: [
    {
      command: `npm run dev -- --port ${FRONTEND_PORT} --strictPort`,
      cwd: './frontend',
      url: FRONTEND_URL,
      reuseExistingServer: !isCI,
      timeout: 60_000,
    },
  ],
})

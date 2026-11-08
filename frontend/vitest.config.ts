import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

// vite.config.ts(React 플러그인 등)를 그대로 물려받고 테스트 설정만 덧붙인다.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // 브라우저 DOM이 필요한 React 컴포넌트 테스트용
      environment: 'jsdom',
      // describe/test/expect를 import 없이 사용 (Testing Library의 자동 cleanup도 이 설정에 의존)
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
      // 컴포넌트가 import하는 CSS는 테스트에서 처리하지 않는다(속도).
      css: false,
      // 테스트 간 mock 상태가 섞이지 않도록 매 테스트 후 초기화
      restoreMocks: true,
    },
  }),
)

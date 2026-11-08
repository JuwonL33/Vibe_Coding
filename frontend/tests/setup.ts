// toBeInTheDocument(), toHaveTextContent() 등 DOM 전용 matcher 추가
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// 로그인 토큰 등 localStorage 상태가 다음 테스트로 새지 않도록 비운다.
afterEach(() => {
  localStorage.clear()
})

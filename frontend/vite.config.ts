import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // 프론트엔드의 /api 요청을 백엔드로 넘긴다. E2E는 API_PROXY_TARGET으로 별도 백엔드를 지정한다.
      '/api': process.env.API_PROXY_TARGET ?? 'http://localhost:3000',
    },
  },
})

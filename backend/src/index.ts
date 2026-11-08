import { serve } from '@hono/node-server'
import app from './app'

// 서버 진입점. 테스트(Vitest)는 이 파일이 아니라 app.ts를 직접 사용한다.
const port = Number(process.env.PORT ?? 3000)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`TaskFlow API listening on http://localhost:${info.port}`)
})

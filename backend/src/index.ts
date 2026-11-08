import { fileURLToPath } from 'node:url'
import { serve } from '@hono/node-server'
import { resolveDatabasePath } from './db/path'
import { buildInfo } from './lib/build-info'

// 서버 진입점. 테스트(Vitest)는 이 파일이 아니라 app.ts를 직접 사용한다.

// app.ts를 불러오는 순간 DB 연결이 일어나므로, 실패하더라도 어떤 빌드였는지 남도록 먼저 로그를 찍는다.
const dbPath = resolveDatabasePath(process.env.DATABASE_URL, {
  isTest: false,
  baseDir: fileURLToPath(new URL('..', import.meta.url)),
})
console.log(`[TaskFlow] starting ${buildInfo(process.env, { dbPath })}`)

const { default: app } = await import('./app')
const port = Number(process.env.PORT ?? 3000)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`TaskFlow API listening on http://localhost:${info.port}`)
})

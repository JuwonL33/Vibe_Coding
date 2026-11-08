type Env = Record<string, string | undefined>

/**
 * 서버 시작 시 찍는 한 줄 요약. 배포 로그만 보고 "어떤 커밋이 어떤 설정으로 떴는지" 알 수 있게 한다.
 * Railway는 RAILWAY_GIT_COMMIT_SHA / RAILWAY_GIT_BRANCH를 자동으로 넣어 준다.
 */
export function buildInfo(env: Env, { dbPath }: { dbPath: string }): string {
  const commit = env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local'
  const parts = [
    `commit=${commit}`,
    env.RAILWAY_GIT_BRANCH && `branch=${env.RAILWAY_GIT_BRANCH}`,
    `env=${env.NODE_ENV ?? 'development'}`,
    `node=${process.version}`,
    // 혹시 접속 URL이 들어오면 계정 정보는 가린다.
    `db=${dbPath.replace(/\/\/[^@/]*@/, '//***@')}`,
  ]
  return parts.filter(Boolean).join(' ')
}

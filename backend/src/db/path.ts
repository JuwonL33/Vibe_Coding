import { isAbsolute, resolve } from "node:path";

/**
 * DATABASE_URL 값을 better-sqlite3가 열 수 있는 파일 경로로 바꾼다.
 * - 비어 있으면: 테스트 중엔 ":memory:", 그 외엔 <backend>/sqlite.db
 * - "file:" / "sqlite:" 접두사(Prisma, libsql 형식)는 떼어 낸다.
 *   그대로 넘기면 better-sqlite3가 "SqliteError: unable to open database file"을 낸다.
 * - 상대 경로는 실행 위치(cwd)가 아니라 backend 폴더 기준으로 푼다.
 */
export function resolveDatabasePath(
  raw: string | undefined,
  { isTest, baseDir }: { isTest: boolean; baseDir: string },
): string {
  if (!raw) return isTest ? ":memory:" : resolve(baseDir, "sqlite.db");
  if (raw === ":memory:") return raw;

  const path = raw.replace(/^(file|sqlite):(\/\/)?/, "");
  return isAbsolute(path) ? path : resolve(baseDir, path);
}

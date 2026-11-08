import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { resolveDatabasePath } from "./path";
import * as schema from "./schema";

// DB 파일 경로. 규칙은 ./path.ts 참고 (기본: 테스트는 메모리 DB, 그 외는 backend/sqlite.db)
const databaseUrl = resolveDatabasePath(process.env.DATABASE_URL, {
  isTest: Boolean(process.env.VITEST),
  baseDir: fileURLToPath(new URL("../..", import.meta.url)),
});

// 폴더가 없으면 better-sqlite3가 열지 못하므로 미리 만든다.
if (databaseUrl !== ":memory:") {
  mkdirSync(dirname(databaseUrl), { recursive: true });
}

export const sqlite = new Database(databaseUrl);

// SQLite는 외래 키 제약을 기본으로 끄고 있으므로 연결마다 켜 줘야
// tasks.user_id의 참조 무결성과 ON DELETE CASCADE가 동작한다.
sqlite.pragma("foreign_keys = ON");
if (databaseUrl !== ":memory:") {
  sqlite.pragma("journal_mode = WAL");
}

export const db = drizzle({ client: sqlite, schema });

// 연결 시 drizzle/ 폴더의 마이그레이션을 적용한다(이미 적용된 것은 건너뜀).
// 메모리 DB는 매번 비어 있으므로 테스트에서도 이 단계로 테이블이 만들어진다.
migrate(db, {
  migrationsFolder: fileURLToPath(new URL("../../drizzle", import.meta.url)),
});
export type DB = typeof db;

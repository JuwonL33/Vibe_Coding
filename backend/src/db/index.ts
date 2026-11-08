import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// DB 파일 경로. DATABASE_URL이 없으면 Vitest 실행 중에는 메모리 DB를,
// 그 외에는 backend/sqlite.db 파일을 사용한다.
const databaseUrl =
  process.env.DATABASE_URL ?? (process.env.VITEST ? ":memory:" : "sqlite.db");

export const sqlite = new Database(databaseUrl);

// SQLite는 외래 키 제약을 기본으로 끄고 있으므로 연결마다 켜 줘야
// tasks.user_id의 참조 무결성과 ON DELETE CASCADE가 동작한다.
sqlite.pragma("foreign_keys = ON");
if (databaseUrl !== ":memory:") {
  sqlite.pragma("journal_mode = WAL");
}

export const db = drizzle({ client: sqlite, schema });
export type DB = typeof db;

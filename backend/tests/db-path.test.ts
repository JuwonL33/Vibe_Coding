import { describe, test, expect } from "vitest";
import { resolveDatabasePath } from "../src/db/path";

const base = "/app/backend";

describe("resolveDatabasePath", () => {
  test("값이 없으면 테스트에서는 메모리 DB, 그 외에는 backend/sqlite.db", () => {
    expect(resolveDatabasePath(undefined, { isTest: true, baseDir: base })).toBe(":memory:");
    expect(resolveDatabasePath(undefined, { isTest: false, baseDir: base })).toBe("/app/backend/sqlite.db");
    expect(resolveDatabasePath("", { isTest: false, baseDir: base })).toBe("/app/backend/sqlite.db");
  });

  test(":memory: 는 그대로 둔다", () => {
    expect(resolveDatabasePath(":memory:", { isTest: false, baseDir: base })).toBe(":memory:");
  });

  test("Railway 설정값 file:./db.sqlite 는 backend 폴더의 db.sqlite 가 된다", () => {
    expect(resolveDatabasePath("file:./db.sqlite", { isTest: false, baseDir: "/app" })).toBe(
      "/app/db.sqlite",
    );
  });

  test("file: / sqlite: 접두사를 떼어 낸다 (Prisma, libsql 형식 호환)", () => {
    expect(resolveDatabasePath("file:./dev.db", { isTest: false, baseDir: base })).toBe("/app/backend/dev.db");
    expect(resolveDatabasePath("file:dev.db", { isTest: false, baseDir: base })).toBe("/app/backend/dev.db");
    expect(resolveDatabasePath("file:///var/data/app.db", { isTest: false, baseDir: base })).toBe("/var/data/app.db");
    expect(resolveDatabasePath("sqlite://data/app.db", { isTest: false, baseDir: base })).toBe("/app/backend/data/app.db");
  });

  test("상대 경로는 실행 위치(cwd)가 아니라 backend 폴더 기준으로 푼다", () => {
    expect(resolveDatabasePath("./data/app.db", { isTest: false, baseDir: base })).toBe("/app/backend/data/app.db");
    expect(resolveDatabasePath("/abs/app.db", { isTest: false, baseDir: base })).toBe("/abs/app.db");
  });
});

import { describe, test, expect } from "vitest";
import { buildInfo } from "../src/lib/build-info";

describe("buildInfo (서버 시작 로그)", () => {
  test("Railway 환경 변수가 있으면 커밋(앞 7자리)과 브랜치를 보여준다", () => {
    const line = buildInfo({
      RAILWAY_GIT_COMMIT_SHA: "0bae8a8f1234567890abcdef",
      RAILWAY_GIT_BRANCH: "main",
      NODE_ENV: "production",
      DATABASE_URL: "file:./db.sqlite",
    }, { dbPath: "/app/db.sqlite" });
    expect(line).toContain("commit=0bae8a8");
    expect(line).not.toContain("0bae8a8f");
    expect(line).toContain("branch=main");
    expect(line).toContain("env=production");
    expect(line).toContain("db=/app/db.sqlite");
  });

  test("로컬처럼 Railway 변수가 없으면 local 로 표시한다", () => {
    const line = buildInfo({}, { dbPath: "/x/sqlite.db" });
    expect(line).toContain("commit=local");
    expect(line).toContain("env=development");
  });

  test("DB 경로에 계정 정보가 섞여 있으면 가린다", () => {
    const line = buildInfo({}, { dbPath: "postgres://user:secret@host/db" });
    expect(line).not.toContain("secret");
    expect(line).toContain("postgres://***@host/db");
  });
});

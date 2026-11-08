import { test, expect } from "vitest";
import app from "../src/app";

test("GET /api/health 는 인증 없이 200과 상태를 반환한다.", async () => {
  const res = await app.request("/api/health");
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ status: "ok" });
});

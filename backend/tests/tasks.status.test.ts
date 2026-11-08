import { describe, test, expect, beforeAll } from "vitest";
import app from "../src/app";

describe("태스크 상태 값", () => {
  let token: string;
  let taskId: string;

  beforeAll(async () => {
    const reg = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: `status-${crypto.randomUUID()}@example.com`, password: "password123" }),
    });
    token = (await reg.json()).token;
    const created = await app.request("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: "상태 테스트" }),
    });
    taskId = (await created.json()).id;
  });

  test.each(["in_progress", "completed", "pending"])("status를 %s 로 변경할 수 있다.", async (status) => {
    const res = await app.request(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe(status);
  });
});

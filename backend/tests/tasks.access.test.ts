import { describe, test, expect, beforeAll } from "vitest";
import app from "../src/app";

async function registerAndGetToken(): Promise<string> {
  const res = await app.request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `access-${crypto.randomUUID()}@example.com`,
      password: "password123",
    }),
  });
  expect(res.status).toBe(201);
  return (await res.json()).token;
}

function authed(token: string, init: RequestInit = {}): RequestInit {
  return {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  };
}

describe("인증 미들웨어", () => {
  test("Authorization 헤더가 없으면 401을 반환한다.", async () => {
    const res = await app.request("/api/tasks");
    expect(res.status).toBe(401);
    expect(await res.json()).toHaveProperty("error");
  });

  test("Bearer 형식이 아니면 401을 반환한다.", async () => {
    const res = await app.request("/api/tasks", {
      headers: { Authorization: "Token abc" },
    });
    expect(res.status).toBe(401);
  });

  test("유효하지 않은 토큰이면 401을 반환한다.", async () => {
    const res = await app.request("/api/tasks", {
      headers: { Authorization: "Bearer not-a-real-token" },
    });
    expect(res.status).toBe(401);
    expect(await res.json()).toHaveProperty("error");
  });
});

describe("본인 태스크만 접근", () => {
  let ownerToken: string;
  let otherToken: string;
  let taskId: string;

  beforeAll(async () => {
    ownerToken = await registerAndGetToken();
    otherToken = await registerAndGetToken();
    const res = await app.request(
      "/api/tasks",
      authed(ownerToken, {
        method: "POST",
        body: JSON.stringify({ title: "내 태스크" }),
      }),
    );
    expect(res.status).toBe(201);
    taskId = (await res.json()).id;
  });

  test("다른 사용자의 목록에는 내 태스크가 보이지 않는다.", async () => {
    const res = await app.request("/api/tasks", authed(otherToken));
    expect(res.status).toBe(200);
    const list: { id: string }[] = await res.json();
    expect(list.some((t) => t.id === taskId)).toBe(false);
  });

  test("본인은 단건 조회할 수 있다.", async () => {
    const res = await app.request(`/api/tasks/${taskId}`, authed(ownerToken));
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe(taskId);
  });

  test("다른 사용자는 단건 조회·수정·삭제 시 404를 받는다.", async () => {
    const get = await app.request(`/api/tasks/${taskId}`, authed(otherToken));
    expect(get.status).toBe(404);

    const patch = await app.request(
      `/api/tasks/${taskId}`,
      authed(otherToken, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      }),
    );
    expect(patch.status).toBe(404);

    const del = await app.request(
      `/api/tasks/${taskId}`,
      authed(otherToken, { method: "DELETE" }),
    );
    expect(del.status).toBe(404);

    // 소유자 쪽에서는 그대로 남아 있고 상태도 바뀌지 않았다.
    const check = await app.request(`/api/tasks/${taskId}`, authed(ownerToken));
    expect(check.status).toBe(200);
    expect((await check.json()).status).toBe("pending");
  });
});

describe("입력 검증", () => {
  let token: string;
  beforeAll(async () => {
    token = await registerAndGetToken();
  });

  test("title 없이 생성하면 400을 반환한다.", async () => {
    const res = await app.request(
      "/api/tasks",
      authed(token, { method: "POST", body: JSON.stringify({}) }),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toHaveProperty("error", "Validation failed");
  });

  test("허용되지 않은 status로 수정하면 400을 반환한다.", async () => {
    const created = await app.request(
      "/api/tasks",
      authed(token, { method: "POST", body: JSON.stringify({ title: "t" }) }),
    );
    const { id } = await created.json();
    const res = await app.request(
      `/api/tasks/${id}`,
      authed(token, {
        method: "PATCH",
        body: JSON.stringify({ status: "done-ish" }),
      }),
    );
    expect(res.status).toBe(400);
  });
});

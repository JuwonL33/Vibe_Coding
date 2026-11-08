import { describe, it, expect, beforeAll, test } from "vitest";
import app from "../src/app";

// 새 사용자를 등록하고 인증 토큰을 반환한다.
// 이메일이 겹치면 회원가입이 실패할 수 있으므로 매번 고유한 이메일을 사용한다.
async function registerAndGetToken(): Promise<string> {
  const res = await app.request("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: `tasks-${crypto.randomUUID()}@example.com`,
      password: "password123",
      name: "Test User",
    }),
  });
  expect(res.status).toBe(201);
  const data = await res.json();
  return data.token;
}

describe("GET /api/tasks", () => {
  let authToken: string;

  beforeAll(async () => {
    authToken = await registerAndGetToken();
  });

  test("인증된 사용자가 새 태스크를 생성한다.", async () => {
    const res = await app.request("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: "새 태스크",
        description: "태스크 설명",
      }),
    });
    expect(res.status).toBe(201);
    const task = await res.json();
    expect(task.title).toBe("새 태스크");
    expect(task.status).toBe("pending");
  });

  test("인증된 사용자가 모든 태스크를 가져온다.", async () => {
    const res = await app.request("/api/tasks", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toBeInstanceOf(Array);
  });
});

describe("PATCH /api/tasks/:id", () => {
  let authToken: string;
  let taskId: string;
  beforeAll(async () => {
    authToken = await registerAndGetToken();
    // 태스크 생성
    const createTaskRes = await app.request("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: "테스트 태스크",
        description: "태스크 설명",
      }),
    });
    expect(createTaskRes.status).toBe(201);
    const createTaskData = await createTaskRes.json();
    taskId = createTaskData.id;
  });

  test("인증된 사용자가 태스크 상태를 업데이트한다.", async () => {
    const res = await app.request(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        status: "completed",
      }),
    });
    expect(res.status).toBe(200);
    const updatedTask = await res.json();
    expect(updatedTask.status).toBe("completed");
  });
});

describe("DELETE /api/tasks/:id", () => {
  let authToken: string;
  let taskId: string;
  beforeAll(async () => {
    authToken = await registerAndGetToken();
    // 태스크 생성
    const createTaskRes = await app.request("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: "삭제할 태스크",
        description: "태스크 설명",
      }),
    });
    expect(createTaskRes.status).toBe(201);
    const createTaskData = await createTaskRes.json();
    taskId = createTaskData.id;
  });

  test("인증된 사용자가 태스크를 삭제한다.", async () => {
    const res = await app.request(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(res.status).toBe(204);
  });
});

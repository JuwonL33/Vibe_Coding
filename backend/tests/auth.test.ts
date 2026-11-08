import { describe, test, expect, beforeAll } from "vitest";
import app from "../src/app";

describe("Post /api/auth/register", () => {
  test("새 사용자를 등록하고 토큰을 반환한다.", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty("token");
    expect(data).toHaveProperty("user.email", "test@example.com");
  });
});

describe("Post /api/auth/login", () => {
  test("올바른 자격증명으로 로그인하면 토큰을 반환한다.", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("token");
  });

  test("잘못된 자격증명으로 로그인하면 401 상태 코드를 반환한다.", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrongpassword",
      }),
    });
    expect(res.status).toBe(401);
    expect(await res.json()).toHaveProperty("error", "Invalid credentials");
  });
});

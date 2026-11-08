import { test, expect } from "@playwright/test";

test.describe("인증 흐름", () => {
  test("새 사용자가 회원가입하고 로그인을 할 수 있다.", async ({ page }) => {
    // Arrange
    await page.goto("/register");
    // Act
    await page.fill("input[name='email']", "test@example.com");
    await page.fill("input[name='password']", "password123");
    await page.fill("input[name='confirmPassword']", "password123");
    await page.click("button[type='submit']");
    // Assert
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("h1")).toHaveText("대시보드");
  });

  test("잘못된 비밀번호로 로그인 시 에러 메시지를 표시한다..", async ({
    page,
  }) => {
    // Arrange
    await page.goto("/login");
    // Act
    await page.fill("input[name='email']", "test@example.com");
    await page.fill("input[name='password']", "wrongpassword");
    await page.click("button[type='submit']");
    // Assert
    await expect(page.locator(".error-message")).toBeVisible();
    await expect(page.locator(".error-message")).toHaveText(
      "잘못된 이메일 또는 비밀번호 입니다.",
    );
    await expect(page).toHaveURL("/login");
  });
});

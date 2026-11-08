import { test, expect } from "@playwright/test";

test.describe("Task CRUD", () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 페이지로 이동
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    // 로그인 후 대시보드 페이지로 이동 확인
    await page.waitForURL;
  });

  test("새 태스크를 생성할 수 있다.", async ({ page }) => {
    // Arrange (이미 로그인된 상태)
    // Act
    await page.click('button:has-text("새 태스크 추가")');

    // 모달에서 폼 생성
    await page.fill('input[name="taskTitle"]', "새 태스크");
    await page.fill('textarea[name="taskDescription"]', "태스크 설명");
    await page.click('button[type="submit"]');

    // Assert
    await expect(page.locator(".task-item:has-text('새 태스크')")).toBeVisible();
  });

  test("태스크 상태를 변경할 수 있다.", async ({ page }) => {
    // Arrange
    // 태스크 먼저 생성
    await page.click('button:has-text("새 태스크 추가")');
    await page.fill('input[name="taskTitle"]', "상태 변경 태스크");
    await page.fill('textarea[name="taskDescription"]', "태스크 설명");
    await page.click('button[type="submit"]');

    // 태스크 상태를 '진행중'으로 변경
    await page.click('[data-testid="status-pending"] >> nth = 0');
    await page.click("text=진행중");

    // Act
    // 선택한 태스크의 상태가 '진행중'으로 변경되었는지 확인
    await expect(page.locator(".task-item >> text=진행중")).toBeVisible();
  });
  test("태스크를 삭제할 수 있다.", async ({ page }) => {
    // Arrange
    // 태스크를 먼저 생성
    await page.click('button:has-text("새 태스크 추가")');
    await page.fill('input[name="taskTitle"]', "삭제할 태스크");
    await page.fill('textarea[name="taskDescription"]', "태스크 설명");
    await page.click('button[type="submit"]');

    // 태스크가 목록에 있는지 확인
    const taskItem = page.locator(".task-item:has-text('삭제할 태스크')");
    await expect(taskItem).toBeVisible();

    // Act
    await taskItem.locator('[data-testid="delete-button"] >> nth=0').click();
    // 확인 다이얼로그
    await page.click('button:has-text("확인")');

    // Assert
    await expect(taskItem).toHaveCount(0); // 태스크가 목록에서 사라졌는지 확인
  });
});

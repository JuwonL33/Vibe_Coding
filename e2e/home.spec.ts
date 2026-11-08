import { test, expect } from '@playwright/test'

test.describe('홈 페이지', () => {
  test('회원가입/로그인 링크로 각 페이지에 이동한다', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: 'TaskFlow' })).toBeVisible()

    await page.getByRole('link', { name: '로그인', exact: true }).click()
    await expect(page).toHaveURL('/login')
    await expect(page.getByLabel('이메일')).toBeVisible()

    await page.getByRole('link', { name: '회원가입', exact: true }).click()
    await expect(page).toHaveURL('/signup')
    await expect(page.getByLabel('비밀번호 확인')).toBeVisible()
  })

  test('로그인 폼은 빈 값 제출 시 에러를 보여준다', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: '로그인' }).click()
    await expect(page.getByText('이메일을 입력해 주세요.')).toBeVisible()
    await expect(page.getByLabel('이메일')).toHaveAttribute('aria-invalid', 'true')
  })
})

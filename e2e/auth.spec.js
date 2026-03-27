const { test, expect } = require('@playwright/test')

test.describe('Authentication', () => {
  test('login page renders Log In heading', async ({ page }) => {
    await page.goto('/auth?mode=login')
    await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible()
  })

  test('signup page renders Create New User heading', async ({ page }) => {
    await page.goto('/auth?mode=signup')
    await expect(page.getByRole('heading', { name: /create new user/i })).toBeVisible()
  })

  test('mode toggle link switches from login to signup', async ({ page }) => {
    await page.goto('/auth?mode=login')
    await page.getByText(/don't have an account\? sign up/i).click()
    await expect(page).toHaveURL(/mode=signup/)
    await expect(page.getByRole('heading', { name: /create new user/i })).toBeVisible()
  })

  test('mode toggle link switches from signup to login', async ({ page }) => {
    await page.goto('/auth?mode=signup')
    await page.getByText(/already have an account\? log in/i).click()
    await expect(page).toHaveURL(/mode=login/)
    await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible()
  })

  test('successful login redirects to home page', async ({ page }) => {
    await page.goto('/auth?mode=login')
    await page.getByLabel('Email Address').fill('test@example.com')
    await page.getByLabel('Password').fill('anypassword')
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page).toHaveURL('/')
  })

  test('unauthenticated visit to / redirects to login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/mode=login/)
  })

  test('unauthenticated visit to /manage-teams redirects to login', async ({ page }) => {
    await page.goto('/manage-teams')
    await expect(page).toHaveURL(/mode=login/)
  })

  test('logout shows Login button in header', async ({ page }) => {
    // Log in with mock credentials
    await page.goto('/auth?mode=login')
    await page.getByLabel('Email Address').fill('test@example.com')
    await page.getByLabel('Password').fill('anypassword')
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page).toHaveURL('/')

    // Log out
    await page.getByRole('button', { name: /log out/i }).click()
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible()
  })
})

const { test: base } = require('@playwright/test')

/**
 * Extends the base test with an `authenticatedPage` fixture.
 * Injects a mock user via window.__E2E_MOCK_USER__ before the page loads,
 * which the mock firebase.js picks up automatically — no real credentials needed.
 */
const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.addInitScript(() => {
      window.__E2E_MOCK_USER__ = { uid: 'e2e-test-uid', email: 'e2e@test.local' }
    })
    await page.goto('/')
    await use(page)
  },
})

module.exports = { test }

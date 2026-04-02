const { expect } = require('@playwright/test')
const { test } = require('./fixtures/auth.fixture')

test.describe('Participant access — navigation guards', () => {
  test('redirects participant from / to /retro', async ({ participantPage: page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/retro/)
  })

  test('redirects participant from /manage-teams to /retro', async ({ participantPage: page }) => {
    await page.goto('/manage-teams')
    await expect(page).toHaveURL(/\/retro/)
  })

  test('redirects participant from /participants to /retro', async ({ participantPage: page }) => {
    await page.goto('/participants')
    await expect(page).toHaveURL(/\/retro/)
  })

  test('allows participant to stay on /retro', async ({ participantPage: page }) => {
    await expect(page).toHaveURL(/\/retro/)
  })
})

test.describe('Participant access — header', () => {
  test('shows only Retro nav link for participant', async ({ participantPage: page }) => {
    await expect(page.getByRole('link', { name: /retro/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /manage teams/i })).not.toBeVisible()
    await expect(page.getByRole('link', { name: /participants/i })).not.toBeVisible()
    await expect(page.getByRole('link', { name: /run stand-up/i })).not.toBeVisible()
  })

  test('shows Leave button instead of Log Out', async ({ participantPage: page }) => {
    await expect(page.getByRole('button', { name: /leave/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /log out/i })).not.toBeVisible()
  })
})

test.describe('Participant access — retro waiting state', () => {
  test('shows waiting message when no active retro', async ({ participantPage: page }) => {
    // No active retro is seeded in participant fixture → should show waiting screen
    await expect(page.getByText(/waiting for the team lead/i)).toBeVisible()
  })

  test('does not show Who are you? picker for participants', async ({ participantPage: page }) => {
    await expect(page.getByText(/who are you/i)).not.toBeVisible()
  })
})

test.describe('Join page', () => {
  test('shows error for an invalid token', async ({ page }) => {
    // No mock user, no DB seed → token will not resolve
    await page.addInitScript(() => {
      window.__E2E_DB__ = {
        // no participantTokens seeded → resolveToken returns null
      }
    })
    await page.goto('/join/invalid-token-xyz')
    await expect(page.getByText(/invalid or has been revoked/i)).toBeVisible()
  })

  test('redirects non-anonymous user (team lead) to home', async ({ page }) => {
    await page.addInitScript(() => {
      window.__E2E_MOCK_USER__ = { uid: 'lead-uid', email: 'lead@test.local', isAnonymous: false }
    })
    await page.goto('/join/any-token')
    await expect(page).toHaveURL(/\/$/)
  })
})

test.describe('Share Links — stand-up', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    const testTeamName = `ShareLinks E2E ${Date.now()}`

    // Create a participant
    await page.goto('/participants')
    await page.getByLabel('Name').fill('Link Tester')
    await page.getByRole('button', { name: /add participant/i }).click()
    await expect(page.getByText('Link Tester')).toBeVisible()

    // Create a team with that participant
    await page.goto('/manage-teams')
    await page.getByLabel('Team Name').fill(testTeamName)
    await page.getByRole('button', { name: /add team/i }).click()

    const teamCard = page.locator('text=' + testTeamName).locator('../..')
    await teamCard.getByRole('button').filter({ hasNot: page.getByText('Stand-Up') }).last().click()
    await page.getByLabel('Add Participant').click()
    await page.getByRole('option', { name: 'Link Tester' }).click()
    await page.getByRole('button', { name: /add participant/i }).click()

    // Navigate to run stand-up for that team
    await page.goto(`/?team=${encodeURIComponent(testTeamName)}`)

    // Store team name for cleanup
    page._testTeamName = testTeamName
  })

  test('Share Links button is visible in the stand-up view', async ({ authenticatedPage: page }) => {
    await expect(page.getByRole('button', { name: /share links/i })).toBeVisible()
  })

  test('clicking Share Links opens modal with participants and links', async ({ authenticatedPage: page }) => {
    await page.getByRole('button', { name: /share links/i }).click()
    await expect(page.getByText('Share Links')).toBeVisible()
    await expect(page.getByText('Link Tester')).toBeVisible()
  })
})

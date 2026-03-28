const { expect } = require('@playwright/test')
const { test } = require('./fixtures/auth.fixture')

// Each test uses the authenticatedPage fixture (pre-logged-in)
// Tests clean up any teams they create in afterEach

test.describe('Team Management', () => {
  const testTeamName = `E2E Test Team ${Date.now()}`

  test.afterEach(async ({ authenticatedPage: page }) => {
    // Clean up: delete any test teams created during the test
    await page.goto('/manage-teams')
    const deleteButtons = page.getByRole('button', { name: /delete team/i })
    const count = await deleteButtons.count()
    for (let i = 0; i < count; i++) {
      // Need to re-query after each deletion since DOM updates
      const btn = page.getByRole('button', { name: /delete team/i }).first()
      // Find and click the edit button for this team card first
      // (Delete Team is only visible in edit mode)
      if (await btn.isVisible()) await btn.click()
    }
  })

  test('can navigate to Manage Teams page', async ({ authenticatedPage: page }) => {
    await page.getByRole('link', { name: /manage teams/i }).click()
    await expect(page).toHaveURL('/manage-teams')
  })

  test('can create a new team', async ({ authenticatedPage: page }) => {
    await page.goto('/manage-teams')
    await page.getByLabel('Team Name').fill(testTeamName)
    await page.getByRole('button', { name: /add team/i }).click()
    await expect(page.getByText(testTeamName)).toBeVisible()
  })

  test('empty team name is rejected', async ({ authenticatedPage: page }) => {
    await page.goto('/manage-teams')
    const initialCards = await page.getByRole('heading', { level: 6 }).count()
    await page.getByRole('button', { name: /add team/i }).click()
    const afterCards = await page.getByRole('heading', { level: 6 }).count()
    expect(afterCards).toBe(initialCards)
  })

  test('can add a participant to a team', async ({ authenticatedPage: page }) => {
    // First create the participant in the global pool
    await page.goto('/participants')
    await page.getByLabel('Name').fill('Alice')
    await page.getByRole('button', { name: /add participant/i }).click()
    await expect(page.getByText('Alice')).toBeVisible()

    // Create the team
    await page.goto('/manage-teams')
    await page.getByLabel('Team Name').fill(testTeamName)
    await page.getByRole('button', { name: /add team/i }).click()

    // Enter edit mode for the team
    const teamCard = page.locator('text=' + testTeamName).locator('../..')
    await teamCard.getByRole('button').filter({ hasNot: page.getByText('Stand-Up') }).last().click()

    // Use the Autocomplete to select Alice
    await page.getByLabel('Add Participant').click()
    await page.getByRole('option', { name: 'Alice' }).click()
    await page.getByRole('button', { name: /add participant/i }).click()
    await expect(page.getByText('Alice')).toBeVisible()
  })

  test('can delete a participant from a team', async ({ authenticatedPage: page }) => {
    // First create the participant in the global pool
    await page.goto('/participants')
    await page.getByLabel('Name').fill('Alice')
    await page.getByRole('button', { name: /add participant/i }).click()
    await expect(page.getByText('Alice')).toBeVisible()

    // Create team and add participant via Autocomplete
    await page.goto('/manage-teams')
    await page.getByLabel('Team Name').fill(testTeamName)
    await page.getByRole('button', { name: /add team/i }).click()

    const teamCard = page.locator('text=' + testTeamName).locator('../..')
    await teamCard.getByRole('button').filter({ hasNot: page.getByText('Stand-Up') }).last().click()

    await page.getByLabel('Add Participant').click()
    await page.getByRole('option', { name: 'Alice' }).click()
    await page.getByRole('button', { name: /add participant/i }).click()
    await expect(page.getByText('Alice')).toBeVisible()

    // Delete the participant from the team
    await page.getByRole('button', { name: /^delete$/i }).first().click()
    await expect(page.getByText('Alice')).not.toBeVisible()
  })

  test('can delete a team', async ({ authenticatedPage: page }) => {
    await page.goto('/manage-teams')
    // Create a team
    await page.getByLabel('Team Name').fill(testTeamName)
    await page.getByRole('button', { name: /add team/i }).click()
    await expect(page.getByText(testTeamName)).toBeVisible()

    // Enter edit mode for that team and delete it
    const teamCard = page.locator('text=' + testTeamName).locator('../..')
    await teamCard.getByRole('button').filter({ hasNot: page.getByText('Stand-Up') }).last().click()
    await page.getByRole('button', { name: /delete team/i }).click()

    await expect(page.getByText(testTeamName)).not.toBeVisible()
  })

  test('teams persist after page reload', async ({ authenticatedPage: page }) => {
    await page.goto('/manage-teams')
    await page.getByLabel('Team Name').fill(testTeamName)
    await page.getByRole('button', { name: /add team/i }).click()
    await expect(page.getByText(testTeamName)).toBeVisible()

    await page.reload()
    await expect(page.getByText(testTeamName)).toBeVisible()
  })
})

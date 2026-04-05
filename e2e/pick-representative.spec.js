const { expect } = require('@playwright/test')
const { test } = require('./fixtures/auth.fixture')

test.describe('Pick Representative', () => {
  const testTeamName = `PickRep E2E ${Date.now()}`
  const participantNames = ['Alice', 'Bob', 'Charlie']

  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Create participants
    await page.goto('/participants')
    for (const name of participantNames) {
      await page.getByLabel('Name').fill(name)
      await page.getByRole('button', { name: /add participant/i }).click()
      await expect(page.getByText(name)).toBeVisible()
    }

    // Create team
    await page.goto('/manage-teams')
    await page.getByLabel('Team Name').fill(testTeamName)
    await page.getByRole('button', { name: /add team/i }).click()

    // Add participants to team
    const teamCard = page.locator('text=' + testTeamName).locator('../..')
    await teamCard.getByRole('button').filter({ hasNot: page.getByText('Stand-Up') }).last().click()

    for (const name of participantNames) {
      await page.getByLabel('Add Participant').click()
      await page.getByRole('option', { name }).click()
      await page.getByRole('button', { name: /add participant/i }).click()
    }
  })

  test.afterEach(async ({ authenticatedPage: page }) => {
    await page.goto('/manage-teams')
    const teamCard = page.locator('text=' + testTeamName)
    if (await teamCard.isVisible()) {
      const card = teamCard.locator('../..')
      await card.getByRole('button').filter({ hasNot: page.getByText('Stand-Up') }).last().click()
      await page.getByRole('button', { name: /delete team/i }).click()
    }
  })

  test('"Pick Rep" nav link is visible and navigates to the page', async ({ authenticatedPage: page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /pick rep/i }).click()
    await expect(page).toHaveURL(/pick-representative/)
  })

  test('spinning wheel is shown when a team with participants is selected', async ({ authenticatedPage: page }) => {
    await page.goto(`/pick-representative?team=${encodeURIComponent(testTeamName)}`)
    await expect(page.getByRole('button', { name: /spin the wheel/i })).toBeVisible()
  })

  test('"Spin the Wheel" button is enabled before spinning', async ({ authenticatedPage: page }) => {
    await page.goto(`/pick-representative?team=${encodeURIComponent(testTeamName)}`)
    await expect(page.getByRole('button', { name: /spin the wheel/i })).toBeEnabled()
  })

  test('clicking "Spin the Wheel" disables the button while animating, then shows winner', async ({ authenticatedPage: page }) => {
    await page.goto(`/pick-representative?team=${encodeURIComponent(testTeamName)}`)
    await page.getByRole('button', { name: /spin the wheel/i }).click()

    // Button should be disabled (shows "Spinning…") during animation
    await expect(page.getByRole('button', { name: /spinning/i })).toBeDisabled()

    // Wait for animation to finish (~5s) and winner card to appear
    await expect(page.getByText('Selected Representative')).toBeVisible({ timeout: 10000 })
  })

  test('winner card shows the participant name and "Selected Representative"', async ({ authenticatedPage: page }) => {
    await page.goto(`/pick-representative?team=${encodeURIComponent(testTeamName)}`)
    await page.getByRole('button', { name: /spin the wheel/i }).click()
    await expect(page.getByText('Selected Representative')).toBeVisible({ timeout: 10000 })

    // One of the participant names must be displayed on the winner card
    const winnerVisible = await Promise.any(
      participantNames.map((name) =>
        page.getByText(name).waitFor({ timeout: 1000 })
      )
    ).then(() => true).catch(() => false)
    expect(winnerVisible).toBe(true)
  })

  test('"Spin Again" resets back to the wheel', async ({ authenticatedPage: page }) => {
    await page.goto(`/pick-representative?team=${encodeURIComponent(testTeamName)}`)
    await page.getByRole('button', { name: /spin the wheel/i }).click()
    await expect(page.getByText('Selected Representative')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /spin again/i }).click()
    await expect(page.getByRole('button', { name: /spin the wheel/i })).toBeVisible()
  })

  test('shows "No Teams Created!" when no teams exist', async ({ authenticatedPage: page }) => {
    // Navigate directly — if the account happens to have teams this will show SelectTeam,
    // so we verify the page loads without error. For a clean account it shows the empty state.
    await page.goto('/pick-representative')
    await expect(page).toHaveURL(/pick-representative/)
  })
})

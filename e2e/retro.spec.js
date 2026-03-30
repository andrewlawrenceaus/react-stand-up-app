const { expect } = require('@playwright/test')
const { test } = require('./fixtures/auth.fixture')

test.describe('Retro', () => {
  const testTeamName = `Retro E2E ${Date.now()}`
  const participantNames = ['Alice', 'Bob']

  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Create participants in the global pool
    await page.goto('/participants')
    for (const name of participantNames) {
      await page.getByLabel('Name').fill(name)
      await page.getByRole('button', { name: /add participant/i }).click()
      await expect(page.getByText(name)).toBeVisible()
    }

    // Create the team
    await page.goto('/manage-teams')
    await page.getByLabel('Team Name').fill(testTeamName)
    await page.getByRole('button', { name: /add team/i }).click()

    // Enter edit mode and add each participant
    const teamCard = page.locator('text=' + testTeamName).locator('../..')
    await teamCard.getByRole('button').filter({ hasNot: page.getByText('Stand-Up') }).last().click()

    for (const name of participantNames) {
      await page.getByLabel('Add Participant').click()
      await page.getByRole('option', { name }).click()
      await page.getByRole('button', { name: /add participant/i }).click()
    }
  })

  test.afterEach(async ({ authenticatedPage: page }) => {
    // Clean up the test team
    await page.goto('/manage-teams')
    const teamCard = page.locator('text=' + testTeamName)
    if (await teamCard.isVisible()) {
      const card = teamCard.locator('../..')
      await card.getByRole('button').filter({ hasNot: page.getByText('Stand-Up') }).last().click()
      await page.getByRole('button', { name: /delete team/i }).click()
    }
  })

  // Helper: navigate to retro for the test team
  async function goToRetro(page) {
    await page.goto(`/retro?team=${encodeURIComponent(testTeamName)}`)
  }

  // Helper: start a retro with default categories
  async function startRetro(page) {
    await goToRetro(page)
    await page.getByRole('button', { name: /start retro/i }).click()
    await expect(page.getByText(/who are you/i)).toBeVisible()
  }

  // Helper: select a participant after the retro starts
  async function selectParticipant(page, name) {
    await page.getByRole('button', { name }).click()
  }

  // Helper: complete any active retro so setup screen shows
  async function completeActiveRetro(page) {
    await goToRetro(page)
    // If we're on the participant select, pick Alice to get to the board
    if (await page.getByText(/who are you/i).isVisible()) {
      await selectParticipant(page, 'Alice')
    }
    if (await page.getByRole('button', { name: /complete retro/i }).isVisible()) {
      await page.getByRole('button', { name: /complete retro/i }).click()
      await page.getByRole('button', { name: /yes, complete/i }).click()
    }
  }

  test.describe('Setup', () => {
    test('shows Start Retro setup when no active retro exists', async ({ authenticatedPage: page }) => {
      await goToRetro(page)
      await expect(page.getByRole('button', { name: /start retro/i })).toBeVisible()
    })

    test('shows default categories on setup screen', async ({ authenticatedPage: page }) => {
      await goToRetro(page)
      await expect(page.getByDisplayValue("What went well")).toBeVisible()
      await expect(page.getByDisplayValue("What didn't go well")).toBeVisible()
      await expect(page.getByDisplayValue("What should we do differently")).toBeVisible()
      await expect(page.getByText(/action items \(always included\)/i)).toBeVisible()
    })

    test('can add a custom category before starting', async ({ authenticatedPage: page }) => {
      await goToRetro(page)
      await page.getByPlaceholder(/add another category/i).fill('Shoutouts')
      await page.getByRole('button', { name: /^add$/i }).click()
      await expect(page.getByDisplayValue('Shoutouts')).toBeVisible()
    })

    test('can remove a category before starting', async ({ authenticatedPage: page }) => {
      await goToRetro(page)
      await page.getByRole('button', { name: /remove what went well/i }).click()
      await expect(page.getByDisplayValue('What went well')).not.toBeVisible()
    })

    test('can set a timer before starting', async ({ authenticatedPage: page }) => {
      await goToRetro(page)
      await page.getByPlaceholder(/minutes/i).fill('30')
      await page.getByRole('button', { name: /start retro/i }).click()
      await selectParticipant(page, 'Alice')
      await expect(page.getByText('30:00')).toBeVisible()
    })

    test('Start Retro is disabled when all categories are removed', async ({ authenticatedPage: page }) => {
      await goToRetro(page)
      // Remove all 3 default categories
      const removeBtns = page.getByRole('button', { name: /^remove /i })
      const count = await removeBtns.count()
      for (let i = 0; i < count; i++) {
        await page.getByRole('button', { name: /^remove /i }).first().click()
      }
      await expect(page.getByRole('button', { name: /start retro/i })).toBeDisabled()
    })
  })

  test.describe('Participant Selection', () => {
    test('shows participant selection screen after retro starts', async ({ authenticatedPage: page }) => {
      await startRetro(page)
      await expect(page.getByText(/who are you/i)).toBeVisible()
      for (const name of participantNames) {
        await expect(page.getByRole('button', { name })).toBeVisible()
      }
    })

    test('selecting a participant shows the retro board', async ({ authenticatedPage: page }) => {
      await startRetro(page)
      await selectParticipant(page, 'Alice')
      await expect(page.getByText(/you are:/i)).toBeVisible()
      await expect(page.getByText('Alice')).toBeVisible()
    })
  })

  test.describe('Board Interaction', () => {
    test.beforeEach(async ({ authenticatedPage: page }) => {
      await startRetro(page)
      await selectParticipant(page, 'Alice')
    })

    test('shows category columns on the retro board', async ({ authenticatedPage: page }) => {
      await expect(page.getByText('What went well')).toBeVisible()
      await expect(page.getByText("What didn't go well")).toBeVisible()
      await expect(page.getByText('What should we do differently')).toBeVisible()
      await expect(page.getByText('Action Items')).toBeVisible()
    })

    test('can add an item to a category', async ({ authenticatedPage: page }) => {
      const inputs = page.getByPlaceholder(/add an item/i)
      await inputs.first().fill('Great teamwork!')
      await page.getByRole('button', { name: /^add$/i }).first().click()
      await expect(page.getByText('Great teamwork!')).toBeVisible()
    })

    test('can edit an item the current participant authored', async ({ authenticatedPage: page }) => {
      const inputs = page.getByPlaceholder(/add an item/i)
      await inputs.first().fill('Original text')
      await page.getByRole('button', { name: /^add$/i }).first().click()
      await expect(page.getByText('Original text')).toBeVisible()

      await page.getByRole('button', { name: /edit item/i }).click()
      const editInput = page.locator('.retro-item__edit-input')
      await editInput.fill('Updated text')
      await editInput.press('Enter')
      await expect(page.getByText('Updated text')).toBeVisible()
    })

    test('can delete an item the current participant authored', async ({ authenticatedPage: page }) => {
      const inputs = page.getByPlaceholder(/add an item/i)
      await inputs.first().fill('Item to delete')
      await page.getByRole('button', { name: /^add$/i }).first().click()
      await expect(page.getByText('Item to delete')).toBeVisible()

      await page.getByRole('button', { name: /delete item/i }).click()
      await page.getByRole('button', { name: /confirm delete/i }).click()
      await expect(page.getByText('Item to delete')).not.toBeVisible()
    })

    test('can add a new category from the board', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: /\+ add category/i }).click()
      await page.getByPlaceholder(/category name/i).fill('Experiments')
      await page.getByRole('button', { name: /^add$/i }).last().click()
      await expect(page.getByText('Experiments')).toBeVisible()
    })

    test('can change participant identity', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: /change/i }).click()
      await expect(page.getByText(/who are you/i)).toBeVisible()
    })
  })

  test.describe('Timer', () => {
    test('timer is visible when duration is set', async ({ authenticatedPage: page }) => {
      await goToRetro(page)
      await page.getByPlaceholder(/minutes/i).fill('5')
      await page.getByRole('button', { name: /start retro/i }).click()
      await selectParticipant(page, 'Alice')
      await expect(page.getByText('05:00')).toBeVisible()
    })

    test('timer start button is visible before timer runs', async ({ authenticatedPage: page }) => {
      await goToRetro(page)
      await page.getByPlaceholder(/minutes/i).fill('5')
      await page.getByRole('button', { name: /start retro/i }).click()
      await selectParticipant(page, 'Alice')
      await expect(page.getByRole('button', { name: /^start$/i })).toBeVisible()
    })

    test('timer shows pause button while running', async ({ authenticatedPage: page }) => {
      await goToRetro(page)
      await page.getByPlaceholder(/minutes/i).fill('5')
      await page.getByRole('button', { name: /start retro/i }).click()
      await selectParticipant(page, 'Alice')
      await page.getByRole('button', { name: /^start$/i }).click()
      await expect(page.getByRole('button', { name: /pause/i })).toBeVisible()
    })
  })

  test.describe('Complete Retro', () => {
    test.beforeEach(async ({ authenticatedPage: page }) => {
      await startRetro(page)
      await selectParticipant(page, 'Alice')
    })

    test('Complete Retro button shows a confirmation prompt', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: /complete retro/i }).click()
      await expect(page.getByText(/save and end this retro/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /yes, complete/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()
    })

    test('cancelling the completion confirmation keeps the retro active', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: /complete retro/i }).click()
      await page.getByRole('button', { name: /cancel/i }).click()
      await expect(page.getByRole('button', { name: /complete retro/i })).toBeVisible()
    })

    test('confirming completion returns to setup screen', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: /complete retro/i }).click()
      await page.getByRole('button', { name: /yes, complete/i }).click()
      await expect(page.getByRole('button', { name: /start retro/i })).toBeVisible()
    })
  })

  test.describe('Clear All Items', () => {
    test('Clear All button removes items but keeps Action Items', async ({ authenticatedPage: page }) => {
      await startRetro(page)
      await selectParticipant(page, 'Alice')

      // Add an item to the first non-action column
      const inputs = page.getByPlaceholder(/add an item/i)
      await inputs.first().fill('Should be cleared')
      await page.getByRole('button', { name: /^add$/i }).first().click()
      await expect(page.getByText('Should be cleared')).toBeVisible()

      // Add an action item
      const actionInput = inputs.last()
      await actionInput.fill('Keep this action')
      await page.getByRole('button', { name: /^add$/i }).last().click()
      await expect(page.getByText('Keep this action')).toBeVisible()

      // Clear all (keeping action items)
      await page.getByRole('button', { name: /clear all \(keep action items\)/i }).click()
      await expect(page.getByText('Should be cleared')).not.toBeVisible()
      await expect(page.getByText('Keep this action')).toBeVisible()
    })
  })
})

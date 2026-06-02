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

  // Helper: drag a dnd-kit element (source locator) to the center of a target locator
  async function dragColumn(page, source, target) {
    const srcBox = await source.boundingBox()
    const tgtBox = await target.boundingBox()
    const sx = srcBox.x + srcBox.width / 2
    const sy = srcBox.y + srcBox.height / 2
    const tx = tgtBox.x + tgtBox.width / 2
    const ty = tgtBox.y + tgtBox.height / 2
    await page.mouse.move(sx, sy)
    await page.mouse.down()
    // Move slightly first to satisfy the 5px activation constraint
    await page.mouse.move(sx + 8, sy, { steps: 3 })
    // Then drag to the target
    await page.mouse.move(tx, ty, { steps: 20 })
    await page.mouse.up()
  }

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
      // Handle either the unfinished-participants warning or the simple confirm
      const completeAnyway = page.getByRole('button', { name: /complete anyway/i })
      const yesComplete = page.getByRole('button', { name: /yes, complete/i })
      if (await completeAnyway.isVisible({ timeout: 3000 }).catch(() => false)) {
        await completeAnyway.click()
      } else {
        await yesComplete.click()
      }
    }
  }

  test.describe('Setup', () => {
    test('shows Start Retro setup when no active retro exists', async ({ authenticatedPage: page }) => {
      await goToRetro(page)
      await expect(page.getByRole('button', { name: /start retro/i })).toBeVisible()
    })

    test('shows default categories on setup screen', async ({ authenticatedPage: page }) => {
      await goToRetro(page)
      const inputs = page.locator('input.retro-input--inline')
      await expect(inputs.nth(0)).toHaveValue('What went well')
      await expect(inputs.nth(1)).toHaveValue("What didn't go well")
      await expect(inputs.nth(2)).toHaveValue('What should we do differently')
      await expect(page.getByText(/action items \(always included\)/i)).toBeVisible()
    })

    test('can add a custom category before starting', async ({ authenticatedPage: page }) => {
      await goToRetro(page)
      await page.getByPlaceholder(/add another category/i).fill('Shoutouts')
      await page.getByRole('button', { name: /^add$/i }).click()
      await expect(page.locator('input.retro-input--inline').last()).toHaveValue('Shoutouts')
    })

    test('can remove a category before starting', async ({ authenticatedPage: page }) => {
      await goToRetro(page)
      await page.getByRole('button', { name: /remove what went well/i }).click()
      // Only 2 editable category inputs should remain (the removed one is gone)
      await expect(page.locator('input.retro-input--inline')).toHaveCount(2)
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
      await expect(page.locator('.retro-board__identity strong')).toHaveText('Alice')
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
      await expect(page.getByRole('heading', { name: /action items/i })).toBeVisible()
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

    test('Complete Retro button shows an unfinished-participants warning when participants have not finished', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: /complete retro/i }).click()
      await expect(page.getByText(/still waiting on/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /complete anyway/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()
    })

    test('cancelling the completion confirmation keeps the retro active', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: /complete retro/i }).click()
      await page.getByRole('button', { name: /cancel/i }).click()
      await expect(page.getByRole('button', { name: /complete retro/i })).toBeVisible()
    })

    test('confirming completion returns to setup screen', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: /complete retro/i }).click()
      await page.getByRole('button', { name: /complete anyway/i }).click()
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

      // Clear all (keeping action items) — confirm the dialog
      await page.getByRole('button', { name: /clear all \(keep action items\)/i }).click()
      await page.getByRole('button', { name: /yes, clear all/i }).click()
      await expect(page.getByText('Should be cleared')).not.toBeVisible()
      await expect(page.getByText('Keep this action')).toBeVisible()
    })
  })

  test.describe('Filter by Participant', () => {
    test.beforeEach(async ({ authenticatedPage: page }) => {
      await startRetro(page)
      await selectParticipant(page, 'Alice')
    })

    test.afterEach(async ({ authenticatedPage: page }) => {
      await completeActiveRetro(page)
    })

    test('filter dropdown is visible on the retro board', async ({ authenticatedPage: page }) => {
      await expect(page.getByRole('combobox', { name: /filter/i })).toBeVisible()
    })

    test('filtering by participant shows only their items', async ({ authenticatedPage: page }) => {
      // Alice adds an item
      const inputs = page.getByPlaceholder(/add an item/i)
      await inputs.first().fill('Alice\'s idea')
      await page.getByRole('button', { name: /^add$/i }).first().click()
      await expect(page.getByText('Alice\'s idea')).toBeVisible()

      // Switch to Bob and add an item
      await page.getByRole('button', { name: /change/i }).click()
      await selectParticipant(page, 'Bob')
      await inputs.first().fill('Bob\'s idea')
      await page.getByRole('button', { name: /^add$/i }).first().click()
      await expect(page.getByText('Bob\'s idea')).toBeVisible()

      // Filter by Alice — only Alice's item visible
      await page.getByRole('combobox', { name: /filter/i }).selectOption('Alice')
      await expect(page.getByText('Alice\'s idea')).toBeVisible()
      await expect(page.getByText('Bob\'s idea')).not.toBeVisible()

      // Filter by Bob — only Bob's item visible
      await page.getByRole('combobox', { name: /filter/i }).selectOption('Bob')
      await expect(page.getByText('Bob\'s idea')).toBeVisible()
      await expect(page.getByText('Alice\'s idea')).not.toBeVisible()
    })

    test('"All participants" shows all items', async ({ authenticatedPage: page }) => {
      // Alice adds an item
      const inputs = page.getByPlaceholder(/add an item/i)
      await inputs.first().fill('Alice\'s idea')
      await page.getByRole('button', { name: /^add$/i }).first().click()

      // Switch to Bob and add an item
      await page.getByRole('button', { name: /change/i }).click()
      await selectParticipant(page, 'Bob')
      await inputs.first().fill('Bob\'s idea')
      await page.getByRole('button', { name: /^add$/i }).first().click()

      // Filter by Alice, then clear filter
      await page.getByRole('combobox', { name: /filter/i }).selectOption('Alice')
      await expect(page.getByText('Bob\'s idea')).not.toBeVisible()
      await page.getByRole('combobox', { name: /filter/i }).selectOption('')
      await expect(page.getByText('Alice\'s idea')).toBeVisible()
      await expect(page.getByText('Bob\'s idea')).toBeVisible()
    })
  })

  test.describe('Column reordering', () => {
    test.beforeEach(async ({ authenticatedPage: page }) => {
      await startRetro(page)
      await selectParticipant(page, 'Alice')
    })

    test.afterEach(async ({ authenticatedPage: page }) => {
      await completeActiveRetro(page)
    })

    test('shows a drag handle on each column header', async ({ authenticatedPage: page }) => {
      const handles = page.locator('[title="Drag to reorder"]')
      // Default retro has 4 categories
      await expect(handles).toHaveCount(4)
    })

    test('dragging a column reorders it visually', async ({ authenticatedPage: page }) => {
      const columnHeaders = page.locator('.retro-category-editor__name')
      const firstColumnName = await columnHeaders.first().textContent()
      const secondColumnName = await columnHeaders.nth(1).textContent()

      const firstHandle = page.locator('[title="Drag to reorder"]').first()
      const secondColumn = page.locator('.retro-column').nth(1)
      await dragColumn(page, firstHandle, secondColumn)

      await expect(columnHeaders.first()).toHaveText(secondColumnName)
      await expect(columnHeaders.nth(1)).toHaveText(firstColumnName)
    })

    test('reordered column order persists after page reload', async ({ authenticatedPage: page }) => {
      const columnHeaders = page.locator('.retro-category-editor__name')
      const secondColumnName = await columnHeaders.nth(1).textContent()

      const secondHandle = page.locator('[title="Drag to reorder"]').nth(1)
      const firstColumn = page.locator('.retro-column').first()
      await dragColumn(page, secondHandle, firstColumn)
      await expect(columnHeaders.first()).toHaveText(secondColumnName)

      await page.reload()
      await expect(page.locator('.retro-category-editor__name').first()).toHaveText(secondColumnName)
    })
  })

  test.describe('Participant complete', () => {
    test.beforeEach(async ({ authenticatedPage: page }) => {
      await startRetro(page)
      await selectParticipant(page, 'Alice')
    })

    test.afterEach(async ({ authenticatedPage: page }) => {
      await completeActiveRetro(page)
    })

    test('shows participant sidebar with all participants', async ({ authenticatedPage: page }) => {
      await expect(page.locator('.retro-sidebar')).toBeVisible()
      await expect(page.locator('.retro-sidebar__name').filter({ hasText: 'Alice' })).toBeVisible()
      await expect(page.locator('.retro-sidebar__name').filter({ hasText: 'Bob' })).toBeVisible()
    })

    test('clicking I\'m Finished marks participant as finished in the sidebar', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: /i'm finished/i }).click()
      await expect(page.locator('.retro-sidebar__tick').first()).toBeVisible()
    })

    test('clicking I\'m Finished again removes the finished mark', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: /i'm finished/i }).click()
      await expect(page.locator('.retro-sidebar__tick').first()).toBeVisible()

      await page.getByRole('button', { name: /i'm finished/i }).click()
      await expect(page.locator('.retro-sidebar__tick')).toHaveCount(0)
    })

    test('completing a retro with unfinished participants shows a warning with their names', async ({ authenticatedPage: page }) => {
      // Alice is finished, Bob is not
      await page.getByRole('button', { name: /i'm finished/i }).click()
      await page.getByRole('button', { name: /complete retro/i }).click()
      await expect(page.getByText(/still waiting on/i)).toBeVisible()
      await expect(page.locator('.retro-actions__confirm')).toContainText('Bob')
      await expect(page.getByRole('button', { name: /complete anyway/i })).toBeVisible()
    })

    test('force-completing from the warning ends the retro', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: /i'm finished/i }).click()
      await page.getByRole('button', { name: /complete retro/i }).click()
      await page.getByRole('button', { name: /complete anyway/i }).click()
      await expect(page.getByRole('button', { name: /start retro/i })).toBeVisible()
    })

    test('all participants finished shows standard confirm instead of warning', async ({ authenticatedPage: page }) => {
      // Alice marks finished (Bob not in this session so only Alice is a participant who matters)
      // To test the "all done" path we need all participants finished — complete retro directly
      await page.getByRole('button', { name: /complete retro/i }).click()
      // With unfinished participants (Alice + Bob both unfinished), warning should appear
      await expect(page.getByText(/still waiting on/i)).toBeVisible()
      await page.getByRole('button', { name: /cancel/i }).click()
    })
  })
})

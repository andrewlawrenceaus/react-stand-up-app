const { test: base } = require('@playwright/test')

/**
 * Extends the base test with auth fixtures.
 *
 * authenticatedPage — injects a mock team-lead user before page load.
 * participantPage   — injects a mock anonymous participant user with a
 *                     pre-seeded participant session in the mock DB.
 */
const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.addInitScript(() => {
      window.__E2E_MOCK_USER__ = { uid: 'e2e-test-uid', email: 'e2e@test.local', isAnonymous: false }
    })
    await page.goto('/')
    await use(page)
  },

  participantPage: async ({ page }, use) => {
    await page.addInitScript(() => {
      const OWNER_UID = 'e2e-test-uid'
      const PARTICIPANT_ID = 'e2e-part-id'
      const TOKEN = 'e2e-token-abc'
      const ANON_UID = 'e2e-participant-uid'

      window.__E2E_MOCK_USER__ = { uid: ANON_UID, isAnonymous: true }
      window.__E2E_DB__ = {
        // Participant session — read by AuthProvider after auth state change
        [`participantSessions/${ANON_UID}`]: {
          ownerUID: OWNER_UID,
          participantId: PARTICIPANT_ID,
          token: TOKEN,
        },
        // Token record (needed for join page resolution)
        [`participantTokens/${TOKEN}`]: {
          ownerUID: OWNER_UID,
          participantId: PARTICIPANT_ID,
        },
        // Owner data — teams and participants the participant can read
        [`users/${OWNER_UID}/teams`]: {
          'E2E Team': [PARTICIPANT_ID],
        },
        [`users/${OWNER_UID}/participants`]: {
          [PARTICIPANT_ID]: {
            id: PARTICIPANT_ID,
            name: 'E2E Participant',
            photoUrl: '',
          },
        },
      }
    })
    await page.goto('/retro')
    await use(page)
  },
})

module.exports = { test }

/**
 * Mock replacement for src/utils/firebase.js used in E2E tests.
 * Owns all auth state. firebase/auth mock delegates to this object.
 * No real Firebase SDK is initialised.
 */

// Initialise current user from a value Playwright can inject before page load.
// Usage in Playwright: page.addInitScript(() => { window.__E2E_MOCK_USER__ = { uid: 'x', email: 'y' } })
let currentUser =
  typeof window !== 'undefined' ? window.__E2E_MOCK_USER__ || null : null

const listeners = []

export const auth = {
  get currentUser() {
    return currentUser
  },
  authStateReady() {
    return Promise.resolve()
  },
  onAuthStateChanged(callback) {
    listeners.push(callback)
    // Fire immediately with current state (mirrors real SDK behaviour)
    callback(currentUser)
    return () => {
      const idx = listeners.indexOf(callback)
      if (idx > -1) listeners.splice(idx, 1)
    }
  },
  // Private helpers used by the firebase/auth mock
  _signIn(email) {
    currentUser = { uid: `mock-uid-${email.replace(/\W/g, '')}`, email }
    listeners.forEach((cb) => cb(currentUser))
    return Promise.resolve({ user: currentUser })
  },
  _signOut() {
    currentUser = null
    listeners.forEach((cb) => cb(null))
    return Promise.resolve()
  },
}

// db is just used as an opaque token by firebase/database ref()
export const db = { __isMock: true }

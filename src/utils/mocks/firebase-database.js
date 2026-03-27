/**
 * Mock replacement for the 'firebase/database' package used in E2E tests.
 * Uses localStorage for persistence so data survives page reloads within a test.
 * Playwright can seed/inspect data via window.__E2E_DB__ before page load.
 */

const PREFIX = '__e2e_db__:'

function storageKey(path) {
  return PREFIX + path
}

function getStore() {
  // Allow Playwright to pre-seed data before page load via addInitScript
  if (typeof window !== 'undefined' && window.__E2E_DB__) {
    const seed = window.__E2E_DB__
    window.__E2E_DB__ = null
    for (const [path, value] of Object.entries(seed)) {
      localStorage.setItem(storageKey(path), JSON.stringify(value))
    }
  }
  return localStorage
}

export function ref(_db, path) {
  return { __path: path }
}

export function get(refObj) {
  const store = getStore()
  const raw = store.getItem(storageKey(refObj.__path))
  const value = raw !== null ? JSON.parse(raw) : null
  return Promise.resolve({
    exists() {
      return value !== null
    },
    val() {
      return value
    },
  })
}

export function set(refObj, value) {
  if (value === null || value === undefined) {
    localStorage.removeItem(storageKey(refObj.__path))
  } else {
    localStorage.setItem(storageKey(refObj.__path), JSON.stringify(value))
  }
  return Promise.resolve()
}

export function getDatabase() {
  return { __isMock: true }
}

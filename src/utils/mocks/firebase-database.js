/**
 * Mock replacement for the 'firebase/database' package used in E2E tests.
 * Stores the entire DB as a JSON tree in localStorage so sub-path reads/writes
 * stay consistent. Supports reactive onValue subscriptions: any set() or
 * update() that touches a path at or under a subscribed path re-fires the
 * callback with the updated subtree value.
 */

const STORE_KEY = '__e2e_db__'
const subscribers = [] // [{ path: string, callback: Function }]

function getRawTree() {
  const raw = localStorage.getItem(STORE_KEY)
  return raw ? JSON.parse(raw) : {}
}

function saveTree(tree) {
  localStorage.setItem(STORE_KEY, JSON.stringify(tree))
}

function getTree() {
  // Allow Playwright to pre-seed data before page load via addInitScript:
  //   window.__E2E_DB__ = { 'users/uid/teams': { ... } }
  if (typeof window !== 'undefined' && window.__E2E_DB__) {
    const seed = window.__E2E_DB__
    window.__E2E_DB__ = null
    let tree = getRawTree()
    for (const [path, value] of Object.entries(seed)) {
      tree = setAtPath(tree, path, value)
    }
    saveTree(tree)
  }
  return getRawTree()
}

function getAtPath(tree, path) {
  const parts = path.split('/').filter(Boolean)
  let node = tree
  for (const part of parts) {
    if (node === null || typeof node !== 'object') return null
    if (!(part in node)) return null
    node = node[part]
  }
  return node !== undefined ? node : null
}

function setAtPath(tree, path, value) {
  const parts = path.split('/').filter(Boolean)

  function helper(obj, remaining) {
    if (remaining.length === 0) return value
    const [head, ...rest] = remaining
    const current = obj && typeof obj === 'object' ? { ...obj } : {}
    if (rest.length === 0) {
      if (value === null || value === undefined) {
        const result = { ...current }
        delete result[head]
        return result
      }
      return { ...current, [head]: value }
    }
    return { ...current, [head]: helper(current[head], rest) }
  }

  return helper(tree, parts)
}

function makeSnapshot(value) {
  return {
    exists() {
      return value !== null && value !== undefined
    },
    val() {
      return value !== undefined ? value : null
    },
  }
}

function notifySubscribers(changedPath) {
  const tree = getRawTree()
  for (const sub of subscribers) {
    // Fire if the write touched this subscription's path or any of its descendants
    if (changedPath === sub.path || changedPath.startsWith(sub.path + '/')) {
      sub.callback(makeSnapshot(getAtPath(tree, sub.path)))
    }
  }
}

export function ref(_db, path) {
  return { __path: path }
}

export function get(refObj) {
  const tree = getTree()
  const value = getAtPath(tree, refObj.__path)
  return Promise.resolve(makeSnapshot(value))
}

export function set(refObj, value) {
  let tree = getTree()
  tree = setAtPath(tree, refObj.__path, value)
  saveTree(tree)
  notifySubscribers(refObj.__path)
  return Promise.resolve()
}

export function onValue(refObj, callback) {
  const tree = getTree()
  const value = getAtPath(tree, refObj.__path)
  // Fire immediately with the current value (mirrors real SDK behaviour)
  callback(makeSnapshot(value))

  const sub = { path: refObj.__path, callback }
  subscribers.push(sub)

  return () => {
    const idx = subscribers.indexOf(sub)
    if (idx > -1) subscribers.splice(idx, 1)
  }
}

export function update(refObj, updates) {
  let tree = getTree()
  const changedPaths = []
  for (const [relativePath, value] of Object.entries(updates)) {
    const fullPath = refObj.__path + '/' + relativePath
    tree = setAtPath(tree, fullPath, value)
    changedPaths.push(fullPath)
  }
  saveTree(tree)
  for (const changedPath of changedPaths) {
    notifySubscribers(changedPath)
  }
  return Promise.resolve()
}

export function getDatabase() {
  return { __isMock: true }
}

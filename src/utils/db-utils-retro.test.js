/**
 * Unit tests for the retro-specific functions in db-utils.js.
 */

jest.mock('./firebase', () => ({
  auth: {
    authStateReady: jest.fn().mockResolvedValue(undefined),
    currentUser: { uid: 'test-uid' },
  },
  db: {},
}))

jest.mock('firebase/database', () => ({
  ref: jest.fn((_db, path) => ({ path })),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  onValue: jest.fn(),
}))

import { ref, get, set, update, onValue } from 'firebase/database'
import { auth } from './firebase'
import {
  createRetro,
  addRetroItem,
  updateRetroItem,
  removeRetroItem,
  toggleAgree,
  updateRetroTimer,
  completeRetro,
  clearItemsByCategory,
  clearAllItemsExceptCategory,
  getPreviousRetro,
  subscribeToActiveRetro,
  reorderRetroCategories,
} from './db-utils'

const UID = 'test-uid'
const TEAM = 'Alpha'

beforeEach(() => {
  jest.clearAllMocks()
  auth.currentUser = { uid: UID }
  auth.authStateReady.mockResolvedValue(undefined)
  set.mockResolvedValue(undefined)
  update.mockResolvedValue(undefined)
})

// ─── createRetro ──────────────────────────────────────────────────────────────

describe('createRetro', () => {
  it('sets the active retro with categories and timer', async () => {
    const categories = { 'cat-1': { id: 'cat-1', name: 'Wins' } }
    await createRetro(TEAM, { categories, timerDuration: 600 })
    expect(set).toHaveBeenCalledWith(
      { path: `users/${UID}/retros/${TEAM}/active` },
      expect.objectContaining({ categories, timerDuration: 600, items: false })
    )
  })

  it('stores null timerDuration when not provided', async () => {
    await createRetro(TEAM, { categories: {}, timerDuration: null })
    expect(set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ timerDuration: null })
    )
  })

  it('does nothing when not authenticated', async () => {
    auth.currentUser = null
    await createRetro(TEAM, { categories: {}, timerDuration: null })
    expect(set).not.toHaveBeenCalled()
  })
})

// ─── addRetroItem ─────────────────────────────────────────────────────────────

describe('addRetroItem', () => {
  const item = { id: 'item-1', categoryId: 'cat-1', text: 'Hello', authorId: 'p1', createdAt: 1000 }

  it('sets the item at the correct path', async () => {
    await addRetroItem(TEAM, item)
    expect(set).toHaveBeenCalledWith(
      { path: `users/${UID}/retros/${TEAM}/active/items/${item.id}` },
      item
    )
  })

  it('uses ownerUID param when provided', async () => {
    await addRetroItem(TEAM, item, 'other-owner-uid')
    expect(set).toHaveBeenCalledWith(
      { path: `users/other-owner-uid/retros/${TEAM}/active/items/${item.id}` },
      item
    )
  })

  it('does nothing when not authenticated', async () => {
    auth.currentUser = null
    await addRetroItem(TEAM, item)
    expect(set).not.toHaveBeenCalled()
  })
})

// ─── updateRetroItem ──────────────────────────────────────────────────────────

describe('updateRetroItem', () => {
  const existingItem = { id: 'item-1', text: 'Old text', authorId: 'p1' }

  it('merges updated text into the existing item', async () => {
    get.mockResolvedValue({ exists: () => true, val: () => existingItem })
    await updateRetroItem(TEAM, 'item-1', 'New text')
    expect(set).toHaveBeenCalledWith(
      { path: `users/${UID}/retros/${TEAM}/active/items/item-1` },
      { ...existingItem, text: 'New text' }
    )
  })

  it('does nothing if item does not exist', async () => {
    get.mockResolvedValue({ exists: () => false, val: () => null })
    await updateRetroItem(TEAM, 'item-1', 'New text')
    expect(set).not.toHaveBeenCalled()
  })
})

// ─── removeRetroItem ──────────────────────────────────────────────────────────

describe('removeRetroItem', () => {
  it('sets the item path to null', async () => {
    await removeRetroItem(TEAM, 'item-1')
    expect(set).toHaveBeenCalledWith(
      { path: `users/${UID}/retros/${TEAM}/active/items/item-1` },
      null
    )
  })
})

// ─── toggleAgree ──────────────────────────────────────────────────────────────

describe('toggleAgree', () => {
  it('sets to true when participant has not agreed', async () => {
    get.mockResolvedValue({ exists: () => false })
    await toggleAgree(TEAM, 'item-1', 'p2')
    expect(set).toHaveBeenCalledWith(
      { path: `users/${UID}/retros/${TEAM}/active/items/item-1/agreedBy/p2` },
      true
    )
  })

  it('sets to null (removes) when participant has already agreed', async () => {
    get.mockResolvedValue({ exists: () => true })
    await toggleAgree(TEAM, 'item-1', 'p2')
    expect(set).toHaveBeenCalledWith(
      { path: `users/${UID}/retros/${TEAM}/active/items/item-1/agreedBy/p2` },
      null
    )
  })

  it('uses ownerUID param when provided', async () => {
    get.mockResolvedValue({ exists: () => false })
    await toggleAgree(TEAM, 'item-1', 'p2', 'other-owner-uid')
    expect(set).toHaveBeenCalledWith(
      { path: `users/other-owner-uid/retros/${TEAM}/active/items/item-1/agreedBy/p2` },
      true
    )
  })
})

// ─── updateRetroTimer ─────────────────────────────────────────────────────────

describe('updateRetroTimer', () => {
  beforeEach(() => {
    get.mockResolvedValue({ exists: () => true, val: () => ({}) })
  })

  it('calls update with flattened timer keys', async () => {
    await updateRetroTimer(TEAM, { timerStartedAt: 12345 })
    expect(update).toHaveBeenCalledWith(
      { path: `users/${UID}` },
      { [`retros/${TEAM}/active/timerStartedAt`]: 12345 }
    )
  })

  it('does nothing when the active retro does not exist', async () => {
    get.mockResolvedValue({ exists: () => false })
    await updateRetroTimer(TEAM, { timerStartedAt: 12345 })
    expect(update).not.toHaveBeenCalled()
  })
})

// ─── completeRetro ────────────────────────────────────────────────────────────

describe('completeRetro', () => {
  const retroData = { categories: {}, items: false, startedAt: 1000 }

  it('nulls the active retro and writes to history', async () => {
    get.mockResolvedValue({ exists: () => true, val: () => retroData })
    const today = new Date().toISOString().split('T')[0]
    await completeRetro(TEAM)
    expect(update).toHaveBeenCalledWith(
      { path: `users/${UID}` },
      expect.objectContaining({
        [`retros/${TEAM}/active`]: null,
        [`retros/${TEAM}/history/${today}`]: expect.objectContaining(retroData),
      })
    )
  })

  it('does nothing when there is no active retro', async () => {
    get.mockResolvedValue({ exists: () => false })
    await completeRetro(TEAM)
    expect(update).not.toHaveBeenCalled()
  })
})

// ─── clearItemsByCategory ─────────────────────────────────────────────────────

describe('clearItemsByCategory', () => {
  it('nulls only items in the specified category', async () => {
    const items = {
      'i1': { categoryId: 'cat-1' },
      'i2': { categoryId: 'cat-2' },
      'i3': { categoryId: 'cat-1' },
    }
    get.mockResolvedValue({ exists: () => true, val: () => items })
    await clearItemsByCategory(TEAM, 'cat-1')
    expect(update).toHaveBeenCalledWith(
      { path: `users/${UID}` },
      {
        [`retros/${TEAM}/active/items/i1`]: null,
        [`retros/${TEAM}/active/items/i3`]: null,
      }
    )
  })

  it('does nothing when there are no items', async () => {
    get.mockResolvedValue({ exists: () => false })
    await clearItemsByCategory(TEAM, 'cat-1')
    expect(update).not.toHaveBeenCalled()
  })
})

// ─── clearAllItemsExceptCategory ──────────────────────────────────────────────

describe('clearAllItemsExceptCategory', () => {
  it('nulls all items except those in the protected category', async () => {
    const items = {
      'i1': { categoryId: 'cat-1' },
      'i2': { categoryId: 'cat-action' },
      'i3': { categoryId: 'cat-1' },
    }
    get.mockResolvedValue({ exists: () => true, val: () => items })
    await clearAllItemsExceptCategory(TEAM, 'cat-action')
    expect(update).toHaveBeenCalledWith(
      { path: `users/${UID}` },
      {
        [`retros/${TEAM}/active/items/i1`]: null,
        [`retros/${TEAM}/active/items/i3`]: null,
      }
    )
  })

  it('does nothing when there are no items', async () => {
    get.mockResolvedValue({ exists: () => false })
    await clearAllItemsExceptCategory(TEAM, 'cat-action')
    expect(update).not.toHaveBeenCalled()
  })
})

// ─── getPreviousRetro ─────────────────────────────────────────────────────────

describe('getPreviousRetro', () => {
  it('returns the most recent retro from history', async () => {
    const history = {
      '2024-01-10': { categories: {}, items: {} },
      '2024-01-20': { categories: {}, items: { 'i1': {} } },
      '2024-01-15': { categories: {}, items: {} },
    }
    get.mockResolvedValue({ exists: () => true, val: () => history })
    const result = await getPreviousRetro(TEAM)
    expect(result).toMatchObject({ date: '2024-01-20' })
  })

  it('returns null when no history exists', async () => {
    get.mockResolvedValue({ exists: () => false })
    const result = await getPreviousRetro(TEAM)
    expect(result).toBeNull()
  })

  it('returns null when not authenticated', async () => {
    auth.currentUser = null
    const result = await getPreviousRetro(TEAM)
    expect(result).toBeNull()
  })
})

// ─── subscribeToActiveRetro ───────────────────────────────────────────────────

describe('subscribeToActiveRetro', () => {
  it('calls callback with retro data when snapshot exists', () => {
    const retroData = { categories: {}, items: false }
    onValue.mockImplementation((_ref, cb) => {
      cb({ exists: () => true, val: () => retroData })
      return jest.fn()
    })
    const callback = jest.fn()
    subscribeToActiveRetro(TEAM, callback)
    expect(callback).toHaveBeenCalledWith(retroData)
  })

  it('calls callback with null when snapshot does not exist', () => {
    onValue.mockImplementation((_ref, cb) => {
      cb({ exists: () => false, val: () => null })
      return jest.fn()
    })
    const callback = jest.fn()
    subscribeToActiveRetro(TEAM, callback)
    expect(callback).toHaveBeenCalledWith(null)
  })

  it('returns an unsubscribe function', () => {
    const unsubscribe = jest.fn()
    onValue.mockReturnValue(unsubscribe)
    const result = subscribeToActiveRetro(TEAM, jest.fn())
    expect(result).toBe(unsubscribe)
  })

  it('uses ownerUID param when provided', () => {
    onValue.mockImplementation((_ref, cb) => {
      cb({ exists: () => false, val: () => null })
      return jest.fn()
    })
    subscribeToActiveRetro(TEAM, jest.fn(), 'other-owner-uid')
    expect(ref).toHaveBeenCalledWith(
      expect.anything(),
      `users/other-owner-uid/retros/${TEAM}/active`
    )
  })

  it('returns a no-op and does not call onValue when not authenticated', () => {
    auth.currentUser = null
    const callback = jest.fn()
    const unsubscribe = subscribeToActiveRetro(TEAM, callback)
    expect(onValue).not.toHaveBeenCalled()
    expect(callback).not.toHaveBeenCalled()
    expect(typeof unsubscribe).toBe('function')
  })
})

// ─── reorderRetroCategories ───────────────────────────────────────────────────

describe('reorderRetroCategories', () => {
  it('batch-updates the order field for each category in the given order', async () => {
    await reorderRetroCategories(TEAM, ['cat-c', 'cat-a', 'cat-b'])
    expect(update).toHaveBeenCalledWith(
      { path: `users/${UID}` },
      {
        [`retros/${TEAM}/active/categories/cat-c/order`]: 0,
        [`retros/${TEAM}/active/categories/cat-a/order`]: 1,
        [`retros/${TEAM}/active/categories/cat-b/order`]: 2,
      }
    )
  })

  it('handles a single category with order 0', async () => {
    await reorderRetroCategories(TEAM, ['cat-only'])
    expect(update).toHaveBeenCalledWith(
      { path: `users/${UID}` },
      { [`retros/${TEAM}/active/categories/cat-only/order`]: 0 }
    )
  })

  it('does nothing when not authenticated', async () => {
    auth.currentUser = null
    await reorderRetroCategories(TEAM, ['cat-a', 'cat-b'])
    expect(update).not.toHaveBeenCalled()
  })
})

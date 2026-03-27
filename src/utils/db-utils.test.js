import { getTeams, writeTeams } from './db-utils'

jest.mock('./firebase', () => ({
  auth: {
    authStateReady: jest.fn().mockResolvedValue(undefined),
    currentUser: { uid: 'test-uid-123' },
  },
  db: {},
}))

jest.mock('firebase/database', () => ({
  ref: jest.fn((db, path) => ({ path })),
  get: jest.fn(),
  set: jest.fn(),
}))

import { ref, get, set } from 'firebase/database'
import { auth } from './firebase'

describe('getTeams', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    auth.authStateReady.mockResolvedValue(undefined)
    auth.currentUser = { uid: 'test-uid-123' }
  })

  it('returns team data when authenticated and data exists', async () => {
    get.mockResolvedValue({
      exists: () => true,
      val: () => ({ Alpha: ['Alice'] }),
    })
    const result = await getTeams()
    expect(result).toEqual({ Alpha: ['Alice'] })
  })

  it('returns empty object when snapshot does not exist', async () => {
    get.mockResolvedValue({
      exists: () => false,
      val: () => null,
    })
    const result = await getTeams()
    expect(result).toEqual({})
  })

  it('returns empty object when user is not authenticated', async () => {
    auth.currentUser = null
    const result = await getTeams()
    expect(result).toEqual({})
    expect(get).not.toHaveBeenCalled()
  })
})

describe('writeTeams', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    auth.authStateReady.mockResolvedValue(undefined)
    auth.currentUser = { uid: 'test-uid-123' }
  })

  it('calls set with the correct ref and teams data when authenticated', async () => {
    const teams = { Alpha: ['Alice'] }
    await writeTeams(teams)
    expect(ref).toHaveBeenCalledWith({}, 'users/test-uid-123/teams')
    expect(set).toHaveBeenCalledWith({ path: 'users/test-uid-123/teams' }, teams)
  })

  it('does not call set when user is not authenticated', async () => {
    auth.currentUser = null
    await writeTeams({ Alpha: ['Alice'] })
    expect(set).not.toHaveBeenCalled()
  })
})

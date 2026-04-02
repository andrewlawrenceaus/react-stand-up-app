jest.mock('./firebase', () => ({
  db: {},
}))

jest.mock('firebase/database', () => ({
  ref: jest.fn((_db, path) => ({ path })),
  get: jest.fn(),
  set: jest.fn(),
}))

import { ref, get, set } from 'firebase/database'
import {
  generateInviteToken,
  generateAllInviteTokens,
  revokeInviteToken,
  resolveToken,
  writeParticipantSession,
  readParticipantSession,
} from './db-utils-tokens'

const OWNER_UID = 'owner-uid'
const PARTICIPANT_ID = 'p1'

beforeEach(() => {
  jest.clearAllMocks()
  set.mockResolvedValue(undefined)
})

// ─── generateInviteToken ──────────────────────────────────────────────────────

describe('generateInviteToken', () => {
  it('writes to participantTokens and sets inviteToken on participant', async () => {
    const token = await generateInviteToken(OWNER_UID, PARTICIPANT_ID)
    expect(typeof token).toBe('string')
    expect(set).toHaveBeenCalledWith(
      { path: `participantTokens/${token}` },
      { ownerUID: OWNER_UID, participantId: PARTICIPANT_ID }
    )
    expect(set).toHaveBeenCalledWith(
      { path: `users/${OWNER_UID}/participants/${PARTICIPANT_ID}/inviteToken` },
      token
    )
  })

  it('returns a UUID string', async () => {
    const token = await generateInviteToken(OWNER_UID, PARTICIPANT_ID)
    expect(token).toMatch(/^[0-9a-f-]{36}$/)
  })
})

// ─── generateAllInviteTokens ─────────────────────────────────────────────────

describe('generateAllInviteTokens', () => {
  it('generates tokens for participants without one', async () => {
    const participants = [
      { id: 'p1', name: 'Alice', inviteToken: null },
      { id: 'p2', name: 'Bob', inviteToken: null },
    ]
    const result = await generateAllInviteTokens(OWNER_UID, participants)
    expect(result[0].inviteToken).toBeTruthy()
    expect(result[1].inviteToken).toBeTruthy()
    expect(set).toHaveBeenCalledTimes(4) // 2 tokens + 2 participant refs
  })

  it('skips participants that already have a token', async () => {
    const participants = [
      { id: 'p1', name: 'Alice', inviteToken: 'existing-token' },
      { id: 'p2', name: 'Bob', inviteToken: null },
    ]
    const result = await generateAllInviteTokens(OWNER_UID, participants)
    expect(result[0].inviteToken).toBe('existing-token')
    expect(result[1].inviteToken).toBeTruthy()
    expect(set).toHaveBeenCalledTimes(2) // only 1 new token (2 set calls)
  })

  it('returns all participants with tokens set', async () => {
    const participants = [{ id: 'p1', name: 'Alice', inviteToken: null }]
    const result = await generateAllInviteTokens(OWNER_UID, participants)
    expect(result).toHaveLength(1)
    expect(result[0].inviteToken).toBeTruthy()
  })
})

// ─── revokeInviteToken ────────────────────────────────────────────────────────

describe('revokeInviteToken', () => {
  it('nulls the token record and clears inviteToken on participant', async () => {
    const token = 'token-to-revoke'
    await revokeInviteToken(OWNER_UID, PARTICIPANT_ID, token)
    expect(set).toHaveBeenCalledWith({ path: `participantTokens/${token}` }, null)
    expect(set).toHaveBeenCalledWith(
      { path: `users/${OWNER_UID}/participants/${PARTICIPANT_ID}/inviteToken` },
      null
    )
  })
})

// ─── resolveToken ─────────────────────────────────────────────────────────────

describe('resolveToken', () => {
  it('returns token data when it exists', async () => {
    const tokenData = { ownerUID: OWNER_UID, participantId: PARTICIPANT_ID }
    get.mockResolvedValue({ exists: () => true, val: () => tokenData })
    const result = await resolveToken('some-token')
    expect(result).toEqual(tokenData)
  })

  it('returns null when token does not exist', async () => {
    get.mockResolvedValue({ exists: () => false })
    const result = await resolveToken('invalid-token')
    expect(result).toBeNull()
  })
})

// ─── writeParticipantSession ──────────────────────────────────────────────────

describe('writeParticipantSession', () => {
  it('writes session data to participantSessions/{uid}', async () => {
    const anonUID = 'anon-uid'
    const session = { ownerUID: OWNER_UID, participantId: PARTICIPANT_ID, token: 'tok' }
    await writeParticipantSession(anonUID, session)
    expect(set).toHaveBeenCalledWith({ path: `participantSessions/${anonUID}` }, session)
  })
})

// ─── readParticipantSession ───────────────────────────────────────────────────

describe('readParticipantSession', () => {
  it('returns session data when it exists', async () => {
    const session = { ownerUID: OWNER_UID, participantId: PARTICIPANT_ID, token: 'tok' }
    get.mockResolvedValue({ exists: () => true, val: () => session })
    const result = await readParticipantSession('anon-uid')
    expect(result).toEqual(session)
  })

  it('returns null when no session exists', async () => {
    get.mockResolvedValue({ exists: () => false })
    const result = await readParticipantSession('anon-uid')
    expect(result).toBeNull()
  })
})

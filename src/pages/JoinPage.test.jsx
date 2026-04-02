import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

jest.mock('../utils/firebase', () => ({
  auth: {
    authStateReady: jest.fn().mockResolvedValue(undefined),
    currentUser: null,
  },
}))

jest.mock('firebase/auth', () => ({
  signInAnonymously: jest.fn(),
}))

jest.mock('../utils/db-utils-tokens', () => ({
  resolveToken: jest.fn(),
  writeParticipantSession: jest.fn().mockResolvedValue(undefined),
  readParticipantSession: jest.fn(),
}))

import { auth } from '../utils/firebase'
import { signInAnonymously } from 'firebase/auth'
import { resolveToken, writeParticipantSession, readParticipantSession } from '../utils/db-utils-tokens'
import JoinPage from './JoinPage'

function renderJoin(token = 'test-token') {
  return render(
    <MemoryRouter initialEntries={[`/join/${token}`]}>
      <Routes>
        <Route path="/join/:token" element={<JoinPage />} />
        <Route path="/" element={<div>home page</div>} />
        <Route path="/retro" element={<div>retro page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  auth.authStateReady.mockResolvedValue(undefined)
  auth.currentUser = null
  writeParticipantSession.mockResolvedValue(undefined)
})

describe('JoinPage', () => {
  it('shows loading state while resolving', () => {
    resolveToken.mockResolvedValue(null)
    renderJoin()
    expect(screen.getByText(/joining session/i)).toBeInTheDocument()
  })

  it('shows error message when token is invalid', async () => {
    resolveToken.mockResolvedValue(null)
    renderJoin()
    await waitFor(() => {
      expect(screen.getByText(/invalid or has been revoked/i)).toBeInTheDocument()
    })
  })

  it('signs in anonymously and redirects to /retro for valid token', async () => {
    const tokenData = { ownerUID: 'owner-uid', participantId: 'p1' }
    resolveToken.mockResolvedValue(tokenData)
    signInAnonymously.mockResolvedValue({ user: { uid: 'anon-uid' } })
    renderJoin()
    await waitFor(() => {
      expect(screen.getByText('retro page')).toBeInTheDocument()
    })
    expect(signInAnonymously).toHaveBeenCalled()
    expect(writeParticipantSession).toHaveBeenCalledWith('anon-uid', {
      ownerUID: 'owner-uid',
      participantId: 'p1',
      token: 'test-token',
    })
  })

  it('redirects team lead (non-anonymous) to home page', async () => {
    auth.currentUser = { uid: 'lead-uid', isAnonymous: false }
    resolveToken.mockResolvedValue({ ownerUID: 'owner-uid', participantId: 'p1' })
    renderJoin()
    await waitFor(() => {
      expect(screen.getByText('home page')).toBeInTheDocument()
    })
    expect(signInAnonymously).not.toHaveBeenCalled()
  })

  it('redirects returning anonymous user with valid session to /retro without re-auth', async () => {
    auth.currentUser = { uid: 'anon-uid', isAnonymous: true }
    const tokenData = { ownerUID: 'owner-uid', participantId: 'p1' }
    resolveToken.mockResolvedValue(tokenData)
    readParticipantSession.mockResolvedValue({ ownerUID: 'owner-uid', participantId: 'p1', token: 'test-token' })
    renderJoin()
    await waitFor(() => {
      expect(screen.getByText('retro page')).toBeInTheDocument()
    })
    expect(signInAnonymously).not.toHaveBeenCalled()
  })
})

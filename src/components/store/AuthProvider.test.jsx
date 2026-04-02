import { render, screen, act } from '@testing-library/react'
import { useContext } from 'react'
import { AuthProvider, AuthContext } from './AuthProvider'

jest.mock('../../utils/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    currentUser: null,
  },
}))

jest.mock('../../utils/db-utils-tokens', () => ({
  readParticipantSession: jest.fn(),
}))

import { auth } from '../../utils/firebase'
import { readParticipantSession } from '../../utils/db-utils-tokens'

function AuthConsumer() {
  const { user, isParticipant, participantSession, sessionLoading } = useContext(AuthContext)
  return (
    <div>
      <div>{user ? `user: ${user.uid}` : 'no user'}</div>
      <div>{isParticipant ? 'is-participant' : 'not-participant'}</div>
      <div>{participantSession ? `session: ${participantSession.participantId}` : 'no-session'}</div>
      <div>{sessionLoading ? 'loading' : 'ready'}</div>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    auth.onAuthStateChanged.mockReset()
    auth.onAuthStateChanged.mockReturnValue(() => {}) // return unsubscribe fn
    readParticipantSession.mockReset()
  })

  it('renders children', () => {
    render(
      <AuthProvider>
        <div>child content</div>
      </AuthProvider>
    )
    expect(screen.getByText('child content')).toBeInTheDocument()
  })

  it('provides null user and sessionLoading=true initially', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    expect(screen.getByText('no user')).toBeInTheDocument()
    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  it('calls onAuthStateChanged on mount', () => {
    render(
      <AuthProvider>
        <div />
      </AuthProvider>
    )
    expect(auth.onAuthStateChanged).toHaveBeenCalledTimes(1)
  })

  it('updates user and sets sessionLoading=false when non-anonymous auth fires', async () => {
    readParticipantSession.mockResolvedValue(null)
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    const callback = auth.onAuthStateChanged.mock.calls[0][0]
    await act(async () => {
      callback({ uid: 'test-uid-123', isAnonymous: false })
    })
    expect(screen.getByText('user: test-uid-123')).toBeInTheDocument()
    expect(screen.getByText('not-participant')).toBeInTheDocument()
    expect(screen.getByText('ready')).toBeInTheDocument()
  })

  it('exposes isParticipant=true and session when anonymous user has a valid session', async () => {
    const session = { ownerUID: 'owner-uid', participantId: 'p1', token: 'tok' }
    readParticipantSession.mockResolvedValue(session)
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    const callback = auth.onAuthStateChanged.mock.calls[0][0]
    await act(async () => {
      callback({ uid: 'anon-uid', isAnonymous: true })
    })
    expect(screen.getByText('is-participant')).toBeInTheDocument()
    expect(screen.getByText('session: p1')).toBeInTheDocument()
    expect(readParticipantSession).toHaveBeenCalledWith('anon-uid')
  })

  it('exposes isParticipant=false when anonymous user has no session', async () => {
    readParticipantSession.mockResolvedValue(null)
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    const callback = auth.onAuthStateChanged.mock.calls[0][0]
    await act(async () => {
      callback({ uid: 'anon-uid', isAnonymous: true })
    })
    expect(screen.getByText('not-participant')).toBeInTheDocument()
    expect(screen.getByText('no-session')).toBeInTheDocument()
  })

  it('clears participantSession when user signs out', async () => {
    readParticipantSession.mockResolvedValue(null)
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    const callback = auth.onAuthStateChanged.mock.calls[0][0]
    await act(async () => {
      callback(null)
    })
    expect(screen.getByText('no user')).toBeInTheDocument()
    expect(screen.getByText('not-participant')).toBeInTheDocument()
    expect(screen.getByText('ready')).toBeInTheDocument()
  })
})

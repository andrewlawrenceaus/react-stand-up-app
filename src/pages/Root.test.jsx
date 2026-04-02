import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import RootLayout, { loadStandUps } from './Root'
import { AuthContext } from '../components/store/AuthProvider'

jest.mock('../utils/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    authStateReady: jest.fn().mockResolvedValue(undefined),
    currentUser: null,
  },
}))

jest.mock('firebase/auth', () => ({
  signOut: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('../utils/db-utils', () => ({
  getTeamsAndParticipants: jest.fn().mockResolvedValue({
    teams: { Alpha: ['1'] },
    participants: { '1': { id: '1', name: 'Alice', photoUrl: '' } },
  }),
  migrateParticipantsIfNeeded: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('../utils/db-utils-tokens', () => ({
  readParticipantSession: jest.fn(),
}))

import { auth } from '../utils/firebase'
import { getTeamsAndParticipants } from '../utils/db-utils'
import { readParticipantSession } from '../utils/db-utils-tokens'

function renderRoot({ user = null, isParticipant = false, initialPath = '/' } = {}) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <AuthContext.Provider value={{ user, isParticipant, participantSession: null, sessionLoading: false }}>
            <RootLayout />
          </AuthContext.Provider>
        ),
        children: [
          { index: true, element: <div>home page</div> },
          { path: 'auth', element: <div>auth page</div> },
          { path: 'manage-teams', element: <div>manage teams page</div> },
          { path: 'participants', element: <div>participants page</div> },
          { path: 'retro', element: <div>retro page</div> },
        ],
      },
    ],
    { initialEntries: [initialPath] }
  )
  return render(<RouterProvider router={router} />)
}

describe('RootLayout — team lead', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the Header', () => {
    renderRoot({ user: { uid: '123' } })
    expect(screen.getByText('Stand-Up Duck')).toBeInTheDocument()
  })

  it('renders children (Outlet) when user is authenticated', () => {
    renderRoot({ user: { uid: '123' } })
    expect(screen.getByText('home page')).toBeInTheDocument()
  })

  it('redirects to /auth?mode=login when user is null', () => {
    renderRoot({ user: null, initialPath: '/' })
    expect(screen.getByText('auth page')).toBeInTheDocument()
  })

  it('does not redirect when already on /auth', () => {
    renderRoot({ user: null, initialPath: '/auth' })
    expect(screen.getByText('auth page')).toBeInTheDocument()
  })
})

describe('RootLayout — participant guard', () => {
  const participantUser = { uid: 'anon', isAnonymous: true }

  it('redirects participant from / to /retro', () => {
    renderRoot({ user: participantUser, isParticipant: true, initialPath: '/' })
    expect(screen.getByText('retro page')).toBeInTheDocument()
  })

  it('redirects participant from /manage-teams to /retro', () => {
    renderRoot({ user: participantUser, isParticipant: true, initialPath: '/manage-teams' })
    expect(screen.getByText('retro page')).toBeInTheDocument()
  })

  it('redirects participant from /participants to /retro', () => {
    renderRoot({ user: participantUser, isParticipant: true, initialPath: '/participants' })
    expect(screen.getByText('retro page')).toBeInTheDocument()
  })

  it('allows participant to access /retro', () => {
    renderRoot({ user: participantUser, isParticipant: true, initialPath: '/retro' })
    expect(screen.getByText('retro page')).toBeInTheDocument()
  })
})

describe('loadStandUps', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls getTeamsAndParticipants and returns teams and participants for team lead', async () => {
    auth.currentUser = { uid: 'lead-uid', isAnonymous: false }
    const result = await loadStandUps()
    expect(getTeamsAndParticipants).toHaveBeenCalled()
    expect(result).toEqual({
      teams: { Alpha: ['1'] },
      participants: { '1': { id: '1', name: 'Alice', photoUrl: '' } },
    })
  })

  it('returns empty data when no user is signed in', async () => {
    auth.currentUser = null
    const result = await loadStandUps()
    expect(result).toEqual({ teams: {}, participants: {} })
  })

  it('uses ownerUID from session for anonymous/participant user', async () => {
    auth.currentUser = { uid: 'anon-uid', isAnonymous: true }
    const session = { ownerUID: 'owner-uid', participantId: 'p1', token: 'tok' }
    readParticipantSession.mockResolvedValue(session)
    getTeamsAndParticipants.mockResolvedValue({ teams: { Beta: ['2'] }, participants: {} })
    const result = await loadStandUps()
    expect(readParticipantSession).toHaveBeenCalledWith('anon-uid')
    expect(getTeamsAndParticipants).toHaveBeenCalledWith('owner-uid')
    expect(result.teams).toEqual({ Beta: ['2'] })
  })

  it('returns empty data when anonymous user has no session', async () => {
    auth.currentUser = { uid: 'anon-uid', isAnonymous: true }
    readParticipantSession.mockResolvedValue(null)
    const result = await loadStandUps()
    expect(result).toEqual({ teams: {}, participants: {} })
  })
})

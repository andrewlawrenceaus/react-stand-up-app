import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import RootLayout, { loadStandUps } from './Root'
import { AuthContext } from '../components/store/AuthProvider'

jest.mock('../utils/firebase', () => ({
  auth: { onAuthStateChanged: jest.fn() },
}))

jest.mock('firebase/auth', () => ({
  signOut: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('../utils/db-utils', () => ({
  getTeams: jest.fn().mockResolvedValue({ Alpha: ['Alice'] }),
}))

import { getTeams } from '../utils/db-utils'

function renderRoot({ user = null, initialPath = '/' } = {}) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <AuthContext.Provider value={{ user }}>
            <RootLayout />
          </AuthContext.Provider>
        ),
        children: [
          { index: true, element: <div>home page</div> },
          { path: 'auth', element: <div>auth page</div> },
        ],
      },
    ],
    { initialEntries: [initialPath] }
  )
  return render(<RouterProvider router={router} />)
}

describe('RootLayout', () => {
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

describe('loadStandUps', () => {
  it('calls getTeams and returns the result', async () => {
    const result = await loadStandUps()
    expect(getTeams).toHaveBeenCalled()
    expect(result).toEqual({ Alpha: ['Alice'] })
  })
})

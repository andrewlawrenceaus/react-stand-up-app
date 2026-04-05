import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Header from './Header'
import { AuthContext } from '../store/AuthProvider'

jest.mock('../../utils/firebase', () => ({
  auth: {},
}))

jest.mock('firebase/auth', () => ({
  signOut: jest.fn().mockResolvedValue(undefined),
}))

function renderHeader({ user = null } = {}) {
  return render(
    <AuthContext.Provider value={{ user }}>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('Header', () => {
  it('renders the app title "Stand-Up Duck"', () => {
    renderHeader()
    expect(screen.getByText('Stand-Up Duck')).toBeInTheDocument()
  })

  it('shows Login button when user is not authenticated', () => {
    renderHeader({ user: null })
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
  })

  it('does not show Manage Teams or Run Stand-Up when unauthenticated', () => {
    renderHeader({ user: null })
    expect(screen.queryByRole('link', { name: /manage teams/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /run stand-up/i })).not.toBeInTheDocument()
  })

  it('shows Manage Teams and Run Stand-Up links when authenticated', () => {
    renderHeader({ user: { uid: 'test-uid' } })
    expect(screen.getByRole('link', { name: /manage teams/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /run stand-up/i })).toBeInTheDocument()
  })

  it('shows Pick Rep link when authenticated', () => {
    renderHeader({ user: { uid: 'test-uid' } })
    expect(screen.getByRole('link', { name: /pick rep/i })).toBeInTheDocument()
  })

  it('does not show Pick Rep link when unauthenticated', () => {
    renderHeader({ user: null })
    expect(screen.queryByRole('link', { name: /pick rep/i })).not.toBeInTheDocument()
  })

  it('shows Log Out button when authenticated', () => {
    renderHeader({ user: { uid: 'test-uid' } })
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })

  it('calls signOut when Log Out is clicked', async () => {
    const user = userEvent.setup()
    const { signOut } = require('firebase/auth')
    renderHeader({ user: { uid: 'test-uid' } })
    await user.click(screen.getByRole('button', { name: /log out/i }))
    expect(signOut).toHaveBeenCalled()
  })
})

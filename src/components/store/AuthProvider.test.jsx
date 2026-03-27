import { render, screen, act } from '@testing-library/react'
import { useContext } from 'react'
import { AuthProvider, AuthContext } from './AuthProvider'

jest.mock('../../utils/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
  },
}))

import { auth } from '../../utils/firebase'

function AuthConsumer() {
  const { user } = useContext(AuthContext)
  return <div>{user ? `user: ${user.uid}` : 'no user'}</div>
}

describe('AuthProvider', () => {
  beforeEach(() => {
    auth.onAuthStateChanged.mockReset()
    auth.onAuthStateChanged.mockReturnValue(() => {}) // return unsubscribe fn
  })

  it('renders children', () => {
    render(
      <AuthProvider>
        <div>child content</div>
      </AuthProvider>
    )
    expect(screen.getByText('child content')).toBeInTheDocument()
  })

  it('provides null user initially', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    expect(screen.getByText('no user')).toBeInTheDocument()
  })

  it('calls onAuthStateChanged on mount', () => {
    render(
      <AuthProvider>
        <div />
      </AuthProvider>
    )
    expect(auth.onAuthStateChanged).toHaveBeenCalledTimes(1)
  })

  it('updates user when onAuthStateChanged callback fires', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    const callback = auth.onAuthStateChanged.mock.calls[0][0]
    act(() => {
      callback({ uid: 'test-uid-123' })
    })
    expect(screen.getByText('user: test-uid-123')).toBeInTheDocument()
  })
})

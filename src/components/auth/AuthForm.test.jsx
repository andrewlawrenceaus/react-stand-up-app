import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import AuthForm from './AuthForm'

function renderAuthForm(search = '?mode=login', actionData = null) {
  const router = createMemoryRouter(
    [
      {
        path: '/auth',
        element: <AuthForm />,
        action: () => actionData,
      },
    ],
    { initialEntries: [`/auth${search}`] }
  )
  return render(<RouterProvider router={router} />)
}

describe('AuthForm', () => {
  it('renders Log In heading in login mode', () => {
    renderAuthForm('?mode=login')
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument()
  })

  it('renders Create New User heading in signup mode', () => {
    renderAuthForm('?mode=signup')
    expect(screen.getByRole('heading', { name: /create new user/i })).toBeInTheDocument()
  })

  it('renders Email Address and Password fields', () => {
    renderAuthForm()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('shows "Don\'t have an account? Sign Up" link in login mode', () => {
    renderAuthForm('?mode=login')
    expect(screen.getByText(/don't have an account\? sign up/i)).toBeInTheDocument()
  })

  it('shows "Already have an account? Log In" link in signup mode', () => {
    renderAuthForm('?mode=signup')
    expect(screen.getByText(/already have an account\? log in/i)).toBeInTheDocument()
  })

  it('Submit button is present and not disabled by default', () => {
    renderAuthForm()
    const submitButton = screen.getByRole('button', { name: /submit/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).not.toBeDisabled()
  })
})

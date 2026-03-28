import { render, screen } from '@testing-library/react'
import InitialsAvatar from './InitialsAvatar'

describe('InitialsAvatar', () => {
  it('renders two initials for a two-word name', () => {
    render(<InitialsAvatar name="Alice Smith" />)
    expect(screen.getByText('AS')).toBeInTheDocument()
  })

  it('renders a single initial for a one-word name', () => {
    render(<InitialsAvatar name="Bob" />)
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('renders first and last initials for a multi-word name', () => {
    render(<InitialsAvatar name="John Doe" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders without error when sx prop is provided', () => {
    render(<InitialsAvatar name="Alice Smith" sx={{ width: 56, height: 56 }} />)
    expect(screen.getByText('AS')).toBeInTheDocument()
  })
})

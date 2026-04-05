import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WinnerDisplay from './WinnerDisplay'

describe('WinnerDisplay', () => {
  const onReset = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the winner name', () => {
    render(<WinnerDisplay winner={{ name: 'Alice' }} onReset={onReset} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders "Selected Representative" subtitle', () => {
    render(<WinnerDisplay winner={{ name: 'Alice' }} onReset={onReset} />)
    expect(screen.getByText('Selected Representative')).toBeInTheDocument()
  })

  it('renders InitialsAvatar when no photoUrl', () => {
    render(<WinnerDisplay winner={{ name: 'Alice' }} onReset={onReset} />)
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(document.querySelector('img')).not.toBeInTheDocument()
  })

  it('renders an img when photoUrl is provided', () => {
    render(
      <WinnerDisplay
        winner={{ name: 'Alice', photoUrl: 'https://example.com/alice.jpg' }}
        onReset={onReset}
      />
    )
    const img = screen.getByRole('img', { name: 'Alice' })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/alice.jpg')
  })

  it('calls onReset when "Spin Again" is clicked', async () => {
    const user = userEvent.setup()
    render(<WinnerDisplay winner={{ name: 'Alice' }} onReset={onReset} />)
    await user.click(screen.getByRole('button', { name: /spin again/i }))
    expect(onReset).toHaveBeenCalledTimes(1)
  })
})

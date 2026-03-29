import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ParticipantCard from './ParticipantCard'

const defaultProps = {
  attendee: { id: '1', name: 'Alice', photoUrl: '' },
  passDuckHandler: jest.fn(),
  lateParticipantHandler: jest.fn(),
}

describe('ParticipantCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the attendee name', () => {
    render(<ParticipantCard {...defaultProps} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders Pass the Duck button', () => {
    render(<ParticipantCard {...defaultProps} />)
    expect(screen.getByRole('button', { name: /pass the duck/i })).toBeInTheDocument()
  })

  it('renders Not Ready button', () => {
    render(<ParticipantCard {...defaultProps} />)
    expect(screen.getByRole('button', { name: /not ready/i })).toBeInTheDocument()
  })

  it('calls passDuckHandler when Pass the Duck is clicked', async () => {
    const user = userEvent.setup()
    render(<ParticipantCard {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /pass the duck/i }))
    expect(defaultProps.passDuckHandler).toHaveBeenCalledTimes(1)
  })

  it('calls lateParticipantHandler when Not Ready is clicked', async () => {
    const user = userEvent.setup()
    render(<ParticipantCard {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /not ready/i }))
    expect(defaultProps.lateParticipantHandler).toHaveBeenCalledTimes(1)
  })

})

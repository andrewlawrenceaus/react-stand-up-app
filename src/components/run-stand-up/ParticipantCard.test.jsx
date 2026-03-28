import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ParticipantCard from './ParticipantCard'

const defaultProps = {
  attendee: 'Alice',
  passDuckHandler: jest.fn(),
  lateParticipantHandler: jest.fn(),
  percentageComplete: 0.5,
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

  it('renders duck image with title "duck"', () => {
    render(<ParticipantCard {...defaultProps} />)
    expect(screen.getByTitle('duck')).toBeInTheDocument()
  })

  it('renders without crashing at percentageComplete 0', () => {
    render(<ParticipantCard {...defaultProps} percentageComplete={0} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders without crashing at percentageComplete 1', () => {
    render(<ParticipantCard {...defaultProps} percentageComplete={1} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
})

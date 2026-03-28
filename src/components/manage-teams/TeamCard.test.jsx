import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TeamCard from './TeamCard'

const allParticipants = {
  '1': { id: '1', name: 'Alice', photoUrl: '' },
  '2': { id: '2', name: 'Bob', photoUrl: '' },
  '3': { id: '3', name: 'Charlie', photoUrl: '' },
}

const defaultProps = {
  teamName: 'Alpha',
  participants: ['1', '2'],
  allParticipants,
  addParticipant: jest.fn(),
  removeParticipant: jest.fn(),
  removeTeam: jest.fn(),
}

function renderTeamCard(props = {}) {
  return render(
    <MemoryRouter>
      <TeamCard {...defaultProps} {...props} />
    </MemoryRouter>
  )
}

describe('TeamCard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the team name', () => {
    renderTeamCard()
    expect(screen.getByText('Alpha')).toBeInTheDocument()
  })

  it('renders all participants', () => {
    renderTeamCard()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('does not show delete participant buttons before edit mode', () => {
    renderTeamCard()
    expect(screen.queryAllByRole('button', { name: /^delete$/i })).toHaveLength(0)
  })

  it('shows delete participant buttons in edit mode', async () => {
    const user = userEvent.setup()
    renderTeamCard()
    const buttons = screen.getAllByRole('button')
    const editButton = buttons.find((b) => !b.textContent.includes('Stand-Up'))
    await user.click(editButton)
    expect(screen.getAllByRole('button', { name: /^delete$/i })).toHaveLength(2)
  })

  it('calls removeParticipant with correct args when delete is clicked', async () => {
    const user = userEvent.setup()
    renderTeamCard()
    const editButton = screen.getAllByRole('button').find((b) => !b.textContent.includes('Stand-Up'))
    await user.click(editButton)
    const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i })
    await user.click(deleteButtons[0]) // Delete Alice (id '1')
    expect(defaultProps.removeParticipant).toHaveBeenCalledWith('Alpha', '1')
  })

  it('calls addParticipant with participant id when selected from Autocomplete and Add Participant is clicked', async () => {
    const user = userEvent.setup()
    renderTeamCard()
    const editButton = screen.getAllByRole('button').find((b) => !b.textContent.includes('Stand-Up'))
    await user.click(editButton)
    // Charlie (id '3') is the only participant not already in the team
    const autocomplete = screen.getByLabelText(/add participant/i)
    await user.click(autocomplete)
    await user.click(screen.getByText('Charlie'))
    await user.click(screen.getByRole('button', { name: /add participant/i }))
    expect(defaultProps.addParticipant).toHaveBeenCalledWith('Alpha', '3')
  })

  it('calls removeTeam with team name when Delete Team is clicked', async () => {
    const user = userEvent.setup()
    renderTeamCard()
    const editButton = screen.getAllByRole('button').find((b) => !b.textContent.includes('Stand-Up'))
    await user.click(editButton)
    await user.click(screen.getByRole('button', { name: /delete team/i }))
    expect(defaultProps.removeTeam).toHaveBeenCalledWith('Alpha')
  })

  it('Start Stand-Up link navigates to /?team=Alpha', () => {
    renderTeamCard()
    const link = screen.getByRole('link', { name: /start stand-up/i })
    expect(link).toHaveAttribute('href', '/?team=Alpha')
  })

  it('renders with empty participants array without crashing', () => {
    renderTeamCard({ participants: [] })
    expect(screen.getByText('Alpha')).toBeInTheDocument()
  })

  it('shows message when no allParticipants exist', async () => {
    const user = userEvent.setup()
    renderTeamCard({ allParticipants: {}, participants: [] })
    const editButton = screen.getAllByRole('button').find((b) => !b.textContent.includes('Stand-Up'))
    await user.click(editButton)
    expect(screen.getByText(/no participants yet/i)).toBeInTheDocument()
  })

  it('shows message when all participants are already in the team', async () => {
    const user = userEvent.setup()
    renderTeamCard({ participants: ['1', '2', '3'] })
    const editButton = screen.getAllByRole('button').find((b) => !b.textContent.includes('Stand-Up'))
    await user.click(editButton)
    expect(screen.getByText(/all participants are already in this team/i)).toBeInTheDocument()
  })
})

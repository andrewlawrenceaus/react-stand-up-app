import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TeamCard from './TeamCard'

const defaultProps = {
  teamName: 'Alpha',
  participants: ['Alice', 'Bob'],
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
    // Click the edit icon button (no accessible name — look for it by its icon role)
    const buttons = screen.getAllByRole('button')
    // Edit button is the last button in the top row
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
    await user.click(deleteButtons[0]) // Delete Alice
    expect(defaultProps.removeParticipant).toHaveBeenCalledWith('Alpha', 'Alice')
  })

  it('calls addParticipant with correct args when Add Participant is clicked', async () => {
    const user = userEvent.setup()
    renderTeamCard()
    const editButton = screen.getAllByRole('button').find((b) => !b.textContent.includes('Stand-Up'))
    await user.click(editButton)
    await user.type(screen.getByLabelText(/name/i), 'Charlie')
    await user.click(screen.getByRole('button', { name: /add participant/i }))
    expect(defaultProps.addParticipant).toHaveBeenCalledWith('Alpha', 'Charlie')
  })

  it('clears the participant input after add', async () => {
    const user = userEvent.setup()
    renderTeamCard()
    const editButton = screen.getAllByRole('button').find((b) => !b.textContent.includes('Stand-Up'))
    await user.click(editButton)
    const nameInput = screen.getByLabelText(/name/i)
    await user.type(nameInput, 'Charlie')
    await user.click(screen.getByRole('button', { name: /add participant/i }))
    expect(nameInput.value).toBe('')
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
})

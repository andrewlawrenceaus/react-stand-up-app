import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ManageTeams from './ManageTeams'
import { writeTeams } from '../../utils/db-utils'

jest.mock('../../utils/db-utils', () => ({
  writeTeams: jest.fn().mockResolvedValue(undefined),
}))

const teams = { Alpha: ['Alice', 'Bob'], Beta: ['Charlie'] }

function renderManageTeams(props = {}) {
  return render(
    <MemoryRouter>
      <ManageTeams teams={teams} {...props} />
    </MemoryRouter>
  )
}

describe('ManageTeams', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders Manage Teams heading', () => {
    renderManageTeams()
    expect(screen.getByText('Manage Teams')).toBeInTheDocument()
  })

  it('renders a TeamCard for each team', () => {
    renderManageTeams()
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('renders participants for each team', () => {
    renderManageTeams()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('renders AddTeam form', () => {
    renderManageTeams()
    expect(screen.getByRole('button', { name: /add team/i })).toBeInTheDocument()
  })

  it('adding a team creates a new TeamCard', async () => {
    const user = userEvent.setup()
    renderManageTeams()
    await user.type(screen.getByLabelText(/team name/i), 'Gamma')
    await user.click(screen.getByRole('button', { name: /add team/i }))
    expect(screen.getByText('Gamma')).toBeInTheDocument()
  })

  it('calls writeTeams after adding a team', async () => {
    const user = userEvent.setup()
    renderManageTeams()
    await user.type(screen.getByLabelText(/team name/i), 'Gamma')
    await user.click(screen.getByRole('button', { name: /add team/i }))
    expect(writeTeams).toHaveBeenCalled()
  })
})

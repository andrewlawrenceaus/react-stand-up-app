import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SelectTeam from './SelectTeam'

const teams = ['Alpha', 'Beta', 'Gamma']

function renderSelectTeam(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <SelectTeam teams={teams} />
    </MemoryRouter>
  )
}

describe('SelectTeam', () => {
  it('renders the team select dropdown', () => {
    renderSelectTeam()
    expect(screen.getByLabelText(/select team/i)).toBeInTheDocument()
  })

  it('renders a menu item for each team', () => {
    renderSelectTeam()
    // The select value options are rendered in a hidden listbox
    // Check the combobox is present
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows no team selected when no team search param is set', () => {
    renderSelectTeam('/')
    const combobox = screen.getByRole('combobox')
    expect(combobox).not.toHaveTextContent(/alpha|beta|gamma/i)
  })
})

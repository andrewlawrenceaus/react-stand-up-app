import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RetroParticipantSelect from './RetroParticipantSelect'

const participants = [
  { id: 'p1', name: 'Alice', photoUrl: '' },
  { id: 'p2', name: 'Bob', photoUrl: 'https://example.com/bob.jpg' },
]

function renderSelect(onSelect = jest.fn()) {
  return render(<RetroParticipantSelect participants={participants} onSelect={onSelect} />)
}

describe('RetroParticipantSelect — display', () => {
  it('renders the "Who are you?" heading', () => {
    renderSelect()
    expect(screen.getByText('Who are you?')).toBeInTheDocument()
  })

  it('renders a button for each participant', () => {
    renderSelect()
    expect(screen.getByRole('button', { name: /alice/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bob/i })).toBeInTheDocument()
  })

  it('shows photo img when participant has a photoUrl', () => {
    renderSelect()
    expect(screen.getByAltText('Bob')).toBeInTheDocument()
  })

  it('shows initials avatar when participant has no photoUrl', () => {
    renderSelect()
    // InitialsAvatar renders with role="img" and aria-label=name
    expect(screen.getByRole('img', { name: 'Alice' })).toBeInTheDocument()
  })
})

describe('RetroParticipantSelect — interaction', () => {
  it('calls onSelect with participant id when a button is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    renderSelect(onSelect)
    await user.click(screen.getByRole('button', { name: /alice/i }))
    expect(onSelect).toHaveBeenCalledWith('p1')
  })

  it('calls onSelect with the correct id for each participant', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    renderSelect(onSelect)
    await user.click(screen.getByRole('button', { name: /bob/i }))
    expect(onSelect).toHaveBeenCalledWith('p2')
  })
})

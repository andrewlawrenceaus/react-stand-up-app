import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ParticipantListItem from './ParticipantListItem'

describe('ParticipantListItem', () => {
  it('renders the participant name', () => {
    render(
      <ParticipantListItem
        participant={{ id: '1', name: 'Alice', photoUrl: '' }}
        onDelete={jest.fn()}
      />
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('shows an img avatar when photoUrl is set', () => {
    render(
      <ParticipantListItem
        participant={{ id: '1', name: 'Alice', photoUrl: 'https://example.com/alice.jpg' }}
        onDelete={jest.fn()}
      />
    )
    expect(screen.getByRole('img', { name: 'Alice' })).toBeInTheDocument()
  })

  it('shows initials avatar when photoUrl is empty', () => {
    render(
      <ParticipantListItem
        participant={{ id: '1', name: 'Alice Smith', photoUrl: '' }}
        onDelete={jest.fn()}
      />
    )
    expect(screen.getByText('AS')).toBeInTheDocument()
  })

  it('calls onDelete with the participant id when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = jest.fn()
    render(
      <ParticipantListItem
        participant={{ id: '42', name: 'Alice', photoUrl: '' }}
        onDelete={onDelete}
      />
    )
    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('42')
  })
})

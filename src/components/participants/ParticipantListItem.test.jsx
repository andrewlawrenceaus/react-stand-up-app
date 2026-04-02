import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ParticipantListItem from './ParticipantListItem'

jest.mock('../../utils/db-utils', () => ({
  uploadParticipantPhoto: jest.fn(),
}))

const baseParticipant = { id: '1', name: 'Alice', photoUrl: '', inviteToken: null }

function renderItem(participant = baseParticipant, handlers = {}) {
  return render(
    <ParticipantListItem
      participant={participant}
      onDelete={handlers.onDelete || jest.fn()}
      onGenerateToken={handlers.onGenerateToken || jest.fn()}
      onRevokeToken={handlers.onRevokeToken || jest.fn()}
    />
  )
}

describe('ParticipantListItem — basics', () => {
  it('renders the participant name', () => {
    renderItem()
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('shows an img avatar when photoUrl is set', () => {
    renderItem({ ...baseParticipant, photoUrl: 'https://example.com/alice.jpg' })
    expect(screen.getByRole('img', { name: 'Alice' })).toBeInTheDocument()
  })

  it('shows initials avatar when photoUrl is empty', () => {
    renderItem({ ...baseParticipant, name: 'Alice Smith' })
    expect(screen.getByText('AS')).toBeInTheDocument()
  })

  it('calls onDelete with the participant id when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = jest.fn()
    renderItem(baseParticipant, { onDelete })
    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('1')
  })
})

describe('ParticipantListItem — invite link (no token)', () => {
  it('shows Generate Link button when participant has no token', () => {
    renderItem({ ...baseParticipant, inviteToken: null })
    expect(screen.getByRole('button', { name: /generate link/i })).toBeInTheDocument()
  })

  it('does not show Copy Link or Revoke when no token', () => {
    renderItem({ ...baseParticipant, inviteToken: null })
    expect(screen.queryByRole('button', { name: /copy link/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /revoke/i })).not.toBeInTheDocument()
  })

  it('calls onGenerateToken with participant id when Generate Link is clicked', async () => {
    const user = userEvent.setup()
    const onGenerateToken = jest.fn()
    renderItem(baseParticipant, { onGenerateToken })
    await user.click(screen.getByRole('button', { name: /generate link/i }))
    expect(onGenerateToken).toHaveBeenCalledWith('1')
  })
})

describe('ParticipantListItem — invite link (with token)', () => {
  const participantWithToken = { ...baseParticipant, inviteToken: 'tok-abc' }

  it('shows Copy Link and Revoke buttons when token exists', () => {
    renderItem(participantWithToken)
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /revoke/i })).toBeInTheDocument()
  })

  it('does not show Generate Link when token exists', () => {
    renderItem(participantWithToken)
    expect(screen.queryByRole('button', { name: /generate link/i })).not.toBeInTheDocument()
  })

  it('copies the join link to clipboard when Copy Link is clicked', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      writable: true,
    })
    renderItem(participantWithToken)
    await user.click(screen.getByRole('button', { name: /copy link/i }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/join/tok-abc')
    )
  })

  it('calls onRevokeToken with participant id and token when Revoke is clicked', async () => {
    const user = userEvent.setup()
    const onRevokeToken = jest.fn()
    renderItem(participantWithToken, { onRevokeToken })
    await user.click(screen.getByRole('button', { name: /revoke/i }))
    expect(onRevokeToken).toHaveBeenCalledWith('1', 'tok-abc')
  })
})

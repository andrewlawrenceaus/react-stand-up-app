import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShareLinksModal from './ShareLinksModal'

const participants = [
  { id: 'p1', name: 'Alice', inviteToken: 'tok-alice' },
  { id: 'p2', name: 'Bob', inviteToken: 'tok-bob' },
]

const writeText = jest.fn().mockResolvedValue(undefined)

beforeAll(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    writable: true,
    configurable: true,
  })
})

beforeEach(() => {
  writeText.mockClear()
  jest.useFakeTimers()
})

afterEach(() => {
  jest.runAllTimers()
  jest.useRealTimers()
})

function renderModal({ open = true, onClose = jest.fn() } = {}) {
  return render(
    <ShareLinksModal open={open} onClose={onClose} participants={participants} />
  )
}

describe('ShareLinksModal', () => {
  it('renders participant names when open', () => {
    renderModal()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders join links using window.location.origin', () => {
    renderModal()
    expect(screen.getByText(new RegExp(`${window.location.origin}/join/tok-alice`))).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`${window.location.origin}/join/tok-bob`))).toBeInTheDocument()
  })

  it('Copy all button writes plain-text block with header to clipboard', async () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: /copy all/i }))
    await act(async () => {})
    expect(writeText).toHaveBeenCalledTimes(1)
    const written = writeText.mock.calls[0][0]
    expect(written).toContain("Stand-up links for today's session:")
    expect(written).toContain(`Alice — ${window.location.origin}/join/tok-alice`)
    expect(written).toContain(`Bob — ${window.location.origin}/join/tok-bob`)
  })

  it('calls onClose when the dialog Close action button is clicked', () => {
    const onClose = jest.fn()
    renderModal({ onClose })
    // Get the text "Close" button in DialogActions (not the icon button)
    const closeButtons = screen.getAllByRole('button', { name: /close/i })
    const textCloseButton = closeButtons.find(btn => btn.textContent === 'Close')
    fireEvent.click(textCloseButton)
    expect(onClose).toHaveBeenCalled()
  })

  it('does not render content when closed', () => {
    renderModal({ open: false })
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })
})

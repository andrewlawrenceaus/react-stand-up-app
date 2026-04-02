import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RetroBoard from './RetroBoard'

jest.mock('../../utils/db-utils', () => ({
  subscribeToActiveRetro: jest.fn(),
  getPreviousRetro: jest.fn().mockResolvedValue(null),
  createRetro: jest.fn().mockResolvedValue(undefined),
  addRetroItem: jest.fn().mockResolvedValue(undefined),
  updateRetroItem: jest.fn().mockResolvedValue(undefined),
  removeRetroItem: jest.fn(),
  toggleAgree: jest.fn(),
  updateRetroCategory: jest.fn().mockResolvedValue(undefined),
  removeRetroCategory: jest.fn().mockResolvedValue(undefined),
  clearItemsByCategory: jest.fn().mockResolvedValue(undefined),
  completeRetro: jest.fn().mockResolvedValue(undefined),
  clearAllItemsExceptCategory: jest.fn().mockResolvedValue(undefined),
  updateRetroTimer: jest.fn().mockResolvedValue(undefined),
  addRetroCategory: jest.fn().mockResolvedValue(undefined),
}))

import { subscribeToActiveRetro } from '../../utils/db-utils'

const TEAM = 'Alpha'
const participants = [
  { id: 'p1', name: 'Alice', photoUrl: '' },
  { id: 'p2', name: 'Bob', photoUrl: '' },
]

const activeRetroState = {
  timerDuration: null,
  timerStartedAt: null,
  categories: {
    'cat-1': { id: 'cat-1', name: 'What went well', order: 0, isProtected: false },
    'cat-action': { id: 'cat-action', name: 'Action Items', order: 1, isProtected: true },
  },
  items: false,
}

function mockSubscribe(data) {
  subscribeToActiveRetro.mockImplementation((_teamName, callback) => {
    callback(data)
    return jest.fn() // unsubscribe
  })
}

function renderBoard() {
  return render(<RetroBoard teamName={TEAM} participants={participants} />)
}

function renderParticipantBoard(participantId = 'p1') {
  return render(
    <RetroBoard
      teamName={TEAM}
      participants={participants}
      isParticipant={true}
      participantId={participantId}
      ownerUID="owner-uid"
    />
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  sessionStorage.clear()
})

describe('RetroBoard — loading state', () => {
  it('shows loading indicator before subscription fires', () => {
    subscribeToActiveRetro.mockImplementation(() => jest.fn())
    renderBoard()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})

describe('RetroBoard — no active retro', () => {
  it('shows RetroSetup when retro data is null', () => {
    mockSubscribe(null)
    renderBoard()
    expect(screen.getByText('Start a Retro')).toBeInTheDocument()
  })
})

describe('RetroBoard — participant selection', () => {
  it('shows participant select screen when no participant is stored', () => {
    mockSubscribe(activeRetroState)
    renderBoard()
    expect(screen.getByText('Who are you?')).toBeInTheDocument()
  })

  it('shows participant select when sessionStorage has an invalid id', () => {
    sessionStorage.setItem(`retro-participant-${TEAM}`, 'unknown-id')
    mockSubscribe(activeRetroState)
    renderBoard()
    expect(screen.getByText('Who are you?')).toBeInTheDocument()
  })

  it('shows the board after a participant selects themselves', async () => {
    const user = userEvent.setup()
    mockSubscribe(activeRetroState)
    renderBoard()
    await user.click(screen.getByRole('button', { name: /alice/i }))
    expect(screen.getByText(/you are/i)).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('restores participant from sessionStorage on mount', () => {
    sessionStorage.setItem(`retro-participant-${TEAM}`, 'p1')
    mockSubscribe(activeRetroState)
    renderBoard()
    expect(screen.queryByText('Who are you?')).not.toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
})

describe('RetroBoard — active board', () => {
  beforeEach(() => {
    sessionStorage.setItem(`retro-participant-${TEAM}`, 'p1')
    mockSubscribe(activeRetroState)
  })

  it('renders category columns', () => {
    renderBoard()
    expect(screen.getByText('What went well')).toBeInTheDocument()
    expect(screen.getByText('Action Items')).toBeInTheDocument()
  })

  it('shows the Add Category button', () => {
    renderBoard()
    expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument()
  })

  it('shows the Complete Retro button', () => {
    renderBoard()
    expect(screen.getByRole('button', { name: /complete retro/i })).toBeInTheDocument()
  })

  it('clicking Change clears sessionStorage and shows participant select', async () => {
    const user = userEvent.setup()
    renderBoard()
    await user.click(screen.getByRole('button', { name: /change/i }))
    expect(screen.getByText('Who are you?')).toBeInTheDocument()
    expect(sessionStorage.getItem(`retro-participant-${TEAM}`)).toBeNull()
  })
})

describe('RetroBoard — participant mode (no active retro)', () => {
  it('shows Waiting message instead of RetroSetup', () => {
    mockSubscribe(null)
    renderParticipantBoard()
    expect(screen.getByText(/waiting for the team lead/i)).toBeInTheDocument()
    expect(screen.queryByText('Start a Retro')).not.toBeInTheDocument()
  })
})

describe('RetroBoard — participant mode (active retro)', () => {
  beforeEach(() => {
    mockSubscribe(activeRetroState)
  })

  it('auto-selects the participant without showing Who are you?', () => {
    renderParticipantBoard('p1')
    expect(screen.queryByText('Who are you?')).not.toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('does not show the Change button for participants', () => {
    renderParticipantBoard('p1')
    expect(screen.queryByRole('button', { name: /change/i })).not.toBeInTheDocument()
  })

  it('does not show the Add Category button for participants', () => {
    renderParticipantBoard('p1')
    expect(screen.queryByRole('button', { name: /add category/i })).not.toBeInTheDocument()
  })

  it('does not show the Complete Retro button for participants', () => {
    renderParticipantBoard('p1')
    expect(screen.queryByRole('button', { name: /complete retro/i })).not.toBeInTheDocument()
  })

  it('renders category columns', () => {
    renderParticipantBoard('p1')
    expect(screen.getByText('What went well')).toBeInTheDocument()
    expect(screen.getByText('Action Items')).toBeInTheDocument()
  })
})

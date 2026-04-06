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
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0)
  })

  it('restores participant from sessionStorage on mount', () => {
    sessionStorage.setItem(`retro-participant-${TEAM}`, 'p1')
    mockSubscribe(activeRetroState)
    renderBoard()
    expect(screen.queryByText('Who are you?')).not.toBeInTheDocument()
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0)
  })
})

const retroWithItems = {
  ...activeRetroState,
  categories: {
    'cat-1': { id: 'cat-1', name: 'What went well', order: 0, isProtected: false },
    'cat-2': { id: 'cat-2', name: 'What to improve', order: 1, isProtected: false },
    'cat-action': { id: 'cat-action', name: 'Action Items', order: 2, isProtected: true },
  },
  items: {
    'item-1': { id: 'item-1', categoryId: 'cat-1', text: 'Alice item', authorId: 'p1', createdAt: 1 },
    'item-2': { id: 'item-2', categoryId: 'cat-1', text: 'Bob item', authorId: 'p2', createdAt: 2 },
  },
}

describe('RetroBoard — participant filter', () => {
  beforeEach(() => {
    sessionStorage.setItem(`retro-participant-${TEAM}`, 'p1')
    mockSubscribe(retroWithItems)
  })

  it('shows the filter dropdown with "All participants" as default', () => {
    renderBoard()
    const select = screen.getByRole('combobox', { name: /filter/i })
    expect(select).toBeInTheDocument()
    expect(select).toHaveValue('')
  })

  it('shows all items when no filter is applied', () => {
    renderBoard()
    expect(screen.getByText('Alice item')).toBeInTheDocument()
    expect(screen.getByText('Bob item')).toBeInTheDocument()
  })

  it('filters to only the selected participant items', async () => {
    const user = userEvent.setup()
    renderBoard()
    await user.selectOptions(screen.getByRole('combobox', { name: /filter/i }), 'p2')
    expect(screen.queryByText('Alice item')).not.toBeInTheDocument()
    expect(screen.getByText('Bob item')).toBeInTheDocument()
  })

  it('restores all items when "All participants" is selected', async () => {
    const user = userEvent.setup()
    renderBoard()
    await user.selectOptions(screen.getByRole('combobox', { name: /filter/i }), 'p2')
    await user.selectOptions(screen.getByRole('combobox', { name: /filter/i }), '')
    expect(screen.getByText('Alice item')).toBeInTheDocument()
    expect(screen.getByText('Bob item')).toBeInTheDocument()
  })

  it('filters across multiple categories', async () => {
    const user = userEvent.setup()
    mockSubscribe({
      ...retroWithItems,
      items: {
        'item-1': { id: 'item-1', categoryId: 'cat-1', text: 'Alice cat1', authorId: 'p1', createdAt: 1 },
        'item-2': { id: 'item-2', categoryId: 'cat-2', text: 'Alice cat2', authorId: 'p1', createdAt: 2 },
        'item-3': { id: 'item-3', categoryId: 'cat-1', text: 'Bob cat1', authorId: 'p2', createdAt: 3 },
      },
    })
    renderBoard()
    await user.selectOptions(screen.getByRole('combobox', { name: /filter/i }), 'p1')
    expect(screen.getByText('Alice cat1')).toBeInTheDocument()
    expect(screen.getByText('Alice cat2')).toBeInTheDocument()
    expect(screen.queryByText('Bob cat1')).not.toBeInTheDocument()
  })

  it('only shows items authored by the participant, not items they agreed with', async () => {
    const user = userEvent.setup()
    mockSubscribe({
      ...retroWithItems,
      items: {
        'item-1': {
          id: 'item-1', categoryId: 'cat-1', text: 'Alice item', authorId: 'p1',
          createdAt: 1, agreedBy: { p2: true },
        },
      },
    })
    renderBoard()
    // Filter by Bob — should not see Alice's item even though Bob agreed with it
    await user.selectOptions(screen.getByRole('combobox', { name: /filter/i }), 'p2')
    expect(screen.queryByText('Alice item')).not.toBeInTheDocument()
    // Filter by Alice — should see her item
    await user.selectOptions(screen.getByRole('combobox', { name: /filter/i }), 'p1')
    expect(screen.getByText('Alice item')).toBeInTheDocument()
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

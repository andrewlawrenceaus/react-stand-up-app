import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RetroSetup from './RetroSetup'

jest.mock('../../utils/db-utils', () => ({
  createRetro: jest.fn().mockResolvedValue(undefined),
  getPreviousRetro: jest.fn().mockResolvedValue(null),
}))

import { createRetro, getPreviousRetro } from '../../utils/db-utils'

const TEAM = 'Alpha'
const participants = [
  { id: 'p1', name: 'Alice' },
  { id: 'p2', name: 'Bob' },
]

function renderSetup() {
  return render(<RetroSetup teamName={TEAM} participants={participants} />)
}

beforeEach(() => {
  jest.clearAllMocks()
  getPreviousRetro.mockResolvedValue(null)
})

describe('RetroSetup — initial state', () => {
  it('renders the Start a Retro heading', () => {
    renderSetup()
    expect(screen.getByText('Start a Retro')).toBeInTheDocument()
  })

  it('shows 3 default categories as editable inputs', () => {
    renderSetup()
    expect(screen.getByDisplayValue('What went well')).toBeInTheDocument()
    expect(screen.getByDisplayValue("What didn't go well")).toBeInTheDocument()
    expect(screen.getByDisplayValue('What should we do differently')).toBeInTheDocument()
  })

  it('shows locked Action Items row', () => {
    renderSetup()
    expect(screen.getByText(/action items \(always included\)/i)).toBeInTheDocument()
  })

  it('Start button is enabled with default categories', () => {
    renderSetup()
    expect(screen.getByRole('button', { name: /start retro/i })).toBeEnabled()
  })
})

describe('RetroSetup — category management', () => {
  it('can add a new category', async () => {
    const user = userEvent.setup()
    renderSetup()
    await user.type(screen.getByPlaceholderText('Add another category'), 'Team morale')
    await user.click(screen.getByRole('button', { name: /^add$/i }))
    expect(screen.getByDisplayValue('Team morale')).toBeInTheDocument()
  })

  it('can remove a category', async () => {
    const user = userEvent.setup()
    renderSetup()
    await user.click(screen.getByRole('button', { name: /remove what went well/i }))
    expect(screen.queryByDisplayValue('What went well')).not.toBeInTheDocument()
  })

  it('can edit a category name inline', async () => {
    const user = userEvent.setup()
    renderSetup()
    const input = screen.getByDisplayValue('What went well')
    await user.clear(input)
    await user.type(input, 'Wins')
    expect(screen.getByDisplayValue('Wins')).toBeInTheDocument()
  })

  it('Start button is disabled when all categories are removed', async () => {
    const user = userEvent.setup()
    renderSetup()
    await user.click(screen.getByRole('button', { name: /remove what went well/i }))
    await user.click(screen.getByRole('button', { name: /remove what didn't go well/i }))
    await user.click(screen.getByRole('button', { name: /remove what should we do differently/i }))
    expect(screen.getByRole('button', { name: /start retro/i })).toBeDisabled()
  })
})

describe('RetroSetup — starting the retro', () => {
  it('calls createRetro with null timerDuration when no timer set', async () => {
    const user = userEvent.setup()
    renderSetup()
    await user.click(screen.getByRole('button', { name: /start retro/i }))
    expect(createRetro).toHaveBeenCalledWith(
      TEAM,
      expect.objectContaining({ timerDuration: null })
    )
  })

  it('calls createRetro with timerDuration in seconds when minutes entered', async () => {
    const user = userEvent.setup()
    renderSetup()
    await user.type(screen.getByPlaceholderText('Minutes'), '15')
    await user.click(screen.getByRole('button', { name: /start retro/i }))
    expect(createRetro).toHaveBeenCalledWith(
      TEAM,
      expect.objectContaining({ timerDuration: 900 })
    )
  })

  it('includes Action Items as a protected category', async () => {
    const user = userEvent.setup()
    renderSetup()
    await user.click(screen.getByRole('button', { name: /start retro/i }))
    const [, { categories }] = createRetro.mock.calls[0]
    const cats = Object.values(categories)
    expect(cats.some(c => c.name === 'Action Items' && c.isProtected === true)).toBe(true)
  })

  it('includes the user-defined categories', async () => {
    const user = userEvent.setup()
    renderSetup()
    await user.click(screen.getByRole('button', { name: /start retro/i }))
    const [, { categories }] = createRetro.mock.calls[0]
    const cats = Object.values(categories)
    expect(cats.some(c => c.name === 'What went well')).toBe(true)
  })
})

describe('RetroSetup — carry over from previous retro', () => {
  const previousRetro = {
    date: '2024-01-15',
    categories: {
      'cat-1': { id: 'cat-1', name: 'What went well', order: 0, isProtected: false },
    },
    items: {
      'item-1': { id: 'item-1', categoryId: 'cat-1', text: 'Great sprint', authorId: 'p1', createdAt: 1000 },
    },
  }

  beforeEach(() => {
    getPreviousRetro.mockResolvedValue(previousRetro)
  })

  it('shows previous retro info when available', async () => {
    renderSetup()
    await waitFor(() => {
      expect(screen.getByText(/previous retro from 2024-01-15/i)).toBeInTheDocument()
    })
  })

  it('shows carry over checkbox', async () => {
    renderSetup()
    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })
  })

  it('checking carry over hides the categories section', async () => {
    const user = userEvent.setup()
    renderSetup()
    await waitFor(() => screen.getByRole('checkbox'))
    await user.click(screen.getByRole('checkbox'))
    expect(screen.queryByDisplayValue('What went well')).not.toBeInTheDocument()
  })

  it('with carry over enabled, createRetro receives previous retro categories', async () => {
    const user = userEvent.setup()
    renderSetup()
    await waitFor(() => screen.getByRole('checkbox'))
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /start retro/i }))
    expect(createRetro).toHaveBeenCalledWith(
      TEAM,
      expect.objectContaining({
        categories: expect.objectContaining({
          'cat-1': expect.objectContaining({ name: 'What went well' }),
        }),
      })
    )
  })
})

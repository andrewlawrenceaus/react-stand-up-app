import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RetroCategoryEditor from './RetroCategoryEditor'

jest.mock('../../utils/db-utils', () => ({
  updateRetroCategory: jest.fn().mockResolvedValue(undefined),
  removeRetroCategory: jest.fn().mockResolvedValue(undefined),
  clearItemsByCategory: jest.fn().mockResolvedValue(undefined),
}))

import { updateRetroCategory, removeRetroCategory, clearItemsByCategory } from '../../utils/db-utils'

const TEAM = 'Alpha'

const baseCategory = {
  id: 'cat-1',
  name: 'What went well',
  order: 0,
  isProtected: false,
}

const protectedCategory = {
  id: 'cat-action',
  name: 'Action Items',
  order: 3,
  isProtected: true,
}

function renderEditor({ category = baseCategory, itemCount = 0 } = {}) {
  return render(
    <RetroCategoryEditor teamName={TEAM} category={category} itemCount={itemCount} />
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('RetroCategoryEditor — display', () => {
  it('renders the category name', () => {
    renderEditor()
    expect(screen.getByText('What went well')).toBeInTheDocument()
  })

  it('shows lock icon for protected categories', () => {
    renderEditor({ category: protectedCategory })
    expect(screen.getByTitle('Cannot be deleted')).toBeInTheDocument()
  })

  it('does not show delete button for protected categories', () => {
    renderEditor({ category: protectedCategory })
    expect(screen.queryByTitle('Delete category')).not.toBeInTheDocument()
  })

  it('does not show Clear button when itemCount is 0', () => {
    renderEditor({ itemCount: 0 })
    expect(screen.queryByRole('button', { name: /^clear$/i })).not.toBeInTheDocument()
  })

  it('shows Clear button when itemCount > 0', () => {
    renderEditor({ itemCount: 3 })
    expect(screen.getByRole('button', { name: /^clear$/i })).toBeInTheDocument()
  })
})

describe('RetroCategoryEditor — edit name', () => {
  it('clicking the category name switches to edit mode', async () => {
    const user = userEvent.setup()
    renderEditor()
    await user.click(screen.getByText('What went well'))
    expect(screen.getByRole('textbox')).toHaveValue('What went well')
  })

  it('pressing Enter saves and calls updateRetroCategory', async () => {
    const user = userEvent.setup()
    renderEditor()
    await user.click(screen.getByText('What went well'))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'What worked{Enter}')
    expect(updateRetroCategory).toHaveBeenCalledWith(TEAM, 'cat-1', { name: 'What worked' })
  })

  it('pressing Escape cancels without calling updateRetroCategory', async () => {
    const user = userEvent.setup()
    renderEditor()
    await user.click(screen.getByText('What went well'))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'Discarded{Escape}')
    expect(updateRetroCategory).not.toHaveBeenCalled()
    expect(screen.getByText('What went well')).toBeInTheDocument()
  })

  it('does not call updateRetroCategory when name is unchanged', async () => {
    const user = userEvent.setup()
    renderEditor()
    await user.click(screen.getByText('What went well'))
    await user.type(screen.getByRole('textbox'), '{Enter}')
    expect(updateRetroCategory).not.toHaveBeenCalled()
  })
})

describe('RetroCategoryEditor — clear items', () => {
  it('clicking Clear calls clearItemsByCategory', async () => {
    const user = userEvent.setup()
    renderEditor({ itemCount: 2 })
    await user.click(screen.getByRole('button', { name: /^clear$/i }))
    expect(clearItemsByCategory).toHaveBeenCalledWith(TEAM, 'cat-1')
  })
})

describe('RetroCategoryEditor — delete category', () => {
  it('clicking delete button shows confirmation', async () => {
    const user = userEvent.setup()
    renderEditor()
    await user.click(screen.getByTitle('Delete category'))
    expect(screen.getByText('Delete?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /yes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument()
  })

  it('confirming delete calls removeRetroCategory', async () => {
    const user = userEvent.setup()
    renderEditor()
    await user.click(screen.getByTitle('Delete category'))
    await user.click(screen.getByRole('button', { name: /yes/i }))
    expect(removeRetroCategory).toHaveBeenCalledWith(TEAM, 'cat-1')
  })

  it('canceling delete does not call removeRetroCategory and restores delete button', async () => {
    const user = userEvent.setup()
    renderEditor()
    await user.click(screen.getByTitle('Delete category'))
    await user.click(screen.getByRole('button', { name: /no/i }))
    expect(removeRetroCategory).not.toHaveBeenCalled()
    expect(screen.getByTitle('Delete category')).toBeInTheDocument()
  })
})

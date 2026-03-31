import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RetroActions from './RetroActions'

jest.mock('../../utils/db-utils', () => ({
  completeRetro: jest.fn().mockResolvedValue(undefined),
  clearAllItemsExceptCategory: jest.fn().mockResolvedValue(undefined),
}))

import { completeRetro, clearAllItemsExceptCategory } from '../../utils/db-utils'

const TEAM = 'Alpha'
const PROTECTED_CATEGORY_ID = 'cat-action'

function renderActions({ protectedCategoryId = PROTECTED_CATEGORY_ID } = {}) {
  return render(<RetroActions teamName={TEAM} protectedCategoryId={protectedCategoryId} />)
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('RetroActions — display', () => {
  it('shows Complete Retro button initially', () => {
    renderActions()
    expect(screen.getByRole('button', { name: /complete retro/i })).toBeInTheDocument()
  })

  it('shows Clear All button when protectedCategoryId is provided', () => {
    renderActions()
    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument()
  })

  it('does not show Clear All button when protectedCategoryId is not provided', () => {
    render(<RetroActions teamName={TEAM} />)
    expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument()
  })
})

describe('RetroActions — complete retro', () => {
  it('clicking Complete Retro shows confirmation dialog', async () => {
    const user = userEvent.setup()
    renderActions()
    await user.click(screen.getByRole('button', { name: /complete retro/i }))
    expect(screen.getByText(/save and end this retro/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /yes, complete/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('confirming calls completeRetro with team name', async () => {
    const user = userEvent.setup()
    renderActions()
    await user.click(screen.getByRole('button', { name: /complete retro/i }))
    await user.click(screen.getByRole('button', { name: /yes, complete/i }))
    expect(completeRetro).toHaveBeenCalledWith(TEAM)
  })

  it('canceling hides confirmation and does not call completeRetro', async () => {
    const user = userEvent.setup()
    renderActions()
    await user.click(screen.getByRole('button', { name: /complete retro/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(completeRetro).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /complete retro/i })).toBeInTheDocument()
  })
})

describe('RetroActions — clear all', () => {
  it('clicking Clear All calls clearAllItemsExceptCategory with team and protected category', async () => {
    const user = userEvent.setup()
    renderActions()
    await user.click(screen.getByRole('button', { name: /clear all/i }))
    expect(clearAllItemsExceptCategory).toHaveBeenCalledWith(TEAM, PROTECTED_CATEGORY_ID)
  })
})

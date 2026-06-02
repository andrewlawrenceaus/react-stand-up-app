import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RetroActions from './RetroActions'

jest.mock('../../utils/db-utils', () => ({
  completeRetro: jest.fn().mockResolvedValue(undefined),
  clearAllItemsExceptCategory: jest.fn().mockResolvedValue(undefined),
  toggleFinished: jest.fn().mockResolvedValue(undefined),
}))

import { completeRetro, clearAllItemsExceptCategory, toggleFinished } from '../../utils/db-utils'

const TEAM = 'Alpha'
const PROTECTED_CATEGORY_ID = 'cat-action'
const CURRENT_PARTICIPANT_ID = 'p1'
const participants = [
  { id: 'p1', name: 'Alice', photoUrl: '' },
  { id: 'p2', name: 'Bob', photoUrl: '' },
]

function renderActions({
  protectedCategoryId = PROTECTED_CATEGORY_ID,
  finishedParticipants = {},
  currentParticipantId = CURRENT_PARTICIPANT_ID,
} = {}) {
  return render(
    <RetroActions
      teamName={TEAM}
      protectedCategoryId={protectedCategoryId}
      participants={participants}
      finishedParticipants={finishedParticipants}
      currentParticipantId={currentParticipantId}
    />
  )
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
    render(
      <RetroActions
        teamName={TEAM}
        participants={participants}
        finishedParticipants={{}}
        currentParticipantId={CURRENT_PARTICIPANT_ID}
      />
    )
    expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument()
  })

  it("shows I'm Finished button", () => {
    renderActions()
    expect(screen.getByRole('button', { name: /i'm finished/i })).toBeInTheDocument()
  })
})

describe('RetroActions — complete retro (all finished)', () => {
  const allFinished = { p1: true, p2: true }

  it('clicking Complete Retro shows confirmation dialog when all are finished', async () => {
    const user = userEvent.setup()
    renderActions({ finishedParticipants: allFinished })
    await user.click(screen.getByRole('button', { name: /complete retro/i }))
    expect(screen.getByText(/save and end this retro/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /yes, complete/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('confirming calls completeRetro with team name', async () => {
    const user = userEvent.setup()
    renderActions({ finishedParticipants: allFinished })
    await user.click(screen.getByRole('button', { name: /complete retro/i }))
    await user.click(screen.getByRole('button', { name: /yes, complete/i }))
    expect(completeRetro).toHaveBeenCalledWith(TEAM)
  })

  it('canceling hides confirmation and does not call completeRetro', async () => {
    const user = userEvent.setup()
    renderActions({ finishedParticipants: allFinished })
    await user.click(screen.getByRole('button', { name: /complete retro/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(completeRetro).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /complete retro/i })).toBeInTheDocument()
  })
})

describe('RetroActions — complete retro (unfinished participants)', () => {
  it('clicking Complete Retro shows unfinished warning when some participants are not finished', async () => {
    const user = userEvent.setup()
    renderActions({ finishedParticipants: { p1: true } }) // Bob not finished
    await user.click(screen.getByRole('button', { name: /complete retro/i }))
    expect(screen.getByText(/still waiting on/i)).toBeInTheDocument()
    expect(screen.getByText(/bob/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /complete anyway/i })).toBeInTheDocument()
  })

  it('force-completing from warning calls completeRetro', async () => {
    const user = userEvent.setup()
    renderActions({ finishedParticipants: { p1: true } })
    await user.click(screen.getByRole('button', { name: /complete retro/i }))
    await user.click(screen.getByRole('button', { name: /complete anyway/i }))
    expect(completeRetro).toHaveBeenCalledWith(TEAM)
  })

  it('canceling warning restores the Complete Retro button', async () => {
    const user = userEvent.setup()
    renderActions({ finishedParticipants: { p1: true } })
    await user.click(screen.getByRole('button', { name: /complete retro/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(completeRetro).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /complete retro/i })).toBeInTheDocument()
  })
})

describe("RetroActions — I'm Finished toggle", () => {
  it("clicking I'm Finished calls toggleFinished for the current participant", async () => {
    const user = userEvent.setup()
    renderActions()
    await user.click(screen.getByRole('button', { name: /i'm finished/i }))
    expect(toggleFinished).toHaveBeenCalledWith(TEAM, CURRENT_PARTICIPANT_ID)
  })
})

describe('RetroActions — clear all', () => {
  it('clicking Clear All shows a confirmation dialog', async () => {
    const user = userEvent.setup()
    renderActions()
    await user.click(screen.getByRole('button', { name: /clear all/i }))
    expect(screen.getByText(/clear all items except action items/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /yes, clear all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('confirming calls clearAllItemsExceptCategory with team and protected category', async () => {
    const user = userEvent.setup()
    renderActions()
    await user.click(screen.getByRole('button', { name: /clear all/i }))
    await user.click(screen.getByRole('button', { name: /yes, clear all/i }))
    expect(clearAllItemsExceptCategory).toHaveBeenCalledWith(TEAM, PROTECTED_CATEGORY_ID)
  })

  it('canceling hides confirmation and does not call clearAllItemsExceptCategory', async () => {
    const user = userEvent.setup()
    renderActions()
    await user.click(screen.getByRole('button', { name: /clear all/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(clearAllItemsExceptCategory).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument()
  })
})

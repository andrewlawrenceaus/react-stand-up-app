import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RetroItem from './RetroItem'

jest.mock('../../utils/db-utils', () => ({
  toggleAgree: jest.fn(),
  updateRetroItem: jest.fn().mockResolvedValue(undefined),
  removeRetroItem: jest.fn(),
}))

import { toggleAgree, updateRetroItem, removeRetroItem } from '../../utils/db-utils'

const TEAM = 'Alpha'
const AUTHOR_ID = 'participant-1'
const OTHER_ID = 'participant-2'

const participants = [
  { id: AUTHOR_ID, name: 'Alice', photoUrl: '' },
  { id: OTHER_ID, name: 'Bob', photoUrl: '' },
]

const baseItem = {
  id: 'item-1',
  categoryId: 'cat-1',
  text: 'We shipped the feature',
  authorId: AUTHOR_ID,
  createdAt: 1000,
}

function renderItem({ item = baseItem, currentParticipantId = AUTHOR_ID } = {}) {
  return render(
    <RetroItem
      teamName={TEAM}
      item={item}
      participants={participants}
      currentParticipantId={currentParticipantId}
    />
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('RetroItem — display', () => {
  it('renders the item text', () => {
    renderItem()
    expect(screen.getByText('We shipped the feature')).toBeInTheDocument()
  })

  it('renders the author name', () => {
    renderItem()
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('shows Edit and Delete buttons for the author', () => {
    renderItem({ currentParticipantId: AUTHOR_ID })
    expect(screen.getByRole('button', { name: /edit item/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete item/i })).toBeInTheDocument()
  })

  it('does not show Edit or Delete buttons for non-authors', () => {
    renderItem({ currentParticipantId: OTHER_ID })
    expect(screen.queryByRole('button', { name: /edit item/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete item/i })).not.toBeInTheDocument()
  })

  it('shows Agree button for non-authors', () => {
    renderItem({ currentParticipantId: OTHER_ID })
    expect(screen.getByRole('button', { name: /agree/i })).toBeInTheDocument()
  })

  it('does not show Agree button for the author', () => {
    renderItem({ currentParticipantId: AUTHOR_ID })
    expect(screen.queryByRole('button', { name: /^agree$/i })).not.toBeInTheDocument()
  })
})

describe('RetroItem — edit', () => {
  it('clicking Edit shows a textarea with the current text', async () => {
    const user = userEvent.setup()
    renderItem()
    await user.click(screen.getByRole('button', { name: /edit item/i }))
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveValue('We shipped the feature')
  })

  it('hides Edit and Delete buttons while editing', async () => {
    const user = userEvent.setup()
    renderItem()
    await user.click(screen.getByRole('button', { name: /edit item/i }))
    expect(screen.queryByRole('button', { name: /edit item/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete item/i })).not.toBeInTheDocument()
  })

  it('pressing Enter saves the edited text', async () => {
    const user = userEvent.setup()
    renderItem()
    await user.click(screen.getByRole('button', { name: /edit item/i }))
    const textarea = screen.getByRole('textbox')
    await user.clear(textarea)
    await user.type(textarea, 'Updated text{Enter}')
    expect(updateRetroItem).toHaveBeenCalledWith(TEAM, 'item-1', 'Updated text')
  })

  it('pressing Escape cancels editing without saving', async () => {
    const user = userEvent.setup()
    renderItem()
    await user.click(screen.getByRole('button', { name: /edit item/i }))
    const textarea = screen.getByRole('textbox')
    await user.clear(textarea)
    await user.type(textarea, 'Discarded change{Escape}')
    expect(updateRetroItem).not.toHaveBeenCalled()
    expect(screen.getByText('We shipped the feature')).toBeInTheDocument()
  })

  it('does not call updateRetroItem when text is unchanged', async () => {
    const user = userEvent.setup()
    renderItem()
    await user.click(screen.getByRole('button', { name: /edit item/i }))
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '{Enter}')
    expect(updateRetroItem).not.toHaveBeenCalled()
  })
})

describe('RetroItem — delete', () => {
  it('clicking Delete shows confirmation buttons', async () => {
    const user = userEvent.setup()
    renderItem()
    await user.click(screen.getByRole('button', { name: /delete item/i }))
    expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel delete/i })).toBeInTheDocument()
  })

  it('confirming delete calls removeRetroItem', async () => {
    const user = userEvent.setup()
    renderItem()
    await user.click(screen.getByRole('button', { name: /delete item/i }))
    await user.click(screen.getByRole('button', { name: /confirm delete/i }))
    expect(removeRetroItem).toHaveBeenCalledWith(TEAM, 'item-1')
  })

  it('cancelling delete does not call removeRetroItem', async () => {
    const user = userEvent.setup()
    renderItem()
    await user.click(screen.getByRole('button', { name: /delete item/i }))
    await user.click(screen.getByRole('button', { name: /cancel delete/i }))
    expect(removeRetroItem).not.toHaveBeenCalled()
  })

  it('cancelling delete restores Edit and Delete buttons', async () => {
    const user = userEvent.setup()
    renderItem()
    await user.click(screen.getByRole('button', { name: /delete item/i }))
    await user.click(screen.getByRole('button', { name: /cancel delete/i }))
    expect(screen.getByRole('button', { name: /edit item/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete item/i })).toBeInTheDocument()
  })
})

describe('RetroItem — agree', () => {
  it('calls toggleAgree when non-author clicks Agree', async () => {
    const user = userEvent.setup()
    renderItem({ currentParticipantId: OTHER_ID })
    await user.click(screen.getByRole('button', { name: /agree/i }))
    expect(toggleAgree).toHaveBeenCalledWith(TEAM, 'item-1', OTHER_ID)
  })

  it('shows "Agreed" when current participant has already agreed', () => {
    const itemWithAgreement = {
      ...baseItem,
      agreedBy: { [OTHER_ID]: true },
    }
    renderItem({ item: itemWithAgreement, currentParticipantId: OTHER_ID })
    expect(screen.getByRole('button', { name: /agreed/i })).toBeInTheDocument()
  })
})

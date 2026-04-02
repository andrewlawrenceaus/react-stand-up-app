import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddRetroItem from './AddRetroItem'

jest.mock('../../utils/db-utils', () => ({
  addRetroItem: jest.fn().mockResolvedValue(undefined),
}))

import { addRetroItem } from '../../utils/db-utils'

const TEAM = 'Alpha'
const CATEGORY_ID = 'cat-1'
const PARTICIPANT_ID = 'participant-1'

function renderForm(props = {}) {
  return render(
    <AddRetroItem
      teamName={TEAM}
      categoryId={CATEGORY_ID}
      currentParticipantId={PARTICIPANT_ID}
      {...props}
    />
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('AddRetroItem — display', () => {
  it('renders input placeholder', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Add an item...')).toBeInTheDocument()
  })

  it('Add button is disabled when input is empty', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled()
  })

  it('Add button is disabled for whitespace-only input', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByPlaceholderText('Add an item...'), '   ')
    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled()
  })

  it('Add button is enabled when input has text', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByPlaceholderText('Add an item...'), 'Some text')
    expect(screen.getByRole('button', { name: /add/i })).toBeEnabled()
  })
})

describe('AddRetroItem — submit', () => {
  it('calls addRetroItem with trimmed text, categoryId, and authorId', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByPlaceholderText('Add an item...'), '  Great teamwork  ')
    await user.click(screen.getByRole('button', { name: /add/i }))
    expect(addRetroItem).toHaveBeenCalledWith(
      TEAM,
      expect.objectContaining({
        categoryId: CATEGORY_ID,
        text: 'Great teamwork',
        authorId: PARTICIPANT_ID,
      }),
      undefined
    )
  })

  it('generates a unique id for each item', async () => {
    const user = userEvent.setup()
    renderForm()

    const input = screen.getByPlaceholderText('Add an item...')

    await user.type(input, 'Item one')
    await user.click(screen.getByRole('button', { name: /add/i }))

    await user.type(input, 'Item two')
    await user.click(screen.getByRole('button', { name: /add/i }))

    const firstId = addRetroItem.mock.calls[0][1].id
    const secondId = addRetroItem.mock.calls[1][1].id

    expect(firstId).toEqual(expect.any(String))
    expect(secondId).toEqual(expect.any(String))
    expect(firstId).not.toBe(secondId)
  })

  it('clears the input after successful submission', async () => {
    const user = userEvent.setup()
    renderForm()
    const input = screen.getByPlaceholderText('Add an item...')
    await user.type(input, 'Some text')
    await user.click(screen.getByRole('button', { name: /add/i }))
    expect(input).toHaveValue('')
  })

  it('does not call addRetroItem when button is disabled', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: /add/i }))
    expect(addRetroItem).not.toHaveBeenCalled()
  })
})

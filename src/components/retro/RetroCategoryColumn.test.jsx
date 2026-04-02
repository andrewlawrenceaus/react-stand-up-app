import { render, screen } from '@testing-library/react'
import RetroCategoryColumn from './RetroCategoryColumn'

jest.mock('../../utils/db-utils', () => ({
  updateRetroCategory: jest.fn().mockResolvedValue(undefined),
  removeRetroCategory: jest.fn().mockResolvedValue(undefined),
  clearItemsByCategory: jest.fn().mockResolvedValue(undefined),
  addRetroItem: jest.fn().mockResolvedValue(undefined),
  updateRetroItem: jest.fn().mockResolvedValue(undefined),
  removeRetroItem: jest.fn(),
  toggleAgree: jest.fn(),
}))

const TEAM = 'Alpha'
const category = { id: 'cat-1', name: 'What went well', order: 0, isProtected: false }
const participants = [
  { id: 'p1', name: 'Alice', photoUrl: '' },
  { id: 'p2', name: 'Bob', photoUrl: '' },
]

function renderColumn({ items = [], currentParticipantId = 'p1' } = {}) {
  return render(
    <RetroCategoryColumn
      teamName={TEAM}
      category={category}
      items={items}
      participants={participants}
      currentParticipantId={currentParticipantId}
    />
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('RetroCategoryColumn', () => {
  it('renders the category name', () => {
    renderColumn()
    expect(screen.getByText('What went well')).toBeInTheDocument()
  })

  it('renders the add item form', () => {
    renderColumn()
    expect(screen.getByPlaceholderText('Add an item...')).toBeInTheDocument()
  })

  it('renders all provided items', () => {
    const items = [
      { id: 'i1', categoryId: 'cat-1', text: 'Great collaboration', authorId: 'p1', createdAt: 1000 },
      { id: 'i2', categoryId: 'cat-1', text: 'Fast delivery', authorId: 'p2', createdAt: 2000 },
    ]
    renderColumn({ items })
    expect(screen.getByText('Great collaboration')).toBeInTheDocument()
    expect(screen.getByText('Fast delivery')).toBeInTheDocument()
  })

  it('renders items sorted by createdAt ascending', () => {
    const items = [
      { id: 'i3', categoryId: 'cat-1', text: 'Third', authorId: 'p1', createdAt: 3000 },
      { id: 'i1', categoryId: 'cat-1', text: 'First', authorId: 'p1', createdAt: 1000 },
      { id: 'i2', categoryId: 'cat-1', text: 'Second', authorId: 'p1', createdAt: 2000 },
    ]
    renderColumn({ items })
    const texts = screen.getAllByText(/^(First|Second|Third)$/).map(el => el.textContent)
    expect(texts).toEqual(['First', 'Second', 'Third'])
  })

  it('renders empty column with no items', () => {
    renderColumn()
    expect(screen.queryByText(/^(First|Second|Third)$/)).not.toBeInTheDocument()
  })
})

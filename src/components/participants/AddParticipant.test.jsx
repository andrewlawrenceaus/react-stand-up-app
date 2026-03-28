import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddParticipant from './AddParticipant'

jest.mock('../../utils/db-utils', () => ({
  uploadParticipantPhoto: jest.fn(),
}))

beforeEach(() => {
  jest.spyOn(crypto, 'randomUUID').mockReturnValue('test-uuid-1234')
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('AddParticipant', () => {
  it('renders the name input and add button', () => {
    render(<AddParticipant onAdd={jest.fn()} />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add participant/i })).toBeInTheDocument()
  })

  it('Add Participant button is disabled when name is empty', () => {
    render(<AddParticipant onAdd={jest.fn()} />)
    expect(screen.getByRole('button', { name: /add participant/i })).toBeDisabled()
  })

  it('calls onAdd with correct shape when submitted with a name and no file', async () => {
    const user = userEvent.setup()
    const onAdd = jest.fn()
    render(<AddParticipant onAdd={onAdd} />)
    await user.type(screen.getByLabelText(/name/i), 'Alice')
    await user.click(screen.getByRole('button', { name: /add participant/i }))
    expect(onAdd).toHaveBeenCalledWith({ id: 'test-uuid-1234', name: 'Alice', photoUrl: '' })
  })

  it('generates a non-empty string id when onAdd is called', async () => {
    const user = userEvent.setup()
    jest.spyOn(crypto, 'randomUUID').mockRestore()
    const onAdd = jest.fn()
    render(<AddParticipant onAdd={onAdd} />)
    await user.type(screen.getByLabelText(/name/i), 'Bob')
    await user.click(screen.getByRole('button', { name: /add participant/i }))
    expect(onAdd).toHaveBeenCalledTimes(1)
    const [arg] = onAdd.mock.calls[0]
    expect(typeof arg.id).toBe('string')
    expect(arg.id.length).toBeGreaterThan(0)
    expect(arg.name).toBe('Bob')
    expect(arg.photoUrl).toBe('')
  })

  it('clears the name input after a successful submit', async () => {
    const user = userEvent.setup()
    render(<AddParticipant onAdd={jest.fn()} />)
    const input = screen.getByLabelText(/name/i)
    await user.type(input, 'Alice')
    await user.click(screen.getByRole('button', { name: /add participant/i }))
    expect(input.value).toBe('')
  })
})

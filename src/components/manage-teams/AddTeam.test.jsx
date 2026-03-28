import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddTeam from './AddTeam'

describe('AddTeam', () => {
  it('renders Team Name input and Add Team button', () => {
    render(<AddTeam addTeam={jest.fn()} />)
    expect(screen.getByLabelText(/team name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add team/i })).toBeInTheDocument()
  })

  it('does not call addTeam when input is empty', async () => {
    const user = userEvent.setup()
    const addTeam = jest.fn()
    render(<AddTeam addTeam={addTeam} />)
    await user.click(screen.getByRole('button', { name: /add team/i }))
    expect(addTeam).not.toHaveBeenCalled()
  })

  it('calls addTeam with the entered name on valid submit', async () => {
    const user = userEvent.setup()
    const addTeam = jest.fn()
    render(<AddTeam addTeam={addTeam} />)
    await user.type(screen.getByLabelText(/team name/i), 'Alpha Team')
    await user.click(screen.getByRole('button', { name: /add team/i }))
    expect(addTeam).toHaveBeenCalledWith('Alpha Team')
  })

  it('clears the input after a successful submit', async () => {
    const user = userEvent.setup()
    render(<AddTeam addTeam={jest.fn()} />)
    const input = screen.getByLabelText(/team name/i)
    await user.type(input, 'Alpha Team')
    await user.click(screen.getByRole('button', { name: /add team/i }))
    expect(input.value).toBe('')
  })

  it('does not call addTeam when input is whitespace only', async () => {
    const user = userEvent.setup()
    const addTeam = jest.fn()
    render(<AddTeam addTeam={addTeam} />)
    await user.type(screen.getByLabelText(/team name/i), '   ')
    await user.click(screen.getByRole('button', { name: /add team/i }))
    expect(addTeam).not.toHaveBeenCalled()
  })
})

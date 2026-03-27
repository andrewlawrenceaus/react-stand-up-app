import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RunStandUp from './RunStandUp'

const participants = ['Alice', 'Bob', 'Charlie']

beforeEach(() => {
  // Make Math.random deterministic: always picks index 0
  jest.spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => {
  jest.spyOn(Math, 'random').mockRestore()
})

describe('RunStandUp', () => {
  it('renders the team name heading', () => {
    render(<RunStandUp team="Alpha" participants={participants} />)
    expect(screen.getByText('Alpha Stand Up')).toBeInTheDocument()
  })

  it('shows Start Stand Up button in Ready state', () => {
    render(<RunStandUp team="Alpha" participants={participants} />)
    expect(screen.getByRole('button', { name: /start stand up/i })).toBeInTheDocument()
  })

  it('transitions to In Progress after clicking Start Stand Up', async () => {
    const user = userEvent.setup()
    render(<RunStandUp team="Alpha" participants={participants} />)
    await user.click(screen.getByRole('button', { name: /start stand up/i }))
    expect(screen.getByRole('button', { name: /pass the duck/i })).toBeInTheDocument()
  })

  it('shows first participant after starting (with mocked random)', async () => {
    const user = userEvent.setup()
    render(<RunStandUp team="Alpha" participants={participants} />)
    await user.click(screen.getByRole('button', { name: /start stand up/i }))
    // With Math.random = 0, splice(0, 1) always picks index 0, resulting in original order
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('Pass the Duck removes current participant and shows next', async () => {
    const user = userEvent.setup()
    render(<RunStandUp team="Alpha" participants={participants} />)
    await user.click(screen.getByRole('button', { name: /start stand up/i }))
    expect(screen.getByText('Alice')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /pass the duck/i }))
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('Not Ready moves current participant to end of queue', async () => {
    const user = userEvent.setup()
    render(<RunStandUp team="Alpha" participants={participants} />)
    await user.click(screen.getByRole('button', { name: /start stand up/i }))
    expect(screen.getByText('Alice')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /not ready/i }))
    // Alice should move to end, Bob is now first
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('transitions to Complete after all participants pass', async () => {
    const user = userEvent.setup()
    render(<RunStandUp team="Alpha" participants={participants} />)
    await user.click(screen.getByRole('button', { name: /start stand up/i }))
    for (let i = 0; i < participants.length; i++) {
      await user.click(screen.getByRole('button', { name: /pass the duck/i }))
    }
    expect(screen.getByRole('button', { name: /reset stand up/i })).toBeInTheDocument()
  })

  it('Reset Stand Up returns to Ready state', async () => {
    const user = userEvent.setup()
    render(<RunStandUp team="Alpha" participants={participants} />)
    await user.click(screen.getByRole('button', { name: /start stand up/i }))
    for (let i = 0; i < participants.length; i++) {
      await user.click(screen.getByRole('button', { name: /pass the duck/i }))
    }
    await user.click(screen.getByRole('button', { name: /reset stand up/i }))
    expect(screen.getByRole('button', { name: /start stand up/i })).toBeInTheDocument()
  })
})

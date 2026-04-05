import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import PickRepresentativePage from './PickRepresentative'

// Canvas stub
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arc: jest.fn(),
    closePath: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    fillText: jest.fn(),
    set fillStyle(_) {},
    set strokeStyle(_) {},
    set lineWidth(_) {},
    set font(_) {},
    set textAlign(_) {},
    set textBaseline(_) {},
    set shadowColor(_) {},
    set shadowBlur(_) {},
  }))
})

// rAF stubs so SpinningWheel mounts without error
beforeEach(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  jest.spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => {
  jest.restoreAllMocks()
})

const participants = {
  'id-1': { id: 'id-1', name: 'Alice', photoUrl: '' },
  'id-2': { id: 'id-2', name: 'Bob', photoUrl: '' },
}

function renderPage({ teams = {}, participantsData = {}, path = '/pick-representative' } = {}) {
  const router = createMemoryRouter(
    [
      {
        path: '/pick-representative',
        element: <PickRepresentativePage />,
        loader: () => ({ teams, participants: participantsData }),
      },
    ],
    { initialEntries: [path] }
  )
  return render(<RouterProvider router={router} />)
}

describe('PickRepresentativePage', () => {
  it('shows "No Teams Created!" when no teams exist', async () => {
    renderPage({ teams: {}, participantsData: {} })
    expect(await screen.findByText(/no teams created/i)).toBeInTheDocument()
  })

  it('shows spinning wheel when a team with participants is selected', async () => {
    renderPage({
      teams: { Alpha: ['id-1', 'id-2'] },
      participantsData: participants,
      path: '/pick-representative?team=Alpha',
    })
    expect(await screen.findByRole('button', { name: /spin the wheel/i })).toBeInTheDocument()
  })

  it('shows "No Participants!" when selected team has no members', async () => {
    renderPage({
      teams: { Alpha: [] },
      participantsData: participants,
      path: '/pick-representative?team=Alpha',
    })
    expect(await screen.findByText(/no participants/i)).toBeInTheDocument()
  })

  it('shows WinnerDisplay after spin completes', async () => {
    // Capture rAF callbacks so we can flush the animation
    let rafCallbacks = []
    window.requestAnimationFrame.mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    jest.spyOn(performance, 'now').mockReturnValue(0)

    const user = userEvent.setup()
    renderPage({
      teams: { Alpha: ['id-1', 'id-2'] },
      participantsData: participants,
      path: '/pick-representative?team=Alpha',
    })

    await user.click(await screen.findByRole('button', { name: /spin the wheel/i }))

    // Flush animation past SPIN_DURATION
    act(() => {
      performance.now.mockReturnValue(5000)
      while (rafCallbacks.length > 0) {
        rafCallbacks.shift()(5000)
      }
    })

    expect(await screen.findByText('Selected Representative')).toBeInTheDocument()
  })

  it('resets to wheel view when "Spin Again" is clicked', async () => {
    let rafCallbacks = []
    window.requestAnimationFrame.mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    jest.spyOn(performance, 'now').mockReturnValue(0)

    const user = userEvent.setup()
    renderPage({
      teams: { Alpha: ['id-1', 'id-2'] },
      participantsData: participants,
      path: '/pick-representative?team=Alpha',
    })

    await user.click(await screen.findByRole('button', { name: /spin the wheel/i }))

    act(() => {
      performance.now.mockReturnValue(5000)
      while (rafCallbacks.length > 0) {
        rafCallbacks.shift()(5000)
      }
    })

    await user.click(await screen.findByRole('button', { name: /spin again/i }))
    expect(await screen.findByRole('button', { name: /spin the wheel/i })).toBeInTheDocument()
  })
})

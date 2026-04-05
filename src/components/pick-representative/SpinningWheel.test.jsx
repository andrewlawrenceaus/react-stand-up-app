import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SpinningWheel from './SpinningWheel'

// jsdom doesn't implement canvas — provide a minimal stub
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

// Capture rAF callbacks so we can flush the animation synchronously
let rafCallbacks = []
beforeEach(() => {
  rafCallbacks = []
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    rafCallbacks.push(cb)
    return rafCallbacks.length
  })
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  jest.spyOn(Math, 'random').mockReturnValue(0)
  jest.spyOn(performance, 'now').mockReturnValue(0)
})

afterEach(() => {
  jest.restoreAllMocks()
})

const participants = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
]

function flushAnimation() {
  // Advance time past SPIN_DURATION (4500ms) and drain rAF queue
  performance.now.mockReturnValue(5000)
  while (rafCallbacks.length > 0) {
    const cb = rafCallbacks.shift()
    cb(5000)
  }
}

describe('SpinningWheel', () => {
  it('renders a canvas element', () => {
    render(<SpinningWheel participants={participants} onSpinComplete={jest.fn()} />)
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })

  it('renders "Spin the Wheel" button', () => {
    render(<SpinningWheel participants={participants} onSpinComplete={jest.fn()} />)
    expect(screen.getByRole('button', { name: /spin the wheel/i })).toBeInTheDocument()
  })

  it('button is enabled before spinning', () => {
    render(<SpinningWheel participants={participants} onSpinComplete={jest.fn()} />)
    expect(screen.getByRole('button', { name: /spin the wheel/i })).not.toBeDisabled()
  })

  it('button becomes disabled while spinning', async () => {
    const user = userEvent.setup()
    render(<SpinningWheel participants={participants} onSpinComplete={jest.fn()} />)
    await user.click(screen.getByRole('button', { name: /spin the wheel/i }))
    expect(screen.getByRole('button', { name: /spinning/i })).toBeDisabled()
  })

  it('calls onSpinComplete with a participant after animation finishes', async () => {
    const onSpinComplete = jest.fn()
    const user = userEvent.setup()
    render(<SpinningWheel participants={participants} onSpinComplete={onSpinComplete} />)
    await user.click(screen.getByRole('button', { name: /spin the wheel/i }))

    act(() => {
      flushAnimation()
    })

    expect(onSpinComplete).toHaveBeenCalledTimes(1)
    expect(participants).toContainEqual(onSpinComplete.mock.calls[0][0])
  })
})

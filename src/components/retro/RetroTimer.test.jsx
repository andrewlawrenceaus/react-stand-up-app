import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RetroTimer from './RetroTimer'

jest.mock('../../utils/db-utils', () => ({
  updateRetroTimer: jest.fn().mockResolvedValue(undefined),
}))

import { updateRetroTimer } from '../../utils/db-utils'

const TEAM = 'Alpha'
const NOW = 1_000_000_000_000

function renderTimer(retroState, isParticipant = false) {
  return render(<RetroTimer teamName={TEAM} retroState={retroState} isParticipant={isParticipant} />)
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(Date, 'now').mockReturnValue(NOW)
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('RetroTimer — no timer configured', () => {
  it('renders nothing when timerDuration is null', () => {
    const { container } = renderTimer({ timerDuration: null, timerStartedAt: null })
    expect(container).toBeEmptyDOMElement()
  })
})

describe('RetroTimer — idle (not started)', () => {
  const retroState = { timerDuration: 600, timerStartedAt: null }

  it('shows the full duration as MM:SS', () => {
    renderTimer(retroState)
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('shows Start button', () => {
    renderTimer(retroState)
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
  })

  it('does not show Pause or Reset buttons', () => {
    renderTimer(retroState)
    expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument()
  })

  it('clicking Start calls updateRetroTimer with current timestamp', async () => {
    const user = userEvent.setup()
    renderTimer(retroState)
    await user.click(screen.getByRole('button', { name: /start/i }))
    expect(updateRetroTimer).toHaveBeenCalledWith(TEAM, { timerStartedAt: NOW })
  })
})

describe('RetroTimer — running', () => {
  // Started 60 seconds ago, 10-minute duration → 9 minutes remaining
  const retroState = { timerDuration: 600, timerStartedAt: NOW - 60_000 }

  it('shows remaining time as MM:SS', () => {
    renderTimer(retroState)
    expect(screen.getByText('09:00')).toBeInTheDocument()
  })

  it('shows Pause and Reset buttons', () => {
    renderTimer(retroState)
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('does not show Start button', () => {
    renderTimer(retroState)
    expect(screen.queryByRole('button', { name: /^start$/i })).not.toBeInTheDocument()
  })

  it('clicking Pause calls updateRetroTimer with remaining duration and null timerStartedAt', async () => {
    const user = userEvent.setup()
    renderTimer(retroState)
    await user.click(screen.getByRole('button', { name: /pause/i }))
    expect(updateRetroTimer).toHaveBeenCalledWith(TEAM, {
      timerDuration: 540,
      timerStartedAt: null,
    })
  })

  it('clicking Reset calls updateRetroTimer with null timerStartedAt', async () => {
    const user = userEvent.setup()
    renderTimer(retroState)
    await user.click(screen.getByRole('button', { name: /reset/i }))
    expect(updateRetroTimer).toHaveBeenCalledWith(TEAM, { timerStartedAt: null })
  })
})

describe('RetroTimer — participant mode', () => {
  const retroState = { timerDuration: 600, timerStartedAt: null }

  it('shows the timer display', () => {
    renderTimer(retroState, true)
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('does not show Start button for participants', () => {
    renderTimer(retroState, true)
    expect(screen.queryByRole('button', { name: /start/i })).not.toBeInTheDocument()
  })

  it('does not show Pause or Reset buttons for participants when running', () => {
    const runningState = { timerDuration: 600, timerStartedAt: NOW - 60_000 }
    renderTimer(runningState, true)
    expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument()
  })
})

describe('RetroTimer — expired', () => {
  // Started 700 seconds ago, 600-second duration → expired by 100 seconds
  const retroState = { timerDuration: 600, timerStartedAt: NOW - 700_000 }

  it('shows "Time\'s up!"', () => {
    renderTimer(retroState)
    expect(screen.getByText("Time's up!")).toBeInTheDocument()
  })

  it('shows +5 min and Reset buttons', () => {
    renderTimer(retroState)
    expect(screen.getByRole('button', { name: /\+5 min/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('does not show Start or Pause buttons', () => {
    renderTimer(retroState)
    expect(screen.queryByRole('button', { name: /^start$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument()
  })

  it('clicking +5 min calls updateRetroTimer with timerDuration + 300', async () => {
    const user = userEvent.setup()
    renderTimer(retroState)
    await user.click(screen.getByRole('button', { name: /\+5 min/i }))
    expect(updateRetroTimer).toHaveBeenCalledWith(TEAM, { timerDuration: 900 })
  })

  it('clicking Reset calls updateRetroTimer with null timerStartedAt', async () => {
    const user = userEvent.setup()
    renderTimer(retroState)
    await user.click(screen.getByRole('button', { name: /reset/i }))
    expect(updateRetroTimer).toHaveBeenCalledWith(TEAM, { timerStartedAt: null })
  })
})

describe('RetroTimer — participant mode', () => {
  const retroState = { timerDuration: 600, timerStartedAt: null }

  it('shows the timer display', () => {
    renderTimer(retroState, true)
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('does not show Start button for participants', () => {
    renderTimer(retroState, true)
    expect(screen.queryByRole('button', { name: /start/i })).not.toBeInTheDocument()
  })

  it('does not show Pause or Reset buttons for participants when running', () => {
    const runningState = { timerDuration: 600, timerStartedAt: NOW - 60_000 }
    renderTimer(runningState, true)
    expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument()
  })
})

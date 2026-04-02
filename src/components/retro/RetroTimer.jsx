import { useState, useEffect, useCallback } from 'react';
import { updateRetroTimer } from '../../utils/db-utils';

function formatTime(seconds) {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.max(0, seconds) % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function RetroTimer({ teamName, retroState, isParticipant }) {
  const { timerDuration, timerStartedAt } = retroState;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!timerStartedAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [timerStartedAt]);

  if (!timerDuration) return null;

  const elapsed = timerStartedAt ? Math.floor((now - timerStartedAt) / 1000) : 0;
  const remaining = timerDuration - elapsed;
  const isExpired = timerStartedAt && remaining <= 0;
  const isRunning = timerStartedAt && !isExpired;

  const handleStart = useCallback(() => {
    updateRetroTimer(teamName, { timerStartedAt: Date.now() });
  }, [teamName]);

  const handlePause = useCallback(() => {
    updateRetroTimer(teamName, {
      timerDuration: Math.max(0, remaining),
      timerStartedAt: null,
    });
  }, [teamName, remaining]);

  const handleReset = useCallback(() => {
    updateRetroTimer(teamName, {
      timerStartedAt: null,
    });
  }, [teamName]);

  const handleExtend = useCallback(() => {
    updateRetroTimer(teamName, {
      timerDuration: timerDuration + 300,
    });
  }, [teamName, timerDuration]);

  return (
    <div className={`retro-timer ${isExpired ? 'retro-timer--expired' : ''}`}>
      <span className="retro-timer__display">
        {isExpired ? "Time's up!" : formatTime(timerStartedAt ? remaining : timerDuration)}
      </span>
      {!isParticipant && (
        <div className="retro-timer__controls">
          {!timerStartedAt && !isExpired && (
            <button className="retro-timer__btn" onClick={handleStart}>Start</button>
          )}
          {isRunning && (
            <button className="retro-timer__btn" onClick={handlePause}>Pause</button>
          )}
          {isExpired && (
            <button className="retro-timer__btn" onClick={handleExtend}>+5 min</button>
          )}
          {(timerStartedAt || isExpired) && (
            <button className="retro-timer__btn" onClick={handleReset}>Reset</button>
          )}
        </div>
      )}
    </div>
  );
}

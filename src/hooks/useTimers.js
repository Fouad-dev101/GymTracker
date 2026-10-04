import { useEffect, useState } from 'react';

/** Seconds elapsed since an ISO timestamp, ticking every second. */
export function useElapsed(startedAt) {
  const [seconds, setSeconds] = useState(() =>
    startedAt ? Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)) : 0
  );

  useEffect(() => {
    if (!startedAt) {
      setSeconds(0);
      return undefined;
    }
    const start = new Date(startedAt).getTime();
    const tick = () => setSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);

  return seconds;
}

/**
 * Countdown timer with start / pause / reset.
 * Returns { remaining, running, start, pause, reset, addTime }.
 */
export function useCountdown(durationSeconds) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const start = (seconds) => {
    if (typeof seconds === 'number') setRemaining(seconds);
    setRunning(true);
  };

  const reset = (seconds) => {
    setRunning(false);
    setRemaining(typeof seconds === 'number' ? seconds : durationSeconds);
  };

  return {
    remaining: typeof remaining === 'number' ? remaining : durationSeconds,
    running,
    start,
    pause: () => setRunning(false),
    reset,
    addTime: (seconds) => setRemaining((value) => Math.max(0, value + seconds)),
  };
}

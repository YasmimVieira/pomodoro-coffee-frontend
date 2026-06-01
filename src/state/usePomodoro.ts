import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  PHASES, PHASE_STARTS,
  fillForElapsed,
  type PomodoroStatus, type Phase,
} from '../constants/phases';

export interface PomodoroState {
  status: PomodoroStatus;
  phase: Phase;
  phaseIndex: number;
  elapsed: number;         // segundos decorridos na fase atual
  totalElapsed: number;    // segundos totais acumulados (para fill da xícara)
  remaining: number;       // segundos restantes na fase atual
  fill: number;            // 0..1
  running: boolean;
  started: boolean;
  waitingForNext: boolean; // fase terminou, aguardando usuário iniciar a próxima
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export function usePomodoro(speed = 1): PomodoroState {
  const bankedMs     = useRef(0);      // ms acumulados na fase atual
  const segmentStart = useRef(0);      // Date.now() do início do segmento
  const runningRef   = useRef(false);
  const speedRef     = useRef(speed);
  speedRef.current   = speed;

  const [phaseIndex,     setPhaseIndex]     = useState(0);
  const [running,        setRunning]        = useState(false);
  const [started,        setStarted]        = useState(false);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [isCompleted,    setIsCompleted]    = useState(false);
  const [,               force]             = useState(0);

  const phase           = PHASES[Math.min(phaseIndex, PHASES.length - 1)];
  const phaseDurationMs = phase.duration * 1000;

  // Elapsed na fase atual em ms
  const liveElapsedMs = useCallback((): number => {
    const extra = runningRef.current
      ? (Date.now() - segmentStart.current) * speedRef.current
      : 0;
    return Math.min(phaseDurationMs, bankedMs.current + extra);
  }, [phaseDurationMs]);

  // Tick a cada 100ms — para no fim de cada fase
  useEffect(() => {
    const id = setInterval(() => {
      if (!runningRef.current) return;

      if (liveElapsedMs() >= phaseDurationMs) {
        bankedMs.current   = phaseDurationMs;
        runningRef.current = false;
        setRunning(false);

        if (phaseIndex >= PHASES.length - 1) {
          setIsCompleted(true);
        } else {
          setWaitingForNext(true);
        }
      }

      force(n => n + 1);
    }, 100);

    const sub = AppState.addEventListener('change', () => force(n => n + 1));
    return () => { clearInterval(id); sub.remove(); };
  }, [liveElapsedMs, phaseDurationMs, phaseIndex]);

  const bank = useCallback(() => {
    bankedMs.current += (Date.now() - segmentStart.current) * speedRef.current;
  }, []);

  const start = useCallback(() => {
    if (waitingForNext) {
      // Avança para próxima fase e inicia
      bankedMs.current   = 0;
      segmentStart.current = Date.now();
      runningRef.current = true;
      setPhaseIndex(i => i + 1);
      setWaitingForNext(false);
      setRunning(true);
    } else {
      // Inicia ou retoma a fase atual
      segmentStart.current = Date.now();
      runningRef.current   = true;
      setStarted(true);
      setRunning(true);
    }
  }, [waitingForNext]);

  const pause = useCallback(() => {
    bank();
    runningRef.current = false;
    setRunning(false);
  }, [bank]);

  const reset = useCallback(() => {
    bankedMs.current   = 0;
    runningRef.current = false;
    setRunning(false);
    setStarted(false);
    setWaitingForNext(false);
    setIsCompleted(false);
    setPhaseIndex(0);
    force(n => n + 1);
  }, []);

  const elapsedSec   = liveElapsedMs() / 1000;
  const safeIndex    = Math.min(phaseIndex, PHASES.length - 1);
  const totalElapsed = PHASE_STARTS[safeIndex] + elapsedSec;

  const status: PomodoroStatus = isCompleted
    ? 'COMPLETED'
    : !started
    ? 'IDLE'
    : phase.key;

  return {
    status,
    phase,
    phaseIndex,
    elapsed:       elapsedSec,
    totalElapsed,
    remaining:     Math.max(0, phase.duration - elapsedSec),
    fill:          fillForElapsed(totalElapsed),
    running,
    started,
    waitingForNext,
    start,
    pause,
    reset,
  };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  PHASES, PHASE_STARTS, TOTAL_SECONDS,
  fillForElapsed, phaseIndexForElapsed, statusForElapsed,
  type PomodoroStatus, type Phase,
} from '../constants/phases';

export interface PomodoroState {
  status: PomodoroStatus;
  phase: Phase;
  phaseIndex: number;
  elapsed: number;   // segundos desde o início do ciclo
  remaining: number; // segundos restantes na fase atual
  fill: number;      // 0..1 — nível do café
  running: boolean;
  started: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export function usePomodoro(speed = 1): PomodoroState {
  // Tempo acumulado em ms (congela quando pausado)
  const bankedMs = useRef(0);
  // Date.now() do início do segmento atual
  const segmentStart = useRef(0);
  // Refs para não precisar de closures em efeitos
  const runningRef = useRef(false);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  // force(n+1) dispara re-render sem guardar estado
  const [, force] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);

  // Calcula elapsed atual em segundos
  const liveElapsed = useCallback(() => {
    const extra = runningRef.current
      ? (Date.now() - segmentStart.current) * speedRef.current
      : 0;
    return Math.min(TOTAL_SECONDS, (bankedMs.current + extra) / 1000);
  }, []);

  useEffect(() => {
    // Tick a cada 100ms
    const id = setInterval(() => {
      if (!runningRef.current) return;

      if (liveElapsed() >= TOTAL_SECONDS) {
        // Ciclo completo — para o timer
        bankedMs.current = TOTAL_SECONDS * 1000;
        runningRef.current = false;
        setRunning(false);
      }
      force(n => n + 1);
    }, 100);

    // Recalcula quando o app volta do background
    const sub = AppState.addEventListener('change', () => force(n => n + 1));

    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [liveElapsed]);

  // Salva o tempo decorrido no segmento atual
  const bank = useCallback(() => {
    bankedMs.current +=
      (Date.now() - segmentStart.current) * speedRef.current;
  }, []);

  const start = useCallback(() => {
    segmentStart.current = Date.now();
    runningRef.current = true;
    setStarted(true);
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    bank();
    runningRef.current = false;
    setRunning(false);
  }, [bank]);

  const reset = useCallback(() => {
    bankedMs.current = 0;
    runningRef.current = false;
    setRunning(false);
    setStarted(false);
    force(n => n + 1);
  }, []);

  const elapsed = liveElapsed();
  const phaseIndex = phaseIndexForElapsed(elapsed);
  const phase = PHASES[phaseIndex];

  return {
    status: statusForElapsed(elapsed, started),
    phase,
    phaseIndex,
    elapsed,
    remaining: PHASE_STARTS[phaseIndex] + phase.duration - elapsed,
    fill: fillForElapsed(elapsed),
    running,
    started,
    start,
    pause,
    reset,
  };
}
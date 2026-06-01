import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { buildPhases, type PomodoroStatus, type Phase } from '../constants/phases';

export interface PomodoroState {
  status: PomodoroStatus;
  phase: Phase;
  phaseIndex: number;
  elapsed: number;         // segundos decorridos na fase atual
  totalElapsed: number;    // segundos totais (para PhaseTimeline e fill)
  remaining: number;       // segundos restantes na fase atual
  fill: number;            // 0..1 — nível do café
  running: boolean;
  started: boolean;
  waitingForNext: boolean; // fase terminou, aguardando usuário iniciar a próxima
  phases: Phase[];         // fases atuais (para PhaseTimeline)
  start: () => void;
  pause: () => void;
  reset: () => void;
}

// Fill dinâmico baseado no índice e progresso dentro das fases
function computeFill(phaseIndex: number, elapsedSec: number, phases: Phase[]): number {
  const focusPhases = phases.filter(p => p.type === 'focus').length; // 2
  const fillPerFocus = 1 / focusPhases; // 0.5

  const completedFocus = phases.slice(0, phaseIndex).filter(p => p.type === 'focus').length;

  if (phases[phaseIndex]?.type === 'break') {
    return completedFocus * fillPerFocus;
  }
  const progress = Math.min(1, elapsedSec / (phases[phaseIndex]?.duration ?? 1));
  return completedFocus * fillPerFocus + progress * fillPerFocus;
}

export function usePomodoro(
  speed    = 1,
  focusSec = 25 * 60,
  breakSec = 5  * 60,
): PomodoroState {
  const bankedMs     = useRef(0);
  const segmentStart = useRef(0);
  const runningRef   = useRef(false);
  const speedRef     = useRef(speed);
  speedRef.current   = speed;

  // Fases e offsets computados a partir das durações
  const phases = useMemo(() => buildPhases(focusSec, breakSec), [focusSec, breakSec]);
  const phaseStarts = useMemo(
    () => phases.reduce<number[]>((arr, _, i) =>
      [...arr, i === 0 ? 0 : arr[i - 1] + phases[i - 1].duration], []),
    [phases],
  );

  const [phaseIndex,     setPhaseIndex]     = useState(0);
  const [running,        setRunning]        = useState(false);
  const [started,        setStarted]        = useState(false);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [isCompleted,    setIsCompleted]    = useState(false);
  const [,               force]             = useState(0);

  const phase           = phases[Math.min(phaseIndex, phases.length - 1)];
  const phaseDurationMs = phase.duration * 1000;

  const liveElapsedMs = useCallback((): number => {
    const extra = runningRef.current
      ? (Date.now() - segmentStart.current) * speedRef.current
      : 0;
    return Math.min(phaseDurationMs, bankedMs.current + extra);
  }, [phaseDurationMs]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!runningRef.current) return;
      if (liveElapsedMs() >= phaseDurationMs) {
        bankedMs.current   = phaseDurationMs;
        runningRef.current = false;
        setRunning(false);
        if (phaseIndex >= phases.length - 1) {
          setIsCompleted(true);
        } else {
          setWaitingForNext(true);
        }
      }
      force(n => n + 1);
    }, 100);

    const sub = AppState.addEventListener('change', () => force(n => n + 1));
    return () => { clearInterval(id); sub.remove(); };
  }, [liveElapsedMs, phaseDurationMs, phaseIndex, phases.length]);

  const bank = useCallback(() => {
    bankedMs.current += (Date.now() - segmentStart.current) * speedRef.current;
  }, []);

  const start = useCallback(() => {
    if (waitingForNext) {
      bankedMs.current     = 0;
      segmentStart.current = Date.now();
      runningRef.current   = true;
      setPhaseIndex(i => i + 1);
      setWaitingForNext(false);
      setRunning(true);
    } else {
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
  const safeIndex    = Math.min(phaseIndex, phases.length - 1);
  const totalElapsed = phaseStarts[safeIndex] + elapsedSec;

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
    fill:          computeFill(safeIndex, elapsedSec, phases),
    running,
    started,
    waitingForNext,
    phases,
    start,
    pause,
    reset,
  };
}

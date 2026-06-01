// Tipos
export type PomodoroStatus =
  | 'IDLE'       // aguardando início
  | 'FOCUS_1'    // foco 0–25min
  | 'BREAK_1'    // pausa 25–30min
  | 'FOCUS_2'    // foco 30–55min
  | 'BREAK_2'    // pausa 55–60min
  | 'COMPLETED'; // ciclo completo

export type PhaseType = 'focus' | 'break';

export interface Phase {
  key: Exclude<PomodoroStatus, 'IDLE' | 'COMPLETED'>;
  label: string;           // "Foco" ou "Pausa curta"
  sub: string;             // subtítulo exibido
  duration: number;        // duração em SEGUNDOS
  type: PhaseType;
  notificationMsg: string; // mensagem ao fim da fase
}

// Definição das 4 fases (total = 3600s = 60min)
export const PHASES: Phase[] = [
  {
    key: 'FOCUS_1',
    label: 'Foco',
    sub: 'Sessão 1 de 2',
    duration: 25 * 60,   // 1500s
    type: 'focus',
    notificationMsg: '☁️ Pausa curta! Deixa o café assentar.',
  },
  {
    key: 'BREAK_1',
    label: 'Pausa curta',
    sub: 'Respire fundo',
    duration: 5 * 60,    // 300s
    type: 'break',
    notificationMsg: '🔥 Segunda sessão de foco. Vamos lá!',
  },
  {
    key: 'FOCUS_2',
    label: 'Foco',
    sub: 'Sessão 2 de 2',
    duration: 25 * 60,   // 1500s
    type: 'focus',
    notificationMsg: '☕ Café pronto! Pausa longa merecida.',
  },
  {
    key: 'BREAK_2',
    label: 'Pausa longa',
    sub: 'Café pronto',
    duration: 5 * 60,    // 300s
    type: 'break',
    notificationMsg: '🎉 Ciclo completo!',
  },
];

// Gera as 4 fases com durações customizáveis
export function buildPhases(focusSec: number, breakSec: number): Phase[] {
  return [
    { key: 'FOCUS_1', label: 'Foco',        sub: 'Sessão 1 de 2', duration: focusSec, type: 'focus', notificationMsg: '☁️ Pausa curta! Deixa o café assentar.' },
    { key: 'BREAK_1', label: 'Pausa curta', sub: 'Respire fundo',  duration: breakSec, type: 'break', notificationMsg: '🔥 Segunda sessão de foco. Vamos lá!' },
    { key: 'FOCUS_2', label: 'Foco',        sub: 'Sessão 2 de 2', duration: focusSec, type: 'focus', notificationMsg: '☕ Café pronto! Pausa longa merecida.' },
    { key: 'BREAK_2', label: 'Pausa longa', sub: 'Café pronto',   duration: breakSec, type: 'break', notificationMsg: '🎉 Ciclo completo!' },
  ];
}

// Total em segundos: 1500 + 300 + 1500 + 300 = 3600
export const TOTAL_SECONDS = PHASES.reduce((acc, p) => acc + p.duration, 0);

// Offset de início de cada fase: [0, 1500, 1800, 3300]
export const PHASE_STARTS: number[] = PHASES.reduce<number[]>((arr, _p, i) => {
  arr.push(i === 0 ? 0 : arr[i - 1] + PHASES[i - 1].duration);
  return arr;
}, []);

/**
 * FUNÇÃO PRINCIPAL: converte segundos decorridos → nível do café (0 a 1)
 *
 * Por que função pura? Porque timer e xícara leem o MESMO número.
 * Não há animação desacoplada — tudo deriva do elapsed.
 *
 * 0s    → 1500s  (FOCUS_1): sobe de 0% a 50%
 * 1500s → 1800s  (BREAK_1): parado em 50%
 * 1800s → 3300s  (FOCUS_2): sobe de 50% a 100%
 * 3300s → 3600s  (BREAK_2): parado em 100%
 */
export function fillForElapsed(t: number): number {
  if (t <= 1500) return (t / 1500) * 0.5;
  if (t <= 1800) return 0.5;
  if (t <= 3300) return 0.5 + ((t - 1800) / 1500) * 0.5;
  return 1;
}

// Retorna o índice da fase atual (0, 1, 2 ou 3)
export function phaseIndexForElapsed(t: number): number {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (t >= PHASE_STARTS[i]) return i;
  }
  return 0;
}

// Retorna o status string baseado no elapsed
export function statusForElapsed(t: number, started: boolean): PomodoroStatus {
  if (!started) return 'IDLE';
  if (t >= TOTAL_SECONDS) return 'COMPLETED';
  return PHASES[phaseIndexForElapsed(t)].key;
}

// Formata segundos como "MM:SS"
export function formatMMSS(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
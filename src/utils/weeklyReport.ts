import * as Print   from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ACHIEVEMENTS } from '../constants/achievements';
import type { CycleRecord } from '../state/HistoryContext';

const DAY_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface WeekDay {
  label: string;
  date:  string;
  mins:  number;
}

function buildWeekData(history: CycleRecord[]): WeekDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const date   = new Date(today.getTime() - (6 - i) * 86400000);
    const ts     = date.getTime();
    const mins   = history
      .filter(h => h.ts >= ts && h.ts < ts + 86400000)
      .reduce((s, h) => s + h.focusMin, 0);
    return {
      label: DAY_PT[date.getDay()],
      date:  date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      mins,
    };
  });
}

function buildHtml(history: CycleRecord[]): string {
  const week      = buildWeekData(history);
  const maxMins   = Math.max(...week.map(d => d.mins), 1);
  const weekMins  = week.reduce((s, d) => s + d.mins, 0);
  const weekCycles = history.filter(h => {
    const d = new Date(h.ts);
    d.setHours(0, 0, 0, 0);
    return Date.now() - d.getTime() <= 7 * 86400000;
  }).length;

  const totalCycles = history.length;
  const unlockedIds = ACHIEVEMENTS
    .filter(a => a.requiredCycles <= totalCycles)
    .map(a => a.name);

  // Streak
  const days = new Set(history.map(h => {
    const d = new Date(h.ts);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }));
  let streak = 0;
  const cur = new Date(); cur.setHours(0, 0, 0, 0);
  while (days.has(cur.getTime())) { streak++; cur.setTime(cur.getTime() - 86400000); }

  const dateRange = `${week[0].date} – ${week[6].date}`;
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const barsHtml = week.map(d => {
    const pct = maxMins > 0 ? Math.round((d.mins / maxMins) * 100) : 0;
    return `
      <div class="day-row">
        <span class="day-label">${d.label}<br><small>${d.date}</small></span>
        <div class="bar-wrap">
          <div class="bar" style="width:${pct}%"></div>
        </div>
        <span class="day-min">${d.mins > 0 ? d.mins + 'min' : '—'}</span>
      </div>`;
  }).join('');

  const achievementsHtml = unlockedIds.length > 0
    ? unlockedIds.map(n => `<span class="badge">${n}</span>`).join('')
    : '<span class="badge empty">Nenhuma ainda — continue focando!</span>';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    background: #FFFBF6;
    color: #3E2010;
    padding: 40px;
    max-width: 600px;
    margin: 0 auto;
  }

  /* Header */
  .header {
    text-align: center;
    padding-bottom: 24px;
    border-bottom: 2px solid #C8894E;
    margin-bottom: 32px;
  }
  .emoji { font-size: 42px; margin-bottom: 8px; }
  h1 { font-size: 26px; color: #3E2010; margin-bottom: 4px; }
  .period { color: #988B7C; font-size: 14px; }

  /* Stat cards */
  .stats { display: flex; gap: 14px; margin-bottom: 32px; }
  .stat {
    flex: 1; text-align: center;
    background: #FFF3E8;
    border: 1.5px solid #EDD9C0;
    border-radius: 14px;
    padding: 18px 10px;
  }
  .stat-val { font-size: 32px; font-weight: bold; color: #C8894E; line-height: 1; }
  .stat-unit { font-size: 14px; color: #C8894E; }
  .stat-lbl { font-size: 11px; color: #988B7C; margin-top: 6px; letter-spacing: 1px; text-transform: uppercase; }

  /* Section titles */
  .section { font-size: 10px; letter-spacing: 3px; color: #988B7C; text-transform: uppercase; margin-bottom: 14px; }

  /* Daily bars */
  .days-wrap { margin-bottom: 32px; }
  .day-row { display: flex; align-items: center; margin-bottom: 10px; }
  .day-label { width: 48px; font-size: 12px; color: #3E2010; line-height: 1.3; }
  .day-label small { color: #988B7C; font-size: 10px; }
  .bar-wrap { flex: 1; background: #EDD9C0; border-radius: 4px; height: 18px; margin: 0 12px; overflow: hidden; }
  .bar { height: 100%; background: linear-gradient(90deg, #C8894E, #E0A766); border-radius: 4px; min-width: 3px; }
  .day-min { width: 44px; text-align: right; font-size: 12px; color: #988B7C; }

  /* Achievements */
  .badges-wrap { margin-bottom: 32px; }
  .badge {
    display: inline-block;
    background: #FFF3E8;
    border: 1px solid #EDD9C0;
    border-radius: 8px;
    padding: 5px 12px;
    margin: 4px 4px 4px 0;
    font-size: 13px;
    color: #3E2010;
  }
  .badge.empty { color: #988B7C; font-style: italic; background: none; border-style: dashed; }

  /* Footer */
  .footer {
    text-align: center;
    color: #988B7C;
    font-size: 11px;
    border-top: 1px solid #EDD9C0;
    padding-top: 18px;
    margin-top: 8px;
    line-height: 1.8;
  }
</style>
</head>
<body>

<div class="header">
  <div class="emoji">☕</div>
  <h1>Pomodoro Coffee</h1>
  <p class="period">Relatório Semanal · ${dateRange}</p>
  <p class="period" style="font-size:12px;margin-top:4px">Gerado em ${now}</p>
</div>

<div class="stats">
  <div class="stat">
    <div class="stat-val">${weekCycles}</div>
    <div class="stat-lbl">Ciclos na semana</div>
  </div>
  <div class="stat">
    <div class="stat-val">${Math.floor(weekMins / 60)}<span class="stat-unit">h</span>${weekMins % 60 > 0 ? (weekMins % 60) + '<span class="stat-unit">m</span>' : ''}</div>
    <div class="stat-lbl">Foco total</div>
  </div>
  <div class="stat">
    <div class="stat-val">${streak}</div>
    <div class="stat-lbl">Dias seguidos</div>
  </div>
</div>

<p class="section">Foco por dia</p>
<div class="days-wrap">${barsHtml}</div>

<p class="section">Conquistas desbloqueadas (${unlockedIds.length}/${ACHIEVEMENTS.length})</p>
<div class="badges-wrap">${achievementsHtml}</div>

<div class="footer">
  ☕ Pomodoro Coffee<br>
  Total acumulado: <strong>${totalCycles} ciclos</strong> · <strong>${Math.floor(history.reduce((s,h) => s + h.focusMin, 0) / 60)}h${history.reduce((s,h) => s + h.focusMin, 0) % 60}m</strong> de foco<br>
  Continue firme — cada grão de café conta.
</div>

</body>
</html>`;
}

export async function generateAndShareWeeklyReport(history: CycleRecord[]): Promise<void> {
  const html     = buildHtml(history);
  const { uri }  = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Salvar relatório semanal',
      UTI: 'com.adobe.pdf',
    });
  }
}

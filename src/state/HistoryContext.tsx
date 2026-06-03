import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sessionsApi } from '../api/sessions.api';
import { useAuth } from './AuthContext';
import { ACHIEVEMENTS, type Achievement } from '../constants/achievements';
import { updateWidget } from '../utils/widgetData';

export interface CycleRecord {
  ts: number;
  focusMin: number;
}

interface HistoryCtx {
  history:     CycleRecord[];
  newUnlock:   Achievement | null;
  hasMore:     boolean;
  loadingMore: boolean;
  addCycle:    (focusMin?: number) => Promise<void>;
  loadMore:    () => Promise<void>;
  clearUnlock: () => void;
  clear:       () => void;
}

const Ctx = createContext<HistoryCtx>({
  history: [], newUnlock: null, hasMore: false, loadingMore: false,
  addCycle: async () => {}, loadMore: async () => {}, clearUnlock: () => {}, clear: () => {},
});

const KEY        = 'pomodoro.history.v1';
const PAGE_LIMIT = 10;

function toRecords(sessions: Awaited<ReturnType<typeof sessionsApi.getAll>>): CycleRecord[] {
  return sessions.map(s => ({ ts: Number(s.completedAt), focusMin: s.focusMinutes }));
}

function calcStreak(records: CycleRecord[]): number {
  const days = new Set(records.map(h => {
    const d = new Date(h.ts);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }));
  let s = 0;
  const cur = new Date(); cur.setHours(0, 0, 0, 0);
  while (days.has(cur.getTime())) { s++; cur.setTime(cur.getTime() - 86400000); }
  return s;
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [history,     setHistory]     = useState<CycleRecord[]>([]);
  const [newUnlock,   setNewUnlock]   = useState<Achievement | null>(null);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Carrega (ou limpa) sempre que o usuário muda
  useEffect(() => {
    if (!user) {
      setHistory([]);
      setPage(1);
      setHasMore(false);
      AsyncStorage.removeItem(KEY).catch(() => {});
      return;
    }
    (async () => {
      try {
        const sessions = await sessionsApi.getAll(1);
        const records  = toRecords(sessions);
        setHistory(records);
        setPage(1);
        setHasMore(sessions.length >= PAGE_LIMIT);
        AsyncStorage.setItem(KEY, JSON.stringify(records)).catch(() => {});
        updateWidget(records.length, calcStreak(records));
      } catch {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const records: CycleRecord[] = JSON.parse(raw);
          setHistory(records);
          updateWidget(records.length, calcStreak(records));
        }
      }
    })();
  }, [user?.id]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const sessions = await sessionsApi.getAll(nextPage);
      const records  = toRecords(sessions);
      setHistory(prev => [...prev, ...records]);
      setPage(nextPage);
      setHasMore(sessions.length >= PAGE_LIMIT);
    } catch {}
    setLoadingMore(false);
  }, [hasMore, loadingMore, page]);

  const addCycle = useCallback(async (focusMin = 50) => {
    const ts     = Date.now();
    const record = { ts, focusMin };
    const next   = [record, ...history];
    setHistory(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});

    const prevCount = history.length;
    const newCount  = next.length;
    const unlocked  = ACHIEVEMENTS.find(
      a => a.requiredCycles <= newCount && a.requiredCycles > prevCount,
    );
    if (unlocked) setNewUnlock(unlocked);
    updateWidget(newCount, calcStreak(next));

    try {
      await sessionsApi.create({ focusMinutes: focusMin, cycles: 1, completedAt: ts });
    } catch {}
  }, [history]);

  const clearUnlock = useCallback(() => setNewUnlock(null), []);

  const clear = useCallback(() => {
    setHistory([]);
    AsyncStorage.setItem(KEY, JSON.stringify([])).catch(() => {});
  }, []);

  return (
    <Ctx.Provider value={{ history, newUnlock, hasMore, loadingMore, addCycle, loadMore, clearUnlock, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export const useHistory = () => useContext(Ctx);

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

const cacheKey = (id: string) => `pomodoro.history.v2.${id}`;

function toRecords(sessions: Awaited<ReturnType<typeof sessionsApi.getAll>>): CycleRecord[] {
  return (sessions.data ?? []).map(s => ({ ts: Number(s.completedAt), focusMin: s.focusMinutes }));
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

  useEffect(() => {
    if (!user) {
      setHistory([]);
      setPage(1);
      setHasMore(false);
      return;
    }

    const key = cacheKey(user.id);

    (async () => {
      try {
        const response = await sessionsApi.getAll(1);
        const records  = toRecords(response);
        setHistory(records);
        setPage(1);
        setHasMore(Number(response.totalPages) > 1);
        AsyncStorage.setItem(key, JSON.stringify(records)).catch(() => {});
        updateWidget(records.length, calcStreak(records));
      } catch (e: any) {
        console.error('[loadHistory] API error:', e?.response?.status, e?.response?.data ?? e?.message);
        const raw = await AsyncStorage.getItem(key);
        if (raw) {
          const records: CycleRecord[] = JSON.parse(raw);
          setHistory(records);
          updateWidget(records.length, calcStreak(records));
        }
      }
    })();
  }, [user?.id]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !user) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await sessionsApi.getAll(nextPage);
      const records  = toRecords(response);
      setHistory(prev => [...prev, ...records]);
      setPage(nextPage);
      setHasMore(nextPage < Number(response.totalPages));
    } catch {}
    setLoadingMore(false);
  }, [hasMore, loadingMore, page, user]);

  const addCycle = useCallback(async (focusMin = 50) => {
    if (!user) return;
    const key    = cacheKey(user.id);
    const ts     = Date.now();
    const record = { ts, focusMin };
    const next   = [record, ...history];
    setHistory(next);
    AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {});

    const prevCount = history.length;
    const newCount  = next.length;
    const unlocked  = ACHIEVEMENTS.find(
      a => a.requiredCycles <= newCount && a.requiredCycles > prevCount,
    );
    if (unlocked) setNewUnlock(unlocked);
    updateWidget(newCount, calcStreak(next));

    try {
      await sessionsApi.create({ focusMinutes: focusMin, cycles: 1, completedAt: ts });
    } catch (e: any) {
      console.error('[addCycle] API error:', e?.response?.status, e?.response?.data ?? e?.message);
    }
  }, [history, user]);

  const clearUnlock = useCallback(() => setNewUnlock(null), []);

  const clear = useCallback(() => {
    if (!user) return;
    setHistory([]);
    AsyncStorage.setItem(cacheKey(user.id), JSON.stringify([])).catch(() => {});
  }, [user]);

  return (
    <Ctx.Provider value={{ history, newUnlock, hasMore, loadingMore, addCycle, loadMore, clearUnlock, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export const useHistory = () => useContext(Ctx);

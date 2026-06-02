import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sessionsApi } from '../api/sessions.api';
import { useAuth } from './AuthContext';
import { ACHIEVEMENTS, type Achievement } from '../constants/achievements';

export interface CycleRecord {
  ts: number;
  focusMin: number;
}

interface HistoryCtx {
  history:    CycleRecord[];
  newUnlock:  Achievement | null;
  addCycle:   (focusMin?: number) => Promise<void>;
  clearUnlock: () => void;
  clear:      () => void;
}

const Ctx = createContext<HistoryCtx>({
  history: [], newUnlock: null,
  addCycle: async () => {}, clearUnlock: () => {}, clear: () => {},
});

const KEY = 'pomodoro.history.v1';

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [history,   setHistory]   = useState<CycleRecord[]>([]);
  const [newUnlock, setNewUnlock] = useState<Achievement | null>(null);

  // Recarrega (ou limpa) sempre que o usuário muda
  useEffect(() => {
    if (!user) {
      setHistory([]);
      AsyncStorage.removeItem(KEY).catch(() => {});
      return;
    }
    (async () => {
      try {
        const sessions = await sessionsApi.getAll();
        const records: CycleRecord[] = sessions.map(s => ({
          ts:       Number(s.completedAt),
          focusMin: s.focusMinutes,
        }));
        setHistory(records);
        AsyncStorage.setItem(KEY, JSON.stringify(records)).catch(() => {});
      } catch {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setHistory(JSON.parse(raw));
      }
    })();
  }, [user?.id]);

  const addCycle = useCallback(async (focusMin = 50) => {
    const ts     = Date.now();
    const record = { ts, focusMin };
    const next   = [record, ...history];
    setHistory(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});

    // Detecta se cruzou o threshold de alguma conquista
    const prevCount = history.length;
    const newCount  = next.length;
    const unlocked  = ACHIEVEMENTS.find(
      a => a.requiredCycles <= newCount && a.requiredCycles > prevCount,
    );
    if (unlocked) setNewUnlock(unlocked);

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
    <Ctx.Provider value={{ history, newUnlock, addCycle, clearUnlock, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export const useHistory = () => useContext(Ctx);

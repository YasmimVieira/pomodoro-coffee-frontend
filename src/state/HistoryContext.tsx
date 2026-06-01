import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sessionsApi } from '../api/sessions.api';

export interface CycleRecord {
  ts: number;      // quando completou (epoch ms)
  focusMin: number;
}

interface HistoryCtx {
  history: CycleRecord[];
  addCycle: (focusMin?: number) => Promise<void>;
  clear: () => void;
}

const Ctx = createContext<HistoryCtx>({
  history: [],
  addCycle: async () => {},
  clear: () => {},
});

const KEY = 'pomodoro.history.v1';

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<CycleRecord[]>([]);

  // Carrega sessões da API; usa AsyncStorage como fallback offline
  useEffect(() => {
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
  }, []);

  const addCycle = useCallback(async (focusMin = 50) => {
    const ts = Date.now();
    const record: CycleRecord = { ts, focusMin };

    // Atualiza estado local imediatamente (optimistic)
    const next = [record, ...history];
    setHistory(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});

    // Persiste no backend
    try {
      await sessionsApi.create({
        focusMinutes: focusMin,
        cycles:       1,
        completedAt:  ts,
      });
    } catch {
      // falha silenciosa — dado já salvo localmente
    }
  }, [history]);

  const clear = useCallback(() => {
    setHistory([]);
    AsyncStorage.setItem(KEY, JSON.stringify([])).catch(() => {});
  }, []);

  return (
    <Ctx.Provider value={{ history, addCycle, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export const useHistory = () => useContext(Ctx);

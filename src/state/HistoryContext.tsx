import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Carrega do disco ao abrir o app
  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) setHistory(JSON.parse(raw));
    });
  }, []);

  const persist = useCallback((next: CycleRecord[]) => {
    setHistory(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addCycle = useCallback(async (focusMin = 50) => {
    const record: CycleRecord = { ts: Date.now(), focusMin };
    persist([record, ...history]);
    // Quando tiver o backend, chame a API aqui (veja seção 24)
  }, [history, persist]);

  const clear = useCallback(() => persist([]), [persist]);

  return (
    <Ctx.Provider value={{ history, addCycle, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export const useHistory = () => useContext(Ctx);
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sessionsApi } from '../api/sessions.api';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
  const [history, setHistory] = useState<CycleRecord[]>([]);

  // Re-carrega (ou limpa) sempre que o usuário muda
  useEffect(() => {
    if (!user) {
      // Logout ou sem sessão — limpa tudo para o próximo usuário não ver dados antigos
      setHistory([]);
      AsyncStorage.removeItem(KEY).catch(() => {});
      return;
    }

    // Novo usuário logado — busca histórico dele na API
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
        // Offline: tenta o cache local (pode ser de outro usuário, mas é o melhor que temos)
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setHistory(JSON.parse(raw));
      }
    })();
  }, [user?.id]); // dispara apenas quando o ID do usuário muda

  const addCycle = useCallback(async (focusMin = 50) => {
    const ts = Date.now();
    const record: CycleRecord = { ts, focusMin };

    const next = [record, ...history];
    setHistory(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});

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

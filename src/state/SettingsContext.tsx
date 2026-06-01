import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FOCUS_OPTIONS = [15, 20, 25, 30, 45, 50];
export const BREAK_OPTIONS  = [5, 10, 15];

interface SettingsCtx {
  focusMin: number;
  breakMin: number;
  setFocusMin: (v: number) => void;
  setBreakMin: (v: number) => void;
}

const KEY = 'pomodoro.settings.v1';

const Ctx = createContext<SettingsCtx>({
  focusMin: 25, breakMin: 5,
  setFocusMin: () => {}, setBreakMin: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [focusMin, setFocusMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.focusMin) setFocusMin(s.focusMin);
      if (s.breakMin) setBreakMin(s.breakMin);
    });
  }, []);

  const saveFocus = useCallback((v: number) => {
    setFocusMin(v);
    AsyncStorage.getItem(KEY).then(raw => {
      const prev = raw ? JSON.parse(raw) : {};
      AsyncStorage.setItem(KEY, JSON.stringify({ ...prev, focusMin: v }));
    });
  }, []);

  const saveBreak = useCallback((v: number) => {
    setBreakMin(v);
    AsyncStorage.getItem(KEY).then(raw => {
      const prev = raw ? JSON.parse(raw) : {};
      AsyncStorage.setItem(KEY, JSON.stringify({ ...prev, breakMin: v }));
    });
  }, []);

  return (
    <Ctx.Provider value={{ focusMin, breakMin, setFocusMin: saveFocus, setBreakMin: saveBreak }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSettings = () => useContext(Ctx);

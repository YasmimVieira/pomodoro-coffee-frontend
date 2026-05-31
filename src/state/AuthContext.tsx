import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/auth.api';

interface User { id: string; email: string; name: string; }

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, pw: string) => Promise<void>;
  register: (email: string, pw: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null, loading: true,
  login: async () => {}, register: async () => {}, logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão ao abrir o app
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        if (token) {
          const { data } = await api.get('/auth/me');
          setUser(data);
        }
      } catch {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async (access: string, refresh: string) => {
    await SecureStore.setItemAsync('access_token',  access);
    await SecureStore.setItemAsync('refresh_token', refresh);
  };

  const login = useCallback(async (email: string, pw: string) => {
    const { data } = await api.post('/auth/login', { email, password: pw });
    await save(data.access_token, data.refresh_token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, pw: string, name: string) => {
    const { data } = await api.post('/auth/register', { email, password: pw, name });
    await save(data.access_token, data.refresh_token);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
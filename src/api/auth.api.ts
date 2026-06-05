import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  timeout: 10_000,
});

// Callback registrado pelo AuthProvider para forçar logout quando refresh expira
let onForceLogout: (() => void) | null = null;
export function registerForceLogout(fn: () => void) { onForceLogout = fn; }

async function clearTokens() {
  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('refresh_token');
  await SecureStore.deleteItemAsync('user');
}

// Injeta o token em toda requisição
api.interceptors.request.use(async config => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Renova o token automaticamente ao receber 401
api.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const refresh = await SecureStore.getItemAsync('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
            { refresh_token: refresh }
          );
          await SecureStore.setItemAsync('access_token', data.access_token);
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          return api(error.config);
        } catch {
          // Refresh falhou — sessão expirada, força logout
          await clearTokens();
          onForceLogout?.();
        }
      } else {
        // Sem refresh token — força logout
        await clearTokens();
        onForceLogout?.();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

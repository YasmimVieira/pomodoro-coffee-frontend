import api from './auth.api';

export interface Session {
  id: string;
  focusMinutes: number;
  cycles: number;
  completedAt: string; // bigint serializado como string
  createdAt: string;
}

export interface SessionStats {
  totalSessions: number;
  totalFocusMinutes: number;
  totalCycles: number;
}

export const sessionsApi = {
  create: (body: { focusMinutes: number; cycles: number; completedAt: number }) =>
    api.post<Session>('/sessions', body).then(r => r.data),

  getAll: (page = 1) =>
    api.get<{ data: Session[]; total: number; totalPages: number; page: string }>(`/sessions?page=${page}`)
      .then(r => r.data),

  getStats: () =>
    api.get<SessionStats>('/sessions/stats').then(r => r.data),
};

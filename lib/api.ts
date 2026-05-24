import { API_BASE } from './constants';
import type {
  AdminUser,
  ApiResponse,
  AuthUser,
  LeaderboardResponse,
  PaginatedMeta,
  Report,
  Task,
  TaskVolunteer,
} from './types';

export class ApiError extends Error {
  code: string;

  status: number;

  constructor(message: string, code = 'SERVER_ERROR', status = 500) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

async function request<T>(
  path: string,
  { body, headers, ...options }: RequestOptions = {},
): Promise<{ data: T; meta?: PaginatedMeta }> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !json.success) {
    throw new ApiError(
      json.error?.message || 'Request failed',
      json.error?.code,
      res.status,
    );
  }

  return { data: json.data, meta: json.meta };
}

export const authApi = {
  login: (payload: { phone: string; idToken: string; name?: string }) =>
    request<{
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
      user: AuthUser;
    }>('/auth/verify-otp', { method: 'POST', body: payload }),

  logout: (refreshToken: string) =>
    request<{ loggedOut: boolean }>('/auth/logout', {
      method: 'POST',
      body: { refreshToken },
    }),
};

export const reportsApi = {
  list: (params: Record<string, string | number | undefined>) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    return request<Report[]>(`/reports?${qs}`);
  },

  get: (id: string) => request<Report>(`/reports/${id}`),

  updateStatus: (
    id: string,
    body: { status: string; note?: string; resolutionNote?: string },
  ) => request<Report>(`/reports/${id}/status`, { method: 'PATCH', body }),

  batchStatus: (body: {
    reportIds: string[];
    status: string;
    note?: string;
    resolutionNote?: string;
  }) => request<{ results: unknown[] }>('/reports/status/batch', { method: 'POST', body }),

  exportCsv: async (params: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    const res = await fetch(`${API_BASE}/reports/export?${qs}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (!res.ok) throw new ApiError('Export failed', 'SERVER_ERROR', res.status);
    return res.text();
  },
};

export const tasksApi = {
  list: (params: Record<string, string | number | undefined>) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    return request<Task[]>(`/tasks?${qs}`);
  },

  get: (id: string) => request<Task>(`/tasks/${id}`),

  create: (body: Record<string, unknown>) =>
    request<Task>('/tasks', { method: 'POST', body }),

  update: (id: string, body: Record<string, unknown>) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body }),

  archive: (id: string) => request<Task>(`/tasks/${id}/archive`, { method: 'PATCH' }),

  volunteers: (id: string) => request<TaskVolunteer[]>(`/tasks/${id}/volunteers`),

  approve: (taskId: string, userId: string) =>
    request<unknown>(`/tasks/${taskId}/volunteers/${userId}/approve`, {
      method: 'PATCH',
    }),

  reject: (taskId: string, userId: string, reason: string) =>
    request<TaskVolunteer>(`/tasks/${taskId}/volunteers/${userId}/reject`, {
      method: 'PATCH',
      body: { reason },
    }),
};

export const usersApi = {
  list: (params: Record<string, string | number | undefined>) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    return request<AdminUser[]>(`/users?${qs}`);
  },

  get: (id: string) => request<AdminUser>(`/users/${id}`),

  ban: (id: string, reason: string) =>
    request<AdminUser>(`/users/${id}/ban`, { method: 'PATCH', body: { reason } }),

  unban: (id: string) => request<AdminUser>(`/users/${id}/unban`, { method: 'PATCH' }),
};

export const leaderboardApi = {
  monthly: (limit = 100) =>
    request<LeaderboardResponse>(`/leaderboard/monthly?limit=${limit}`),

  byWard: (ward: string, limit = 100) =>
    request<LeaderboardResponse>(
      `/leaderboard/monthly/ward/${encodeURIComponent(ward)}?limit=${limit}`,
    ),
};

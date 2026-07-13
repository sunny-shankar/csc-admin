import { API_BASE } from './constants';
import {
  clearAuthSession,
  notifySessionExpired,
  refreshAccessToken,
  shouldRefreshOnUnauthorized,
} from './authSession';
import type {
  AdminUser,
  ApiResponse,
  AuthUser,
  UserProfile,
  LeaderboardResponse,
  DashboardStats,
  PaginatedMeta,
  Report,
  Task,
  TaskVolunteer,
  Event,
  EventInterest,
  Banner,
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

function parseApiError(json: ApiResponse<unknown>, status: number): ApiError {
  return new ApiError(
    json.error?.message || 'Request failed',
    json.error?.code ?? 'SERVER_ERROR',
    status,
  );
}

async function handleUnauthorized(path: string, retried: boolean): Promise<boolean> {
  if (retried || !shouldRefreshOnUnauthorized(path)) {
    return false;
  }

  const newToken = await refreshAccessToken();
  if (newToken) {
    setAccessToken(newToken);
    return true;
  }

  clearAuthSession();
  setAccessToken(null);
  notifySessionExpired();
  return false;
}

async function request<T>(
  path: string,
  { body, headers, ...options }: RequestOptions = {},
  retried = false,
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

  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    if (res.status === 401) {
      const refreshed = await handleUnauthorized(path, retried);
      if (refreshed) return request(path, { body, headers, ...options }, true);
      throw new ApiError('Your session has expired. Please sign in again.', 'UNAUTHORIZED', 401);
    }
    throw new ApiError('Request failed', 'SERVER_ERROR', res.status);
  }

  if (res.status === 401 && !json.success) {
    const refreshed = await handleUnauthorized(path, retried);
    if (refreshed) return request(path, { body, headers, ...options }, true);
    throw new ApiError(
      json.error?.message || 'Your session has expired. Please sign in again.',
      json.error?.code ?? 'UNAUTHORIZED',
      401,
    );
  }

  if (!res.ok || !json.success) {
    throw parseApiError(json, res.status);
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

  exportCsv: async (
    params: Record<string, string | undefined>,
    retried = false,
  ): Promise<string> => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    const path = `/reports/export?${qs}`;
    const res = await fetch(`${API_BASE}${path}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });

    if (res.status === 401) {
      const refreshed = await handleUnauthorized(path, retried);
      if (refreshed) return reportsApi.exportCsv(params, true);
      throw new ApiError('Your session has expired. Please sign in again.', 'UNAUTHORIZED', 401);
    }

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

export interface PresignUpload {
  uploadUrl: string;
  key: string;
  contentType: string;
  expiresIn: number;
  maxBytes: number;
  viewUrl?: string;
}

export interface ConfirmUpload {
  key: string;
  contentType: string;
  size: number;
  viewUrl: string;
}

export const uploadsApi = {
  confirm: (body: {
    key: string;
    purpose: 'avatar' | 'report' | 'task' | 'event' | 'banner';
    eventId?: string;
    bannerId?: string;
  }) => request<ConfirmUpload>('/uploads/confirm', { method: 'POST', body }),
};

export const usersApi = {
  me: () => request<UserProfile>('/users/me'),

  updateMe: (body: {
    name?: string;
    ward?: string | null;
    sectorNo?: string | null;
    profilePhoto?: string | null;
  }) => request<UserProfile>('/users/me', { method: 'PATCH', body }),

  presignProfilePhoto: (body: {
    contentType: 'image/jpeg' | 'image/png' | 'image/webp';
    fileName?: string;
  }) => request<PresignUpload>('/users/me/presign', { method: 'POST', body }),

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

export const analyticsApi = {
  dashboard: () => request<DashboardStats>('/analytics/dashboard'),
};

export const eventsApi = {
  list: (params: Record<string, string | number | undefined>) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    return request<Event[]>(`/events?${qs}`);
  },

  get: (id: string) => request<Event>(`/events/${id}`),

  create: (body: Record<string, unknown>) =>
    request<Event>('/events', { method: 'POST', body }),

  update: (id: string, body: Record<string, unknown>) =>
    request<Event>(`/events/${id}`, { method: 'PATCH', body }),

  archive: (id: string) => request<Event>(`/events/${id}/archive`, { method: 'PATCH' }),

  interests: (id: string) => request<EventInterest[]>(`/events/${id}/interests`),

  presignImage: (body: {
    contentType: 'image/jpeg' | 'image/png' | 'image/webp';
    fileName?: string;
    eventId?: string;
  }) => request<PresignUpload>('/events/presign-image', { method: 'POST', body }),
};

export const bannersApi = {
  list: (params: Record<string, string | number | undefined>) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    return request<Banner[]>(`/banners?${qs}`);
  },

  get: (id: string) => request<Banner>(`/banners/${id}`),

  create: (body: Record<string, unknown>) =>
    request<Banner>('/banners', { method: 'POST', body }),

  update: (id: string, body: Record<string, unknown>) =>
    request<Banner>(`/banners/${id}`, { method: 'PATCH', body }),

  archive: (id: string) => request<Banner>(`/banners/${id}/archive`, { method: 'PATCH' }),

  activate: (id: string) => request<Banner>(`/banners/${id}/activate`, { method: 'PATCH' }),

  presignImage: (body: {
    contentType: 'image/jpeg' | 'image/png' | 'image/webp';
    fileName?: string;
    bannerId?: string;
  }) => request<PresignUpload>('/banners/presign-image', { method: 'POST', body }),
};

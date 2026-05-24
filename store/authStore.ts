'use client';

import { create } from 'zustand';
import { authApi, setAccessToken, getAccessToken } from '@/lib/api';
import type { AuthUser } from '@/lib/types';

const TOKEN_KEY = 'csc_admin_token';
const REFRESH_KEY = 'csc_admin_refresh';
const USER_KEY = 'csc_admin_user';

interface AuthState {
  user: AuthUser | null;
  refreshToken: string | null;
  hydrated: boolean;
  login: (phone: string, idToken: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  refreshToken: null,
  hydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem(TOKEN_KEY);
    const refreshToken = sessionStorage.getItem(REFRESH_KEY);
    const userRaw = sessionStorage.getItem(USER_KEY);
    if (token) setAccessToken(token);
    let user: AuthUser | null = null;
    if (userRaw) {
      try {
        user = JSON.parse(userRaw) as AuthUser;
      } catch {
        user = null;
      }
    }
    set({ user, refreshToken, hydrated: true });
  },

  login: async (phone, idToken, name) => {
    const { data } = await authApi.login({ phone, idToken, name });
    if (data.user.role !== 'admin') {
      throw new Error('This account does not have admin access.');
    }
    setAccessToken(data.accessToken);
    sessionStorage.setItem(TOKEN_KEY, data.accessToken);
    sessionStorage.setItem(REFRESH_KEY, data.refreshToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
    set({ user: data.user, refreshToken: data.refreshToken });
  },

  logout: async () => {
    const refreshToken = sessionStorage.getItem(REFRESH_KEY);
  const token = getAccessToken();
    if (token && refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        /* ignore */
      }
    }
    setAccessToken(null);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(USER_KEY);
    set({ user: null, refreshToken: null });
  },
}));

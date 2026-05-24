'use client';

import { create } from 'zustand';
import { authApi, setAccessToken, getAccessToken } from '@/lib/api';
import {
  AUTH_SESSION_REFRESHED_EVENT,
  clearAuthSession,
  persistAuthSession,
  readStoredSession,
} from '@/lib/authSession';
import { signOutFirebase } from '@/lib/firebase/phoneAuth';
import type { AuthUser } from '@/lib/types';

interface AuthState {
  user: AuthUser | null;
  refreshToken: string | null;
  hydrated: boolean;
  login: (phone: string, idToken: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => Promise<void>;
  hydrate: () => void;
  syncFromStorage: () => void;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  refreshToken: null,
  hydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const { accessToken, refreshToken, user } = readStoredSession();
    if (accessToken) setAccessToken(accessToken);
    set({ user, refreshToken, hydrated: true });
  },

  syncFromStorage: () => {
    const { accessToken, refreshToken, user } = readStoredSession();
    if (accessToken) setAccessToken(accessToken);
    set({ user, refreshToken });
  },

  login: async (phone, idToken, name) => {
    const { data } = await authApi.login({ phone, idToken, name });
    if (data.user.role !== 'admin') {
      throw new Error('This account does not have admin access.');
    }
    setAccessToken(data.accessToken);
    persistAuthSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });
    set({ user: data.user, refreshToken: data.refreshToken });
  },

  setUser: (user) => {
    const refreshToken = get().refreshToken ?? readStoredSession().refreshToken;
    const accessToken = getAccessToken() ?? readStoredSession().accessToken;
    if (accessToken && refreshToken) {
      persistAuthSession({ accessToken, refreshToken, user });
    }
    set({ user });
  },

  clearSession: async () => {
    await signOutFirebase();
    clearAuthSession();
    setAccessToken(null);
    set({ user: null, refreshToken: null });
  },

  logout: async () => {
    const refreshToken = get().refreshToken ?? readStoredSession().refreshToken;
    const token = getAccessToken();
    if (token && refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        /* ignore */
      }
    }
    await get().clearSession();
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener(AUTH_SESSION_REFRESHED_EVENT, () => {
    useAuthStore.getState().syncFromStorage();
  });
}

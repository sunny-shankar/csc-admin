import { API_BASE } from './constants';
import type { AuthUser } from './types';

export const TOKEN_KEY = 'csc_admin_token';
export const REFRESH_KEY = 'csc_admin_refresh';
export const USER_KEY = 'csc_admin_user';

export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';
export const AUTH_SESSION_REFRESHED_EVENT = 'auth:session-refreshed';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

const AUTH_PATHS_NO_REFRESH = ['/auth/refresh', '/auth/verify-otp', '/auth/logout'];

export function shouldRefreshOnUnauthorized(path: string): boolean {
  return !AUTH_PATHS_NO_REFRESH.some((p) => path.startsWith(p));
}

export function readStoredSession(): {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
} {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null, user: null };
  }
  const accessToken = sessionStorage.getItem(TOKEN_KEY);
  const refreshToken = sessionStorage.getItem(REFRESH_KEY);
  const userRaw = sessionStorage.getItem(USER_KEY);
  let user: AuthUser | null = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw) as AuthUser;
    } catch {
      user = null;
    }
  }
  return { accessToken, refreshToken, user };
}

export function persistAuthSession({ accessToken, refreshToken, user }: AuthTokens): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(TOKEN_KEY, accessToken);
  sessionStorage.setItem(REFRESH_KEY, refreshToken);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_REFRESHED_EVENT));
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function notifySessionExpired(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
}

let refreshInFlight: Promise<string | null> | null = null;

/** Returns new access token, or null if refresh failed. */
export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = sessionStorage.getItem(REFRESH_KEY);
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const json = (await res.json()) as {
        success: boolean;
        data?: AuthTokens & { expiresIn?: string };
      };

      if (!res.ok || !json.success || !json.data?.accessToken) {
        return null;
      }

      persistAuthSession({
        accessToken: json.data.accessToken,
        refreshToken: json.data.refreshToken,
        user: json.data.user,
      });

      return json.data.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AUTH_SESSION_EXPIRED_EVENT } from '@/lib/authSession';
import { useAuthStore } from '@/store/authStore';

export function SessionExpiredHandler() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    const onExpired = () => {
      toast.error('Your session has expired. Please sign in again.');
      void clearSession().then(() => {
        router.replace('/login?reason=session-expired');
      });
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onExpired);
  }, [clearSession, router]);

  return null;
}

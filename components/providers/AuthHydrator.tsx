'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { SessionExpiredHandler } from '@/components/providers/SessionExpiredHandler';

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <SessionExpiredHandler />
      {children}
    </>
  );
}

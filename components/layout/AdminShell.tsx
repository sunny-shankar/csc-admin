'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace('/login');
    }
  }, [hydrated, user, router]);

  if (!hydrated) {
    return (
      <div className="admin-bg flex min-h-screen items-center justify-center">
        <LoadingSpinner label="Loading workspace…" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="admin-bg flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto px-6 py-4 lg:px-8 lg:py-5">
          <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}

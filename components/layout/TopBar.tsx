'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/reports': 'Reports',
  '/tasks': 'Tasks',
  '/users': 'Users',
  '/leaderboard': 'Leaderboard',
};

function resolveTitle(pathname: string): string {
  if (pathname.startsWith('/reports/')) return 'Report';
  if (pathname.startsWith('/tasks/new')) return 'New task';
  if (pathname.startsWith('/tasks/')) return 'Task';
  return titles[pathname] ?? 'Admin';
}

export function TopBar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const title = resolveTitle(pathname);

  return (
    <header
      className="sticky top-0 z-10 flex shrink-0 items-center border-b border-[var(--border)] bg-white"
      style={{ height: 'var(--navbar-height)' }}
    >
      <div className="flex w-full items-center justify-between px-4">
        <h1 className="text-[14px] font-semibold text-[var(--gray-900)]">{title}</h1>
        <span className="text-[12px] text-[var(--text-secondary)]">{user?.name}</span>
      </div>
    </header>
  );
}

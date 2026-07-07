'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/reports': 'Reports',
  '/tasks': 'Tasks',
  '/events': 'Events',
  '/users': 'Users',
  '/leaderboard': 'Leaderboard',
  '/account': 'My account',
};

function resolveTitle(pathname: string): string {
  if (pathname.startsWith('/reports/')) return 'Report';
  if (pathname.startsWith('/tasks/new')) return 'New task';
  if (pathname.startsWith('/tasks/')) return 'Task';
  if (pathname.startsWith('/events/new')) return 'New event';
  if (pathname.startsWith('/events/')) return 'Event';
  if (pathname.startsWith('/users/')) return 'User';
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
        <Link
          href="/account"
          className="text-[12px] text-[var(--text-secondary)] transition hover:text-[var(--gray-900)]"
        >
          {user?.name}
        </Link>
      </div>
    </header>
  );
}

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
  if (pathname.startsWith('/reports/')) return 'Report details';
  if (pathname.startsWith('/tasks/new')) return 'Create task';
  if (pathname.startsWith('/tasks/')) return 'Task details';
  return titles[pathname] ?? 'Admin';
}

export function TopBar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const title = resolveTitle(pathname);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 px-6 py-2.5 backdrop-blur-md lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Civic Connect</p>
          <h2 className="text-base font-semibold text-[#1A3C5E]">{title}</h2>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Signed in as <span className="font-medium text-slate-800">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}

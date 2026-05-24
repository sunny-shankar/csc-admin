'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  Trophy,
  LogOut,
  UserCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/cn';
import { userInitials } from '@/lib/userDisplay';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className="sticky top-0 flex h-screen shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]"
      style={{ width: 'var(--sidebar-width)' }}
    >
      <div className="border-b border-[var(--sidebar-border)] px-4 py-3">
        <p className="text-[13px] font-semibold text-[var(--gray-900)]">CNC Admin</p>
        <p className="text-[11px] text-[var(--text-muted)]">Smart Chandigarh</p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[13px] transition-colors',
                active
                  ? 'bg-[var(--sidebar-active)] font-medium text-[var(--gray-900)]'
                  : 'text-[var(--gray-700)] hover:bg-[var(--sidebar-hover)]',
              )}
            >
              <Icon size={16} strokeWidth={1.75} className="shrink-0 opacity-80" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--sidebar-border)] p-2">
        <Link
          href="/account"
          className={cn(
            'flex items-center gap-2 rounded-[8px] px-2 py-2 transition-colors',
            pathname === '/account'
              ? 'bg-[var(--sidebar-active)]'
              : 'hover:bg-[var(--sidebar-hover)]',
          )}
        >
          {user?.profilePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profilePhotoUrl}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full border border-[var(--border)] object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--gray-200)] text-[11px] font-semibold text-[var(--gray-700)]">
              {userInitials(user?.name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-[var(--gray-900)]">{user?.name}</p>
            <p className="truncate text-[11px] text-[var(--text-muted)]">My account</p>
          </div>
          <UserCircle size={16} className="shrink-0 text-[var(--gray-500)]" />
        </Link>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-0.5 flex w-full items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[13px] text-[var(--gray-700)] transition hover:bg-[var(--sidebar-hover)]"
        >
          <LogOut size={15} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

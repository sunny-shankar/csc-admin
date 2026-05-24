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
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/cn';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

function UserAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || 'A';
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2E86AB] text-sm font-semibold text-white ring-2 ring-white/20">
      {initial}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="sticky top-0 flex h-screen w-[17.5rem] shrink-0 flex-col border-r border-[#152f4a]/30 bg-gradient-to-b from-[#1A3C5E] to-[#122a42] text-white shadow-xl shadow-[#1A3C5E]/10">
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <Shield size={20} className="text-[#7ec8e3]" />
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight">CNC Admin</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">
              Smart CHD
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Menu
        </p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-[#2E86AB] text-white shadow-md shadow-black/10'
                  : 'text-white/75 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon
                size={18}
                className={cn(
                  'shrink-0 transition-colors',
                  active ? 'text-white' : 'text-white/60 group-hover:text-white',
                )}
              />
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/90" aria-hidden />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3 ring-1 ring-white/10">
          {user?.name && <UserAvatar name={user.name} />}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name ?? 'Admin'}</p>
            <p className="truncate text-xs text-white/50">{user?.phone ?? 'Administrator'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

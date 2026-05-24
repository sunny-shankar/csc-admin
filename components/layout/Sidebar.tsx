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
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

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
    <aside className="flex w-64 shrink-0 flex-col bg-[#1A3C5E] text-white">
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-lg font-semibold">CNC Admin</p>
        <p className="text-xs text-white/70">Smart CHD · Civic Connect</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active ? 'bg-[#2E86AB] text-white' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate px-3 text-xs text-white/60">{user?.name}</p>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

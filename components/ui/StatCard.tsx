import { cn } from '@/lib/cn';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--gray-600)]">
            {label}
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--gray-900)]">{value}</p>
        </div>
        {Icon && <Icon size={16} strokeWidth={1.75} className="shrink-0 text-[var(--gray-400)]" />}
      </div>
    </div>
  );
}

import { cn } from '@/lib/cn';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: 'default' | 'blue' | 'amber' | 'green' | 'red';
}

const toneStyles = {
  default: {
    icon: 'bg-slate-100 text-slate-600',
    value: 'text-[#1A3C5E]',
  },
  blue: {
    icon: 'bg-[#2E86AB]/10 text-[#2E86AB]',
    value: 'text-[#1A3C5E]',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-700',
    value: 'text-amber-900',
  },
  green: {
    icon: 'bg-emerald-100 text-emerald-700',
    value: 'text-emerald-900',
  },
  red: {
    icon: 'bg-red-100 text-red-700',
    value: 'text-red-900',
  },
};

export function StatCard({ label, value, icon: Icon, tone = 'default' }: StatCardProps) {
  const styles = toneStyles[tone];

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={cn('mt-2 truncate text-3xl font-bold tracking-tight', styles.value)}>
            {value}
          </p>
        </div>
        <div className={cn('rounded-xl p-2.5', styles.icon)}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

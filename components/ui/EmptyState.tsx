import { Inbox } from 'lucide-react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'card flex flex-col items-center justify-center gap-3 py-16 text-center',
        className,
      )}
    >
      <div className="rounded-full bg-slate-100 p-3 text-slate-400">
        <Inbox size={24} />
      </div>
      <p className="max-w-sm text-sm text-slate-500">{message}</p>
    </div>
  );
}

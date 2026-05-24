import { cn } from '@/lib/cn';

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export function LoadingSpinner({ label, className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16', className)}>
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-[#2E86AB]/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#2E86AB]" />
      </div>
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  );
}

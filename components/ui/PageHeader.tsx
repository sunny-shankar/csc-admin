import { cn } from '@/lib/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3', className)}>
      <div>
        <h2 className="text-[15px] font-semibold text-[var(--gray-900)]">{title}</h2>
        {description && <p className="mt-0.5 text-[12px] text-[var(--text-secondary)]">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-1.5">{action}</div>}
    </div>
  );
}

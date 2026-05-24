import { cn } from '@/lib/cn';

interface PageToolbarProps {
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/** Compact single-row bar for filters + page actions (title lives in TopBar). */
export function PageToolbar({ children, actions, className }: PageToolbarProps) {
  return (
    <div className={cn('card flex flex-wrap items-center gap-2 px-3 py-2.5', className)}>
      {children}
      {children && actions ? <div className="mx-1 hidden min-w-2 flex-1 sm:block" aria-hidden /> : null}
      {actions ? (
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">{actions}</div>
      ) : null}
    </div>
  );
}

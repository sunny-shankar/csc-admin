import { cn } from '@/lib/cn';

export function FilterBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('toolbar flex flex-wrap items-center gap-2 px-2.5 py-2', className)}>
      {children}
    </div>
  );
}

export function PageToolbar({
  children,
  actions,
  className,
}: {
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('toolbar flex flex-wrap items-center gap-2 px-2.5 py-2', className)}>
      {children}
      {children && actions ? <div className="hidden min-w-4 flex-1 sm:block" /> : null}
      {actions ? <div className="flex flex-wrap items-center gap-1.5">{actions}</div> : null}
    </div>
  );
}

export function DataTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('card overflow-hidden p-0 shadow-sm', className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-[var(--border)] bg-[var(--gray-50)]">
      <tr className="text-left text-[11px] font-medium uppercase tracking-wide text-[var(--gray-600)]">
        {children}
      </tr>
    </thead>
  );
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-[var(--border)] text-[13px]">{children}</tbody>;
}

export function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <th className={cn('px-3 py-2 font-medium', className)}>{children}</th>;
}

export function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn('px-3 py-2 text-[var(--gray-800)]', className)}>{children}</td>;
}

export function Tr({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn('table-row-hover', className)} style={{ height: 'var(--list-row-height)' }}>
      {children}
    </tr>
  );
}

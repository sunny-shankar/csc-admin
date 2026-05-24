import { cn } from '@/lib/cn';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('input-base', className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn('input-base', className)} {...props}>
      {children}
    </select>
  );
}

export function FilterInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('input-base filter-control', className)} {...props} />;
}

export function FilterSelect({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn('input-base filter-control', className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('input-base', className)} {...props} />;
}

export function InputGroup({
  prefix,
  suffix,
  children,
  className,
}: {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-9 w-full items-stretch rounded-[6px] border border-[var(--border)] bg-[var(--surface)]',
        'transition-[border-color,box-shadow] duration-150',
        'hover:border-[var(--gray-300)]',
        'focus-within:border-[var(--gray-900)] focus-within:shadow-[var(--shadow-focus)]',
        className,
      )}
    >
      {prefix != null ? (
        <span className="flex h-9 w-[3.25rem] shrink-0 items-center justify-center self-center border-r border-[var(--border)] bg-[var(--gray-50)] text-[13px] font-semibold leading-none text-[var(--gray-800)]">
          {prefix}
        </span>
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1 items-center [&_.input-group-field]:w-full">
        {children}
      </div>
      {suffix != null ? (
        <span className="flex h-full shrink-0 items-center border-l border-[var(--border)] bg-[var(--gray-50)] px-3 text-[13px] font-medium leading-none text-[var(--gray-600)]">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string | null;
  required?: boolean;
}

export function Field({ label, children, hint, error, required }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium text-[var(--gray-800)]">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-[12px] leading-snug text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] leading-snug text-[var(--text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

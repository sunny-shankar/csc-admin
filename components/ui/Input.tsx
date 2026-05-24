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
    <div className={cn('input-group', className)}>
      {prefix != null ? <span className="input-group-prefix">{prefix}</span> : null}
      {children}
      {suffix != null ? <span className="input-group-suffix">{suffix}</span> : null}
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

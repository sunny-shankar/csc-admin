import { cn } from '@/lib/cn';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] border border-transparent',
  secondary:
    'bg-[var(--control-bg)] text-[var(--gray-800)] hover:bg-[var(--gray-200)] border border-transparent',
  outline:
    'border border-[var(--border)] bg-white text-[var(--gray-700)] hover:bg-[var(--gray-50)]',
  ghost: 'text-[var(--gray-700)] hover:bg-[var(--control-bg)]',
  danger: 'bg-red-600 text-white hover:bg-red-700 border border-transparent',
};

const sizes: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-7 px-3 text-[13px] gap-1.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-[6px] font-medium transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

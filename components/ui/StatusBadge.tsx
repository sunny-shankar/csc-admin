import { STATUS_COLORS, DIFFICULTY_COLORS, PROOF_COLORS, TASK_STATUS_COLORS } from '@/lib/constants';
import {
  proofStatusLabel,
  reportStatusLabel,
  taskDifficultyLabel,
  taskStatusLabel,
} from '@/lib/statusLabels';
import type { ReportStatus, TaskDifficulty, ProofStatus, TaskStatus } from '@/lib/types';
import { cn } from '@/lib/cn';

type BadgeVariant = 'status' | 'difficulty' | 'proof' | 'taskStatus';

interface StatusBadgeProps {
  /** Raw enum value — label is derived automatically when set */
  value?: ReportStatus | TaskDifficulty | ProofStatus | TaskStatus | string;
  /** Override display text */
  label?: string;
  variant?: BadgeVariant;
  className?: string;
}

const colorMaps = {
  status: STATUS_COLORS,
  difficulty: DIFFICULTY_COLORS,
  proof: PROOF_COLORS,
  taskStatus: TASK_STATUS_COLORS,
} as const;

function labelForVariant(variant: BadgeVariant, value: string): string {
  switch (variant) {
    case 'status':
      return reportStatusLabel(value);
    case 'taskStatus':
      return taskStatusLabel(value);
    case 'proof':
      return proofStatusLabel(value);
    case 'difficulty':
      return taskDifficultyLabel(value);
    default:
      return value;
  }
}

export function StatusBadge({ label, variant = 'status', value, className }: StatusBadgeProps) {
  const displayLabel =
    label ?? (value != null && value !== '' ? labelForVariant(variant, String(value)) : '—');

  const colors =
    value && variant in colorMaps
      ? colorMaps[variant][value as keyof typeof colorMaps[typeof variant]]
      : 'bg-[var(--gray-100)] text-[var(--gray-700)]';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-none',
        colors,
        className,
      )}
    >
      {displayLabel}
    </span>
  );
}

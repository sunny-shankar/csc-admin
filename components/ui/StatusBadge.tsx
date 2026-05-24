import { STATUS_COLORS, DIFFICULTY_COLORS, PROOF_COLORS, TASK_STATUS_COLORS } from '@/lib/constants';
import type { ReportStatus, TaskDifficulty, ProofStatus, TaskStatus } from '@/lib/types';
import { cn } from '@/lib/cn';

type BadgeVariant = 'status' | 'difficulty' | 'proof' | 'taskStatus';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  value?: ReportStatus | TaskDifficulty | ProofStatus | TaskStatus;
}

const colorMaps = {
  status: STATUS_COLORS,
  difficulty: DIFFICULTY_COLORS,
  proof: PROOF_COLORS,
  taskStatus: TASK_STATUS_COLORS,
} as const;

export function StatusBadge({ label, variant = 'status', value }: StatusBadgeProps) {
  const colors =
    value && variant in colorMaps
      ? colorMaps[variant][value as keyof typeof colorMaps[typeof variant]]
      : 'bg-[var(--gray-100)] text-[var(--gray-700)]';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-none',
        colors,
      )}
    >
      {label.replace(/_/g, ' ')}
    </span>
  );
}

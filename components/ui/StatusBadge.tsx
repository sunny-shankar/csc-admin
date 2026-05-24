import { STATUS_COLORS, DIFFICULTY_COLORS, PROOF_COLORS, TASK_STATUS_COLORS } from '@/lib/constants';
import type { ReportStatus, TaskDifficulty, ProofStatus, TaskStatus } from '@/lib/types';

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
      : 'bg-zinc-100 text-zinc-700';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors}`}>
      {label}
    </span>
  );
}

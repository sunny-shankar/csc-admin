import type { ReportStatus, TaskDifficulty, ProofStatus } from './types';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const REPORT_STATUSES: ReportStatus[] = [
  'PENDING',
  'IN_REVIEW',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
];

export const REPORT_CATEGORIES = [
  'Road Damage',
  'Traffic Infrastructure',
  'Sanitation & Waste',
  'Parks & Public Spaces',
  'Water & Utilities',
  'Other',
] as const;

export const STATUS_COLORS: Record<ReportStatus, string> = {
  PENDING: 'bg-zinc-100 text-zinc-700',
  IN_REVIEW: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export const DIFFICULTY_COLORS: Record<TaskDifficulty, string> = {
  EASY: 'bg-emerald-100 text-emerald-800',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-red-100 text-red-800',
};

export const PROOF_COLORS: Record<ProofStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export const TASK_STATUSES = ['ACTIVE', 'CLOSED', 'ARCHIVED'] as const;
export const TASK_DIFFICULTIES = ['EASY', 'MEDIUM', 'HIGH'] as const;

export const DEFAULT_TASK_REWARD: Record<(typeof TASK_DIFFICULTIES)[number], number> = {
  EASY: 50,
  MEDIUM: 100,
  HIGH: 200,
};

export const TASK_STATUS_COLORS: Record<(typeof TASK_STATUSES)[number], string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-zinc-100 text-zinc-700',
  ARCHIVED: 'bg-red-100 text-red-800',
};

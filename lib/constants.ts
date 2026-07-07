import type { ReportStatus, TaskDifficulty, ProofStatus, EventStatus } from './types';

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

/** Frappe-style indicator pills */
export const STATUS_COLORS: Record<ReportStatus, string> = {
  PENDING: 'bg-[#f3f3f3] text-[#525252]',
  IN_REVIEW: 'bg-[#eff6ff] text-[#1d4ed8]',
  IN_PROGRESS: 'bg-[#fff7ed] text-[#c2410c]',
  RESOLVED: 'bg-[#dcfce7] text-[#166534]',
  REJECTED: 'bg-[#fef2f2] text-[#b91c1c]',
};

export const DIFFICULTY_COLORS: Record<TaskDifficulty, string> = {
  EASY: 'bg-[#dcfce7] text-[#166534]',
  MEDIUM: 'bg-[#fff7ed] text-[#c2410c]',
  HIGH: 'bg-[#fef2f2] text-[#b91c1c]',
};

export const PROOF_COLORS: Record<ProofStatus, string> = {
  PENDING: 'bg-[#fff7ed] text-[#c2410c]',
  APPROVED: 'bg-[#dcfce7] text-[#166534]',
  REJECTED: 'bg-[#fef2f2] text-[#b91c1c]',
};

export const TASK_STATUSES = ['ACTIVE', 'CLOSED', 'ARCHIVED'] as const;
export const TASK_DIFFICULTIES = ['EASY', 'MEDIUM', 'HIGH'] as const;

export const DEFAULT_TASK_REWARD: Record<(typeof TASK_DIFFICULTIES)[number], number> = {
  EASY: 50,
  MEDIUM: 100,
  HIGH: 200,
};

export const TASK_STATUS_COLORS: Record<(typeof TASK_STATUSES)[number], string> = {
  ACTIVE: 'bg-[#dcfce7] text-[#166534]',
  CLOSED: 'bg-[#f3f3f3] text-[#525252]',
  ARCHIVED: 'bg-[#f3f3f3] text-[#7c7c7c]',
};

export const EVENT_STATUSES: EventStatus[] = ['ACTIVE', 'ARCHIVED'];

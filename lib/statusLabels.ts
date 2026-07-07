import type { ProofStatus, ReportStatus, TaskDifficulty, TaskStatus, EventStatus } from './types';

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: 'Pending',
  IN_REVIEW: 'In review',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
};

export const PROOF_STATUS_LABELS: Record<ProofStatus, string> = {
  PENDING: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const TASK_DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  ACTIVE: 'Active',
  ARCHIVED: 'Archived',
};

export function reportStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return REPORT_STATUS_LABELS[status as ReportStatus] ?? humanizeEnum(status);
}

export function taskStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return TASK_STATUS_LABELS[status as TaskStatus] ?? humanizeEnum(status);
}

export function proofStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return PROOF_STATUS_LABELS[status as ProofStatus] ?? humanizeEnum(status);
}

export function taskDifficultyLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return TASK_DIFFICULTY_LABELS[value as TaskDifficulty] ?? humanizeEnum(value);
}

export function eventStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return EVENT_STATUS_LABELS[status as EventStatus] ?? humanizeEnum(status);
}

function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

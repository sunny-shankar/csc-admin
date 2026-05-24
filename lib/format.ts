import { format, parseISO } from 'date-fns';

export const formatDate = (value?: string | null) => {
  if (!value) return '—';
  try {
    return format(parseISO(value), 'dd MMM yyyy');
  } catch {
    return value;
  }
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  try {
    return format(parseISO(value), 'dd MMM yyyy, HH:mm');
  } catch {
    return value;
  }
};

export const formatPercent = (value: number) => `${Math.round(value)}%`;

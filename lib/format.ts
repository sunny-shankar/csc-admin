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

/** API month key e.g. `2025-05` */
export const formatMonthYear = (value?: string | null) => {
  if (!value) return '—';
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  try {
    return format(new Date(Number(match[1]), Number(match[2]) - 1, 1), 'MMMM yyyy');
  } catch {
    return value;
  }
};

/** Date on one line, time on the next (for table cells). */
export const formatDateWithTime = (value?: string | null) => {
  if (!value) return { date: '—', time: '' };
  try {
    const d = parseISO(value);
    return { date: format(d, 'dd MMM yyyy'), time: format(d, 'HH:mm') };
  } catch {
    return { date: value, time: '' };
  }
};

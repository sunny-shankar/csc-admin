import { formatDateWithTime } from '@/lib/format';

export function DateCell({ value }: { value?: string | null }) {
  if (!value) return <span className="text-[var(--text-muted)]">—</span>;
  const { date, time } = formatDateWithTime(value);
  return (
    <div className="whitespace-nowrap text-[var(--text-secondary)]">
      <span className="block text-[var(--gray-800)]">{date}</span>
      {time ? <span className="text-[11px]">{time}</span> : null}
    </div>
  );
}

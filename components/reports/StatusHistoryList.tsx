import { ArrowRight } from 'lucide-react';
import { formatDateTime } from '@/lib/format';
import type { StatusHistoryEntry } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function StatusHistoryList({ items }: { items: StatusHistoryEntry[] }) {
  if (!items.length) {
    return <p className="text-[13px] text-[var(--text-muted)]">No status changes yet.</p>;
  }

  return (
    <ul className="mt-1 divide-y divide-[var(--border)]">
      {items.map((h) => (
        <li key={h.id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-center gap-2">
            {h.oldStatus ? (
              <StatusBadge variant="status" value={h.oldStatus} />
            ) : (
              <span className="text-[12px] text-[var(--text-muted)]">Submitted</span>
            )}
            <ArrowRight size={14} className="shrink-0 text-[var(--gray-400)]" aria-hidden />
            <StatusBadge variant="status" value={h.newStatus} />
          </div>
          <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">
            {h.changedByName ?? 'System'} · {formatDateTime(h.createdAt)}
          </p>
          {h.note ? (
            <p className="mt-2 rounded-[6px] bg-[var(--gray-50)] px-2.5 py-2 text-[13px] leading-snug text-[var(--gray-800)]">
              {h.note}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

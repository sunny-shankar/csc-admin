export function DetailGrid({
  rows,
}: {
  rows: { label: string; value?: React.ReactNode }[];
}) {
  return (
    <dl className="space-y-2.5 text-[13px]">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex justify-between gap-4">
          <dt className="shrink-0 text-[var(--text-secondary)]">{label}</dt>
          <dd className="text-right text-[var(--gray-900)]">{value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--gray-200)] border-t-[var(--gray-900)]" />
      {label && <p className="text-[12px] text-[var(--text-secondary)]">{label}</p>}
    </div>
  );
}

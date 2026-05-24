interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="card py-16 text-center">
      <p className="text-[13px] text-[var(--text-secondary)]">{message}</p>
    </div>
  );
}

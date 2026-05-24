interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-200 bg-white py-16 text-center text-sm text-zinc-500">
      {message}
    </div>
  );
}

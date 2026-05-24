import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-[12px] text-[var(--text-secondary)] transition hover:text-[var(--gray-900)]"
    >
      <ArrowLeft size={14} strokeWidth={1.75} />
      {children}
    </Link>
  );
}

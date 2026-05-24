'use client';

import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-neutral-900/20"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-[8px] border border-[var(--border)] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[var(--gray-900)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] p-1 text-[var(--gray-500)] hover:bg-[var(--control-bg)] hover:text-[var(--gray-700)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

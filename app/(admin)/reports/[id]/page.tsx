'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { reportsApi } from '@/lib/api';
import { REPORT_STATUSES } from '@/lib/constants';
import { formatDateTime } from '@/lib/format';
import type { ReportStatus } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ReportStatus | ''>('');
  const [note, setNote] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: () => reportsApi.get(id),
  });

  const report = data?.data;

  const updateMutation = useMutation({
    mutationFn: () =>
      reportsApi.updateStatus(id, {
        status: status as ReportStatus,
        note: note || undefined,
        resolutionNote: resolutionNote || undefined,
      }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['report', id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!report) {
    return (
      <div className="text-center text-zinc-500">
        Report not found.{' '}
        <Link href="/reports" className="text-[#2E86AB]">
          Back to list
        </Link>
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;

  return (
    <div className="space-y-6">
      <Link
        href="/reports"
        className="inline-flex items-center gap-2 text-sm text-[#2E86AB] hover:underline"
      >
        <ArrowLeft size={16} />
        Back to reports
      </Link>

      <PageHeader
        title={report.reportCode}
        description={`${report.category}${report.subcategory ? ` · ${report.subcategory}` : ''}`}
        action={<StatusBadge label={report.status} variant="status" value={report.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {report.photoUrl && (
            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={report.photoUrl}
                alt="Report"
                className="max-h-96 w-full object-cover"
              />
            </div>
          )}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-[#1A3C5E]">Details</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Submitter</dt>
                <dd>{report.submitter?.name ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Phone</dt>
                <dd>{report.submitter?.phone ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Ward</dt>
                <dd>{report.submitter?.ward ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Address</dt>
                <dd className="text-right">{report.address ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Points awarded</dt>
                <dd>{report.pointsAwarded}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Created</dt>
                <dd>{formatDateTime(report.createdAt)}</dd>
              </div>
            </dl>
            {report.description && (
              <p className="mt-4 text-sm text-zinc-700">{report.description}</p>
            )}
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-[#2E86AB] hover:underline"
            >
              <ExternalLink size={14} />
              Open in Google Maps ({report.latitude}, {report.longitude})
            </a>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#1A3C5E]">Update status</h2>
            <div className="space-y-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReportStatus)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Select new status</option>
                {REPORT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Admin note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                rows={2}
              />
              <textarea
                placeholder="Resolution note"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                rows={2}
              />
              <button
                type="button"
                disabled={!status || updateMutation.isPending}
                onClick={() => updateMutation.mutate()}
                className="w-full rounded-lg bg-[#1A3C5E] py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {updateMutation.isPending ? 'Saving…' : 'Save status'}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#1A3C5E]">Status history</h2>
            {!report.statusHistory?.length ? (
              <p className="text-sm text-zinc-500">No history yet.</p>
            ) : (
              <ul className="space-y-4 border-l-2 border-zinc-200 pl-4">
                {report.statusHistory.map((h) => (
                  <li key={h.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#2E86AB]" />
                    <p className="text-sm font-medium">
                      {h.oldStatus ?? '—'} → {h.newStatus}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {h.changedByName ?? 'System'} · {formatDateTime(h.createdAt)}
                    </p>
                    {h.note && <p className="mt-1 text-sm text-zinc-600">{h.note}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

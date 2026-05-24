'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ExternalLink } from 'lucide-react';
import { reportsApi } from '@/lib/api';
import { REPORT_STATUSES } from '@/lib/constants';
import { formatDateTime } from '@/lib/format';
import type { ReportStatus } from '@/lib/types';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select, Textarea } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';

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
      <p className="text-sm text-neutral-500">
        Report not found.{' '}
        <Link href="/reports" className="text-neutral-900 hover:underline">
          Back to list
        </Link>
      </p>
    );
  }

  const mapUrl = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;

  return (
    <div className="space-y-6">
      <BackLink href="/reports">Back to reports</BackLink>

      <PageHeader
        title={report.reportCode}
        description={`${report.category}${report.subcategory ? ` · ${report.subcategory}` : ''}`}
        action={<StatusBadge label={report.status} variant="status" value={report.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {report.photoUrl && (
            <Card padding="none" className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={report.photoUrl} alt="Report" className="max-h-96 w-full object-cover" />
            </Card>
          )}

          <Card>
            <p className="section-head">Details</p>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Submitter</dt>
                <dd className="text-neutral-900">{report.submitter?.name ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Phone</dt>
                <dd>{report.submitter?.phone ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Ward</dt>
                <dd>{report.submitter?.ward ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Address</dt>
                <dd className="text-right">{report.address ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Points</dt>
                <dd>{report.pointsAwarded}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Created</dt>
                <dd>{formatDateTime(report.createdAt)}</dd>
              </div>
            </dl>
            {report.description && (
              <p className="mt-4 border-t border-neutral-100 pt-4 text-sm text-neutral-700">
                {report.description}
              </p>
            )}
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900"
            >
              <ExternalLink size={14} />
              View on map
            </a>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <p className="section-head">Update status</p>
            <div className="mt-4 space-y-3">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReportStatus)}
              >
                <option value="">Select new status</option>
                {REPORT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              <Textarea
                placeholder="Admin note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
              <Textarea
                placeholder="Resolution note"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={2}
              />
              <Button
                className="w-full"
                disabled={!status || updateMutation.isPending}
                onClick={() => updateMutation.mutate()}
              >
                {updateMutation.isPending ? 'Saving…' : 'Save status'}
              </Button>
            </div>
          </Card>

          <Card>
            <p className="section-head">Status history</p>
            {!report.statusHistory?.length ? (
              <p className="mt-3 text-sm text-neutral-500">No history yet.</p>
            ) : (
              <ul className="mt-4 space-y-4 border-l border-neutral-200 pl-4">
                {report.statusHistory.map((h) => (
                  <li key={h.id} className="relative">
                    <span className="absolute -left-[17px] top-1.5 h-1.5 w-1.5 rounded-full bg-neutral-400" />
                    <p className="text-sm font-medium text-neutral-900">
                      {h.oldStatus ?? '—'} → {h.newStatus}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {h.changedByName ?? 'System'} · {formatDateTime(h.createdAt)}
                    </p>
                    {h.note && <p className="mt-1 text-sm text-neutral-600">{h.note}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ExternalLink } from 'lucide-react';
import { reportsApi } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { DetailGrid } from '@/components/ui/DetailGrid';
import type { ReportStatus } from '@/lib/types';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { Field, Textarea } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ReportStatusSelect } from '@/components/reports/ReportStatusSelect';
import { StatusHistoryList } from '@/components/reports/StatusHistoryList';

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
      setStatus('');
      setNote('');
      setResolutionNote('');
      queryClient.invalidateQueries({ queryKey: ['report', id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!report) {
    return (
      <p className="text-[13px] text-[var(--text-secondary)]">
        Report not found.{' '}
        <Link href="/reports" className="text-[var(--gray-900)] hover:underline">
          Back to list
        </Link>
      </p>
    );
  }

  const mapUrl = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
  const showResolutionNote =
    status === 'RESOLVED' || status === 'REJECTED' || report.status === 'RESOLVED';

  return (
    <div className="space-y-4">
      <BackLink href="/reports">Back to reports</BackLink>

      <PageHeader
        title={report.reportCode}
        description={`${report.category}${report.subcategory ? ` · ${report.subcategory}` : ''}`}
        action={<StatusBadge variant="status" value={report.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          {report.photoUrl && (
            <Card padding="none" className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={report.photoUrl} alt="Report" className="max-h-96 w-full object-cover" />
            </Card>
          )}

          <Card>
            <p className="section-head">Details</p>
            <div className="mt-4">
              <DetailGrid
                rows={[
                  {
                    label: 'Submitter',
                    value: report.submitter?.id ? (
                      <Link
                        href={`/users/${report.submitter.id}`}
                        className="text-[var(--gray-900)] hover:underline"
                      >
                        {report.submitter.name}
                      </Link>
                    ) : (
                      report.submitter?.name
                    ),
                  },
                  { label: 'Phone', value: report.submitter?.phone },
                  { label: 'Ward', value: report.submitter?.ward },
                  { label: 'Address', value: report.address },
                  { label: 'Points awarded', value: report.pointsAwarded },
                  { label: 'Created', value: formatDateTime(report.createdAt) },
                  { label: 'Updated', value: formatDateTime(report.updatedAt) },
                ]}
              />
            </div>
            {report.description && (
              <p className="mt-4 border-t border-[var(--border)] pt-4 text-[13px] leading-relaxed text-[var(--gray-800)]">
                {report.description}
              </p>
            )}
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] hover:text-[var(--gray-900)]"
            >
              <ExternalLink size={14} />
              View on map
            </a>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
              <p className="section-head !mb-0">Update status</p>
              <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                <span>Current</span>
                <StatusBadge variant="status" value={report.status} />
              </div>
            </div>

            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!status) return;
                updateMutation.mutate();
              }}
            >
              <Field label="New status" required>
                <ReportStatusSelect
                  allowEmpty
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReportStatus)}
                  emptyLabel="Choose status…"
                  exclude={[report.status]}
                />
              </Field>

              <Field label="Admin note" hint="Optional — shown in status history">
                <Textarea
                  placeholder="e.g. Assigned to ward officer for inspection"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="!min-h-[4.5rem]"
                />
              </Field>

              {showResolutionNote ? (
                <Field
                  label="Resolution note"
                  hint={status === 'REJECTED' ? 'Reason for rejection' : 'How the issue was resolved'}
                >
                  <Textarea
                    placeholder="Describe the outcome"
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    rows={2}
                    className="!min-h-[4.5rem]"
                  />
                </Field>
              ) : null}

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!status || updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <p className="section-head">Status history</p>
            <StatusHistoryList items={report.statusHistory ?? []} />
          </Card>
        </div>
      </div>
    </div>
  );
}

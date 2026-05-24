'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import type { TaskVolunteer } from '@/lib/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Archive } from 'lucide-react';
import { tasksApi } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/format';
import { DetailGrid } from '@/components/ui/DetailGrid';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';

function VolunteerProofCard({
  taskId,
  volunteer,
  onUpdated,
}: {
  taskId: string;
  volunteer: TaskVolunteer;
  onUpdated: () => void;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const userId = volunteer.userId || volunteer.user?.id;

  const approveMutation = useMutation({
    mutationFn: () => tasksApi.approve(taskId, userId!),
    onSuccess: () => {
      toast.success('Proof approved');
      onUpdated();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectMutation = useMutation({
    mutationFn: () => tasksApi.reject(taskId, userId!, reason),
    onSuccess: () => {
      toast.success('Proof rejected');
      setRejectOpen(false);
      onUpdated();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card padding="sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-[var(--gray-900)]">
            {volunteer.user?.id ? (
              <Link href={`/users/${volunteer.user.id}`} className="hover:underline">
                {volunteer.user.name}
              </Link>
            ) : (
              (volunteer.user?.name ?? 'Volunteer')
            )}
          </p>
          <p className="text-xs text-neutral-500">
            {volunteer.user?.ward} · {formatDateTime(volunteer.nominatedAt)}
          </p>
        </div>
        <StatusBadge label={volunteer.proofStatus} variant="proof" value={volunteer.proofStatus} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs text-neutral-500">Before</p>
          {volunteer.beforePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={volunteer.beforePhotoUrl}
              alt="Before"
              className="h-40 w-full rounded-md border border-neutral-200 object-cover"
            />
          ) : (
            <p className="text-sm text-neutral-400">Not uploaded</p>
          )}
        </div>
        <div>
          <p className="mb-1 text-xs text-neutral-500">After</p>
          {volunteer.afterPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={volunteer.afterPhotoUrl}
              alt="After"
              className="h-40 w-full rounded-md border border-neutral-200 object-cover"
            />
          ) : (
            <p className="text-sm text-neutral-400">Not uploaded</p>
          )}
        </div>
      </div>

      {volunteer.rejectionReason && (
        <p className="mt-2 text-sm text-red-600">Rejected: {volunteer.rejectionReason}</p>
      )}

      {volunteer.proofStatus === 'PENDING' && userId && (
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isPending}
          >
            Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => setRejectOpen(true)}>
            Reject
          </Button>
        </div>
      )}

      <Modal open={rejectOpen} title="Reject proof" onClose={() => setRejectOpen(false)}>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection"
          rows={3}
          className="mb-3"
        />
        <Button
          variant="danger"
          className="w-full"
          disabled={reason.length < 3 || rejectMutation.isPending}
          onClick={() => rejectMutation.mutate()}
        >
          Confirm reject
        </Button>
      </Modal>
    </Card>
  );
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const taskQuery = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.get(id),
  });

  const volunteersQuery = useQuery({
    queryKey: ['task-volunteers', id],
    queryFn: () => tasksApi.volunteers(id),
  });

  const archiveMutation = useMutation({
    mutationFn: () => tasksApi.archive(id),
    onSuccess: () => {
      toast.success('Task archived');
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (taskQuery.isLoading) return <LoadingSpinner />;

  const task = taskQuery.data?.data;
  if (!task) {
    return (
      <p className="text-sm text-neutral-500">
        Task not found.{' '}
        <Link href="/tasks" className="text-neutral-900 hover:underline">
          Back
        </Link>
      </p>
    );
  }

  const volunteers = volunteersQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <BackLink href="/tasks">Back to tasks</BackLink>

      <PageHeader
        title={task.title}
        description={`Ward ${task.ward}`}
        action={
          task.status !== 'ARCHIVED' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
            >
              <Archive size={16} />
              Archive
            </Button>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="mb-4 flex flex-wrap gap-2">
            <StatusBadge label={task.status} variant="taskStatus" value={task.status} />
            <StatusBadge label={task.difficulty} variant="difficulty" value={task.difficulty} />
          </div>
          <p className="text-[13px] text-[var(--text-secondary)]">{task.description ?? 'No description'}</p>
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <DetailGrid
              rows={[
                {
                  label: 'Task period',
                  value: `${formatDate(task.startDate)} – ${formatDate(task.endDate)}`,
                },
                {
                  label: 'Volunteers',
                  value: `${task.volunteerCount}/${task.maxVolunteers}`,
                },
                { label: 'Reward', value: `${task.rewardPoints} pts` },
                { label: 'Created', value: formatDateTime(task.createdAt) },
                { label: 'Updated', value: formatDateTime(task.updatedAt) },
              ]}
            />
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <p className="section-head">Volunteers</p>
          {volunteersQuery.isLoading ? (
            <LoadingSpinner />
          ) : volunteers.length === 0 ? (
            <EmptyState message="No volunteers yet." />
          ) : (
            volunteers.map((v) => (
              <VolunteerProofCard
                key={v.id}
                taskId={id}
                volunteer={v}
                onUpdated={() => {
                  volunteersQuery.refetch();
                  taskQuery.refetch();
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

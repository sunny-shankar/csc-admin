'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Archive } from 'lucide-react';
import { tasksApi } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/format';
import type { TaskVolunteer } from '@/lib/types';
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
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-[#1A3C5E]">{volunteer.user?.name ?? 'Volunteer'}</p>
          <p className="text-xs text-zinc-500">
            {volunteer.user?.ward} · {formatDateTime(volunteer.nominatedAt)}
          </p>
        </div>
        <StatusBadge label={volunteer.proofStatus} variant="proof" value={volunteer.proofStatus} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium text-zinc-500">Before</p>
          {volunteer.beforePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={volunteer.beforePhotoUrl} alt="Before" className="h-40 w-full rounded-lg object-cover" />
          ) : (
            <p className="text-sm text-zinc-400">Not uploaded</p>
          )}
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-zinc-500">After</p>
          {volunteer.afterPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={volunteer.afterPhotoUrl} alt="After" className="h-40 w-full rounded-lg object-cover" />
          ) : (
            <p className="text-sm text-zinc-400">Not uploaded</p>
          )}
        </div>
      </div>

      {volunteer.rejectionReason && (
        <p className="mt-2 text-sm text-red-600">Rejected: {volunteer.rejectionReason}</p>
      )}

      {volunteer.proofStatus === 'PENDING' && userId && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isPending}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white disabled:opacity-60"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => setRejectOpen(true)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700"
          >
            Reject
          </button>
        </div>
      )}

      <Modal open={rejectOpen} title="Reject proof" onClose={() => setRejectOpen(false)}>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection"
          className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
          rows={3}
        />
        <button
          type="button"
          disabled={reason.length < 3 || rejectMutation.isPending}
          onClick={() => rejectMutation.mutate()}
          className="w-full rounded-lg bg-red-600 py-2 text-sm text-white disabled:opacity-60"
        >
          Confirm reject
        </button>
      </Modal>
    </div>
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
      <p className="text-zinc-500">
        Task not found.{' '}
        <Link href="/tasks" className="text-[#2E86AB]">
          Back
        </Link>
      </p>
    );
  }

  const volunteers = volunteersQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <Link href="/tasks" className="inline-flex items-center gap-2 text-sm text-[#2E86AB] hover:underline">
        <ArrowLeft size={16} />
        Back to tasks
      </Link>

      <PageHeader
        title={task.title}
        description={task.ward}
        action={
          task.status !== 'ARCHIVED' ? (
            <button
              type="button"
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50"
            >
              <Archive size={16} />
              Archive
            </button>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-1">
          <div className="mb-4 flex flex-wrap gap-2">
            <StatusBadge label={task.status} variant="taskStatus" value={task.status} />
            <StatusBadge label={task.difficulty} variant="difficulty" value={task.difficulty} />
          </div>
          <p className="text-sm text-zinc-600">{task.description ?? 'No description'}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Dates</dt>
              <dd>
                {formatDate(task.startDate)} – {formatDate(task.endDate)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Volunteers</dt>
              <dd>
                {task.volunteerCount}/{task.maxVolunteers}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Reward</dt>
              <dd>{task.rewardPoints} pts</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <h2 className="font-semibold text-[#1A3C5E]">Volunteers & proof review</h2>
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

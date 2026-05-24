'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { tasksApi } from '@/lib/api';
import { TASK_DIFFICULTIES, TASK_STATUSES } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';

export default function TasksListPage() {
  const [page, setPage] = useState(1);
  const [ward, setWard] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('');

  const filters = { page, limit: 20, ward, difficulty, status };

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksApi.list(filters),
  });

  const tasks = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteer tasks"
        description="Create and manage civic volunteer opportunities"
        action={
          <Link
            href="/tasks/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1A3C5E] px-4 py-2 text-sm font-medium text-white hover:bg-[#152f4a]"
          >
            <Plus size={16} />
            Create task
          </Link>
        }
      />

      <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-sm">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">All difficulties</option>
          {TASK_DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <input
          placeholder="Ward filter"
          value={ward}
          onChange={(e) => {
            setWard(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <EmptyState message="No tasks found." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((t) => (
            <Link
              key={t.id}
              href={`/tasks/${t.id}`}
              className="block rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-[#1A3C5E]">{t.title}</h3>
                <StatusBadge label={t.status} variant="taskStatus" value={t.status} />
              </div>
              <p className="line-clamp-2 text-sm text-zinc-600">
                {t.description ?? 'No description'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <StatusBadge label={t.difficulty} variant="difficulty" value={t.difficulty} />
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-zinc-700">
                  {t.ward}
                </span>
                <span className="rounded-full bg-[#2E86AB]/10 px-2.5 py-0.5 text-[#2E86AB]">
                  +{t.rewardPoints} pts
                </span>
              </div>
              <p className="mt-3 text-xs text-zinc-500">
                {formatDate(t.startDate)} – {formatDate(t.endDate)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {t.volunteerCount}/{t.maxVolunteers} volunteers
              </p>
            </Link>
          ))}
        </div>
      )}

      {meta && (
        <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}

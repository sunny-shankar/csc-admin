'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { tasksApi } from '@/lib/api';
import { TASK_DIFFICULTIES, TASK_STATUSES } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FilterInput, FilterSelect } from '@/components/ui/Input';

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
    <div className="space-y-4">
      <PageToolbar
        actions={
          <Link href="/tasks/new">
            <Button size="sm">
              <Plus size={16} />
              Create task
            </Button>
          </Link>
        }
      >
        <FilterSelect
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All difficulties</option>
          {TASK_DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </FilterSelect>
        <FilterInput
          placeholder="Ward"
          value={ward}
          onChange={(e) => {
            setWard(e.target.value);
            setPage(1);
          }}
          className="min-w-[7rem] max-w-[8rem]"
        />
      </PageToolbar>

      {isLoading ? (
        <LoadingSpinner label="Loading tasks…" />
      ) : tasks.length === 0 ? (
        <EmptyState message="No tasks found. Create one to get started." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((t) => (
            <Link key={t.id} href={`/tasks/${t.id}`}>
              <Card hover className="h-full">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-snug text-[#1A3C5E]">{t.title}</h3>
                  <StatusBadge label={t.status} variant="taskStatus" value={t.status} />
                </div>
                <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
                  {t.description ?? 'No description'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge label={t.difficulty} variant="difficulty" value={t.difficulty} />
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                    Ward {t.ward}
                  </span>
                  <span className="inline-flex rounded-full bg-[#2E86AB]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#2E86AB]">
                    +{t.rewardPoints} pts
                  </span>
                </div>
                <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <p>
                    {formatDate(t.startDate)} – {formatDate(t.endDate)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">{t.volunteerCount}</span> /{' '}
                    {t.maxVolunteers} volunteers
                  </p>
                </div>
              </Card>
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

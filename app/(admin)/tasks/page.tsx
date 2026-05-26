'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { tasksApi } from '@/lib/api';
import { TASK_DIFFICULTIES, TASK_STATUSES } from '@/lib/constants';
import { taskDifficultyLabel, taskStatusLabel } from '@/lib/statusLabels';
import { formatDate } from '@/lib/format';
import { DateCell } from '@/components/ui/DateCell';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { FilterInput, FilterSelect } from '@/components/ui/Input';
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  Td,
  Th,
  Tr,
} from '@/components/ui/DataTable';

export default function TasksListPage() {
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('');

  const filters = {
    page,
    limit: 20,
    title,
    difficulty,
    status,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksApi.list(filters),
  });

  const tasks = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-3">
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
              {taskStatusLabel(s)}
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
              {taskDifficultyLabel(d)}
            </option>
          ))}
        </FilterSelect>
        <FilterInput
          placeholder="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setPage(1);
          }}
          className="min-w-[9rem] max-w-[14rem]"
        />
      </PageToolbar>

      {isLoading ? (
        <LoadingSpinner label="Loading tasks…" />
      ) : tasks.length === 0 ? (
        <EmptyState message="No tasks found. Create one to get started." />
      ) : (
        <DataTable>
          <table className="w-full min-w-[960px]">
            <DataTableHead>
              <Th>Title</Th>
              <Th>Status</Th>
              <Th>Ward</Th>
              <Th>Location</Th>
              <Th>Period</Th>
              <Th>Volunteers</Th>
              <Th>Created</Th>
              <Th>Updated</Th>
              <Th className="text-right" />
            </DataTableHead>
            <DataTableBody>
              {tasks.map((t) => (
                <Tr key={t.id}>
                  <Td className="max-w-[200px] font-medium text-[var(--gray-900)]">
                    <span className="line-clamp-2">{t.title}</span>
                    <span className="mt-0.5 block text-[11px] font-normal text-[var(--text-secondary)]">
                      {t.difficulty} · +{t.rewardPoints} pts
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge variant="taskStatus" value={t.status} />
                  </Td>
                  <Td>{t.ward}</Td>
                  <Td className="whitespace-nowrap text-[11px] text-[var(--text-secondary)]">
                    {t.latitude != null && t.longitude != null
                      ? `${t.latitude}, ${t.longitude}`
                      : '—'}
                  </Td>
                  <Td className="whitespace-nowrap text-[var(--text-secondary)]">
                    {formatDate(t.startDate)} – {formatDate(t.endDate)}
                  </Td>
                  <Td className="tabular-nums">
                    {t.volunteerCount}/{t.maxVolunteers}
                  </Td>
                  <Td>
                    <DateCell value={t.createdAt} />
                  </Td>
                  <Td>
                    <DateCell value={t.updatedAt} />
                  </Td>
                  <Td className="text-right">
                    <Link
                      href={`/tasks/${t.id}`}
                      className="text-[13px] text-[var(--gray-900)] hover:underline"
                    >
                      View
                    </Link>
                  </Td>
                </Tr>
              ))}
            </DataTableBody>
          </table>
          {meta && (
            <div className="border-t border-[var(--border)] px-3">
              <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
            </div>
          )}
        </DataTable>
      )}
    </div>
  );
}

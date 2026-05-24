'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { tasksApi } from '@/lib/api';
import { TASK_DIFFICULTIES, TASK_STATUSES } from '@/lib/constants';
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
  const [ward, setWard] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('5000');

  const filters = {
    page,
    limit: 20,
    ward,
    difficulty,
    status,
    ...(latitude.trim() && longitude.trim()
      ? {
          latitude: Number(latitude),
          longitude: Number(longitude),
          radius: Number(radius) || 5000,
        }
      : {}),
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
        <FilterInput
          placeholder="Lat"
          value={latitude}
          onChange={(e) => {
            setLatitude(e.target.value);
            setPage(1);
          }}
          className="min-w-[6rem] max-w-[7rem]"
        />
        <FilterInput
          placeholder="Lng"
          value={longitude}
          onChange={(e) => {
            setLongitude(e.target.value);
            setPage(1);
          }}
          className="min-w-[6rem] max-w-[7rem]"
        />
        <FilterInput
          placeholder="Radius (m)"
          value={radius}
          onChange={(e) => {
            setRadius(e.target.value);
            setPage(1);
          }}
          className="min-w-[6rem] max-w-[8rem]"
          title="Meters — used with lat/lng"
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
                    <StatusBadge label={t.status} variant="taskStatus" value={t.status} />
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

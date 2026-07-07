'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { EVENT_STATUSES } from '@/lib/constants';
import { eventStatusLabel } from '@/lib/statusLabels';
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

export default function EventsListPage() {
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');

  const filters = {
    page,
    limit: 20,
    title,
    status,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsApi.list(filters),
  });

  const events = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-3">
      <PageToolbar
        actions={
          <Link href="/events/new">
            <Button size="sm">
              <Plus size={16} />
              Create event
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
          {EVENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {eventStatusLabel(s)}
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
        <LoadingSpinner />
      ) : events.length === 0 ? (
        <EmptyState message="No events yet. Create one to get started." />
      ) : (
        <DataTable>
          <DataTableHead>
            <Th>Title</Th>
            <Th>Status</Th>
            <Th>Interested</Th>
            <Th>Created</Th>
            <Th />
          </DataTableHead>
          <DataTableBody>
            {events.map((event) => (
              <Tr key={event.id}>
                <Td>
                  <p className="font-medium text-[var(--gray-900)]">{event.title}</p>
                  {event.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-muted)]">
                      {event.description}
                    </p>
                  )}
                </Td>
                <Td>
                  <StatusBadge variant="taskStatus" value={event.status} />
                </Td>
                <Td>{event.interestCount}</Td>
                <Td>
                  <DateCell value={event.createdAt} />
                </Td>
                <Td className="text-right">
                  <Link
                    href={`/events/${event.id}`}
                    className="text-[12px] font-medium text-[var(--gray-700)] hover:text-[var(--gray-900)]"
                  >
                    View
                  </Link>
                </Td>
              </Tr>
            ))}
          </DataTableBody>
        </DataTable>
      )}

      {meta && meta.totalPages > 1 && (
        <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}

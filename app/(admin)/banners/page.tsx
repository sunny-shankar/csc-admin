'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { bannersApi } from '@/lib/api';
import { BANNER_STATUSES } from '@/lib/constants';
import { bannerStatusLabel } from '@/lib/statusLabels';
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

export default function BannersListPage() {
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
    queryKey: ['banners', filters],
    queryFn: () => bannersApi.list(filters),
  });

  const banners = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-3">
      <PageToolbar
        actions={
          <Link href="/banners/new">
            <Button size="sm">
              <Plus size={16} />
              Create banner
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
          {BANNER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {bannerStatusLabel(s)}
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
      ) : banners.length === 0 ? (
        <EmptyState message="No banners yet. Create one to get started." />
      ) : (
        <DataTable>
          <table className="w-full min-w-[720px]">
            <DataTableHead>
              <Th>Preview</Th>
              <Th>Title</Th>
              <Th>Sequence</Th>
              <Th>Status</Th>
              <Th>URL</Th>
              <Th>Created</Th>
              <Th />
            </DataTableHead>
            <DataTableBody>
              {banners.map((banner) => (
                <Tr key={banner.id}>
                  <Td>
                    {banner.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={banner.imageUrl}
                        alt=""
                        className="h-12 w-20 rounded border border-neutral-200 object-cover"
                      />
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </Td>
                  <Td>
                    <p className="font-medium text-[var(--gray-900)]">{banner.title}</p>
                  </Td>
                  <Td className="tabular-nums">{banner.sequence}</Td>
                  <Td>
                    <StatusBadge variant="taskStatus" value={banner.status} />
                  </Td>
                  <Td className="max-w-[200px]">
                    <a
                      href={banner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="line-clamp-1 text-[12px] text-[var(--text-secondary)] hover:text-[var(--gray-900)] hover:underline"
                    >
                      {banner.url}
                    </a>
                  </Td>
                  <Td>
                    <DateCell value={banner.createdAt} />
                  </Td>
                  <Td className="text-right">
                    <Link
                      href={`/banners/${banner.id}`}
                      className="text-[12px] font-medium text-[var(--gray-700)] hover:text-[var(--gray-900)]"
                    >
                      View
                    </Link>
                  </Td>
                </Tr>
              ))}
            </DataTableBody>
          </table>
        </DataTable>
      )}

      {meta && meta.totalPages > 1 && (
        <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}

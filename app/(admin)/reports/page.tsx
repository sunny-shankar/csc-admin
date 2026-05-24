'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Download, RefreshCw } from 'lucide-react';
import { reportsApi } from '@/lib/api';
import { REPORT_CATEGORIES, REPORT_STATUSES } from '@/lib/constants';
import { DateCell } from '@/components/ui/DateCell';
import type { Report, ReportStatus } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { FilterInput, FilterSelect, Select, Textarea } from '@/components/ui/Input';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  Td,
  Th,
  Tr,
} from '@/components/ui/DataTable';

export default function ReportsListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [ward, setWard] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchStatus, setBatchStatus] = useState<ReportStatus>('IN_REVIEW');
  const [batchNote, setBatchNote] = useState('');

  const filters = { page, limit: 20, status, category, ward };

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['reports', filters],
    queryFn: () => reportsApi.list(filters),
  });

  const batchMutation = useMutation({
    mutationFn: () =>
      reportsApi.batchStatus({
        reportIds: [...selected],
        status: batchStatus,
        note: batchNote || undefined,
      }),
    onSuccess: () => {
      toast.success('Batch update completed');
      setSelected(new Set());
      setBatchOpen(false);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reports = data?.data ?? [];
  const meta = data?.meta;

  const toggleAll = () => {
    if (selected.size === reports.length) setSelected(new Set());
    else setSelected(new Set(reports.map((r) => r.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleExport = async () => {
    try {
      const csv = await reportsApi.exportCsv({
        status: status || undefined,
        category: category || undefined,
        ward: ward || undefined,
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reports-export-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    }
  };

  return (
    <div className="space-y-4">
      <PageToolbar
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download size={16} />
              Export
            </Button>
            {selected.size > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setBatchOpen(true)}>
                Batch ({selected.size})
              </Button>
            )}
          </>
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
          {REPORT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All categories</option>
          {REPORT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
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
        <LoadingSpinner label="Loading reports…" />
      ) : reports.length === 0 ? (
        <EmptyState message="No reports match your filters." />
      ) : (
        <DataTable>
          <table className="w-full min-w-[720px]">
            <DataTableHead>
              <Th className="w-10">
                <input
                  type="checkbox"
                  className="rounded border-[var(--gray-300)]"
                  checked={selected.size === reports.length && reports.length > 0}
                  onChange={toggleAll}
                />
              </Th>
              <Th>Code</Th>
              <Th>Status</Th>
              <Th>Category</Th>
              <Th>Submitter</Th>
              <Th>Ward</Th>
              <Th>Created</Th>
              <Th>Updated</Th>
              <Th className="text-right" />
            </DataTableHead>
            <DataTableBody>
              {reports.map((r: Report) => (
                <Tr key={r.id}>
                  <Td>
                    <input
                      type="checkbox"
                      className="rounded border-[var(--gray-300)]"
                      checked={selected.has(r.id)}
                      onChange={() => toggleOne(r.id)}
                    />
                  </Td>
                  <Td className="font-medium text-neutral-900">{r.reportCode}</Td>
                  <Td>
                    <StatusBadge label={r.status} variant="status" value={r.status} />
                  </Td>
                  <Td>{r.category}</Td>
                  <Td>
                    {r.submitter?.id ? (
                      <Link href={`/users/${r.submitter.id}`} className="hover:underline">
                        {r.submitter.name}
                      </Link>
                    ) : (
                      (r.submitter?.name ?? '—')
                    )}
                  </Td>
                  <Td>{r.submitter?.ward ?? '—'}</Td>
                  <Td>
                    <DateCell value={r.createdAt} />
                  </Td>
                  <Td>
                    <DateCell value={r.updatedAt} />
                  </Td>
                  <Td className="text-right">
                    <Link href={`/reports/${r.id}`} className="text-sm text-neutral-900 hover:underline">
                      View
                    </Link>
                  </Td>
                </Tr>
              ))}
            </DataTableBody>
          </table>
          {meta && (
            <div className="border-t border-neutral-100 px-4 py-3">
              <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
            </div>
          )}
        </DataTable>
      )}

      <Modal open={batchOpen} title="Batch status update" onClose={() => setBatchOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">Updating {selected.size} report(s)</p>
          <Select
            value={batchStatus}
            onChange={(e) => setBatchStatus(e.target.value as ReportStatus)}
          >
            {REPORT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Textarea
            placeholder="Note (optional)"
            value={batchNote}
            onChange={(e) => setBatchNote(e.target.value)}
            rows={3}
          />
          <Button
            className="w-full"
            disabled={batchMutation.isPending}
            onClick={() => batchMutation.mutate()}
          >
            {batchMutation.isPending ? 'Updating…' : 'Apply'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

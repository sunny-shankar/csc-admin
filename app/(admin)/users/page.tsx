'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Ban, ShieldCheck } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import type { AdminUser } from '@/lib/types';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FilterInput, FilterSelect, Textarea } from '@/components/ui/Input';
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  Td,
  Th,
  Tr,
} from '@/components/ui/DataTable';

function BanModal({
  user,
  open,
  onClose,
  onSuccess,
}: {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState('');

  const banMutation = useMutation({
    mutationFn: () => usersApi.ban(user!.id, reason),
    onSuccess: () => {
      toast.success('User banned');
      setReason('');
      onClose();
      onSuccess();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user) return null;

  return (
    <Modal open={open} title={`Ban ${user.name}`} onClose={onClose}>
      <p className="mb-3 text-sm text-neutral-600">
        Banned users cannot submit reports or volunteer for tasks.
      </p>
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for ban (required)"
        rows={3}
        className="mb-3"
      />
      <Button
        variant="danger"
        className="w-full"
        disabled={reason.length < 3 || banMutation.isPending}
        onClick={() => banMutation.mutate()}
      >
        {banMutation.isPending ? 'Banning…' : 'Confirm ban'}
      </Button>
    </Modal>
  );
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [ward, setWard] = useState('');
  const [banned, setBanned] = useState('');
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);

  const filters = {
    page,
    limit: 20,
    search: search || undefined,
    ward: ward || undefined,
    banned: banned || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => usersApi.list(filters),
  });

  const unbanMutation = useMutation({
    mutationFn: (id: string) => usersApi.unban(id),
    onSuccess: () => {
      toast.success('User unbanned');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const users = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <PageToolbar>
        <FilterInput
          placeholder="Search name or phone"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="min-w-[10rem] max-w-[14rem]"
        />
        <FilterInput
          placeholder="Ward"
          value={ward}
          onChange={(e) => {
            setWard(e.target.value);
            setPage(1);
          }}
          className="min-w-[7rem] max-w-[8rem]"
        />
        <FilterSelect
          value={banned}
          onChange={(e) => {
            setBanned(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All users</option>
          <option value="true">Banned only</option>
          <option value="false">Active only</option>
        </FilterSelect>
      </PageToolbar>

      {isLoading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState message="No users match your filters." />
      ) : (
        <DataTable>
          <table className="w-full min-w-[800px]">
            <DataTableHead>
              <Th>Name</Th>
              <Th>Phone</Th>
              <Th>Ward</Th>
              <Th>Points</Th>
              <Th>Reports</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th className="text-right" />
            </DataTableHead>
            <DataTableBody>
              {users.map((u) => (
                <Tr key={u.id}>
                  <Td className="font-medium text-neutral-900">{u.name}</Td>
                  <Td>{u.phone ?? '—'}</Td>
                  <Td>{u.ward ?? '—'}</Td>
                  <Td>{u.totalPoints.toLocaleString()}</Td>
                  <Td>{u.reportCount ?? '—'}</Td>
                  <Td className="capitalize">{u.role}</Td>
                  <Td>
                    {u.isBanned ? (
                      <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium bg-[#fef2f2] text-[#b91c1c]">
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium bg-[#dcfce7] text-[#166534]">
                        Active
                      </span>
                    )}
                  </Td>
                  <Td className="text-neutral-500">{formatDateTime(u.createdAt)}</Td>
                  <Td className="text-right">
                    {u.role !== 'admin' &&
                      (u.isBanned ? (
                        <button
                          type="button"
                          onClick={() => unbanMutation.mutate(u.id)}
                          disabled={unbanMutation.isPending}
                          className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-60"
                        >
                          <ShieldCheck size={14} />
                          Unban
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setBanTarget(u)}
                          className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                        >
                          <Ban size={14} />
                          Ban
                        </button>
                      ))}
                  </Td>
                </Tr>
              ))}
            </DataTableBody>
          </table>
          {meta && (
            <div className="border-t border-neutral-100 px-4">
              <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
            </div>
          )}
        </DataTable>
      )}

      <BanModal
        user={banTarget}
        open={!!banTarget}
        onClose={() => setBanTarget(null)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
      />
    </div>
  );
}

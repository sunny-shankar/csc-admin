'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Ban, ShieldCheck } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import type { AdminUser } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';

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
      <p className="mb-3 text-sm text-zinc-600">
        Banned users cannot submit reports or volunteer for tasks.
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for ban (required)"
        className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
        rows={3}
      />
      <button
        type="button"
        disabled={reason.length < 3 || banMutation.isPending}
        onClick={() => banMutation.mutate()}
        className="w-full rounded-lg bg-red-600 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {banMutation.isPending ? 'Banning…' : 'Confirm ban'}
      </button>
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
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage citizens, points, and account status"
      />

      <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-sm">
        <input
          placeholder="Search by name or phone"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="min-w-[200px] flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <input
          placeholder="Ward filter"
          value={ward}
          onChange={(e) => {
            setWard(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <select
          value={banned}
          onChange={(e) => {
            setBanned(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">All users</option>
          <option value="true">Banned only</option>
          <option value="false">Active only</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState message="No users match your filters." />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Ward</th>
                <th className="p-3">Points</th>
                <th className="p-3">Reports</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Joined</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-zinc-50/50">
                  <td className="p-3 font-medium text-[#1A3C5E]">{u.name}</td>
                  <td className="p-3 text-zinc-600">{u.phone ?? '—'}</td>
                  <td className="p-3">{u.ward ?? '—'}</td>
                  <td className="p-3">{u.totalPoints.toLocaleString()}</td>
                  <td className="p-3">{u.reportCount ?? '—'}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">
                    {u.isBanned ? (
                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-zinc-500">{formatDateTime(u.createdAt)}</td>
                  <td className="p-3 text-right">
                    {u.role !== 'admin' && (
                      u.isBanned ? (
                        <button
                          type="button"
                          onClick={() => unbanMutation.mutate(u.id)}
                          disabled={unbanMutation.isPending}
                          className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline disabled:opacity-60"
                        >
                          <ShieldCheck size={14} />
                          Unban
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setBanTarget(u)}
                          className="inline-flex items-center gap-1 text-sm text-red-700 hover:underline"
                        >
                          <Ban size={14} />
                          Ban
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta && (
            <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
          )}
        </div>
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

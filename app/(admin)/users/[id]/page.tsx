'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Ban, ShieldCheck } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DetailGrid } from '@/components/ui/DetailGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Textarea } from '@/components/ui/Input';

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [banOpen, setBanOpen] = useState(false);
  const [banReason, setBanReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.get(id),
  });

  const unbanMutation = useMutation({
    mutationFn: () => usersApi.unban(id),
    onSuccess: () => {
      toast.success('User unbanned');
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const banMutation = useMutation({
    mutationFn: () => usersApi.ban(id, banReason),
    onSuccess: () => {
      toast.success('User banned');
      setBanOpen(false);
      setBanReason('');
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <LoadingSpinner />;
  const user = data?.data;
  if (!user) {
    return (
      <p className="text-[13px] text-[var(--text-secondary)]">
        User not found.{' '}
        <Link href="/users" className="text-[var(--gray-900)] hover:underline">
          Back to list
        </Link>
      </p>
    );
  }

  const statusLabel = user.isBanned ? 'Banned' : 'Active';

  return (
    <div className="space-y-4">
      <BackLink href="/users">Back to users</BackLink>

      <PageHeader
        title={user.name}
        description={user.phone ?? 'No phone on file'}
        action={
          <div className="flex items-center gap-2">
            <span
              className={
                user.isBanned
                  ? 'inline-flex rounded-full bg-[#fef2f2] px-2 py-0.5 text-[11px] font-medium text-[#b91c1c]'
                  : 'inline-flex rounded-full bg-[#dcfce7] px-2 py-0.5 text-[11px] font-medium text-[#166534]'
              }
            >
              {statusLabel}
            </span>
            {user.role !== 'admin' &&
              (user.isBanned ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={unbanMutation.isPending}
                  onClick={() => unbanMutation.mutate()}
                >
                  <ShieldCheck size={14} />
                  Unban
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setBanOpen(true)}>
                  <Ban size={14} />
                  Ban
                </Button>
              ))}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            {user.profilePhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profilePhotoUrl}
                alt={user.name}
                className="h-20 w-20 rounded-full border border-[var(--border)] object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--gray-200)] text-lg font-semibold text-[var(--gray-700)]">
                {initials(user.name)}
              </div>
            )}
            <p className="mt-3 text-[15px] font-semibold text-[var(--gray-900)]">{user.name}</p>
            <p className="text-[12px] capitalize text-[var(--text-secondary)]">{user.role}</p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <p className="section-head">Profile</p>
          <div className="mt-4">
            <DetailGrid
              rows={[
                { label: 'Phone', value: user.phone },
                { label: 'Ward', value: user.ward },
                { label: 'Sector', value: user.sectorNo },
                {
                  label: 'Profile complete',
                  value: user.profileComplete ? 'Yes' : 'No',
                },
                { label: 'Total points', value: user.totalPoints.toLocaleString() },
                { label: 'Streak', value: user.streakCount ?? 0 },
                { label: 'Reports submitted', value: user.reportCount ?? 0 },
              ]}
            />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <p className="section-head">Activity</p>
          <div className="mt-4">
            <DetailGrid
              rows={[
                { label: 'Joined', value: formatDateTime(user.createdAt) },
                { label: 'Last updated', value: formatDateTime(user.updatedAt) },
                { label: 'Last active', value: formatDateTime(user.lastActiveAt) },
              ]}
            />
          </div>
        </Card>

        {(user.badgeIds?.length ?? 0) > 0 && (
          <Card className="lg:col-span-1">
            <p className="section-head">Badges</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {user.badgeIds!.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-[var(--gray-100)] px-2 py-0.5 text-[11px] font-medium text-[var(--gray-700)]"
                >
                  {badge}
                </span>
              ))}
            </div>
          </Card>
        )}

        {user.isBanned && user.banReason && (
          <Card className="lg:col-span-3 border-[#fecaca] bg-[#fef2f2]">
            <p className="section-head text-[#b91c1c]">Ban reason</p>
            <p className="mt-2 text-[13px] text-[#7f1d1d]">{user.banReason}</p>
          </Card>
        )}
      </div>

      <Modal open={banOpen} title={`Ban ${user.name}`} onClose={() => setBanOpen(false)}>
        <Textarea
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          placeholder="Reason for ban (required)"
          rows={3}
          className="mb-3"
        />
        <Button
          variant="danger"
          className="w-full"
          disabled={banReason.length < 3 || banMutation.isPending}
          onClick={() => banMutation.mutate()}
        >
          {banMutation.isPending ? 'Banning…' : 'Confirm ban'}
        </Button>
      </Modal>
    </div>
  );
}

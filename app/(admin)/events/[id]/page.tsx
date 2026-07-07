'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Archive } from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { DetailGrid } from '@/components/ui/DetailGrid';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  Td,
  Th,
  Tr,
} from '@/components/ui/DataTable';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const eventQuery = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.get(id),
  });

  const interestsQuery = useQuery({
    queryKey: ['event-interests', id],
    queryFn: () => eventsApi.interests(id),
  });

  const archiveMutation = useMutation({
    mutationFn: () => eventsApi.archive(id),
    onSuccess: () => {
      toast.success('Event archived');
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (eventQuery.isLoading) return <LoadingSpinner />;

  const event = eventQuery.data?.data;
  if (!event) {
    return (
      <div className="space-y-4">
        <BackLink href="/events">Back to events</BackLink>
        <p className="text-sm text-neutral-500">Event not found.</p>
      </div>
    );
  }

  const interests = interestsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <BackLink href="/events">Back to events</BackLink>

      <PageHeader
        title={event.title}
        description={event.description || undefined}
        action={
          event.status === 'ACTIVE' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
            >
              <Archive size={16} />
              Archive
            </Button>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <p className="section-head">Details</p>
            <DetailGrid
              rows={[
                { label: 'Status', value: <StatusBadge variant="taskStatus" value={event.status} /> },
                {
                  label: 'Location',
                  value:
                    event.latitude != null && event.longitude != null
                      ? `${event.latitude}, ${event.longitude}`
                      : '—',
                },
                { label: 'Interested users', value: String(event.interestCount) },
                { label: 'Created', value: formatDateTime(event.createdAt) },
              ]}
            />
          </Card>

          {event.images.length > 0 && (
            <Card>
              <p className="section-head">Images</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {event.images.map((img) => (
                  <div key={img.id}>
                    {img.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img.imageUrl}
                        alt=""
                        className="h-28 w-full rounded-md border border-neutral-200 object-cover"
                      />
                    ) : (
                      <p className="text-sm text-neutral-400">Unavailable</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <p className="section-head">Interested users</p>
            <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
              Users who expressed interest in this event
            </p>

            {interestsQuery.isLoading ? (
              <div className="mt-6">
                <LoadingSpinner />
              </div>
            ) : interests.length === 0 ? (
              <EmptyState message="No users have expressed interest yet." />
            ) : (
              <DataTable className="mt-4">
                <DataTableHead>
                  <Th>Name</Th>
                  <Th>Phone</Th>
                  <Th>Ward</Th>
                  <Th>Sector</Th>
                  <Th>Expressed at</Th>
                </DataTableHead>
                <DataTableBody>
                  {interests.map((interest) => (
                    <Tr key={interest.id}>
                      <Td>
                        {interest.user?.id ? (
                          <Link
                            href={`/users/${interest.user.id}`}
                            className="font-medium text-[var(--gray-900)] hover:underline"
                          >
                            {interest.user.name}
                          </Link>
                        ) : (
                          (interest.user?.name ?? '—')
                        )}
                      </Td>
                      <Td>{interest.user?.phone ?? '—'}</Td>
                      <Td>{interest.user?.ward ?? '—'}</Td>
                      <Td>{interest.user?.sectorNo ?? '—'}</Td>
                      <Td>{formatDateTime(interest.expressedAt)}</Td>
                    </Tr>
                  ))}
                </DataTableBody>
              </DataTable>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

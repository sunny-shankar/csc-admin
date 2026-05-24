'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Medal } from 'lucide-react';
import { leaderboardApi } from '@/lib/api';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterInput, FilterSelect } from '@/components/ui/Input';
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  Td,
  Th,
  Tr,
} from '@/components/ui/DataTable';

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Medal className="text-neutral-900" size={18} strokeWidth={1.5} />;
  if (rank === 2) return <Medal className="text-neutral-400" size={18} strokeWidth={1.5} />;
  if (rank === 3) return <Medal className="text-neutral-500" size={18} strokeWidth={1.5} />;
  return <span className="w-[18px] text-center text-sm tabular-nums text-neutral-500">{rank}</span>;
}

export default function LeaderboardPage() {
  const [ward, setWard] = useState('');
  const [limit, setLimit] = useState(50);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['leaderboard', ward, limit],
    queryFn: () =>
      ward.trim()
        ? leaderboardApi.byWard(ward.trim(), limit)
        : leaderboardApi.monthly(limit),
  });

  const entries = data?.data?.entries ?? [];

  return (
    <div className="space-y-4">
      <PageToolbar>
        <FilterInput
          placeholder="Ward"
          value={ward}
          onChange={(e) => setWard(e.target.value)}
          className="min-w-[8rem] max-w-[10rem]"
        />
        <FilterSelect value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          <option value={25}>Top 25</option>
          <option value={50}>Top 50</option>
          <option value={100}>Top 100</option>
        </FilterSelect>
      </PageToolbar>

      {isLoading || isFetching ? (
        <LoadingSpinner label="Loading leaderboard…" />
      ) : entries.length === 0 ? (
        <EmptyState message="No leaderboard entries for this period." />
      ) : (
        <DataTable>
          <table className="w-full">
            <DataTableHead>
              <Th className="w-14">#</Th>
              <Th>Name</Th>
              <Th>Ward</Th>
              <Th className="text-right">Points</Th>
              <Th>Badges</Th>
            </DataTableHead>
            <DataTableBody>
              {entries.map((entry) => (
                <Tr key={entry.userId}>
                  <Td>
                    <div className="flex justify-center">
                      <RankBadge rank={entry.rank} />
                    </div>
                  </Td>
                  <Td className="font-medium text-neutral-900">{entry.name}</Td>
                  <Td>{entry.ward ?? '—'}</Td>
                  <Td className="text-right font-medium tabular-nums">{entry.points.toLocaleString()}</Td>
                  <Td>
                    {entry.badgeIds.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {entry.badgeIds.map((badge) => (
                          <span
                            key={badge}
                            className="rounded px-1.5 py-0.5 text-[11px] font-medium bg-neutral-100 text-neutral-600"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </Td>
                </Tr>
              ))}
            </DataTableBody>
          </table>
        </DataTable>
      )}
    </div>
  );
}

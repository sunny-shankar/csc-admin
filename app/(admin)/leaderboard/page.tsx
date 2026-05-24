'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Medal } from 'lucide-react';
import { leaderboardApi } from '@/lib/api';
import { PageToolbar } from '@/components/ui/PageToolbar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { FilterInput, FilterSelect } from '@/components/ui/Input';

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Medal className="text-amber-500" size={18} />;
  if (rank === 2) return <Medal className="text-zinc-400" size={18} />;
  if (rank === 3) return <Medal className="text-amber-700" size={18} />;
  return <span className="w-[18px] text-center text-sm text-zinc-500">{rank}</span>;
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

  const leaderboard = data?.data;
  const entries = leaderboard?.entries ?? [];

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
        <Card padding="none" className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="p-3 w-16">Rank</th>
                <th className="p-3">Name</th>
                <th className="p-3">Ward</th>
                <th className="p-3 text-right">Points</th>
                <th className="p-3">Badges</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.userId} className="border-b last:border-0 hover:bg-zinc-50/50">
                  <td className="p-3">
                    <div className="flex items-center justify-center">
                      <RankBadge rank={entry.rank} />
                    </div>
                  </td>
                  <td className="p-3 font-medium text-[#1A3C5E]">{entry.name}</td>
                  <td className="p-3">{entry.ward ?? '—'}</td>
                  <td className="p-3 text-right font-semibold">{entry.points.toLocaleString()}</td>
                  <td className="p-3">
                    {entry.badgeIds.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {entry.badgeIds.map((badge) => (
                          <span
                            key={badge}
                            className="rounded-full bg-[#2E86AB]/10 px-2 py-0.5 text-xs text-[#1A3C5E]"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

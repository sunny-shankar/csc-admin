'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Medal } from 'lucide-react';
import { leaderboardApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';

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
    <div className="space-y-6">
      <PageHeader
        title="Leaderboard"
        description={
          leaderboard?.month
            ? `Monthly rankings for ${leaderboard.month}${leaderboard.ward ? ` · ${leaderboard.ward}` : ''}`
            : 'Monthly civic engagement rankings'
        }
      />

      <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-sm">
        <input
          placeholder="Filter by ward (optional)"
          value={ward}
          onChange={(e) => setWard(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value={25}>Top 25</option>
          <option value={50}>Top 50</option>
          <option value={100}>Top 100</option>
        </select>
      </div>

      {isLoading || isFetching ? (
        <LoadingSpinner />
      ) : entries.length === 0 ? (
        <EmptyState message="No leaderboard entries for this period." />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
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
        </div>
      )}
    </div>
  );
}

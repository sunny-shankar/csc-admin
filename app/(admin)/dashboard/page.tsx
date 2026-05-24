'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FileText, Clock, CheckCircle2, Users, ClipboardList } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPercent } from '@/lib/format';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';

const COLORS = ['#171717', '#404040', '#737373', '#a3a3a3', '#d4d4d4'];

const tooltipStyle = {
  borderRadius: '6px',
  border: '1px solid #e5e5e5',
  fontSize: '12px',
  boxShadow: 'none',
};

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => analyticsApi.dashboard(),
  });

  if (isLoading) return <LoadingSpinner label="Loading…" />;

  if (isError) {
    return <p className="text-sm text-red-600">{error instanceof Error ? error.message : 'Error'}</p>;
  }

  const stats = data?.data;
  if (!stats) return null;

  const categoryData = Object.entries(stats.reports.byCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const statusData = Object.entries(stats.reports.byStatus).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-4">
      {stats.reports.pending > 0 && (
        <p className="rounded-[8px] border border-[#fff7ed] bg-[#fff7ed] px-3 py-2 text-[12px] text-[#c2410c]">
          {stats.reports.pending} report{stats.reports.pending === 1 ? '' : 's'} pending review
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Reports" value={stats.reports.total} icon={FileText} />
        <StatCard label="Pending" value={stats.reports.pending} icon={Clock} />
        <StatCard label="Resolved" value={formatPercent(stats.reports.resolvedRate)} icon={CheckCircle2} />
        <StatCard label="Users" value={stats.users.total} icon={Users} />
        <StatCard label="Active tasks" value={stats.tasks.active} icon={ClipboardList} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card padding="md">
          <p className="section-head">By category</p>
          <div className="mt-4 h-56">
            {categoryData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-neutral-400">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ bottom: 8 }}>
                  <CartesianGrid stroke="#f5f5f5" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#171717" radius={[2, 2, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card padding="md">
          <p className="section-head">By status</p>
          <div className="mt-4 h-56">
            {statusData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-neutral-400">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    strokeWidth={1}
                    stroke="#fff"
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

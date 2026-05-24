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
import {
  FileText,
  Clock,
  CheckCircle2,
  Users,
  ClipboardList,
} from 'lucide-react';
import { reportsApi, usersApi, tasksApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPercent } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';

const COLORS = ['#1A3C5E', '#2E86AB', '#27AE60', '#F39C12', '#E74C3C', '#6B7280'];

export default function DashboardPage() {
  const reportsQuery = useQuery({
    queryKey: ['dashboard-reports'],
    queryFn: () => reportsApi.list({ limit: 500, page: 1 }),
  });

  const usersQuery = useQuery({
    queryKey: ['dashboard-users'],
    queryFn: () => usersApi.list({ limit: 1, page: 1 }),
  });

  const tasksQuery = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: () => tasksApi.list({ limit: 1, page: 1, status: 'ACTIVE' }),
  });

  const pendingReportsQuery = useQuery({
    queryKey: ['dashboard-pending-reports'],
    queryFn: () => reportsApi.list({ limit: 1, page: 1, status: 'PENDING' }),
  });

  const isLoading =
    reportsQuery.isLoading ||
    usersQuery.isLoading ||
    tasksQuery.isLoading ||
    pendingReportsQuery.isLoading;

  if (isLoading) return <LoadingSpinner label="Loading dashboard…" />;

  const reports = reportsQuery.data?.data ?? [];
  const totalReports = reportsQuery.data?.meta?.total ?? reports.length;
  const totalUsers = usersQuery.data?.meta?.total ?? 0;
  const activeTasks = tasksQuery.data?.meta?.total ?? 0;
  const pendingReports = pendingReportsQuery.data?.meta?.total ?? 0;

  const resolved = reports.filter((r) => r.status === 'RESOLVED').length;
  const resolvedRate = reports.length ? (resolved / reports.length) * 100 : 0;

  const categoryMap: Record<string, number> = {};
  reports.forEach((r) => {
    categoryMap[r.category] = (categoryMap[r.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const statusMap: Record<string, number> = {};
  reports.forEach((r) => {
    statusMap[r.status] = (statusMap[r.status] || 0) + 1;
  });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of civic reports, volunteers, and community engagement."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total reports" value={totalReports.toLocaleString()} icon={FileText} tone="blue" />
        <StatCard label="Pending review" value={pendingReports.toLocaleString()} icon={Clock} tone="amber" />
        <StatCard label="Resolved rate" value={formatPercent(resolvedRate)} icon={CheckCircle2} tone="green" />
        <StatCard label="Registered users" value={totalUsers.toLocaleString()} icon={Users} />
        <StatCard label="Active tasks" value={activeTasks.toLocaleString()} icon={ClipboardList} tone="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="md">
          <h2 className="mb-1 font-semibold text-[#1A3C5E]">Reports by category</h2>
          <p className="mb-4 text-xs text-slate-500">Distribution across issue types</p>
          <div className="h-72">
            {categoryData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-400">
                No report data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.75rem',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 16px rgba(26,60,94,0.08)',
                    }}
                  />
                  <Bar dataKey="value" fill="#2E86AB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card padding="md">
          <h2 className="mb-1 font-semibold text-[#1A3C5E]">Reports by status</h2>
          <p className="mb-4 text-xs text-slate-500">Current workflow breakdown</p>
          <div className="h-72">
            {statusData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-400">
                No report data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={88}
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.75rem',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

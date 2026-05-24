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
import { reportsApi, usersApi, tasksApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPercent } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';

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

  if (isLoading) return <LoadingSpinner />;

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

  const cards = [
    { label: 'Total reports', value: totalReports.toLocaleString() },
    { label: 'Pending review', value: pendingReports.toLocaleString() },
    { label: 'Resolved rate (sample)', value: formatPercent(resolvedRate) },
    { label: 'Registered users', value: totalUsers.toLocaleString() },
    { label: 'Active tasks', value: activeTasks.toLocaleString() },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of civic engagement metrics"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-[#1A3C5E]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-[#1A3C5E]">Reports by category</h2>
          <div className="h-64">
            {categoryData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-zinc-400">
                No report data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2E86AB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-[#1A3C5E]">Reports by status</h2>
          <div className="h-64">
            {statusData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-zinc-400">
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
                    outerRadius={80}
                    label
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

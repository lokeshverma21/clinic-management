// modules/admin/dashboard/components/admin-dashboard-view.tsx
'use client';

import * as React from 'react';
import type { AdminDashboardData } from '../dashboard.types';
import { DashboardSkeleton } from './dashboard-skeleton';
import { DashboardError } from './dashboard-error';
import { KpiCards } from './kpi-cards';
import { SignupsChart } from './signups-chart';
import { StatusChart } from './status-chart';
import { TrialsEndingList } from './trials-ending-list';
import { AtRiskList } from './at-risk-list';
import { RecentActivityList } from './recent-activity-list';

export function AdminDashboardView() {
  const [data, setData] = React.useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const loadDashboard = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');

      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? 'Failed to load dashboard data');
      }

      setData(json.data);
    } catch (err: unknown) {
      console.error('Error loading admin dashboard:', err);
      setHasError(true);
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred while loading dashboard metrics',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void loadDashboard();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDashboard]);

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  if (hasError || !data) {
    return <DashboardError message={errorMessage} onRetry={loadDashboard} />;
  }

  return (
    <div className="space-y-6">
      {/* 6 Metric KPI Cards */}
      <KpiCards kpis={data.kpis} />

      {/* 2 Interactive Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SignupsChart data={data.signupsByMonth} />
        <StatusChart data={data.clinicsByStatus} />
      </div>

      {/* 3 Short Information Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TrialsEndingList trials={data.trialsEndingSoon} />
        <AtRiskList clinics={data.atRiskClinics} />
        <RecentActivityList logs={data.recentActivity} />
      </div>
    </div>
  );
}

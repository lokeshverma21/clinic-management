// /app/(dashboard)/dashboard/_components/dashboard-shell.tsx

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { DashboardHeader } from './dashboard-header';
import { DashboardStats } from './dashboard-stats';
import { DashboardQuickActions } from './dashboard-quick-actions';
import { TodaySchedule } from './today-schedule';
import { UpcomingAppointments } from './upcoming-appointments';
import { RecentPatients } from './recent-patients';
import { DoctorsWorking } from './doctors-working';
import { ClinicInfo } from './clinic-info';
import type { DashboardResponse } from '@/modules/dashboard';

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchDashboardData(): Promise<DashboardResponse> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host') ?? 'localhost:3000';
  const proto = headerStore.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${proto}://${host}`;

  const response = await fetch(`${baseUrl}/api/dashboard`, {
    method: 'GET',
    headers: {
      cookie: cookieStore.toString(),
      accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      (body as { error?: { message?: string } } | null)?.error?.message ??
      `Dashboard fetch failed with status ${response.status}`;
    throw new Error(message);
  }

  const body = (await response.json()) as { data: DashboardResponse };
  return body.data;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export async function DashboardShell() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const data = await fetchDashboardData();

  return (
    <div className="space-y-6">
      {/* Top Banner: Clinic Header & Quick Action Shortcuts */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/50">
        <DashboardHeader clinicName={data.clinic.name} />
        <DashboardQuickActions />
      </div>

      {/* KPI Stat Cards */}
      <DashboardStats stats={data.stats} />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left Column — Operational Timeline & Patient Flow */}
        <div className="flex flex-col gap-6">
          <TodaySchedule appointments={data.todayAppointments} />
          <UpcomingAppointments appointments={data.upcomingAppointments} />
          <RecentPatients patients={data.recentPatients} />
        </div>

        {/* Right Column — Team & Clinic Overview */}
        <div className="flex flex-col gap-6">
          <DoctorsWorking doctors={data.doctorsWorkingToday} />
          <ClinicInfo clinic={data.clinic} />
        </div>
      </div>
    </div>
  );
}
// /app/(dashboard)/dashboard/_components/dashboard-shell.tsx

/**
 * ARCHITECTURE NOTE
 *
 * This is a Next.js App Router server component. It fetches dashboard
 * data by calling GET /api/dashboard with the session cookie forwarded.
 *
 * Why fetch instead of calling the service directly?
 * ─────────────────────────────────────────────────
 * getRequestContext() requires a NextRequest object to read the Clerk
 * session token from the Authorization header / cookie. Server components
 * do not receive a NextRequest — they render outside the request/response
 * cycle. Rather than duplicating the context-building logic (which would
 * mean two code paths for the same auth concern), we call the API route
 * with `credentials: 'include'` forwarding, which lets getRequestContext()
 * work exactly as it does for every other consumer.
 *
 * next/headers `cookies()` is used to forward the active session cookie
 * so Clerk's middleware can authenticate the internal fetch identically
 * to a browser-originated request.
 */

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

/**
 * Calls GET /api/dashboard server-side with the active session cookie
 * forwarded so Clerk can authenticate the request.
 *
 * We construct the base URL from the incoming request headers rather than
 * a hardcoded env var so this works identically in local dev, preview
 * deployments, and production without any environment-specific branching.
 *
 * Throws if the response is not 2xx — the error propagates to the
 * nearest error.tsx boundary.
 */
async function fetchDashboardData(): Promise<DashboardResponse> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // Reconstruct the base origin from the forwarded host header so the
  // internal fetch resolves correctly in every deployment environment.
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host') ?? 'localhost:3000';
  const proto = headerStore.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${proto}://${host}`;

  const response = await fetch(`${baseUrl}/api/dashboard`, {
    method: 'GET',
    headers: {
      // Forward all cookies so Clerk's session token reaches the route
      // handler and getRequestContext() can authenticate the request.
      cookie: cookieStore.toString(),
      // Content-Type is not needed for GET but signals intent clearly
      // for anyone reading request logs.
      accept: 'application/json',
    },
    // Do not cache the dashboard — it reflects real-time clinic state.
    // next: { revalidate: 0 } would also work; cache: 'no-store' is
    // more explicit about intent.
    cache: 'no-store',
  });

  if (!response.ok) {
    // Surface the API error message if the route returned a structured
    // error body, otherwise throw a generic message. Both cases will
    // be caught by the nearest error boundary.
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
  // Guard: if the user is not authenticated at all, redirect to sign-in.
  // In practice Clerk middleware handles this before the page renders,
  // but an explicit guard here makes the component self-contained and
  // avoids a confusing fetch error if middleware is misconfigured.
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const data = await fetchDashboardData();

  return (
    <div className="flex flex-col gap-6 p-2">
        <div className='flex justify-between items-center'>
            <DashboardHeader clinicName={data.clinic.name} />

            <DashboardQuickActions />
        </div>

      <DashboardStats stats={data.stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(0,_320px)]">
        {/* Left column — operational timeline */}
        <div className="flex flex-col gap-6">
          <TodaySchedule appointments={data.todayAppointments} />
          <UpcomingAppointments appointments={data.upcomingAppointments} />
          <RecentPatients patients={data.recentPatients} />
        </div>

        {/* Right column — clinic context */}
        <div className="flex flex-col gap-6">
          <DoctorsWorking doctors={data.doctorsWorkingToday} />
          <ClinicInfo clinic={data.clinic} />
        </div>
      </div>
    </div>
  );
}
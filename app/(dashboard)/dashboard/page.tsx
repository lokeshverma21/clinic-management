// /app/(dashboard)/dashboard/page.tsx

/**
 * Dashboard page — Next.js App Router server component.
 *
 * Responsibilities of this file:
 *   1. Export the default page component (required by the App Router).
 *   2. Define page-level metadata.
 *   3. Wrap DashboardShell in Suspense so Next.js streams the skeleton
 *      to the browser immediately while the shell awaits its data fetch.
 *
 * This file intentionally contains no data-fetching logic and no
 * business logic. DashboardShell owns the fetch. DashboardSkeleton owns
 * the loading state. This file owns neither.
 */

import { type Metadata } from 'next';
import { Suspense } from 'react';
import { DashboardShell } from '@/modules/dashboard/components/dashboard-shell';
import { DashboardSkeleton } from '@/modules/dashboard/components/dashboard-skeleton';

// ---------------------------------------------------------------------------
// Page metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Clinic overview — appointments, patients, and staff for today.',
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    /**
     * Suspense boundary wraps DashboardShell because the shell is an
     * async server component that awaits fetchDashboardData(). Next.js
     * will stream the DashboardSkeleton HTML to the browser on the first
     * flush, then replace it with the shell's rendered output once the
     * data fetch resolves — all without a client-side loading state or
     * useEffect.
     *
     * If DashboardShell throws, the nearest error.tsx boundary catches it.
     * The skeleton is never shown in the error path.
     */
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardShell />
    </Suspense>
  );
}
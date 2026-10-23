// app/(admin)/admin/notifications/page.tsx
import * as React from 'react';
import { getPlatformContext } from '@/modules/admin/access';
import { NotificationsView } from '@/modules/admin/notifications/components/notifications-view';

export const metadata = {
  title: 'Notifications Monitor | ClinicSeva Admin',
  description: 'Cross-tenant delivery and failure monitoring for appointment notifications.',
};

interface AdminNotificationsPageProps {
  searchParams: Promise<{ clinicId?: string }>;
}

export default async function AdminNotificationsPage({
  searchParams,
}: AdminNotificationsPageProps) {
  // Enforces platform admin authentication and role verification
  await getPlatformContext();
  const resolvedParams = await searchParams;

  return <NotificationsView initialClinicId={resolvedParams.clinicId} />;
}

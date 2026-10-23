// app/(admin)/admin/team/page.tsx
import * as React from 'react';
import { getPlatformContext } from '@/modules/admin/access';
import { PlatformUsersView } from '@/modules/admin/platform-users/components/platform-users-view';

export const metadata = {
  title: 'Admin Team | ClinicSeva',
  description: 'Manage platform administrators and operational support staff.',
};

export default async function AdminTeamPage() {
  const context = await getPlatformContext();
  const canWrite = context.role === 'super_admin';

  return <PlatformUsersView canWrite={canWrite} />;
}

import * as React from 'react';
import { getPlatformContext } from '@/modules/admin/access';
import { AdminDashboardView } from '@/modules/admin/dashboard/components/admin-dashboard-view';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Admin Dashboard | ClinicSeva',
  description: 'Platform operations overview, SaaS subscription metrics, and tenant health.',
};

export default async function AdminDashboardPage() {
  const context = await getPlatformContext();
  const roleDisplay = context.role === 'super_admin' ? 'Super Admin' : 'Support';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Platform Dashboard
            </h1>
            <Badge variant="outline" className="text-xs font-mono capitalize">
              {roleDisplay}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Welcome back, <span className="text-foreground font-medium">{context.fullName}</span>. High-level platform health, SaaS metrics, and tenant overview.
          </p>
        </div>
      </div>

      <AdminDashboardView />
    </div>
  );
}

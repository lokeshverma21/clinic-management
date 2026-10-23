// modules/admin/dashboard/components/recent-activity-list.tsx
import * as React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ScrollText, ArrowUpRight, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { AdminAuditLogWithActor } from '@/modules/admin/audit-logs';

interface RecentActivityListProps {
  logs: AdminAuditLogWithActor[];
}

function formatActionName(action: string): string {
  return action
    .split('.')
    .map((part) => part.replace(/_/g, ' '))
    .join(': ');
}

export function RecentActivityList({ logs }: RecentActivityListProps) {
  return (
    <Card className="shadow-none border-border/60 flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ScrollText className="size-4 text-primary" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Latest operational events recorded in platform audit logs.
          </CardDescription>
        </div>
        <Link
          href="/admin/audit-logs"
          className="text-xs text-primary hover:underline flex items-center gap-0.5 shrink-0"
        >
          <span>View all</span>
          <ArrowUpRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pt-0">
        {logs.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border/60 p-4 text-center text-muted-foreground my-auto">
            <Activity className="size-7 stroke-[1.5] text-muted-foreground/60 mb-1.5" />
            <p className="text-xs font-medium text-foreground">No Audit Records Yet</p>
            <p className="text-[11px] text-muted-foreground max-w-[200px] mt-0.5">
              Administrative modifications and automated actions will be tracked here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {logs.map((log) => {
              const actorDisplay = log.actor?.fullName ?? (log.actorPlatformUserId ? 'Admin' : 'System');
              const clinicDisplay = log.clinic?.name;

              return (
                <div
                  key={log.id}
                  className="py-2.5 first:pt-1 last:pb-1 flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground capitalize truncate">
                      {formatActionName(log.action)}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      by <span className="text-foreground/90 font-medium">{actorDisplay}</span>
                      {clinicDisplay && (
                        <span>
                          {' '}• for <span className="text-foreground/90">{clinicDisplay}</span>
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0 whitespace-nowrap mt-0.5">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

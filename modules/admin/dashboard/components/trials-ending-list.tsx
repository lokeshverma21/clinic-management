// modules/admin/dashboard/components/trials-ending-list.tsx
import * as React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { CalendarClock, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AdminDashboardTrialEndingSoon } from '../dashboard.types';

interface TrialsEndingListProps {
  trials: AdminDashboardTrialEndingSoon[];
}

function getDaysRemaining(targetDate: Date | string): number {
  const diffMs = new Date(targetDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function TrialsEndingList({ trials }: TrialsEndingListProps) {
  return (
    <Card className="shadow-none border-border/60 flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CalendarClock className="size-4 text-primary" />
            <span>Trials Ending Soon</span>
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Clinics reaching trial conclusion in the next 7 days.
          </CardDescription>
        </div>
        <Link
          href="/admin/clinics"
          className="text-xs text-primary hover:underline flex items-center gap-0.5 shrink-0"
        >
          <span>View all</span>
          <ArrowUpRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pt-0">
        {trials.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border/60 p-4 text-center text-muted-foreground my-auto">
            <CheckCircle2 className="size-7 stroke-[1.5] text-emerald-600 dark:text-emerald-400 mb-1.5" />
            <p className="text-xs font-medium text-foreground">No Trials Expiring Soon</p>
            <p className="text-[11px] text-muted-foreground max-w-[200px] mt-0.5">
              No clinic trials are scheduled to end within the upcoming 7 days.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {trials.map((t) => {
              const daysLeft = getDaysRemaining(t.trialEndsAt);
              const isUrgent = daysLeft <= 2;

              return (
                <div
                  key={t.clinicId}
                  className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/clinics/${t.clinicId}`}
                      className="text-xs font-medium text-foreground hover:text-primary truncate block hover:underline"
                    >
                      {t.clinicName}
                    </Link>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Ends: {format(new Date(t.trialEndsAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Badge
                    variant={isUrgent ? 'destructive' : 'secondary'}
                    className="text-[10px] font-mono shrink-0 h-5 px-1.5"
                  >
                    {daysLeft === 0
                      ? 'Today'
                      : daysLeft === 1
                        ? '1 day left'
                        : `${daysLeft}d left`}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// modules/admin/dashboard/components/at-risk-list.tsx
import * as React from 'react';
import Link from 'next/link';
import { formatIstDate } from '@/lib/time';
import { AlertTriangle, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AdminDashboardAtRiskClinic } from '../dashboard.types';

interface AtRiskListProps {
  clinics: AdminDashboardAtRiskClinic[];
}

export function AtRiskList({ clinics }: AtRiskListProps) {
  return (
    <Card className="shadow-none border-border/60 flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
            <span>At-Risk Clinics</span>
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Tenants in past-due grace or administrative suspension.
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
        {clinics.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border/60 p-4 text-center text-muted-foreground my-auto">
            <ShieldCheck className="size-7 stroke-[1.5] text-emerald-600 dark:text-emerald-400 mb-1.5" />
            <p className="text-xs font-medium text-foreground">Zero At-Risk Clinics</p>
            <p className="text-[11px] text-muted-foreground max-w-[200px] mt-0.5">
              All active tenants are in good standing with zero overdue billing or suspensions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {clinics.map((c) => {
              const isPastDue = c.status === 'past_due';
              const subtitle = isPastDue
                ? c.graceEndsAt
                  ? `Billing grace ends ${formatIstDate(c.graceEndsAt, 'MMM d, yyyy')}`
                  : 'Payment past due'
                : c.suspensionSource === 'billing'
                  ? 'Suspended by billing'
                  : 'Suspended by admin';

              return (
                <div
                  key={c.clinicId}
                  className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/clinics/${c.clinicId}`}
                      className="text-xs font-medium text-foreground hover:text-primary truncate block hover:underline"
                    >
                      {c.clinicName}
                    </Link>
                    <p className="text-[11px] text-muted-foreground font-mono truncate" title={subtitle}>
                      {subtitle}
                    </p>
                  </div>
                  <Badge
                    variant={isPastDue ? 'outline' : 'destructive'}
                    className={`text-[10px] font-mono shrink-0 h-5 px-1.5 capitalize ${
                      isPastDue
                        ? 'border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-500/10'
                        : ''
                    }`}
                  >
                    {c.status.replace('_', ' ')}
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

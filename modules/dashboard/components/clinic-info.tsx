import * as React from 'react';
import Link from 'next/link';
import { Building2, Phone, Clock, CreditCard, CalendarClock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { DashboardClinic } from '@/modules/dashboard';

interface ClinicInfoProps {
  clinic: DashboardClinic;
}

function SubscriptionStatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <Badge variant="outline" className="font-mono text-[10px] capitalize">
        No plan
      </Badge>
    );
  }

  switch (status) {
    case 'active':
      return (
        <Badge
          variant="default"
          className="bg-emerald-600 text-white font-mono text-[10px] capitalize px-2 py-0"
        >
          active
        </Badge>
      );
    case 'trialing':
      return (
        <Badge
          variant="secondary"
          className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-mono text-[10px] capitalize px-2 py-0"
        >
          trialing
        </Badge>
      );
    case 'past_due':
    case 'unpaid':
      return (
        <Badge
          variant="destructive"
          className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-mono text-[10px] capitalize px-2 py-0"
        >
          past due
        </Badge>
      );
    case 'canceled':
      return (
        <Badge
          variant="outline"
          className="text-muted-foreground border-border/80 font-mono text-[10px] capitalize px-2 py-0"
        >
          canceled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="font-mono text-[10px] capitalize px-2 py-0">
          {status}
        </Badge>
      );
  }
}

import { formatIstDate } from '@/lib/time/ist';

function formatPeriodEnd(iso: string | null): string | null {
  if (!iso) return null;
  return `Renews ${formatIstDate(iso, 'd MMM yyyy')}`;
}

export function ClinicInfo({ clinic }: ClinicInfoProps) {
  const renewsLabel = formatPeriodEnd(clinic.subscriptionPeriodEnd);

  return (
    <Card className="shadow-xs border-border/60 bg-card overflow-hidden">
      <CardHeader className="py-4 px-5 border-b border-border/40 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="size-4 text-primary shrink-0" />
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Clinic Overview
            </CardTitle>
          </div>
          <Link
            href="/settings/clinic-profile"
            className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>Edit profile</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-5 flex flex-col gap-3.5 text-xs">
        {/* Name + address */}
        <div className="flex items-start gap-2.5">
          <Building2 className="text-muted-foreground mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-foreground text-xs">{clinic.name}</span>
            {clinic.address ? (
              <span className="text-muted-foreground text-xs mt-0.5 line-clamp-2">
                {clinic.address}
              </span>
            ) : (
              <span className="text-muted-foreground/60 text-xs italic">
                No address specified
              </span>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2.5">
          <Phone className="text-muted-foreground size-4 shrink-0" />
          {clinic.phone ? (
            <span className="text-foreground font-mono">{clinic.phone}</span>
          ) : (
            <span className="text-muted-foreground/60 italic">No phone specified</span>
          )}
        </div>

        {/* Timezone */}
        <div className="flex items-center gap-2.5">
          <Clock className="text-muted-foreground size-4 shrink-0" />
          <span className="text-muted-foreground font-mono">{clinic.timezone}</span>
        </div>

        <Separator className="bg-border/60" />

        {/* Subscription status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CreditCard className="text-muted-foreground size-4 shrink-0" />
            <span className="font-medium text-foreground">Subscription</span>
          </div>
          <div className="flex items-center gap-2">
            {clinic.subscriptionPlan && (
              <span className="text-muted-foreground text-xs capitalize font-medium">
                {clinic.subscriptionPlan}
              </span>
            )}
            <SubscriptionStatusBadge status={clinic.subscriptionStatus} />
          </div>
        </div>

        {/* Renewal date */}
        {renewsLabel && (
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
            <span className="font-mono text-[11px]">{renewsLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
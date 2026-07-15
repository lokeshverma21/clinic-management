// /app/(dashboard)/dashboard/_components/clinic-info.tsx
import { Building2, Phone, Clock, CreditCard, CalendarClock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { DashboardClinic } from '@/modules/dashboard';

interface ClinicInfoProps {
  clinic: DashboardClinic;
}

/**
 * Maps subscriptions.status values to Badge variants.
 *
 * 'active' and 'trialing' are healthy billing states → default (green in
 * most Shadcn themes).
 * 'past_due' / 'unpaid' / 'canceled' are warning/error states → destructive.
 * Anything else (unknown future value) → secondary.
 */
function subscriptionBadgeVariant(
  status: string | null,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (!status) return 'secondary';
  if (status === 'active' || status === 'trialing') return 'default';
  if (status === 'past_due' || status === 'unpaid' || status === 'canceled') return 'destructive';
  return 'secondary';
}

/**
 * Formats subscriptions.currentPeriodEnd as "Renews DD Mon YYYY".
 * Returns null if no subscription exists.
 */
function formatPeriodEnd(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return `Renews ${date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;
}

export function ClinicInfo({ clinic }: ClinicInfoProps) {
  const renewsLabel = formatPeriodEnd(clinic.subscriptionPeriodEnd);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Clinic Information</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {/* Name + address */}
        <div className="flex items-start gap-2">
          <Building2 className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{clinic.name}</span>
            {clinic.address && (
              <span className="text-muted-foreground text-xs">{clinic.address}</span>
            )}
          </div>
        </div>

        {/* Phone */}
        {clinic.phone && (
          <div className="flex items-center gap-2">
            <Phone className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="text-sm">{clinic.phone}</span>
          </div>
        )}

        {/* Timezone */}
        <div className="flex items-center gap-2">
          <Clock className="text-muted-foreground h-4 w-4 shrink-0" />
          <span className="text-muted-foreground text-xs">{clinic.timezone}</span>
        </div>

        <Separator />

        {/* Subscription status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="text-sm">Subscription</span>
          </div>
          <div className="flex items-center gap-2">
            {clinic.subscriptionPlan && (
              <span className="text-muted-foreground text-xs capitalize">
                {clinic.subscriptionPlan}
              </span>
            )}
            <Badge variant={subscriptionBadgeVariant(clinic.subscriptionStatus)}>
              {clinic.subscriptionStatus ?? 'No plan'}
            </Badge>
          </div>
        </div>

        {/* Renewal date — only shown when subscription exists */}
        {renewsLabel && (
          <div className="flex items-center gap-2">
            <CalendarClock className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="text-muted-foreground text-xs">{renewsLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import Link from 'next/link';
import { addDays, format } from 'date-fns';
import { AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';
import { PAST_DUE_GRACE_DAYS, READ_ONLY_CLINIC_STATUSES } from '@/lib/policy/subscription-policy';
import type { ClinicProfile } from '@/modules/clinic-profile/clinic-profile.types';

interface ClinicStatusBannerProps {
  clinic: Pick<ClinicProfile, 'status' | 'pastDueSince'>;
}

export function ClinicStatusBanner({ clinic }: ClinicStatusBannerProps) {
  if (clinic.status === 'past_due') {
    const graceDate = clinic.pastDueSince
      ? addDays(new Date(clinic.pastDueSince), PAST_DUE_GRACE_DAYS)
      : addDays(new Date(), PAST_DUE_GRACE_DAYS);
    const formattedDate = format(graceDate, 'MMMM d, yyyy');

    return (
      <div className="flex items-center justify-between gap-4 border-b border-warning/30 bg-warning/10 px-4 py-2.5 text-xs sm:text-sm text-warning">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0 text-warning" />
          <span className="font-medium text-foreground">
            Payment failed. Your account will become read-only on {formattedDate}.
          </span>
        </div>
        <Link
          href="/settings/subscription"
          className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80 shrink-0"
        >
          Manage subscription <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  if (READ_ONLY_CLINIC_STATUSES.includes(clinic.status as (typeof READ_ONLY_CLINIC_STATUSES)[number])) {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs sm:text-sm text-destructive">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Your account is read-only. Renew to continue.</span>
        </div>
        <Link
          href="/settings/subscription"
          className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80 shrink-0"
        >
          Renew subscription <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return null;
}

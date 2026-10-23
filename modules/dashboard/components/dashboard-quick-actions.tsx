import * as React from 'react';
import Link from 'next/link';
import { CalendarPlus, UserPlus, UserCog } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Quick action buttons providing one-click affordance for frequent clinical actions.
 */
export function DashboardQuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Link
        href="/appointments"
        className={cn(
          buttonVariants({ variant: 'default' }),
          'shadow-xs font-medium gap-1.5 h-8 px-3 text-xs text-primary-foreground',
        )}
      >
        <CalendarPlus className="size-3.5 shrink-0" />
        <span>Book Appointment</span>
      </Link>

      <Link
        href="/patients"
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'border-border/80 hover:bg-muted/70 gap-1.5 h-8 px-3 text-xs text-foreground',
        )}
      >
        <UserPlus className="size-3.5 text-muted-foreground shrink-0" />
        <span>Add Patient</span>
      </Link>

      <Link
        href="/staff"
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'border-border/80 hover:bg-muted/70 gap-1.5 h-8 px-3 text-xs text-foreground',
        )}
      >
        <UserCog className="size-3.5 text-muted-foreground shrink-0" />
        <span>Manage Staff</span>
      </Link>
    </div>
  );
}
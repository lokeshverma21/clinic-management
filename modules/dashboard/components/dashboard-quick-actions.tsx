// /app/(dashboard)/dashboard/_components/dashboard-quick-actions.tsx
import Link from 'next/link';
import { CalendarPlus, UserPlus, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Quick action buttons placed prominently below the header.
 *
 * These are navigation links, not form triggers — they take staff to the
 * relevant creation flows in one click. Styled as buttons for affordance.
 *
 * Add / remove actions here as your application grows. No data dependency.
 */
export function DashboardQuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="default" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
        <Link href="/appointments" className="flex items-center">
          <CalendarPlus className="mr-2 h-4 w-4" />
          Book Appointment
        </Link>
      </Button>

      <Button size="sm" variant="outline">
        <Link href="/patients" className="flex items-center">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Patient
        </Link>
      </Button>

      <Button size="sm" variant="outline">
        <Link href="/staff" className="flex items-center">
          <UserCog className="mr-2 h-4 w-4" />
          Invite Staff
        </Link>
      </Button>
    </div>
  );
}
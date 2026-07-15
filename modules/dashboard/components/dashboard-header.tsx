// /app/(dashboard)/dashboard/_components/dashboard-header.tsx
import { CalendarDays } from 'lucide-react';

interface DashboardHeaderProps {
  clinicName: string;
}

/**
 * Renders the clinic name and the current date.
 *
 * The date is formatted server-side using the Node.js Intl API so it is
 * immediately present in the HTML — no hydration flash, no useEffect.
 *
 * We use 'en-GB' locale for unambiguous date rendering (day first).
 * Replace with the clinic's locale once that column exists on the schema.
 */
export function DashboardHeader({ clinicName }: DashboardHeaderProps) {
  const today = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{clinicName}</h1>
        <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
          <CalendarDays className="h-4 w-4" />
          {today}
        </p>
      </div>
    </div>
  );
}
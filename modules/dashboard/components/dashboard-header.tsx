import * as React from 'react';
import { CalendarDays } from 'lucide-react';

interface DashboardHeaderProps {
  clinicName: string;
}

/**
 * Renders the clinic name and the current formatted date with calm clinical styling.
 */
export function DashboardHeader({ clinicName }: DashboardHeaderProps) {
  const today = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
          {clinicName}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 border border-border/60 text-xs font-medium text-muted-foreground">
          <CalendarDays className="size-3.5 text-primary shrink-0" />
          <span>{today}</span>
        </div>
      </div>
    </div>
  );
}
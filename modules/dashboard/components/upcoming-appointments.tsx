import * as React from 'react';
import Link from 'next/link';
import { CalendarClock, ArrowRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DashboardAppointment, AppointmentStatus } from '@/modules/dashboard';

interface UpcomingAppointmentsProps {
  appointments: DashboardAppointment[];
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  switch (status) {
    case 'completed':
      return (
        <Badge
          variant="default"
          className="bg-emerald-600 text-white font-mono text-[10px] capitalize px-2 py-0"
        >
          Completed
        </Badge>
      );
    case 'confirmed':
      return (
        <Badge
          variant="outline"
          className="bg-primary/10 text-primary border-primary/30 font-mono text-[10px] capitalize px-2 py-0"
        >
          Confirmed
        </Badge>
      );
    case 'booked':
      return (
        <Badge
          variant="secondary"
          className="bg-muted text-muted-foreground border-border font-mono text-[10px] capitalize px-2 py-0"
        >
          Booked
        </Badge>
      );
    case 'canceled':
    case 'no_show':
      return (
        <Badge
          variant="destructive"
          className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-mono text-[10px] capitalize px-2 py-0"
        >
          {status.replace('_', ' ')}
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

/**
 * Formats a UTC ISO datetime to a short human-readable label.
 */
function formatAppointmentLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();

  const time = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return `Today, ${time}`;

  const dateLabel = date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return `${dateLabel}, ${time}`;
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  return (
    <Card className="shadow-xs border-border/60 bg-card overflow-hidden">
      <CardHeader className="py-4 px-5 border-b border-border/40 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CalendarClock className="size-4 text-primary shrink-0" />
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Upcoming Appointments
            </CardTitle>
          </div>
          <Link
            href="/appointments"
            className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-2.5">
              <Clock className="size-5" />
            </div>
            <p className="text-sm font-medium text-foreground">No upcoming visits</p>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
              Upcoming appointments beyond today will appear here as they are booked.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[280px]">
            <ul className="divide-y divide-border/40">
              {appointments.map((appt) => (
                <li
                  key={appt.id}
                  className="flex items-start justify-between px-5 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 min-w-0 pr-4">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {appt.patientName}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {appt.doctorName} · {appt.durationMinutes} min
                    </span>
                    {appt.notes && (
                      <span className="text-muted-foreground/80 max-w-[280px] truncate text-[11px] font-mono mt-0.5">
                        {appt.notes}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5 pl-2">
                    <span className="font-mono text-xs tabular-nums text-foreground font-medium">
                      {formatAppointmentLabel(appt.startTime)}
                    </span>
                    <StatusBadge status={appt.status} />
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
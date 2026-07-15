// /app/(dashboard)/dashboard/_components/upcoming-appointments.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DashboardAppointment, AppointmentStatus } from '@/modules/dashboard';

interface UpcomingAppointmentsProps {
  appointments: DashboardAppointment[];
}

const STATUS_VARIANT: Record<
  AppointmentStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  booked: 'secondary',
  confirmed: 'outline',
  completed: 'default',
  canceled: 'destructive',
  no_show: 'destructive',
};

/**
 * Formats a UTC ISO datetime to a short human-readable label.
 *
 * Same-day appointments show "Today, HH:MM".
 * Other days show "Mon 12 Jan, HH:MM".
 *
 * No library dependency — the Intl API is sufficient and avoids adding
 * a date utility package for a single formatting concern.
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {appointments.length === 0 ? (
          <p className="text-muted-foreground px-6 py-10 text-center text-sm">
            No upcoming appointments.
          </p>
        ) : (
          <ScrollArea className="h-[280px]">
            <ul className="divide-y">
              {appointments.map((appt) => (
                <li key={appt.id} className="flex items-start justify-between px-6 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{appt.patientName}</span>
                    <span className="text-muted-foreground text-xs">
                      {appt.doctorName} · {appt.durationMinutes} min
                    </span>
                    {appt.notes && (
                      <span className="text-muted-foreground max-w-[220px] truncate text-xs">
                        {appt.notes}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 pl-4">
                    <span className="font-mono text-xs tabular-nums">
                      {formatAppointmentLabel(appt.startTime)}
                    </span>
                    <Badge variant={STATUS_VARIANT[appt.status]} className="text-xs">
                      {appt.status}
                    </Badge>
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
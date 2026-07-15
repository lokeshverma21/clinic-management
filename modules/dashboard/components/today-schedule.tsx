// /app/(dashboard)/dashboard/_components/today-schedule.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DashboardAppointment, AppointmentStatus } from '@/modules/dashboard';

interface TodayScheduleProps {
  appointments: DashboardAppointment[];
}

/**
 * Maps every possible appointment status to a Shadcn Badge variant.
 * Using a Record with the full AppointmentStatus union ensures TypeScript
 * will error if a new status is added to the enum without updating this map.
 */
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

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  booked: 'Booked',
  confirmed: 'Confirmed',
  completed: 'Completed',
  canceled: 'Canceled',
  no_show: 'No Show',
};

/**
 * Formats a UTC ISO string to an HH:MM display string.
 * Uses 'en-GB' locale for unambiguous 24-hour output.
 * The conversion to local time is intentional — the server stores UTC,
 * the browser renders in the user's local timezone.
 */
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function TodaySchedule({ appointments }: TodayScheduleProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {"Today's Schedule"}
          <span className="text-muted-foreground ml-2 text-sm font-normal">
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {appointments.length === 0 ? (
          <p className="text-muted-foreground px-6 py-10 text-center text-sm">
            No appointments scheduled for today.
          </p>
        ) : (
          <ScrollArea className="h-[360px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appt) => (
                  <TableRow key={appt.id}>
                    {/* startTime displayed, endTime available for tooltip if needed */}
                    <TableCell className="font-mono text-sm tabular-nums">
                      {formatTime(appt.startTime)}
                    </TableCell>
                    <TableCell className="font-medium">{appt.patientName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {appt.doctorName}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm tabular-nums">
                      {appt.durationMinutes} min
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={STATUS_VARIANT[appt.status]}>
                        {STATUS_LABEL[appt.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
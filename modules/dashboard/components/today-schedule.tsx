import * as React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, Clock } from 'lucide-react';
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

function StatusBadge({ status }: { status: AppointmentStatus }) {
  switch (status) {
    case 'completed':
      return (
        <Badge
          variant="default"
          className="bg-emerald-600 hover:bg-emerald-600/90 text-white font-mono text-[11px] capitalize"
        >
          Completed
        </Badge>
      );
    case 'confirmed':
      return (
        <Badge
          variant="outline"
          className="bg-primary/10 text-primary border-primary/30 font-mono text-[11px] capitalize"
        >
          Confirmed
        </Badge>
      );
    case 'booked':
      return (
        <Badge
          variant="secondary"
          className="bg-muted text-muted-foreground border-border font-mono text-[11px] capitalize"
        >
          Booked
        </Badge>
      );
    case 'canceled':
      return (
        <Badge
          variant="destructive"
          className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-mono text-[11px] capitalize"
        >
          Canceled
        </Badge>
      );
    case 'no_show':
      return (
        <Badge
          variant="destructive"
          className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-mono text-[11px] capitalize"
        >
          No Show
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="font-mono text-[11px] capitalize">
          {status}
        </Badge>
      );
  }
}

import { formatIstTime } from '@/lib/time/ist';

/**
 * Formats a UTC ISO string to an HH:MM display string in IST.
 */
function formatTime(iso: string): string {
  return formatIstTime(iso);
}

export function TodaySchedule({ appointments }: TodayScheduleProps) {
  return (
    <Card className="shadow-xs border-border/60 bg-card overflow-hidden">
      <CardHeader className="py-4 px-5 border-b border-border/40 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="size-4 text-primary shrink-0" />
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Today&apos;s Schedule
            </CardTitle>
            <Badge
              variant="secondary"
              className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-normal"
            >
              {appointments.length} {appointments.length === 1 ? 'visit' : 'visits'}
            </Badge>
          </div>
          <Link
            href="/appointments"
            className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>Full schedule</span>
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
            <p className="text-sm font-medium text-foreground">No appointments today</p>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
              There are no patient visits scheduled on the calendar for today.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[360px]">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-10 backdrop-blur-xs">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="w-[110px] px-5 text-xs font-semibold text-muted-foreground">Time</TableHead>
                  <TableHead className="px-4 text-xs font-semibold text-muted-foreground">Patient</TableHead>
                  <TableHead className="px-4 text-xs font-semibold text-muted-foreground">Doctor</TableHead>
                  <TableHead className="px-4 text-xs font-semibold text-muted-foreground">Duration</TableHead>
                  <TableHead className="text-right px-5 text-xs font-semibold text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appt) => (
                  <TableRow
                    key={appt.id}
                    className="border-border/40 hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="font-mono text-xs font-medium tabular-nums px-5 text-foreground">
                      {formatTime(appt.startTime)}
                    </TableCell>
                    <TableCell className="font-medium text-xs px-4 text-foreground">
                      {appt.patientName}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs px-4">
                      {appt.doctorName}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs tabular-nums px-4">
                      {appt.durationMinutes} min
                    </TableCell>
                    <TableCell className="text-right px-5">
                      <StatusBadge status={appt.status} />
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
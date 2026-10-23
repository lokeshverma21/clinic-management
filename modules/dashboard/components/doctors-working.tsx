import * as React from 'react';
import Link from 'next/link';
import { Stethoscope, ArrowRight, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardDoctor } from '@/modules/dashboard';

interface DoctorsWorkingProps {
  doctors: DashboardDoctor[];
}

function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function DoctorsWorking({ doctors }: DoctorsWorkingProps) {
  return (
    <Card className="shadow-xs border-border/60 bg-card overflow-hidden">
      <CardHeader className="py-4 px-5 border-b border-border/40 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Stethoscope className="size-4 text-primary shrink-0" />
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Doctors Working Today
            </CardTitle>
          </div>
          <Link
            href="/staff"
            className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>Staff list</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
            <div className="flex size-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-2">
              <UserCheck className="size-4" />
            </div>
            <p className="text-xs font-medium text-foreground">No doctors scheduled today</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
              Doctors with appointments assigned today will show here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {doctors.map((doctor) => (
              <li
                key={doctor.membershipId}
                className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors"
              >
                <Avatar className="size-8 shrink-0 ring-1 ring-border/60">
                  <AvatarFallback className="text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    {getInitials(doctor.fullName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {doctor.fullName}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {doctor.specialization ?? doctor.email}
                  </p>
                </div>

                <Badge
                  variant="secondary"
                  className="shrink-0 font-mono text-[11px] font-medium px-2 py-0.5 bg-muted text-muted-foreground"
                >
                  {doctor.appointmentCountToday}{' '}
                  {doctor.appointmentCountToday === 1 ? 'appt' : 'appts'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
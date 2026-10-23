import * as React from 'react';
import Link from 'next/link';
import { Users, ArrowRight, ChevronRight, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DashboardPatient } from '@/modules/dashboard';

interface RecentPatientsProps {
  patients: DashboardPatient[];
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
}

function formatCreatedAt(iso: string): string {
  const created = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Added today';
  if (diffDays === 1) return 'Added yesterday';
  return `Added ${diffDays}d ago`;
}

export function RecentPatients({ patients }: RecentPatientsProps) {
  return (
    <Card className="shadow-xs border-border/60 bg-card overflow-hidden">
      <CardHeader className="py-4 px-5 border-b border-border/40 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="size-4 text-primary shrink-0" />
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Recent Patients
            </CardTitle>
          </div>
          <Link
            href="/patients"
            className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>Patient directory</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-2.5">
              <User className="size-5" />
            </div>
            <p className="text-sm font-medium text-foreground">No patients registered</p>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
              Newly registered patient records will appear in this list.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[320px]">
            <ul className="divide-y divide-border/40">
              {patients.map((patient) => (
                <li key={patient.id}>
                  <Link
                    href={`/patients/${patient.id}`}
                    className="hover:bg-muted/40 flex items-center gap-3 px-5 py-3 transition-colors group"
                  >
                    <Avatar className="size-8 shrink-0 ring-1 ring-border/60">
                      <AvatarFallback className="text-[11px] font-medium bg-primary/10 text-primary">
                        {getInitials(patient.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {patient.fullName}
                      </p>
                      <p className="text-muted-foreground truncate text-xs font-mono">
                        {patient.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-muted-foreground text-[11px]">
                        {formatCreatedAt(patient.createdAt)}
                      </span>
                      <ChevronRight className="size-3.5 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
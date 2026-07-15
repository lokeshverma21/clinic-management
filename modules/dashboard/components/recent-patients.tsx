// /app/(dashboard)/dashboard/_components/recent-patients.tsx
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DashboardPatient } from '@/modules/dashboard';

interface RecentPatientsProps {
  patients: DashboardPatient[];
}

/**
 * Derives initials from a patient's full name for the Avatar fallback.
 * Takes up to the first two words, extracts their first characters.
 * Safe against empty strings.
 */
function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
}

/**
 * Formats a createdAt ISO timestamp as a short relative label.
 * "Today", "Yesterday", or "N days ago" — no library dependency,
 * no time-of-day precision needed for this context.
 */
function formatCreatedAt(iso: string): string {
  const created = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Added today';
  if (diffDays === 1) return 'Added yesterday';
  return `Added ${diffDays} days ago`;
}

export function RecentPatients({ patients }: RecentPatientsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Patients</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {patients.length === 0 ? (
          <p className="text-muted-foreground px-6 py-8 text-center text-sm">
            No patients registered yet.
          </p>
        ) : (
          <ScrollArea className="h-[320px]">
            <ul className="divide-y">
              {patients.map((patient) => (
                <li key={patient.id}>
                  <Link
                    href={`/patients/${patient.id}`}
                    className="hover:bg-muted/50 flex items-center gap-3 px-6 py-3 transition-colors"
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs">
                        {getInitials(patient.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{patient.fullName}</p>
                      <p className="text-muted-foreground truncate text-xs">{patient.phone}</p>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatCreatedAt(patient.createdAt)}
                    </span>
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
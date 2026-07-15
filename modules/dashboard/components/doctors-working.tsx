// /app/(dashboard)/dashboard/_components/doctors-working.tsx
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardDoctor } from '@/modules/dashboard';

interface DoctorsWorkingProps {
  doctors: DashboardDoctor[];
}

/**
 * Derives up-to-two-character initials from a full name.
 * Handles single-word names gracefully.
 */
function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Shows which doctors have appointments scheduled today.
 *
 * Each row shows name, specialization (if set on their staff profile),
 * email, and today's appointment count. Gives reception staff an instant
 * read on staffing without leaving the dashboard.
 *
 * specialization comes from staffProfiles.specialization — null if the
 * doctor has not filled in their profile yet, which is expected during
 * onboarding.
 */
export function DoctorsWorking({ doctors }: DoctorsWorkingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Doctors Working Today</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {doctors.length === 0 ? (
          <p className="text-muted-foreground px-6 py-10 text-center text-sm">
            No doctors scheduled today.
          </p>
        ) : (
          <ul className="divide-y">
            {doctors.map((doctor) => (
              <li key={doctor.membershipId} className="flex items-center gap-3 px-6 py-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-xs">
                    {getInitials(doctor.fullName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doctor.fullName}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {doctor.specialization ?? doctor.email}
                  </p>
                </div>

                <Badge variant="secondary" className="shrink-0 tabular-nums">
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
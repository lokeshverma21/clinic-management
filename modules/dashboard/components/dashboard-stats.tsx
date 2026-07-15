// /app/(dashboard)/dashboard/_components/dashboard-stats.tsx
import { CalendarCheck2, CheckCircle2, Users, Stethoscope } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardStats as DashboardStatsType } from '@/modules/dashboard';

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

/**
 * Four stat cards in a responsive row.
 *
 * Every number displayed here is a direct COUNT from the database — no
 * derived percentages, no trend arrows, no sparklines. Clinic staff need
 * raw operational numbers at a glance, not analytics.
 */
export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: "Today's Appointments",
      value: stats.appointmentsToday,
      icon: CalendarCheck2,
      description: 'Scheduled for today',
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      icon: CheckCircle2,
      description: 'Appointments completed',
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      description: 'Active patient records',
    },
    {
      title: 'Doctors In Today',
      value: stats.doctorsWorkingToday,
      icon: Stethoscope,
      description: 'With scheduled appointments',
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-muted-foreground mt-1 text-xs">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
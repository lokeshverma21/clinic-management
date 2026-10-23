import * as React from "react";
import { CalendarCheck2, CheckCircle2, Users, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats as DashboardStatsType } from "@/modules/dashboard";

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

/**
 * Four operational KPI stat cards presented in a calm, balanced clinical grid.
 */
export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: "Today's Appointments",
      value: stats.appointmentsToday,
      icon: CalendarCheck2,
      iconClass: "bg-primary/10 text-primary border border-primary/20",
      description: "Scheduled for today",
    },
    {
      title: "Completed Today",
      value: stats.completedToday,
      icon: CheckCircle2,
      iconClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
      description: "Appointments completed",
    },
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      iconClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20",
      description: "Registered patient records",
    },
    {
      title: "Doctors In Today",
      value: stats.doctorsWorkingToday,
      icon: Stethoscope,
      iconClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
      description: "With active appointments",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="shadow-xs border-border/60 bg-card hover:border-border transition-all duration-200"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate">
              {card.title}
            </CardTitle>
            <span
              className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}
            >
              <card.icon className="size-4" strokeWidth={2} />
            </span>
          </CardHeader>
          <CardContent className="px-5 pb-4 pt-1">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
              {card.value.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

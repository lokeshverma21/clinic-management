// /app/(dashboard)/dashboard/_components/dashboard-stats.tsx
import { CalendarCheck2, CheckCircle2, Users, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats as DashboardStatsType } from "@/modules/dashboard";

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
            iconClass: "bg-teal-50 text-teal-700 ring-1 ring-teal-100",
            description: "Scheduled for today",
        },
        {
            title: "Completed Today",
            value: stats.completedToday,
            icon: CheckCircle2,
            iconClass: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
            description: "Appointments completed",
        },
        {
            title: "Total Patients",
            value: stats.totalPatients,
            icon: Users,
            iconClass: "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
            description: "Active patient records",
        },
        {
            title: "Doctors In Today",
            value: stats.doctorsWorkingToday,
            icon: Stethoscope,
            iconClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
            description: "With scheduled appointments",
        },
    ] as const;

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {card.title}
                        </CardTitle>
                        <span
                            className={`inline-flex size-8 shrink-0 items-center justify-center rounded-md ${card.iconClass}`}
                        >
                            <card.icon className="size-4" strokeWidth={1.8} />
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-muted-foreground mt-1 text-xs">
                            {card.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// modules/admin/dashboard/components/kpi-cards.tsx
import * as React from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  CalendarClock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminDashboardKpis } from '../dashboard.types';

interface KpiCardsProps {
  kpis: AdminDashboardKpis;
}

export function KpiCards({ kpis }: KpiCardsProps) {
  const formattedMrr = `₹${kpis.estimatedMrr.toLocaleString('en-IN')}`;

  const cards = [
    {
      title: 'Total Clinics',
      value: kpis.totalClinics.toLocaleString(),
      description: 'Tenants on platform',
      icon: Building2,
      iconClass: 'bg-muted text-foreground ring-1 ring-border',
    },
    {
      title: 'Active Clinics',
      value: kpis.activeClinics.toLocaleString(),
      description: 'In good standing',
      icon: CheckCircle2,
      iconClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800',
    },
    {
      title: 'On Trial',
      value: kpis.trialClinics.toLocaleString(),
      description: 'Exploring ClinicSeva',
      icon: Clock,
      iconClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800',
    },
    {
      title: 'At Risk',
      value: kpis.atRiskClinics.toLocaleString(),
      description: 'Past due or suspended',
      icon: AlertTriangle,
      iconClass:
        kpis.atRiskClinics > 0
          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800'
          : 'bg-muted text-muted-foreground ring-1 ring-border',
    },
    {
      title: 'Estimated MRR',
      value: formattedMrr,
      description:
        kpis.customPlanClinics > 0
          ? `excludes ${kpis.customPlanClinics} custom-plan ${kpis.customPlanClinics === 1 ? 'clinic' : 'clinics'}`
          : 'Active SaaS subscriptions',
      icon: IndianRupee,
      iconClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 ring-1 ring-teal-200 dark:ring-teal-800',
    },
    {
      title: 'Trials Ending',
      value: kpis.trialsEndingSoonCount.toLocaleString(),
      description: 'Next 7 days',
      icon: CalendarClock,
      iconClass:
        kpis.trialsEndingSoonCount > 0
          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 ring-1 ring-purple-200 dark:ring-purple-800'
          : 'bg-muted text-muted-foreground ring-1 ring-border',
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => (
        <Card key={c.title} className="shadow-none border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {c.title}
            </CardTitle>
            <span
              className={`inline-flex size-6 shrink-0 items-center justify-center rounded-md ${c.iconClass}`}
            >
              <c.icon className="size-3.5" />
            </span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-xl font-bold tracking-tight font-mono text-foreground truncate">
              {c.value}
            </div>
            <p className="text-[11px] text-muted-foreground truncate" title={c.description}>
              {c.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

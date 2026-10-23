// modules/admin/dashboard/components/status-chart.tsx
'use client';

import * as React from 'react';
import { Pie, PieChart, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { AdminDashboardClinicStatusCount } from '../dashboard.types';
import { PieChart as PieChartIcon } from 'lucide-react';

interface StatusChartProps {
  data: AdminDashboardClinicStatusCount[];
}

const chartConfig = {
  active: {
    label: 'Active',
    color: 'var(--color-deep-teal)',
  },
  trial: {
    label: 'Trial',
    color: 'var(--color-deep-teal-light)',
  },
  past_due: {
    label: 'Past Due',
    color: 'var(--color-soft-coral)',
  },
  suspended: {
    label: 'Suspended',
    color: 'var(--color-shadow-blue-light)',
  },
  canceled: {
    label: 'Canceled',
    color: 'var(--color-sage-mist)',
  },
} satisfies ChartConfig;

const STATUS_FILLS: Record<string, string> = {
  active: 'var(--color-deep-teal)',       // #0D4F4F
  trial: 'var(--color-deep-teal-light)',  // #1A6B6B
  past_due: 'var(--color-soft-coral)',    // #FF6B6B
  suspended: 'var(--color-shadow-blue-light)', // #2A4A52
  canceled: 'var(--color-sage-mist)',     // #E8F0E9
};

export function StatusChart({ data }: StatusChartProps) {
  const totalClinics = React.useMemo(
    () => data.reduce((sum, item) => sum + item.count, 0),
    [data],
  );

  const chartData = React.useMemo(
    () =>
      data
        .filter((d) => d.count > 0)
        .map((d) => ({
          ...d,
          fill: STATUS_FILLS[d.status] ?? 'var(--chart-1)',
        })),
    [data],
  );

  return (
    <Card className="shadow-none border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PieChartIcon className="size-4 text-primary" />
            <span>Clinics by Status</span>
          </CardTitle>
          <span className="text-xs text-muted-foreground font-mono">
            {totalClinics} total {totalClinics === 1 ? 'clinic' : 'clinics'}
          </span>
        </div>
        <CardDescription className="text-xs">
          Lifecycle distribution across all registered clinic tenants.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {totalClinics === 0 ? (
          <div className="flex h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-border/60 p-6 text-center text-muted-foreground">
            <PieChartIcon className="size-8 stroke-[1.5] text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium">No Clinics Found</p>
            <p className="text-xs text-muted-foreground max-w-[220px] mt-1">
              Registered clinics and their tenant status will be displayed here.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent nameKey="status" hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                stroke="var(--background)"
                strokeWidth={2}
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="status" />}
                className="-translate-y-2 flex-wrap gap-2 text-xs"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

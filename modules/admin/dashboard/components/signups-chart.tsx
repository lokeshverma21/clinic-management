// modules/admin/dashboard/components/signups-chart.tsx
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { AdminDashboardSignupMonth } from '../dashboard.types';
import { TrendingUp, UserPlus } from 'lucide-react';

interface SignupsChartProps {
  data: AdminDashboardSignupMonth[];
}

const chartConfig = {
  count: {
    label: 'New Clinics',
    color: 'var(--color-deep-teal)',
  },
} satisfies ChartConfig;

export function SignupsChart({ data }: SignupsChartProps) {
  const totalSignups = React.useMemo(
    () => data.reduce((sum, item) => sum + item.count, 0),
    [data],
  );

  return (
    <Card className="shadow-none border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <UserPlus className="size-4 text-primary" />
            <span>Clinic Signups</span>
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{totalSignups} total in 6 mo</span>
          </div>
        </div>
        <CardDescription className="text-xs">
          New clinic registrations per month over the last 6 months (UTC).
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 || totalSignups === 0 ? (
          <div className="flex h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-border/60 p-6 text-center text-muted-foreground">
            <UserPlus className="size-8 stroke-[1.5] text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium">No Signups Recorded</p>
            <p className="text-xs text-muted-foreground max-w-[220px] mt-1">
              New clinics registered in the last 6 months will appear in this monthly trend.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs font-mono"
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs font-mono"
              />
              <ChartTooltip
                cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

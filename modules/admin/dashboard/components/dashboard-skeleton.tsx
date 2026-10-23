// modules/admin/dashboard/components/dashboard-skeleton.tsx
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards (6 items) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="shadow-none border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-6 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-1.5">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid (2 columns on lg) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Signups Chart Skeleton */}
        <Card className="shadow-none border-border/60">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-64" />
          </CardHeader>
          <CardContent className="pt-4">
            <Skeleton className="h-[280px] w-full rounded-md" />
          </CardContent>
        </Card>

        {/* Status Donut Chart Skeleton */}
        <Card className="shadow-none border-border/60">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-60" />
          </CardHeader>
          <CardContent className="pt-4">
            <Skeleton className="h-[280px] w-full rounded-md" />
          </CardContent>
        </Card>
      </div>

      {/* 3 Short Lists Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trials Ending Soon */}
        <Card className="shadow-none border-border/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-16 rounded" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* At-Risk Clinics */}
        <Card className="shadow-none border-border/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-5 w-16 rounded" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-none border-border/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// /app/(dashboard)/dashboard/_components/dashboard-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Structural skeleton that mirrors the exact layout of the real dashboard.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header and Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/50">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52 rounded-md" />
          <Skeleton className="h-4 w-36 rounded-md" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-xs border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-5 pt-4">
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="size-8 rounded-lg" />
            </CardHeader>
            <CardContent className="px-5 pb-4 pt-1">
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="mt-2 h-3 w-32 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Today's schedule */}
          <Card className="shadow-xs border-border/60">
            <CardHeader className="py-4 px-5 border-b border-border/40">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-44 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton className="h-4 flex-1 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-5 w-18 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming */}
          <Card className="shadow-xs border-border/60">
            <CardHeader className="py-4 px-5 border-b border-border/40">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-48 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-36 rounded" />
                    <Skeleton className="h-3 w-28 rounded" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent patients */}
          <Card className="shadow-xs border-border/60">
            <CardHeader className="py-4 px-5 border-b border-border/40">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-36 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex flex-col gap-1 flex-1">
                    <Skeleton className="h-3.5 w-32 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Doctors */}
          <Card className="shadow-xs border-border/60">
            <CardHeader className="py-4 px-5 border-b border-border/40">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex flex-col gap-1 flex-1">
                    <Skeleton className="h-3.5 w-28 rounded" />
                    <Skeleton className="h-3 w-36 rounded" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Clinic info */}
          <Card className="shadow-xs border-border/60">
            <CardHeader className="py-4 px-5 border-b border-border/40">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-4 w-18 rounded" />
              </div>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-3.5">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="h-px w-full my-1" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
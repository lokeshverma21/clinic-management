// modules/admin/platform-users/components/platform-users-loading.tsx
import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PlatformUsersLoading() {
  return (
    <Card className="shadow-none border-border/60">
      <CardContent className="p-0">
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-48" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="size-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

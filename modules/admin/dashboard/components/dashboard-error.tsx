// modules/admin/dashboard/components/dashboard-error.tsx
import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardErrorProps {
  message?: string;
  onRetry: () => void;
}

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <Card className="border-destructive/30 bg-destructive/5 shadow-none">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            Failed to Load Overview Dashboard
          </h3>
          <p className="text-xs text-muted-foreground max-w-md">
            {message || 'An unexpected error occurred while compiling platform metrics. Please try again.'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="size-3.5" />
          <span>Retry</span>
        </Button>
      </CardContent>
    </Card>
  );
}

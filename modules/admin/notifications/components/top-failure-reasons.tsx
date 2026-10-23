"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TopFailureReasonsProps {
  reasons: Array<{ reason: string; count: number }>;
}

export function TopFailureReasons({ reasons }: TopFailureReasonsProps) {
  return (
    <Card className="shadow-none border-border/60">
      <CardHeader className="py-3 px-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Top Failure Reasons (Last 7 Days)
            </CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">Excludes read-only skips</span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {reasons.length === 0 ? (
          <div className="flex items-center gap-2.5 py-4 px-3 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>No delivery failures reported in the last 7 days. Systems operating smoothly!</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {reasons.map((item, idx) => (
              <div
                key={`${item.reason}-${idx}`}
                className="flex items-center justify-between gap-4 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors border border-border/40"
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs font-mono text-foreground truncate"
                    title={item.reason}
                  >
                    {item.reason}
                  </p>
                </div>
                <Badge
                  variant="destructive"
                  className="shrink-0 font-mono text-xs bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 font-semibold"
                >
                  {item.count} {item.count === 1 ? "failure" : "failures"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

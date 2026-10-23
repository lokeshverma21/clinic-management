"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"

export function SubscriptionsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-muted rounded-md" />
        <div className="h-4 w-96 bg-muted/60 rounded-md" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-none border-border/60">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="size-4 bg-muted rounded-full" />
              </div>
              <div className="h-7 w-12 bg-muted rounded" />
              <div className="h-3 w-28 bg-muted/60 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar Skeleton */}
      <div className="h-16 bg-card border border-border/60 rounded-xl" />

      {/* Table Skeleton */}
      <div className="h-64 bg-card border border-border/60 rounded-xl" />
    </div>
  )
}

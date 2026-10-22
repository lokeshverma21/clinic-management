"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function AuditLogsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Toolbar skeleton */}
      <div className="p-4 rounded-xl border border-border/50 bg-card">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card">
        <div className="h-11 bg-muted/50 border-b border-border/60" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-16 border-b border-border/40 flex items-center px-6 gap-6"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24 hidden md:block" />
            <Skeleton className="h-7 w-16 ml-auto rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

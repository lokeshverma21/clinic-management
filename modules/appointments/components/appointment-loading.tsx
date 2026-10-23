"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function AppointmentLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-xs border-border/60">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-12" />
              </div>
              <Skeleton className="size-8 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar Skeleton */}
      <div className="h-14 w-full bg-card rounded-lg border border-border/60 p-3 flex items-center gap-2.5">
        <Skeleton className="h-9 w-60 rounded-md" />
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="size-9 ml-auto rounded-md" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card shadow-xs">
        <div className="h-11 bg-muted/40 border-b border-border/60" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 border-b border-border/40 flex items-center px-4 gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="size-8 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-28 hidden sm:block" />
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="size-8 ml-auto rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

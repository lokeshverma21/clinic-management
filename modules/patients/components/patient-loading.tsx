"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function PatientLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-none border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar Skeleton */}
      <div className="h-16 w-full bg-card rounded-lg border border-border/60 p-3 flex gap-3">
        <Skeleton className="h-9 flex-1 max-w-sm" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-9 ml-auto rounded-md" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card">
        <div className="h-12 bg-muted/50 border-b border-border/60" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 border-b border-border/50 flex items-center px-6 gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40 hidden md:block" />
            <Skeleton className="h-4 w-16 hidden lg:block" />
            <Skeleton className="h-4 w-20 hidden lg:block" />
            <Skeleton className="h-8 w-8 ml-auto rounded-md" />
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}

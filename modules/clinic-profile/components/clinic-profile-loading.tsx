"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function ClinicProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-60 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      <div className="space-y-6">
        <Card className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
          <CardContent className="p-5 space-y-5">
            <Skeleton className="h-5 w-40 rounded-md" />
            <div className="flex items-center gap-5">
              <Skeleton className="size-20 rounded-xl" />
              <div className="space-y-2 flex-1 max-w-sm">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <Skeleton className="h-5 w-44 rounded-md" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-32 rounded-md" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
    </div>
  )
}

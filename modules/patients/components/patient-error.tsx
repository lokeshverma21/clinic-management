"use client"

import * as React from "react"
import { AlertCircle, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface PatientErrorProps {
  onRetry: () => void
}

export function PatientError({ onRetry }: PatientErrorProps) {
  return (
    <Card className="border-destructive/30 bg-destructive/5 shadow-xs overflow-hidden rounded-lg">
      <CardContent className="p-8">
        <div className="flex flex-col items-center text-center">
          <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-3">
            <AlertCircle className="size-5" />
          </div>
          <h3 className="text-base font-semibold text-foreground tracking-tight mb-1">Unable to load patients</h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
            A connection error occurred while trying to fetch the patient records. Please try again.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="gap-2 text-xs h-9 bg-background border-border/80"
          >
            <RotateCw className="size-3.5" />
            <span>Try again</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

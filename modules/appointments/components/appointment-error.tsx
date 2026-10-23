"use client"

import * as React from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface AppointmentErrorProps {
  onRetry?: () => void
  message?: string
}

export function AppointmentError({ 
  onRetry, 
  message = "Unable to load appointments" 
}: AppointmentErrorProps) {
  return (
    <Card className="border-destructive/30 bg-destructive/5 shadow-xs rounded-lg">
      <CardContent className="p-8 flex flex-col items-center justify-center text-center">
        <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-3">
          <AlertCircle className="size-5" />
        </div>
        <h3 className="text-base font-semibold text-foreground tracking-tight">{message}</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
          Something went wrong while fetching appointment records. Please try again.
        </p>
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            className="mt-4 gap-2 text-xs h-9 bg-background border-border/80"
          >
            <RotateCcw className="size-3.5" />
            <span>Try again</span>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

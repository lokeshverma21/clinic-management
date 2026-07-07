"use client"

import * as React from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface AppointmentErrorProps {
  onRetry?: () => void;
  message?: string;
}

export function AppointmentError({ onRetry, message = "Unable to load appointments" }: AppointmentErrorProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/5 shadow-none rounded-xl">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{message}</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-[320px]">
          Something went wrong while fetching the appointment data. Please try again or contact support if the issue persists.
        </p>
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            className="mt-6 gap-2 bg-background border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            <RotateCcw size={16} />
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

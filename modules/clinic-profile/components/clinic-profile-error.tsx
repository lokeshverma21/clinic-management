"use client"

import * as React from "react"
import { AlertCircle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ClinicProfileErrorProps {
  message?: string;
  onRetry: () => void;
}

export function ClinicProfileError({ 
  message = "Failed to load clinic profile. Please try again.", 
  onRetry 
}: ClinicProfileErrorProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/5 shadow-none">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          {message}
        </p>
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="gap-2 border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
        >
          <RefreshCcw className="h-4 w-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}

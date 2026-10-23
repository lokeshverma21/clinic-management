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
    <Card className="border-destructive/20 bg-destructive/5 rounded-xl shadow-xs">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
          <AlertCircle className="size-5 text-destructive" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Failed to load clinic profile</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-5 leading-relaxed">
          {message}
        </p>
        <Button 
          variant="outline" 
          onClick={onRetry}
          size="sm"
          className="gap-2 h-9 text-xs border-border/60 hover:bg-muted"
        >
          <RefreshCcw className="size-3.5" />
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}

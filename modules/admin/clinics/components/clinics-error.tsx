"use client"

import * as React from "react"
import { AlertCircle, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ClinicsErrorProps {
  onRetry: () => void;
  message?: string;
}

export function ClinicsError({ onRetry, message }: ClinicsErrorProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/5 shadow-none overflow-hidden animate-in fade-in duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-3">
            <AlertCircle size={20} />
          </div>
          <h3 className="text-sm font-bold text-destructive uppercase tracking-wider mb-1">
            Unable to load clinics
          </h3>
          <p className="text-xs text-destructive/80 max-w-sm mb-4">
            {message || "An error occurred while loading clinic data. Please check your connection and retry."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <RotateCw size={14} />
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

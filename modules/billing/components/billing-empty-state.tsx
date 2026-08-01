"use client"

import * as React from "react"
import { FileSpreadsheet, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BillingEmptyStateProps {
  onCreateInvoice: () => void;
  readOnly?: boolean;
}

export function BillingEmptyState({ onCreateInvoice, readOnly }: BillingEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-border/60 rounded-xl bg-muted/5">
      <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4">
        <FileSpreadsheet size={24} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">No invoices yet</h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
        Create your first invoice to start tracking patient billing and payments.
      </p>
      {!readOnly && (
        <Button onClick={onCreateInvoice} className="gap-2">
          <Plus size={16} />
          New Invoice
        </Button>
      )}
    </div>
  )
}

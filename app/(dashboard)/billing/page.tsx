"use client"

import * as React from "react"
import { format } from "date-fns"
import { BillingHeader } from "@/modules/billing/components/billing-header"
import { BillingStatsCards } from "@/modules/billing/components/billing-stats-cards"
import { BillingToolbar } from "@/modules/billing/components/billing-toolbar"
import { BillingTable } from "@/modules/billing/components/billing-table"
import { InvoiceDialog } from "@/modules/billing/components/invoice-dialog"
import { InvoiceDetailsSheet } from "@/modules/billing/components/invoice-details-sheet"
import { PaymentDialog } from "@/modules/billing/components/payment-dialog"
import { BillingLoading } from "@/modules/billing/components/billing-loading"
import { BillingError } from "@/modules/billing/components/billing-error"
import { BillingEmptyState } from "@/modules/billing/components/billing-empty-state"
import type { InvoiceWithDetails, InvoiceStats } from "@/modules/billing/billing.types"

export default function BillingPage() {
  const [invoices, setInvoices] = React.useState<InvoiceWithDetails[]>([])
  const [stats, setStats] = React.useState<InvoiceStats | null>(null)
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [doctorId, setDoctorId] = React.useState("all")
  const [status, setStatus] = React.useState("all")
  const [paymentMethod, setPaymentMethod] = React.useState("all")
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>()
  const [dateTo, setDateTo] = React.useState<Date | undefined>()

  const [isLoading, setIsLoading] = React.useState(true)
  const [statsLoading, setStatsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add")
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState<string | null>(null)
  const [paymentInvoice, setPaymentInvoice] = React.useState<InvoiceWithDetails | null>(null)

  const loadStats = React.useCallback(async () => {
    try {
      setStatsLoading(true)
      const res = await fetch("/api/billing/stats")
      const json = await res.json()
      if (res.ok) {
        setStats(json.data.stats)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const loadInvoices = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setHasError(false)

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy: "issuedAt",
        sortOrder: "desc",
      })

      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (doctorId !== "all") params.set("doctorMembershipId", doctorId)
      if (status !== "all") params.set("status", status)
      if (paymentMethod !== "all") params.set("paymentMethod", paymentMethod)
      if (dateFrom) params.set("from", format(dateFrom, "yyyy-MM-dd"))
      if (dateTo) params.set("to", format(dateTo, "yyyy-MM-dd"))

      const res = await fetch(`/api/billing?${params.toString()}`)
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error?.message ?? "Failed to load invoices")
      }

      setInvoices(json.data.invoices ?? [])
      setTotal(json.data.total ?? 0)
    } catch (err) {
      console.error(err)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, searchQuery, doctorId, status, paymentMethod, dateFrom, dateTo])

  const refreshAll = React.useCallback(() => {
    loadInvoices()
    loadStats()
  }, [loadInvoices, loadStats])

  React.useEffect(() => {
    setTimeout(() => {
      loadStats()
    }, 0)
  }, [loadStats])

  React.useEffect(() => {
    setTimeout(() => {
      loadInvoices()
    }, 0)
  }, [loadInvoices])

  const handleResetFilters = () => {
    setSearchQuery("")
    setDoctorId("all")
    setStatus("all")
    setPaymentMethod("all")
    setDateFrom(undefined)
    setDateTo(undefined)
    setPage(1)
  }

  const handleCreateInvoice = () => {
    setDialogMode("add")
    setSelectedInvoiceId(null)
    setIsDialogOpen(true)
  }

  const handleViewInvoice = (id: string) => {
    setSelectedInvoiceId(id)
    setIsSheetOpen(true)
  }

  const handleEditInvoice = (id: string) => {
    setSelectedInvoiceId(id)
    setDialogMode("edit")
    setIsDialogOpen(true)
  }

  const handleRecordPayment = (invoice: InvoiceWithDetails) => {
    setPaymentInvoice(invoice)
    setIsPaymentOpen(true)
  }

  const handleDuplicateInvoice = async (id: string) => {
    try {
      const res = await fetch(`/api/billing/${id}/duplicate`, { method: "POST" })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Failed to duplicate invoice")
      }
      refreshAll()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to duplicate invoice")
    }
  }

  const handleDeleteInvoice = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this invoice?")
    if (!confirmed) return

    try {
      const res = await fetch(`/api/billing/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Failed to delete invoice")
      }
      refreshAll()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete invoice")
    }
  }

  if (isLoading && invoices.length === 0 && !hasError) {
    return (
      <div className="container p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <BillingLoading />
      </div>
    )
  }

  if (hasError && invoices.length === 0) {
    return (
      <div className="container p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <BillingHeader onCreateInvoice={handleCreateInvoice} />
        <BillingError onRetry={refreshAll} />
      </div>
    )
  }

  const isFiltered =
    searchQuery.trim().length > 0 ||
    doctorId !== "all" ||
    status !== "all" ||
    paymentMethod !== "all" ||
    dateFrom !== undefined ||
    dateTo !== undefined

  const showEmptyState = invoices.length === 0 && !isFiltered

  return (
    <div className="container p-4 sm:p-6 lg:p-2 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <BillingHeader onCreateInvoice={handleCreateInvoice} />

      <BillingStatsCards stats={stats} loading={statsLoading} />

      {showEmptyState ? (
        <BillingEmptyState onCreateInvoice={handleCreateInvoice} />
      ) : (
        <div className="space-y-4">
          <BillingToolbar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q)
              setPage(1)
            }}
            doctorId={doctorId}
            onDoctorIdChange={(id) => {
              setDoctorId(id)
              setPage(1)
            }}
            status={status}
            onStatusChange={(s) => {
              setStatus(s)
              setPage(1)
            }}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={(m) => {
              setPaymentMethod(m)
              setPage(1)
            }}
            dateFrom={dateFrom}
            onDateFromChange={(d) => {
              setDateFrom(d)
              setPage(1)
            }}
            dateTo={dateTo}
            onDateToChange={(d) => {
              setDateTo(d)
              setPage(1)
            }}
            onReset={handleResetFilters}
          />

          <BillingTable
            invoices={invoices}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onViewInvoice={handleViewInvoice}
            onEditInvoice={handleEditInvoice}
            onRecordPayment={handleRecordPayment}
            onDuplicateInvoice={handleDuplicateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            canDelete
          />
        </div>
      )}

      <InvoiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode={dialogMode}
        invoiceId={selectedInvoiceId}
        onSuccess={refreshAll}
      />

      <InvoiceDetailsSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        invoiceId={selectedInvoiceId}
        onEdit={() => {
          setIsSheetOpen(false)
          setDialogMode("edit")
          setIsDialogOpen(true)
        }}
        onRecordPayment={(invoice) => {
          setIsSheetOpen(false)
          handleRecordPayment(invoice)
        }}
        onDuplicate={handleDuplicateInvoice}
        onDelete={handleDeleteInvoice}
        onSuccess={refreshAll}
        canDelete
      />

      <PaymentDialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        invoice={paymentInvoice}
        onSuccess={refreshAll}
      />
    </div>
  )
}
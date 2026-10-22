"use client"

import * as React from "react"
import { AuditLogsHeader } from "./audit-logs-header"
import { AuditLogsToolbar } from "./audit-logs-toolbar"
import { AuditLogsTable } from "./audit-logs-table"
import { AuditLogsEmptyState } from "./audit-logs-empty-state"
import { AuditLogsError } from "./audit-logs-error"
import { AuditLogsLoading } from "./audit-logs-loading"
import type { AdminAuditLogWithActor } from "../audit-logs.types"

export function AuditLogsView() {
  const [logs, setLogs] = React.useState<AdminAuditLogWithActor[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(20)

  const [action, setAction] = React.useState("")
  const [clinicId, setClinicId] = React.useState("")
  const [from, setFrom] = React.useState("")
  const [to, setTo] = React.useState("")

  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  const loadLogs = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage("")

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })

      if (action) params.set("action", action)
      if (clinicId.trim()) params.set("clinicId", clinicId.trim())
      if (from) params.set("from", from)
      if (to) params.set("to", to)

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? "Failed to load audit logs")
      }

      setLogs(json.data.logs ?? [])
      setTotal(json.data.total ?? 0)
    } catch (err: unknown) {
      console.error("Error loading audit logs:", err)
      setHasError(true)
      setErrorMessage(err instanceof Error ? err.message : "Failed to load audit logs")
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, action, clinicId, from, to])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void loadLogs()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadLogs])

  const handleResetFilters = () => {
    setAction("")
    setClinicId("")
    setFrom("")
    setTo("")
    setPage(1)
  }

  const handleActionChange = (newAction: string) => {
    setAction(newAction)
    setPage(1)
  }

  const handleClinicIdChange = (newClinicId: string) => {
    setClinicId(newClinicId)
    setPage(1)
  }

  const handleFromChange = (newFrom: string) => {
    setFrom(newFrom)
    setPage(1)
  }

  const handleToChange = (newTo: string) => {
    setTo(newTo)
    setPage(1)
  }

  const hasActiveFilters = Boolean(action || clinicId || from || to)

  if (isLoading && logs.length === 0) {
    return <AuditLogsLoading />
  }

  return (
    <div className="space-y-6">
      <AuditLogsHeader totalCount={total} />

      <AuditLogsToolbar
        action={action}
        onActionChange={handleActionChange}
        clinicId={clinicId}
        onClinicIdChange={handleClinicIdChange}
        from={from}
        onFromChange={handleFromChange}
        to={to}
        onToChange={handleToChange}
        onReset={handleResetFilters}
      />

      {hasError ? (
        <AuditLogsError onRetry={loadLogs} message={errorMessage} />
      ) : total === 0 && !hasActiveFilters ? (
        <AuditLogsEmptyState />
      ) : (
        <AuditLogsTable
          logs={logs}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

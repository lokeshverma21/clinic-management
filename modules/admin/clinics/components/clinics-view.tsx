"use client"

import * as React from "react"
import { ClinicsHeader } from "./clinics-header"
import { ClinicsToolbar } from "./clinics-toolbar"
import { ClinicsTable } from "./clinics-table"
import { ClinicsEmptyState } from "./clinics-empty-state"
import { ClinicsError } from "./clinics-error"
import { ClinicsLoading } from "./clinics-loading"
import type { AdminClinicListItem } from "../clinics.types"

export function ClinicsView() {
  const [clinics, setClinics] = React.useState<AdminClinicListItem[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(20)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [status, setStatus] = React.useState("")

  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  const loadClinics = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage("")

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })

      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (status) params.set("status", status)

      const res = await fetch(`/api/admin/clinics?${params.toString()}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? "Failed to load clinics")
      }

      setClinics(json.data.clinics ?? [])
      setTotal(json.data.total ?? 0)
    } catch (err: unknown) {
      console.error("Error loading clinics:", err)
      setHasError(true)
      setErrorMessage(err instanceof Error ? err.message : "Failed to load clinics")
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, searchQuery, status])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void loadClinics()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadClinics])

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatus("")
    setPage(1)
  }

  const handleSearchChange = (newSearch: string) => {
    setSearchQuery(newSearch)
    setPage(1)
  }

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    setPage(1)
  }

  const hasActiveFilters = Boolean(searchQuery.trim() || status)

  if (isLoading && clinics.length === 0) {
    return <ClinicsLoading />
  }

  return (
    <div className="space-y-6">
      <ClinicsHeader totalCount={total} />

      <ClinicsToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        onReset={handleResetFilters}
      />

      {hasError ? (
        <ClinicsError onRetry={loadClinics} message={errorMessage} />
      ) : total === 0 && !hasActiveFilters ? (
        <ClinicsEmptyState />
      ) : (
        <ClinicsTable
          clinics={clinics}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

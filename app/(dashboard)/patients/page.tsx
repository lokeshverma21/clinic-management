"use client"

import * as React from "react"
import { PatientHeader } from "@/modules/patients/components/patient-header"
import { PatientStats } from "@/modules/patients/components/patient-stats"
import { PatientToolbar } from "@/modules/patients/components/patient-toolbar"
import { PatientTable } from "@/modules/patients/components/patient-table"
import { PatientDialog } from "@/modules/patients/components/patient-dialog"
import { PatientDetailsSheet } from "@/modules/patients/components/patient-details-sheet"
import { PatientLoading } from "@/modules/patients/components/patient-loading"
import { PatientError } from "@/modules/patients/components/patient-error"
import { PatientEmptyState } from "@/modules/patients/components/patient-empty-state"
import { type Patient } from "@/modules/patients/patients.types"

export default function PatientsPage() {
  const [patients, setPatients] = React.useState<Patient[]>([])
  const [total, setTotal] = React.useState(0)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<'add' | 'edit'>('add')
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [selectedPatientId, setSelectedPatientId] = React.useState<string | null>(null)

  const loadPatients = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setHasError(false)

      let url = `/api/patients?page=${page}&pageSize=${pageSize}`
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`
      }

      const res = await fetch(url)
      const json = await res.json()
      console.log(json.data.rows)

      if (!res.ok) {
        throw new Error(json.error?.message ?? "Failed to load patients")
      }

      setPatients(json.data.patients || [])
      setTotal(json.data.total ?? 0)
    } catch (err) {
      console.error(err)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, searchQuery])

  React.useEffect(() => {
    loadPatients()
  }, [loadPatients])

  const handleAddPatient = () => {
    setDialogMode('add')
    setSelectedPatientId(null)
    setIsDialogOpen(true)
  }

  const handleViewPatient = (id: string) => {
    setSelectedPatientId(id)
    setIsSheetOpen(true)
  }

  const handleEditPatient = (id: string) => {
    setSelectedPatientId(id)
    setDialogMode('edit')
    setIsDialogOpen(true)
  }

  const handleArchivePatient = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to archive this patient?")
    if (!confirmed) return

    try {
      setIsLoading(true)
      const res = await fetch(`/api/patients/${id}`, {
        method: "DELETE"
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error?.message ?? "Failed to archive patient")
      }
      loadPatients()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to archive patient")
      setIsLoading(false)
    }
  }

  if (isLoading && patients.length === 0) {
    return (
      <div className="container p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <PatientLoading />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="container p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <PatientHeader onAddPatient={handleAddPatient} />
        <PatientError onRetry={loadPatients} />
      </div>
    )
  }

  const isFiltered = searchQuery.trim().length > 0
  const showEmptyState = patients.length === 0 && !isFiltered

  return (
    <div className="container p-4 sm:p-6 lg:p-2 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PatientHeader onAddPatient={handleAddPatient} />
      
      <PatientStats total={total} />
      
      {showEmptyState ? (
        <PatientEmptyState onAddPatient={handleAddPatient} />
      ) : (
        <div className="space-y-4">
          <PatientToolbar 
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q)
              setPage(1)
            }}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
            onRefresh={loadPatients}
          />
          <PatientTable 
            patients={patients}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onViewPatient={handleViewPatient}
            onEditPatient={handleEditPatient}
            onArchivePatient={handleArchivePatient}
          />
        </div>
      )}

      <PatientDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        mode={dialogMode}
        patientId={selectedPatientId}
        onSuccess={() => {
          loadPatients()
        }}
      />

      <PatientDetailsSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        patientId={selectedPatientId}
        onEdit={() => {
          setIsSheetOpen(false)
          setDialogMode('edit')
          setIsDialogOpen(true)
        }}
        onSuccess={() => {
          loadPatients()
        }}
      />
    </div>
  )
}
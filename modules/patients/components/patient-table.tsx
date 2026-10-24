"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Archive,
  ChevronLeft,
  ChevronRight,
  Users
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import { PatientAvatar } from "./patient-avatar"
import { ageFromDateOnly, formatDateOnly, formatIstDate } from "@/lib/time"
import { type Patient } from "../patients.types"

interface PatientTableProps {
  patients: Patient[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onViewPatient: (patientId: string) => void
  onEditPatient: (patientId: string) => void
  onArchivePatient: (patientId: string) => void
}

function formatGender(gender?: string | null): string {
  if (!gender || gender === "undisclosed") return "Undisclosed"
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
}

export function PatientTable({ 
  patients,
  total,
  page,
  pageSize,
  onPageChange,
  onViewPatient, 
  onEditPatient, 
  onArchivePatient 
}: PatientTableProps) {
  const router = useRouter()
  const startRange = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endRange = Math.min(page * pageSize, total)
  const totalPages = Math.ceil(total / pageSize) || 1

  if (patients.length === 0) {
    return (
      <DashboardEmptyState
        icon={Users}
        title="No patients found"
        description="No patient records match your search criteria. Try a different query."
        className="my-6"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent border-b border-border/60">
                <TableHead className="w-14 py-3 pl-4 text-xs font-medium text-muted-foreground"></TableHead>
                <TableHead className="py-3 text-xs font-medium text-muted-foreground">Name</TableHead>
                <TableHead className="py-3 text-xs font-medium text-muted-foreground">Phone</TableHead>
                <TableHead className="py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Email</TableHead>
                <TableHead className="py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Gender</TableHead>
                <TableHead className="py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Date of birth</TableHead>
                <TableHead className="py-3 text-xs font-medium text-muted-foreground hidden xl:table-cell">Registered</TableHead>
                <TableHead className="w-14 text-right py-3 pr-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => {
                const age = ageFromDateOnly(patient.dateOfBirth)
                const formattedDob = patient.dateOfBirth 
                  ? `${formatDateOnly(patient.dateOfBirth, "d MMM yyyy")}${age !== null ? ` (${age} yrs)` : ""}`
                  : "—"
                const formattedCreated = formatIstDate(patient.createdAt, "d MMM yyyy")

                return (
                  <TableRow 
                    key={patient.id} 
                    onClick={() => router.push(`/patients/${patient.id}`)}
                    className="group cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/40 h-12"
                  >
                    <TableCell className="py-3 pl-4 align-middle">
                      <PatientAvatar name={patient.fullName} className="size-8" />
                    </TableCell>
                    <TableCell className="py-3 align-middle font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                      {patient.fullName}
                    </TableCell>
                    <TableCell className="py-3 align-middle text-sm text-muted-foreground tabular-nums">
                      {patient.phone}
                    </TableCell>
                    <TableCell className="py-3 align-middle text-sm text-muted-foreground hidden md:table-cell truncate max-w-[200px]">
                      {patient.email || "—"}
                    </TableCell>
                    <TableCell className="py-3 align-middle text-sm text-muted-foreground hidden lg:table-cell">
                      {formatGender(patient.gender)}
                    </TableCell>
                    <TableCell className="py-3 align-middle text-sm text-muted-foreground tabular-nums hidden lg:table-cell">
                      {formattedDob}
                    </TableCell>
                    <TableCell className="py-3 align-middle text-sm text-muted-foreground tabular-nums hidden xl:table-cell">
                      {formattedCreated}
                    </TableCell>
                    <TableCell 
                      className="text-right py-3 pr-4 align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="size-8 text-muted-foreground hover:text-foreground"
                              aria-label="Patient actions"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem className="gap-2 text-xs" onClick={() => onViewPatient(patient.id)}>
                            <Eye className="size-4 text-muted-foreground" />
                            <span>Quick view</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-xs" onClick={() => onEditPatient(patient.id)}>
                            <Pencil className="size-4 text-muted-foreground" />
                            <span>Edit patient</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="gap-2 text-xs text-destructive focus:text-destructive"
                            onClick={() => onArchivePatient(patient.id)}
                          >
                            <Archive className="size-4" />
                            <span>Archive patient</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination component */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
        <p className="tabular-nums">
          Showing <span className="font-semibold text-foreground">{startRange}</span> to <span className="font-semibold text-foreground">{endRange}</span> of <span className="font-semibold text-foreground">{total}</span> patients
        </p>
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outline" 
            size="icon" 
            className="size-8 border-border/60" 
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = i + 1
              return (
                <Button 
                  key={p} 
                  variant={p === page ? "default" : "ghost"} 
                  size="sm" 
                  className="size-8 p-0 text-xs shadow-none tabular-nums"
                  onClick={() => onPageChange(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </Button>
              )
            })}
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="size-8 border-border/60"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

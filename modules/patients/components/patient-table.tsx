"use client"

import * as React from "react"
import { 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Archive,
  ChevronLeft,
  ChevronRight
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
import { PatientAvatar } from "./patient-avatar"
import { type Patient } from "../patients.types"

interface PatientTableProps {
  patients: Patient[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewPatient: (patientId: string) => void;
  onEditPatient: (patientId: string) => void;
  onArchivePatient: (patientId: string) => void;
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
  const startRange = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endRange = Math.min(page * pageSize, total)
  const totalPages = Math.ceil(total / pageSize) || 1

  if (patients.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 p-8 text-center text-sm text-muted-foreground bg-card">
        No patients found matching the search criteria.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px] py-4 pl-6">Avatar</TableHead>
              <TableHead className="py-4">Name</TableHead>
              <TableHead className="py-4">Phone</TableHead>
              <TableHead className="py-4 hidden md:table-cell">Email</TableHead>
              <TableHead className="py-4 hidden lg:table-cell">Gender</TableHead>
              <TableHead className="py-4 hidden lg:table-cell">Date of Birth</TableHead>
              <TableHead className="py-4 hidden xl:table-cell">Created Date</TableHead>
              <TableHead className="w-[80px] text-right py-4 pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => {
              const formattedDob = patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "Not specified"
              return (
                <TableRow key={patient.id} className="group hover:bg-muted/30 transition-colors border-border/50">
                  <TableCell className="py-4 pl-6">
                    <PatientAvatar name={patient.fullName} />
                  </TableCell>
                  <TableCell className="py-4">
                    <span 
                      className="font-medium text-sm group-hover:text-primary transition-colors cursor-pointer" 
                      onClick={() => onViewPatient(patient.id)}
                    >
                      {patient.fullName}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground">{patient.phone}</TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground hidden md:table-cell">{patient.email || "-"}</TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground capitalize hidden lg:table-cell">{patient.gender || "undisclosed"}</TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground hidden lg:table-cell">{formattedDob}</TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground hidden xl:table-cell">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right py-4 pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreHorizontal size={16} />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="gap-2" onClick={() => onViewPatient(patient.id)}>
                           <Eye size={16} className="text-muted-foreground" />
                           View Patient
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => onEditPatient(patient.id)}>
                           <Pencil size={16} className="text-muted-foreground" />
                           Edit Patient
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/5"
                          onClick={() => onArchivePatient(patient.id)}
                        >
                           <Archive size={16} />
                           Archive Patient
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

      {/* Pagination component */}
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{startRange}</span> to <span className="font-medium text-foreground">{endRange}</span> of <span className="font-medium text-foreground">{total}</span> patients
        </p>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0 border-border/50" 
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft size={16} />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = i + 1
              return (
                <Button 
                  key={p} 
                  variant={p === page ? "default" : "ghost"} 
                  size="sm" 
                  className="h-8 w-8 p-0 text-xs shadow-none"
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </Button>
              )
            })}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0 border-border/50"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}

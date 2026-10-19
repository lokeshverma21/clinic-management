"use client"

import * as React from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  CalendarPlus, 
  Pencil, 
  Phone, 
  Mail, 
  Calendar, 
  Archive, 
  Copy, 
  Check, 
  MoreVertical,
  ShieldAlert,
  UserRound
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { PatientAvatar } from "./patient-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import type { Patient } from "../patients.types"

interface PatientProfileHeaderProps {
  patient: Patient
  userRole: "owner" | "doctor" | "receptionist"
  onEdit: () => void
  onBookAppointment: () => void
  onArchive: () => void
  isArchiving?: boolean
}

export function calculateAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  if (isNaN(dob.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age >= 0 ? age : null
}

export function formatGender(gender: string | null | undefined): string {
  if (!gender || gender === "undisclosed") return "Unspecified"
  return gender.charAt(0).toUpperCase() + gender.slice(1)
}

export function PatientProfileHeader({
  patient,
  userRole,
  onEdit,
  onBookAppointment,
  onArchive,
  isArchiving = false,
}: PatientProfileHeaderProps) {
  const [copiedId, setCopiedId] = React.useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = React.useState(false)

  const age = calculateAge(patient.dateOfBirth)
  const formattedDob = patient.dateOfBirth
    ? format(new Date(patient.dateOfBirth), "MMM dd, yyyy")
    : null
  const formattedCreated = format(new Date(patient.createdAt), "MMM dd, yyyy")

  const copyPatientId = () => {
    navigator.clipboard.writeText(patient.id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  return (
    <div className="bg-card border border-border/60 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top row: Back navigation and primary actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/patients"
            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "size-7")}
            title="Back to Patients"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <span className="text-muted-foreground/60">/</span>
          <Link href="/patients" className="hover:text-foreground transition-colors font-medium">
            Patients
          </Link>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-xs">
            {patient.fullName}
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onEdit} 
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <Pencil className="size-3.5" />
            <span>Edit Patient</span>
          </Button>

          <Button 
            size="sm" 
            onClick={onBookAppointment} 
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <CalendarPlus className="size-3.5" />
            <span>Book Appointment</span>
          </Button>

          {userRole === "owner" && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon-sm" className="size-8">
                    <MoreVertical className="size-4" />
                    <span className="sr-only">More actions</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem 
                  onClick={copyPatientId} 
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Copy className="size-3.5 text-muted-foreground" />
                  <span>Copy Patient ID</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowArchiveDialog(true)}
                  className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Archive className="size-3.5" />
                  <span>Archive Patient</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Main row: Avatar, Info, and contact badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative">
            <PatientAvatar 
              name={patient.fullName} 
              className="size-14 sm:size-16 text-base font-bold ring-2 ring-border/80" 
            />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {patient.fullName}
              </h1>
              <Badge variant="outline" className="text-[11px] font-normal py-0 px-2 h-5 text-muted-foreground border-border/80">
                {formatGender(patient.gender)}
              </Badge>
              {age !== null && (
                <Badge variant="secondary" className="text-[11px] font-medium py-0 px-2 h-5">
                  {age} yrs
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <button 
                onClick={copyPatientId}
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors group cursor-pointer"
                title="Click to copy full ID"
              >
                <span className="font-mono text-[11px]">ID: {patient.id.slice(0, 8)}...</span>
                {copiedId ? (
                  <Check className="size-3 text-emerald-600" />
                ) : (
                  <Copy className="size-3 opacity-60 group-hover:opacity-100" />
                )}
              </button>

              {formattedDob && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span>DOB: {formattedDob}</span>
                  </span>
                </>
              )}

              <span className="text-muted-foreground/40">•</span>
              <span className="inline-flex items-center gap-1">
                <UserRound className="size-3" />
                <span>Registered: {formattedCreated}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Contact actions */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
          <a
            href={`tel:${patient.phone}`}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "h-8 gap-1.5 text-xs text-foreground font-medium hover:bg-secondary/80"
            )}
          >
            <Phone className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{patient.phone}</span>
          </a>

          {patient.email ? (
            <a
              href={`mailto:${patient.email}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium"
              )}
            >
              <Mail className="size-3.5 text-blue-500" />
              <span className="max-w-[160px] truncate">{patient.email}</span>
            </a>
          ) : (
            <span className="text-xs text-muted-foreground italic px-2">No email on file</span>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Archiving Patient */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="size-5" />
              <AlertDialogTitle>Archive Patient Record</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to archive <strong>{patient.fullName}</strong>?
              This is a soft delete — the patient will no longer appear in active search lists,
              but existing appointment and billing history will be preserved for compliance and audit reporting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isArchiving}
              onClick={(e) => {
                e.preventDefault()
                onArchive()
                setShowArchiveDialog(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isArchiving ? "Archiving..." : "Archive Patient"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

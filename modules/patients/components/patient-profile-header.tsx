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
  Copy, 
  Check, 
  UserRound
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { PatientAvatar } from "./patient-avatar"
import { format } from "date-fns"
import type { Patient } from "../patients.types"

interface PatientProfileHeaderProps {
  patient: Patient
  userRole: "owner" | "doctor" | "receptionist"
  onEdit: () => void
  onBookAppointment: () => void
  onArchive?: () => void
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
  if (!gender || gender === "undisclosed") return "Undisclosed"
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
}

export function PatientProfileHeader({
  patient,
  onEdit,
  onBookAppointment,
}: PatientProfileHeaderProps) {
  const [copiedId, setCopiedId] = React.useState(false)

  const age = calculateAge(patient.dateOfBirth)
  const formattedDob = patient.dateOfBirth
    ? format(new Date(patient.dateOfBirth), "d MMM yyyy")
    : null
  const formattedCreated = format(new Date(patient.createdAt), "d MMM yyyy")

  const copyPatientId = () => {
    navigator.clipboard.writeText(patient.id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  return (
    <div className="bg-card border border-border/60 rounded-lg p-5 shadow-xs space-y-4">
      {/* Top row: Back navigation and primary actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/patients"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-8")}
            aria-label="Back to patients directory"
            title="Back to patients"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <span className="text-muted-foreground/60 select-none">/</span>
          <Link href="/patients" className="hover:text-foreground transition-colors text-xs font-medium">
            Patients
          </Link>
          <span className="text-muted-foreground/60 select-none">/</span>
          <span className="text-foreground text-xs font-semibold truncate max-w-[200px] sm:max-w-xs">
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
            <span>Edit patient</span>
          </Button>

          <Button 
            size="sm" 
            onClick={onBookAppointment} 
            className="h-8 gap-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <CalendarPlus className="size-3.5" />
            <span>New appointment</span>
          </Button>
        </div>
      </div>

      {/* Main row: Avatar, Info, and contact badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <PatientAvatar 
            name={patient.fullName} 
            className="size-14 text-base font-semibold border border-border/60" 
          />

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {patient.fullName}
              </h1>
              <Badge variant="outline" className="text-xs font-normal py-0 px-2 h-5 text-muted-foreground border-border/80">
                {formatGender(patient.gender)}
              </Badge>
              {age !== null && (
                <Badge variant="secondary" className="text-xs font-medium py-0 px-2 h-5 tabular-nums">
                  {age} yrs
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <button 
                type="button"
                onClick={copyPatientId}
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                aria-label="Copy patient ID"
                title="Click to copy full ID"
              >
                <span className="text-xs tabular-nums">ID: {patient.id.slice(0, 8)}</span>
                {copiedId ? (
                  <Check className="size-3 text-success" />
                ) : (
                  <Copy className="size-3 opacity-60" />
                )}
              </button>

              {formattedDob && (
                <>
                  <span className="text-muted-foreground/40 select-none">•</span>
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Calendar className="size-3" />
                    <span>DOB: {formattedDob}</span>
                  </span>
                </>
              )}

              <span className="text-muted-foreground/40 select-none">•</span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <UserRound className="size-3" />
                <span>Registered: {formattedCreated}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Contact actions */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${patient.phone}`}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "h-8 gap-1.5 text-xs text-foreground font-medium tabular-nums"
            )}
          >
            <Phone className="size-3.5 text-muted-foreground" />
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
              <Mail className="size-3.5 text-muted-foreground" />
              <span className="max-w-[180px] truncate">{patient.email}</span>
            </a>
          ) : (
            <span className="text-xs text-muted-foreground italic px-2">No email on file</span>
          )}
        </div>
      </div>
    </div>
  )
}

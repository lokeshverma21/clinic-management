"use client"

import * as React from "react"
import Link from "next/link"
import { formatIstDate } from "@/lib/time"
import {
  Building2,
  ChevronLeft,
  MapPin,
  Phone,
  Globe,
  Calendar,
  RotateCw,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClinicStatusBadge } from "./clinic-status-badge"
import { ClinicUsageCards } from "./clinic-usage-cards"
import { ClinicOwnerCard } from "./clinic-owner-card"
import { ClinicSubscriptionCard } from "./clinic-subscription-card"
import { ClinicRecentActivity } from "./clinic-recent-activity"
import { ClinicActions } from "./clinic-actions"
import { ClinicsError } from "./clinics-error"
import type { AdminClinicDetail } from "../clinics.types"

interface ClinicDetailViewProps {
  clinicId: string;
  canWrite: boolean;
}

export function ClinicDetailView({ clinicId, canWrite }: ClinicDetailViewProps) {
  const [clinic, setClinic] = React.useState<AdminClinicDetail | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  const loadDetail = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage("")

      const res = await fetch(`/api/admin/clinics/${clinicId}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? "Failed to load clinic details")
      }

      setClinic(json.data)
    } catch (err: unknown) {
      console.error("Error loading clinic detail:", err)
      setHasError(true)
      setErrorMessage(err instanceof Error ? err.message : "Failed to load clinic detail")
    } finally {
      setIsLoading(false)
    }
  }, [clinicId])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void loadDetail()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadDetail])

  if (isLoading && !clinic) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="h-24 bg-card border rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-24 bg-card border rounded-xl" />
          <div className="h-24 bg-card border rounded-xl" />
          <div className="h-24 bg-card border rounded-xl" />
        </div>
      </div>
    );
  }

  if (hasError || !clinic) {
    return <ClinicsError onRetry={loadDetail} message={errorMessage} />;
  }

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 -ml-2 text-xs text-muted-foreground gap-1"
          render={<Link href="/admin/clinics" />}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Clinics
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between bg-card p-6 rounded-xl border border-border/60">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary shrink-0" />
                <span>{clinic.name}</span>
              </h1>
              <ClinicStatusBadge status={clinic.status} />
              {clinic.status === "suspended" && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border">
                  Suspended by: {clinic.suspensionSource === "billing" ? "Billing (automatic)" : "Admin"}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="font-mono">/{clinic.slug}</span>
              {clinic.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {clinic.phone}
                </span>
              )}
              {clinic.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {clinic.address}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {clinic.timezone}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Created {formatIstDate(clinic.createdAt, "MMM d, yyyy")}
              </span>
              {clinic.pastDueSince && (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  Past due since {formatIstDate(clinic.pastDueSince, "MMM d, yyyy")}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadDetail}
            className="text-xs h-8 gap-1.5 self-start"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Aggregate Usage Cards */}
      <ClinicUsageCards
        staffCounts={clinic.staffCounts}
        patientCount={clinic.patientCount}
        appointmentCount={clinic.appointmentCount}
      />

      {/* Administrative Actions */}
      <ClinicActions
        clinic={clinic}
        canWrite={canWrite}
        onActionComplete={loadDetail}
      />

      {/* Ownership, Subscription & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ClinicOwnerCard owners={clinic.owners} />
          <ClinicSubscriptionCard
            subscription={clinic.subscriptionSummary}
            clinicStatus={clinic.status}
            trialEndsAt={clinic.trialEndsAt}
          />
        </div>

        <div>
          <ClinicRecentActivity clinicId={clinic.id} />
        </div>
      </div>
    </div>
  );
}

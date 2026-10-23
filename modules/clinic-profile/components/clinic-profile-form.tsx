"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Building2, 
  Phone, 
  MapPin, 
  Globe, 
  Check, 
  Save, 
  ArrowRight,
  AlertCircle,
  ShieldAlert,
  Info,
  Calendar,
  Sparkles,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card"
import { DashboardDetailRow } from "@/components/dashboard/dashboard-detail-row"
import { StatusBadge } from "@/components/dashboard/dashboard-status-badge"
import { ClinicLogoUpload } from "./clinic-logo-upload"
import { OperatingHoursEditor } from "./operating-hours-editor"
import { ClinicProfileLoading } from "./clinic-profile-loading"
import { ClinicProfileError } from "./clinic-profile-error"
import { format } from "date-fns"
import type { ClinicProfile } from "../clinic-profile.types"

interface ClinicProfileFormProps {
  mode: 'onboarding' | 'settings';
  canEdit?: boolean;
}

// Common timezones for start
const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Australia/Sydney",
];

export function ClinicProfileForm({ mode, canEdit = true }: ClinicProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Form State
  const [profile, setProfile] = React.useState<Partial<ClinicProfile>>({
    name: "",
    phone: "",
    address: "",
    timezone: "Asia/Kolkata",
    logoUrl: null,
    operatingHours: null,
  });

  const loadProfile = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/clinic-profile");
      const data = await res.json();

      if (data.success && data.data?.clinic) {
        setProfile(data.data.clinic);
      } else {
        setError(data.error?.message ?? "Failed to load clinic profile");
      }
    } catch {
      setError("An unexpected error occurred while loading profile");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/clinic-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone ?? null,
          address: profile.address ?? null,
          timezone: profile.timezone,
          logoUrl: profile.logoUrl ?? null,
          operatingHours: profile.operatingHours ?? null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        if (mode === 'onboarding') {
          router.push("/dashboard");
        } else {
          setTimeout(() => setSuccess(false), 3000);
        }
      } else {
        setError(data.error?.message || "Failed to update clinic profile");
      }
    } catch {
      setError("An unexpected error occurred while saving profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ClinicProfileLoading />;
  if (error && !profile.name) return <ClinicProfileError onRetry={loadProfile} message={error} />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {!canEdit && mode === 'settings' && (
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 flex items-center gap-3 text-xs text-muted-foreground">
          <ShieldAlert className="size-4 text-muted-foreground shrink-0" />
          <span>
            You have view-only access to clinic settings. Only clinic owners can update clinic profile and configuration details.
          </span>
        </div>
      )}

      {/* Read-Only Facts in Settings Mode */}
      {mode === 'settings' && profile.slug && (
        <DashboardSectionCard
          title="Clinic Information"
          description="System identifiers and registration status"
          icon={Info}
        >
          <div className="space-y-2">
            <DashboardDetailRow
              label="Clinic Slug"
              value={profile.slug}
            />
            <DashboardDetailRow
              label="Clinic Status"
              value={<StatusBadge type="clinic" status={profile.status ?? "active"} />}
            />
            {profile.onboardingCompletedAt && (
              <DashboardDetailRow
                label="Registered Date"
                value={format(new Date(profile.onboardingCompletedAt), "d MMM yyyy")}
                icon={Calendar}
              />
            )}
            {profile.trialEndsAt && (
              <DashboardDetailRow
                label="Trial Valid Until"
                value={format(new Date(profile.trialEndsAt), "d MMM yyyy")}
                icon={Clock}
              />
            )}
          </div>
        </DashboardSectionCard>
      )}

      {/* Clinic Details */}
      <DashboardSectionCard
        title="Clinic Details"
        description="Official name and contact number for patient communications"
        icon={Building2}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="clinicName" className="text-xs font-medium text-foreground">
              Clinic Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <Input 
                id="clinicName" 
                value={profile.name ?? ""}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Hope Medical Center" 
                className="pl-9 h-9 bg-background text-xs" 
                required 
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-medium text-foreground">
              Contact Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <Input 
                id="phone" 
                value={profile.phone ?? ""}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98765 43210" 
                className="pl-9 h-9 bg-background text-xs tabular-nums" 
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>
      </DashboardSectionCard>

      {/* Address & Location */}
      <DashboardSectionCard
        title="Address & Location"
        description="Physical clinic address printed on invoices and directions"
        icon={MapPin}
      >
        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-xs font-medium text-foreground">
            Physical Address
          </Label>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input 
              id="address" 
              value={profile.address ?? ""}
              onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Health St, Medical District" 
              className="pl-9 h-9 bg-background text-xs" 
              disabled={!canEdit}
            />
          </div>
        </div>
      </DashboardSectionCard>

      {/* Timezone & Locale */}
      <DashboardSectionCard
        title="Timezone & Schedule Locale"
        description="Used for appointment times, operating schedules, and notification delivery"
        icon={Globe}
      >
        <div className="space-y-1.5 max-w-sm">
          <Label htmlFor="timezone" className="text-xs font-medium text-foreground">
            Operating Timezone
          </Label>
          <div className="relative">
            <Globe className="absolute left-2.5 top-2.5 size-4 text-muted-foreground z-10 pointer-events-none" />
            <Select 
              value={profile.timezone ?? "Asia/Kolkata"} 
              onValueChange={(val) => setProfile(prev => ({ ...prev, timezone: val || undefined }))}
              disabled={!canEdit}
            >
              <SelectTrigger id="timezone" className="pl-9 h-9 bg-background text-xs">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {COMMON_TIMEZONES.map(tz => (
                  <SelectItem key={tz} value={tz} className="text-xs">{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Appointment slots and reminder dispatches are calculated in this timezone.
          </p>
        </div>
      </DashboardSectionCard>

      {/* Branding */}
      <DashboardSectionCard
        title="Branding & Visuals"
        description="Logo displayed on invoices, appointment reminders, and clinic headers"
        icon={Sparkles}
      >
        <ClinicLogoUpload 
          value={profile.logoUrl || null} 
          disabled={!canEdit}
          onChange={(val) => setProfile(prev => ({ ...prev, logoUrl: val }))} 
        />
      </DashboardSectionCard>

      {/* Operating Hours */}
      <DashboardSectionCard
        title="Operating Schedule"
        description="Standard clinic operating hours used to guide appointment bookings"
        icon={Clock}
      >
        <OperatingHoursEditor 
          value={profile.operatingHours || null}
          disabled={!canEdit}
          onChange={(val) => setProfile(prev => ({ ...prev, operatingHours: val }))}
        />
      </DashboardSectionCard>

      {/* Error Feedback */}
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-medium">
          <AlertCircle className="size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Success Feedback */}
      {success && mode === 'settings' && (
        <div className="flex items-center gap-2.5 p-3.5 bg-success/10 border border-success/20 rounded-xl text-success text-xs font-medium">
          <Check className="size-4 shrink-0" />
          <p>Clinic profile updated successfully!</p>
        </div>
      )}

      {/* Form Actions */}
      {canEdit && (
        <div className="flex justify-end pt-2">
          <Button 
            type="submit" 
            disabled={submitting}
            className="h-9 px-5 gap-2 text-xs font-medium"
          >
            {submitting ? (
              "Saving..."
            ) : mode === 'onboarding' ? (
              <>
                <span>Continue</span>
                <ArrowRight className="size-3.5" />
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}

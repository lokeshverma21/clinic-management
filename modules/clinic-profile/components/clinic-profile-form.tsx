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
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ClinicLogoUpload } from "./clinic-logo-upload"
import { OperatingHoursEditor } from "./operating-hours-editor"
import { ClinicProfileLoading } from "./clinic-profile-loading"
import { ClinicProfileError } from "./clinic-profile-error"
import type { ClinicProfile, WeeklyHours } from "../clinic-profile.types"
import { cn } from "@/lib/utils"

interface ClinicProfileFormProps {
  mode: 'onboarding' | 'settings';
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

export function ClinicProfileForm({ mode }: ClinicProfileFormProps) {
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


  React.useEffect(() => {
      async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/clinic-profile");
        console.log(res)
        const data = await res.json();

        if (data.success) {
          setProfile(data.data?.clinic);
        } else {
          setError(data.error?.message ?? "Failed to load clinic profile");
        }
      } catch {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // console.log(profile)
      const res = await fetch("/api/clinic-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        if (mode === 'onboarding') {
          router.push("/dashboard");
        } else {
          // Keep success message for a few seconds
          setTimeout(() => setSuccess(false), 3000);
        }
      } else {
        setError(data.error?.message || "Failed to update clinic profile");
      }
    } catch (err) {
      setError("An unexpected error occurred while saving");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ClinicProfileLoading />;
  if (error && !profile.name) return <ClinicProfileError onRetry={() => {}} message={error} />;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="grid gap-6">
        {/* Basic Information Card */}
        <Card className="shadow-none border-border/60 overflow-hidden">
          <div className="bg-muted/30 px-6 py-4 border-b border-border/40">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              General Information
            </h3>
          </div>
          <CardContent className="p-6 space-y-8">
            <ClinicLogoUpload 
              value={profile.logoUrl || null} 
              onChange={(val) => setProfile(prev => ({ ...prev, logoUrl: val }))} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="clinicName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clinic Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="clinicName" 
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Hope Medical Center" 
                    className="pl-9 h-10 bg-background text-sm" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    value={profile.phone ?? ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000" 
                    className="pl-9 h-10 bg-background text-sm" 
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Physical Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="address" 
                    value={profile.address ?? ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Health St, Medical District" 
                    className="pl-9 h-10 bg-background text-sm" 
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="timezone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timezone</Label>
                <div className="relative">
                  <Globe className="absolute left-2.5 top-[11px] h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                  <Select 
                    value={profile.timezone ?? "Asia/Kolkata"} 
                    onValueChange={(val) => setProfile(prev => ({ ...prev, timezone: val || undefined }))}
                  >
                    <SelectTrigger className="pl-9 h-10 bg-background text-sm">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_TIMEZONES.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-[10px] text-muted-foreground">Used for appointment scheduling and notifications.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours Card */}
        <Card className="shadow-none border-border/60 overflow-hidden">
          <CardContent className="p-6">
            <OperatingHoursEditor 
              value={profile.operatingHours || null}
              onChange={(val) => setProfile(prev => ({ ...prev, operatingHours: val }))}
            />
          </CardContent>
        </Card>

        {/* Error Feedback */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive animate-in fade-in zoom-in duration-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Success Feedback */}
        {success && mode === 'settings' && (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 animate-in fade-in zoom-in duration-300">
            <Check className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">Profile updated successfully!</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={submitting}
            className={cn(
              "h-11 px-8 gap-2 shadow-lg transition-all active:scale-95",
              mode === 'onboarding' ? "bg-primary" : "bg-primary"
            )}
          >
            {submitting ? (
              "Saving..."
            ) : mode === 'onboarding' ? (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

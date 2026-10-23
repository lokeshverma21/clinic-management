import * as React from "react"
import { getRequestContext } from "@/lib/auth/request-context"
import { ClinicProfileHeader } from "@/modules/clinic-profile/components/clinic-profile-header"
import { ClinicProfileForm } from "@/modules/clinic-profile/components/clinic-profile-form"

export const metadata = {
  title: "Clinic Profile | ClinicSeva Settings",
  description: "Manage your clinic information and operating hours.",
};

export default async function SettingsClinicProfilePage() {
  const ctx = await getRequestContext();
  const canEdit = ctx.role === "owner";

  return (
    <div className="space-y-6">
      <ClinicProfileHeader 
        title="Clinic Profile" 
        subtitle="Manage your clinic information, branding, and operating hours." 
      />
      <ClinicProfileForm mode="settings" canEdit={canEdit} />
    </div>
  )
}

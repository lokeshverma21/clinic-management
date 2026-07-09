import * as React from "react"
import { ClinicProfileHeader } from "@/modules/clinic-profile/components/clinic-profile-header"
import { ClinicProfileForm } from "@/modules/clinic-profile/components/clinic-profile-form"

export const metadata = {
  title: "Clinic Profile | ClinicOS Settings",
  description: "Manage your clinic information and operating hours.",
};

export default function SettingsClinicProfilePage() {
  return (
    <div className="container max-w-4xl py-2 mx-auto">
      <ClinicProfileHeader 
        title="Clinic Profile" 
        subtitle="Manage your clinic information and operating hours." 
      />
      <ClinicProfileForm mode="settings" />
    </div>
  )
}

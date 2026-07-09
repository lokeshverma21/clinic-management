import * as React from "react"
import { ClinicProfileHeader } from "@/modules/clinic-profile/components/clinic-profile-header"
import { ClinicProfileForm } from "@/modules/clinic-profile/components/clinic-profile-form"

export const metadata = {
  title: "Set up your clinic | ClinicOS",
  description: "Complete your clinic profile to start using ClinicOS.",
};

export default function OnboardingClinicPage() {
  return (
    <div className="container max-w-4xl py-2 mx-auto">
      <ClinicProfileHeader 
        title="Let's set up your clinic" 
        subtitle="Complete your clinic profile to start using ClinicOS." 
      />
      <ClinicProfileForm mode="onboarding" />
    </div>
  )
}

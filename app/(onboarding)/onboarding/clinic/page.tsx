import * as React from "react"
import { ClinicProfileHeader } from "@/modules/clinic-profile/components/clinic-profile-header"
import { ClinicProfileForm } from "@/modules/clinic-profile/components/clinic-profile-form"
import { getClinicProfile } from "@/modules/clinic-profile";
import { redirect } from "next/navigation";
import { getRequestContext } from "@/lib/auth/request-context";

export const metadata = {
  title: "Set up your clinic | ClinicSeva",
  description: "Complete your clinic profile to start using ClinicSeva.",
};

export default async function OnboardingClinicPage() {
  const ctx = await getRequestContext();

  const clinic = await getClinicProfile(ctx);

  if (clinic.onboardingCompletedAt) {
      redirect("/dashboard");
  }

  return (
    <div className="container max-w-4xl py-2 mx-auto">
      <ClinicProfileHeader 
        title="Let's set up your clinic" 
        subtitle="Complete your clinic profile to start using ClinicSeva." 
      />
      <ClinicProfileForm mode="onboarding" />
    </div>
  )
}

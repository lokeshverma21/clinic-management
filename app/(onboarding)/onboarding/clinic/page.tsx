import * as React from "react"
import { ClinicProfileHeader } from "@/modules/clinic-profile/components/clinic-profile-header"
import { ClinicProfileForm } from "@/modules/clinic-profile/components/clinic-profile-form"
import { getClinicProfile } from "@/modules/clinic-profile";
import { redirect } from "next/navigation";
import { getRequestContext } from "@/lib/auth/request-context";

import { StaffPendingOnboardingView } from "@/app/(auth)/continue/staff-pending-onboarding-view";

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

  // Staff (doctor/receptionist) must never see or submit the clinic onboarding form
  if (ctx.role !== "owner") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <StaffPendingOnboardingView />
      </div>
    );
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

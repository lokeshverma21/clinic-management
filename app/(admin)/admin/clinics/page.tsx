import * as React from "react"
import { getPlatformContext } from "@/modules/admin/access"
import { ClinicsView } from "@/modules/admin/clinics/components/clinics-view"

export const metadata = {
  title: "Clinics | ClinicSeva Admin",
  description: "Platform management and overview of tenant clinics.",
}

export default async function AdminClinicsPage() {
  await getPlatformContext()

  return <ClinicsView />
}

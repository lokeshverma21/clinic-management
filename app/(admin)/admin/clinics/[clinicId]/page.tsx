import * as React from "react"
import { getPlatformContext } from "@/modules/admin/access"
import { ClinicDetailView } from "@/modules/admin/clinics/components/clinic-detail-view"

export const metadata = {
  title: "Clinic Details | ClinicSeva Admin",
  description: "Platform management, usage metrics, and account status for tenant clinic.",
}

interface PageProps {
  params: Promise<{ clinicId: string }>;
}

export default async function AdminClinicDetailPage({ params }: PageProps) {
  const ctx = await getPlatformContext()
  const { clinicId } = await params

  const canWrite = ctx.role === "super_admin"

  return <ClinicDetailView clinicId={clinicId} canWrite={canWrite} />
}

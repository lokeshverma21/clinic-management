import * as React from "react"
import { getPlatformContext } from "@/modules/admin/access"
import { SubscriptionDetailView } from "@/modules/admin/subscriptions/components/subscription-detail-view"

export const metadata = {
  title: "Subscription Details | ClinicSeva Admin",
  description: "Platform overview of clinic SaaS subscription details and plan definition.",
}

interface PageProps {
  params: Promise<{ clinicId: string }>;
}

export default async function AdminSubscriptionDetailPage({ params }: PageProps) {
  await getPlatformContext()
  const { clinicId } = await params

  return <SubscriptionDetailView clinicId={clinicId} />
}

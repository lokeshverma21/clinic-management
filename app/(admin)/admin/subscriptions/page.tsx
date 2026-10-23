import * as React from "react"
import { getPlatformContext } from "@/modules/admin/access"
import { SubscriptionsView } from "@/modules/admin/subscriptions/components/subscriptions-view"

export const metadata = {
  title: "Subscriptions | ClinicSeva Admin",
  description: "Platform management and overview of tenant SaaS subscriptions and Cashfree webhooks.",
}

export default async function AdminSubscriptionsPage() {
  await getPlatformContext()

  return <SubscriptionsView />
}

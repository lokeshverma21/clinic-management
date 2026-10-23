"use client"

import * as React from "react"
import { CreditCard, Radio, Layers } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SubscriptionsHeader } from "./subscriptions-header"
import { SubscriptionSummaryCards } from "./subscription-summary-cards"
import { SubscriptionsToolbar } from "./subscriptions-toolbar"
import { SubscriptionsTable } from "./subscriptions-table"
import { WebhookEventsTable } from "./webhook-events-table"
import { PlansTable } from "./plans-table"
import { SubscriptionsEmptyState } from "./subscriptions-empty-state"
import { SubscriptionsError } from "./subscriptions-error"
import { SubscriptionsLoading } from "./subscriptions-loading"
import type {
  AdminSubscriptionListItem,
  AdminSubscriptionSummary,
  WebhookEventListItem,
  AdminPlanListItem,
} from "../subscriptions.types"

export function SubscriptionsView() {
  const [activeTab, setActiveTab] = React.useState("subscriptions")

  // Subscriptions Tab State
  const [subscriptions, setSubscriptions] = React.useState<AdminSubscriptionListItem[]>([])
  const [summary, setSummary] = React.useState<AdminSubscriptionSummary | null>(null)
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(20)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [status, setStatus] = React.useState("")
  const [plan, setPlan] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  // Webhook Events Tab State
  const [webhookEvents, setWebhookEvents] = React.useState<WebhookEventListItem[]>([])
  const [webhookTotal, setWebhookTotal] = React.useState(0)
  const [webhookPage, setWebhookPage] = React.useState(1)
  const [webhookPageSize] = React.useState(20)
  const [webhookLoading, setWebhookLoading] = React.useState(false)
  const [webhookError, setWebhookError] = React.useState("")

  // Plans Tab State
  const [plans, setPlans] = React.useState<AdminPlanListItem[]>([])
  const [plansLoading, setPlansLoading] = React.useState(false)
  const [plansError, setPlansError] = React.useState("")

  // 1. Fetch Subscriptions
  const loadSubscriptions = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage("")

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })

      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (status) params.set("status", status)
      if (plan) params.set("plan", plan)

      const res = await fetch(`/api/admin/subscriptions?${params.toString()}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? "Failed to load subscriptions")
      }

      setSubscriptions(json.data.subscriptions ?? [])
      setTotal(json.data.total ?? 0)
      if (json.data.summary) {
        setSummary(json.data.summary)
      }
    } catch (err: unknown) {
      console.error("Error loading subscriptions:", err)
      setHasError(true)
      setErrorMessage(err instanceof Error ? err.message : "Failed to load subscriptions")
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, searchQuery, status, plan])

  // 2. Fetch Webhook Events
  const loadWebhookEvents = React.useCallback(async () => {
    try {
      setWebhookLoading(true)
      setWebhookError("")

      const params = new URLSearchParams({
        page: String(webhookPage),
        pageSize: String(webhookPageSize),
      })

      const res = await fetch(`/api/admin/subscriptions/webhook-events?${params.toString()}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? "Failed to load webhook events")
      }

      setWebhookEvents(json.data.events ?? [])
      setWebhookTotal(json.data.total ?? 0)
    } catch (err: unknown) {
      console.error("Error loading webhook events:", err)
      setWebhookError(err instanceof Error ? err.message : "Failed to load webhook events")
    } finally {
      setWebhookLoading(false)
    }
  }, [webhookPage, webhookPageSize])

  // 3. Fetch Plans Catalog
  const loadPlans = React.useCallback(async () => {
    try {
      setPlansLoading(true)
      setPlansError("")

      const res = await fetch("/api/admin/subscriptions/plans")
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? "Failed to load plans catalog")
      }

      setPlans(json.data.plans ?? [])
    } catch (err: unknown) {
      console.error("Error loading plans catalog:", err)
      setPlansError(err instanceof Error ? err.message : "Failed to load plans")
    } finally {
      setPlansLoading(false)
    }
  }, [])

  // Initial load
  React.useEffect(() => {
    const timer = setTimeout(() => {
      void loadSubscriptions()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadSubscriptions])

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatus("")
    setPlan("")
    setPage(1)
  }

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setPage(1)
  }

  const handleStatusChange = (val: string) => {
    setStatus(val)
    setPage(1)
  }

  const handlePlanChange = (val: string) => {
    setPlan(val)
    setPage(1)
  }

  const handleTabChange = (val: string | null) => {
    const nextTab = val ?? "subscriptions"
    setActiveTab(nextTab)
    if (nextTab === "webhooks") {
      void loadWebhookEvents()
    } else if (nextTab === "plans") {
      void loadPlans()
    }
  }

  const hasActiveFilters = Boolean(searchQuery.trim() || status || plan)

  if (isLoading && subscriptions.length === 0 && !summary) {
    return <SubscriptionsLoading />
  }

  return (
    <div className="space-y-6">
      <SubscriptionsHeader totalCount={total} />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions" className="gap-1.5">
            <CreditCard className="size-3.5" />
            <span>Subscriptions</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-1.5">
            <Radio className="size-3.5" />
            <span>Webhook Events</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="gap-1.5">
            <Layers className="size-3.5" />
            <span>Plan Catalog</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Subscriptions */}
        <TabsContent value="subscriptions" className="space-y-4">
          {summary && <SubscriptionSummaryCards summary={summary} />}

          <SubscriptionsToolbar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            status={status}
            onStatusChange={handleStatusChange}
            plan={plan}
            onPlanChange={handlePlanChange}
            onReset={handleResetFilters}
          />

          {hasError ? (
            <SubscriptionsError onRetry={loadSubscriptions} message={errorMessage} />
          ) : total === 0 && !hasActiveFilters ? (
            <SubscriptionsEmptyState />
          ) : (
            <SubscriptionsTable
              subscriptions={subscriptions}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          )}
        </TabsContent>

        {/* Tab 2: Webhook Events */}
        <TabsContent value="webhooks" className="space-y-4">
          {webhookError ? (
            <SubscriptionsError onRetry={loadWebhookEvents} message={webhookError} />
          ) : webhookLoading && webhookEvents.length === 0 ? (
            <div className="h-64 bg-card border border-border/60 rounded-xl animate-pulse" />
          ) : (
            <WebhookEventsTable
              events={webhookEvents}
              total={webhookTotal}
              page={webhookPage}
              pageSize={webhookPageSize}
              onPageChange={setWebhookPage}
            />
          )}
        </TabsContent>

        {/* Tab 3: Plans Catalog */}
        <TabsContent value="plans" className="space-y-4">
          {plansError ? (
            <SubscriptionsError onRetry={loadPlans} message={plansError} />
          ) : plansLoading && plans.length === 0 ? (
            <div className="h-64 bg-card border border-border/60 rounded-xl animate-pulse" />
          ) : (
            <PlansTable plans={plans} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

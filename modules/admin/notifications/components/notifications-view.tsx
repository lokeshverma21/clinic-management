"use client";

import * as React from "react";
import { NotificationsHeader } from "./notifications-header";
import { NotificationSummaryCards } from "./notification-summary-cards";
import { TopFailureReasons } from "./top-failure-reasons";
import { NotificationsToolbar } from "./notifications-toolbar";
import { NotificationsTable } from "./notifications-table";
import { NotificationsEmptyState } from "./notifications-empty-state";
import { NotificationsError } from "./notifications-error";
import { NotificationsLoading } from "./notifications-loading";
import type {
  AdminNotificationListItem,
  AdminNotificationSummary,
} from "../notifications.types";

interface NotificationsViewProps {
  initialClinicId?: string;
}

export function NotificationsView({ initialClinicId = "" }: NotificationsViewProps) {
  const [notifications, setNotifications] = React.useState<AdminNotificationListItem[]>([]);
  const [summary, setSummary] = React.useState<AdminNotificationSummary | null>(null);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(20);

  // Filters state
  const [status, setStatus] = React.useState("");
  const [channel, setChannel] = React.useState("");
  const [type, setType] = React.useState("");
  const [onlyOverdue, setOnlyOverdue] = React.useState(false);
  const [clinicId, setClinicId] = React.useState(initialClinicId);
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  // Loading & error state
  const [isLoading, setIsLoading] = React.useState(true);
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const loadNotifications = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

      if (status) params.set("status", status);
      if (channel) params.set("channel", channel);
      if (type) params.set("type", type);
      if (onlyOverdue) params.set("onlyOverdue", "true");
      if (clinicId.trim()) params.set("clinicId", clinicId.trim());
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (page === 1) params.set("includeSummary", "true");

      const res = await fetch(`/api/admin/notifications?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? "Failed to load notifications");
      }

      const listData = json.data.list;
      setNotifications(listData?.notifications ?? []);
      setTotal(listData?.total ?? 0);

      if (json.data.summary) {
        setSummary(json.data.summary);
      }
    } catch (err: unknown) {
      console.error("Error loading notifications:", err);
      setHasError(true);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load notifications data",
      );
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [page, pageSize, status, channel, type, onlyOverdue, clinicId, from, to]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void loadNotifications();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadNotifications]);

  const handleResetFilters = () => {
    setStatus("");
    setChannel("");
    setType("");
    setOnlyOverdue(false);
    setClinicId("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const handleChannelChange = (val: string) => {
    setChannel(val);
    setPage(1);
  };

  const handleTypeChange = (val: string) => {
    setType(val);
    setPage(1);
  };

  const handleOnlyOverdueChange = (val: boolean) => {
    setOnlyOverdue(val);
    setPage(1);
  };

  const handleClinicIdChange = (val: string) => {
    setClinicId(val);
    setPage(1);
  };

  const handleFromChange = (val: string) => {
    setFrom(val);
    setPage(1);
  };

  const handleToChange = (val: string) => {
    setTo(val);
    setPage(1);
  };

  if (isInitialLoad && isLoading) {
    return <NotificationsLoading />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <NotificationsHeader totalCount={total} />

      {/* Summary Cards and Top Failure Reasons */}
      {summary && (
        <div className="space-y-4">
          <NotificationSummaryCards summary={summary} />
          <TopFailureReasons reasons={summary.topFailureReasons} />
        </div>
      )}

      {/* Filter Toolbar */}
      <NotificationsToolbar
        status={status}
        onStatusChange={handleStatusChange}
        channel={channel}
        onChannelChange={handleChannelChange}
        type={type}
        onTypeChange={handleTypeChange}
        onlyOverdue={onlyOverdue}
        onOnlyOverdueChange={handleOnlyOverdueChange}
        clinicId={clinicId}
        onClinicIdChange={handleClinicIdChange}
        from={from}
        onFromChange={handleFromChange}
        to={to}
        onToChange={handleToChange}
        onReset={handleResetFilters}
      />

      {/* Main Content Area */}
      {hasError ? (
        <NotificationsError
          message={errorMessage}
          onRetry={() => void loadNotifications()}
        />
      ) : isLoading ? (
        <div className="rounded-lg border border-border/60 p-12 text-center text-sm text-muted-foreground bg-card animate-pulse">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <NotificationsEmptyState />
      ) : (
        <NotificationsTable
          notifications={notifications}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

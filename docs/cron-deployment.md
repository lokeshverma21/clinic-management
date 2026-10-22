# Cron Deployment & Scheduling Guide

This document describes the automated background job architecture for ClinicSeva, covering the current single-cron Vercel deployment and the future migration path to a dedicated Ubuntu / Linux server.

---

## Environment Variable

All cron endpoints require a shared secret passed as a Bearer token in the `Authorization` HTTP header:

- **Environment Variable**: `CRON_SECRET`
- **Request Header**: `Authorization: Bearer <CRON_SECRET>`
- **Unauthorized Response**: HTTP 401 `{"error": "Unauthorized"}`

---

## 1. Current Deployment (Vercel Hobby / Single Daily Cron)

On hosting plans that allow only **one cron execution per day**, all background tasks run through a single combined route.

### Configuration (`vercel.json`)
```json
{
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "30 2 * * *"
    }
  ]
}
```

### Route Behavior (`/api/cron/daily`)
1. **Subscription Enforcement Runs First**:
   Calls `runSubscriptionEnforcement()`. This backfills past-due timers and suspends past-due grace-expired clinics as well as expired trial clinics.
2. **Notification Processing Runs Second**:
   Calls `processDueNotifications()`. Because enforcement completed first, clinics suspended during step 1 are immediately identified as read-only, their queued notifications are marked `failed` (`CLINIC_READ_ONLY`), and no outbound emails are sent.
3. **Fault Isolation**:
   Both jobs are wrapped in independent `try/catch` blocks. If subscription enforcement encounters an unexpected error, notification dispatch still executes (and vice-versa).
4. **Response**:
   Returns HTTP 200 with `{ enforcement, notifications, errors: {} }` when both succeed, or HTTP 500 if either job reports an error.

---

## 2. Future Ubuntu Server Deployment (High-Frequency Reminders)

When migrating to an Ubuntu or dedicated Linux server (or external cron scheduler like Cloudflare Workers Cron / AWS EventBridge), you should leverage the individual routes so appointment reminders can fire near real-time (every 15 minutes).

> [!CRITICAL]
> **Mutual Exclusion**: You must **never** run `/api/cron/daily` concurrently with the individual job routes. Running both will cause redundant database executions and duplicate workload.

### Step 1: Disable Vercel Crons
Remove the `crons` entry from `vercel.json` or deploy the web service to the server:
```json
{
  "crons": []
}
```

### Step 2: Configure System Cron (`crontab -e`)
On the Ubuntu server, configure `cron` to invoke the individual routes using `curl`:

```bash
# Set your application base URL and cron secret
APP_URL="https://your-domain.com"
CRON_SECRET="your-secure-cron-secret-here"

# 1. Enforce subscriptions and trials once daily at 03:00 UTC
0 3 * * * curl -s -f -X GET "$APP_URL/api/cron/enforce-subscriptions" -H "Authorization: Bearer $CRON_SECRET" >> /var/log/clinic-cron-enforcement.log 2>&1

# 2. Process due appointment notification emails every 15 minutes
*/15 * * * * curl -s -f -X GET "$APP_URL/api/cron/process-notifications" -H "Authorization: Bearer $CRON_SECRET" >> /var/log/clinic-cron-notifications.log 2>&1
```

### Alternative: Systemd Timers
Alternatively, define two `systemd` timer units:
- `clinic-enforcement.timer`: Daily schedule (`OnCalendar=*-*-* 03:00:00 UTC`).
- `clinic-notifications.timer`: 15-minute cadence (`OnCalendar=*:0/15`).

---

## 3. Route Summary

| Endpoint | Recommended Schedule (Ubuntu) | Purpose |
| :--- | :--- | :--- |
| `/api/cron/daily` | **Disabled** on Ubuntu | Combined daily runner for single-cron hosting environments. |
| `/api/cron/enforce-subscriptions` | `0 3 * * *` (Daily) | Backfills `pastDueSince`, suspends grace-expired and trial-expired clinics. |
| `/api/cron/process-notifications` | `*/15 * * * *` (Every 15 min) | Dispatches due appointment reminders (24h and 1h) and flags failed records. |

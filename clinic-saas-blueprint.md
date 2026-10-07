# ClinicOS — Multi-Tenant Clinic Management SaaS
## Complete Software Blueprint

**Document status:** Living document, built chapter by chapter.
**How to read this:** Read top to bottom the first time. After that, use it as a reference — jump to the part you need.

---

## Table of Contents

**PART 1 — Product Vision** *(this chapter)*
Problem statement, goals, mission, target audience, business model, competitors, USP, success metrics

**PART 2 — Complete System Architecture**
High/low level diagrams, layers, request/response lifecycle, architecture decisions

**PART 3 — Technology Stack**
Every technology explained: what it is, why chosen, alternatives, tradeoffs

**PART 4 — Folder Structure**
Every folder and file explained, feature-first architecture

**PART 5 — Coding Standards**
Naming, git strategy, clean code rules, SOLID/DRY/KISS/YAGNI

**PART 6 — Database Design**
Every table: columns, relationships, indexes, constraints, ER diagram

**PART 7 — Authentication**
Clerk-based signup/login, sessions, RBAC, tenant resolution

**PART 8 — Multi-Tenant Architecture**
Tenant isolation, memberships, roles, permissions, cross-tenant protection

**PART 9 — Modules** (one chapter each)
Dashboard · Patients · Appointments · Staff/Employees · Notifications · Billing & Subscriptions (platform→clinic) · Invoices (clinic→patient) · Reports · Clinic Profile · Settings

**PART 10 — Notification System**
Engine, templates, providers, retries, logs

**PART 11 — WhatsApp Integration**
Embedded signup, OAuth, templates, webhooks

**PART 12 — API Documentation**
Every endpoint documented in full

**PART 13 — Frontend**
Routing, components, forms, tables, states, accessibility

**PART 14 — Backend**
Services, repositories, business logic, transactions

**PART 15 — Caching**
Redis strategy, keys, invalidation

**PART 16 — Background Jobs**
BullMQ queues, retries, scheduling

**PART 17 — Security**
OWASP Top 10, encryption, audit logs, HIPAA-style considerations for patient data

**PART 18 — Testing**
Unit, integration, E2E, checklist

**PART 19 — Deployment**
Environments, CI/CD, backups, disaster recovery

**PART 20 — Future Roadmap**
V1 → V2 → V3, enterprise, AI, mobile

**PART 21 — Developer Guide**
How to add a module, API, migration, notification, role

**PART 22 — Decision Log**
Every major decision with reasoning

---

**Delivery plan:** This document is long by design. I'll build it part by part across replies — say "continue" after each one and I'll add the next part directly into this same file, so you always have one complete, growing document.

---

# PART 1 — Product Vision

## 1. Purpose

This chapter defines **what ClinicOS is, why it exists, and who it's for**, before a single line of code or database table is designed. Every later technical decision (Part 2 onward) traces back to something written here. If a future decision doesn't serve something in this chapter, that's a signal the decision needs re-examining.

## 2. Why This Exists

Small and mid-size clinics (dental, physiotherapy, dermatology, general practice, diagnostic centers, single-doctor clinics, small multi-doctor practices) mostly run on one of three things today:

- **A paper register / physical diary** — no reminders, no data backup, no reporting, receptionist has to manually call patients.
- **A generic tool not built for clinics** — spreadsheets, WhatsApp Business app used manually, or a generic booking tool (like ones built for salons/restaurants) that doesn't understand clinical concepts like patient history, doctor availability across multiple rooms, or treatment records.
- **An expensive enterprise Hospital Management System (HMS)** — built for hospitals with 100+ beds, sold with long contracts, expensive onboarding, and way more complexity than a 1–10 doctor clinic needs.

There's a gap in the middle: **a clinic with 1–20 staff that wants appointments, patient records, and automatic WhatsApp reminders — without hiring an IT team or paying enterprise prices.**

ClinicOS exists to fill that gap.

## 3. Problem Statement

> Small and mid-size clinics lose revenue and patient trust because they don't have an affordable, easy-to-use system to manage appointments, reduce no-shows, and keep patient records organized — and staff turnover means whatever system they use must be learnable in minutes, not weeks.

Broken into concrete pain points:

| Pain Point | Consequence |
|---|---|
| No automated reminders | Patients forget appointments → no-shows → lost revenue |
| Manual scheduling (register/Excel) | Double-booking, wasted receptionist time |
| Patient history scattered (paper, WhatsApp chats, memory) | Poor continuity of care, repeated questions, errors |
| No multi-staff visibility | Doctors don't know their day until they arrive |
| No reporting | Clinic owner doesn't know revenue trends, busiest hours, no-show rate |
| Enterprise HMS too complex/expensive | Small clinics stay on paper indefinitely |

## 4. Goals

**Product goals (what the software must do):**
1. Let a clinic get from signup to taking its first booked appointment in under 15 minutes, with no training call required.
2. Reduce no-shows through automatic WhatsApp reminders.
3. Give every staff role (owner, doctor, receptionist) a view suited to their job — not one generic screen for everyone.
4. Store patient records in one place, safely, per-clinic.
5. Let a clinic owner see, at a glance, how their clinic is doing (appointments today, revenue this month, no-show rate).

**Business goals (what the company must achieve):**
1. Recurring monthly revenue per clinic (subscription SaaS model).
2. Low customer acquisition cost through self-serve signup (no mandatory sales calls for small clinics).
3. High retention through daily-use stickiness — once a clinic's appointment book lives in ClinicOS, switching cost is high.
4. A pricing ladder that lets a 1-doctor clinic afford entry, while multi-location clinic chains pay significantly more (this defines the pricing/tiering logic covered in Part 9 — Billing & Subscriptions).

## 5. Mission

**To become the operating system that small and mid-size clinics run their front desk on — so that no patient is forgotten and no doctor's day is a surprise.**

## 6. Long-Term Vision

Year 1: Appointments, patients, staff, WhatsApp notifications, basic invoicing, basic reports — for single and multi-branch clinics.

Year 2–3: Treatment/prescription records, patient self-service booking portal, payment collection (online prepayment for appointments), inventory for consumables (for clinics that stock medicine/supplies), insurance claim basics.

Year 3+: An ecosystem — public API so other health-tech tools can plug in, a marketplace of clinic-specific add-ons (lab integration, pharmacy integration), and enterprise features for clinic chains (10+ locations) such as centralized reporting and role hierarchies across branches.

This long-term vision is why **multi-tenancy and role-based permissions are designed from day one** (Part 8) even though V1 only needs basic roles — retrofitting multi-tenant isolation later is far more expensive than building it in from the start.

## 7. Target Audience

**Primary (V1 focus):**
- Independent clinics with 1–5 doctors (dental, physio, dermatology, pediatrics, general physicians, diagnostic/small labs).
- Owner is usually the doctor themselves, or a doctor + a receptionist/admin.
- Low technical literacy assumed — the software must be self-explanatory.

**Secondary (later phases):**
- Small multi-branch clinic chains (2–10 locations) needing centralized visibility.
- Wellness/aesthetic clinics (similar workflow to medical clinics, slightly different vocabulary — "treatments" vs "diagnosis").

**Explicitly NOT the target (at least for V1):**
- Large hospitals (100+ beds, ICU, insurance-heavy billing, complex inpatient workflows) — different product entirely (true HMS).
- Telemedicine-only providers — different core workflow (video consultation infra, not physical appointment booking).

## 8. Industries

Primary: **Outpatient healthcare** — dental clinics, physiotherapy centers, dermatology/skin clinics, general physician clinics, pediatric clinics, diagnostic/pathology centers, eye clinics, ENT clinics.

Adjacent (same workflow shape, different vocabulary — good expansion targets later): wellness centers, aesthetic/cosmetic clinics, veterinary clinics, mental health/counseling practices.

## 9. Business Model

**Model: B2B SaaS, subscription-based, per-clinic monthly billing.**

- Each **clinic** is a paying tenant (not each individual user — the clinic pays, and its staff use the account under it).
- **Tiered pricing**, typically driven by: number of staff/doctor seats, number of branches, and feature tier (e.g., WhatsApp notifications may be a paid add-on due to per-message cost passed through from WhatsApp/Meta).
- **Free trial** (time-boxed, e.g. 14 days) to let a clinic experience real value (fill a real week of appointments) before paying — no long sales cycle needed for small clinics.
- Billing itself is a first-class module (Part 9), not an afterthought — since **the business only survives if this part works reliably.**

Why subscription instead of one-time license or per-appointment transaction fee:
- **Subscription (chosen):** Predictable revenue, aligns price with ongoing value (support, WhatsApp delivery, storage, updates), industry-standard for SaaS, easy for clinic to budget monthly.
- **One-time license (rejected):** No recurring revenue, no incentive for us to keep improving the product, clinics wouldn't get updates/support without renegotiating.
- **Per-appointment fee (rejected for now):** Punishes clinics for being successful (more patients = more fees), unpredictable cost makes clinics hesitant to adopt, harder for a clinic owner to budget. May be reconsidered later as an *add-on* (e.g., per-WhatsApp-message cost), but not as the core pricing model.

## 10. Competitor Analysis

| Competitor type | Example pattern | Strength | Weakness (what ClinicOS does differently) |
|---|---|---|---|
| Generic booking tools | Salon/restaurant booking software repurposed for clinics | Cheap, easy signup | Doesn't understand clinical concepts (patient history, doctor-specific scheduling, treatment continuity) |
| Enterprise HMS | Hospital-grade systems | Extremely feature-rich | Expensive, long onboarding, built for hospitals not small clinics, steep learning curve |
| Manual WhatsApp Business App | Receptionist manually messaging patients | Free, familiar | No automation, no reminders, no records, doesn't scale past a few patients/day |
| Paper/Excel | Physical register | Zero software cost | No reminders, no backup, no reporting, error-prone |

**Where ClinicOS sits:** cheaper and faster to onboard than enterprise HMS, but purpose-built for clinical workflows (unlike generic booking tools) — the middle ground that's currently underserved.

## 11. Unique Selling Proposition (USP)

1. **Built for clinics, not adapted from a generic booking tool** — patient records, doctor-specific schedules, and clinical vocabulary are first-class, not bolted on.
2. **WhatsApp-native reminders** — patients already use WhatsApp daily; ClinicOS meets them there instead of requiring a separate app download or relying on SMS (which has lower open rates and per-message costs of its own).
3. **15-minute self-serve onboarding** — no mandatory sales call, no IT team required, works from day one.
4. **Fair, transparent per-clinic pricing** that scales from a single doctor to a multi-branch chain, instead of one-size-fits-all enterprise pricing.

## 12. Why Customers Would Pay

- **Time saved:** Receptionist stops manually calling/texting every patient for reminders — this alone can save hours per week.
- **Revenue protected:** Every no-show prevented by a reminder is revenue the clinic would otherwise have lost.
- **Professional image:** Automated confirmations/reminders make even a small solo clinic feel as organized as a large one.
- **Peace of mind:** Patient records backed up and searchable, instead of living in a paper register that can be lost, damaged, or illegible.
- **Growth path:** As the clinic adds doctors or opens a second branch, the software grows with them instead of needing to be replaced.

## 13. Success Metrics

**Product-level (is the software working?):**
- Time from signup to first booked appointment (target: under 15 minutes).
- % of appointments with a reminder successfully delivered.
- No-show rate reduction for clinics before vs after adoption.
- Weekly active clinics (logging in and creating/managing appointments, not just signed up and idle).

**Business-level (is the company working?):**
- Monthly Recurring Revenue (MRR).
- Trial-to-paid conversion rate.
- Monthly churn rate (clinics canceling).
- Net Revenue Retention (existing clinics upgrading as they add staff/branches, offsetting churn).

**Why these and not others:** Vanity metrics like "total signups" are excluded as a *primary* metric because a signup that never becomes an active, paying clinic doesn't sustain the business. Every metric above ties directly back to Section 4 (Goals) and Section 9 (Business Model).

## 14. Future Vision

As outlined in Section 6, ClinicOS is designed so that today's V1 (appointments, patients, staff, notifications, basic billing) is the **foundation floor** of a larger structure — not a throwaway MVP that gets rewritten. This is why Part 8 (Multi-Tenant Architecture) and Part 6 (Database Design) are built with future modules (treatment records, payments, multi-branch reporting) in mind from the start, even though those modules aren't built until later phases.

---

## What should a developer remember?

- ClinicOS is a **B2B multi-tenant SaaS**: the clinic is the paying customer (tenant), and staff (owner, doctors, receptionists) are users *under* that tenant — this shapes every database table and permission check in the entire system.
- The core value proposition is **reducing no-shows via WhatsApp reminders** and **replacing paper/Excel with a clinic-purpose-built system** — when in doubt about a feature decision, ask "does this reduce no-shows, save staff time, or protect patient data?"
- The target user has **low technical literacy** — every feature must be usable without training. This should influence UI decisions (Part 13) as much as backend ones.
- The system must support **future growth** (multi-branch clinics, treatment records, payments) without a rewrite — so early architecture (multi-tenancy, roles) is deliberately built ahead of V1's actual feature needs.
- Business survival depends on the **billing/subscription module working flawlessly** — it is treated as a first-class module, not an afterthought, in Part 9.

---

*End of Part 1.*

---

# PART 2 — Complete System Architecture

## 1. Purpose

This chapter shows **how ClinicOS is built as a system** — the pieces, how they talk to each other, and what happens from the moment a receptionist clicks "Book Appointment" to the moment the patient gets a WhatsApp reminder. Part 1 said *what* to build; this chapter says *how the pieces fit together* so that Parts 3 onward (specific technologies, database, modules) all slot into a shared skeleton.

## 2. Why This Exists

Without an agreed system architecture written down, every developer (or AI assistant) who touches the codebase makes their own assumptions about where logic should live, how tenants are isolated, and how a request flows through the system. That leads to inconsistent code, duplicated logic, and — worst case for a multi-tenant system — **one clinic accidentally seeing another clinic's data.** This chapter exists to prevent that by fixing the shape of the system before any module is built.

## 3. Business Value

A clear architecture means: faster onboarding of new developers, safer AI-assisted coding (the AI has a fixed shape to follow instead of guessing), and — most importantly for a healthcare-adjacent product — **defensible data isolation**, which is a trust requirement for clinics handling patient data.

## 4. User Perspective

Clinic staff never see any of this — they see fast page loads, appointments that save instantly, and WhatsApp reminders that arrive on time. Architecture is invisible when done right; this chapter is entirely about making that invisibility possible.

## 5. Developer Perspective

A developer should be able to answer, without asking anyone: "If I add a new feature, which layer does the code go in? Where does validation happen? Where does the database call happen? How do I make sure this clinic can't see another clinic's data?" This chapter answers all four.

## 6. Technical Explanation — Application Layers

ClinicOS is built as a **layered monolith** (all code in one deployable application, but internally organized into clear, separated layers) rather than microservices. Each request passes through these layers in order:

```
Browser (Clinic Staff)
      ↓
Frontend (Next.js — pages, forms, tables)
      ↓
API Layer (Next.js API routes / server actions — the "front door" of the backend)
      ↓
Middleware (auth check → tenant resolution → permission check)
      ↓
Service Layer (business logic — "can this appointment be booked?")
      ↓
Repository Layer (database queries — "insert this appointment row")
      ↓
Database (PostgreSQL) ←→ Cache (Redis, for frequently-read data)
      ↓
Background Jobs (BullMQ + Redis — e.g. "send WhatsApp reminder in 24 hours")
      ↓
External Services (WhatsApp API, Cloudinary for file storage, Clerk for auth)
```

**Why a layered monolith instead of microservices (explained simply):**
A microservice architecture splits an application into many small, independently deployed services (e.g., a separate "notifications service," a separate "billing service") that talk to each other over a network. This is powerful at large scale but adds real cost: more infrastructure to manage, network calls between services that can fail, and much more complexity for a small team.

- **Layered monolith (chosen):** One codebase, one deployment, layers separated by *folders and code boundaries* instead of network boundaries. Much simpler to build, debug, and deploy for a small team. Still keeps logic organized so it *could* be split into microservices later if the company grows large enough to need it (see Part 20, Future Roadmap).
- **Microservices (rejected for now):** Would slow down early development significantly, requires DevOps expertise the team doesn't need yet, and solves a scaling problem ClinicOS doesn't have in V1 (thousands of clinics, not yet true internet-scale). Revisit only if a specific part of the system (e.g., notifications) needs to scale independently from the rest.

## 7. Architecture — Layer-by-Layer Explanation

**Frontend (Next.js):** Renders what clinic staff see — dashboard, appointment calendar, patient list, forms. Talks to the backend only through the API layer, never directly to the database. (Full detail in Part 13.)

**Backend / API Layer:** The "front door." Every request from the frontend — or from an external system like a WhatsApp webhook — enters here. This layer's only job is to receive the request, hand it to middleware, and return a response. It does **not** contain business logic itself. (Full detail in Part 14.)

**Middleware:** Runs before the actual business logic. Three checks happen here, in order:
1. **Authentication** — is this a logged-in user? (via Clerk — Part 7)
2. **Tenant resolution** — which clinic does this user belong to? (Part 8)
3. **Authorization** — does this user's role allow this action? (e.g., a receptionist can't delete a doctor's account)

**Service Layer:** Where business rules live — e.g., "an appointment cannot be booked if the doctor already has one in that time slot," or "a clinic on the free trial can't add a 6th staff member." This is the layer most developers will spend time in when building modules (Part 9).

**Repository Layer:** The *only* layer allowed to write database queries. Services never write raw SQL/ORM queries directly — they call a repository function (e.g., `appointmentRepository.create(...)`). Why: this keeps database logic in one place per table, makes it easy to change how a table is queried without touching business logic, and makes it trivial to add tenant-isolation checks in exactly one place per table (critical for Part 8).

**Database (PostgreSQL):** Stores all persistent data — clinics, staff, patients, appointments, notifications, subscriptions. Full design in Part 6.

**Cache (Redis):** Stores frequently-read, rarely-changed data temporarily in memory for speed — e.g., a clinic's list of active staff, or today's appointment count for the dashboard — so the database isn't hit on every single page load. Full strategy in Part 15.

**Background Jobs (BullMQ + Redis):** Handles work that shouldn't block the user's request — e.g., "send this WhatsApp reminder 24 hours before the appointment" is scheduled as a job, not sent synchronously while the receptionist waits for the booking form to save. Full detail in Part 16.

**External Services:** Systems ClinicOS depends on but doesn't own — Clerk (authentication), WhatsApp Cloud API (notifications), Cloudinary (file/image storage, e.g. clinic logos or patient documents later). Each is wrapped in its own internal module so that if we ever need to switch providers, only that wrapper changes — the rest of the app doesn't know or care which provider is behind it.

## 8. Data Flow — Example: Booking an Appointment

1. Receptionist fills the "Book Appointment" form in the browser and clicks Save.
2. Frontend sends a request to the API layer: `POST /api/appointments`.
3. Middleware confirms: user is logged in (Clerk session) → resolves their clinic (tenant) → confirms their role (receptionist) is allowed to book appointments.
4. API layer hands the request to the **Appointment Service**.
5. Appointment Service validates the input (is the doctor real, is the time slot in the future, is the patient real) and checks business rules (is the doctor already booked at that time?).
6. If valid, Appointment Service calls the **Appointment Repository** to insert the row into PostgreSQL — with the clinic's tenant ID attached, so it can never be queried by another clinic.
7. Appointment Service schedules a **background job**: "send WhatsApp reminder 24 hours before this appointment's start time."
8. API layer returns a success response to the frontend.
9. Frontend updates the calendar UI to show the new appointment — no page reload.
10. 24 hours before the appointment, BullMQ triggers the reminder job → calls the WhatsApp module → sends the templated message → logs the delivery status in the database (Part 10).

## 9. Request Lifecycle (Generalized)

`Browser request → Next.js routing → API route handler → Middleware (auth → tenant → permission) → Service (business logic + validation) → Repository (database) → Response formatted → sent back to browser`

Every single feature in this product — no matter which module — follows this exact path. A developer building a brand-new module should never invent a different flow.

## 10. Response Lifecycle

Responses follow a **consistent shape** across the entire API, so the frontend can handle them predictably:

```json
// Success
{ "success": true, "data": { ... } }

// Failure
{ "success": false, "error": { "code": "SLOT_UNAVAILABLE", "message": "This time slot is already booked." } }
```

Why a consistent shape matters: the frontend can write one generic error-handling function instead of custom logic per endpoint, and error `code`s (not just messages) let the frontend show different UI for different failures (e.g., a "pick another slot" prompt specifically for `SLOT_UNAVAILABLE`).

## 11. UI Behavior

The frontend never assumes a request succeeded — every button that triggers an API call has a loading state, a success state, and an error state (detailed UI patterns in Part 13). This matters especially for low-technical-literacy users (Part 1, Section 7) — silent failures are confusing; clear feedback is not optional polish, it's core UX.

## 12. Backend Behavior

The backend is **stateless** between requests — it doesn't remember anything about a user between one API call and the next (session info comes fresh from Clerk each time). This is what allows the backend to run multiple instances behind a load balancer later (Part 19, Deployment) without users noticing.

## 13. Database Impact

Every table that stores tenant-specific data (appointments, patients, staff, etc.) has a `clinic_id` (tenant ID) column, and **every single query** that touches these tables filters by `clinic_id`. This rule is enforced at the repository layer (Section 7 above) so it's structurally impossible to forget — full detail in Part 8.

## 14. API Impact

All API routes are organized by module (`/api/appointments`, `/api/patients`, `/api/staff`, etc.) and all (except auth webhooks) sit behind the middleware chain described in Section 7. Full endpoint-by-endpoint documentation is in Part 12.

## 15. Security Considerations

- Every layer assumes the layer above it *could* be compromised or buggy — e.g., the repository layer double-checks `clinic_id` even though middleware already resolved the tenant, because defense-in-depth (multiple independent layers of protection, so one failure doesn't expose data) matters more than convenience.
- External service credentials (WhatsApp tokens, Clerk secret keys) never touch the frontend — they live only in backend environment variables (Part 19).
- Full security checklist in Part 17.

## 16. Edge Cases

- **A background job fires after a clinic has canceled its subscription** — jobs check the clinic's active status before sending (e.g., a reminder shouldn't send if the clinic account was suspended for non-payment mid-way).
- **Two receptionists book the same slot simultaneously** — handled by a database-level constraint (Part 6), not just application logic, since two requests can arrive at nearly the same instant.
- **An external service (WhatsApp API) is down** — background job retries with backoff instead of failing silently (Part 16).

## 17. Error Handling

Errors are caught at the service layer and translated into the consistent error shape (Section 10) before reaching the API layer. Raw database errors or third-party API errors are **never** passed directly to the frontend — they're logged internally (Part 19, Monitoring) and converted into a safe, user-readable message. This prevents leaking internal details (like database structure) to the browser, which is both a security and UX concern.

## 18. Performance Considerations

- Reads that don't need to be perfectly real-time (e.g., today's appointment count on the dashboard) are cached (Part 15) instead of hitting the database every page load.
- Anything that isn't needed to confirm success to the user (sending the actual WhatsApp message, generating a PDF invoice) happens in a background job, not inline in the request — so the user isn't stuck waiting on a slow third-party API.

## 19. Future Scalability

Because layers are separated by clear code boundaries (not tangled together), any layer can be scaled or even extracted into its own service later without rewriting the others — e.g., if notification volume grows huge, the background job layer could become its own deployed service while everything else stays the same. This is the direct payoff of rejecting microservices *now* while keeping the door open (Section 6).

## 20. Example Scenario

A clinic with 3 doctors signs up. Receptionist books 15 appointments across the 3 doctors for the next day. Each booking flows through Sections 8–10 above. That night, 15 background jobs fire WhatsApp reminders. Two patients don't confirm and the receptionist sees their appointments flagged as "unconfirmed" on the dashboard the next morning (cached data refreshed, Part 15) — she calls those two manually. This is the exact loop ClinicOS is built to support end-to-end without staff needing to think about any of the underlying architecture.

## Summary

ClinicOS is a layered monolith: frontend → API → middleware (auth/tenant/permission) → service (business logic) → repository (database) → database/cache, with background jobs handling anything that shouldn't block the user. Every request follows the same lifecycle; every response follows the same shape; every tenant-specific table is isolated by `clinic_id` enforced at the repository layer. This structure is deliberately simple now, with clean seams that allow scaling specific pieces later without a rewrite.

## What should a developer remember?

- **Follow the layer order.** Frontend never touches the database directly; services never write raw queries (that's the repository's job); middleware always runs before business logic.
- **Every tenant-specific query must filter by `clinic_id`** — this is the single most important rule in the entire codebase (expanded fully in Part 8).
- **Anything slow or third-party goes in a background job**, not inline in the request/response cycle.
- **Responses always follow the `{ success, data }` / `{ success: false, error }` shape** — never invent a different response format for a new endpoint.
- The monolith-vs-microservices choice was deliberate, not a shortcut — revisit only when there's a real, measured scaling problem (Part 20), not preemptively.

---

*End of Part 2.*

---

# PART 3 — Technology Stack

## Purpose & Why This Exists

This chapter explains every major technology in ClinicOS, in plain English, including *why* it was picked over alternatives. A developer (or AI assistant) should never have to guess why a piece of the stack is there — every choice below ties back to Part 1 (small clinic, low technical literacy, subscription SaaS) and Part 2 (layered monolith architecture).

## Frontend & Backend Framework: Next.js (with TypeScript)

**What it is:** Next.js is a React-based framework that lets you build both the frontend (what users see) and backend (API routes) in one project, using one language (JavaScript/TypeScript) throughout.

**Why chosen:**
- One codebase for frontend + backend means one deployment, one repo, one team skillset — fits the layered-monolith decision in Part 2.
- Built-in routing, server-side rendering, and API routes remove the need to separately choose and wire together a frontend framework, a backend framework, and a router.
- Huge ecosystem and hosting support (e.g., Vercel), which matters for a small team that doesn't want to manage servers from day one.

**Alternatives considered:**
- **Separate React SPA + Express/NestJS backend (rejected):** More flexible at large scale, but means two codebases, two deploy pipelines, and duplicated types between frontend and backend — too much overhead for the current team size.
- **Django/Rails full-stack (rejected):** Mature and batteries-included, but means the team works in a different language for backend vs. the modern React-based frontend ecosystem, and loses the shared-TypeScript-types benefit described below.

**Scaling limitations:** As traffic grows very large, a monolithic Next.js app can be scaled horizontally (running more instances) — this covers ClinicOS's needs well past thousands of clinics. Only if a specific piece (e.g., notifications) needs independent scaling would part of it be pulled out (Part 20).

**Why TypeScript specifically:** TypeScript adds "types" to JavaScript — meaning the code declares what kind of data (text, number, a specific object shape) a variable should hold, and the tool checks this *before* the code runs. For a multi-tenant system, this catches an entire category of bugs early — e.g., accidentally passing a `patientId` where a `clinicId` was expected — before it ever reaches production. Given Part 2's emphasis on tenant-isolation safety, this is treated as a non-negotiable choice, not a preference.

## Database: PostgreSQL

**What it is:** A relational database — data is stored in tables with defined columns and relationships (e.g., an `appointments` table links to a `patients` table via a `patient_id` column).

**Why chosen:**
- Clinic data (patients, appointments, billing) is inherently relational — "this appointment belongs to this patient, at this clinic, with this doctor" — which relational databases are purpose-built for.
- Strong support for constraints (Part 6) — e.g., preventing two appointments for the same doctor at the same time at the database level, not just in application code, which matters for data integrity in a system handling real patient scheduling.
- Mature, battle-tested, widely supported by every major hosting provider.

**Alternatives considered:**
- **MongoDB / NoSQL (rejected):** Better suited for unstructured or rapidly-changing data shapes. Clinic data is highly structured and relationship-heavy (patients↔appointments↔doctors↔clinics), which is exactly what a relational database is designed for — using NoSQL here would mean re-building relationship integrity in application code that Postgres gives for free.
- **MySQL (rejected, close second):** Similar capability to PostgreSQL for this use case, but PostgreSQL has stronger support for advanced constraints and data types the team anticipates needing (e.g., for future features like time-range overlap prevention).

## ORM: Drizzle

**What it is:** An ORM (Object-Relational Mapper) lets developers write database queries using TypeScript code instead of raw SQL, and — critically for this stack — Drizzle generates TypeScript types directly from the database schema, so the same type-safety benefit described above extends all the way into database queries.

**Why chosen:**
- Type-safe queries mean a typo in a column name, or a `clinic_id` filter that got dropped by accident, is caught while writing code — not discovered in production as a data leak between tenants.
- Lightweight and close to SQL (unlike heavier ORMs), meaning the team can still reason clearly about what query is actually being run — important for performance tuning later.

**Alternatives considered:**
- **Prisma (rejected, close second):** Very popular, similarly type-safe, but heavier and has historically had more overhead in serverless environments. Drizzle was chosen for being lighter-weight and closer to raw SQL, giving more control for the tenant-isolation query patterns central to this product.
- **Raw SQL with no ORM (rejected):** Would remove all type-safety benefits and make it far easier to accidentally forget a `clinic_id` filter — unacceptable risk for this product.

## Caching & Job Queue Backing Store: Redis

**What it is:** An extremely fast in-memory data store (stores data in RAM instead of on disk, making reads/writes near-instant), used here for two purposes: caching (Part 15) and as the backing store for background jobs (Part 16, via BullMQ).

**Why chosen:** Industry-standard, extremely fast, and BullMQ (below) requires Redis specifically — so one piece of infrastructure serves two purposes, reducing operational overhead for a small team.

## Background Job Queue: BullMQ

**What it is:** A library for scheduling and processing background jobs (work that happens outside the request/response cycle — e.g., "send this WhatsApp reminder 24 hours from now") using Redis as the underlying storage.

**Why chosen:** Reliable retry logic, delayed jobs (essential for scheduling reminders ahead of time), and good TypeScript support, fitting directly into the Next.js/Redis stack already chosen.

**Alternatives considered:**
- **Cron jobs only (rejected):** Cron (scheduled tasks that run at fixed times) can't easily represent "send a reminder exactly 24 hours before *this specific* appointment," which is a per-record, dynamically-scheduled need — BullMQ's delayed jobs handle this naturally; plain cron would require re-inventing this logic.
- **Third-party job service (rejected for now):** Adds external dependency and cost before it's needed; BullMQ + Redis (already in the stack) is sufficient at current scale.

## Authentication: Clerk

**What it is:** A hosted authentication provider — handles signup, login, password resets, session management, and multi-factor authentication, so the team doesn't build and maintain this security-critical code from scratch.

**Why chosen:** Authentication bugs are catastrophic (account takeover, data leaks) — using a specialized, audited provider is safer than a small team hand-rolling auth. Clerk also has strong support for the "organizations" concept, which maps naturally onto ClinicOS's clinics-as-tenants model (Part 7, Part 8).

**Alternatives considered:**
- **Build custom auth (rejected):** Significant security risk and engineering time for something that isn't a differentiator for ClinicOS — the value of the product is in clinic workflows, not in reinventing login.
- **Auth0 / Firebase Auth (rejected, close seconds):** Both are credible alternatives; Clerk was chosen for its stronger out-of-the-box "organization" (multi-tenant) primitives, reducing custom code needed for Part 8.

## File & Image Storage: Cloudinary

**What it is:** A hosted service for storing and serving images/files (e.g., clinic logos, and later, patient documents or scanned reports), with automatic optimization (resizing, compression) for fast loading.

**Why chosen:** Avoids managing file storage infrastructure directly; automatic image optimization matters for clinic staff on varying internet speeds (Part 1, low-technical-literacy/low-friction requirement extends to performance too).

**Alternatives considered:**
- **Self-hosted storage on the server (rejected):** Adds operational burden (backups, scaling storage) that a hosted service handles automatically.
- **Amazon S3 directly (rejected for now):** More control, lower cost at very large scale, but requires building the optimization/transformation layer Cloudinary provides out of the box. May be revisited in Part 20 if storage costs grow significant at scale.

## Messaging: WhatsApp Cloud API (Meta)

**What it is:** Meta's official API for sending/receiving WhatsApp messages programmatically, used for appointment confirmations and reminders (full detail in Part 11).

**Why chosen:** Directly serves the core USP from Part 1 (Section 11) — patients already use WhatsApp daily, so reminders arrive somewhere they'll actually see them, unlike email (often ignored) or a native app (nobody will download one just for a clinic).

## What should a developer remember?

- Every technology choice traces back to Part 1 (small clinic, non-technical staff, subscription SaaS) or Part 2 (layered monolith, type-safety for tenant isolation) — if a new library is proposed later, it should be justified the same way.
- **TypeScript + Drizzle's type-safety is treated as a security feature, not a nice-to-have** — it's the first line of defense against tenant-isolation bugs.
- Redis is intentionally reused for two purposes (caching and job queue) to minimize infrastructure for a small team — don't introduce a second cache/queue technology without strong justification.
- Every external service (Clerk, Cloudinary, WhatsApp) is wrapped in its own internal module (Part 2, Section 7) so it can be swapped later without touching the rest of the app.

---

# PART 4 — Folder Structure

## Purpose & Why This Exists

This chapter is the map of the codebase. A developer — or an AI coding assistant — should be able to look at any file path and immediately know what belongs there, and look at any new feature and immediately know where its files should go. This directly implements the layered architecture from Part 2 as an actual folder layout.

## Guiding Principle: Feature-First, Not Type-First

**Feature-first (chosen):** Files are grouped by *what business feature they belong to* (e.g., everything about appointments lives in one `appointments` folder — its UI, its API route, its service, its repository).

**Type-first (rejected):** Files grouped by *technical type* (one giant `controllers` folder, one giant `services` folder, one giant `components` folder) regardless of feature.

**Why feature-first was chosen:** When a developer works on "Appointments," they open one folder and see everything related to appointments, instead of hunting across five different top-level folders. It also makes the codebase easier for an AI assistant to reason about a single module in isolation (relevant since this project explicitly plans to use AI coding assistants — Part 1). Type-first architectures tend to grow into unmanageable "God folders" (a single folder like `services/` with 80 unrelated files) as an app grows — feature-first avoids this by construction.

## Top-Level Structure

```
clinicos/
├── src/
│   ├── app/                      # Next.js routing (pages + API routes)
│   │   ├── (dashboard)/          # Authenticated app pages (grouped route)
│   │   │   ├── appointments/
│   │   │   ├── patients/
│   │   │   ├── staff/
│   │   │   ├── billing/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── (auth)/                # Sign-in / sign-up pages (Clerk)
│   │   └── api/                   # API routes, mirrors modules below
│   │       ├── appointments/
│   │       ├── patients/
│   │       ├── staff/
│   │       ├── notifications/
│   │       ├── billing/
│   │       └── webhooks/          # Clerk, WhatsApp, payment provider webhooks
│   │
│   ├── modules/                   # Feature-first business logic (the "core" of the app)
│   │   ├── appointments/
│   │   │   ├── appointment.service.ts
│   │   │   ├── appointment.repository.ts
│   │   │   ├── appointment.validation.ts   # Input validation schemas
│   │   │   ├── appointment.types.ts
│   │   │   └── components/                 # UI pieces specific to this module
│   │   ├── patients/
│   │   ├── staff/
│   │   ├── notifications/
│   │   ├── billing/
│   │   ├── invoices/
│   │   ├── reports/
│   │   └── clinic-profile/
│   │
│   ├── db/                        # Database layer
│   │   ├── schema/                # Drizzle table definitions, one file per table
│   │   ├── migrations/            # Auto-generated migration files
│   │   └── client.ts               # Database connection setup
│   │
│   ├── lib/                       # Shared, cross-module utilities
│   │   ├── auth/                  # Clerk helpers, tenant resolution
│   │   ├── cache/                 # Redis client + cache helpers
│   │   ├── queue/                 # BullMQ setup, shared queue helpers
│   │   ├── whatsapp/              # WhatsApp API wrapper
│   │   ├── storage/                # Cloudinary wrapper
│   │   └── errors/                 # Shared error classes, error formatting
│   │
│   ├── components/                # Truly generic, reusable UI (buttons, inputs, tables)
│   │   └── ui/
│   │
│   └── middleware.ts              # Next.js middleware — auth + tenant resolution entry point
│
├── tests/                         # Mirrors src/ structure (Part 18)
├── drizzle.config.ts
├── package.json
└── .env.example
```

## Explaining the Key Folders

**`src/app/`** — This is Next.js's routing folder; whatever is placed here becomes a URL. It's kept "thin" — pages here mostly just render components and call into `modules/`; they don't contain business logic themselves. The `(dashboard)` and `(auth)` folders use Next.js "route groups" (parentheses don't appear in the URL) purely to organize authenticated vs. public pages without affecting the actual URL structure.

**`src/modules/`** — This is where the real business logic lives, organized by feature, matching Part 9's module chapters exactly. Each module folder always contains the same shape: `.service.ts` (business logic — Part 2's Service Layer), `.repository.ts` (database queries — Part 2's Repository Layer), `.validation.ts` (input-checking rules), `.types.ts` (TypeScript type definitions for this module), and a `components/` folder for UI pieces that are *specific to this feature* (a generic reusable button goes in `src/components/ui`; an "Appointment Status Badge" goes in `modules/appointments/components/`).

**`src/db/schema/`** — One file per database table (e.g., `appointments.ts`, `patients.ts`). This is the single source of truth for the database structure — Drizzle reads these files to generate migrations (Part 6).

**`src/lib/`** — Anything used by *multiple* modules lives here, not duplicated inside each module. E.g., the WhatsApp wrapper (Part 11) is used by both the Notifications module and potentially the Appointments module (for sending confirmations) — it lives once in `lib/whatsapp/`, not copied into each.

**`src/middleware.ts`** — The literal entry point for Part 2's "Middleware" layer — every request passes through this file first for authentication and tenant resolution before reaching any page or API route.

## Naming Conventions

- Files: `kebab-case.ts` (e.g., `appointment-service.ts`) — except React components, which use `PascalCase.tsx` (e.g., `AppointmentCard.tsx`), matching the convention of the component name itself.
- Database tables: `snake_case`, plural (e.g., `appointments`, `clinic_staff`).
- API routes: plural nouns matching the module (e.g., `/api/appointments`, not `/api/appointment` or `/api/getAppointments`).
- TypeScript types/interfaces: `PascalCase` (e.g., `Appointment`, `CreateAppointmentInput`).

## Where Should a New File Go?

- **New business feature (e.g., "Prescriptions" module added later):** New folder under `src/modules/prescriptions/`, following the exact same internal shape (`.service.ts`, `.repository.ts`, etc.) as existing modules, plus a matching `src/app/(dashboard)/prescriptions/` page folder and `src/app/api/prescriptions/` route folder.
- **A utility used by only one module:** Stays inside that module's folder, not promoted to `lib/` until a second module needs it too (avoids premature abstraction — see YAGNI, Part 5).
- **A new external service integration:** New folder under `lib/` (following the pattern of `lib/whatsapp/`, `lib/storage/`).

## What should a developer remember?

- **Feature-first, always.** If you're unsure where a file goes, ask "what business feature does this serve?" not "what technical type is this file?"
- Every module folder has the **same internal shape** — service, repository, validation, types, components — so any developer (or AI assistant) can predict a module's structure without being told.
- `src/lib/` is for code shared **across** modules — don't put something there until at least two modules actually need it.
- The folder structure is a direct, physical implementation of Part 2's layered architecture — if you find yourself writing a database query inside a `.service.ts` file, that's a sign the layering rule (Part 2, Section 7) is being broken.

---

*End of Part 4.*

---

# PART 5 — Coding Standards

## Purpose & Why This Exists

Code style disagreements waste time and, worse, inconsistent code slows down every future developer who has to re-learn "how we do things" file by file. This chapter fixes the rules once so nobody has to decide them again.

## Code Organization

- Follow Part 4's folder structure exactly — no new top-level folders without updating this document.
- Every module's service layer function should read top-to-bottom as: validate input → check business rules → call repository → return result. Don't mix these steps out of order.

## Naming

- Variables and functions: `camelCase` (`getAppointmentById`).
- Booleans read as a question: `isActive`, `hasPaid`, `canReschedule` — not `active`, `paid`, `reschedule`.
- Functions that fetch data: prefix `get` (single) or `list` (multiple) — `getPatient(id)` vs `listPatients(clinicId)`.
- Functions that change data: `create`, `update`, `delete`, `cancel` (use the real business word — `cancelAppointment`, not `deleteAppointment`, since canceling and deleting are different business actions, Part 9).

## Imports

- Always import from a module's public surface, not its internal files directly from another module — e.g., the Billing module should import `{ getClinicSubscription } from '@/modules/billing'`, not reach into `@/modules/billing/billing.repository` directly. This keeps module boundaries real, not just a folder convention.
- Absolute imports (`@/modules/...`) instead of long relative paths (`../../../modules/...`) — configured via TypeScript path aliases.

## Error Handling

- Services throw typed, custom error classes (e.g., `SlotUnavailableError`, `SubscriptionLimitReachedError` — defined in `lib/errors/`), never generic `throw new Error("something went wrong")`. This is what allows the API layer (Part 2, Section 10) to map errors to consistent `{ code, message }` responses.
- Never silently swallow an error (empty `catch` block) — at minimum, log it (Part 19).

## Validation

- Every API route validates its input using a schema (e.g., Zod) defined in the module's `.validation.ts` file *before* any business logic runs — validation is a gate, not an afterthought scattered through the service.
- Validation schemas double as TypeScript types where possible, avoiding writing the same shape twice.

## Logging

- Log at the service layer (business events: "appointment booked," "reminder failed to send") and at the error boundary (unexpected failures) — not inside repositories (too low-level/noisy) or inside UI components (frontend logs are for debugging only, never business events).
- Never log sensitive data in plain text: no patient phone numbers, no full patient names in generic logs, no auth tokens (Part 17).

## Comments

- Comments explain **why**, not **what** — the code itself should be readable enough to show *what* it does. E.g., a good comment: `// Skip reminder if clinic subscription lapsed mid-cycle — see Part 2 Section 16`. A bad comment: `// loop through appointments` above an obvious loop.

## Git Strategy & Branching

- `main` is always deployable.
- Feature branches: `feature/appointment-reminders`, `fix/whatsapp-webhook-retry`, named after the actual feature/fix, not a ticket number alone (ticket numbers can be appended, not substituted, since a human should be able to guess what a branch does from its name).
- No direct commits to `main` — all changes via pull request, even for a solo developer, since it creates a reviewable history and a natural point to run automated checks (Part 18, Part 19).

## Commit Messages

Format: `type: short description` — e.g., `feat: add appointment reminder scheduling`, `fix: prevent double-booking on concurrent requests`, `docs: update Part 6 with invoice table`. Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.

## PR Rules

- Every PR description states: what changed, why, and how it was tested.
- A PR should be reviewable in one sitting — if a change is large, it should be split (e.g., "add database table" as one PR, "add API using that table" as a second).

## Architecture Rules (enforced, not optional)

1. Frontend never queries the database directly.
2. Services never write raw database queries — only repositories do.
3. Every tenant-specific database query filters by `clinic_id`.
4. External services (WhatsApp, Cloudinary, Clerk) are only ever called through their `lib/` wrapper, never directly from a module.

## Clean Code Principles Applied

**SOLID** *(five principles for maintainable code — explained simply below)*:
- **Single Responsibility** — a service function does one business action (e.g., `bookAppointment`, not a mega-function that books an appointment *and* sends a WhatsApp message *and* updates billing — those become separate, coordinated calls).
- **Open/Closed** — code should be extendable without modifying existing working code — e.g., adding a new notification provider (email, later) means adding a new file in `lib/notifications/providers/`, not editing the existing WhatsApp provider file.
- **Liskov Substitution** — if a module defines an interface (e.g., a "NotificationProvider" interface), any implementation of it (WhatsApp, future Email) must be swappable without breaking the code that uses it.
- **Interface Segregation** — don't force a module to depend on functions it doesn't use — e.g., the Appointments module shouldn't have to import Billing's entire service if it only needs one function from it.
- **Dependency Inversion** — high-level business logic (services) shouldn't depend on low-level details (which specific database driver) — this is exactly why the Repository layer exists as a buffer (Part 2).

**DRY (Don't Repeat Yourself):** If the same logic appears in two places, extract it — but see YAGNI below for the counterbalance.

**KISS (Keep It Simple):** Prefer the boring, obvious solution over a clever one — e.g., Part 2's monolith-over-microservices decision is KISS applied at the architecture level.

**YAGNI (You Aren't Gonna Need It):** Don't build abstraction for a future need that isn't concrete yet — e.g., don't build a generic "multi-provider notification engine" until there's a second real provider beyond WhatsApp (Part 10 still designs the *shape* to allow this, but doesn't over-engineer it before it's needed — this is the balance between good architecture and YAGNI).

## What should a developer remember?

- These rules exist to make the codebase **predictable** — a new developer or AI assistant should be able to guess how something is done before even looking, and be right.
- The four **Architecture Rules** (frontend never touches DB, services never write raw queries, every query filters by `clinic_id`, external services only via `lib/` wrappers) are the most important — violating these is treated as a bug, not a style nitpick.
- SOLID/DRY/KISS/YAGNI aren't abstract ideals — Part 2 and Part 4's actual structure are direct applications of them.

---

# PART 6 — Database Design

## Purpose & Why This Exists

This chapter is the single source of truth for every table in ClinicOS's database. Every table below directly supports a module from Part 9 and follows the tenant-isolation rule from Part 2/Part 8.

## Conventions Used Throughout

- Every table has: `id` (UUID, primary key), `created_at`, `updated_at` (timestamps).
- Every tenant-specific table has `clinic_id` (foreign key to `clinics.id`) — **non-negotiable, enforced at the repository layer.**
- Soft deletes (`deleted_at` nullable timestamp) are used for records with business/legal reasons to retain history (patients, appointments, invoices) instead of hard-deleting — a clinic may need historical records for compliance or dispute resolution. Purely operational data (e.g., cache-like tables, if any) may hard-delete.

## Table: `clinics`

**Purpose:** The tenant table — one row per paying clinic (the account).

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| name | text | Clinic display name |
| slug | text, unique | Used in URLs if needed later (e.g., patient booking portal) |
| phone | text | Clinic's own contact number |
| address | text | |
| timezone | text | Critical for correct appointment reminder scheduling |
| status | enum: `trial`, `active`, `past_due`, `suspended`, `canceled` | Drives whether background jobs (Part 2, Section 16) should run |
| trial_ends_at | timestamp, nullable | |
| created_at / updated_at | timestamp | |

**Relationships:** Parent to almost every other table via `clinic_id`.
**Indexes:** unique index on `slug`.
**Security notes:** This is the anchor of tenant isolation — every other tenant-specific table's `clinic_id` foreign key points here.

## Table: `users`

**Purpose:** One row per human who can log in — mirrors Clerk's user record (Part 7) but stores app-specific data.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| clerk_user_id | text, unique | Links to Clerk's identity |
| full_name | text | |
| email | text, unique | |
| phone | text, nullable | |
| created_at / updated_at | timestamp | |

**Note:** `users` intentionally has **no** `clinic_id` — a single human (rare, but possible: e.g., a doctor working at two clinics) can be linked to multiple clinics via the `memberships` table below. This is why membership is a separate table rather than a `clinic_id` column directly on `users` (see Part 8 for full reasoning).

## Table: `memberships`

**Purpose:** Links a `user` to a `clinic` with a specific `role` — the core of multi-tenancy (Part 8).

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| clinic_id | UUID (FK → clinics.id) | |
| user_id | UUID (FK → users.id) | |
| role | enum: `owner`, `doctor`, `receptionist` (extensible) | Part 8 covers permission mapping |
| status | enum: `active`, `invited`, `deactivated` | |
| invited_at / joined_at | timestamp, nullable | |
| created_at / updated_at | timestamp | |

**Constraints:** unique on (`clinic_id`, `user_id`) — one membership row per user per clinic.
**Indexes:** index on `clinic_id` (list all staff for a clinic), index on `user_id` (list all clinics a user belongs to).

## Table: `patients`

**Purpose:** Patient records, scoped per clinic (a patient record is clinic-owned, not a global identity — see edge case note below).

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| clinic_id | UUID (FK) | |
| full_name | text | |
| phone | text | Used for WhatsApp reminders — validated format (Part 9) |
| email | text, nullable | |
| date_of_birth | date, nullable | |
| gender | enum, nullable | |
| notes | text, nullable | General notes; a dedicated clinical-record structure is a future module (Part 20) |
| deleted_at | timestamp, nullable | Soft delete |
| created_at / updated_at | timestamp | |

**Indexes:** index on `clinic_id`, index on (`clinic_id`, `phone`) for fast duplicate-check on entry.
**Edge case note:** The same real-world person visiting two different (unrelated) clinics using ClinicOS results in two *separate* patient records, one per clinic — this is intentional for V1 (a clinic should not see another clinic's knowledge of a shared patient without explicit consent flow, which is a future enterprise/referral feature, not V1).

## Table: `staff_profiles`

**Purpose:** Clinic-specific professional details for a membership with role `doctor` (e.g., specialization, working hours) — kept separate from `memberships` because not all fields apply to every role.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| membership_id | UUID (FK → memberships.id), unique | |
| specialization | text, nullable | |
| working_hours | jsonb | e.g., `{ "mon": ["09:00-13:00","15:00-19:00"], ... }` |
| color_tag | text, nullable | For calendar UI color-coding (Part 13) |
| created_at / updated_at | timestamp | |

## Table: `appointments`

**Purpose:** The core scheduling table.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| clinic_id | UUID (FK) | |
| patient_id | UUID (FK → patients.id) | |
| doctor_membership_id | UUID (FK → memberships.id) | |
| start_time | timestamptz | |
| end_time | timestamptz | |
| status | enum: `booked`, `confirmed`, `completed`, `canceled`, `no_show` | |
| notes | text, nullable | |
| created_by_membership_id | UUID (FK → memberships.id) | Who booked it (audit trail) |
| deleted_at | timestamp, nullable | |
| created_at / updated_at | timestamp | |

**Constraints:** A database-level **exclusion constraint** (PostgreSQL feature preventing overlapping time ranges) on (`doctor_membership_id`, time range) where status is not `canceled` — this is what makes double-booking *structurally impossible*, not just discouraged by application logic (directly implements Part 2, Section 16's edge case).
**Indexes:** index on (`clinic_id`, `start_time`) for calendar queries; index on `patient_id` (patient history view).

## Table: `notifications`

**Purpose:** A record of every notification that should be/was sent (Part 10).

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| clinic_id | UUID (FK) | |
| appointment_id | UUID (FK, nullable) | Notifications can exist outside appointment context later |
| patient_id | UUID (FK) | |
| type | enum: `confirmation`, `reminder_24h`, `reminder_1h`, `cancellation` | |
| channel | enum: `whatsapp` (extensible to `email`, `sms`, `push`) | |
| status | enum: `scheduled`, `sent`, `delivered`, `failed` | |
| scheduled_for | timestamptz | |
| sent_at | timestamptz, nullable | |
| failure_reason | text, nullable | |
| created_at / updated_at | timestamp | |

**Indexes:** index on (`status`, `scheduled_for`) for the background job to efficiently find due notifications.

## Table: `subscriptions`

**Purpose:** Platform billing — what plan a clinic is on (Part 9, Billing & Subscriptions module).

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| clinic_id | UUID (FK), unique | One active subscription per clinic |
| plan | enum: `starter`, `growth`, `multi_branch` (example tiers) | |
| staff_seat_limit | integer | |
| billing_cycle | enum: `monthly`, `yearly` | |
| current_period_start / current_period_end | timestamptz | |
| payment_provider_customer_id | text | External payment provider's reference (e.g., Stripe customer ID) |
| status | enum: `trialing`, `active`, `past_due`, `canceled` | Mirrors/drives `clinics.status` |
| created_at / updated_at | timestamp | |

## Table: `invoices` (clinic → patient billing)

**Purpose:** Bills the *clinic* issues to its *patients* — distinct from `subscriptions` above (which is the clinic paying the platform).

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| clinic_id | UUID (FK) | |
| patient_id | UUID (FK) | |
| appointment_id | UUID (FK, nullable) | |
| status | enum: `draft`, `sent`, `paid`, `overdue`, `void` | |
| total_amount | numeric(10,2) | |
| currency | text | |
| issued_at / due_at | timestamp | |
| created_at / updated_at | timestamp | |

## Table: `invoice_items`

**Purpose:** Line items on an invoice (e.g., "Consultation — $50", "X-Ray — $30").

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| invoice_id | UUID (FK) | |
| description | text | |
| quantity | integer | |
| unit_price | numeric(10,2) | |
| created_at | timestamp | |

## Table: `audit_logs`

**Purpose:** Records sensitive actions for accountability (Part 17) — e.g., who deleted a patient record, who changed a staff role.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| clinic_id | UUID (FK) | |
| actor_membership_id | UUID (FK) | |
| action | text | e.g., `patient.deleted`, `staff.role_changed` |
| target_type / target_id | text / UUID | What was acted upon |
| metadata | jsonb | Extra context (e.g., old role → new role) |
| created_at | timestamp | |

## ER Diagram (Simplified)

```
clinics ──< memberships >── users
   │            │
   │            └──< staff_profiles
   │
   ├──< patients ──< appointments >── memberships (doctor)
   │                    │
   │                    └──< notifications
   ├──< subscriptions
   ├──< invoices >──< invoice_items
   └──< audit_logs
```

## Migration Strategy

Drizzle generates migration files from changes to `src/db/schema/*.ts` (Part 4). Rules:
- Never edit a migration file that has already been applied to production — write a new migration instead (migrations are append-only history, like git commits for the database).
- Every schema change goes through a PR (Part 5) with the migration file committed alongside it.
- Destructive migrations (dropping a column/table) require a two-step rollout in production: (1) stop writing to the old column in application code, deploy, confirm stable; (2) drop the column in a later migration — never in the same deploy as the code change, to allow safe rollback.

## Performance Notes

- The `appointments` table's (`clinic_id`, `start_time`) index is the single most performance-critical index in the system — nearly every dashboard/calendar query filters on this combination.
- `jsonb` columns (like `working_hours`) trade some query-ability for flexibility — acceptable here since working hours are read as a whole object, not queried column-by-column.

## What should a developer remember?

- **Every tenant-specific table has `clinic_id`, no exceptions** — if you're adding a table and unsure whether it needs one, the answer is yes unless it's explicitly a global/system table.
- The **appointments exclusion constraint** preventing double-booking is enforced by the database itself, not just application code — this is deliberate (Part 2, Section 16).
- `subscriptions` (clinic pays platform) and `invoices` (clinic bills patient) are **separate concepts, separate tables** — never conflate them in code or conversation.
- Migrations are one-directional history — fix mistakes with a new migration, never by editing an already-applied one.

---

*End of Part 6.*

---

# PART 7 — Authentication

## Purpose & Why This Exists

Authentication answers "who is this person?" — a distinct question from authorization ("what are they allowed to do?", covered in Part 8). Getting this wrong is one of the highest-risk mistakes in a multi-tenant system handling patient data, so this chapter is deliberately explicit about every step.

## Provider: Clerk (recap from Part 3)

Clerk handles the actual credential storage, password hashing, session tokens, and multi-factor authentication — ClinicOS never stores passwords itself. This removes an entire category of risk (password database breaches) from the team's responsibility.

## Signup Flow

1. A new clinic owner visits the signup page and creates an account via Clerk (email/password or social login, depending on configuration).
2. Clerk creates the identity and issues a session.
3. A **Clerk webhook** (`user.created`) fires to ClinicOS's backend.
4. The webhook handler creates a corresponding row in the internal `users` table (Part 6), linked via `clerk_user_id`.
5. Because this is the *first* user for a brand-new clinic (not an invited staff member joining an existing one), the same signup flow also creates: a new `clinics` row (status: `trial`), and a `memberships` row linking this user to that clinic with role `owner`.
6. The user is redirected into the app, already fully set up — matching Part 1's "under 15 minutes to first appointment" goal.

**Why creation happens via webhook, not directly in the signup form's response handler:** Webhooks are the *source of truth* event from Clerk — relying on it (rather than assuming the frontend's signup call succeeded) means the internal `users` row is created reliably even if, e.g., the user closes the browser tab immediately after Clerk creates their account but before the frontend finishes its own follow-up call.

## Staff Invitation Flow (Joining an Existing Clinic)

1. A clinic owner or admin invites a staff member by email from the Staff module (Part 9).
2. ClinicOS creates a `memberships` row with status `invited` (no `user_id` yet, or linked to a placeholder) and sends an invite email/link via Clerk's invitation system.
3. The invited person clicks the link, creates their Clerk account (or logs in if they already have one — relevant for a doctor working across two clinics, Part 6).
4. On successful signup/login through the invite link, the webhook handler updates the `memberships` row: sets `user_id`, status → `active`, `joined_at` → now.

**Why this two-step (invite row first, user fills in later) instead of creating the user immediately:** It lets the clinic owner set the *role* before the person even has an account, and cleanly represents "invited but not yet joined" as a real state in the data (useful for the Staff module UI, Part 9, showing pending invites).

## Login / Logout

Standard Clerk-hosted or embedded login UI. On successful login, Clerk issues a session (a signed token proving identity, stored in a cookie). Logout clears the Clerk session; ClinicOS doesn't need custom logout logic since it never manages sessions directly.

## Sessions, Cookies, and JWTs

Clerk manages sessions via secure, httpOnly cookies (cookies that JavaScript in the browser can't read, reducing XSS risk — Part 17) containing a signed JWT (JSON Web Token — a compact, verifiable token proving who the user is, without ClinicOS's server needing to look it up in a database on every single request). On each request, Clerk's middleware verifies the JWT's signature and expiry.

## Middleware & Protected Routes

`src/middleware.ts` (Part 4) runs before every request to `(dashboard)` routes and API routes:

1. **Clerk auth check** — is there a valid session? If not, redirect to login.
2. **Tenant resolution** — look up the user's `memberships` (Part 6) to determine which clinic they're acting as. If a user belongs to only one clinic (the common case), this is automatic. If a user belongs to multiple clinics (rare — e.g., a doctor at two clinics), the frontend must have an explicit "acting as [Clinic Name]" selector, and the currently-selected clinic is stored in the session (Part 8 covers this in full).
3. **Authorization check** — is this membership's `role` allowed to perform the requested action? (Part 8)

Public routes (marketing site, signup/login pages, WhatsApp webhook endpoint) explicitly bypass steps 1–3, but the WhatsApp webhook uses its own separate verification (a signature check from Meta, not a user session — Part 11).

## Webhooks (Clerk → ClinicOS)

| Event | ClinicOS Action |
|---|---|
| `user.created` | Create internal `users` row; if first signup, also create `clinics` + owner `membership` |
| `user.updated` | Sync name/email changes to internal `users` row |
| `user.deleted` | Deactivate all `memberships` for this user (never hard-delete — audit trail, Part 6) |

All webhook endpoints verify Clerk's signature header before processing — an unverified webhook call is a spoofing risk (Part 17).

## RBAC (Role-Based Access Control) — Preview

Full permission mapping lives in Part 8, but the roles introduced here are: `owner` (full access, billing, staff management), `doctor` (their own appointments/patients, limited staff visibility), `receptionist` (booking, patient management, no billing/staff-role access). Authentication (this chapter) only determines *who* the user is; Part 8 determines *what* their role permits.

## Internal User Creation Summary

The **only** path that creates a `users` row is the Clerk `user.created` webhook — application code never inserts into `users` directly from a form handler. This guarantees the internal table can never drift out of sync with Clerk's identity source of truth.

## Security Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Stolen session cookie | httpOnly + secure cookies (JS can't read them, only sent over HTTPS); short session expiry with refresh |
| Webhook spoofing | Signature verification on every webhook (Clerk and WhatsApp both) |
| Privilege escalation (a receptionist editing their own role) | Role changes only allowed via a dedicated, owner-only endpoint — never as a general-purpose "update membership" field editable by the member themselves |
| Cross-tenant session confusion (multi-clinic user acting on the wrong clinic) | Actively-selected clinic is explicit and visible in the UI at all times (Part 13), never silently assumed |

## What should a developer remember?

- **ClinicOS never stores or handles raw passwords** — that's entirely Clerk's job.
- The internal `users` table is a **mirror**, kept in sync only via verified webhooks — never written to directly from signup/invite form handlers.
- Every request to a protected route passes through **three checks in order**: authenticated → tenant resolved → authorized. Skipping or reordering these is a security bug, not a style issue.
- A user can belong to multiple clinics (via multiple `memberships` rows) — never assume `1 user = 1 clinic` when writing tenant-resolution code.

---

# PART 8 — Multi-Tenant Architecture

## Purpose & Why This Exists

This is the chapter that protects the single most important promise ClinicOS makes to its customers: **Clinic A can never see Clinic B's data.** Everything here formalizes rules that Parts 2, 6, and 7 already referenced — this chapter is where they're made explicit and complete.

## Tenant Isolation Strategy: Shared Database, `clinic_id` Column

**Chosen approach — shared database, row-level isolation:** All clinics' data lives in the same PostgreSQL database and the same tables, with every tenant-specific row carrying a `clinic_id` column (Part 6). Isolation is enforced by *always* filtering by `clinic_id` in every query, at the repository layer (Part 2).

**Alternatives considered:**
- **Database-per-tenant (rejected):** Each clinic gets its own separate database. Extremely strong isolation, but operationally very heavy — running migrations across potentially thousands of separate databases, and much higher hosting cost, for a level of isolation that row-level filtering already achieves correctly when implemented consistently.
- **Schema-per-tenant (rejected):** A middle ground (one Postgres instance, separate schema per clinic) — still adds real migration/connection-management complexity for marginal extra isolation benefit at ClinicOS's target scale (small-to-mid clinics, not e.g. government/enterprise clients requiring literal physical data separation).

**Why shared-database-with-`clinic_id` is acceptable here:** Combined with (a) the repository-layer enforcement rule (Part 2), (b) TypeScript type-safety catching missing filters at compile time where possible (Part 3), and (c) the audit logging in Part 6, this gives strong practical isolation without the operational cost of separate databases. If a future enterprise customer specifically requires physical data separation (e.g., a large hospital chain with strict compliance requirements), a database-per-tenant option can be offered as a premium enterprise tier (Part 20) without re-architecting the whole product.

## The Golden Rule

> **Every database query that touches a tenant-specific table must filter by `clinic_id`, and that `clinic_id` must come from the authenticated session's resolved tenant — never from a value submitted by the client (e.g., a URL parameter or form field).**

Why "never from client input" matters: if a query trusted a `clinic_id` sent in a request body, a malicious or buggy frontend request could ask for `clinic_id: <someone else's ID>` and potentially read another clinic's data. The `clinic_id` used in every query must always be the one resolved by middleware (Part 7) from the user's verified session/membership — never re-derived from anything the client sends.

## Memberships, Roles, and Permissions

Recap from Part 6/7: a `membership` links a `user` to a `clinic` with a `role`. Permissions are mapped per role:

| Action | Owner | Doctor | Receptionist |
|---|---|---|---|
| View/manage own clinic's appointments | ✅ | ✅ (own only, by default) | ✅ (all) |
| View/manage patients | ✅ | ✅ | ✅ |
| Invite/remove staff | ✅ | ❌ | ❌ |
| Change staff roles | ✅ | ❌ | ❌ |
| View/manage billing & subscription | ✅ | ❌ | ❌ |
| View clinic-wide reports | ✅ | Partial (own performance) | ❌ |
| Edit clinic profile | ✅ | ❌ | ❌ |

**Why doctors default to "own appointments only":** Matches real clinic workflows — a doctor's daily view should be their own schedule, not clutter from colleagues. This is a *default view*, not a hard data restriction — a multi-doctor clinic may configure doctors to see the shared clinic calendar; the underlying permission model supports both, and this default is a UX decision more than a security one (unlike the Owner-only actions above, which are genuine authorization boundaries).

This table is enforced in the **service layer** (Part 2) — every service function checks the caller's role before performing owner-only actions, not just hidden in the UI (hiding a button in the frontend is a UX nicety, not a security control — the backend must reject the action too).

## Ownership

Every record's "owner" is its `clinic_id`, full stop — there is no concept of an individual staff member "owning" a patient or appointment record in a way that restricts other authorized clinic staff from accessing it (a receptionist must be able to see appointments a doctor booked, and vice versa, within the same clinic). `created_by_membership_id` (Part 6) is for audit purposes, not access control.

## Cross-Tenant Protection — Defense in Depth

Following Part 2's defense-in-depth principle, cross-tenant protection exists at **three independent layers**, so that a single mistake doesn't cause a leak:

1. **Middleware** resolves and attaches the correct `clinic_id` to every request context.
2. **Service layer** uses only that resolved `clinic_id` — never accepts one from request input.
3. **Repository layer** requires a `clinic_id` parameter on every tenant-scoped query function by its TypeScript signature — a repository function that queries `appointments` without a `clinic_id` parameter simply shouldn't compile, by convention and code review (Part 5).

## Query Pattern (Illustrative)

```ts
// Repository layer — every function requires clinicId explicitly
async function listAppointments(clinicId: string, filters: AppointmentFilters) {
  return db.select().from(appointments)
    .where(and(eq(appointments.clinicId, clinicId), ...otherFilters));
}

// Service layer — clinicId comes from the resolved session context, never from client input
async function getAppointmentsForToday(ctx: RequestContext) {
  return appointmentRepository.listAppointments(ctx.clinicId, { date: today() });
}
```

## Middleware's Role in Tenant Resolution (detail)

If a user has exactly one active membership, `ctx.clinicId` is set automatically. If a user has multiple (multi-clinic staff, Part 7), the currently "active" clinic is stored in the session (e.g., as a claim on the Clerk session, or a lightweight server-side lookup) and must be **explicitly switchable** via a clinic-switcher UI (Part 13) — never silently defaulted in a way the user can't see, since acting on the wrong clinic by mistake (even by an authorized multi-clinic user) is itself a real risk to guard against.

## Future Enterprise Features (Branches)

Part 1/6 anticipate multi-branch clinic chains. The model extends naturally: a future `branches` table (FK to `clinics`) would sit *underneath* `clinics` — the clinic remains the billing tenant, while branches are a sub-scope for staff/appointments/reporting. Because isolation is already built around `clinic_id` at every layer, adding `branch_id` as an *additional*, narrower filter (within an already-isolated clinic) is a much smaller change than retrofitting tenant isolation from scratch would be — this is the direct payoff of building multi-tenancy correctly from V1, as flagged in Part 1, Section 6.

## What should a developer remember?

- **The Golden Rule is absolute:** every tenant-scoped query filters by a `clinic_id` that comes from the resolved session — never from client-submitted input.
- Permissions are enforced in the **service layer**, not just hidden in the UI — a hidden button is not a security boundary.
- Ownership of records is at the **clinic level**, not the individual staff member level — all authorized staff within a clinic share visibility into that clinic's data per their role.
- The shared-database-with-`clinic_id` approach was a deliberate tradeoff for operational simplicity at current scale — not an oversight — and the door is open to stronger isolation (database-per-tenant) as a future enterprise option without a full rewrite.

---

*End of Part 8.*

---

# PART 9 — Modules

Each module below follows the same structure. All modules assume the architecture (Part 2), folder shape (Part 4), and tenant isolation rules (Part 8) already established — those aren't repeated per module except where a module has a genuinely special case.

---

## Module: Dashboard

**Purpose:** The first screen staff see after login — a fast, glanceable summary of "what's happening today," directly serving Part 1's low-technical-literacy, at-a-glance requirement.

**Features:** Today's appointment count and list, no-show/unconfirmed alerts, quick "book appointment" action, (owner-only) revenue snapshot and trial/subscription status banner.

**User Journey:** Staff logs in → lands on dashboard → sees today's schedule immediately, no navigation required → can act (confirm, reschedule, cancel) directly from dashboard cards without drilling into the full Appointments module for common actions.

**UI:** Card-based layout — "Today's Appointments," "Unconfirmed," "This Week at a Glance." Owner sees an additional "Business Snapshot" card (Part 15 — cached data, not live-recomputed on every load).

**Backend:** A dedicated `dashboard.service.ts` that aggregates data from Appointments, Notifications, and (for owners) Billing/Reports services — the Dashboard module itself has **no own database table**; it's a read/aggregation layer over other modules' data, following DRY (Part 5) rather than duplicating queries.

**Database:** None owned directly — reads from `appointments`, `notifications`, `subscriptions` (Part 6).

**APIs:** `GET /api/dashboard` — returns the full aggregated payload in one call (deliberately one endpoint, not five separate frontend calls, to keep the dashboard's initial load fast).

**Permissions:** All roles see the dashboard; content shown differs by role (owner sees billing/revenue cards, receptionist/doctor do not) — filtered server-side, not just hidden in the UI (Part 8).

**Validation:** N/A (read-only module).

**Business Rules:** "Today" is computed in the clinic's configured `timezone` (Part 6), not server time or browser time — critical correctness detail for a scheduling product.

**Edge Cases:** Clinic with zero appointments today shows a friendly empty state with a prompt to book one, not a blank screen (Part 13).

**Future Improvements:** Configurable/re-arrangeable dashboard cards; multi-branch aggregate view (Part 20).

---

## Module: Patients

**Purpose:** The clinic's patient records — the second most business-critical module after Appointments.

**Features:** Add/edit/search patients, view a patient's appointment history, soft-delete (archive) a patient record.

**User Journey:** Receptionist searches for a patient by name/phone when a call comes in or someone walks in → if found, opens their record to book/view history; if not found, quickly adds a new patient (minimal required fields — just name + phone — to keep friction low, matching Part 1's low-friction goal) and continues to booking.

**UI:** Searchable, paginated patient list (Part 13); patient detail page showing profile + appointment history timeline.

**Backend:** `patient.service.ts` — includes duplicate-detection logic (warn, don't block, if a patient with the same phone number already exists — a clinic may legitimately have two people sharing a household phone).

**Database:** `patients` table (Part 6).

**APIs:** `GET /api/patients` (search/list), `POST /api/patients` (create), `GET /api/patients/:id`, `PATCH /api/patients/:id`, `DELETE /api/patients/:id` (soft delete).

**Permissions:** Owner, doctor, receptionist can all view/create/edit; only owner can permanently archive (soft-delete) a patient record, since this affects historical reporting.

**Validation:** `full_name` required; `phone` required and format-validated (needed for WhatsApp notifications, Part 10 — an invalid phone number here silently breaks reminders later, so it's validated at entry, not discovered at send-time).

**Business Rules:** A patient record cannot be hard-deleted from the UI — only soft-deleted (archived) — preserving appointment history integrity (Part 6).

**Edge Cases:** Editing a patient's phone number does not retroactively change already-scheduled notifications' recipient — only future notifications use the updated number (avoids surprising behavior on in-flight reminders).

**Future Improvements:** Patient self-service portal (view their own appointments), file attachments (scanned reports) via Cloudinary (Part 3), treatment/prescription history (Part 20).

---

## Module: Appointments

**Purpose:** The core scheduling engine — the single most-used module day to day.

**Features:** Calendar/list view of appointments, book/reschedule/cancel, mark completed/no-show, per-doctor filtered views.

**User Journey:** Receptionist opens Appointments → picks doctor + date/time → selects or creates patient (links to Patients module) → confirms booking → system schedules reminder notifications automatically (no separate action needed — this automation is core to the product's value, Part 1).

**UI:** Calendar view (day/week) as primary view, given how staff actually think about scheduling; list view as a secondary/searchable alternative. Status shown via color (Part 13).

**Backend:** `appointment.service.ts` — enforces the "no double-booking" business rule at the application layer *and* relies on the database exclusion constraint (Part 6) as a hard backstop; on successful booking, calls the Notifications module to schedule confirmation + reminder jobs (Part 10).

**Database:** `appointments` table.

**APIs:** `GET /api/appointments` (filterable by date range, doctor, status), `POST /api/appointments`, `PATCH /api/appointments/:id` (reschedule/status change), `DELETE /api/appointments/:id` (cancel — soft, sets status, doesn't remove the row).

**Permissions:** Receptionist and owner: full access. Doctor: full access to their own appointments; view-only (or configurable) for others' (Part 8).

**Validation:** `start_time` must be in the future at creation time; `end_time` after `start_time`; doctor must have an active membership at this clinic.

**Business Rules:** Canceling an appointment automatically cancels its pending notifications (Part 10) — a patient shouldn't get a reminder for a canceled appointment. Marking an appointment `no_show` vs `canceled` are different statuses because they mean different things for reporting (Part 9, Reports) — a no-show is a lost-revenue signal, a cancellation might be perfectly normal.

**Edge Cases:** Rescheduling changes the notification schedule too (old reminders canceled, new ones scheduled against the new time) — handled explicitly in the service, not left as a side effect to discover.

**Future Improvements:** Recurring appointments (e.g., weekly physio sessions), waitlist for fully-booked doctors, patient self-booking portal.

---

## Module: Staff / Employees

**Purpose:** Manage who works at the clinic and what they can do — the operational side of Part 7/8's membership model.

**Features:** Invite staff, assign roles, view staff list, deactivate staff, (for doctors) set working hours.

**User Journey:** Owner opens Staff → clicks "Invite" → enters email + selects role → invited person receives a link (Part 7) → once joined, appears as `active` in the staff list.

**UI:** Staff list showing name, role, status (active/invited/deactivated); invite form; per-doctor working-hours editor (feeds into Appointments' available-slot logic, future improvement flagged below).

**Backend:** `staff.service.ts` — wraps `memberships` and `staff_profiles` (Part 6); calls Clerk's invitation API (Part 7) as part of the invite flow.

**Database:** `memberships`, `staff_profiles`.

**APIs:** `GET /api/staff`, `POST /api/staff/invite`, `PATCH /api/staff/:membershipId` (role change, working hours), `DELETE /api/staff/:membershipId` (deactivate).

**Permissions:** Owner-only for invite/role-change/deactivate (Part 8's permission table); all roles can view the staff list (useful for a receptionist to know who's working).

**Validation:** Cannot invite a duplicate active membership for the same email at the same clinic; cannot deactivate the *last remaining owner* of a clinic (a clinic must always have at least one owner — prevents an accidental lockout).

**Business Rules:** Role changes are logged to `audit_logs` (Part 6/17) — who changed whose role, when.

**Edge Cases:** Deactivating a doctor who has future appointments booked triggers a warning to the owner ("this doctor has 4 upcoming appointments — reassign or cancel them first") rather than silently orphaning those appointments.

**Future Improvements:** Enforcing `working_hours` against appointment booking (currently informational only in V1; becomes a hard constraint once the booking UI reads it — flagged explicitly as a V1 limitation, not an oversight, so it's not mistaken for a bug).

---

## Module: Notifications

**Purpose:** Automates confirmations and reminders — ClinicOS's core differentiator (Part 1). Full mechanics in Part 10; this section covers it as a product module.

**Features:** Automatic booking confirmation, 24-hour reminder, 1-hour reminder (configurable per clinic), cancellation notice, notification history/log per patient or appointment.

**User Journey:** Entirely automatic from the staff's point of view — they book an appointment (Appointments module) and notifications happen without further action; staff can view delivery status (sent/delivered/failed) on the appointment detail view if they want to verify.

**UI:** Notification status badges on appointment cards; a clinic-level "Notification Settings" screen (which reminders are enabled, timing) under Settings module.

**Backend/Database/APIs:** Fully detailed in Part 10.

**Permissions:** Owner configures notification settings; all roles can view notification status for an appointment.

**Business Rules:** Notifications respect the clinic's subscription tier — e.g., if WhatsApp notifications are a paid add-on (Part 1, Section 9) and the clinic's plan doesn't include it, notifications are queued as "skipped — upgrade required" rather than silently failing, and the UI clearly surfaces this to the owner.

**Edge Cases:** See Part 10 for delivery failure handling.

**Future Improvements:** Email and SMS as additional channels; patient-configurable reminder preferences.

---

## Module: Billing & Subscriptions (Clinic → Platform)

**Purpose:** Manages the clinic's *own* subscription to ClinicOS — this is how the business gets paid (Part 1, Section 9), so it's treated with the same rigor as Authentication (Part 7).

**Features:** View current plan, upgrade/downgrade, view billing history, update payment method, trial countdown/status banner.

**User Journey:** Owner signs up → automatically starts on `trial` status (Part 6) → banner shows days remaining → before/at trial end, prompted to add a payment method and select a plan → subscription becomes `active`.

**UI:** Plan comparison screen (matches Part 1's tiered pricing), payment method form (embedded from the payment provider — e.g., Stripe Elements — so raw card details never touch ClinicOS's own servers, Part 17), billing history/invoices-from-us list.

**Backend:** `billing.service.ts` — talks to an external payment provider (e.g., Stripe) via a `lib/payments/` wrapper (Part 3's "wrap external services" rule); listens to that provider's webhooks (`invoice.paid`, `invoice.payment_failed`, `subscription.canceled`) to keep `subscriptions.status` and `clinics.status` in sync.

**Database:** `subscriptions` (Part 6).

**APIs:** `GET /api/billing/subscription`, `POST /api/billing/checkout` (starts a payment provider checkout session), `POST /api/webhooks/payments` (provider webhook receiver), `POST /api/billing/portal` (link to provider's self-service billing portal for payment method updates — reduces custom UI needed for PCI-sensitive flows).

**Permissions:** Owner-only, no exceptions — this is explicitly excluded from doctor/receptionist access in Part 8's permission table.

**Validation:** Plan downgrade blocked if current active staff count exceeds the target plan's `staff_seat_limit` (Part 6) — owner must deactivate staff first, with a clear explanation why.

**Business Rules:** On `payment_failed`, clinic status moves to `past_due` (grace period, app remains usable with a warning banner) before eventually moving to `suspended` if unresolved (app becomes read-only or fully blocked, depending on final policy — flagged as a business decision to finalize, not a technical one).

**Edge Cases:** A clinic's background notification jobs (Part 2, Section 16) check clinic status before sending — a `suspended` clinic's scheduled reminders should not fire.

**Future Improvements:** Usage-based add-ons (e.g., pay-per-WhatsApp-message beyond a plan's included volume — Part 1, Section 9), annual billing discount, multi-branch consolidated billing (Part 20).

---

## Module: Invoices (Clinic → Patient)

**Purpose:** Lets a clinic bill *its own patients* — a separate concern from the Billing module above, and easy to confuse with it, so this distinction is repeated deliberately.

**Features:** Create an invoice for a completed appointment, add line items, mark as paid, generate a printable/shareable PDF, send via WhatsApp (reusing the Notifications/WhatsApp module).

**User Journey:** Receptionist marks an appointment "completed" → prompted to create an invoice → adds line items (consultation, procedures) → generates PDF and can send it directly to the patient via WhatsApp.

**UI:** Invoice builder form (line items, auto-calculated total), invoice list (filter by status: draft/sent/paid/overdue), PDF preview.

**Backend:** `invoice.service.ts` — calculates totals from `invoice_items`, generates PDF (a background job if generation is non-trivial, Part 16), optionally triggers a WhatsApp send via the shared `lib/whatsapp/` wrapper (Part 3/11).

**Database:** `invoices`, `invoice_items` (Part 6).

**APIs:** `GET /api/invoices`, `POST /api/invoices`, `PATCH /api/invoices/:id` (status updates), `GET /api/invoices/:id/pdf`.

**Permissions:** Owner and receptionist can create/manage invoices; doctor view-only (relevant to their own appointments).

**Validation:** At least one line item required; `total_amount` is server-computed from line items, never accepted directly from client input (prevents a tampered request from setting an arbitrary total).

**Business Rules:** An invoice is linked to at most one appointment (optional — some invoices may be for non-appointment services later), but an appointment can have at most one non-void invoice (prevents accidental duplicate billing).

**Edge Cases:** Voiding a paid invoice (correction) creates an audit log entry (Part 6/17) rather than being silently deleted.

**Future Improvements:** Online payment collection (patient pays the invoice directly via a payment link), insurance claim fields, recurring invoices for ongoing treatment plans.

---

## Module: Reports

**Purpose:** Turns raw operational data into decisions the clinic owner can act on (Part 1, Section 13 — success metrics at the product level feed directly from this module's underlying data).

**Features:** Appointments over time, no-show rate, revenue (from invoices), busiest hours/days, per-doctor performance.

**User Journey:** Owner opens Reports (typically weekly/monthly, not daily) → selects a date range → views charts/summary → can export (future improvement).

**UI:** Chart-based (line/bar charts for trends), filterable by date range and, for multi-doctor clinics, by doctor.

**Backend:** `report.service.ts` — read-only aggregation queries against `appointments` and `invoices`; heavier reports (e.g., a full year) are cached (Part 15) since they're expensive to compute and don't need to be real-time.

**Database:** No owned table — reads from `appointments`, `invoices`, `notifications`.

**APIs:** `GET /api/reports/summary?from=&to=`, `GET /api/reports/no-show-rate`, `GET /api/reports/revenue`.

**Permissions:** Owner-only for clinic-wide reports; doctor may see a scoped "my performance" view (own no-show rate, own appointment count) per Part 8's partial-access row.

**Validation:** Date ranges validated (from ≤ to, reasonable max range to avoid extremely expensive queries).

**Business Rules:** No-show rate is calculated only against appointments whose scheduled time has already passed (an appointment scheduled for next week isn't yet a "show" or "no-show").

**Edge Cases:** A clinic with very little historical data (new signup) sees a clear "not enough data yet" state instead of a broken/empty chart.

**Future Improvements:** Exportable PDF/CSV reports, scheduled email/WhatsApp summary reports, multi-branch comparative reporting (Part 20).

---

## Module: Clinic Profile

**Purpose:** The clinic's own identity within the system — name, logo, contact info, operating hours — distinct from individual staff settings.

**Features:** Edit clinic name/address/phone, upload logo (via Cloudinary, Part 3), set clinic-wide operating hours and timezone.

**User Journey:** Owner visits during initial setup (Part 7's signup flow prompts this as a first step) and occasionally afterward to update details.

**UI:** Simple settings form; logo uploader with preview.

**Backend:** `clinic-profile.service.ts` — thin wrapper updating the `clinics` table; logo upload goes through the `lib/storage/` Cloudinary wrapper (Part 3), storing only the resulting URL in the database, never the file itself.

**Database:** `clinics` table (Part 6).

**APIs:** `GET /api/clinic-profile`, `PATCH /api/clinic-profile`.

**Permissions:** Owner-only edit; all roles can view (staff should be able to see the clinic's own listed phone/address, e.g., to read it out to a patient).

**Validation:** Timezone must be a valid IANA timezone string (critical correctness dependency for Appointments/Notifications, Part 6/9/10).

**Business Rules:** Changing the clinic's timezone does **not** retroactively shift already-scheduled appointment times' stored UTC values — it only changes how times are *displayed* and how *future* bookings are interpreted (a subtle but important correctness rule to prevent silently moving existing appointments).

**Edge Cases:** N/A beyond validation above.

**Future Improvements:** Multi-branch profiles (each branch with its own address/hours under one clinic/billing entity, Part 20).

---

## Module: Settings

**Purpose:** A catch-all for clinic-wide configuration that doesn't belong to a more specific module — notification preferences (Part 9, Notifications), user's own personal preferences (e.g., calendar default view).

**Features:** Notification timing toggles, personal preference settings (per-user, not per-clinic).

**User Journey:** Rarely visited after initial setup — mostly a "set once" area.

**UI:** Simple grouped settings screens.

**Backend:** Thin service delegating to the relevant module (e.g., notification toggles are actually stored as clinic-level config read by the Notifications module, Part 10) — Settings itself doesn't own significant new data beyond a small `clinic_settings` / `user_preferences` key-value structure.

**Permissions:** Clinic-wide settings: owner-only. Personal preferences: each user manages their own.

**Future Improvements:** Expands naturally as new configurable options are added elsewhere in the product — this module is intentionally a thin shell, not meant to accumulate business logic itself (per Part 5's Single Responsibility principle — actual logic belongs to the module the setting affects).

---

## What should a developer remember?

- Every module follows the **same internal shape** (Part 4) and the **same permission-enforcement pattern** (Part 8) — consistency across modules is more valuable than any single module being "clever."
- **Billing (clinic→platform)** and **Invoices (clinic→patient)** are different systems, different tables, different purposes — never merge this distinction, even when it's tempting to reuse code between them.
- The **Dashboard, Reports, and Settings modules deliberately own little to no data themselves** — they aggregate or configure other modules' data, avoiding duplicated logic (DRY, Part 5).
- Every module's **Edge Cases** and **Future Improvements** sections above are not filler — they're the first places a developer should look before assuming a scenario "won't happen" or a feature "isn't planned."

---

*End of Part 9.*

---

# PART 10 — Notification System

## Purpose & Why This Exists

This chapter details the *mechanics* behind the Notifications module introduced in Part 9 — the engine that turns "an appointment was booked" into "a WhatsApp message reliably arrives at the right time." This is treated as critical infrastructure, not a minor feature, because it's ClinicOS's core USP (Part 1, Section 11).

## Architecture: Notification Engine

```
Event occurs (appointment booked/rescheduled/canceled)
      ↓
Notification Service decides WHAT notifications are needed
      ↓
Jobs scheduled in BullMQ (delayed, for future send times)
      ↓
At the scheduled time, a Worker picks up the job
      ↓
Template Engine renders the message (fills in patient name, doctor, time)
      ↓
Provider (WhatsApp) sends the message
      ↓
Result (sent/failed) written back to the `notifications` table (Part 6)
```

## Template Engine

**What it is:** Rather than hardcoding message text in the sending code, messages are built from templates with placeholders — e.g., `"Hi {{patient_name}}, this is a reminder for your appointment with {{doctor_name}} at {{clinic_name}} on {{date}} at {{time}}."`

**Why:** Keeps message wording editable (by the team, and later possibly by clinics themselves as a customization feature) without touching sending logic, and matches WhatsApp's own requirement that business-initiated messages use **pre-approved templates** (Part 11) — the internal template engine's placeholder structure is designed to map directly onto WhatsApp template variables.

## Providers

V1 has one provider: **WhatsApp** (Part 11). The engine is built with a `NotificationProvider` interface (Part 5's Liskov Substitution / Open-Closed principles) so that Email, SMS, and Push (Part 1, Section 6 — long-term vision) can be added later as additional providers without changing the scheduling/engine logic — only a new file under `lib/notifications/providers/` is needed.

## Retry Logic (via BullMQ)

If sending fails (e.g., WhatsApp API temporarily unavailable), the job retries automatically with **exponential backoff** (waiting longer between each retry — e.g., 1 minute, then 5 minutes, then 30 minutes) rather than retrying instantly and repeatedly, which could worsen a provider outage. After a fixed number of attempts (e.g., 5), the job is marked permanently `failed` and moved to a **Dead Letter Queue** (Part 16) for visibility rather than disappearing silently.

## Notification Logs

Every attempt — not just the final outcome — updates the `notifications` table (Part 6): `scheduled` → `sent` → `delivered` (if the provider confirms delivery, e.g., via a WhatsApp status webhook, Part 11) or `failed` (with `failure_reason`). This log is what powers the status badges in the Appointments UI (Part 9) and gives the clinic owner visibility instead of a black box.

## Failure Handling

| Failure Type | Handling |
|---|---|
| Invalid patient phone number | Fails immediately, no retry (retrying won't fix a bad number) — flagged in UI, prompting staff to correct the patient record |
| WhatsApp API temporarily down | Retried with backoff (see above) |
| Clinic subscription doesn't include this notification type | Job is never created in the first place — not scheduled then failed (Part 9, Notifications' business rule) |
| Clinic suspended between scheduling and send time | Job checks clinic status immediately before sending and skips if inactive (Part 2, Section 16) |

## Rate Limits

WhatsApp's own API enforces sending rate limits per business account (Part 11). The notification worker respects these by processing sends at a controlled rate (not firing all of a clinic's daily reminders in the same instant) — implemented as a rate-limited queue consumer rather than trusting the provider to queue on ClinicOS's behalf.

## Monitoring

Failed notification jobs trigger an internal alert (Part 19) if failure rate crosses a threshold (e.g., more than 10% of a day's notifications failing) — this is treated as a business-critical incident, not just a technical log entry, given how central this feature is to the value proposition.

## What should a developer remember?

- The notification engine is built **provider-agnostic** from day one, even though only WhatsApp exists in V1 — this is intentional forward design (Part 5's Open/Closed principle), not premature abstraction, because Email/SMS are explicitly on the roadmap (Part 1).
- **Every notification's lifecycle is logged**, not just the final result — this log is a product feature (visibility for clinic staff), not just internal debugging data.
- Failure handling is **failure-type-aware** — a bad phone number and a temporary API outage are handled completely differently, and conflating them would either waste retries or hide real fixable problems.

---

# PART 11 — WhatsApp Integration

## Purpose & Why This Exists

WhatsApp is the delivery mechanism for ClinicOS's core promise (Part 1). This chapter documents the integration in enough detail that a developer can implement, debug, or extend it without external research.

## Embedded Signup & OAuth

Each clinic connects its **own** WhatsApp Business number to ClinicOS via Meta's **Embedded Signup** flow — a hosted flow (a small popup/redirect provided by Meta) where the clinic owner logs into their own Meta Business account and grants ClinicOS permission to send messages on behalf of their WhatsApp Business number.

**Why per-clinic connection (not one shared ClinicOS WhatsApp number for everyone):** Patients trust and recognize their *own clinic's* WhatsApp number, not a generic third-party number — this also keeps message sending compliant with WhatsApp's business policies, which are built around a business messaging its own customers.

**Flow:**
1. Owner goes to Settings → WhatsApp Connection → clicks "Connect WhatsApp."
2. Meta's Embedded Signup popup opens; owner logs in and selects/creates their WhatsApp Business account and number.
3. On success, Meta returns an authorization code to ClinicOS's frontend.
4. ClinicOS's backend exchanges that code for **access tokens** and retrieves the clinic's **Phone Number ID** and **WhatsApp Business Account ID** — these are stored (tokens encrypted, Part 17) associated with the `clinic_id`.
5. Connection status is shown in the UI as "Connected — [number]" going forward.

## Tokens & Phone Number ID

| Field | Purpose |
|---|---|
| Access Token | Used to authenticate ClinicOS's API calls to send messages on the clinic's behalf; long-lived but subject to periodic refresh per Meta's token policy |
| Phone Number ID | Identifies which WhatsApp number to send *from* for this clinic |
| WhatsApp Business Account ID | Identifies the business account, needed for template management |

All of these live in a `whatsapp_connections` table (`clinic_id`, encrypted token, phone_number_id, waba_id, status, connected_at) — this table was omitted from the compact list in Part 6 for space but follows the exact same tenant-isolation rules as every other table there.

## Templates

WhatsApp requires that business-initiated messages (not replies to a patient's own message) use **pre-approved message templates** — Meta reviews template wording in advance to prevent spam/abuse. ClinicOS maintains a small set of approved templates (appointment confirmation, 24h reminder, 1h reminder, cancellation notice) that map directly to Part 10's Template Engine placeholders. New template wording requires re-submission to Meta for approval — this is a real operational step the team account for (a template can't be changed and used instantly, unlike an internal-only template).

## Sending

The `lib/whatsapp/` wrapper (Part 3/4) exposes a single function like `sendTemplateMessage(connection, templateName, recipientPhone, variables)` — called only by the Notification worker (Part 10), never directly by other modules, keeping the WhatsApp-specific API details fully contained in one place.

## Receiving Webhooks

Meta sends webhooks to ClinicOS for: message delivery status updates (`sent` → `delivered` → `read`) and, for future use, incoming messages from patients replying. The webhook endpoint (`/api/webhooks/whatsapp`) verifies Meta's signature on every request before processing (Part 17) and updates the corresponding `notifications` row's `status` (Part 6/10).

## Connection Status & Reconnection

If a clinic's access token expires or is revoked (e.g., the owner disconnects the app from their Meta Business settings directly), the next send attempt fails with an auth error — this is detected and the clinic's `whatsapp_connections.status` is set to `disconnected`, surfacing a clear "Reconnect WhatsApp" prompt in the UI (Part 13) rather than silently failing sends indefinitely.

## Security

- Access tokens are **encrypted at rest** in the database (Part 17), decrypted only in-memory when making an API call.
- The webhook endpoint is public (Meta must be able to reach it) but protected by signature verification, not by session auth — this is a deliberate, documented exception to Part 7's "every route requires auth" pattern.
- A clinic's WhatsApp connection is scoped strictly to that `clinic_id` — the sending wrapper always requires a `clinic_id` (or resolved connection object) as input, never a bare phone-number-ID/token pulled from anywhere else, preventing any accidental cross-clinic sends.

## What should a developer remember?

- Every clinic connects **its own** WhatsApp number — there is no shared/global ClinicOS WhatsApp sender.
- Message templates must be **pre-approved by Meta** — this isn't a config change ClinicOS controls unilaterally; plan for review lead time when adding a new notification type.
- The WhatsApp webhook endpoint is intentionally unauthenticated by session but must always verify Meta's signature — never relax this check for convenience.
- All WhatsApp API interaction goes through the single `lib/whatsapp/` wrapper — no module calls Meta's API directly.

---

*End of Part 11.*

---

# PART 12 — API Documentation

## Purpose & Why This Exists

This chapter documents ClinicOS's API endpoints so any developer (or AI assistant) can integrate with, extend, or debug the backend without reading through service code first. Every endpoint follows Part 2's consistent request/response shape and Part 8's tenant-isolation rules by default — those are not repeated per endpoint below except where an endpoint is a deliberate exception (e.g., webhooks).

**Format used per endpoint:** Purpose · Method & Path · Auth · Request · Response · Validation · Errors · DB Operations.

Below is the full documentation for the **Appointments** module as the canonical, fully-worked example, followed by a summarized reference table for all other modules (following the identical pattern — a developer building a new module should document it in this same full format).

---

## Appointments API (Full Reference)

### `GET /api/appointments`
- **Purpose:** List appointments for the clinic, filterable.
- **Auth:** Required (any role).
- **Request:** Query params — `from` (date), `to` (date), `doctorId` (optional), `status` (optional).
- **Response:** `{ success: true, data: { appointments: Appointment[] } }`
- **Validation:** `from`/`to` must be valid dates; `from` ≤ `to`.
- **Errors:** `400 INVALID_DATE_RANGE`.
- **DB Operations:** `SELECT` on `appointments` filtered by `clinic_id` (+ optional `doctorId`/`status`/date range), joined with `patients` for display name.

### `POST /api/appointments`
- **Purpose:** Book a new appointment.
- **Auth:** Required (owner, receptionist; doctor can book for themselves).
- **Request:** `{ patientId, doctorMembershipId, startTime, endTime, notes? }`
- **Response:** `{ success: true, data: { appointment: Appointment } }`
- **Validation:** All IDs must belong to the same `clinic_id`; `startTime` in the future; `endTime` > `startTime`.
- **Errors:** `409 SLOT_UNAVAILABLE` (doctor already booked), `404 PATIENT_NOT_FOUND`, `403 FORBIDDEN` (role not permitted).
- **DB Operations:** `INSERT` into `appointments` (protected by the exclusion constraint, Part 6); triggers Notification Service to schedule confirmation + reminder jobs (Part 10).

### `PATCH /api/appointments/:id`
- **Purpose:** Reschedule or update status (confirm/complete/no-show).
- **Auth:** Required, per Part 8's role table.
- **Request:** `{ startTime?, endTime?, status? }`
- **Response:** `{ success: true, data: { appointment: Appointment } }`
- **Validation:** Same slot-availability rules apply if time is changed.
- **Errors:** `409 SLOT_UNAVAILABLE`, `404 APPOINTMENT_NOT_FOUND`, `403 FORBIDDEN`.
- **DB Operations:** `UPDATE` on `appointments`; if time changed, cancels old and schedules new notification jobs (Part 10).

### `DELETE /api/appointments/:id`
- **Purpose:** Cancel an appointment (soft — sets `status: canceled`, row retained).
- **Auth:** Required, per Part 8.
- **Response:** `{ success: true, data: { appointment: Appointment } }`
- **Errors:** `404 APPOINTMENT_NOT_FOUND`.
- **DB Operations:** `UPDATE` status; cancels pending notification jobs for this appointment (Part 10).

**Rate Limits:** Standard authenticated-user rate limit (Part 17) — no special limit beyond the platform default, since booking volume per clinic is naturally low relative to abuse thresholds.

---

## Summary Reference — Other Modules

*(Each follows the exact documentation pattern above — purpose, method, auth, request, response, validation, errors, DB operations — abbreviated here for space; expand any row to full documentation before implementation using the Appointments example as the template.)*

| Module | Key Endpoints | Auth Notes |
|---|---|---|
| Patients | `GET/POST /api/patients`, `GET/PATCH/DELETE /api/patients/:id` | All roles read/write; owner-only permanent archive |
| Staff | `GET /api/staff`, `POST /api/staff/invite`, `PATCH/DELETE /api/staff/:membershipId` | Owner-only for mutations |
| Notifications | `GET /api/notifications?appointmentId=` (status lookup) | Read-only for staff; no direct "send" endpoint — always triggered internally by other services |
| Billing | `GET /api/billing/subscription`, `POST /api/billing/checkout`, `POST /api/billing/portal` | Owner-only |
| Invoices | `GET/POST /api/invoices`, `PATCH /api/invoices/:id`, `GET /api/invoices/:id/pdf` | Owner + receptionist manage; doctor read-only |
| Reports | `GET /api/reports/summary`, `/no-show-rate`, `/revenue` | Owner-only (clinic-wide); doctor gets a scoped `?scope=own` view |
| Clinic Profile | `GET/PATCH /api/clinic-profile` | Owner-only edit; all roles read |
| Settings | `GET/PATCH /api/settings` | Owner-only for clinic-wide; user-scoped for personal prefs |

## Webhook Endpoints (Exception to Standard Auth)

| Endpoint | Source | Verification Method |
|---|---|---|
| `POST /api/webhooks/clerk` | Clerk (Part 7) | Clerk signing secret signature check |
| `POST /api/webhooks/whatsapp` | Meta (Part 11) | Meta app secret signature check |
| `POST /api/webhooks/payments` | Payment provider (Part 9, Billing) | Provider signing secret signature check |

These do **not** use Clerk session auth (Part 7) since the caller is an external system, not a logged-in user — each instead verifies a cryptographic signature specific to its provider, and this is the *only* accepted exception to "every route requires session auth" in the entire API surface.

## What should a developer remember?

- Every non-webhook endpoint follows Part 2's response shape and Part 8's `clinic_id`-from-session rule — **no endpoint accepts a `clinicId` from the request body or query string.**
- New endpoints must be documented in this **exact same format** (Purpose · Method · Auth · Request · Response · Validation · Errors · DB Operations) before being considered complete — an undocumented endpoint is treated as an unfinished feature.
- Webhook endpoints are the **only** sanctioned exception to session-based auth, and each must independently verify its own provider's signature — never trust an unverified webhook payload.

---

*End of Part 12.*

---

# PART 13 — Frontend

## Purpose & Why This Exists

This chapter defines how the UI is built and behaves — consistently, so that clinic staff with low technical literacy (Part 1) never have to re-learn how the app works from one screen to the next.

## Routing

Next.js file-based routing (Part 4). Authenticated pages live under `(dashboard)`, e.g., `/appointments`, `/patients`, `/staff`, `/billing`, `/reports`, `/settings` — flat, predictable URLs matching module names exactly, so the URL always tells you which module you're in.

## Layouts

A single persistent **app shell** layout (sidebar navigation + top bar showing clinic name and active user) wraps all `(dashboard)` pages, so navigation never disappears or reloads awkwardly between pages — important for a fast, app-like feel rather than a "website" feel.

## Components

- **Generic (`src/components/ui/`):** Button, Input, Modal, Table, Badge, DatePicker — used across every module, styled once, consistent everywhere.
- **Module-specific (`src/modules/*/components/`):** e.g., `AppointmentCalendar`, `PatientSearchBar` — built from the generic components, specific to one module's needs (Part 4).

## Forms

All forms use the same validation library/schema approach as the backend (Part 5's shared validation schemas where feasible) so error messages match between client-side and server-side validation — reduces confusing "the form said it was fine but the server rejected it" moments.

Every form: shows inline field-level errors (not just a generic banner), disables its submit button while submitting (prevents accidental double-submission — directly relevant to preventing duplicate appointment bookings from a double-click), and shows a clear success confirmation.

## Tables

Used for Patients list, Staff list, Invoices list. Standard features across all: sortable columns where relevant, search bar, pagination (Section on Pagination below), consistent empty-state and loading-state design (Section below).

## Modals

Used for quick actions that shouldn't navigate away from context — e.g., "Book Appointment" from the Dashboard, "Add Patient" while booking an appointment (nested modal flow, common real-world need: receptionist realizes mid-booking the patient isn't in the system yet).

## Pagination

Server-side pagination (not loading all records and paginating in the browser) for any list that could grow large (Patients, Invoices) — keeps performance consistent regardless of clinic size (a clinic with 50 patients and one with 5,000 should feel equally fast).

## Search & Filters

Patient search: debounced (waits briefly after typing stops before querying, avoiding a request per keystroke) search-as-you-type by name or phone. Appointments: filterable by doctor, date range, status — filters persist in the URL (query params) so a filtered view can be bookmarked/shared/refreshed without losing state.

## Responsive Design

Clinic staff may use a tablet at the front desk as often as a laptop — the app shell and all core flows (especially booking) are designed mobile/tablet-friendly first, not as an afterthought retrofit.

## Loading States

Every data-fetching view shows a skeleton loading state (a placeholder shape matching the eventual content) rather than a blank screen or a generic spinner — reduces perceived wait time and prevents the "is this broken?" feeling for non-technical users (Part 1).

## Error States

Every view that can fail to load shows a clear, human-readable message with a retry action — never a raw error code or blank screen. Matches Part 2, Section 17's rule that raw backend errors never reach the user directly.

## Accessibility

Baseline accessibility (proper form labels, sufficient color contrast, keyboard-navigable modals/forms) is treated as a default requirement, not an enhancement — relevant given the diverse age range and comfort level of clinic staff who will use this daily.

## What should a developer remember?

- **Consistency over novelty** — a new screen should look and behave like existing ones; don't introduce a new pattern (new pagination style, new modal behavior) without updating this chapter first.
- **Client-side and server-side validation should produce the same error messages** wherever possible — this is a UX correctness issue, not just a nice-to-have.
- Every list that could grow is **paginated server-side** from day one — retrofitting this after a clinic has thousands of patients is far more painful than building it in now.
- Loading/empty/error states are **required parts of every view**, not optional polish — for this audience (Part 1), unclear states directly cause support burden and lost trust.

---

# PART 14 — Backend

## Purpose & Why This Exists

Part 2 defined the layered architecture at a high level; this chapter goes one level deeper into how backend code is actually organized and written day to day.

## Services

Each module's `.service.ts` (Part 4) contains its business logic, and services **can call other modules' services** (e.g., Appointment Service calls Notification Service after booking) — but only through each module's public exported functions, never by reaching into another module's repository directly (Part 5's import rule). This keeps a clear dependency graph: a developer can trace "what does booking an appointment actually trigger?" by following service-to-service calls, not by hunting through database queries scattered across modules.

## Repositories

The only layer allowed to import the database client (Part 4's `db/client.ts`). Every repository function's signature requires an explicit `clinicId` for tenant-scoped tables (Part 8) — this is treated as close to a compile-time-enforced rule as TypeScript allows, and any exception must be justified in a code comment and reviewed carefully (e.g., the rare cross-tenant lookup during Clerk webhook processing, before a `clinic_id` context even exists yet).

## Business Logic Placement

Business rules (Part 9's "Business Rules" sections per module) always live in the service layer — never in the repository (which should stay a thin, mechanical database-access layer) and never in the API route handler (which should stay a thin request/response wrapper). This is the single most common place new developers misplace code, so it's called out explicitly.

## Validation

Input validation schemas (Part 5) run at the API route boundary, before the service layer is even called — a service function can therefore trust that its input already matches its expected shape, and doesn't need to re-validate basic shape/type correctness (though it still checks *business* validity — e.g., "does this patient actually exist" is a service-layer concern, not a schema-shape concern).

## Transactions

Any operation touching multiple tables that must all succeed or all fail together uses a database transaction — e.g., voiding an invoice (Part 9) updates the invoice status *and* writes an audit log entry (Part 6) in one transaction, so a crash between the two steps can never leave the system in a half-updated state.

## Utilities

Small, pure helper functions (e.g., date/timezone formatting, phone number normalization) live in `src/lib/` if used by multiple modules, or inside a module's own folder if genuinely single-use (Part 4/5's YAGNI-guided rule on when to promote a utility to shared code).

## Middleware

Recap from Part 2/7/8: authentication → tenant resolution → authorization, always in that order, always before any service is called.

## Error Handling

Custom error classes (Part 5) thrown by services are caught by a single, shared error-handling wrapper around every API route handler — meaning individual route handlers don't each need their own try/catch boilerplate; the shared wrapper converts any thrown error into the consistent `{ success: false, error }` shape (Part 2) and logs it appropriately (Part 19) based on error type (expected business error like `SlotUnavailableError` → logged at info level; unexpected error → logged at error level and alerts monitoring).

## What should a developer remember?

- **Services call services; repositories never call other modules' repositories directly** — this keeps the dependency graph traceable.
- **Business rules live in services only** — this is the #1 place to double-check when reviewing a PR that "feels off."
- **Multi-table writes that must succeed/fail together use a transaction** — this isn't optional for data integrity-critical flows like invoices and audit logging.
- A **shared error-handling wrapper** means individual route handlers should almost never contain their own try/catch — if one does, ask why.

---

*End of Part 14.*

---

# PART 15 — Caching

## Purpose & Why This Exists

Caching (Part 3) trades a small amount of "freshness" for a large amount of speed on data that's read often but changes relatively rarely. This chapter defines exactly what's cached and how it stays correct.

## Redis Strategy

Cache is used for **read-heavy, moderately-stable data**, never for data that must always be perfectly real-time-accurate at the database level (e.g., the appointment slot-availability check during booking always hits the database directly, never the cache, since a stale read there could cause a double-booking).

**Cached today (V1):**
- Dashboard summary data (Part 9) — today's appointment count, etc.
- Clinic's active staff list (used across several modules for dropdowns).
- Report aggregates for date ranges older than the current day (historical data doesn't change).

**Never cached:**
- Real-time appointment slot availability during the booking flow itself.
- Anything involving payment/billing state at the moment of a billing action.

## Cache Keys

Convention: `clinic:{clinicId}:{resource}:{qualifier}` — e.g., `clinic:abc123:dashboard:today`, `clinic:abc123:staff:active-list`. Always namespaced by `clinic_id` first, so a cache key can never accidentally serve one clinic's cached data to another (Part 8's isolation principle extended into the caching layer).

## Expiration

Short TTLs (Time To Live — how long a cached value is kept before being considered stale and re-fetched) for frequently-changing data (dashboard: ~1–2 minutes), longer TTLs for genuinely static historical data (past-month reports: hours, since that data literally cannot change).

## Invalidation

Rather than relying purely on TTL expiry, relevant caches are **explicitly invalidated** on write — e.g., booking a new appointment immediately clears that clinic's `dashboard:today` cache key, so the dashboard reflects the new appointment on next load rather than waiting out a stale TTL. This "write-through invalidation" is applied specifically to the Dashboard (where staff expect to see their own just-made changes instantly) but not to Reports (where a short staleness window is acceptable and not noticed).

## Performance

Caching is applied only where a real, measured performance need exists (Part 5's YAGNI) — not preemptively wrapped around every read. The Dashboard and Reports modules are the primary beneficiaries since they aggregate across multiple tables (Part 9), which is naturally more expensive than a single simple lookup.

## What should a developer remember?

- **Never cache anything involved in preventing double-booking or payment correctness** — cache is for convenience/speed on read-heavy aggregate data, not for anything requiring strict real-time accuracy.
- **Cache keys are always namespaced by `clinic_id`** — this is a direct extension of Part 8's Golden Rule into the caching layer.
- When in doubt about whether to cache something new, default to **not caching** until a real performance problem is observed (Part 5, YAGNI) — premature caching adds invalidation complexity for no proven benefit.

---

# PART 16 — Background Jobs

## Purpose & Why This Exists

This chapter details BullMQ usage (introduced in Part 3, applied throughout Part 2 and Part 10) as its own infrastructure concern, separate from the Notification System's product-level behavior.

## Queues

ClinicOS uses a small number of purpose-specific queues rather than one giant catch-all queue:

| Queue | Purpose |
|---|---|
| `notifications` | Scheduled WhatsApp sends (confirmations, reminders, cancellations — Part 10) |
| `reports` | Heavy report pre-computation/caching (Part 15) run on a schedule, not on-demand |
| `billing-sync` | Reconciliation jobs syncing subscription state with the payment provider (Part 9) |

**Why separate queues instead of one:** Different queues can have different concurrency settings and retry policies suited to their workload — e.g., `notifications` needs rate-limiting (Part 10) to respect WhatsApp's API limits, while `reports` doesn't.

## Retries

Each queue defines its own retry policy (Part 10 covered `notifications` specifically: exponential backoff, max 5 attempts). `billing-sync` jobs, by contrast, retry more conservatively (fewer, longer-spaced attempts) since billing reconciliation errors need human visibility sooner rather than being retried aggressively and silently.

## Dead Letter Queue (DLQ)

Jobs that exhaust all retries move to a DLQ instead of vanishing — this is a holding area for permanently-failed jobs that a developer/ops process reviews (Part 19's monitoring). A DLQ entry is treated as an incident to investigate, not noise to ignore.

## Scheduling

Delayed jobs (e.g., "send in 24 hours") use BullMQ's built-in delay feature, keyed to an exact timestamp computed from the appointment's `start_time` and the clinic's `timezone` (Part 6/9) — never a relative "24 hours from now server time" calculation, which would be wrong the moment server time and clinic-intended time diverge.

## Workers

Worker processes consume jobs from queues. In V1, the worker runs as part of the same deployed application (fits Part 2's monolith decision) rather than a separately deployed service — kept simple until real scale demands otherwise (Part 20).

## Monitoring

Queue health (job counts, failure rates, DLQ size) is surfaced on an internal ops dashboard (Part 19) — not customer-facing, but essential for the team to notice, e.g., a spike in WhatsApp send failures before a clinic complains about missed reminders.

## What should a developer remember?

- **Purpose-specific queues, not one giant queue** — each queue's retry/concurrency policy should match its actual failure characteristics and urgency.
- **Failed jobs go to a DLQ for human review**, never silently disappear — a job failing permanently should always be visible somewhere.
- **Delayed job timing is always computed against the clinic's timezone**, never raw server-relative time — this is the same timezone-correctness principle from Part 6/9 applied to scheduling.

---

*End of Part 16.*

---

# PART 17 — Security

## Purpose & Why This Exists

ClinicOS handles patient data — names, phone numbers, and eventually health-adjacent notes. Even without formal healthcare-regulation certification as a V1 requirement (a business decision to confirm based on target markets), the product is built to a high security bar because trust is foundational to a clinic ever adopting it (Part 1).

## Authentication & Authorization

Fully covered in Part 7 (authentication) and Part 8 (authorization/tenant isolation) — this chapter cross-references rather than repeats: the key security properties are Clerk-managed credentials, httpOnly session cookies, and `clinic_id`-enforced isolation at three independent layers.

## SQL Injection

Mitigated structurally: Drizzle (Part 3) uses parameterized queries by construction — raw string-concatenated SQL is never used anywhere in the codebase (Part 5's coding standard), which eliminates this entire vulnerability class by default rather than relying on developers to remember to escape input each time.

## XSS (Cross-Site Scripting)

React (via Next.js) escapes rendered content by default, preventing injected script content from executing — the one place this protection can be bypassed is `dangerouslySetInnerHTML`, which is banned from use anywhere in the codebase unless explicitly reviewed and justified (e.g., rendering a WYSIWYG-edited invoice note would need sanitization first, not raw injection).

## CSRF (Cross-Site Request Forgery)

Mitigated via same-site cookie settings (Part 7) and Next.js's built-in request origin checks for server actions/API routes — state-changing requests (POST/PATCH/DELETE) are not accepted from unexpected origins.

## Secrets Management

All credentials (database URL, Clerk secret key, WhatsApp app secret, Cloudinary keys, payment provider keys) live only in environment variables (Part 19), never committed to the repository (`.env` is git-ignored; `.env.example` documents required variables with placeholder values only).

## Encryption

- **In transit:** HTTPS enforced everywhere (no plain HTTP in any environment beyond local development).
- **At rest:** WhatsApp access tokens (Part 11) are encrypted before being stored in the database, not stored in plaintext — this is the one piece of stored data sensitive enough to warrant field-level encryption beyond the database's own storage-level protections.

## Audit Logs

Covered in Part 6/9 — sensitive actions (role changes, patient record deletion, invoice voiding) write to `audit_logs`, giving a clinic owner (and the ClinicOS team, if investigating an incident) a trustworthy record of who did what.

## Rate Limiting

Applied at the API layer (Part 2) — per-user and per-IP limits on authentication endpoints (prevent credential-stuffing/brute-force attempts, though Clerk itself provides a first line of defense here) and on any endpoint that triggers external API calls (e.g., WhatsApp sends) to prevent abuse from a compromised or malicious client from generating runaway costs.

## OWASP Top 10 — How ClinicOS Addresses Each

| Risk | ClinicOS's Mitigation |
|---|---|
| Broken Access Control | Three-layer tenant/role enforcement (Part 8) |
| Cryptographic Failures | HTTPS everywhere, encrypted tokens at rest |
| Injection | Parameterized queries via Drizzle (structural, not just discipline) |
| Insecure Design | This entire blueprint — security considered per-module (Part 9), not bolted on |
| Security Misconfiguration | Environment-based config, no secrets in code, documented deployment checklist (Part 19) |
| Vulnerable Components | Dependency updates tracked; no unmaintained/abandoned packages introduced without review |
| Authentication Failures | Delegated to Clerk (Part 7), a specialized, audited provider |
| Data Integrity Failures | Webhook signature verification (Part 7/9/11) on every external event source |
| Logging/Monitoring Failures | Structured logging + alerting (Part 19) |
| Server-Side Request Forgery | External calls only through vetted `lib/` wrappers (Part 3) with fixed, known destinations — no user-controlled URLs are ever fetched server-side |

## Security Checklist (Pre-Launch)

- [ ] Every tenant-scoped repository function requires `clinicId` explicitly
- [ ] No `dangerouslySetInnerHTML` without explicit sanitization review
- [ ] All webhook endpoints verify provider signatures
- [ ] All secrets in environment variables, `.env` git-ignored
- [ ] HTTPS enforced in all non-local environments
- [ ] WhatsApp tokens encrypted at rest
- [ ] Rate limiting active on auth and external-API-triggering endpoints
- [ ] Audit logging active for role changes, record deletion, billing/invoice voiding

## What should a developer remember?

- Security here is **structural, not just procedural** — e.g., SQL injection is prevented by the ORM's design, not by developers remembering to sanitize input each time. Favor this kind of "impossible to get wrong" mitigation wherever feasible.
- **Never store secrets in code or commit `.env`** — this is the most common accidental leak in small teams and is treated as a critical error, not a minor mistake.
- Treat this chapter's checklist as a **gate before any production deploy**, not a one-time exercise.

---

# PART 18 — Testing

## Purpose & Why This Exists

Testing gives confidence that a change didn't silently break something else — especially important for a solo/small team where there isn't a large QA function to manually catch regressions before customers do.

## Unit Tests

Cover individual service-layer functions in isolation (repositories mocked) — e.g., "does `bookAppointment` reject a past `startTime`?" Focused on business logic correctness (Part 9's "Business Rules" sections are effectively a checklist of unit tests to write per module).

## Integration Tests

Cover a service + real (test) database together — e.g., "does booking two overlapping appointments for the same doctor actually get rejected by the database constraint (Part 6), not just the application check?" These are what actually validate the defense-in-depth layers (Part 8) are all genuinely working together, not just individually correct in isolation.

## Manual Tests

Pre-release checklist for flows that are hard to fully automate early on (e.g., the WhatsApp Embedded Signup flow, Part 11, which involves a real third-party popup) — tracked as a checklist run before each release until automated E2E coverage (below) matures.

## End-to-End (E2E) Tests

Simulate a real user flow through the actual UI — e.g., "sign up as a new clinic → invite a staff member → book an appointment → confirm a WhatsApp reminder job was scheduled." These are the highest-confidence, highest-cost tests — reserved for the most business-critical flows (signup, booking, billing) rather than every possible screen.

## Acceptance Tests

Tied directly to Part 1's product goals — e.g., "a new clinic can go from signup to a booked appointment in under 15 minutes" is both a product goal *and* a testable acceptance criterion; these tests validate the product meets its own stated purpose, not just that code doesn't crash.

## Performance Tests

Focused on the two areas most likely to degrade with scale: dashboard/report queries (Part 15) under a large number of patients/appointments, and the notification worker's throughput (Part 16) under a large daily reminder volume.

## Regression Tests

Any bug fixed in production gets a corresponding test added (unit or integration, whichever level would have caught it) **before** the fix is merged — prevents the same bug from silently returning in a future change.

## Testing Checklist (Per Feature/PR)

- [ ] New business rule has a unit test
- [ ] New database constraint has an integration test proving it's actually enforced
- [ ] New critical user flow has E2E coverage (or is added to the manual checklist if not yet automatable)
- [ ] Any bug fix includes a regression test reproducing the original bug

## What should a developer remember?

- **Unit tests validate business rules (Part 9); integration tests validate that defense-in-depth layers (Part 8) actually hold together** — these test different things and both are needed.
- E2E tests are **reserved for the highest-value flows** (signup, booking, billing) — not a requirement for every screen, to keep the test suite fast and maintainable for a small team.
- **Every production bug fix ships with a regression test** — this is non-negotiable and is what prevents the same class of bug from recurring.

---

*End of Part 18.*

---

# PART 19 — Deployment

## Purpose & Why This Exists

This chapter defines how code goes from a developer's machine to something a real clinic is using — reliably, safely, and reversibly if something goes wrong.

## Environments

| Environment | Purpose |
|---|---|
| Development | Local machine, local/test database, test-mode Clerk/WhatsApp/payment credentials |
| Staging | Mirrors production configuration, used to verify a release before it reaches real clinics, seeded with realistic (fake) data |
| Production | Real clinics' real data — highest caution, changes only via the deployment process below, never manual edits |

## CI/CD

Every pull request (Part 5) automatically runs: type-checking (TypeScript), linting, unit tests, and integration tests (Part 18) — a PR cannot be merged if any of these fail. On merge to `main`, an automated pipeline deploys to staging; production deploys are a deliberate, separate promotion step (not automatic on every merge), giving a final human checkpoint before real clinics are affected.

## Environment Variables

Documented in `.env.example` (Part 17) — every required variable listed with a placeholder, so a new developer knows exactly what they need to configure locally without guessing. Production environment variables are managed through the hosting platform's secret management (never emailed, Slacked, or committed anywhere).

## Monitoring

- **Application errors:** captured with stack traces and enough context (which clinic, which endpoint) to debug — but never logging sensitive patient data directly in error payloads (Part 17).
- **Queue health:** Part 16's DLQ size and failure rates surfaced on an internal dashboard.
- **Uptime:** basic external uptime monitoring pinging the production app, alerting the team if it becomes unreachable.

## Logging

Structured logs (consistent, machine-parseable format, not free-text) tagged with `clinic_id` (when applicable) and a request ID, so a single request's full journey through the layers (Part 2) can be traced end to end when debugging an issue a clinic reports.

## Backups

Automated daily database backups, retained for a defined window (e.g., 30 days), stored separately from the primary database — this is patient data; backup reliability is treated as seriously as the application's uptime itself.

## Disaster Recovery

A documented, periodically-tested restore process (not just "we have backups" but "we've actually verified we can restore from one") — including a defined target for how much data loss (time since last backup) and downtime would be acceptable in a worst-case scenario, so the team isn't figuring this out for the first time during an actual incident.

## What should a developer remember?

- **Production deploys are a deliberate promotion step**, not automatic — this is the last human checkpoint before real clinic data is affected.
- **Every environment variable is documented in `.env.example`** — a new developer should never need to ask "what env vars do I need?"
- **Backups are only real if restore has been tested** — an untested backup is a false sense of security.

---

# PART 20 — Future Roadmap

## Purpose & Why This Exists

This chapter makes explicit what's *intentionally deferred* — so a developer never mistakes a missing V2/V3 feature for an oversight, and so architectural decisions in earlier parts (multi-tenancy from day one, provider-agnostic notifications, etc.) can be understood as investments toward this roadmap rather than speculative complexity.

## Version 1 (Current Scope — Parts 1–19 as documented)

Appointments, Patients, Staff/roles, WhatsApp notifications, clinic subscription billing, patient invoicing, basic reports, single-branch clinics.

## Version 2

- **Treatment / clinical records:** structured records beyond the free-text `notes` field on patients (Part 6) — prescriptions, diagnosis history, attached documents (via the Cloudinary storage layer already in place, Part 3).
- **Patient self-service portal:** patients book/view/cancel their own appointments directly, and receive/view invoices — extends the existing Appointments/Invoices data model rather than replacing it.
- **Additional notification channels:** Email and SMS, added as new providers to the already-provider-agnostic Notification Engine (Part 10) — validates that the Part 10 architecture decision pays off as intended.
- **Working-hours enforcement:** `staff_profiles.working_hours` (Part 6/9) becomes a hard constraint on booking, not just informational.

## Version 3 / Multi-Branch & Enterprise

- **Branches:** `branches` table under `clinics` (Part 8's forward-compatible design), letting a multi-location clinic chain manage locations centrally while keeping one billing relationship.
- **Database-per-tenant option:** offered as a premium enterprise isolation tier for customers with strict compliance requirements (Part 8), without re-architecting the core product.
- **Consolidated multi-branch billing and reporting** (Part 9's Billing and Reports modules extended, not replaced).

## AI Features (Exploratory, Not Committed)

Possible future directions once the core product and data model are mature: AI-assisted scheduling suggestions (best available slot given constraints), automated no-show risk flagging based on historical patterns, AI-drafted clinical note summarization — all explicitly **exploratory**, dependent on having a solid, trustworthy core product first (Part 1's mission is the front desk, not AI as the headline feature).

## Public API

Once the core product is stable, a versioned public API (distinct from the internal API in Part 12) would let third-party health-tech tools (lab systems, pharmacy systems) integrate with ClinicOS — deferred until there's real customer demand for specific integrations, rather than built speculatively (Part 5, YAGNI applied at the roadmap level).

## Mobile App

A dedicated mobile app (beyond the already-responsive web app, Part 13) is deferred until usage patterns show a clear need beyond what a responsive web app on a phone/tablet already covers — avoids building a second frontend prematurely.

## Integrations

Longer-term candidates: accounting software (for invoice/revenue sync), insurance claim systems, lab result systems — each would follow the same "wrap external services" pattern established in Part 3.

## What should a developer remember?

- **Nothing in this roadmap is built in V1** — if a future-phase feature seems "easy to just add now," check whether it's actually justified yet (Part 5, YAGNI) or whether it's premature.
- Several V1 architectural decisions — multi-tenancy (Part 8), provider-agnostic notifications (Part 10), the `lib/` external-service-wrapper pattern (Part 3) — exist specifically **because** of this roadmap, even though V1 doesn't use their full extensibility yet.
- AI features are **exploratory, not promised** — don't let roadmap speculation drive V1 architecture decisions beyond what's already deliberately built in.

---

*End of Part 20.*

---

# PART 21 — Developer Guide

## Purpose & Why This Exists

A practical, step-by-step reference for the most common development tasks, so nobody has to reconstruct "how do I do X" from first principles each time — every step below points back to the relevant chapter for the *why*.

## How to Start the Project Locally

1. Clone the repo, `npm install`.
2. Copy `.env.example` → `.env`, fill in local/test credentials (test-mode Clerk, WhatsApp sandbox, local Postgres URL) — see Part 19.
3. Run database migrations (`drizzle-kit push` or equivalent) — see Part 6.
4. Start the dev server; sign up as a test clinic through the normal signup flow (Part 7) — there is no special "seed admin account," reinforcing that the real signup flow is always exercised, even in development.

## How to Create a New Module

1. Create `src/modules/<name>/` with `.service.ts`, `.repository.ts`, `.validation.ts`, `.types.ts`, `components/` — matching Part 4's standard shape.
2. Add the database table(s) under `src/db/schema/` with `clinic_id` if tenant-scoped (Part 6/8) — generate and review the migration.
3. Add API routes under `src/app/api/<name>/` following Part 12's documentation format — document the endpoint *before or alongside* writing it, not after.
4. Add the page(s) under `src/app/(dashboard)/<name>/` — reuse generic components from `src/components/ui` (Part 13).
5. Write the module's chapter in this blueprint (Part 9's structure) — a module isn't considered complete until it's documented the same way every other module is.

## How to Create a New API Endpoint (Within an Existing Module)

1. Define the request/response shape and validation schema in `.validation.ts`.
2. Implement the business logic in `.service.ts` (never directly in the route handler — Part 14).
3. Add any needed repository function, requiring `clinicId` explicitly if tenant-scoped (Part 8).
4. Wire the route handler in `src/app/api/...` — thin, just parses input, calls the service, returns the standard response shape (Part 2).
5. Document it per Part 12's format.
6. Add unit/integration tests per Part 18's checklist.

## How to Create a Migration

1. Edit the relevant file(s) under `src/db/schema/`.
2. Run the migration generation command — review the generated SQL before applying (Part 6).
3. For destructive changes, follow the two-step rollout described in Part 6 (stop using the column in code first, drop it in a later migration).

## How to Add a New Notification Type

1. Define the new template (wording + placeholders) — submit for provider approval if it's a WhatsApp template (Part 11's Meta review requirement).
2. Add the new `type` enum value to the `notifications` table (Part 6) via migration.
3. Add the scheduling logic in the relevant module's service (e.g., a new reminder timing added to Appointment Service, Part 9) — it calls into the existing Notification Service, it doesn't duplicate scheduling logic.
4. No changes needed to the Notification Engine itself if using the existing WhatsApp provider — this is the payoff of Part 10's provider-agnostic design.

## How to Add a New Role

1. Add the new role to the `role` enum on `memberships` (Part 6).
2. Update the permission table in Part 8 — this document update is not optional, it's the source of truth other developers will check.
3. Update every service-layer permission check that currently enumerates roles explicitly (Part 8's authorization is enforced in code, so a new role must be added everywhere the existing roles are checked — there is intentionally no single "permissions config file" abstraction yet, per Part 5's YAGNI; if role complexity grows significantly, revisit this as a future refactor).

## How to Debug a Cross-Tenant Data Concern

1. Check the repository function's signature — does it require `clinicId`? (Part 8)
2. Check the service call — is `clinicId` sourced from `ctx` (resolved session), not from request input? (Part 8)
3. Check `audit_logs` (Part 6) for a trail of what happened, if the concern involves a specific record.

## Common Mistakes to Avoid

- Writing a database query inside a service file instead of a repository (Part 2/14).
- Accepting `clinicId` from request body/params instead of the resolved session context (Part 8 — this is the single most important mistake to avoid in the entire codebase).
- Adding a new top-level folder instead of following feature-first structure (Part 4).
- Sending a notification synchronously inside a request handler instead of scheduling a background job (Part 2/10/16).
- Hardcoding message text instead of using the Template Engine (Part 10).

## Project Conventions Recap

See Part 5 in full — naming, git strategy, and the four non-negotiable Architecture Rules.

## What should a developer remember?

- This chapter is a **checklist, not a replacement** for understanding the "why" in earlier chapters — always cross-reference back when a step feels unclear.
- **Documentation is part of "done"** — a module or endpoint isn't complete until it's written up per Part 9/12's format, not just working code.
- The **most common and most costly mistake** in this entire codebase is a `clinicId` sourced from the wrong place — every code review should specifically check for this.

---

# PART 22 — Decision Log

## Purpose & Why This Exists

A single running list of every major architectural decision, why it was made, and what was rejected — so nobody re-litigates a settled decision without first understanding why it was made this way, and so a future developer can revisit a decision deliberately if circumstances genuinely change.

| # | Decision | Reason | Alternatives Considered | Impact |
|---|---|---|---|---|
| 1 | Layered monolith over microservices | Small team, no current scale need; simpler to build/debug/deploy (Part 2) | Microservices | Faster V1 delivery; can extract services later if needed |
| 2 | Next.js + TypeScript for full stack | One codebase, one language, strong type-safety for tenant isolation (Part 3) | Separate React SPA + Express/NestJS; Django/Rails | Shared types between frontend/backend; single deploy pipeline |
| 3 | PostgreSQL over NoSQL | Clinic data is inherently relational (Part 3) | MongoDB | Strong relational integrity via constraints (Part 6) |
| 4 | Drizzle over Prisma | Lighter weight, closer to SQL, strong TypeScript inference (Part 3) | Prisma, raw SQL | Type-safe queries catch tenant-isolation bugs at compile time |
| 5 | Clerk for authentication | Avoid building security-critical auth in-house; strong "organizations" primitive fits multi-tenancy (Part 3/7) | Custom auth, Auth0, Firebase Auth | Reduced security risk; faster implementation of Part 8's model |
| 6 | Shared database with `clinic_id` isolation over database-per-tenant | Strong practical isolation at much lower operational cost at current scale (Part 8) | Database-per-tenant, schema-per-tenant | Simpler operations now; database-per-tenant reserved as a future enterprise option |
| 7 | Subscription pricing over one-time license or per-appointment fee | Predictable recurring revenue, aligns price with ongoing value (Part 1) | One-time license, per-appointment fee | Sustainable business model; per-message costs (WhatsApp) handled as a separate add-on concern |
| 8 | WhatsApp as the sole V1 notification channel | Directly serves the core USP — patients already use WhatsApp daily (Part 1/11) | Email-first, SMS-first | Higher expected reminder open/engagement rate; Email/SMS deferred to V2 (Part 20) |
| 9 | Provider-agnostic Notification Engine from V1, despite only one provider existing | Email/SMS are concretely on the roadmap (Part 1/20), not speculative | Hardcode WhatsApp-specific logic throughout | Adding future channels requires no engine rewrite (Part 10) |
| 10 | Feature-first folder structure over type-first | Easier to reason about one feature in isolation; avoids "God folders" (Part 4) | Type-first (`controllers/`, `services/` top-level folders) | Predictable structure for new modules and AI-assisted development |
| 11 | Separate `subscriptions` (platform billing) and `invoices` (patient billing) tables | These are genuinely different business relationships and must never be conflated (Part 6/9) | Single unified "billing" table | Clearer domain model; prevents a class of billing logic bugs |
| 12 | Soft deletes for patients/appointments/invoices | Legal/business need to retain historical records (Part 6) | Hard deletes | Slightly more complex queries (must filter `deleted_at`); preserves audit/history integrity |

## What should a developer remember?

- **Every entry here is a considered tradeoff, not an assumption** — if a decision seems wrong in hindsight, the correct response is to propose revisiting it explicitly (updating this log), not to quietly work around it in code.
- This log should be **updated whenever a new major architectural decision is made** — future developers (and AI assistants) rely on it the same way this document relied on it being kept current from the start.

---

*End of Part 22 — End of Blueprint.*

## Document Complete

All 22 parts are now written into this single file: **product vision → architecture → stack → folder structure → coding standards → database → auth → multi-tenancy → every module → notifications → WhatsApp → API docs → frontend → backend → caching → jobs → security → testing → deployment → roadmap → developer guide → decision log.**

This is meant to be a living document — as real development surfaces edge cases this blueprint didn't anticipate, or business decisions get finalized (e.g., exact pricing tiers in Part 9, the suspended-clinic access policy in Part 9's Billing module), come back and update the relevant chapter so it stays the single source of truth, per this document's own opening principle.

"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  Check,
  CheckCheck,
  FileText,
  LineChart,
  MessageCircle,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

/* -------------------------------------------------------------------------- */
/*  Shared helpers                                                            */
/* -------------------------------------------------------------------------- */

const EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";
const EM_CLASS = "font-accent font-normal italic text-deep-teal";

function useInView<T extends Element>(threshold = 0.15): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState<boolean>(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Same API as the shared <Reveal>. Swap for your shared one if you prefer.
function Reveal({ children, className, delay = 0 }: RevealProps) {
  const [ref, visible] = useInView<HTMLDivElement>(0.12);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-[opacity,transform] duration-[750ms]",
        EASE,
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

function popClass(on: boolean): string {
  return cn(
    "transition-[opacity,transform] duration-500",
    EASE,
    on ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0",
  );
}

function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-[1200px] px-4 sm:px-6", className)}>{children}</div>;
}

function MicroLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-deep-teal",
        className,
      )}
    >
      {children}
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demo frame + feature row                                                  */
/* -------------------------------------------------------------------------- */

function DemoFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-[14px] border border-shadow-blue/10 bg-white p-5 shadow-[0_18px_44px_-26px_rgba(26,46,53,0.28)]">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-shadow-blue-light/60">
          {label}
        </span>
        <span className="rounded-full bg-sage-mist px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-deep-teal">
          Sample
        </span>
      </div>
      {children}
    </div>
  );
}

interface FeatureRowProps {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string;
  hint: string;
  demoLabel: string;
  children: ReactNode;
}

function FeatureRow({ id, icon: Icon, title, body, hint, demoLabel, children }: FeatureRowProps) {
  return (
    <Reveal className="border-t border-shadow-blue/10 py-12 first:border-t-0 first:pt-0 last:pb-0">
      <article id={id} className="grid scroll-mt-28 items-start gap-8 md:grid-cols-2 md:gap-10">
        <div>
          <span className="grid size-9 place-items-center rounded-[10px] bg-sage-mist text-deep-teal">
            <Icon className="size-[18px]" strokeWidth={1.8} aria-hidden />
          </span>
          <h3 className="mt-5 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-shadow-blue">
            {title}
          </h3>
          <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-shadow-blue-light">
            {body}
          </p>
          <p className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-shadow-blue-light/60">
            <span className="size-1 shrink-0 rounded-full bg-deep-teal/50" />
            {hint}
          </p>
        </div>
        <DemoFrame label={demoLabel}>{children}</DemoFrame>
      </article>
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chapter layout: big numeral + sticky heading on the left                  */
/* -------------------------------------------------------------------------- */

interface ChapterProps {
  number: string;
  kicker: string;
  title: ReactNode;
  intro: string;
  tone?: "plain" | "sage";
  children: ReactNode;
}

function Chapter({ number, kicker, title, intro, tone = "plain", children }: ChapterProps) {
  return (
    <section
      className={cn(
        "border-t border-shadow-blue/10 py-20 sm:py-28",
        tone === "sage" && "border-b bg-sage-mist/40",
      )}
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[300px_1fr] lg:gap-16">
          <header className="self-start lg:sticky lg:top-28">
            <Reveal>
              <span
                aria-hidden
                className="block font-display text-[72px] font-medium leading-none tracking-[-0.06em] text-deep-teal/20 sm:text-[96px]"
              >
                {number}
              </span>
            </Reveal>
            <Reveal delay={80}>
              <MicroLabel className="mt-5">{kicker}</MicroLabel>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="mt-3 text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-shadow-blue sm:text-[34px]">
                {title}
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-shadow-blue-light">
                {intro}
              </p>
            </Reveal>
          </header>

          <div>{children}</div>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero: the visit journey                                                   */
/* -------------------------------------------------------------------------- */

interface JourneyStep {
  label: string;
  title: string;
  note: string;
  icon: LucideIcon;
  href: string;
}

const JOURNEY: readonly JourneyStep[] = [
  {
    label: "Book",
    title: "Appointment calendar",
    note: "Each doctor’s day, by time.",
    icon: CalendarCheck2,
    href: "#calendar",
  },
  {
    label: "Remind",
    title: "WhatsApp reminders",
    note: "Sent ahead of the visit.",
    icon: MessageCircle,
    href: "#reminders",
  },
  {
    label: "Check in",
    title: "Patient records",
    note: "Find the right record.",
    icon: FileText,
    href: "#records",
  },
  {
    label: "Bill",
    title: "Invoices",
    note: "Kept with the appointment.",
    icon: Receipt,
    href: "#billing",
  },
  {
    label: "Review",
    title: "Clinic insights",
    note: "The week at a glance.",
    icon: LineChart,
    href: "#insights",
  },
];

function JourneyRail() {
  const [ref, inView] = useInView<HTMLOListElement>(0.3);

  return (
    <ol ref={ref} className="grid gap-8 lg:grid-cols-5 lg:gap-6">
      {JOURNEY.map((step, i) => {
        const Icon = step.icon;
        const isLast = i === JOURNEY.length - 1;

        return (
          <li key={step.label} className="relative">
            <a href={step.href} className="group flex gap-4 lg:block">
              <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full border border-shadow-blue/15 bg-white text-deep-teal transition-colors group-hover:border-deep-teal group-hover:bg-deep-teal group-hover:text-sterile-white">
                <Icon className="size-4" strokeWidth={1.8} aria-hidden />
              </span>
              <span className="block lg:mt-5">
                <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-deep-teal">
                  {String(i + 1).padStart(2, "0")} · {step.label}
                </span>
                <span className="mt-1.5 block text-[15px] font-semibold tracking-tight text-shadow-blue">
                  {step.title}
                </span>
                <span className="mt-1 block text-[13px] leading-relaxed text-shadow-blue-light">
                  {step.note}
                </span>
              </span>
            </a>

            {!isLast && (
              <>
                {/* Desktop connector: draws in from left to right */}
                <span
                  aria-hidden
                  className="absolute -right-5 left-[3.25rem] top-5 hidden h-px bg-shadow-blue/15 lg:block"
                >
                  <span
                    className={cn(
                      "block h-full origin-left bg-deep-teal/60 transition-transform duration-[900ms]",
                      EASE,
                      inView ? "scale-x-100" : "scale-x-0",
                    )}
                    style={{ transitionDelay: `${i * 220}ms` }}
                  />
                </span>
                {/* Mobile connector */}
                <span
                  aria-hidden
                  className="absolute bottom-[-1.5rem] left-5 top-[3.25rem] w-px bg-shadow-blue/15 lg:hidden"
                />
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demo: appointment calendar (interactive)                                  */
/* -------------------------------------------------------------------------- */

type SlotKind = "booked" | "open";

interface CalendarSlot {
  time: string;
  kind: SlotKind;
  who?: string;
}

const CALENDAR_SLOTS: readonly CalendarSlot[] = [
  { time: "09:00", kind: "booked", who: "A. Sharma" },
  { time: "09:30", kind: "open" },
  { time: "10:00", kind: "booked", who: "M. Shah" },
  { time: "10:30", kind: "open" },
  { time: "11:00", kind: "open" },
  { time: "11:30", kind: "booked", who: "K. Rao" },
];

function CalendarDemo() {
  const [mine, setMine] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSelect = (slot: CalendarSlot): void => {
    if (slot.kind === "booked") {
      setNotice(`${slot.time} is already booked. Choose another time.`);
      return;
    }
    setNotice(null);
    setMine(slot.time);
  };

  const message =
    notice ??
    (mine ? `Booked for ${mine}. Tap another open time to move it.` : "Try an open time, or a booked one.");

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-shadow-blue">Dr. Iyer</p>
        <p className="font-mono text-[10px] text-shadow-blue-light/60">Tuesday</p>
      </div>

      <ul className="space-y-1.5">
        {CALENDAR_SLOTS.map((slot) => {
          const isMine = mine === slot.time;
          const isBooked = slot.kind === "booked";

          return (
            <li key={slot.time}>
              <button
                type="button"
                onClick={() => handleSelect(slot)}
                aria-disabled={isBooked}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  isBooked && "cursor-not-allowed border-shadow-blue/[0.08] bg-sterile-white",
                  !isBooked &&
                    !isMine &&
                    "border-dashed border-shadow-blue/25 hover:border-deep-teal/50 hover:bg-sage-mist/50",
                  isMine && "border-deep-teal bg-deep-teal text-sterile-white",
                )}
              >
                <span
                  className={cn(
                    "w-11 shrink-0 font-mono text-[11px]",
                    isMine ? "text-sterile-white/80" : "text-shadow-blue-light/70",
                  )}
                >
                  {slot.time}
                </span>
                {isBooked && <span aria-hidden className="h-5 w-1 shrink-0 rounded-full bg-deep-teal/70" />}
                <span
                  className={cn(
                    "flex-1 text-[12px]",
                    isBooked && "font-medium text-shadow-blue",
                    !isBooked && !isMine && "text-shadow-blue-light/70",
                    isMine && "font-medium",
                  )}
                >
                  {isBooked ? slot.who : isMine ? "New booking" : "Open"}
                </span>
                {isMine && <Check className="size-3.5" strokeWidth={2.5} aria-hidden />}
              </button>
            </li>
          );
        })}
      </ul>

      <p
        aria-live="polite"
        className={cn(
          "mt-3 flex min-h-[1.25rem] items-center gap-2 font-mono text-[10px]",
          notice ? "text-shadow-blue" : "text-shadow-blue-light/60",
        )}
      >
        {notice && <span className="size-1.5 shrink-0 rounded-full bg-soft-coral" />}
        {message}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demo: WhatsApp reminder                                                   */
/* -------------------------------------------------------------------------- */

function ReminderDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);

  return (
    <div ref={ref}>
      <div className="flex items-center gap-2.5 border-b border-shadow-blue/[0.08] pb-3">
        <span className="grid size-7 place-items-center rounded-full bg-deep-teal text-sterile-white">
          <MessageCircle className="size-3.5" strokeWidth={1.8} aria-hidden />
        </span>
        <div className="leading-tight">
          <p className="text-[12px] font-semibold text-shadow-blue">Your clinic</p>
          <p className="font-mono text-[10px] text-shadow-blue-light/60">WhatsApp</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div
          style={{ transitionDelay: "150ms" }}
          className={cn(
            "max-w-[90%] origin-top-left rounded-xl rounded-tl-sm bg-sage-mist px-3 py-2.5",
            popClass(inView),
          )}
        >
          <p className="text-[12px] leading-relaxed text-shadow-blue">
            Hi Arjun, a reminder about your visit with Dr. Iyer tomorrow at{" "}
            <span className="font-mono">10:30</span>.
          </p>
          <CheckCheck className="ml-auto mt-1 size-3.5 text-deep-teal" aria-hidden />
        </div>

        <div
          style={{ transitionDelay: "650ms" }}
          className={cn(
            "ml-auto w-fit origin-top-right rounded-xl rounded-tr-sm bg-deep-teal px-3 py-2",
            popClass(inView),
          )}
        >
          <p className="text-[12px] font-medium text-sterile-white">Thanks, confirmed</p>
        </div>
      </div>

      <p className="mt-4 font-mono text-[10px] text-shadow-blue-light/60">
        Scheduled ahead of the appointment
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demo: patient records (interactive search)                                */
/* -------------------------------------------------------------------------- */

interface PatientRecord {
  id: string;
  name: string;
  initials: string;
  last: string;
  note: string;
}

const PATIENTS: readonly PatientRecord[] = [
  { id: "p1", name: "Aarav Sharma", initials: "AS", last: "12 Jun", note: "Follow-up visit" },
  { id: "p2", name: "Meera Shah", initials: "MS", last: "03 Jun", note: "Seasonal allergy" },
  { id: "p3", name: "Kabir Rao", initials: "KR", last: "28 May", note: "New patient" },
  { id: "p4", name: "Sana Khan", initials: "SK", last: "21 May", note: "Child, fever" },
];

function PatientRecordDemo() {
  const [query, setQuery] = useState<string>("");
  const q = query.trim().toLowerCase();
  const results = q
    ? PATIENTS.filter((p) => p.name.toLowerCase().includes(q))
    : PATIENTS.slice(0, 3);

  return (
    <div>
      <label className="flex items-center gap-2 rounded-lg border border-shadow-blue/10 bg-sterile-white px-3 py-2.5 focus-within:border-deep-teal/50">
        <Search className="size-3.5 shrink-0 text-shadow-blue-light/60" aria-hidden />
        <span className="sr-only">Search sample patients</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try “sha” or “rao”"
          autoComplete="off"
          className="w-full bg-transparent text-[12px] text-shadow-blue placeholder:text-shadow-blue-light/50"
        />
      </label>

      <p className="mb-2 mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-shadow-blue-light/60">
        {q
          ? `${results.length} ${results.length === 1 ? "match" : "matches"}`
          : "Recent patients"}
      </p>

      <ul className="space-y-1.5">
        {results.length === 0 ? (
          <li className="rounded-lg border border-dashed border-shadow-blue/20 px-3 py-5 text-center text-[12px] text-shadow-blue-light/70">
            No match in this sample
          </li>
        ) : (
          results.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-lg bg-sage-mist/60 px-3 py-2.5"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-deep-teal font-mono text-[10px] font-medium text-sterile-white">
                {p.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-shadow-blue">{p.name}</p>
                <p className="truncate text-[11px] text-shadow-blue-light">{p.note}</p>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-shadow-blue-light/70">
                {p.last}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demo: roles (interactive toggle)                                          */
/* -------------------------------------------------------------------------- */

type RoleId = "owner" | "doctor" | "desk";

interface RoleView {
  label: string;
  summary: string;
  sees: readonly string[];
}

const ROLE_ORDER: readonly RoleId[] = ["owner", "doctor", "desk"];

const ROLE_VIEWS: Record<RoleId, RoleView> = {
  owner: {
    label: "Owner",
    summary: "The whole clinic at a glance.",
    sees: ["Clinic overview", "Reports and billing", "Staff and settings"],
  },
  doctor: {
    label: "Doctor",
    summary: "Their own day, and their patients.",
    sees: ["Own appointments", "Patient history and notes"],
  },
  desk: {
    label: "Front desk",
    summary: "What’s needed to run the day.",
    sees: ["Daily schedule", "Bookings and check-in", "Patient contact details"],
  },
};

function RolesDemo() {
  const [active, setActive] = useState<RoleId>("owner");
  const view = ROLE_VIEWS[active];

  return (
    <div>
      <div role="group" aria-label="Choose a role" className="flex flex-wrap gap-1.5">
        {ROLE_ORDER.map((id) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActive(id)}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-[10px] font-medium transition-colors",
                isActive
                  ? "border-deep-teal bg-deep-teal text-sterile-white"
                  : "border-shadow-blue/15 bg-white text-shadow-blue-light hover:border-deep-teal/40 hover:text-deep-teal",
              )}
            >
              {ROLE_VIEWS[id].label}
            </button>
          );
        })}
      </div>

      <div key={active} className="animate-fade-up mt-5 [animation-duration:0.4s]">
        <p className="text-[13px] font-semibold text-shadow-blue">{view.summary}</p>
        <ul className="mt-3 space-y-1.5">
          {view.sees.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 rounded-lg border border-shadow-blue/[0.08] bg-sterile-white px-3 py-2 text-[12px] text-shadow-blue"
            >
              <Check className="size-3.5 shrink-0 text-deep-teal" strokeWidth={2.5} aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demo: invoice (interactive)                                               */
/* -------------------------------------------------------------------------- */

interface InvoiceLine {
  label: string;
  amount: number;
}

const INVOICE_LINES: readonly InvoiceLine[] = [
  { label: "Consultation", amount: 700 },
  { label: "Dressing", amount: 100 },
];

function BillingDemo() {
  const [paid, setPaid] = useState<boolean>(false);
  const total = INVOICE_LINES.reduce((sum, line) => sum + line.amount, 0);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] text-shadow-blue-light/70">INV-2048</p>
          <p className="mt-0.5 text-[13px] font-semibold text-shadow-blue">Aarav Sharma</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
            paid ? "bg-deep-teal text-sterile-white" : "bg-soft-coral/15 text-shadow-blue",
          )}
        >
          <span className={cn("size-1.5 rounded-full", paid ? "bg-sterile-white" : "bg-soft-coral")} />
          {paid ? "Paid" : "Due"}
        </span>
      </div>

      <ul className="mt-4 divide-y divide-shadow-blue/[0.08] border-y border-shadow-blue/[0.08]">
        {INVOICE_LINES.map((line) => (
          <li key={line.label} className="flex items-center justify-between py-2.5 text-[12px]">
            <span className="text-shadow-blue-light">{line.label}</span>
            <span className="font-mono text-shadow-blue">₹{line.amount}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[12px] font-medium text-shadow-blue">Total</span>
        <span className="font-mono text-[15px] font-semibold text-shadow-blue">₹{total}</span>
      </div>

      <button
        type="button"
        onClick={() => setPaid((prev) => !prev)}
        className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full border border-shadow-blue/15 text-[13px] font-medium text-shadow-blue transition-colors hover:border-deep-teal/40 hover:text-deep-teal"
      >
        {paid ? "Undo" : "Mark as paid"}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demo: weekly insights (hover / tap a bar)                                 */
/* -------------------------------------------------------------------------- */

interface DayCount {
  day: string;
  count: number;
}

const WEEK: readonly DayCount[] = [
  { day: "Mon", count: 8 },
  { day: "Tue", count: 12 },
  { day: "Wed", count: 10 },
  { day: "Thu", count: 14 },
  { day: "Fri", count: 11 },
  { day: "Sat", count: 16 },
];

const WEEK_MAX = Math.max(...WEEK.map((d) => d.count));
const WEEK_TOTAL = WEEK.reduce((sum, d) => sum + d.count, 0);
const BUSIEST = WEEK.reduce<DayCount>((best, d) => (d.count > best.count ? d : best), {
  day: "—",
  count: 0,
});

function ReportDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const [activeDay, setActiveDay] = useState<string>(BUSIEST.day);
  const active = WEEK.find((d) => d.day === activeDay);

  return (
    <div ref={ref}>
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[28px] font-medium leading-none text-shadow-blue">
            {active?.count ?? 0}
          </p>
          <p className="mt-1.5 text-[11px] text-shadow-blue-light">
            appointments on {active?.day ?? "—"}
          </p>
        </div>
        <p className="font-mono text-[10px] text-shadow-blue-light/60">This week</p>
      </div>

      <div className="mt-5 flex h-24 items-end gap-1.5">
        {WEEK.map((d, i) => {
          const isActive = d.day === activeDay;
          return (
            <button
              key={d.day}
              type="button"
              aria-label={`${d.day}: ${d.count} appointments`}
              aria-pressed={isActive}
              onMouseEnter={() => setActiveDay(d.day)}
              onFocus={() => setActiveDay(d.day)}
              onClick={() => setActiveDay(d.day)}
              className="flex h-full flex-1 items-end"
            >
              <span
                className={cn(
                  "block w-full rounded-t-[4px] transition-[height,background-color] duration-700",
                  EASE,
                  isActive ? "bg-deep-teal" : "bg-deep-teal/20",
                )}
                style={{
                  height: inView ? `${(d.count / WEEK_MAX) * 100}%` : "4%",
                  transitionDelay: `${i * 60}ms, 0ms`,
                }}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-2 grid grid-cols-6 gap-1.5 text-center font-mono text-[9px] text-shadow-blue-light/60">
        {WEEK.map((d) => (
          <span key={d.day}>{d.day}</span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-sterile-white px-3 py-2.5">
          <p className="font-mono text-[15px] font-medium text-shadow-blue">{WEEK_TOTAL}</p>
          <p className="mt-0.5 text-[10px] text-shadow-blue-light/70">visits this week</p>
        </div>
        <div className="rounded-lg bg-sterile-white px-3 py-2.5">
          <p className="font-mono text-[15px] font-medium text-shadow-blue">{BUSIEST.day}</p>
          <p className="mt-0.5 text-[10px] text-shadow-blue-light/70">busiest day</p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demo: multiple locations (interactive)                                    */
/* -------------------------------------------------------------------------- */

interface Branch {
  id: string;
  name: string;
  doctors: number;
  today: number;
}

const BRANCHES: readonly Branch[] = [
  { id: "c1", name: "Clinic 01", doctors: 3, today: 18 },
  { id: "c2", name: "Clinic 02", doctors: 2, today: 11 },
];

const BRANCH_MAX = Math.max(...BRANCHES.map((b) => b.today));
const ALL_LOCATIONS = "all";

function BranchDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const [selected, setSelected] = useState<string>(ALL_LOCATIONS);

  const visible =
    selected === ALL_LOCATIONS ? BRANCHES : BRANCHES.filter((b) => b.id === selected);
  const totalToday = visible.reduce((sum, b) => sum + b.today, 0);
  const totalDoctors = visible.reduce((sum, b) => sum + b.doctors, 0);

  return (
    <div ref={ref}>
      <div role="group" aria-label="Choose a location" className="flex flex-wrap gap-1.5">
        {[{ id: ALL_LOCATIONS, name: "All locations" }, ...BRANCHES].map((b) => {
          const isActive = b.id === selected;
          return (
            <button
              key={b.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setSelected(b.id)}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-[10px] font-medium transition-colors",
                isActive
                  ? "border-deep-teal bg-deep-teal text-sterile-white"
                  : "border-shadow-blue/15 bg-white text-shadow-blue-light hover:border-deep-teal/40 hover:text-deep-teal",
              )}
            >
              {b.name}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-sterile-white px-3 py-2.5">
          <p className="font-mono text-[20px] font-medium leading-none text-shadow-blue">
            {totalToday}
          </p>
          <p className="mt-1.5 text-[10px] text-shadow-blue-light/70">appointments today</p>
        </div>
        <div className="rounded-lg bg-sterile-white px-3 py-2.5">
          <p className="font-mono text-[20px] font-medium leading-none text-shadow-blue">
            {totalDoctors}
          </p>
          <p className="mt-1.5 text-[10px] text-shadow-blue-light/70">doctors</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2.5">
        {BRANCHES.map((b, i) => {
          const dimmed = selected !== ALL_LOCATIONS && selected !== b.id;
          return (
            <li
              key={b.id}
              className={cn("flex items-center gap-3 transition-opacity duration-300", dimmed && "opacity-35")}
            >
              <Building2 className="size-3.5 shrink-0 text-deep-teal" aria-hidden />
              <span className="w-16 shrink-0 text-[11px] font-medium text-shadow-blue">{b.name}</span>
              <span className="h-1.5 flex-1 rounded-full bg-shadow-blue/[0.08]">
                <span
                  className={cn(
                    "block h-full rounded-full bg-deep-teal/70 transition-[width] duration-700",
                    EASE,
                  )}
                  style={{
                    width: inView ? `${(b.today / BRANCH_MAX) * 100}%` : "0%",
                    transitionDelay: `${i * 100}ms`,
                  }}
                />
              </span>
              <span className="w-6 text-right font-mono text-[10px] text-shadow-blue-light/70">
                {b.today}
              </span>
            </li>
          );
        })}
        <li className="flex items-center gap-2 rounded-lg border border-dashed border-shadow-blue/20 px-3 py-2 text-[11px] text-shadow-blue-light/70">
          <Plus className="size-3.5" aria-hidden />
          Add a location
        </li>
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  CTA data                                                                  */
/* -------------------------------------------------------------------------- */

const INCLUDED: readonly string[] = [
  "Appointment calendar",
  "WhatsApp reminders",
  "Patient records",
  "Invoices",
  "Clinic insights",
  "Team roles",
  "Multiple locations",
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function FeaturesPage() {
  return (
    <main className="relative min-h-screen overflow-clip bg-sterile-white selection:bg-deep-teal selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="hero-orb -right-28 -top-36 h-[600px] w-[600px] bg-teal-glow opacity-40" />
        <div className="hero-orb -bottom-24 -left-40 h-[500px] w-[500px] bg-coral-glow opacity-15" />
      </div>

      <div className="relative z-10">
        {/* ------------------------------ HERO ------------------------------ */}
{/* ------------------------------ HERO ------------------------------ */}
<section className="pb-20 pt-28 sm:pt-36 md:pb-28">
  <Container>
    <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
      {/* Left: Content */}
      <div className="lg:col-span-7">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-sage-mist px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-deep-teal">
            <span className="size-1.5 animate-breathe rounded-full bg-deep-teal" />
            ClinicSeva features
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 text-balance font-display text-[44px] font-medium leading-[1.02] tracking-[-0.04em] text-shadow-blue sm:text-[64px] lg:text-[72px]">
            From booking to billing, <br />
            <em className={EM_CLASS}>in one calmer place.</em>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-6 max-w-[48ch] text-[17px] leading-[1.6] text-shadow-blue-light/80">
            Appointments, patient records, WhatsApp reminders and basic admin — a 
            straightforward workspace for small clinics, without the weight of 
            complex hospital systems.
          </p>
        </Reveal>
        <Reveal delay={220}>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#calendar"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-deep-teal px-6 text-[15px] font-medium text-sterile-white transition-all hover:bg-deep-teal-light hover:shadow-lg hover:shadow-teal-glow"
            >
              Follow a visit
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-full border border-shadow-blue/15 px-6 text-[15px] font-medium text-shadow-blue transition-colors hover:border-deep-teal/40 hover:text-deep-teal"
            >
              View plans
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Right: Impressive Image Composition */}
      <div className="relative lg:col-span-5">
        <Reveal delay={300} className="relative z-10">
          <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-sage-mist shadow-2xl">
            <Image 
              src="https://images.unsplash.com/photo-1659353888101-6e53e32515fe?q=80w=600&auto=format&fit=crop" 
              alt="Calm clinic environment"
              className="h-full w-full object-cover mix-blend-multiply opacity-90 transition-transform duration-700 hover:scale-105"
              width={1000}
              height={1200}
            />
          </div>
        </Reveal>
        
        {/* Floating Secondary Image (WhatsApp/Mobile Focus) */}
        <Reveal delay={500} className="absolute -bottom-6 -left-12 z-20 hidden w-64 sm:block">
          <div className="glass-card overflow-hidden rounded-xl border-white/40 p-2 shadow-xl">
            <div className="aspect-[3/4] overflow-hidden rounded-lg">
              <Image 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop" 
                alt="Doctor checking records"
                className="h-full w-full object-cover"
                width={300}
                height={400}
              />
            </div>
            <div className="p-3">
              <p className="font-mono text-[9px] uppercase tracking-wider text-deep-teal/60">Digital Assistant</p>
              <p className="text-[12px] font-medium text-shadow-blue">WhatsApp Reminders Active</p>
            </div>
          </div>
        </Reveal>

        {/* Decorative Element */}
        <div className="absolute -right-4 -top-4 -z-10 size-32 rounded-full border border-deep-teal/10" />
      </div>
    </div>

    {/* The Journey Rail */}
    <div className="mt-20 border-t border-shadow-blue/10 pt-10 md:mt-28">
      <Reveal>
        <MicroLabel className="mb-10 text-center lg:text-left">One visit, start to finish</MicroLabel>
      </Reveal>
      <Reveal delay={100}>
        <JourneyRail />
      </Reveal>
    </div>
  </Container>
</section>
        {/* ---------------------------- CHAPTER 01 ---------------------------- */}
        <Chapter
          number="01"
          kicker="Before the visit"
          title={
            <>
              Fill the day, <em className={EM_CLASS}>and keep it filled.</em>
            </>
          }
          intro="Booking a time and reminding the patient — the two jobs that keep a front desk on the phone."
        >
          <FeatureRow
            id="calendar"
            icon={CalendarCheck2}
            title="A clearer appointment calendar"
            body="See each doctor’s schedule by time, and check for overlaps before confirming a booking."
            hint="Interactive · tap a time"
            demoLabel="Doctor’s day"
          >
            <CalendarDemo />
          </FeatureRow>

          <FeatureRow
            id="reminders"
            icon={MessageCircle}
            title="WhatsApp confirmations and reminders"
            body="Send appointment details and scheduled reminders through WhatsApp, so patients can refer back to the time and date."
            hint="Where patients already are"
            demoLabel="Patient chat"
          >
            <ReminderDemo />
          </FeatureRow>
        </Chapter>

        {/* ---------------------------- CHAPTER 02 ---------------------------- */}
        <Chapter
          number="02"
          kicker="At the desk"
          tone="sage"
          title={
            <>
              Find the patient, <em className={EM_CLASS}>not the page.</em>
            </>
          }
          intro="When a patient walks in, the front desk and the doctor should be looking at the same record."
        >
          <FeatureRow
            id="records"
            icon={FileText}
            title="Patient records in one place"
            body="Keep contact details and visit notes together, then find the right record when a patient returns."
            hint="Interactive · try a search"
            demoLabel="Patient search"
          >
            <PatientRecordDemo />
          </FeatureRow>

          <FeatureRow
            id="roles"
            icon={ShieldCheck}
            title="Roles for the clinic team"
            body="Give owners, doctors, and front-desk staff access that fits the work they do each day."
            hint="Interactive · switch roles"
            demoLabel="Home view by role"
          >
            <RolesDemo />
          </FeatureRow>
        </Chapter>

        {/* ---------------------------- CHAPTER 03 ---------------------------- */}
        <Chapter
          number="03"
          kicker="After the visit"
          title={
            <>
              Close the loop <em className={EM_CLASS}>without the register.</em>
            </>
          }
          intro="Billing a visit and understanding the week shouldn’t mean tallying a notebook at night."
        >
          <FeatureRow
            id="billing"
            icon={Receipt}
            title="Simple invoices and billing"
            body="Create invoices and keep basic payment details close to the appointments they relate to."
            hint="Interactive · mark as paid"
            demoLabel="Invoice"
          >
            <BillingDemo />
          </FeatureRow>

          <FeatureRow
            id="insights"
            icon={LineChart}
            title="A quick view of clinic activity"
            body="Review appointments, revenue, no-shows, and busy hours without piecing the day together by hand."
            hint="Interactive · hover a bar"
            demoLabel="This week"
          >
            <ReportDemo />
          </FeatureRow>
        </Chapter>

        {/* ---------------------------- CHAPTER 04 ---------------------------- */}
        <Chapter
          number="04"
          kicker="As you grow"
          tone="sage"
          title={
            <>
              From one room <em className={EM_CLASS}>to more locations.</em>
            </>
          }
          intro="Add doctors, staff and locations without switching software."
        >
          <FeatureRow
            id="locations"
            icon={Building2}
            title="One view across clinic locations"
            body="Add doctors, staff, and locations as your practice grows, with an overview across branches."
            hint="Interactive · pick a location"
            demoLabel="Location overview"
          >
            <BranchDemo />
          </FeatureRow>
        </Chapter>

        {/* ------------------------------ SCOPE ------------------------------ */}
        <section className="py-24 sm:py-32">
          <Container>
            <div className="mx-auto max-w-[760px] text-center">
              <Reveal>
                <MicroLabel>Scope</MicroLabel>
              </Reveal>
              <Reveal delay={80}>
                <p className="mt-5 text-balance font-accent text-[28px] italic leading-[1.25] text-shadow-blue sm:text-[38px]">
                  Made for the front desk of a small clinic,{" "}
                  <span className="text-deep-teal">not for hospital wards.</span>
                </p>
              </Reveal>
              <Reveal delay={160}>
                <p className="mx-auto mt-6 max-w-[52ch] text-[15px] leading-relaxed text-shadow-blue-light">
                  Everything above is built around appointments, records, reminders and basic
                  billing. If you run inpatient wards, a hospital-management system is likely the
                  better fit.
                </p>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* ------------------------------- CTA ------------------------------- */}
        <section id="cta" className="px-4 pb-24 sm:px-6 sm:pb-32">
          <Reveal>
            <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[16px] bg-deep-teal">
              <div
                aria-hidden
                className="animate-scan-line absolute inset-x-0 h-px bg-white/20"
              />

              <div className="relative p-8 sm:p-10 md:p-12">
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-2xl">
                    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-sterile-white/60">
                      A straightforward next step
                    </p>
                    <h2 className="mt-3 text-balance font-display text-[28px] font-medium leading-tight tracking-tight text-sterile-white sm:text-[36px]">
                      See how ClinicSeva fits{" "}
                      <em className="font-accent font-normal italic text-sage-mist">your clinic.</em>
                    </h2>
                    <p className="mt-3 max-w-[55ch] text-[14px] leading-relaxed text-sterile-white/70">
                      Explore the plans, or talk with our team about the way your clinic works.
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                    <Link
                      href="/contact"
                      className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-sterile-white px-5 text-[14px] font-semibold text-deep-teal transition-colors hover:bg-sage-mist"
                    >
                      Talk to our team
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                      href="/pricing"
                      className="inline-flex h-11 items-center justify-center rounded-full border border-white/25 px-5 text-[14px] font-medium text-sterile-white transition-colors hover:bg-white/10"
                    >
                      View pricing
                    </Link>
                  </div>
                </div>

                <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/15 pt-6">
                  {INCLUDED.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-sterile-white/70"
                    >
                      <Check className="size-3 text-sage-mist" strokeWidth={2.5} aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
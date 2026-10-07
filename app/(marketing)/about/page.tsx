"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  MessageSquare,
  CalendarClock,
  CheckCircle2,
  ArrowRight,
  HeartHandshake,
  Clock3,
  ShieldCheck,
} from "lucide-react";

// --- Types ---
interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

interface ProblemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  imageAlt: string;
}

interface PrincipleProps {
  title: string;
  description: string;
}

// --- Reveal Animation Helper ---
function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// --- Components ---
const ProblemCard = ({ title, description, icon, image, imageAlt }: ProblemProps) => (
  <div className="group glass-card rounded-2xl overflow-hidden flex flex-col h-full p-0 hover:border-white/40">
    <div className="relative h-48 overflow-hidden bg-sage-mist">
      <img
        src={image}
        alt={imageAlt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-shadow-blue/20 to-transparent" />
      <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-deep-teal shadow-sm">
        {icon}
      </div>
    </div>
    <div className="p-7 flex flex-col gap-3">
      <h3 className="text-[17px] font-semibold tracking-tight text-shadow-blue">{title}</h3>
      <p className="text-[14px] leading-[1.6] text-muted-foreground">{description}</p>
    </div>
  </div>
);

const Principle = ({ title, description }: PrincipleProps) => (
  <div className="flex gap-4 group">
    <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-sage-mist flex items-center justify-center">
      <CheckCircle2 className="w-4 h-4 text-deep-teal" />
    </div>
    <div>
      <h4 className="text-[15px] font-semibold text-shadow-blue mb-1">{title}</h4>
      <p className="text-[14px] leading-[1.6] text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-sterile-white selection:bg-deep-teal selection:text-white overflow-clip">
      {/* Orbs - from global.css theme */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="hero-orb w-[640px] h-[640px] -top-32 -right-32 bg-teal-glow opacity-50" />
        <div className="hero-orb w-[520px] h-[520px] top-[55%] -left-40 bg-coral-glow opacity-20 delay-1000" />
      </div>

      <div className="relative z-10">
        {/* HERO */}
        <section className="max-w-7xl mx-auto px-6 pt-28 md:pt-36 pb-16 md:pb-24">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-start">
            <Reveal>
              <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-sage-mist text-deep-teal text-[11px] font-bold tracking-[0.12em] uppercase mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-deep-teal animate-breathe" />
                About ClinicSeva
              </span>
              <h1 className="font-display font-medium tracking-tight text-shadow-blue leading-[0.95] text-5xl md:text-[4.5rem]">
                Tools that feel like
                <br />
                <span className="font-accent italic font-normal text-deep-teal">part of the clinic,</span>
                <br />
                not extra work.
              </h1>
              <p className="mt-6 text-[18px] leading-[1.7] text-muted-foreground max-w-xl">
                Small clinics keep healthcare running, yet they still manage the day with paper diaries, phone calls, and WhatsApp. We built ClinicSeva to remove that friction — without turning a clinic into a hospital IT department.
              </p>

              <div className="mt-10 flex flex-wrap gap-8 border-t border-border/60 pt-8 max-w-xl">
                <div>
                  <p className="text-sm font-semibold text-shadow-blue">Built for independent practices</p>
                  <p className="text-sm text-muted-foreground mt-1">Not for 500-bed hospitals.</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-shadow-blue">No training needed</p>
                  <p className="text-sm text-muted-foreground mt-1">If you can use a phone, you can use this.</p>
                </div>
              </div>
            </Reveal>

            {/* Hero Image Composition */}
            <Reveal delay={120} className="relative lg:sticky lg:top-28">
              <div className="relative rounded-[1.5rem] overflow-hidden bg-sage-mist aspect-[4/4.6] border border-white/50 shadow-[0_20px_60px_-20px_rgba(26,46,53,0.18)]">
                <img
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=1200&auto=format&fit=crop"
                  alt="Doctor calmly reviewing notes in a small clinic"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-shadow-blue/30 via-transparent to-transparent" />

                {/* Floating Glass Cards */}
                <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-3">
                  <div className="glass rounded-xl p-4 flex items-center gap-3 float-element shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-deep-teal text-white flex items-center justify-center">
                      <CalendarClock className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] tracking-wide uppercase text-muted-foreground font-semibold">Next</p>
                      <p className="text-[14px] font-medium text-shadow-blue leading-tight">Aarav Sharma • 11:30 AM • Follow-up</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-soft-coral animate-breathe" />
                  </div>
                  <div className="glass-light rounded-xl p-3.5 flex items-center gap-2.5 text-[13px] text-shadow-blue float-element-d1">
                    <ShieldCheck className="w-4 h-4 text-deep-teal" />
                    Patient data stays private and secure on device
                  </div>
                </div>
              </div>

              {/* Small accent card */}
              <div className="hidden md:flex absolute -left-8 top-[18%] glass-card rounded-xl px-4 py-3 items-center gap-3 float-element-d2">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop"
                  alt="Doctor"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="leading-tight">
                  <p className="text-[12px] font-semibold text-shadow-blue">Dr. Mehta</p>
                  <p className="text-[11px] text-muted-foreground">2 min saved per patient</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* STORY */}
        <section className="bg-sage-mist/40 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <Reveal className="order-2 md:order-1 relative">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-white border border-white">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop"
                  alt="Clinic desk with appointment book and stethoscope"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-2 md:-right-6 max-w-[300px] glass rounded-xl p-5 border border-white/40 shadow-[0_12px_32px_rgba(26,46,53,0.12)]">
                <div className="flex gap-2 mb-2">
                  <Clock3 className="w-4 h-4 text-deep-teal mt-0.5" />
                  <p className="text-[13px] font-medium text-shadow-blue leading-snug">
                    &ldquo;We didn&rsquo;t want another dashboard. We wanted fewer calls, fewer no-shows, and calmer mornings.&rdquo;
                  </p>
                </div>
                <p className="text-[11px] tracking-wide uppercase text-muted-foreground font-semibold ml-6">
                  A typical clinic owner
                </p>
              </div>
            </Reveal>

            <Reveal delay={100} className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-shadow-blue">
                Why we built this
              </h2>
              <div className="mt-6 space-y-5 text-[16px] leading-[1.8] text-muted-foreground">
                <p>
                  Most software in healthcare is designed for large hospitals. It&rsquo;s powerful, but heavy — long setup, complex workflows, and pricing that doesn&rsquo;t make sense for a 1-3 doctor clinic.
                </p>
                <p>
                  On the ground, most small clinics still rely on a paper diary for appointments, a separate notebook for patient history, and WhatsApp for reminders. It works, until a diary gets lost, a message is missed, or a follow-up slips through.
                </p>
                <p className="text-shadow-blue font-medium">
                  ClinicSeva is our attempt to keep what works, and quietly fix what doesn&rsquo;t.
                </p>
                <p>
                  No bloated modules. No forced workflows. Just a simple way to manage appointments, keep patient context in one place, and send timely reminders — so staff can focus on patients, not paperwork.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* PROBLEMS */}
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-shadow-blue">
                Everyday problems,
                <br />
                solved simply.
              </h2>
            </div>
            <p className="text-[15px] leading-[1.6] text-muted-foreground max-w-sm">
              We spent time in clinics observing. The same three issues came up almost everywhere.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            <Reveal delay={0}>
              <ProblemCard
                icon={<BookOpen className="w-4 h-4" />}
                title="The paper diary trap"
                description="Notes are hard to search, easy to lose, and impossible to share across staff. Important history stays stuck on one desk."
                image="https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop"
                imageAlt="Stack of patient files and handwritten notes"
              />
            </Reveal>
            <Reveal delay={80}>
              <ProblemCard
                icon={<MessageSquare className="w-4 h-4" />}
                title="WhatsApp fatigue"
                description="Personal and clinic chats get mixed. Booking requests get buried. Staff spends hours copying times and answering the same questions."
                image="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop"
                imageAlt="Person holding phone with messages"
              />
            </Reveal>
            <Reveal delay={160}>
              <ProblemCard
                icon={<HeartHandshake className="w-4 h-4" />}
                title="Missed follow-ups"
                description="When reminders depend on memory, patients miss visits and clinics lose continuity. Gentle, automatic reminders keep care on track."
                image="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop"
                imageAlt="Calendar with appointments"
              />
            </Reveal>
          </div>
        </section>

        {/* APPROACH */}
        <section className="border-t border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20 items-start">
            <Reveal>
              <h2 className="text-3xl md:text-[2.2rem] font-display font-medium tracking-tight text-shadow-blue leading-tight">
                How we approach it
              </h2>
              <p className="mt-4 text-[15px] leading-[1.7] text-muted-foreground">
                We don&rsquo;t try to replace your workflow. We make the existing one faster and less stressful.
              </p>

              <div className="mt-10 grid gap-7">
                <Principle
                  title="Lightweight, not bloated"
                  description="Only what a small clinic actually uses: appointments, patient records, and reminders. No billing maze or inventory you never asked for."
                />
                <Principle
                  title="Mobile-first, because you are"
                  description="Doctors aren’t at desks all day. Everything works cleanly on the phone you already carry."
                />
                <Principle
                  title="Privacy by default"
                  description="Patient information is sensitive. We keep it encrypted, local-first where possible, and never use it for ads."
                />
                <Principle
                  title="Quiet by design"
                  description="No loud notifications or gamified streaks. Just calm, clear updates when they matter."
                />
              </div>
            </Reveal>

            <Reveal delay={120} className="relative">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-sage-mist border border-white">
                <img
                  src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?q=80&w=1000&auto=format&fit=crop"
                  alt="Doctor using phone in clinic"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-deep-teal/25 via-transparent to-transparent" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-4">
                  <p className="text-[11px] tracking-[0.1em] uppercase font-bold text-muted-foreground">Before</p>
                  <p className="text-[13px] leading-snug text-shadow-blue mt-1">
                    Diary + WhatsApp + calls + memory
                  </p>
                </div>
                <div className="rounded-xl p-4 bg-deep-teal text-sterile-white">
                  <p className="text-[11px] tracking-[0.1em] uppercase font-bold opacity-70">With ClinicSeva</p>
                  <p className="text-[13px] leading-snug mt-1 font-medium">One calm place for the day&apos;s work</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* CLOSING CTA */}
        <section className="px-6 pb-24 pt-4">
          <Reveal>
            <div className="max-w-7xl mx-auto relative rounded-[1.5rem] overflow-hidden bg-shadow-blue">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2000&auto=format&fit=crop"
                alt="Calm clinic interior"
                className="absolute inset-0 w-full h-full object-cover opacity-[0.18]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-shadow-blue via-shadow-blue/90 to-shadow-blue/60" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan-line" />

              <div className="relative p-8 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="max-w-xl">
                  <h3 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white leading-tight">
                    A calmer day at the clinic is possible.
                  </h3>
                  <p className="mt-4 text-[15px] leading-[1.7] text-white/65">
                    No big migration. No complicated setup. Start with appointments and reminders, and add more only if you need it.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <button className="h-11 px-6 rounded-full bg-sterile-white text-shadow-blue text-[14px] font-semibold hover:bg-white transition-colors inline-flex items-center justify-center gap-2 group">
                    Start free
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <button className="h-11 px-6 rounded-full bg-white/10 text-white border border-white/15 text-[14px] font-medium hover:bg-white/15 transition-colors">
                    Talk to us for 10 mins
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
          {/* <p className="text-center text-[12px] text-muted-foreground mt-8 tracking-wide">
            © {new Date().getFullYear()} ClinicSeva • Made for small clinics, with care.
          </p> */}
        </section>
      </div>
    </main>
  );
}
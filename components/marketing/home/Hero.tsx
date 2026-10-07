// "use client";

// import { Shield } from "lucide-react";
// import { useRef, useEffect, useState, useCallback } from "react";

// export default function Hero() {
//   const sectionRef = useRef<HTMLElement>(null);
//   const orbRef = useRef<HTMLDivElement>(null);
//   const glassRef = useRef<HTMLDivElement>(null);
//   const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

//   const handleMouseMove = useCallback((e: MouseEvent) => {
//     if (!sectionRef.current) return;
//     const rect = sectionRef.current.getBoundingClientRect();
//     setMousePos({
//       x: (e.clientX - rect.left) / rect.width,
//       y: (e.clientY - rect.top) / rect.height,
//     });
//   }, []);

//   useEffect(() => {
//     const section = sectionRef.current;
//     if (!section) return;

//     section.addEventListener("mousemove", handleMouseMove);
//     return () => section.removeEventListener("mousemove", handleMouseMove);
//   }, [handleMouseMove]);

//   // Parallax offsets
//   const orbX = (mousePos.x - 0.5) * 30;
//   const orbY = (mousePos.y - 0.5) * 30;
//   const glassX = (mousePos.x - 0.5) * -15;
//   const glassY = (mousePos.y - 0.5) * -15;

//   return (
//     <section
//       ref={sectionRef}
//       id="experience"
//       className="relative min-h-screen flex items-center justify-center overflow-hidden"
//       style={{ perspective: "1200px" }}
//     >
//       {/* Background Layers */}
//       <div className="absolute inset-0 bg-gradient-to-br from-sterile-white via-sage-mist/50 to-deep-teal/5" />

//       {/* Breathing Orbs */}
//       <div
//         ref={orbRef}
//         className="hero-orb w-[500px] h-[500px] bg-deep-teal/20 top-[10%] left-[20%] absolute"
//         style={{
//           transform: `translate(${orbX}px, ${orbY}px)`,
//         }}
//       />
//       <div
//         className="hero-orb w-[400px] h-[400px] bg-soft-coral/10 bottom-[15%] right-[15%] absolute"
//         style={{
//           animationDelay: "-2s",
//           transform: `translate(${-orbX * 0.5}px, ${-orbY * 0.5}px)`,
//         }}
//       />
//       <div
//         className="hero-orb w-[300px] h-[300px] bg-deep-teal-light/15 top-[50%] left-[60%] absolute"
//         style={{
//           animationDelay: "-1s",
//           animationDuration: "6s",
//           transform: `translate(${orbX * 0.7}px, ${orbY * 0.7}px)`,
//         }}
//       />

//       {/* Abstract geometric shapes */}
//       <div className="absolute top-[15%] right-[10%] w-64 h-64 border border-deep-teal/10 rounded-full rotate-45 float-element" />
//       <div className="absolute bottom-[20%] left-[8%] w-48 h-48 border border-soft-coral/10 rounded-full -rotate-12 float-element-d1" />
//       <div className="absolute top-[60%] right-[30%] w-32 h-32 border border-deep-teal/15 rounded-2xl rotate-12 float-element-d2" />

//       {/* Grid pattern overlay */}
//       <div
//         className="absolute inset-0 opacity-[0.03]"
//         style={{
//           backgroundImage: `linear-gradient(var(--deep-teal) 1px, transparent 1px), linear-gradient(90deg, var(--deep-teal) 1px, transparent 1px)`,
//           backgroundSize: "60px 60px",
//         }}
//       />

//       {/* Main Content */}
//       <div
//         ref={glassRef}
//         className="relative z-10 text-center px-6 max-w-5xl mx-auto"
//         style={{
//           transform: `translate(${glassX}px, ${glassY}px)`,
//         }}
//       >
//         {/* Small label */}
//         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-8 animate-fade-up">
//           <span className="w-2 h-2 rounded-full bg-deep-teal animate-pulse" />
//           <span className="font-body text-shadow-blue/60 text-sm tracking-wide">
//             Intelligent clinic management, reimagined
//           </span>
//         </div>

//         {/* Main headline */}
//         <h1 className="font-display font-800 text-[clamp(3rem,8vw,8rem)] leading-[0.9] tracking-[-0.04em] mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
//           <span className="block text-shadow-blue">Your clinic</span>
//           <span className="block gradient-text">reimagined</span>
//         </h1>

//         {/* Subheadline */}
//         <p
//           className="font-body text-shadow-blue/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up"
//           style={{ animationDelay: "0.2s" }}
//         >
//           Stop managing chaos. Start delivering care. ClinicSeva brings calm, precision, and intelligence to every corner of your practice.
//         </p>

//         {/* CTA Group */}
//         <div
//           className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
//           style={{ animationDelay: "0.3s" }}
//         >
//           <a
//             href="#demo"
//             className="group relative px-8 py-4 bg-deep-teal text-sterile-white font-body font-semibold rounded-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-deep-teal/30 hover:scale-[1.02]"
//           >
//             <span className="relative z-10 flex items-center gap-2">
//               Start Free Trial
//               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//             </span>
//             <div className="absolute inset-0 bg-gradient-to-r from-deep-teal to-deep-teal-light opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//           </a>
//           <a
//             href="#workflow"
//             className="px-8 py-4 glass text-shadow-blue font-body font-semibold rounded-full hover:bg-white/60 transition-all duration-300"
//           >
//             See How It Works
//           </a>
//         </div>

//         {/* Trust indicators */}
//         <div
//           className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-12 animate-fade-up"
//           style={{ animationDelay: "0.4s" }}
//         >
//           <div className="flex items-center gap-2">
//             <div className="flex -space-x-2">
//               {[1, 2, 3, 4].map((i) => (
//                 <div
//                   key={i}
//                   className="w-8 h-8 rounded-full bg-gradient-to-br from-deep-teal to-deep-teal-light border-2 border-sterile-white"
//                   style={{ marginLeft: i > 1 ? "-8px" : "0" }}
//                 />
//               ))}
//             </div>
//             <span className="font-body text-shadow-blue/40 text-sm">2,400+ clinics trust us</span>
//           </div>
//           <div className="flex items-center gap-1.5">
//             {[...Array(5)].map((_, i) => (
//               <div key={i} className="w-1.5 h-1.5 rounded-full bg-deep-teal" />
//             ))}
//             <span className="font-body text-shadow-blue/40 text-sm ml-1">4.9/5 rating</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Shield className="w-4 h-4 text-deep-teal/60" strokeWidth={1.5} />
//             <span className="font-body text-shadow-blue/40 text-sm">HIPAA Compliant</span>
//           </div>
//         </div>
//       </div>

//       {/* Scroll indicator */}
//       <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
//         <span className="font-body text-shadow-blue/30 text-xs tracking-widest uppercase">Scroll</span>
//         <div className="w-5 h-8 border-2 border-shadow-blue/20 rounded-full flex justify-center pt-1.5">
//           <div className="w-1 h-2 bg-deep-teal/40 rounded-full animate-bounce" />
//         </div>
//       </div>

//       {/* Edge fade */}
//       <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sterile-white to-transparent" />
//     </section>
//   );
// }

// function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
//       <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
//     </svg>
//   );
// }




import { ArrowRight, BadgeCheck, CalendarCheck2, MessageCircle, Users } from 'lucide-react'
import { Reveal } from './Reveal'

/* ---------------- Code-drawn dashboard mockup ---------------- */

const APPOINTMENTS = [
  { time: '09:00', patient: 'Ananya Sharma', doctor: 'Dr. Mehta', tag: 'Confirmed', tone: 'teal' },
  { time: '09:30', patient: 'Rohit Verma', doctor: 'Dr. Iyer', tag: 'Confirmed', tone: 'teal' },
  { time: '10:00', patient: 'Priya Nair', doctor: 'Dr. Mehta', tag: 'Unconfirmed', tone: 'coral' },
  { time: '10:30', patient: 'Arjun Patel', doctor: 'Dr. Iyer', tag: 'Reminder sent', tone: 'sage' },
] as const

function DashboardMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-shadow-blue/10 bg-white shadow-[0_24px_60px_-20px_rgba(26,46,53,0.25)]">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-shadow-blue/10 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-shadow-blue/10" />
        <span className="size-2.5 rounded-full bg-shadow-blue/10" />
        <span className="size-2.5 rounded-full bg-deep-teal/30" />
        <span className="micro-label ml-3 text-shadow-blue-light/60">clinicseva.app/today</span>
      </div>

      <div className="grid grid-cols-[44px_1fr] sm:grid-cols-[56px_1fr]">
        {/* rail */}
        <div className="flex flex-col items-center gap-4 border-r border-shadow-blue/10 bg-sterile-white py-4">
          <span className="grid size-7 place-items-center rounded-lg bg-deep-teal text-sterile-white">
            <svg viewBox="0 0 24 24" fill="none" className="size-3.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M3 12h4l2.5-5.5L14 17l2.5-5H21" /></svg>
          </span>
          <CalendarCheck2 className="size-4 text-deep-teal" />
          <Users className="size-4 text-shadow-blue/30" />
          <MessageCircle className="size-4 text-shadow-blue/30" />
        </div>

        {/* main pane */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="micro-label text-shadow-blue-light/60">Tuesday · Sunrise Dental</p>
              <p className="mt-1 text-[15px] font-semibold tracking-tight text-shadow-blue">
                Today&apos;s schedule
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-sage-mist px-2.5 py-1 font-mono text-[10px] font-medium text-deep-teal">
              <span className="pulse-dot relative inline-block size-1.5 rounded-full bg-deep-teal" />
              Live
            </span>
          </div>

          {/* KPI row */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { k: '24', l: 'appointments' },
              { k: '96%', l: 'reminded' },
              { k: '2', l: 'unconfirmed' },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-shadow-blue/10 bg-sterile-white px-3 py-2.5">
                <p className="font-mono text-lg font-medium leading-none text-shadow-blue">{s.k}</p>
                <p className="mt-1 text-[10px] text-shadow-blue-light/70">{s.l}</p>
              </div>
            ))}
          </div>

          {/* appointment rows */}
          <div className="mt-3 space-y-1.5">
            {APPOINTMENTS.map((a) => (
              <div
                key={a.time}
                className="flex items-center gap-3 rounded-xl border border-shadow-blue/[0.06] bg-white px-3 py-2"
              >
                <span className="font-mono text-[11px] font-medium text-shadow-blue-light">{a.time}</span>
                <span className="size-1 rounded-full bg-shadow-blue/20" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-shadow-blue">{a.patient}</p>
                  <p className="truncate text-[10px] text-shadow-blue-light/70">{a.doctor}</p>
                </div>
                <span
                  className={
                    a.tone === 'teal'
                      ? 'rounded-full bg-deep-teal/10 px-2 py-0.5 font-mono text-[9px] font-medium text-deep-teal'
                      : a.tone === 'coral'
                        ? 'rounded-full bg-soft-coral/15 px-2 py-0.5 font-mono text-[9px] font-medium text-[#D64545]'
                        : 'rounded-full bg-sage-mist px-2 py-0.5 font-mono text-[9px] font-medium text-shadow-blue-light'
                  }
                >
                  {a.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Floating WhatsApp reminder card ---------------- */

function WhatsAppCard() {
  return (
    <div className="msg-pop w-[248px] rounded-2xl border border-shadow-blue/10 bg-white/90 p-3 shadow-[0_16px_40px_-12px_rgba(26,46,53,0.25)] backdrop-blur-md [animation-delay:900ms]">
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-full bg-[#25D366]/15 text-[#1DA851]">
          <MessageCircle className="size-3.5" />
        </span>
        <p className="micro-label text-shadow-blue-light/70">WhatsApp · sent 24h before</p>
      </div>
      <div className="mt-2.5 rounded-xl rounded-tl-sm bg-sage-mist px-3 py-2">
        <p className="text-[11px] leading-relaxed text-shadow-blue">
          Hi Priya! Reminder: your appointment with <span className="font-medium">Dr. Mehta</span> is
          tomorrow at <span className="font-mono">10:00 AM</span>. Reply <span className="font-medium">YES</span> to confirm.
        </p>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-deep-teal">
        <BadgeCheck className="size-3.5" />
        <span className="font-mono text-[10px] font-medium">Delivered · read 2m ago</span>
      </div>
    </div>
  )
}

/* ---------------- Hero ---------------- */

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-[136px] sm:pt-[152px]">
      {/* faint paper wash, no gradient slop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(720px 360px at 18% 0%, rgba(232,240,233,0.9), transparent 70%)',
        }}
      />
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
          {/* copy */}
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-deep-teal/20 bg-white px-3.5 py-1.5">
                <span className="pulse-dot relative inline-block size-1.5 rounded-full bg-deep-teal" />
                <span className="micro-label text-deep-teal">For clinics with 1–20 staff</span>
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-6 max-w-[14ch] text-[42px] font-semibold leading-[1.04] tracking-[-0.035em] text-shadow-blue sm:text-[56px] lg:text-[64px]">
                Run your clinic,
                <br />
                not the{' '}
                <em className="font-accent font-normal italic text-deep-teal">paperwork.</em>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-shadow-blue-light">
                ClinicSeva puts appointments, patient records and automatic WhatsApp reminders in
                one calm place — so no patient is forgotten and no doctor&apos;s day is a surprise.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#cta"
                  className="group flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-deep-teal px-7 text-[15px] font-medium text-sterile-white transition-colors hover:bg-deep-teal-light"
                >
                  Start your 14-day free trial
                  <ArrowRight className="btn-arrow size-4" />
                </a>
                <a
                  href="#how-it-works"
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-shadow-blue/15 bg-white px-7 text-[15px] font-medium text-shadow-blue transition-colors hover:border-deep-teal/40 hover:text-deep-teal"
                >
                  See how it works
                </a>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-shadow-blue-light/70">
                Live in 15 minutes · No training call · No credit card
              </p>
            </Reveal>
          </div>

          {/* mockup */}
          <Reveal delay={200} className="relative">
            <DashboardMock />
            <div className="absolute -bottom-8 -left-3 sm:-left-8">
              <WhatsAppCard />
            </div>
          </Reveal>
        </div>
      </div>
      {/* spacer for the floating card overflow */}
      <div className="h-16 sm:h-20" />
    </section>
  )
}

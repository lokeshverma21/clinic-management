"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calendar, User, CreditCard, CheckCircle, ArrowRight, Clock, ShieldCheck, FileText } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Scene {
  title: string;
  subtitle: string;
  cards: {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[];
}

const scenes: Scene[] = [
  {
    title: "The Morning Pulse",
    subtitle: "Everything is where it should be, before the first patient arrives.",
    cards: [
      {
        title: "Today's Schedule",
        description: "8 patients, zero conflicts. The system already handled rescheduling when Sarah called at 6 AM.",
        icon: <Calendar className="w-5 h-5" />,
        color: "#0D4F4F",
      },
      {
        title: "Patient Prep",
        description: "Dr. Patel's first patient: Sarah Thompson. Allergies flagged. History loaded. No surprises.",
        icon: <User className="w-5 h-5" />,
        color: "#1A6B6B",
      },
      {
        title: "Room Ready",
        description: "Exam room 3 is prepped. Vitals already taken by the kiosk. The assistant has 12 minutes of buffer.",
        icon: <CheckCircle className="w-5 h-5" />,
        color: "#0D4F4F",
      },
    ],
  },
  {
    title: "The Patient Room",
    subtitle: "The doctor focuses on the patient, not the paperwork.",
    cards: [
      {
        title: "Instant History",
        description: "Complete medical history, previous visits, and medications — loaded before the patient sits down.",
        icon: <FileText className="w-5 h-5" />,
        color: "#0D4F4F",
      },
      {
        title: "Smart Alerts",
        description: "Penicillin allergy flagged. Last visit: 14 months ago. Overdue for annual checkup.",
        icon: <ShieldCheck className="w-5 h-5" />,
        color: "#FF6B6B",
      },
      {
        title: "Real-Time Notes",
        description: "Voice-to-text clinical notes that auto-populate the chart. The doctor speaks, the record updates.",
        icon: <Clock className="w-5 h-5" />,
        color: "#1A6B6B",
      },
    ],
  },
  {
    title: "The Billing Moment",
    subtitle: "Clean, accurate, and already sent. No drama.",
    cards: [
      {
        title: "Auto Invoice",
        description: "Procedure coded, insurance verified, invoice generated. Total: $240. Sent to patient and insurer.",
        icon: <CreditCard className="w-5 h-5" />,
        color: "#0D4F4F",
      },
      {
        title: "Claim Tracking",
        description: "Status: Submitted. Expected payout: 14 days. No follow-up needed — the system handles it.",
        icon: <CheckCircle className="w-5 h-5" />,
        color: "#1A6B6B",
      },
      {
        title: "Revenue Dashboard",
        description: "This month: $48,200 collected. 94% clean claim rate. Up 12% from last month.",
        icon: <ArrowRight className="w-5 h-5" />,
        color: "#0D4F4F",
      },
    ],
  },
];

export default function Transformation() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeScene, setActiveScene] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(section.children).indexOf(entry.target as Element);
            if (index >= 0) setActiveScene(index);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-20%" }
    );

    section.querySelectorAll("[data-scene]").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="workflow"
      className="relative py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sterile-white via-deep-teal/[0.02] to-sterile-white" />

      {/* Section header */}
      <div className="text-center px-6 mb-20">
        <span className="font-body text-deep-teal text-sm font-semibold tracking-widest uppercase">The Experience</span>
        <h2 className="font-display font-800 text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.03em] text-shadow-blue mt-4">
          A day in the life of
          <br />
          <span className="gradient-text">a calm clinic</span>
        </h2>
      </div>

      {/* Horizontal scroll scenes */}
      <div className="h-screen overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide px-4 md:px-8">
        <div className="flex gap-6 md:gap-8 h-full" style={{ minWidth: "fit-content" }}>
          {scenes.map((scene, index) => (
            <div
              key={index}
              data-scene
              className="h-full w-screen md:w-[85vw] lg:w-[75vw] snap-start flex flex-col justify-center px-4 md:px-8 relative"
            >
              {/* Scene background */}
              <div
                className="absolute inset-0 opacity-50 transition-opacity duration-700"
                style={{
                  background: `radial-gradient(ellipse at 30% 50%, ${scene.cards[0].color}10 0%, transparent 70%)`,
                }}
              />

              {/* Scene title */}
              <div className="relative z-10 mb-12">
                <span className="font-body text-deep-teal/60 text-xs font-semibold tracking-widest uppercase">
                  Scene {index + 1} of 3
                </span>
                <h3 className="font-display font-700 text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.02em] text-shadow-blue mt-2">
                  {scene.title}
                </h3>
                <p className="font-accent text-shadow-blue/50 text-lg md:text-xl mt-3 italic max-w-lg">
                  {scene.subtitle}
                </p>
              </div>

              {/* Floating glass cards */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {scene.cards.map((card, i) => (
                  <div
                    key={i}
                    className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden group"
                    style={{
                      animationDelay: `${i * 0.15}s`,
                      transform: `translateY(${activeScene === index ? 0 : 20}px)`,
                      opacity: activeScene === index ? 1 : 0.5,
                      transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {/* Top accent line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                      style={{ backgroundColor: card.color }}
                    />

                    {/* Scan line effect */}
                    <div className="scan-line rounded-t-2xl" />

                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${card.color}15`, color: card.color }}
                    >
                      {card.icon}
                    </div>

                    {/* Content */}
                    <h4 className="font-display font-600 text-shadow-blue text-lg mb-2">
                      {card.title}
                    </h4>
                    <p className="font-body text-shadow-blue/50 text-sm leading-relaxed">
                      {card.description}
                    </p>

                    {/* Decorative corner */}
                    <div className="absolute bottom-4 right-4 w-8 h-8 opacity-10">
                      <svg viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="1">
                        <path d="M9 1H5a2 2 0 00-2 2v4m14-4h4a2 2 0 012 2v4M9 1v14m0 0h10a2 2 0 002-2V5a2 2 0 00-2-2H9z" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scene indicator */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {scenes.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const el = sectionRef.current?.querySelectorAll("[data-scene]")[i] as HTMLElement;
                      el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
                    }}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      activeScene === index ? "bg-deep-teal w-8" : "bg-shadow-blue/20 w-2"
                    }`}
                    aria-label={`Go to scene ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edge glow */}
      <div className="absolute top-1/2 left-0 w-40 h-40 bg-deep-teal/5 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 right-0 w-40 h-40 bg-deep-teal/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
    </section>
  );
}
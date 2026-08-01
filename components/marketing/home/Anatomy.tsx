"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calendar, FileText, CreditCard, Activity, Clock, ShieldCheck, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Module {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const modules: Module[] = [
  {
    title: "Scheduling",
    description: "Intelligent booking that prevents overlaps, reduces no-shows, and maximizes your chair time.",
    icon: <Calendar className="w-6 h-6" />,
    color: "#0D4F4F",
    features: ["Smart slot allocation", "Automated reminders (SMS + email)", "Waitlist auto-fill", "Multi-provider coordination"],
  },
  {
    title: "Patient Records",
    description: "Complete, searchable, and always secure. Every detail at your fingertips — nothing lost, nothing forgotten.",
    icon: <FileText className="w-6 h-6" />,
    color: "#1A6B6B",
    features: ["Unified patient history", "Voice-to-text charting", "Allergy & medication alerts", "Seamless EHR integration"],
  },
  {
    title: "Billing & Revenue",
    description: "Clean claims, faster payments, and real-time revenue insights. The money side, finally stress-free.",
    icon: <CreditCard className="w-6 h-6" />,
    color: "#0D4F4F",
    features: ["Auto-coded invoices", "Insurance verification", "Claim status tracking", "Revenue analytics dashboard"],
  },
];

export default function Anatomy() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeModule, setActiveModule] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1,
      },
    });

    // Animate monoliths
    modules.forEach((_, i) => {
      tl.fromTo(
        `#module-${i}`,
        { opacity: 0, y: 60, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
        i * 0.2
      );
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="anatomy"
      className="relative py-32 md:py-48 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sterile-white via-sage-mist/50 to-sterile-white" />

      {/* Abstract shapes */}
      <div className="absolute top-20 right-10 w-96 h-96 border border-deep-teal/5 rounded-3xl rotate-12 float-element" />
      <div className="absolute bottom-20 left-10 w-72 h-72 border border-deep-teal/5 rounded-2xl -rotate-6 float-element-d2" />

      {/* Section header */}
      <div className="text-center px-6 mb-20">
        <span className="font-body text-deep-teal text-sm font-semibold tracking-widest uppercase">The Architecture</span>
        <h2 className="font-display font-800 text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] tracking-[-0.03em] text-shadow-blue mt-4">
          Built for integration,
          <br />
          <span className="gradient-text">designed for simplicity</span>
        </h2>
      </div>

      {/* Exploded view — three floating monoliths */}
      <div className="relative px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-12">
          {modules.map((mod, i) => (
            <div
              id={`module-${i}`}
              key={i}
              className={`relative w-full lg:w-[30%] cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                activeModule === i ? "lg:scale-105 z-10" : "lg:scale-100 z-0"
              }`}
              onMouseEnter={() => setActiveModule(i)}
              onFocus={() => setActiveModule(i)}
            >
              {/* Glass monolith */}
              <div
                className="glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden"
                style={{
                  borderTop: `4px solid ${mod.color}`,
                  boxShadow: activeModule === i ? `0 20px 60px ${mod.color}15` : "0 4px 24px rgba(26,46,53,0.08)",
                  transform: activeModule === i ? "translateY(-8px)" : "translateY(0)",
                  transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Scan line */}
                <div className="scan-line rounded-t-3xl" />

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300"
                  style={{
                    backgroundColor: `${mod.color}12`,
                    color: mod.color,
                    transform: activeModule === i ? "scale(1.1) rotate(-5deg)" : "scale(1)",
                  }}
                >
                  {mod.icon}
                </div>

                {/* Title */}
                <h3 className="font-display font-700 text-shadow-blue text-2xl md:text-3xl mb-3">
                  {mod.title}
                </h3>

                {/* Description */}
                <p className="font-body text-shadow-blue/50 text-sm leading-relaxed mb-6">
                  {mod.description}
                </p>

                {/* Features */}
                <ul className="space-y-3">
                  {mod.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-3 font-body text-shadow-blue/70 text-sm">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${mod.color}15`, color: mod.color }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Data flow lines (SVG) */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M50 0 L50 100"
                    stroke={mod.color}
                    strokeWidth="0.3"
                    strokeDasharray="2 4"
                    className="data-flow"
                  />
                  <path
                    d="M0 50 L100 50"
                    stroke={mod.color}
                    strokeWidth="0.3"
                    strokeDasharray="2 4"
                    className="data-flow"
                    style={{ animationDelay: "-0.5s" }}
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Connecting threads */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px pointer-events-none">
          <div className="absolute left-[33%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-deep-teal/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-deep-teal" />
          </div>
          <div className="absolute left-[66%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-deep-teal/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-deep-teal" />
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-16 px-6">
        <a
          href="#demo"
          className="inline-flex items-center gap-2 px-8 py-4 bg-deep-teal text-sterile-white font-body font-semibold rounded-full hover:bg-deep-teal-light transition-all duration-300 group"
        >
          Explore All Modules
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </section>
  );
}
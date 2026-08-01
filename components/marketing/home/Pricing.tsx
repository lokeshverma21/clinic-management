"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calendar, FileText, CreditCard, Crown, ArrowRight, Check, Clock } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  color: string;
  glowColor: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "For solo practitioners getting started with digital management.",
    features: ["Up to 50 appointments/month", "Basic patient records", "Email reminders", "Standard billing"],
    color: "#6B7280",
    glowColor: "rgba(107,114,128,0.15)",
  },
  {
    name: "Professional",
    price: "$79",
    period: "/month",
    description: "The complete toolkit for growing practices that demand precision.",
    features: [
      "Unlimited appointments",
      "Advanced patient records",
      "SMS + email reminders",
      "Auto-coded billing",
      "Revenue analytics",
      "Priority support",
    ],
    color: "#0D4F4F",
    glowColor: "rgba(13,79,79,0.2)",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For multi-location practices and healthcare groups.",
    features: [
      "Everything in Professional",
      "Multi-location management",
      "Custom integrations",
      "Dedicated account manager",
      "API access",
      "SLA guarantee",
      "Custom onboarding",
    ],
    color: "#1A2E35",
    glowColor: "rgba(26,46,53,0.2)",
  },
];

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activePlan, setActivePlan] = useState(1); // Professional by default
  const [scrollX, setScrollX] = useState(0);

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

    tl.fromTo(
      ".pricing-card",
      { opacity: 0, y: 60, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }
    );

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollX(e.currentTarget.scrollLeft);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative py-32 md:py-48 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sterile-white via-sage-mist/30 to-sterile-white" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-deep-teal/5 rounded-full blur-[120px]" />

      {/* Section header */}
      <div className="text-center px-6 mb-16">
        <span className="font-body text-deep-teal text-sm font-semibold tracking-widest uppercase">The Investment</span>
        <h2 className="font-display font-800 text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] tracking-[-0.03em] text-shadow-blue mt-4">
          Choose your path to
          <br />
          <span className="gradient-text">calm practice management</span>
        </h2>
        <p className="font-body text-shadow-blue/50 text-lg mt-4 max-w-lg mx-auto">
          No hidden fees. No long-term contracts. Just a platform that grows with your practice.
        </p>
      </div>

      {/* Spectrum slider */}
      <div className="relative px-6 md:px-12 max-w-6xl mx-auto mb-12">
        {/* Spectrum track */}
        <div className="spectrum-track mx-auto w-full max-w-md mb-8" />

        {/* Spectrum dots */}
        <div className="relative max-w-md mx-auto">
          {plans.map((plan, i) => (
            <button
              key={i}
              onClick={() => setActivePlan(i)}
              className={`spectrum-dot ${activePlan === i ? "active" : ""}`}
              style={{
                left: `${i * 50}%`,
                transform: activePlan === i ? "translate(-50%, -50%) scale(1.3)" : "translate(-50%, -50%)",
                boxShadow: activePlan === i ? `0 0 20px ${plan.glowColor}` : "none",
              }}
              aria-label={`Select ${plan.name} plan`}
            />
          ))}
        </div>

        {/* Plan labels below track */}
        <div className="flex justify-between max-w-md mx-auto mt-4">
          {plans.map((plan, i) => (
            <span
              key={i}
              className={`font-body text-xs font-medium transition-colors duration-300 ${
                activePlan === i ? "text-deep-teal" : "text-shadow-blue/30"
              }`}
            >
              {plan.name}
            </span>
          ))}
        </div>
      </div>

      {/* Active plan display */}
      <div className="px-6 md:px-12 max-w-5xl mx-auto">
        <div
          className="pricing-card glass-card rounded-3xl overflow-hidden relative"
          style={{
            borderTop: `4px solid ${plans[activePlan].color}`,
            boxShadow: `0 20px 60px ${plans[activePlan].glowColor}`,
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%] animate-shimmer pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Plan details */}
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-display font-700 text-shadow-blue text-3xl md:text-4xl">
                  {plans[activePlan].name}
                </h3>
                {plans[activePlan].popular && (
                  <span className="px-3 py-1 bg-soft-coral/10 text-soft-coral text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                )}
              </div>

              <p className="font-body text-shadow-blue/50 text-sm mb-6">
                {plans[activePlan].description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-8">
                <span className="font-display font-800 text-shadow-blue text-5xl md:text-6xl">
                  {plans[activePlan].price}
                </span>
                {plans[activePlan].period && (
                  <span className="font-body text-shadow-blue/40 text-lg">{plans[activePlan].period}</span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plans[activePlan].features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 font-body text-shadow-blue/70 text-sm">
                    <div className="w-5 h-5 rounded-full bg-deep-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-deep-teal" strokeWidth={2.5} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#demo"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-deep-teal text-sterile-white font-body font-semibold rounded-full hover:bg-deep-teal-light transition-all duration-300 shadow-lg shadow-deep-teal/20"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Right: Visual preview */}
            <div className="bg-shadow-blue/[0.03] p-8 md:p-12 flex flex-col justify-center">
              <div className="space-y-4">
                {/* Mock dashboard preview */}
                <div className="glass-light rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-body text-shadow-blue/40 text-xs font-semibold tracking-wider uppercase">Todays Overview</span>
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="font-display font-700 text-shadow-blue text-2xl">12</div>
                      <div className="font-body text-shadow-blue/40 text-xs mt-1">Appointments</div>
                    </div>
                    <div className="text-center">
                      <div className="font-display font-700 text-deep-teal text-2xl">$4.2K</div>
                      <div className="font-body text-shadow-blue/40 text-xs mt-1">Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="font-display font-700 text-shadow-blue text-2xl">94%</div>
                      <div className="font-body text-shadow-blue/40 text-xs mt-1">Fill Rate</div>
                    </div>
                  </div>
                </div>

                {/* Mini chart */}
                <div className="glass-light rounded-2xl p-6">
                  <span className="font-body text-shadow-blue/40 text-xs font-semibold tracking-wider uppercase">Weekly Revenue</span>
                  <div className="flex items-end gap-2 mt-4 h-16">
                    {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md bg-deep-teal/20 transition-all duration-500 hover:bg-deep-teal/40"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Upcoming */}
                <div className="glass-light rounded-2xl p-6">
                  <span className="font-body text-shadow-blue/40 text-xs font-semibold tracking-wider uppercase">Next Up</span>
                  <div className="mt-3 space-y-2">
                    {[
                      { time: "9:00 AM", patient: "Sarah Thompson", type: "Checkup" },
                      { time: "10:30 AM", patient: "James Lee", type: "Follow-up" },
                      { time: "2:00 PM", patient: "Maria Garcia", type: "Consultation" },
                    ].map((appt, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-deep-teal/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-deep-teal" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-body text-shadow-blue text-sm font-medium truncate">{appt.patient}</div>
                          <div className="font-body text-shadow-blue/40 text-xs">{appt.type}</div>
                        </div>
                        <div className="font-body text-shadow-blue/40 text-xs">{appt.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <div className="text-center mt-12 px-6">
        <p className="font-body text-shadow-blue/30 text-sm">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
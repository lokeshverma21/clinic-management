"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Info, ArrowRight, Zap, Building2, User } from "lucide-react";

// --- Utility for Tailwind classes ---
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// --- Reveal Animation Component ---
interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

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
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
    >
      {children}
    </div>
  );
}

// --- Pricing Data ---
const PLANS = [
  {
    name: "Starter",
    price: "₹999",
    period: "/clinic /month",
    blurb: "For a solo doctor replacing the paper register.",
    icon: <User className="w-4 h-4" />,
    features: [
      "1 doctor, 2 staff seats",
      "Appointments & patient records",
      "WhatsApp confirmations",
      "Daily schedule view",
    ],
    cta: "Start free trial",
    highlight: false,
  },
  {
    name: "Growth",
    price: "₹2,499",
    period: "/clinic /month",
    blurb: "For clinics that live on their appointment book.",
    icon: <Zap className="w-4 h-4" />,
    features: [
      "Up to 5 doctors, 10 staff seats",
      "Automatic 24h + 1h WhatsApp reminders",
      "Invoices & basic billing",
      "Reports: revenue & no-shows",
      "Priority support",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Multi-Branch",
    price: "Let’s talk",
    period: "",
    blurb: "For chains that need one view across locations.",
    icon: <Building2 className="w-4 h-4" />,
    features: [
      "Unlimited branches & staff",
      "Centralized reporting across clinics",
      "Role hierarchies per branch",
      "Dedicated onboarding",
      "Custom integrations",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <main className="relative min-h-screen bg-sterile-white selection:bg-deep-teal selection:text-white overflow-clip">
      {/* Background Decorative Elements */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="hero-orb w-[600px] h-[600px] -top-40 -left-20 bg-teal-glow opacity-40" />
        <div className="hero-orb w-[500px] h-[500px] bottom-0 -right-20 bg-coral-glow opacity-10" />
      </div>

      <div className="relative z-10">
        {/* --- HEADER SECTION --- */}
        <section className="max-w-7xl mx-auto px-6 pt-32 pb-16 text-center">
          <Reveal>
            <span className="inline-block py-1 px-3 rounded-full bg-sage-mist text-deep-teal text-[11px] font-bold tracking-[0.12em] uppercase mb-6">
              Simple Pricing
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-5xl md:text-6xl font-display font-medium text-shadow-blue tracking-tight leading-[1.1] mb-6">
              Fair pricing that <br />
              <span className="font-accent italic font-normal text-deep-teal">grows with your practice.</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-[18px] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Per clinic, not per patient. Every plan starts with a 14-day free trial — fill a real week of appointments before you pay a rupee.
            </p>
          </Reveal>
        </section>

        {/* --- PRICING GRID --- */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 100} className="h-full">
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-[22px] p-8 transition-all duration-500 group",
                    plan.highlight
                      ? "bg-white border-2 border-deep-teal/20 shadow-[0_24px_48px_-12px_rgba(13,79,79,0.12)]"
                      : "glass-card border border-white/60 hover:border-deep-teal/20"
                  )}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-deep-teal text-sterile-white text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg">
                      Most Chosen
                    </div>
                  )}

                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      plan.highlight ? "bg-deep-teal text-white" : "bg-sage-mist text-deep-teal"
                    )}>
                      {plan.icon}
                    </div>
                    <h3 className="text-[18px] font-semibold text-shadow-blue">{plan.name}</h3>
                  </div>

                  <p className="text-[14px] leading-relaxed text-muted-foreground mb-6">
                    {plan.blurb}
                  </p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-display font-semibold tracking-tight text-shadow-blue">
                        {plan.price}
                      </span>
                      <span className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1">
                    <p className="text-[12px] font-bold text-deep-teal/40 uppercase tracking-widest mb-4">Includes</p>
                    <ul className="space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-[14px] text-shadow-blue-light">
                          <Check className="mt-0.5 w-4 h-4 shrink-0 text-deep-teal" strokeWidth={3} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="mt-10">
                    <button
                      className={cn(
                        "w-full h-12 rounded-full text-[14px] font-semibold transition-all duration-300 flex items-center justify-center gap-2 group/btn",
                        plan.highlight
                          ? "bg-deep-teal text-white hover:bg-deep-teal-light shadow-md shadow-deep-teal/10"
                          : "bg-sage-mist/50 text-deep-teal border border-deep-teal/10 hover:bg-sage-mist"
                      )}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* WhatsApp Footnote */}
          <Reveal delay={400}>
            <div className="mt-12 max-w-2xl mx-auto flex items-start gap-3 p-5 glass rounded-2xl border-white/40">
              <Info className="w-5 h-5 text-deep-teal shrink-0 mt-0.5 opacity-60" />
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                <span className="font-semibold text-shadow-blue">Transparency on WhatsApp:</span> Reminders and alerts are powered by the official Meta WhatsApp Business API. Message costs are billed at Meta&apos;s standard regional rates without any markup from ClinicSeva. 
              </p>
            </div>
          </Reveal>
        </section>

        {/* --- FAQ MINI SECTION --- */}
        <section className="max-w-3xl mx-auto px-6 py-12 md:py-24">
          <Reveal>
            <h2 className="text-2xl font-display font-medium text-shadow-blue text-center mb-12">Common Questions</h2>
          </Reveal>
          
          <div className="grid gap-8">
            <Reveal delay={100}>
              <div>
                <h4 className="font-semibold text-shadow-blue text-[15px] mb-2">Can I switch plans later?</h4>
                <p className="text-[14px] text-muted-foreground leading-relaxed">Yes, you can upgrade or downgrade at any time. If you upgrade, the new features become available immediately.</p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div>
                <h4 className="font-semibold text-shadow-blue text-[15px] mb-2">What happens after my 14-day trial?</h4>
                <p className="text-[14px] text-muted-foreground leading-relaxed">We&apos;ll notify you 3 days before your trial ends. You can then add your payment details to continue using ClinicSeva. If not, your data remains safe, but you won&apos;t be able to book new appointments.</p>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div>
                <h4 className="font-semibold text-shadow-blue text-[15px] mb-2">Is there a setup fee?</h4>
                <p className="text-[14px] text-muted-foreground leading-relaxed">No. ClinicSeva is designed to be self-serve. If you need help importing your existing patient list, our team can help you for free.</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* --- SIMPLE FOOTER --- */}
        <footer className="py-12 border-t border-border/50 text-center">
          <p className="text-[12px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">
            ClinicSeva • No hidden fees • Cancel anytime
          </p>
        </footer>
      </div>
    </main>
  );
}
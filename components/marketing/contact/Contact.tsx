"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Clock, 
  ArrowRight,
  Send,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";

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

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <main className="relative min-h-screen bg-sterile-white selection:bg-deep-teal selection:text-white overflow-clip">
      {/* Signature Background Elements */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="hero-orb w-[600px] h-[600px] -top-40 -right-20 bg-teal-glow opacity-40" />
        <div className="hero-orb w-[500px] h-[500px] bottom-0 -left-20 bg-coral-glow opacity-10" />
      </div>

      <div className="relative z-10">
        {/* --- HERO SECTION --- */}
        <section className="max-w-7xl mx-auto px-6 pt-32 pb-16">
          <div className="max-w-3xl">
            <Reveal>
              <span className="inline-block py-1 px-3 rounded-full bg-sage-mist text-deep-teal text-[11px] font-bold tracking-[0.12em] uppercase mb-6">
                Connect With Us
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="text-5xl md:text-6xl font-display font-medium text-shadow-blue tracking-tight leading-[1.1] mb-6">
                We’re here to help your <br />
                <span className="font-accent italic font-normal text-deep-teal">practice thrive.</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-[18px] text-muted-foreground leading-relaxed">
                Whether you have a question about features, pricing, or just want to talk about your clinic&apos;s workflow, we&apos;re ready to listen.
              </p>
            </Reveal>
          </div>
        </section>

        {/* --- CONTACT GRID --- */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20">
            
            {/* Left Column: Contact Info */}
            <div className="space-y-12">
              <Reveal delay={300}>
                <div className="space-y-8">
                  <div className="flex gap-5 group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-border/50 flex items-center justify-center text-deep-teal group-hover:bg-deep-teal group-hover:text-white transition-all duration-500">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-deep-teal/40 uppercase tracking-widest mb-1">Email us</h4>
                      <p className="text-[16px] font-medium text-shadow-blue">hello@clinicseva.com</p>
                      <p className="text-[14px] text-muted-foreground mt-1">For general inquiries and support.</p>
                    </div>
                  </div>

                  <div className="flex gap-5 group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-border/50 flex items-center justify-center text-deep-teal group-hover:bg-deep-teal group-hover:text-white transition-all duration-500">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-deep-teal/40 uppercase tracking-widest mb-1">WhatsApp</h4>
                      <p className="text-[16px] font-medium text-shadow-blue">+91 98765 43210</p>
                      <p className="text-[14px] text-muted-foreground mt-1">Fastest way to get a quick answer.</p>
                    </div>
                  </div>

                  <div className="flex gap-5 group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-border/50 flex items-center justify-center text-deep-teal group-hover:bg-deep-teal group-hover:text-white transition-all duration-500">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-deep-teal/40 uppercase tracking-widest mb-1">Support Hours</h4>
                      <p className="text-[16px] font-medium text-shadow-blue">Mon — Sat, 9AM - 7PM</p>
                      <p className="text-[14px] text-muted-foreground mt-1">We typically respond within 2 hours.</p>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={400}>
                <div className="p-8 rounded-[2rem] bg-sage-mist/40 border border-deep-teal/5">
                  <h4 className="text-[17px] font-semibold text-shadow-blue mb-3">Book a 10-min Demo</h4>
                  <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
                    See how ClinicSeva works in real-time. We&apos;ll show you how to set up your first appointment in under 2 minutes.
                  </p>
                  <button className="flex items-center gap-2 text-[14px] font-bold text-deep-teal hover:gap-3 transition-all">
                    Schedule a call <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </Reveal>
            </div>

            {/* Right Column: Contact Form */}
            <Reveal delay={500}>
              <div className="glass-card p-8 md:p-12 rounded-[2.5rem] border-white/60 relative">
                {isSubmitted ? (
                  <div className="py-20 text-center animate-fade-up">
                    <div className="w-20 h-20 bg-sage-mist rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-deep-teal" />
                    </div>
                    <h3 className="text-2xl font-semibold text-shadow-blue mb-2">Message Received</h3>
                    <p className="text-muted-foreground">Thank you for reaching out. A member of our team will get back to you shortly.</p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="mt-8 text-deep-teal text-sm font-semibold underline underline-offset-4"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[12px] font-bold text-deep-teal/60 uppercase tracking-widest ml-1">Your Name</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Dr. Arjun Mehta"
                          className="w-full bg-white/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-deep-teal/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[12px] font-bold text-deep-teal/60 uppercase tracking-widest ml-1">Clinic Name</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Mehta Eye Care"
                          className="w-full bg-white/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-deep-teal/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[12px] font-bold text-deep-teal/60 uppercase tracking-widest ml-1">Email Address</label>
                        <input 
                          required
                          type="email" 
                          placeholder="arjun@clinic.com"
                          className="w-full bg-white/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-deep-teal/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[12px] font-bold text-deep-teal/60 uppercase tracking-widest ml-1">Phone Number</label>
                        <input 
                          required
                          type="tel" 
                          placeholder="+91"
                          className="w-full bg-white/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-deep-teal/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-deep-teal/60 uppercase tracking-widest ml-1">How can we help?</label>
                      <textarea 
                        required
                        rows={5}
                        placeholder="Tell us a little bit about your practice..."
                        className="w-full bg-white/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-deep-teal/20 transition-all resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full md:w-auto px-10 h-14 bg-deep-teal text-white rounded-full font-semibold hover:bg-deep-teal-light transition-all flex items-center justify-center gap-2 shadow-lg shadow-deep-teal/10 group"
                    >
                      Send Message
                      <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </button>
                    
                    <p className="text-[11px] text-muted-foreground text-center md:text-left ml-1">
                      By sending this message, you agree to our privacy policy. We never share your data.
                    </p>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* --- OFFICE SECTION --- */}
        <section className="max-w-7xl mx-auto px-6 py-24 border-t border-border/50">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Reveal>
              <h2 className="text-3xl font-display font-medium text-shadow-blue mb-6">Our Home</h2>
              <p className="text-[16px] text-muted-foreground leading-relaxed mb-8">
                ClinicSeva is built by a distributed team of designers and engineers who care about the local clinic experience. Our main hub is located where technology meets healthcare.
              </p>
              <div className="flex gap-4">
                <MapPin className="w-5 h-5 text-deep-teal shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-shadow-blue">ClinicSeva Technologies</p>
                  <p className="text-sm text-muted-foreground">
                    102, Healthcare Innovation Hub,<br />
                    Outer Ring Road, Bengaluru,<br />
                    Karnataka, India 560103
                  </p>
                </div>
              </div>
            </Reveal>
            
            <Reveal delay={200}>
              <div className="relative rounded-[2rem] overflow-hidden aspect-[16/9] transition-all duration-700 shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1524749292158-7540c2494485?q=80w=1200&auto=format&fit=crop&q=60" 
                  alt="ClinicSeva Workspace" 
                  className="w-full h-full object-cover"
                  width={1200}
                  height={800}
                />
                <div className="absolute inset-0 bg-deep-teal/10" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* --- SIMPLE FOOTER --- */}
        <footer className="py-12 border-t border-border/50 text-center">
          <p className="text-[12px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60">
            ClinicSeva • Built with care for doctors everywhere
          </p>
        </footer>
      </div>
    </main>
  );
}
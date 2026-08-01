"use client";

import { Shield } from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    section.addEventListener("mousemove", handleMouseMove);
    return () => section.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Parallax offsets
  const orbX = (mousePos.x - 0.5) * 30;
  const orbY = (mousePos.y - 0.5) * 30;
  const glassX = (mousePos.x - 0.5) * -15;
  const glassY = (mousePos.y - 0.5) * -15;

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      {/* Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-sterile-white via-sage-mist/50 to-deep-teal/5" />

      {/* Breathing Orbs */}
      <div
        ref={orbRef}
        className="hero-orb w-[500px] h-[500px] bg-deep-teal/20 top-[10%] left-[20%] absolute"
        style={{
          transform: `translate(${orbX}px, ${orbY}px)`,
        }}
      />
      <div
        className="hero-orb w-[400px] h-[400px] bg-soft-coral/10 bottom-[15%] right-[15%] absolute"
        style={{
          animationDelay: "-2s",
          transform: `translate(${-orbX * 0.5}px, ${-orbY * 0.5}px)`,
        }}
      />
      <div
        className="hero-orb w-[300px] h-[300px] bg-deep-teal-light/15 top-[50%] left-[60%] absolute"
        style={{
          animationDelay: "-1s",
          animationDuration: "6s",
          transform: `translate(${orbX * 0.7}px, ${orbY * 0.7}px)`,
        }}
      />

      {/* Abstract geometric shapes */}
      <div className="absolute top-[15%] right-[10%] w-64 h-64 border border-deep-teal/10 rounded-full rotate-45 float-element" />
      <div className="absolute bottom-[20%] left-[8%] w-48 h-48 border border-soft-coral/10 rounded-full -rotate-12 float-element-d1" />
      <div className="absolute top-[60%] right-[30%] w-32 h-32 border border-deep-teal/15 rounded-2xl rotate-12 float-element-d2" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--deep-teal) 1px, transparent 1px), linear-gradient(90deg, var(--deep-teal) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main Content */}
      <div
        ref={glassRef}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        style={{
          transform: `translate(${glassX}px, ${glassY}px)`,
        }}
      >
        {/* Small label */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-deep-teal animate-pulse" />
          <span className="font-body text-shadow-blue/60 text-sm tracking-wide">
            Intelligent clinic management, reimagined
          </span>
        </div>

        {/* Main headline */}
        <h1 className="font-display font-800 text-[clamp(3rem,8vw,8rem)] leading-[0.9] tracking-[-0.04em] mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <span className="block text-shadow-blue">Your clinic</span>
          <span className="block gradient-text">reimagined</span>
        </h1>

        {/* Subheadline */}
        <p
          className="font-body text-shadow-blue/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          Stop managing chaos. Start delivering care. ClinicSeva brings calm, precision, and intelligence to every corner of your practice.
        </p>

        {/* CTA Group */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <a
            href="#demo"
            className="group relative px-8 py-4 bg-deep-teal text-sterile-white font-body font-semibold rounded-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-deep-teal/30 hover:scale-[1.02]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-deep-teal to-deep-teal-light opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </a>
          <a
            href="#workflow"
            className="px-8 py-4 glass text-shadow-blue font-body font-semibold rounded-full hover:bg-white/60 transition-all duration-300"
          >
            See How It Works
          </a>
        </div>

        {/* Trust indicators */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-12 animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-deep-teal to-deep-teal-light border-2 border-sterile-white"
                  style={{ marginLeft: i > 1 ? "-8px" : "0" }}
                />
              ))}
            </div>
            <span className="font-body text-shadow-blue/40 text-sm">2,400+ clinics trust us</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-deep-teal" />
            ))}
            <span className="font-body text-shadow-blue/40 text-sm ml-1">4.9/5 rating</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-deep-teal/60" strokeWidth={1.5} />
            <span className="font-body text-shadow-blue/40 text-sm">HIPAA Compliant</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
        <span className="font-body text-shadow-blue/30 text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-5 h-8 border-2 border-shadow-blue/20 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-deep-teal/40 rounded-full animate-bounce" />
        </div>
      </div>

      {/* Edge fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sterile-white to-transparent" />
    </section>
  );
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}
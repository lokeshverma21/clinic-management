"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Lock, Shield, Eye, Fingerprint, type LucideIcon } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface SecurityBadge {
  icon: LucideIcon;
  label: string;
  color: string;
}

interface ParticleData {
  x: string;
  y: string;
  size: string;
  delay: string;
  duration: string;
  opacity: number;
}

const badges: SecurityBadge[] = [
  { icon: Lock, label: "AES-256 Encryption", color: "#0D4F4F" },
  { icon: Shield, label: "HIPAA Compliant", color: "#0D4F4F" },
  { icon: Eye, label: "Audit Trail", color: "#0D4F4F" },
  { icon: Fingerprint, label: "Role-Based Access", color: "#0D4F4F" },
];

export default function SecurityVeil() {
  const sectionRef = useRef<HTMLElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [activeBadge, setActiveBadge] = useState(0);
  
  // Initialize with empty arrays to prevent Hydration Mismatch
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const [barHeights, setBarHeights] = useState<number[]>([]);

  useEffect(() => {
    // 1. Generate random data
    const generatedParticles = Array.from({ length: 30 }, () => ({
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: `${Math.random() * 4 + 2}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 10 + 10}s`,
      opacity: Math.random() * 0.3 + 0.1,
    }));

    const generatedHeights = Array.from({ length: 20 }, () => 
      Math.random() * 24 + 8
    );

    // 2. Use requestAnimationFrame to avoid synchronous cascading renders
    const frameId = requestAnimationFrame(() => {
      setParticles(generatedParticles);
      setBarHeights(generatedHeights);
    });

    // 3. Setup mouse and scroll animations
    const section = sectionRef.current;
    if (!section) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1,
      },
    });

    if (shieldRef.current) {
      tl.fromTo(
        shieldRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="security"
      className="relative min-h-screen py-32 overflow-hidden bg-shadow-blue"
    >
      {/* Particle network */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 animate-float"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
              opacity: p.opacity,
            }}
          />
        ))}

        <svg className="absolute inset-0 w-full h-full opacity-10">
          {particles.length > 0 && particles.slice(0, 10).map((p, i) => (
            <line
              key={i}
              x1={p.x}
              y1={p.y}
              x2={particles[(i + 3) % particles.length].x}
              y2={particles[(i + 3) % particles.length].y}
              stroke="white"
              strokeWidth="0.5"
              className="data-flow"
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div
          ref={shieldRef}
          className="mx-auto w-48 h-48 md:w-56 md:h-56 rounded-full glass flex items-center justify-center mb-16 will-change-transform"
          style={{
            transform: `translate(${(mousePos.x - 0.5) * 20}px, ${(mousePos.y - 0.5) * 20}px)`,
            boxShadow: "0 0 80px rgba(13,79,79,0.2), inset 0 0 40px rgba(255,255,255,0.05)",
          }}
        >
          <div className="text-center">
            <Shield className="w-12 h-12 text-white/80 mx-auto mb-3" strokeWidth={1.5} />
            <span className="font-display font-semibold text-white/80 text-sm tracking-wider uppercase">Protected</span>
          </div>
        </div>

        <div className="text-center mb-20">
          <h2 className="font-display font-extrabold text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] tracking-[-0.03em] text-white mb-6">
            Your patients&apos; trust
            <br />
            <span className="text-deep-teal-light">is your practice</span>
          </h2>
          <p className="font-body text-white/50 text-lg max-w-xl mx-auto">
            We protect both. Every byte encrypted. Every access logged. Every moment monitored.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.label}
                className={`glass-card rounded-2xl p-6 text-center transition-all duration-500 cursor-pointer ${
                  activeBadge === i ? "bg-white/10 border-white/30 scale-105" : "bg-white/5 border-white/10"
                }`}
                onMouseEnter={() => setActiveBadge(i)}
                onFocus={() => setActiveBadge(i)}
                tabIndex={0}
                role="button"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300"
                  style={{
                    backgroundColor: `${badge.color}20`,
                    color: "white",
                    transform: activeBadge === i ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-body text-white/80 text-sm font-medium block">{badge.label}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-16 glass-card rounded-3xl p-8 md:p-12 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <span className="font-body text-white/60 text-sm">Live Encryption Active</span>
          </div>

          <div className="relative h-24 bg-black/20 rounded-2xl overflow-hidden flex items-center justify-center">
            <div className="flex items-end gap-2 h-16">
              {barHeights.map((height, i) => (
                <div
                  key={i}
                  className="w-1 bg-white/20 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: `${height}px`,
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-white/40 text-xs">
                🔒 AES-256-GCM • TLS 1.3 • End-to-End Encrypted
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sterile-white to-transparent" />
    </section>
  );
}
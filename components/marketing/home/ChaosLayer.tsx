"use client";

import { useRef, useEffect } from "react";
import { X, Clock, FileText, Printer, AlertCircle, Users, MapPin, type LucideIcon } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ChaosType = "missed" | "file" | "printer" | "confusion" | "revenue" | "wait";

interface ChaosItemData {
  id: number;
  type: ChaosType;
  text: string;
  x: number;
  y: number;
  rotation: number;
  delay: number;
  icon: LucideIcon;
  color: string;
}

const chaosItemsData: ChaosItemData[] = [
  { id: 1, type: "missed", text: "3 patients missed today", x: 15, y: 20, rotation: -8, delay: 0, icon: Clock, color: "#FF6B6B" },
  { id: 2, type: "file", text: "Mrs. Chen's file: lost?", x: 70, y: 35, rotation: 12, delay: 0.5, icon: FileText, color: "#FF6B6B" },
  { id: 3, type: "printer", text: "Printer jammed. Again.", x: 40, y: 65, rotation: -5, delay: 1, icon: Printer, color: "#FF6B6B" },
  { id: 4, type: "confusion", text: "Who's next?", x: 80, y: 55, rotation: 15, delay: 1.5, icon: Users, color: "#FF6B6B" },
  { id: 5, type: "revenue", text: "$2,400 in unpaid claims", x: 25, y: 75, rotation: -10, delay: 2, icon: AlertCircle, color: "#FF6B6B" },
  { id: 6, type: "wait", text: "47 min avg wait time", x: 55, y: 15, rotation: 7, delay: 0.8, icon: Clock, color: "#FF6B6B" },
  { id: 7, type: "missed", text: "2 no-shows today", x: 85, y: 70, rotation: -12, delay: 1.2, icon: Clock, color: "#FF6B6B" },
  { id: 8, type: "file", text: "Records: 3 different systems", x: 30, y: 45, rotation: 6, delay: 1.8, icon: FileText, color: "#FF6B6B" },
  { id: 9, type: "confusion", text: "Staff: 4 apps open", x: 65, y: 80, rotation: -3, delay: 2.2, icon: MapPin, color: "#FF6B6B" },
];

export default function ChaosLayer() {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const progressRef = useRef<number>(0);
  const chaosTextRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Use refs for DOM manipulation instead of state to avoid re-renders during scroll
  const labelRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Create ScrollTrigger instance
    triggerRef.current = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      scrub: 1.5,
      onUpdate: (self) => {
        const progress = self.progress;
        progressRef.current = progress;
        
        // Direct DOM manipulation to avoid setState during scroll
        if (chaosTextRef.current) {
          gsap.set(chaosTextRef.current, {
            rotation: progress * 5,
            scale: 1 + progress * 0.2,
          });
        }

        // Update opacity via refs for performance
        if (labelRef.current) {
          labelRef.current.style.opacity = progress > 0.05 ? "1" : "0";
        }
        if (transitionRef.current) {
          transitionRef.current.style.opacity = progress > 0.4 ? String((progress - 0.4) * 2.5) : "0";
        }

        // Animate items directly with GSAP for performance
        itemRefs.current.forEach((el, i) => {
          if (!el) return;
          const item = chaosItemsData[i];
          if (progress > 0.5) {
            gsap.set(el, {
              x: (i % 3) * 120 - 120,
              y: Math.floor(i / 3) * 60 - 60,
              rotation: 0,
              opacity: 0,
            });
          } else {
            gsap.set(el, {
              x: 0,
              y: 0,
              rotation: item.rotation,
              opacity: 1,
            });
          }
        });
      },
    });

    return () => {
      triggerRef.current?.kill();
      triggerRef.current = null;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="chaos"
      className="relative min-h-[150vh] py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sterile-white via-sage-mist/30 to-sterile-white" />

      {/* Sticky container */}
      <div className="sticky top-0 min-h-screen flex flex-col justify-center px-6 md:px-12">
        {/* Section label */}
        <div 
          ref={labelRef}
          className="mb-12 opacity-0 transition-opacity duration-500"
        >
          <span className="font-body text-soft-coral text-sm font-semibold tracking-widest uppercase">The Problem</span>
          <h2 className="font-display font-extrabold text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.03em] text-shadow-blue mt-2">
            Every clinic knows this
            <br />
            <span className="gradient-text-warm">feeling</span>
          </h2>
        </div>

        {/* Chaos Elements — floating, scattered */}
        <div className="relative w-full h-[60vh]">
          {chaosItemsData.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                ref={(el) => { itemRefs.current[index] = el; }}
                className="absolute glass-card rounded-2xl p-4 flex items-center gap-3 max-w-[280px] will-change-transform"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: `rotate(${item.rotation}deg)`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-body text-shadow-blue text-sm font-medium whitespace-nowrap">
                  {item.text}
                </span>
                <X className="w-3 h-3 text-shadow-blue/30 ml-auto flex-shrink-0" />
              </div>
            );
          })}

          {/* Central "CHAOS" text */}
          <div
            ref={chaosTextRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-black text-[clamp(6rem,15vw,12rem)] text-shadow-blue/[0.03] whitespace-nowrap pointer-events-none will-change-transform"
          >
            CHAOS
          </div>
        </div>

        {/* Transition text */}
        <div
          ref={transitionRef}
          className="text-center mt-12 opacity-0 transition-opacity duration-300"
        >
          <p className="font-accent text-2xl md:text-3xl text-shadow-blue/60 italic">
            What if it didn&apos;t have to be this way?
          </p>
        </div>
      </div>

      {/* Edge decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-deep-teal/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-soft-coral/5 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
    </section>
  );
}
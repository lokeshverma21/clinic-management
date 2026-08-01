"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Story {
  name: string;
  role: string;
  clinic: string;
  quote: string[];
  image: string;
  gradient: string;
}

const stories: Story[] = [
  {
    name: "Dr. Rachel Kim",
    role: "General Practitioner",
    clinic: "Maple Grove Medical",
    quote: [
      "Finally,",
      "I can",
      "breathe",
      "again.",
    ],
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=1000&fit=crop&auto=format",
    gradient: "from-deep-teal/20 to-sage-mist/50",
  },
  {
    name: "Marcus Rivera",
    role: "Clinic Director",
    clinic: "Rivera Dental Group",
    quote: [
      "Our revenue",
      "grew 30%",
      "without",
      "working harder.",
    ],
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=1000&fit=crop&auto=format",
    gradient: "from-soft-coral/20 to-sage-mist/50",
  },
  {
    name: "Dr. Anika Patel",
    role: "Physiotherapist",
    clinic: "MoveWell Clinic",
    quote: [
      "My staff",
      "finally",
      "feels",
      "in control.",
    ],
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=1000&fit=crop&auto=format",
    gradient: "from-shadow-blue/20 to-sage-mist/50",
  },
];

export default function HumanProof() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStory, setActiveStory] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const storyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(section.children).indexOf(entry.target as Element);
            if (index >= 0) {
              setActiveStory(index);
              setWordIndex(0);
              setDisplayText("");
              setImageLoaded(false);
            }
          }
        });
      },
      { threshold: 0.4, rootMargin: "-10%" }
    );

    section.querySelectorAll("[data-story]").forEach((el) => storyObserver.observe(el));

    return () => storyObserver.disconnect();
  }, []);

  // Typewriter effect for quote words
  useEffect(() => {
    if (!stories[activeStory]) return;

    const quote = stories[activeStory].quote;
    if (wordIndex >= quote.length) return;

    const timeout = setTimeout(() => {
      setDisplayText((prev) => prev + (prev ? " " : "") + quote[wordIndex]);
      setWordIndex((prev) => prev + 1);
    }, 600 + Math.random() * 400);

    return () => clearTimeout(timeout);
  }, [wordIndex, activeStory]);

  const currentStory = stories[activeStory];

  return (
    <section
      ref={sectionRef}
      id="stories"
      className="relative py-32 md:py-48 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sterile-white via-shadow-blue/[0.02] to-sterile-white" />

      {/* Section header */}
      <div className="text-center px-6 mb-16">
        <span className="font-body text-deep-teal text-sm font-semibold tracking-widest uppercase">The Stories</span>
        <h2 className="font-display font-800 text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] tracking-[-0.03em] text-shadow-blue mt-4">
          Real practices,
          <br />
          <span className="gradient-text">real transformation</span>
        </h2>
      </div>

      {/* Story cards */}
      <div className="relative max-w-7xl mx-auto px-6">
        {stories.map((story, i) => (
          <div
            key={i}
            data-story
            className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center mb-24 md:mb-32 last:mb-0"
            style={{
              opacity: activeStory === i ? 1 : 0.3,
              transform: activeStory === i ? "scale(1)" : "scale(0.98)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Image side */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden aspect-[3/4]">
                <img
                  src={story.image}
                  alt={`${story.name} at ${story.clinic}`}
                  className={`w-full h-full object-cover transition-opacity duration-1000 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  loading="lazy"
                />
                {/* Glass overlay that clears on scroll */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-deep-teal/30 to-transparent transition-all duration-1000"
                  style={{
                    backdropFilter: "blur(0px)",
                    opacity: activeStory === i ? 0.3 : 0.6,
                  }}
                />
                {/* Decorative border */}
                <div className="absolute inset-0 rounded-3xl border border-white/20" />
              </div>

              {/* Floating badge */}
              <div
                className="absolute -bottom-4 -left-4 glass-card rounded-2xl p-4 max-w-[200px]"
                style={{
                  opacity: activeStory === i ? 1 : 0,
                  transform: activeStory === i ? "translateY(0)" : "translateY(20px)",
                  transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-deep-teal" />
                  <span className="font-body text-shadow-blue text-xs font-semibold">Verified Practice</span>
                </div>
                <span className="font-body text-shadow-blue/50 text-xs">{story.clinic}</span>
              </div>
            </div>

            {/* Text side */}
            <div className="order-1 lg:order-2">
              {/* Attribution */}
              <div
                className="mb-6"
                style={{
                  opacity: activeStory === i ? 1 : 0,
                  transform: activeStory === i ? "translateX(0)" : "translateX(-20px)",
                  transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <span className="font-body text-deep-teal text-xs font-semibold tracking-widest uppercase">
                  {story.role}
                </span>
                <h3 className="font-display font-700 text-shadow-blue text-2xl md:text-3xl mt-1">
                  {story.name}
                </h3>
              </div>

              {/* Quote words — one at a time */}
              <div className="min-h-[120px] md:min-h-[160px]">
                <p className="font-accent text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] tracking-[-0.02em] text-shadow-blue">
                  {displayText}
                  <span className="inline-block w-1 h-[0.9em] bg-deep-teal align-text-bottom ml-1 animate-pulse" />
                </p>
              </div>

              {/* Story indicators */}
              <div className="flex gap-2 mt-8">
                {stories.map((_, j) => (
                  <button
                    key={j}
                    onClick={() => {
                      setActiveStory(j);
                      setWordIndex(0);
                      setDisplayText("");
                      setImageLoaded(false);
                    }}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      activeStory === j ? "bg-deep-teal w-8" : "bg-shadow-blue/20 w-2"
                    }`}
                    aria-label={`View story ${j + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edge glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-deep-teal/5 rounded-full blur-[150px] pointer-events-none" />
    </section>
  );
}
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Menu, X, Calendar, Activity, Shield, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hideNav, setHideNav] = useState(false);
  const lastScrollY = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 80);

      // Show/hide nav based on scroll direction (after 300px)
      if (current > 300) {
        if (current < lastScrollY.current) {
          // Scrolling up — show
          setHideNav(false);
          setVisible(true);
        } else {
          // Scrolling down — hide after delay
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setHideNav(true);
          }, 100);
        }
      } else {
        setVisible(false);
        setHideNav(false);
      }

      lastScrollY.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  const links = [
    { label: "The Experience", href: "#experience", icon: Activity },
    { label: "The Workflow", href: "#workflow", icon: Calendar },
    { label: "The Security", href: "#security", icon: Shield },
    { label: "The Stories", href: "#stories", icon: BookOpen },
  ];

  return (
    <>
      {/* Floating Command Pill */}
      <nav
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] p-4 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-1 px-2 py-2 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          {/* Logo */}
          <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <div className="w-6 h-6 rounded-lg bg-deep-teal flex items-center justify-center shadow-lg shadow-deep-teal/20">
              <span className="text-sterile-white font-display font-bold text-[10px] tracking-wider">S</span>
            </div>
            <span className="font-display font-semibold text-shadow-blue text-sm tracking-tight hidden sm:block">
              ClinicSeva
            </span>
          </Link>

          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Hamburger Morph */}
          <button
            onClick={toggleMenu}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            <div className="relative w-5 h-4 flex flex-col items-center justify-between">
              <span
                className={`block w-5 h-0.5 bg-shadow-blue transition-all duration-300 origin-center ${
                  isOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-shadow-blue transition-all duration-300 ${
                  isOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-shadow-blue transition-all duration-300 origin-center ${
                  isOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              />
            </div>
          </button>

          {/* CTA */}
          <Link
            href="#demo"
            className="ml-1 px-4 py-2 bg-deep-teal text-sterile-white text-xs font-body font-semibold rounded-full hover:bg-deep-teal-light transition-all duration-300 shadow-lg shadow-deep-teal/20 hover:shadow-deep-teal/30 hidden sm:block"
          >
            Book Demo
          </Link>
        </div>

        {/* Expanded Panel */}
        <div
          className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[min(440px,90vw)] glass-dark rounded-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen
              ? "opacity-100 scale-y-100 translate-y-0"
              : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none origin-top"
          }`}
        >
          <div className="p-6">
            {/* Preview thumbnails */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <link.icon className="w-4 h-4 text-white/80" strokeWidth={1.5} />
                  </div>
                  <span className="font-body text-white/90 text-sm font-medium">{link.label}</span>
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="font-accent text-white/50 text-xs italic mb-4 text-center">
                &quot;See how ClinicSeva transforms your practice&quot;
              </p>
              <Link
                href="#demo"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full py-3 bg-deep-teal text-sterile-white font-body font-semibold rounded-xl hover:bg-deep-teal-light transition-all duration-300 group"
              >
                Start Your Transformation
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[99] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-2xl rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.1)] p-6 pt-8">
          <div className="w-12 h-1 bg-shadow-blue/20 rounded-full mx-auto mb-6" />
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-sage-mist/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-sage-mist flex items-center justify-center">
                  <link.icon className="w-5 h-5 text-deep-teal" strokeWidth={1.5} />
                </div>
                <span className="font-body text-shadow-blue text-base font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
          <Link
            href="#demo"
            onClick={closeMenu}
            className="block w-full text-center py-4 bg-deep-teal text-sterile-white font-body font-semibold rounded-2xl mt-4"
          >
            Book a Demo
          </Link>
        </div>
      </div>
    </>
  );
}
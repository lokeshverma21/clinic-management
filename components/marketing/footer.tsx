"use client";

import { useState, useCallback } from "react";
import { Mail, ArrowRight, MapIcon, ShelvingUnit, TvIcon, Focus, Heart } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const handleSubscribe = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  }, [email]);

  const footerLinks = {
    Product: ["Features", "Integrations", "Security", "Pricing", "Changelog"],
    Company: ["About", "Blog", "Careers", "Press Kit", "Contact"],
    Resources: ["Documentation", "API Reference", "Community", "Support", "Status"],
    Legal: ["Privacy Policy", "Terms of Service", "HIPAA Compliance", "Data Processing", "Cookie Policy"],
  };

  const socialLinks = [
    { icon: <MapIcon className="w-4 h-4" />, label: "Twitter", href: "#" },
    { icon: <ShelvingUnit className="w-4 h-4" />, label: "LinkedIn", href: "#" },
    { icon: <TvIcon className="w-4 h-4" />, label: "YouTube", href: "#" },
    { icon: <Focus className="w-4 h-4" />, label: "Instagram", href: "#" },
  ];

  return (
    <footer className="relative bg-shadow-blue overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-deep-teal/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-soft-coral/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        {/* Main footer content */}
        <div className="py-24 md:py-32">
          {/* Top: Brand + Newsletter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-deep-teal flex items-center justify-center">
                  <span className="text-sterile-white font-display font-bold text-sm">S</span>
                </div>
                <span className="font-display font-700 text-white text-xl tracking-tight">ClinicSeva</span>
              </div>

              <p className="font-body text-white/40 text-sm leading-relaxed max-w-sm mb-8">
                The intelligent clinic management platform for modern healthcare. Bringing calm, precision, and humanity back to medicine.
              </p>

              {/* Newsletter — "Leave your stethoscope" metaphor */}
              <div className="stethoscope-input max-w-sm">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white/60" />
                </div>
                <form onSubmit={handleSubscribe} className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    aria-label="Email for newsletter"
                    className="bg-transparent border-none outline-none w-full text-white placeholder-white/30 font-body text-sm"
                    required
                  />
                </form>
                <button
                  type="submit"
                  onClick={handleSubscribe}
                  className="w-10 h-10 rounded-full bg-deep-teal flex items-center justify-center flex-shrink-0 hover:bg-deep-teal-light transition-colors"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>

              {subscribed && (
                <p className="font-body text-deep-teal-light text-xs mt-3 flex items-center gap-1">
                  <Heart className="w-3 h-3" fill="#0D4F4F" />
                  Youre in. Welcome to the calm.
                </p>
              )}
            </div>

            {/* Links Constellation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <h4 className="font-body text-white/60 text-xs font-semibold tracking-widest uppercase mb-4">
                    {category}
                  </h4>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="font-body text-white/40 text-sm hover:text-white transition-colors duration-300 inline-block"
                          onMouseEnter={() => setHoveredLink(link)}
                          onMouseLeave={() => setHoveredLink(null)}
                        >
                          <span
                            className={`transition-all duration-300 ${
                              hoveredLink === link ? "translate-x-1 text-white" : ""
                            }`}
                          >
                            {link}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="section-divider bg-white/10 mb-12" />

          {/* Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-12">
            {/* Legal text in wave pattern */}
            <div className="flex flex-wrap items-center gap-6">
              <span className="font-body text-white/20 text-xs">
                © {new Date().getFullYear()} ClinicSeva. All rights reserved.
              </span>
              {["Privacy", "Terms", "Cookies", "Security"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="font-body text-white/20 text-xs hover:text-white/40 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Social icons as glass cubes */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave — "Seva" */}
        <div className="relative py-16 border-t border-white/5">
          <div className="text-center">
            <h2 className="font-display font-900 text-[clamp(4rem,10vw,8rem)] text-white/[0.03] tracking-[-0.04em] leading-none select-none">
              Seva
            </h2>
            <p className="font-accent text-white/20 text-sm italic -mt-4">
              Service is the highest form of intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Back to top */}
      <a
        href="#experience"
        className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-deep-teal/80 backdrop-blur-md flex items-center justify-center text-white opacity-0 translate-y-4 transition-all duration-300 hover:bg-deep-teal hover:scale-110 focus:opacity-100 focus:translate-y-0"
        aria-label="Back to top"
        style={{
          opacity: "0",
          transform: "translateY(1rem)",
          pointerEvents: "none",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = "1";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.pointerEvents = "auto";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = "0";
          (e.currentTarget as HTMLElement).style.transform = "translateY(1rem)";
          (e.currentTarget as HTMLElement).style.pointerEvents = "none";
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m18 15-6-6-6 6" />
        </svg>
      </a>
    </footer>
  );
}
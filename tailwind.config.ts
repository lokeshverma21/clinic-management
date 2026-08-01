import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "sage-mist": "#E8F0E9",
        "sterile-white": "#FAFBFC",
        "deep-teal": "#0D4F4F",
        "deep-teal-light": "#1A6B6B",
        "soft-coral": "#FF6B6B",
        "shadow-blue": "#1A2E35",
        "shadow-blue-light": "#2A4A52",
        "frosted": "rgba(255,255,255,0.72)",
      },
      fontFamily: {
        display: ["Inter Tight", "system-ui", "sans-serif"],
        body: ["Satoshi", "system-ui", "sans-serif"],
        accent: ["Crimson Pro", "Georgia", "serif"],
      },
      animation: {
        breathe: "breathe 4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "float-d1": "float 6s ease-in-out infinite 1s",
        "float-d2": "float 6s ease-in-out infinite 2s",
        "float-d3": "float 6s ease-in-out infinite 3s",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "rotate-slow": "rotateSlow 30s linear infinite",
        "rotate-slow-reverse": "rotateSlowReverse 25s linear infinite",
        dash: "dash 1.5s linear infinite",
        "fade-up": "fadeUp 0.8s ease-out forwards",
        "shimmer": "shimmer 3s ease-in-out infinite",
        "drift": "drift 8s ease-in-out infinite",
        "drift-reverse": "driftReverse 10s ease-in-out infinite",
        "orb-pulse": "orbPulse 5s ease-in-out infinite",
        "scan-line": "scanLine 4s ease-in-out infinite",
        "count-up": "countUp 0.6s ease-out forwards",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.08)", opacity: "0.75" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-12px) rotate(1deg)" },
          "66%": { transform: "translateY(6px) rotate(-0.5deg)" },
        },
        pulseSoft: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(13,79,79,0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(13,79,79,0.3)" },
        },
        rotateSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        rotateSlowReverse: {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        dash: {
          "to": { "stroke-dashoffset": "0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(10px, -15px)" },
          "50%": { transform: "translate(-5px, -20px)" },
          "75%": { transform: "translate(-15px, -5px)" },
        },
        driftReverse: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(-10px, 15px)" },
          "50%": { transform: "translate(5px, 20px)" },
          "75%": { transform: "translate(15px, 5px)" },
        },
        orbPulse: {
          "0%, 100%": { transform: "scale(1)", filter: "blur(60px)" },
          "50%": { transform: "scale(1.15)", filter: "blur(80px)" },
        },
        scanLine: {
          "0%": { top: "-2px", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { top: "100%", opacity: "0" },
        },
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
      transitionTimingFunction: {
        "bounce-smooth": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      backdropBlur: {
        xs: "2px",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
    },
  },
  plugins: [],
};

export default config;
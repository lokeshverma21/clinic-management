import type { Metadata } from "next";
import { Inter, Inter_Tight, Crimson_Pro } from "next/font/google";
import "../globals.css";
import CustomCursor from "@/components/marketing/CustomCursor";

// Satoshi replacement (Inter is the closest Google Font alternative)
// For the exact Satoshi font, you'd need to host it locally or use a CDN
const satoshi = Inter({ 
  subsets: ["latin"],
  variable: "--font-satoshi",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// Display font
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// Accent font (Serif) - Crimson Pro from Google Fonts
const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson-pro",
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"], // This gives you both regular and italic
});

export const metadata: Metadata = {
  title: "ClinicSeva — Reclaim the Calm in Your Practice",
  description: "The intelligent clinic management platform for modern healthcare practices. Schedule, chart, bill, and grow — all in one serene workspace.",
  keywords: ["clinic management", "healthcare SaaS", "practice management", "medical software"],
  openGraph: {
    title: "ClinicSeva — Reclaim the Calm in Your Practice",
    description: "The intelligent clinic management platform for modern healthcare practices.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html   
      lang="en" 
      className={`${satoshi.variable} ${interTight.variable} ${crimsonPro.variable} scroll-smooth`}
    >
      <body className="antialiased bg-sterile-white text-shadow-blue overflow-x-hidden">
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-deep-teal focus:text-white focus:rounded-full focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>

        {children}

        {/* Custom Cursor — desktop only */}
        <div className="hidden lg:block">
          <CustomCursor />
        </div>
      </body>
    </html>
  );
}


"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Home, 
  Search, 
  Compass, 
  Calendar, 
  Users, 
  HelpCircle,
  Sparkles 
} from "lucide-react"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background text-foreground p-4 sm:p-6 lg:p-8">
      {/* ------------------------------------------------------------- */}
      {/* Dynamic Background Effects (Ambient Light & Grid Pattern)     */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle grid mesh */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Ambient Glowing Orbs */}
        <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -right-40 size-96 rounded-full bg-blue-500/15 blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 left-1/3 size-96 rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Main Content Card                                             */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        
        {/* Visual Badge / Illustration Graphic */}
        <div className="relative inline-flex items-center justify-center">
          {/* Animated Glow Ring */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/30 via-sky-500/20 to-emerald-500/30 blur-xl opacity-75 animate-pulse" />
          
          {/* Hero 404 Visual Icon Box */}
          <div className="relative size-28 sm:size-32 rounded-3xl bg-card border border-border/80 shadow-2xl backdrop-blur-xl flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <Compass className="size-14 sm:size-16 text-primary animate-[spin_12s_linear_infinite]" />
              <div className="absolute size-4 rounded-full bg-primary ring-4 ring-background" />
            </div>
          </div>

          {/* Floating Pill Tag */}
          <div className="absolute -bottom-2 -right-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 border border-primary/20">
            <Sparkles className="size-3" />
            <span>404 Error</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3 max-w-lg mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Lost in Navigation?
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            The page you are searching for might have been moved, renamed, or doesn&apos;t exist. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-border/80 bg-card hover:bg-accent hover:text-accent-foreground transition-all duration-200 shadow-sm active:scale-95"
          >
            <ArrowLeft className="size-4" />
            <span>Go Back</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-md shadow-primary/20 active:scale-95"
          >
            <Home className="size-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Quick Links / Helpful Shortcuts                               */}
        {/* ------------------------------------------------------------- */}
        <div className="pt-6 border-t border-border/60">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Or try one of these pages
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left max-w-lg mx-auto">
            <Link
              href="/appointments"
              className="group p-3 rounded-xl border border-border/50 bg-card/60 hover:bg-card hover:border-primary/40 transition-all duration-200 flex items-center gap-3 shadow-xs"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Calendar className="size-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Appointments</div>
                <div className="text-[10px] text-muted-foreground">Manage visits</div>
              </div>
            </Link>

            <Link
              href="/patients"
              className="group p-3 rounded-xl border border-border/50 bg-card/60 hover:bg-card hover:border-primary/40 transition-all duration-200 flex items-center gap-3 shadow-xs"
            >
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                <Users className="size-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Patients</div>
                <div className="text-[10px] text-muted-foreground">Directory</div>
              </div>
            </Link>

            <Link
              href="/help"
              className="col-span-2 sm:col-span-1 group p-3 rounded-xl border border-border/50 bg-card/60 hover:bg-card hover:border-primary/40 transition-all duration-200 flex items-center gap-3 shadow-xs"
            >
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                <HelpCircle className="size-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Support</div>
                <div className="text-[10px] text-muted-foreground">Get help</div>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  AlertTriangle, 
  RotateCcw, 
  Home, 
  ArrowLeft, 
  HelpCircle, 
  Copy, 
  Check, 
  ShieldAlert,
  Sparkles
} from "lucide-react"

interface ErrorProps {
  error: Error & {
    digest?: string
  }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Log the error to your error reporting service
    console.error(error)
  }, [error])

  const copyDigest = () => {
    if (error.digest) {
      navigator.clipboard.writeText(error.digest)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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

        {/* Ambient Glowing Orbs (Rose & Amber Tones for Error State) */}
        <div className="absolute -top-40 -left-40 size-96 rounded-full bg-rose-500/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -right-40 size-96 rounded-full bg-amber-500/15 blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 left-1/3 size-96 rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Main Content Card                                             */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        
        {/* Visual Badge / Illustration Graphic */}
        <div className="relative inline-flex items-center justify-center">
          {/* Animated Glow Ring */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-rose-500/30 via-amber-500/20 to-primary/30 blur-xl opacity-75 animate-pulse" />
          
          {/* Hero Error Visual Icon Box */}
          <div className="relative size-28 sm:size-32 rounded-3xl bg-card border border-rose-500/20 shadow-2xl backdrop-blur-xl flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20">
                <AlertTriangle className="size-12 sm:size-14 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Floating Pill Tag */}
          <div className="absolute -bottom-2 -right-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500 text-white shadow-lg shadow-rose-500/25 border border-rose-400/30">
            <ShieldAlert className="size-3" />
            <span>Application Error</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3 max-w-lg mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Something went wrong!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            An unexpected error occurred while processing your request. Don&apos;t worry, you can try refreshing the view.
          </p>

          {/* Optional Error Digest Badge (For developers/support) */}
          {error.digest && (
            <div className="pt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-xs font-mono text-muted-foreground">
              <span>Error ID: {error.digest}</span>
              <button
                onClick={copyDigest}
                className="hover:text-foreground transition-colors p-0.5"
                title="Copy Error ID"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* Primary Action: Retry */}
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-md shadow-primary/20 active:scale-95"
          >
            <RotateCcw className="size-4" />
            <span>Try Again</span>
          </button>

          {/* Go Back */}
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-border/80 bg-card hover:bg-accent hover:text-accent-foreground transition-all duration-200 shadow-sm active:scale-95"
          >
            <ArrowLeft className="size-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Quick Links / Navigation Shortcuts                            */}
        {/* ------------------------------------------------------------- */}
        <div className="pt-6 border-t border-border/60">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Need additional assistance?
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left max-w-md mx-auto">
            <Link
              href="/"
              className="group p-3 rounded-xl border border-border/50 bg-card/60 hover:bg-card hover:border-primary/40 transition-all duration-200 flex items-center gap-3 shadow-xs"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Home className="size-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Return Home</div>
                <div className="text-[10px] text-muted-foreground">Back to main dashboard</div>
              </div>
            </Link>

            <Link
              href="/support"
              className="group p-3 rounded-xl border border-border/50 bg-card/60 hover:bg-card hover:border-primary/40 transition-all duration-200 flex items-center gap-3 shadow-xs"
            >
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                <HelpCircle className="size-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Contact Support</div>
                <div className="text-[10px] text-muted-foreground">Report this issue</div>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
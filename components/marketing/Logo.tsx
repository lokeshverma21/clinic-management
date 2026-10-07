import { cn } from '@/lib/utils'

/** ClinicSeva wordmark — a pulse-line crossing a rounded square. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-[10px] bg-deep-teal text-sterile-white',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[18px]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h4l2.5-5.5L14 17l2.5-5H21" />
      </svg>
    </span>
  )
}

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span
        className={cn(
          'text-[17px] font-semibold tracking-tight',
          dark ? 'text-sterile-white' : 'text-shadow-blue',
        )}
      >
        ClinicSeva
      </span>
    </span>
  )
}

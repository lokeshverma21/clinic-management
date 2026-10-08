"use client"
import { useEffect, useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { Wordmark } from './Logo'
import Link from 'next/link'

const LINKS = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Navbar() {
  const { isSignedIn } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <nav
          className={cn(
            'mt-3 flex h-14 items-center justify-between rounded-full pl-4 pr-2 transition-all duration-300',
            scrolled
              ? 'border border-shadow-blue/10 bg-white/80 shadow-[0_8px_30px_rgba(26,46,53,0.08)] backdrop-blur-xl'
              : 'border border-transparent bg-transparent',
          )}
          aria-label="Main"
        >
          <Link href="/" className="flex items-center" aria-label="ClinicSeva home">
            <Wordmark />
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-shadow-blue-light transition-colors hover:bg-sage-mist hover:text-shadow-blue"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 md:flex">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="group flex min-h-[44px] items-center gap-1.5 rounded-full bg-deep-teal px-5 text-sm font-medium text-sterile-white transition-colors hover:bg-deep-teal-light"
              >
                Dashboard
                <ArrowRight className="btn-arrow size-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-full px-4 py-2 text-sm font-medium text-shadow-blue transition-colors hover:text-deep-teal"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="group flex min-h-[44px] items-center gap-1.5 rounded-full bg-deep-teal px-5 text-sm font-medium text-sterile-white transition-colors hover:bg-deep-teal-light"
                >
                  Start free trial
                  <ArrowRight className="btn-arrow size-4" />
                </Link>
              </>
            )}
          </div>

          <button
            className="grid min-h-[44px] min-w-[44px] place-items-center rounded-full text-shadow-blue md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        <div
          className={cn(
            'overflow-hidden rounded-3xl border border-shadow-blue/10 bg-white/95 backdrop-blur-xl transition-all duration-300 md:hidden',
            open ? 'mt-2 max-h-[420px] opacity-100 shadow-[0_16px_40px_rgba(26,46,53,0.12)]' : 'mt-0 max-h-0 border-transparent opacity-0',
          )}
        >
          <ul className="flex flex-col p-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3.5 text-[15px] font-medium text-shadow-blue transition-colors hover:bg-sage-mist"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 border-t border-shadow-blue/10 pt-3">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-full bg-deep-teal px-5 text-[15px] font-medium text-sterile-white"
                >
                  Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <Link
                  href="/sign-up"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-full bg-deep-teal px-5 text-[15px] font-medium text-sterile-white"
                >
                  Start free trial
                  <ArrowRight className="size-4" />
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}

import { ArrowRight } from 'lucide-react'
import { Reveal } from './Reveal'

export function Cta() {
  return (
    <section id="cta" className="scroll-mt-24 px-4 py-24 sm:px-6 sm:py-32">
      <Reveal className="mx-auto max-w-[1200px]">
        <div className="relative overflow-hidden rounded-[28px] bg-shadow-blue px-6 py-20 text-center sm:px-12 sm:py-28">
          {/* single restrained glow — not gradient slop */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(560px 280px at 85% 8%, rgba(26,107,107,0.45), transparent 70%)',
            }}
          />
          <div className="relative">
            <p className="micro-label text-sage-mist/70">14-day free trial</p>
            <h2 className="mx-auto mt-5 max-w-[20ch] text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-sterile-white sm:text-[52px]">
              Tomorrow morning, your front desk could{' '}
              <em className="font-accent font-normal italic text-sage-mist">run itself.</em>
            </h2>
            <p className="mx-auto mt-6 max-w-[48ch] text-[16px] leading-relaxed text-sterile-white/70">
              Set up in 15 minutes. Fill a real week of appointments before you pay anything. Cancel
              anytime — your data exports with you.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#top"
                className="group flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-sterile-white px-8 text-[15px] font-semibold text-shadow-blue transition-colors hover:bg-sage-mist sm:w-auto"
              >
                Start your free trial
                <ArrowRight className="btn-arrow size-4" />
              </a>
              <a
                href="#pricing"
                className="flex min-h-[52px] w-full items-center justify-center rounded-full border border-white/20 px-8 text-[15px] font-medium text-sterile-white/90 transition-colors hover:bg-white/10 sm:w-auto"
              >
                Compare plans
              </a>
            </div>
            <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.12em] text-sterile-white/40">
              No credit card · No training call · No lock-in
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

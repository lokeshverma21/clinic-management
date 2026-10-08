import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Reveal } from './Reveal'

const PLANS = [
  {
    name: 'Starter',
    price: '₹999',
    period: '/clinic /month',
    blurb: 'For a solo doctor replacing the paper register.',
    features: [
      '1 doctor, 2 staff seats',
      'Appointments & patient records',
      'WhatsApp confirmations',
      'Daily schedule view',
    ],
    cta: 'Start free trial',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '₹2,499',
    period: '/clinic /month',
    blurb: 'For clinics that live on their appointment book.',
    features: [
      'Up to 5 doctors, 10 staff seats',
      'Automatic 24h + 1h WhatsApp reminders',
      'Invoices & basic billing',
      'Reports: revenue, no-shows, busiest hours',
      'Priority support',
    ],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Multi-Branch',
    price: 'Let’s talk',
    period: '',
    blurb: 'For chains that need one view across locations.',
    features: [
      'Unlimited branches & staff',
      'Centralized reporting across clinics',
      'Role hierarchies per branch',
      'Dedicated onboarding',
    ],
    cta: 'Contact us',
    highlight: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <Reveal>
          <p className="micro-label text-deep-teal">Pricing</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-4 max-w-[24ch] text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-shadow-blue sm:text-[44px]">
            Fair pricing that{' '}
            <em className="font-accent font-normal italic text-deep-teal">grows with you.</em>
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-shadow-blue-light">
            Per clinic, not per patient. Every plan starts with a 14-day free trial — fill a real
            week of appointments before you pay a rupee.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 100} className="h-full">
              <div
                className={cn(
                  'flex h-full flex-col rounded-[14px] border p-7 transition-all duration-200 hover:-translate-y-0.5',
                  p.highlight
                    ? 'border-deep-teal bg-white shadow-[0_20px_48px_-16px_rgba(13,79,79,0.25)]'
                    : 'border-shadow-blue/10 bg-white hover:border-shadow-blue/20 hover:shadow-[0_12px_32px_-12px_rgba(26,46,53,0.18)]',
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-[17px] font-semibold tracking-tight text-shadow-blue">
                    {p.name}
                  </h3>
                  {p.highlight && (
                    <span className="rounded-full bg-deep-teal px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-sterile-white">
                      Most chosen
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-shadow-blue-light">{p.blurb}</p>
                <p className="mt-6">
                  <span className="font-mono text-[36px] font-medium tracking-tight text-shadow-blue">
                    {p.price}
                  </span>
                  {p.period && (
                    <span className="ml-1 font-mono text-[12px] text-shadow-blue-light/70">
                      {p.period}
                    </span>
                  )}
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-shadow-blue-light">
                      <Check className="mt-0.5 size-4 shrink-0 text-deep-teal" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={p.name === 'Multi-Branch' ? '#cta' : `/sign-up?plan=${p.name.toLowerCase()}`}
                  className={cn(
                    'mt-8 flex min-h-[48px] items-center justify-center rounded-full text-[15px] font-medium transition-colors',
                    p.highlight
                      ? 'bg-deep-teal text-sterile-white hover:bg-deep-teal-light'
                      : 'border border-shadow-blue/15 text-shadow-blue hover:border-deep-teal/40 hover:text-deep-teal',
                  )}
                >
                  {p.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-shadow-blue-light/60">
            WhatsApp message costs passed through at Meta&quot;s rates · Cancel anytime
          </p>
        </Reveal>
      </div>
    </section>
  )
}

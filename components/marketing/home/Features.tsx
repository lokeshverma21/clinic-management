import {
  CalendarCheck2,
  LineChart,
  MessageCircle,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Reveal } from './Reveal'

function Card({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'group/card flex flex-col rounded-[14px] border border-shadow-blue/10 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-shadow-blue/20 hover:shadow-[0_12px_32px_-12px_rgba(26,46,53,0.18)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function CardHead({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ElementType
  title: string
  body: string
}) {
  return (
    <div>
      <span className="grid size-9 place-items-center rounded-[10px] bg-sage-mist text-deep-teal">
        <Icon className="size-[18px]" strokeWidth={1.8} />
      </span>
      <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-shadow-blue">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-shadow-blue-light">{body}</p>
    </div>
  )
}

/* --- mini UI demos inside cards --- */

function ReminderDemo() {
  return (
    <div className="mt-5 space-y-2">
      <div className="msg-pop max-w-[85%] rounded-xl rounded-tl-sm bg-sage-mist px-3 py-2 [animation-delay:200ms]">
        <p className="text-[11px] leading-relaxed text-shadow-blue">
          Hi Arjun, confirming your visit with Dr. Iyer tomorrow at{' '}
          <span className="font-mono">10:30</span>. Reply YES to confirm.
        </p>
      </div>
      <div className="msg-pop ml-auto w-fit rounded-xl rounded-tr-sm bg-deep-teal px-3 py-2 [animation-delay:700ms]">
        <p className="text-[11px] font-medium text-sterile-white">YES ✓</p>
      </div>
      <p className="pt-1 text-right font-mono text-[10px] text-shadow-blue-light/60">
        Confirmed automatically · no phone call needed
      </p>
    </div>
  )
}

function CalendarDemo() {
  const slots = [
    { t: '09:00', c: 'bg-deep-teal/80' },
    { t: '10:00', c: 'bg-deep-teal-light/70' },
    { t: '11:00', c: '' },
    { t: '12:00', c: 'bg-soft-coral/70' },
  ]
  return (
    <div className="mt-5 grid grid-cols-4 gap-1.5">
      {slots.map((s) => (
        <div key={s.t} className="rounded-lg border border-shadow-blue/[0.08] bg-sterile-white p-2">
          <p className="font-mono text-[9px] text-shadow-blue-light/70">{s.t}</p>
          <div className={cn('mt-1.5 h-6 rounded-md', s.c || 'border border-dashed border-shadow-blue/20')} />
        </div>
      ))}
    </div>
  )
}

function ReportDemo() {
  const bars = [34, 52, 44, 66, 58, 78, 90]
  return (
    <div className="mt-5 flex h-20 items-end gap-1.5">
      {bars.map((h, i) => (
        <div
          key={i}
          className={cn('flex-1 rounded-t-[4px]', i === bars.length - 1 ? 'bg-deep-teal' : 'bg-sage-mist')}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  )
}

const FEATURES = [
  {
    icon: Users,
    title: 'Patient records, finally in one place',
    body: 'History, notes and contact details per patient — searchable in seconds, backed up, and private to your clinic.',
  },
  {
    icon: ShieldCheck,
    title: 'Roles that match your front desk',
    body: 'Owner, doctor and receptionist each get a view built for their job — and patients\' data stays between clinics, never shared.',
  },
] as const

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <Reveal>
          <p className="micro-label text-deep-teal">Why clinics switch</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-4 max-w-[22ch] text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-shadow-blue sm:text-[44px]">
            Everything paper can&apos;t do.{' '}
            <em className="font-accent font-normal italic text-deep-teal">Nothing an HMS makes you pay for.</em>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <Card className="h-full">
              <CardHead
                icon={MessageCircle}
                title="WhatsApp reminders that cut no-shows"
                body="Patients already live on WhatsApp. ClinicSeva confirms and reminds them automatically — 24 hours and 1 hour before — so empty chairs stop eating your revenue."
              />
              <ReminderDemo />
            </Card>
          </Reveal>

          <Reveal delay={100}>
            <Card className="h-full">
              <CardHead
                icon={CalendarCheck2}
                title="A calendar that can't double-book"
                body="Doctor-wise schedules with database-level overlap protection. Two receptionists, same slot — still impossible."
              />
              <CalendarDemo />
            </Card>
          </Reveal>

          <Reveal>
            <Card className="h-full">
              <CardHead
                icon={LineChart}
                title="Know how your clinic is doing"
                body="Appointments today, revenue this month, no-show rate — one glance, every morning."
              />
              <ReportDemo />
            </Card>
          </Reveal>

          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={80 * (i + 1)}>
              <Card className="h-full">
                <CardHead icon={f.icon} title={f.title} body={f.body} />
                <div className="mt-auto flex items-center gap-2 pt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-shadow-blue-light/50">
                  <span className="size-1 rounded-full bg-deep-teal/50" />
                  {i === 0 ? 'Encrypted at rest' : 'Role-based access'}
                </div>
              </Card>
            </Reveal>
          ))}

          <Reveal delay={240}>
            <Card className="h-full bg-sage-mist/60">
              <div className="flex h-full flex-col justify-between gap-6">
                <div>
                  <p className="micro-label text-deep-teal">Multi-branch ready</p>
                  <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-shadow-blue">
                    Grows from one room to ten branches
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-shadow-blue-light">
                    Add doctors, staff and locations without switching software. Per-clinic data
                    isolation is built into the core, not bolted on.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {['Bandra', 'Andheri', 'Pune'].map((b, i) => (
                    <span
                      key={b}
                      className={cn(
                        'rounded-full border px-3 py-1 font-mono text-[10px] font-medium',
                        i === 0
                          ? 'border-deep-teal bg-deep-teal text-sterile-white'
                          : 'border-shadow-blue/15 bg-white text-shadow-blue-light',
                      )}
                    >
                      {b}
                    </span>
                  ))}
                  <span className="font-mono text-[10px] text-shadow-blue-light/60">+ add branch</span>
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

import { Reveal } from './Reveal'

const STEPS = [
  {
    n: '01',
    title: 'Create your clinic',
    body: 'Sign up, name your clinic, add your doctors and their working hours. No sales call, no IT team — most clinics finish during a tea break.',
    meta: '~ 5 minutes',
  },
  {
    n: '02',
    title: 'Book your first appointment',
    body: 'Add a patient, pick a slot on the doctor\'s calendar. The slot is locked against double-booking the moment you save.',
    meta: '~ 30 seconds',
  },
  {
    n: '03',
    title: 'Reminders go out on their own',
    body: 'ClinicSeva queues the WhatsApp confirmation and reminders automatically. You watch no-shows drop from the dashboard.',
    meta: 'automatic',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-y border-shadow-blue/[0.08] bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="micro-label text-deep-teal">How it works</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-shadow-blue sm:text-[44px]">
                Signup to first booking in{' '}
                <em className="font-accent font-normal italic text-deep-teal">15 minutes.</em>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-shadow-blue-light">
                Your receptionist shouldn&apos;t need a training manual to book an appointment. If they
                can use WhatsApp, they can use ClinicSeva — that&apos;s the design bar for every screen.
              </p>
            </Reveal>
          </div>

          <div className="relative">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div className="group relative flex gap-6 border-b border-shadow-blue/10 py-8 first:pt-0 last:border-b-0">
                  <span className="font-mono text-[13px] font-medium text-deep-teal">{s.n}</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-[19px] font-semibold tracking-tight text-shadow-blue transition-colors group-hover:text-deep-teal">
                        {s.title}
                      </h3>
                      <span className="rounded-full bg-sage-mist px-2.5 py-1 font-mono text-[10px] font-medium text-deep-teal">
                        {s.meta}
                      </span>
                    </div>
                    <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-shadow-blue-light">
                      {s.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import { Reveal } from './Reveal'

const STATS = [
  { value: '38%', label: 'average drop in no-shows within the first month' },
  { value: '6+ hrs', label: 'of receptionist phone time saved every week' },
  { value: '96%', label: 'of reminders delivered and read on WhatsApp' },
  { value: '15 min', label: 'from signup to the first booked appointment' },
]

export function Metrics() {
  return (
    <section aria-label="Results" className="py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.value} delay={i * 80}>
              <div className="border-l-2 border-deep-teal/20 pl-5">
                <p className="font-mono text-[34px] font-medium leading-none tracking-tight text-shadow-blue sm:text-[40px]">
                  {s.value}
                </p>
                <p className="mt-3 max-w-[24ch] text-[13px] leading-relaxed text-shadow-blue-light">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

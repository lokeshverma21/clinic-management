import { Reveal } from './Reveal'

const TESTIMONIALS = [
  {
    quote:
      'We went from a paper diary to fully booked and reminded in one afternoon. Our no-shows dropped from about one in four to maybe one in ten.',
    name: 'Dr. Kavita Mehta',
    role: 'Dentist · Sunrise Dental, Mumbai',
    initials: 'KM',
  },
  {
    quote:
      'My receptionist stopped spending her mornings calling patients. The reminders just go. She finally has time for the people standing at the desk.',
    name: 'Dr. Arvind Iyer',
    role: 'Physiotherapist · Restore Clinic, Bengaluru',
    initials: 'AI',
  },
  {
    quote:
      'I check one screen in the morning and know my whole day — both branches. I didn\'t think software this simple could feel this organised.',
    name: 'Dr. Neha Kulkarni',
    role: 'Dermatologist · SkinFirst, Pune',
    initials: 'NK',
  },
]

export function Testimonials() {
  return (
    <section aria-label="What clinic owners say" className="border-y border-shadow-blue/[0.08] bg-sage-mist/40 py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <Reveal>
          <p className="micro-label text-deep-teal">From the front desk</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-4 max-w-[24ch] text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-shadow-blue sm:text-[44px]">
            Clinics that stopped{' '}
            <em className="font-accent font-normal italic text-deep-teal">chasing patients.</em>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <figure className="flex h-full flex-col rounded-[14px] border border-shadow-blue/10 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(26,46,53,0.18)]">
                <span className="font-accent text-[40px] leading-none text-deep-teal/30">&quot;</span>
                <blockquote className="mt-2 flex-1 text-[15px] leading-relaxed text-shadow-blue">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-shadow-blue/[0.08] pt-4">
                  <span className="grid size-10 place-items-center rounded-full bg-deep-teal/10 font-mono text-[12px] font-medium text-deep-teal">
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-shadow-blue">{t.name}</p>
                    <p className="text-[12px] text-shadow-blue-light">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

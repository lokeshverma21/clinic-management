const CLINIC_TYPES = [
  'Dental clinics',
  'Physiotherapy centers',
  'Dermatology & skin',
  'General physicians',
  'Pediatric clinics',
  'Diagnostic centers',
  'Eye clinics',
  'ENT practices',
]

/** Quiet marquee of the clinic types the product is built for. */
export function TrustBar() {
  const row = [...CLINIC_TYPES, ...CLINIC_TYPES]
  return (
    <section aria-label="Built for" className="border-y border-shadow-blue/[0.08] bg-white py-5">
      <div className="mx-auto flex max-w-[1200px] items-center gap-6 px-4 sm:px-6">
        <p className="micro-label hidden shrink-0 text-shadow-blue-light/60 sm:block">
          Purpose-built for
        </p>
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div className="marquee-track flex w-max items-center gap-10">
            {row.map((t, i) => (
              <span key={i} className="flex items-center gap-10">
                <span className="whitespace-nowrap text-sm font-medium text-shadow-blue-light/80">
                  {t}
                </span>
                <span className="size-1 rounded-full bg-deep-teal/40" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

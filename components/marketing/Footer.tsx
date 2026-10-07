import { Wordmark } from './Logo'

const COLS = [
  {
    title: 'Product',
    links: ['Features', 'How it works', 'Pricing', 'FAQ'],
    hrefs: ['/features', '#how-it-works', '/pricing', '#faq'],
  },
  {
    title: 'For clinics',
    links: ['Dental', 'Physiotherapy', 'Dermatology', 'Diagnostics'],
    hrefs: ['#top', '#top', '#top', '#top'],
  },
  {
    title: 'Company',
    links: ['About', 'Contact', 'Privacy', 'Terms'],
    hrefs: ['/about', '/contact', '/privacy', '/terms'],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-shadow-blue/[0.08] bg-white">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-[32ch] text-sm leading-relaxed text-shadow-blue-light">
              The operating system small and mid-size clinics run their front desk on — so no
              patient is forgotten and no doctor&apos;s day is a surprise.
            </p>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-shadow-blue-light/50">
              Made for clinics, not hospitals
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="micro-label text-shadow-blue-light/60">{c.title}</p>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l, i) => (
                  <li key={l}>
                    <a
                      href={c.hrefs[i]}
                      className="text-sm text-shadow-blue-light transition-colors hover:text-deep-teal"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-shadow-blue/[0.08] pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] text-shadow-blue-light/60">
            © {new Date().getFullYear()} ClinicSeva. All rights reserved.
          </p>
          <p className="font-mono text-[11px] text-shadow-blue-light/60">
            Patient data isolated per clinic · Encrypted at rest
          </p>
        </div>
      </div>
    </footer>
  )
}

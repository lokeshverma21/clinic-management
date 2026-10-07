import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Reveal } from './Reveal'

const FAQS = [
  {
    q: 'Do my patients need to install an app?',
    a: 'No. Reminders and confirmations arrive on WhatsApp, which your patients already use every day. They just reply YES to confirm — no downloads, no portals, no passwords.',
  },
  {
    q: 'How long does setup actually take?',
    a: 'Most clinics go from signup to their first booked appointment in under 15 minutes. Add your doctors, set their hours, and start booking. There is no mandatory onboarding call.',
  },
  {
    q: 'Is my patient data safe — and can other clinics see it?',
    a: 'Every clinic\'s data is isolated at the database level, encrypted, and never visible to another clinic. Sensitive actions are recorded in an audit log, and access is controlled by staff roles you set.',
  },
  {
    q: 'What happens to WhatsApp messaging costs?',
    a: 'WhatsApp charges per-message rates set by Meta. We pass those through at cost on plans that include reminders — no markup. Confirmations and reports carry no per-message fee.',
  },
  {
    q: 'Can I use it for more than one branch?',
    a: 'Yes. Multi-tenancy and branch separation are built into the core of ClinicSeva. The Multi-Branch plan adds centralized reporting and role hierarchies across all your locations.',
  },
  {
    q: 'What if my staff aren\'t tech-savvy?',
    a: 'That is exactly who ClinicSeva is designed for. If your receptionist can use WhatsApp, they can run the front desk on ClinicSeva. And if anyone gets stuck, support is one message away.',
  },
]

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-shadow-blue/[0.08] bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="micro-label text-deep-teal">FAQ</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-shadow-blue sm:text-[44px]">
                Asked by every{' '}
                <em className="font-accent font-normal italic text-deep-teal">clinic owner.</em>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 text-[15px] leading-relaxed text-shadow-blue-light">
                Something else on your mind?{' '}
                <a
                  href="#cta"
                  className="font-medium text-deep-teal underline decoration-deep-teal/30 underline-offset-4 hover:decoration-deep-teal"
                >
                  Write to us
                </a>{' '}
                — a human replies.
              </p>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <Accordion className="w-full">
              {FAQS.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border-shadow-blue/10"
                >
                  <AccordionTrigger className="py-5 text-left text-[16px] font-medium tracking-tight text-shadow-blue hover:text-deep-teal hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="max-w-[60ch] pb-5 text-[15px] leading-relaxed text-shadow-blue-light">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
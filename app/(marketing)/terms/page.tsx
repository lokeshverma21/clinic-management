"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale } from "lucide-react";

export default function TermsPage() {
  const lastUpdated = "October 24, 2023";

  return (
    <main className="min-h-screen bg-sterile-white pt-24 pb-20">
      <div className="mx-auto max-w-[800px] px-6">
        {/* Header */}
        <header className="mb-16">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[13px] font-mono uppercase tracking-widest text-deep-teal/60 hover:text-deep-teal transition-colors mb-8"
          >
            <ArrowLeft className="size-3" /> Back to Home
          </Link>
          <h1 className="font-display text-[42px] font-medium tracking-tight text-shadow-blue sm:text-[56px]">
            Terms of <em className="font-accent italic font-normal text-deep-teal">Service.</em>
          </h1>
          <p className="mt-4 font-mono text-[12px] text-shadow-blue-light/60">
            LAST UPDATED: {lastUpdated}
          </p>
        </header>

        {/* Content Section */}
        <div className="prose prose-slate prose-teal max-w-none space-y-12">
          
          <section>
            <h2 className="text-[20px] font-semibold text-shadow-blue mb-4">1. Acceptance of Terms</h2>
            <p className="text-shadow-blue-light leading-relaxed">
              By accessing or using ClinicSeva (“the Platform”), a service provided for clinic management in India, you agree to be bound by these Terms and Conditions. If you are using the service on behalf of a clinic or healthcare entity, you represent that you have the authority to bind that entity.
            </p>
          </section>

          <section className="glass-card p-8 bg-sage-mist/20 border-deep-teal/5">
            <h2 className="text-[20px] font-semibold text-deep-teal mb-4 flex items-center gap-2">
              <ShieldCheck className="size-5" /> 2. WhatsApp API & Communication
            </h2>
            <p className="text-shadow-blue-light leading-relaxed mb-4">
              Our service includes integration with the WhatsApp Business API for appointment reminders and patient communication. As a user, you agree to:
            </p>
            <ul className="list-disc pl-5 space-y-3 text-shadow-blue-light text-[15px]">
              <li>
                <strong>Patient Consent:</strong> You certify that you have obtained explicit `&quot;opt-in`&quot; consent from patients before sending them any messages via WhatsApp through our platform.
              </li>
              <li>
                <strong>Meta Compliance:</strong> You agree to abide by the <strong>Meta WhatsApp Business Policy</strong>. Any violation (spamming, prohibited medical claims) may result in immediate suspension.
              </li>
              <li>
                <strong>Responsibility:</strong> ClinicSeva acts only as a technical provider. The clinic is solely responsible for the content and frequency of messages sent.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-shadow-blue mb-4">3. Data Privacy & Patient Records</h2>
            <p className="text-shadow-blue-light leading-relaxed">
              ClinicSeva complies with the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> of India. 
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-3 text-shadow-blue-light">
              <li><strong>Ownership:</strong> You (the Clinic) own all patient data. ClinicSeva is a `&quot;Data Processor.`&quot;</li>
              <li><strong>Confidentiality:</strong> We implement industry-standard encryption to protect patient health information (PHI).</li>
              <li><strong>Data Residency:</strong> All data is stored on secure servers located within India.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-shadow-blue mb-4">4. Usage & Limitations</h2>
            <p className="text-shadow-blue-light leading-relaxed">
              ClinicSeva is a management tool, not a medical device. It does not provide medical advice, diagnosis, or treatment. We are not liable for any clinical decisions made by the practitioners using the software.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-shadow-blue mb-4">5. Payments & Subscription</h2>
            <p className="text-shadow-blue-light leading-relaxed">
              Services are billed in Indian Rupees (INR) on a monthly or annual basis. Prices are exclusive of GST. Subscriptions can be cancelled at any time, but no refunds will be provided for the remaining period of the current billing cycle.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-shadow-blue mb-4">6. Governing Law</h2>
            <p className="text-shadow-blue-light leading-relaxed">
              These terms are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in <strong>[Your City, e.g., Bangalore/Mumbai]</strong>.
            </p>
          </section>

          <footer className="pt-12 border-t border-shadow-blue/10">
            <p className="text-[14px] text-shadow-blue-light/60">
              Questions about these terms? Reach out to us at <span className="text-deep-teal font-medium">legal@clinicseva.com</span>
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
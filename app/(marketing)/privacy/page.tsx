"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, EyeOff, Server } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "October 24, 2023";

  return (
    <main className="min-h-screen bg-sterile-white pt-24 pb-20 selection:bg-deep-teal selection:text-white">
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
            Privacy <em className="font-accent italic font-normal text-deep-teal">Policy.</em>
          </h1>
          <p className="mt-4 font-mono text-[12px] text-shadow-blue-light/60 uppercase tracking-widest">
            Compliance: DPDP Act 2023 & Meta Business Policy
          </p>
        </header>

        {/* Introduction Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          <div className="glass-card p-6 border-sage-mist bg-sage-mist/10">
            <Lock className="size-5 text-deep-teal mb-3" />
            <h3 className="text-[15px] font-semibold text-shadow-blue">Data Encryption</h3>
            <p className="text-[13px] text-shadow-blue-light mt-1">All patient records are encrypted at rest and during transit.</p>
          </div>
          <div className="glass-card p-6 border-sage-mist bg-sage-mist/10">
            <Server className="size-5 text-deep-teal mb-3" />
            <h3 className="text-[15px] font-semibold text-shadow-blue">Indian Residency</h3>
            <p className="text-[13px] text-shadow-blue-light mt-1">Data is stored exclusively on secure servers located within India.</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="prose prose-slate prose-teal max-w-none space-y-12">
          
          <section>
            <h2 className="text-[20px] font-semibold text-shadow-blue mb-4">1. Data We Collect</h2>
            <p className="text-shadow-blue-light leading-relaxed">
              ClinicSeva collects information necessary to facilitate clinic operations:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-3 text-shadow-blue-light">
              <li><strong>Clinic Information:</strong> Name, address, GST details, and staff credentials.</li>
              <li><strong>Patient Information:</strong> Name, age, gender, contact number, and medical history (entered by the clinic).</li>
              <li><strong>Usage Data:</strong> Log files, device information, and IP addresses to prevent unauthorized access.</li>
            </ul>
          </section>

          <section className="p-8 rounded-2xl bg-deep-teal text-sterile-white shadow-xl">
            <h2 className="text-[20px] font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="size-5 text-sage-mist" /> WhatsApp Data Disclosure
            </h2>
            <p className="text-sterile-white/80 leading-relaxed mb-4">
              To provide automated reminders and scheduling updates via WhatsApp, we share specific data with <strong>Meta Platforms, Inc. (WhatsApp)</strong>:
            </p>
            <ul className="space-y-3 text-[14px]">
              <li className="flex items-start gap-3">
                <span className="size-1.5 rounded-full bg-soft-coral mt-1.5 shrink-0" />
                <span>Patient phone numbers and names are shared with Meta to facilitate message delivery.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="size-1.5 rounded-full bg-soft-coral mt-1.5 shrink-0" />
                <span>This data is used strictly for transactional messaging as triggered by your clinic.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="size-1.5 rounded-full bg-soft-coral mt-1.5 shrink-0" />
                <span>Clinics must ensure they have obtained the necessary patient consent before enabling WhatsApp notifications.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-shadow-blue mb-4">2. How We Use Data</h2>
            <p className="text-shadow-blue-light leading-relaxed">
              Data is used solely for clinical management:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-shadow-blue-light">
              <li>Managing appointment schedules and calendars.</li>
              <li>Generating digital invoices and billing records.</li>
              <li>Providing clinic performance insights to the owner.</li>
              <li>Communicating important service updates to the clinic staff.</li>
            </ul>
            <p className="mt-4 font-medium text-deep-teal">We do not sell patient data to pharmaceutical companies, advertisers, or any third-party brokers.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-shadow-blue mb-4">3. Data Retention & Deletion</h2>
            <p className="text-shadow-blue-light leading-relaxed">
              We retain patient data as long as the clinic maintains an active subscription. Upon termination of service, clinics may request a data export. After 90 days of account inactivity or termination, we reserve the right to permanently delete all data from our active databases.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold text-shadow-blue mb-4">4. Your Rights (DPDP Act 2023)</h2>
            <p className="text-shadow-blue-light leading-relaxed">
              In accordance with Indian law, you and your patients (via the clinic) have the right to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-shadow-blue-light">
              <li>Request correction of inaccurate data.</li>
              <li>Withdraw consent for optional communications.</li>
              <li>Request the erasure of personal data (subject to medical record retention laws).</li>
            </ul>
          </section>

          <footer className="pt-12 border-t border-shadow-blue/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[14px] text-shadow-blue">Data Protection Officer</p>
                <p className="text-[14px] text-deep-teal font-medium">privacy@clinicseva.com</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-[12px] text-shadow-blue-light/60 italic leading-tight">
                  ClinicSeva is a product of [Your Company Name Inc.] <br />
                  Registered in [Your City, State], India.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
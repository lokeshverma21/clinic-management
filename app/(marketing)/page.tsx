// "use client";

// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Calendar,
//   CheckCircle,
//   MessageSquare,
//   Users,
//   ShieldAlert,
//   TrendingUp,
//   Clock,
//   ArrowRight,
//   Menu,
//   X,
//   Play,
//   ChevronDown,
//   Star,
//   Sparkles,
//   Smartphone,
//   UserCheck,
//   Building,
//   Heart,
//   Lock,
//   Zap,
// } from "lucide-react";
// import Link from "next/link";

// // --- Types & Interfaces ---
// interface FeatureCardProps {
//   icon: React.ReactNode;
//   title: string;
//   description: string;
//   badge?: string;
// }

// interface TestimonialProps {
//   quote: string;
//   author: string;
//   role: string;
//   clinic: string;
//   city: string;
//   rating: number;
// }

// interface FAQItemProps {
//   question: string;
//   answer: string;
// }

// export default function ClinicLandingPageLight() {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [activeRoleTab, setActiveRoleTab] = useState<"owner" | "doctor" | "receptionist">("owner");
//   const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("annually");

//   // Animation variants
//   const fadeInUp = {
//     hidden: { opacity: 0, y: 25 },
//     visible: (custom: number) => ({
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.6, delay: custom * 0.1, ease: [0.215, 0.61, 0.355, 1] }
//     })
//   };

//   const scaleIn = {
//     hidden: { opacity: 0, scale: 0.97 },
//     visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
//       {/* Decorative Ambient Background Gradients */}
//       <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-100/40 to-teal-100/30 rounded-full blur-[120px] pointer-events-none -z-10" />
//       <div className="absolute top-[800px] right-10 w-[700px] h-[700px] bg-emerald-100/20 rounded-full blur-[150px] pointer-events-none -z-10" />
//       <div className="absolute top-[2200px] left-10 w-[700px] h-[700px] bg-teal-100/20 rounded-full blur-[150px] pointer-events-none -z-10" />

//       {/* --- Sticky Navigation Bar --- */}
//       <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/80 transition-all duration-300">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
//           <div className="flex items-center gap-2.5">
//             <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
//               <PlusIcon className="w-5 h-5 text-white stroke-[3]" />
//             </div>
//             <div>
//               <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
//                 Cliniceasy
//               </span>
//               <span className="block text-[10px] text-emerald-600 font-bold tracking-widest uppercase">India</span>
//             </div>
//           </div>

//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
//             <Link href="#features" className="hover:text-emerald-600 transition-colors">Features</Link>
//             <Link href="#roles" className="hover:text-emerald-600 transition-colors">How it Works</Link>
//             <Link href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</Link>
//             {/* <Link href="#faqs" className="hover:text-emerald-600 transition-colors">FAQs</Link> */}
//           </nav>

//           <div className="hidden md:flex items-center gap-4">
//             <Link href="/dashboard" className="text-sm font-bold text-green-600 hover:text-slate-900 transition-colors">
//               Dashboard
//             </Link>
//             <Link href="/sign-in" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
//               Sign In
//             </Link>
//             <Link
//               href="/sign-up"
//               className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 active:scale-95 transition-all shadow-md shadow-slate-900/10 flex items-center gap-1.5"
//             >
//               Start Free Trial <ArrowRight className="w-4 h-4" />
//             </Link>
//           </div>

//           {/* Mobile menu button */}
//           <button
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
//             aria-label="Toggle Menu"
//           >
//             {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//           </button>
//         </div>

//         {/* Mobile Navigation Dropdown */}
//         <AnimatePresence>
//           {mobileMenuOpen && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               className="md:hidden bg-white border-b border-slate-200 px-4 py-6 flex flex-col gap-5 text-base font-semibold"
//             >
//               <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-emerald-600">
//                 Features
//               </Link>
//               <Link href="#roles" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-emerald-600">
//                 How it Works
//               </Link>
//               <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-emerald-600">
//                 Pricing
//               </Link>
//               <Link href="#faqs" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-emerald-600">
//                 FAQs
//               </Link>
//               <hr className="border-slate-200" />
//               <div className="flex flex-col gap-3">
//                 <Link href="/dashboard" className="text-center py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold">
//                   Dashboard
//                 </Link>
//                 <Link href="/sign-in" className="text-center py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold">
//                   Sign In
//                 </Link>
//                 <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 rounded-xl bg-slate-900 text-white font-bold">
//                   Start Free Trial
//                 </Link>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </header>

//       {/* --- HERO SECTION --- */}
//       <section className="relative pt-8 pb-20 md:pt-16 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
//           {/* Left Hero Content */}
//           <motion.div 
//             className="lg:col-span-7 flex flex-col space-y-6"
//             initial="hidden"
//             animate="visible"
//             // variants={fadeInUp}
//             custom={0}
//           >
//             {/* Value Badge */}
//             <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full w-fit shadow-sm shadow-emerald-100/50">
//               <Sparkles className="w-4 h-4 text-emerald-600" />
//               <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">Built for Indian Clinics</span>
//             </div>

//             {/* Main Catchy Heading */}
//             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-900">
//               The easiest clinic app. <br />
//               <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
//                 Zero training required.
//               </span>
//             </h1>

//             {/* Problem solving description */}
//             <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
//               No complex training calls or endless setups. From signup to taking your first booked appointment on <span className="text-emerald-600 font-bold">WhatsApp</span> in under 15 minutes. Safely run your entire clinic from your phone or laptop.
//             </p>

//             {/* Quick Proof Metrics */}
//             <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-200 max-w-xl">
//               <div>
//                 <p className="text-xl sm:text-2xl font-black text-slate-900">15 Mins</p>
//                 <p className="text-xs text-slate-500 font-medium mt-0.5">Setup to Live</p>
//               </div>
//               <div className="border-x border-slate-200 px-4">
//                 <p className="text-xl sm:text-2xl font-black text-slate-900">-90%</p>
//                 <p className="text-xs text-slate-500 font-medium mt-0.5">No-Show Rates</p>
//               </div>
//               <div className="pl-2">
//                 <p className="text-xl sm:text-2xl font-black text-emerald-600">WhatsApp</p>
//                 <p className="text-xs text-slate-500 font-medium mt-0.5">Auto Reminders</p>
//               </div>
//             </div>

//             {/* Interactive Call to Action Panel */}
//             <div className="flex flex-col sm:flex-row gap-4 max-w-xl pt-2">
//               <Link
//                 href="#signup"
//                 className="flex-1 px-8 py-4 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-950/10 flex items-center justify-center gap-2"
//               >
//                 Start 14-Day Free Trial
//                 <ArrowRight className="w-5 h-5" />
//               </Link>
//               <a
//                 href="#demo-video"
//                 className="px-6 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
//               >
//                 <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" /> Watch Demo
//               </a>
//             </div>

//             <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
//               <CheckCircle className="w-4 h-4 text-emerald-500" /> No credit card required • Active in under 15 minutes
//             </p>
//           </motion.div>

//           {/* Right Hero Visual Showcase (Interactive Mockup) */}
//           <motion.div 
//             className="lg:col-span-5 relative"
//             initial="hidden"
//             animate="visible"
//             variants={scaleIn}
//           >
//             {/* Visual glow backdrop */}
//             <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-3xl filter blur-2xl pointer-events-none" />

//             {/* Main UI Mockup */}
//             <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-xl overflow-hidden">
              
//               {/* Header inside mock */}
//               <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 rounded-full bg-slate-200" />
//                   <div className="w-3 h-3 rounded-full bg-slate-200" />
//                   <div className="w-3 h-3 rounded-full bg-slate-200" />
//                 </div>
//                 <div className="bg-slate-100 px-3 py-1 rounded-md text-[11px] text-slate-500 font-mono font-medium">
//                   cliniceasy.in/dashboard
//                 </div>
//               </div>

//               {/* Internal Mock Content */}
//               <div className="space-y-4">
//                 {/* Live Clinic Stats Widget */}
//                 <div className="bg-slate-50 border border-slate-150 rounded-xl p-4">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs font-bold text-slate-500">Clinic Status Today</span>
//                     <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Live</span>
//                   </div>
//                   <div className="grid grid-cols-3 gap-2 text-center">
//                     <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
//                       <span className="block text-[10px] text-slate-500 font-medium">Appointments</span>
//                       <span className="text-base font-extrabold text-slate-900">18</span>
//                     </div>
//                     <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
//                       <span className="block text-[10px] text-slate-500 font-medium">Revenue</span>
//                       <span className="text-base font-extrabold text-slate-900">₹14,250</span>
//                     </div>
//                     <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
//                       <span className="block text-[10px] text-slate-500 font-medium">No-shows</span>
//                       <span className="text-base font-extrabold text-emerald-600">0</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* WhatsApp Notification Simulator */}
//                 <div className="relative bg-white border border-emerald-100 rounded-xl p-3 shadow-md">
//                   <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-100">
//                     <MessageSquare className="w-3 h-3" /> WhatsApp Sent
//                   </div>
//                   <p className="text-xs font-bold text-slate-800 mb-1">To: Mrs. Sharma (Patient)</p>
//                   <p className="text-[11px] text-slate-600 leading-normal bg-slate-50 p-2.5 rounded border border-slate-150">
//                     &quot;Namaste Mrs. Sharma, your appointment with Dr. Gupta is confirmed for today at <span className="text-emerald-700 font-bold">5:30 PM</span>. Tap link to reschedule: map.ly/doc&quot;
//                   </p>
//                 </div>

//                 {/* Fast Appointment Form mockup */}
//                 <div className="bg-slate-50 border border-slate-150 rounded-xl p-3">
//                   <div className="flex items-center gap-2 mb-2">
//                     <Calendar className="w-3.5 h-3.5 text-emerald-600" />
//                     <span className="text-xs font-bold text-slate-700">Quick Book (Takes 10 Seconds)</span>
//                   </div>
//                   <div className="grid grid-cols-2 gap-2">
//                     <div className="h-7 bg-white rounded border border-slate-200 flex items-center px-2 text-[10px] text-slate-400 font-medium">Patient Phone No.</div>
//                     <div className="h-7 bg-white rounded border border-slate-200 flex items-center px-2 text-[10px] text-slate-400 font-medium">Doctor & Slot</div>
//                   </div>
//                 </div>
//               </div>

//             </div>
//           </motion.div>

//         </div>
//       </section>

//       {/* --- CLINICS SUPPORTED BADGES --- */}
//       <section className="bg-white border-y border-slate-200/80 py-8">
//         <div className="max-w-7xl mx-auto px-4 text-center">
//           <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-5">
//             Designed uniquely for diverse clinical practices across India
//           </p>
//           <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-600">
//             {["Dental Clinics", "Physiotherapists", "Dermatologists", "Pediatricians", "General Physicians", "Diagnostic Labs"].map((item, idx) => (
//               <span key={idx} className="bg-slate-50 px-4 py-2 rounded-full border border-slate-200 flex items-center gap-2 shadow-sm">
//                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {item}
//               </span>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* --- FIVE CORE BENEFITS / SOLUTIONS --- */}
//       <section id="features" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
//         <div className="text-center max-w-3xl mx-auto mb-16">
//           <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Designed for Simplicity</h2>
//           <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
//             Everything your practice needs, without the tech headaches.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          
//           <FeatureCard 
//             icon={<Clock className="w-6 h-6 text-emerald-600" />}
//             title="Setup in Under 15 Minutes"
//             description="Go live instantly with step-by-step registration, zero training requirements, and direct onboarding. Start taking patient bookings on day one."
//             badge="Fastest Setup"
//           />

//           <FeatureCard 
//             icon={<MessageSquare className="w-6 h-6 text-emerald-600" />}
//             title="Auto WhatsApp Reminders"
//             description="Our automated engine triggers clean, personalized reminders directly to your patient's WhatsApp. Slash your clinic no-shows by up to 90%."
//             badge="Patient Favorite"
//           />

//           <FeatureCard 
//             icon={<Users className="w-6 h-6 text-emerald-600" />}
//             title="Tailored Staff Views"
//             description="Separate, custom dashboards tailored specifically for clinic owners, consulting doctors, and front-desk receptionists. Zero clashing screens."
//           />

//           <FeatureCard 
//             icon={<ShieldAlert className="w-6 h-6 text-emerald-600" />}
//             title="Secure Electronic Health Records"
//             description="Prescriptions, patient charts, previous logs, and payments securely stored per-clinic. Fully compliant with modern data protection standards."
//           />

//           <FeatureCard 
//             icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
//             title="At-a-Glance Analytics"
//             description="Instantly view your key business metrics: today's appointments, this month's revenue, active patient demographics, and booking trends."
//           />

//           <FeatureCard 
//             icon={<Zap className="w-6 h-6 text-emerald-600" />}
//             title="Works Flawlessly on Mobile"
//             description="No complex installations or app-store headaches. Access calendars or draft digital prescriptions safely on any Android, iOS, or PC."
//           />

//         </div>
//       </section>

//       {/* --- ROLE-BASED WORKSPACE SHOWCASE (STRENGTH 3) --- */}
//       <section id="roles" className="py-20 bg-slate-100/50 border-y border-slate-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
//           <div className="text-center max-w-3xl mx-auto mb-12">
//             <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Customized Workspaces</h2>
//             <p className="text-3xl sm:text-4xl font-black text-slate-900">
//               One software. Three perfectly tailored screens.
//             </p>
//             <p className="text-sm sm:text-base text-slate-500 mt-3 font-medium">
//               We don&apos;t force a messy, overcrowded screen onto everyone. Your team sees only what they need to succeed.
//             </p>
//           </div>

//           {/* Role Tabs */}
//           <div className="flex justify-center mb-10">
//             <div className="bg-white p-1.5 rounded-xl border border-slate-200 flex gap-1 shadow-sm">
//               {[
//                 { id: "owner", label: "Clinic Owner", icon: <Building className="w-4 h-4" /> },
//                 { id: "doctor", label: "Consulting Doctor", icon: <UserCheck className="w-4 h-4" /> },
//                 { id: "receptionist", label: "Receptionist", icon: <Smartphone className="w-4 h-4" /> }
//               ].map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveRoleTab(tab.id as "owner" | "doctor" | "receptionist")}
//                   className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
//                     activeRoleTab === tab.id 
//                       ? "bg-slate-900 text-white shadow-sm" 
//                       : "text-slate-500 hover:text-slate-900"
//                   }`}
//                 >
//                   {tab.icon}
//                   {tab.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Active Tab Screen Content Panel */}
//           <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-lg">
//             <AnimatePresence mode="wait">
//               {activeRoleTab === "owner" && (
//                 <motion.div
//                   key="owner"
//                   initial={{ opacity: 0, y: 15 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -15 }}
//                   transition={{ duration: 0.3 }}
//                   className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
//                 >
//                   <div className="space-y-4">
//                     <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Business Dashboard</span>
//                     <h3 className="text-2xl font-bold text-slate-900">Full clinic performance, at a glance</h3>
//                     <p className="text-slate-600 text-sm leading-relaxed">
//                       Track billing, overall appointment volume, and staff activities across all branches without asking for manual sheets. Manage security clearances instantly.
//                     </p>
//                     <ul className="space-y-2 text-xs sm:text-sm text-slate-500 font-semibold">
//                       <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Live Revenue Tracker</li>
//                       <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Multi-Doctor Schedule Overview</li>
//                       <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Staff Performance Metrics</li>
//                     </ul>
//                   </div>
//                   <div className="bg-slate-50 rounded-xl border border-slate-150 p-5">
//                     <p className="text-xs text-slate-500 font-bold mb-3">Owner&apos;s Dashboard Live Feed</p>
//                     <div className="space-y-3">
//                       <div className="flex justify-between items-center bg-white p-2.5 rounded border border-slate-150 shadow-sm">
//                         <span className="text-xs text-slate-700 font-bold">Daily Target Reached</span>
//                         <span className="text-xs text-emerald-600 font-extrabold">115%</span>
//                       </div>
//                       <div className="flex justify-between items-center bg-white p-2.5 rounded border border-slate-150 shadow-sm">
//                         <span className="text-xs text-slate-700 font-bold">Monthly Collection</span>
//                         <span className="text-xs text-emerald-600 font-extrabold">₹3,42,000</span>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}

//               {activeRoleTab === "doctor" && (
//                 <motion.div
//                   key="doctor"
//                   initial={{ opacity: 0, y: 15 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -15 }}
//                   transition={{ duration: 0.3 }}
//                   className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
//                 >
//                   <div className="space-y-4">
//                     <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Clinical Care Focus</span>
//                     <h3 className="text-2xl font-bold text-slate-900">Streamlined consultations & prescriptions</h3>
//                     <p className="text-slate-600 text-sm leading-relaxed">
//                       Write professional digital prescriptions in seconds. Instant access to patient logs, clinical scans, and secure case records.
//                     </p>
//                     <ul className="space-y-2 text-xs sm:text-sm text-slate-500 font-semibold">
//                       <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Digital Prescription Builder</li>
//                       <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> 1-Click Patient Timeline Access</li>
//                       <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Standard Treatment Templates</li>
//                     </ul>
//                   </div>
//                   <div className="bg-slate-50 rounded-xl border border-slate-150 p-5">
//                     <p className="text-xs text-slate-500 font-bold mb-3">Consultation Screen View</p>
//                     <div className="space-y-3">
//                       <div className="bg-white p-3 rounded border border-slate-150 shadow-sm">
//                         <p className="text-xs font-bold text-slate-800 mb-1">Ramesh Kumar (Male, 42)</p>
//                         <p className="text-[11px] text-emerald-600 font-bold">Past History: Hypertension, Root Canal</p>
//                       </div>
//                       <div className="bg-white p-3 rounded border border-emerald-100 shadow-sm">
//                         <span className="text-[10px] uppercase font-bold text-emerald-600">Prescribed Medicine</span>
//                         <p className="text-xs text-slate-700 font-bold mt-1">Paracetamol 650mg — Twice daily after meals</p>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}

//               {activeRoleTab === "receptionist" && (
//                 <motion.div
//                   key="receptionist"
//                   initial={{ opacity: 0, y: 15 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -15 }}
//                   transition={{ duration: 0.3 }}
//                   className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
//                 >
//                   <div className="space-y-4">
//                     <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Front Desk Efficiency</span>
//                     <h3 className="text-2xl font-bold text-slate-900">Book patients in just two clicks</h3>
//                     <p className="text-slate-600 text-sm leading-relaxed">
//                       Zero-lag booking engine. Record payments, direct patient queues, and confirm WhatsApp schedules without switching tabs or system lag.
//                     </p>
//                     <ul className="space-y-2 text-xs sm:text-sm text-slate-500 font-semibold">
//                       <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Walk-In Queue Manager</li>
//                       <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Instant Booking Dispatcher</li>
//                       <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> One-Tap Billing & Invoices</li>
//                     </ul>
//                   </div>
//                   <div className="bg-slate-50 rounded-xl border border-slate-150 p-5">
//                     <p className="text-xs text-slate-500 font-bold mb-3">Front-Desk Quick Scheduler</p>
//                     <div className="space-y-2">
//                       <div className="flex justify-between items-center bg-emerald-50 p-2.5 rounded border border-emerald-100 shadow-sm">
//                         <div className="text-left">
//                           <span className="block text-xs font-bold text-slate-800">Amit Patel</span>
//                           <span className="text-[10px] text-slate-500 font-semibold">Queue #4 • 5:15 PM</span>
//                         </div>
//                         <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">Confirmed</span>
//                       </div>
//                       <div className="flex justify-between items-center bg-white p-2.5 rounded border border-slate-150 shadow-sm">
//                         <div className="text-left">
//                           <span className="block text-xs font-bold text-slate-800">Sonia Sen</span>
//                           <span className="text-[10px] text-slate-500 font-semibold">Queue #5 • 5:30 PM</span>
//                         </div>
//                         <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded font-bold border border-amber-100">Waiting</span>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//         </div>
//       </section>

//       {/* --- TRUST & CONVERSION SOCIAL PROOF SECTION --- */}
//       <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center max-w-2xl mx-auto mb-16">
//           <div className="flex items-center justify-center gap-1 mb-3">
//             {[1, 2, 3, 4, 5].map((s) => (
//               <Star key={s} className="w-5 h-5 text-amber-400 fill-amber-400" />
//             ))}
//           </div>
//           <p className="text-2xl sm:text-3xl font-black text-slate-900">
//             Trusted by 500+ Indian Doctors
//           </p>
//           <p className="text-slate-500 text-sm sm:text-base mt-2 font-medium">
//             Physiotherapists, Pediatricians, and Dentists are switching away from complex workflows.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
//           <TestimonialCard 
//             quote="Our patient flow improved instantly. The automatic WhatsApp reminder is magical — patients arrive perfectly on time and clinic no-shows dropped completely."
//             author="Dr. Manish Gupta"
//             role="Chief Pediatrician"
//             clinic="Heal&Smile Clinic"
//             city="New Delhi"
//             rating={5}
//           />
//           <TestimonialCard 
//             quote="No training was needed. I logged in, added my reception staff, and we started booking patient cards in under 10 minutes. Beautiful, clean layout."
//             author="Dr. Sneha Rao"
//             role="Dermatologist"
//             clinic="Skinsure Aesthetic"
//             city="Bengaluru"
//             rating={5}
//           />
//           <TestimonialCard 
//             quote="Managing accounting and patient logs was a messy job earlier. Now, I see my entire clinic's daily revenue, dues, and charts directly on my phone."
//             author="Dr. Vikram Sharma"
//             role="Dental Surgeon"
//             clinic="Apex Dental Care"
//             city="Mumbai"
//             rating={5}
//           />
//         </div>
//       </section>

//       {/* --- PRICING SECTION --- */}
//       <section id="pricing" className="py-20 md:py-32 bg-slate-100/50 border-y border-slate-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
//           <div className="text-center max-w-3xl mx-auto mb-12">
//             <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Simple & Flat Pricing</h2>
//             <p className="text-3xl sm:text-4xl font-black text-slate-900">
//               No setup fees, no hidden costs.
//             </p>

//             {/* Toggle switch */}
//             <div className="flex items-center justify-center gap-3 mt-6">
//               <span className={`text-sm font-semibold ${billingPeriod === "monthly" ? "text-slate-950 font-bold" : "text-slate-400"}`}>Monthly</span>
//               <button 
//                 onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annually" : "monthly")}
//                 className="w-12 h-6 rounded-full bg-slate-200 p-1 transition-colors flex items-center"
//               >
//                 <div className={`w-4 h-4 rounded-full bg-emerald-500 transition-transform ${billingPeriod === "annually" ? "translate-x-6" : ""}`} />
//               </button>
//               <span className={`text-sm flex items-center gap-1.5 font-semibold ${billingPeriod === "annually" ? "text-slate-950 font-bold" : "text-slate-400"}`}>
//                 Annually <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">Save 20%</span>
//               </span>
//             </div>
//           </div>

//           {/* Pricing Card */}
//           <div className="max-w-md mx-auto bg-white border-2 border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            
//             <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-teal-400 text-white text-xs font-extrabold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
//               Best Deal
//             </div>

//             <div className="mb-6">
//               <h3 className="text-xl font-bold text-slate-900">Complete Practice Plan</h3>
//               <p className="text-xs text-slate-500 font-medium mt-1">Perfect for solo practices and growing multi-role clinics.</p>
//               <div className="mt-4 flex items-baseline gap-1">
//                 <span className="text-4xl sm:text-5xl font-black text-slate-900">
//                   ₹{billingPeriod === "annually" ? "1,599" : "1,999"}
//                 </span>
//                 <span className="text-slate-500 text-sm font-semibold">/month (billed {billingPeriod})</span>
//               </div>
//             </div>

//             <hr className="border-slate-150 mb-6" />

//             <ul className="space-y-4 text-xs sm:text-sm text-slate-600 font-semibold mb-8">
//               <li className="flex items-center gap-3">
//                 <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
//                 <span>Unlimited Appointments & Patient Bookings</span>
//               </li>
//               <li className="flex items-center gap-3">
//                 <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
//                 <span>Auto WhatsApp Reminders (Custom templates)</span>
//               </li>
//               <li className="flex items-center gap-3">
//                 <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
//                 <span>Custom Views (Doctor, Receptionist, Owner)</span>
//               </li>
//               <li className="flex items-center gap-3">
//                 <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
//                 <span>Digital Prescriptions & Secure EHR</span>
//               </li>
//               <li className="flex items-center gap-3">
//                 <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
//                 <span>Automated Billing, Dues & Analytics</span>
//               </li>
//             </ul>

//             <a
//               href="#signup"
//               className="block text-center w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 transition-all shadow-md shadow-slate-950/10"
//             >
//               Start 14-Day Free Trial
//             </a>

//             <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1 font-semibold">
//               <Lock className="w-3.5 h-3.5" /> Cancel anytime • Instant deployment
//             </p>
//           </div>

//         </div>
//       </section>

//       {/* --- FAQ SECTION --- */}
//       <section id="faqs" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-16">
//           <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Frequently Asked Questions</h2>
//           <p className="text-3xl font-black text-slate-900">We have answers to your doubts</p>
//         </div>

//         <div className="space-y-4">
//           <FAQItem 
//             question="Do we need a long training call to start using Cliniceasy?"
//             answer="Absolutely not! Cliniceasy is designed with absolute simplicity. Just enter your basic clinic info, input your doctor schedule, and begin booking live patients under 15 minutes. No setup calls required."
//           />
//           <FAQItem 
//             question="How do the WhatsApp reminders work? Is it automatic?"
//             answer="Yes, completely automated. As soon as a receptionist or doctor books a slot, your patient receives a beautifully structured WhatsApp confirmation. It sends automatic alerts prior to the visit with location pins."
//           />
//           <FAQItem 
//             question="Is our patient clinical data safe and confidential?"
//             answer="We maintain industry-standard security protocols. Your patient database is heavily encrypted and locked uniquely per clinic. No bulk operations or reports can be extracted without authorization."
//           />
//           <FAQItem 
//             question="Do we need to pay for sending WhatsApp reminders?"
//             answer="No, unlike other platform architectures that charge heavily per-message, Cliniceasy offers bundled WhatsApp alerts integrated directly into our pricing tiers."
//           />
//         </div>
//       </section>

//       {/* --- FINAL CALL TO ACTION (CTA) --- */}
//       <section id="signup" className="py-20 md:py-28 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/30 via-transparent to-transparent rounded-3xl -z-10 pointer-events-none" />
        
//         <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-16 text-center max-w-5xl mx-auto shadow-xl">
//           <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.2]">
//             Ready to upgrade your clinic today? <br />
//             <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
//               No credit card. No stress.
//             </span>
//           </h2>
//           <p className="text-slate-600 max-w-2xl mx-auto mt-4 text-sm sm:text-base leading-relaxed font-medium">
//             Join hundreds of clinical professionals. Setup takes under 15 minutes. If you want seamless receptionist workflows and zero manual messaging, Cliniceasy is for you.
//           </p>

//           <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
//             <input 
//               type="email" 
//               placeholder="Enter your Email Address"
//               className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
//             />
//             <button className="w-full sm:w-auto shrink-0 px-6 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-md">
//               Try It Free
//             </button>
//           </div>
          
//           <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1 font-semibold">
//             <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Free 14-day trial, instantly live
//           </p>
//         </div>
//       </section>

//       {/* --- PREMIUM FOOTER --- */}
//       <footer className="border-t border-slate-200 bg-white py-12 text-xs sm:text-sm text-slate-500">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
//           <div className="space-y-4">
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md">
//                 <PlusIcon className="w-4 h-4 text-white stroke-[3]" />
//               </div>
//               <span className="text-base font-extrabold text-slate-900">Cliniceasy</span>
//             </div>
//             <p className="leading-relaxed text-slate-400 font-medium">
//               Modern software built solely to streamline Indian healthcare practices, dental clinics, general physicians and pediatricians. Simple, safe, and stress-free.
//             </p>
//           </div>

//           <div>
//             <h4 className="text-slate-900 font-bold mb-4">Features</h4>
//             <ul className="space-y-2 font-semibold">
//               <li><a href="#features" className="hover:text-emerald-600 transition-colors">WhatsApp Alerts</a></li>
//               <li><a href="#roles" className="hover:text-emerald-600 transition-colors">Role Dashboards</a></li>
//               <li><a href="#features" className="hover:text-emerald-600 transition-colors">Digital Prescriptions</a></li>
//               <li><a href="#features" className="hover:text-emerald-600 transition-colors">EHR Management</a></li>
//             </ul>
//           </div>

//           <div>
//             <h4 className="text-slate-900 font-bold mb-4">Company</h4>
//             <ul className="space-y-2 font-semibold">
//               <li><a href="#" className="hover:text-emerald-600 transition-colors">About Us</a></li>
//               <li><a href="#" className="hover:text-emerald-600 transition-colors">Careers</a></li>
//               <li><a href="#" className="hover:text-emerald-600 transition-colors">Support Center</a></li>
//               <li><a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a></li>
//             </ul>
//           </div>

//           <div>
//             <h4 className="text-slate-900 font-bold mb-4">Support & Trust</h4>
//             <ul className="space-y-2 font-semibold">
//               <li className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Made for Indian Clinics</li>
//               <li>Support: support@cliniceasy.in</li>
//               <li>Location: Bengaluru, KA, India</li>
//             </ul>
//           </div>

//         </div>

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-semibold text-slate-400">
//           <p>© {new Date().getFullYear()} Cliniceasy Solutions Private Limited. All rights reserved.</p>
//           <div className="flex gap-4">
//             <a href="#" className="hover:text-emerald-600">Terms of Service</a>
//             <a href="#" className="hover:text-emerald-600">Security</a>
//           </div>
//         </div>
//       </footer>

//     </div>
//   );
// }

// // --- SUB-COMPONENTS ---

// // Custom Plus Icon
// function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
//     </svg>
//   );
// }

// // Feature Card Component
// function FeatureCard({ icon, title, description, badge }: FeatureCardProps) {
//   return (
//     <div className="relative group bg-white hover:bg-slate-50/50 border border-slate-200 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between h-full shadow-sm hover:shadow-md">
//       <div>
//         <div className="flex items-center justify-between mb-4">
//           <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:border-emerald-200 group-hover:bg-emerald-50/50 transition-colors">
//             {icon}
//           </div>
//           {badge && (
//             <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
//               {badge}
//             </span>
//           )}
//         </div>
//         <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
//           {title}
//         </h3>
//         <p className="text-slate-500 text-sm leading-relaxed font-medium">
//           {description}
//         </p>
//       </div>
//     </div>
//   );
// }

// // Testimonial Card Component
// function TestimonialCard({ quote, author, role, clinic, city }: TestimonialProps) {
//   return (
//     <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-all relative">
//       <div>
//         <div className="flex gap-1 mb-4">
//           {[1, 2, 3, 4, 5].map((s) => (
//             <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
//           ))}
//         </div>
//         <p className="text-slate-600 text-sm leading-relaxed italic mb-6 font-medium">
//           &quot;{quote}&quot;
//         </p>
//       </div>
//       <div>
//         <hr className="border-slate-100 mb-4" />
//         <p className="text-sm font-bold text-slate-900">{author}</p>
//         <p className="text-xs text-slate-500 font-semibold">{role} • {clinic}</p>
//         <p className="text-[10px] text-emerald-600 font-extrabold tracking-wide uppercase mt-0.5">{city}</p>
//       </div>
//     </div>
//   );
// }

// // Simple Accordion FAQ Component
// function FAQItem({ question, answer }: FAQItemProps) {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <div className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-colors duration-300">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-slate-900 focus:outline-none"
//       >
//         <span>{question}</span>
//         <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "transform rotate-180 text-emerald-500" : ""}`} />
//       </button>
      
//       <AnimatePresence initial={false}>
//         {isOpen && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.2 }}
//             className="overflow-hidden"
//           >
//             <div className="p-5 pt-0 text-slate-500 text-xs sm:text-sm leading-relaxed border-t border-slate-100 font-semibold">
//               {answer}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import ChaosLayer from "@/components/marketing/home/ChaosLayer";
import Transformation from "@/components/marketing/home/Transformation";
import Anatomy from "@/components/marketing/home/Anatomy";
import HumanProof from "@/components/marketing/home/HumanProof";
import SecurityVeil from "@/components/marketing/home/SecurityVeil";
import Navbar from "@/components/marketing/navbar";
import Pricing from "@/components/marketing/home/Pricing";
import Hero from "@/components/marketing/home/hero";
import Footer from "@/components/marketing/footer";

export default function Home() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <main id="main-content" className="relative overflow-x-hidden">
      <Navbar />
      <Hero />
      <ChaosLayer />
      <Transformation />
      <Anatomy />
      <HumanProof />
      <SecurityVeil />
      <Pricing />
      <Footer />
    </main>
  );
}
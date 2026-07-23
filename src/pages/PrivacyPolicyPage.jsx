import React from 'react';
import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';

const SECTIONS = [
  {
    id: 'introduction',
    title: '1. Introduction',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    content: 'Welcome to Medistrax. We are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how Medistrax ("we", "us", or "our") collects, uses, discloses, and safeguards your information when you use our mobile and web applications, including field-force tracking, customer relationship management (CRM), and payroll services.'
  },
  {
    id: 'data-collection',
    title: '2. Information We Collect',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    content: 'We collect information that identifies, relates to, or could reasonably be linked, directly or indirectly, with a particular user. This includes:\n\n• Account Credentials: Name, phone number, email, and password during registration.\n• Profile Details: Date of birth, blood group, gender, and residential addresses.\n• Employment & Statutory Data: Department, salary terms, PAN, Aadhar, UAN, PF details, and experience documents.\n• Real-Time GPS Tracking: Real-time location coordinates recorded during visit check-ins (Visit-In / Location Check-in) and Daily Call Reports (DCR) logging.\n• Client Data: Profiles of Doctors and Chemists visited, sales order transactions, and sample distribution records.'
  },
  {
    id: 'purpose',
    title: '3. How We Use Your Information',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    content: 'We use the collected information for essential operational purposes, including:\n\n• Onboarding & Compliance: Processing user onboarding workflows across statutory and employment checks.\n• Daily Call Report (DCR) Auto-Approvals: Utilizing geofencing and GPS validation to verify DCR records and calculate compliance metrics.\n• Joint Field Work (JFW): Enabling multi-manager selection to associate visits with supervising Area, Regional, or Zonal managers.\n• Payroll Operations: Generating monthly employee payslips based on attendance logs and base salaries.\n• Analytics: Aggregating order bookings and visual aid presentation metrics for company dashboards.'
  },
  {
    id: 'security',
    title: '4. Data Security & Isolation',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    content: 'Your security is our top priority. We use strict multi-tenant isolation secured by a unique company code (adminReferenceCode). This guarantees that your firm\'s data, field tracking, and employee details are strictly segmented and inaccessible by unauthorized parties. We employ advanced encryption protocols (SSL/TLS) for data in transit and rest.'
  },
  {
    id: 'sharing',
    title: '5. Data Sharing & Third-Parties',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.828-2.414m0 0a3 3 0 10-3.62-1.09l-4.828 2.414m6.068 1.09a3 3 0 11-4.828 2.414l-4.828-2.414m12.484 0a3 3 0 113.62 1.09l-4.828 2.414" />
      </svg>
    ),
    content: 'We do not sell your personal information. Data is shared only under strict operational scopes:\n\n• Company Directory: Shared hierarchically with supervising managers (ZBMs, RBMs, ABMs) as part of reporting structures.\n• External Integrations: Mapping coordinates with geocoding providers, and checking public holidays via compliant API providers (e.g. Calendarific).\n• Legal Mandates: When required by law, regulatory frameworks, or to protect the safety and rights of our users.'
  },
  {
    id: 'retention',
    title: '6. Data Retention',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    content: 'We retain your personal information only for as long as is necessary to fulfill the business purposes outlined in this policy, satisfy statutory reporting cycles, or until an account deletion request is authorized by your company\'s tenant Administrator.'
  },
  {
    id: 'contact',
    title: '7. Contact & Grievances',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    content: 'If you have questions, feedback, or concerns regarding this Privacy Policy or our security measures, please contact our support department:\n\n• Corporate Office: Gmaxepay Fintech Solutions Pvt Ltd., West of Chord Road, Stage 2, Nagapura, Bengaluru, Karnataka 560086\n• Web Desk: www.gmaxepay.com\n• Email Support: support@gmaxepay.com'
  }
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F4F9F4] font-sans text-[#1F2937] flex flex-col selection:bg-[#E5F7E3] selection:text-[#28823A] pt-24">
      {/* Global Landing Navbar */}
      <Navbar />

      {/* Decorative top background elements */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-gradient-to-b from-[#E5F7E3]/60 via-[#E5F7E3]/20 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-[120px] right-[10%] w-[300px] h-[300px] bg-[#28823A]/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Hero Header */}
      <section className="max-w-4xl mx-auto w-full px-6 py-12 text-center box-border flex flex-col items-center">
        <span className="text-[11px] font-extrabold tracking-widest text-[#28823A] uppercase bg-[#E5F7E3] px-3.5 py-1.5 rounded-full mb-4 animate-fade-in select-none">
          Legal & Trust Center
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#0D2411] tracking-tight m-0 mb-4 leading-none">
          Privacy Policy
        </h1>
        <p className="text-[14px] sm:text-[16px] text-gray-500 max-w-xl font-medium m-0 leading-relaxed">
          At Medistrax, we prioritize the protection of your personal information, the security of real-time GPS check-ins, and multi-tenant isolation.
        </p>
      </section>

      {/* Main Layout Container (Single-column centered) */}
      <main className="max-w-4xl mx-auto w-full px-6 pb-20 flex-grow box-border">
        
        {/* Continuous Legal Document */}
        <section className="space-y-12">
          {SECTIONS.map((sec, idx) => (
            <article 
              key={sec.id} 
              id={sec.id} 
              className={`scroll-mt-24 transition-all duration-300 ${
                idx > 0 ? 'border-t border-gray-200/50 pt-10 mt-10' : ''
              }`}
            >
              <div className="flex items-center gap-3.5 mb-4 group">
                <div className="p-2.5 rounded-2xl bg-[#E5F7E3] text-[#28823A] shadow-sm">
                  {sec.icon}
                </div>
                <h2 className="text-lg font-bold text-[#0D2411] m-0">
                  {sec.title}
                </h2>
              </div>
              <div className="text-[14.5px] leading-relaxed font-normal whitespace-pre-wrap pl-0 sm:pl-12 text-gray-600">
                {sec.content}
              </div>
            </article>
          ))}
        </section>
      </main>

      {/* Global Landing Footer */}
      <Footer />
    </div>
  );
}

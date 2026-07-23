import React from 'react';
import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';

export default function DeleteAccountPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F4F9F4] font-sans text-[#1F2937] flex flex-col selection:bg-[#E5F7E3] selection:text-[#28823A] pt-32">
      {/* Global Landing Navbar */}
      <Navbar />

      {/* Decorative top background elements */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-gradient-to-b from-[#E5F7E3]/60 via-[#E5F7E3]/20 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-[120px] right-[10%] w-[300px] h-[300px] bg-[#28823A]/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Hero Header */}
      <section className="max-w-4xl mx-auto w-full px-6 py-12 text-center box-border flex flex-col items-center">
        <span className="text-[11px] font-extrabold tracking-widest text-[#28823A] uppercase bg-[#E5F7E3] px-3.5 py-1.5 rounded-full mb-4 animate-fade-in select-none">
          Legal & Compliance
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#0D2411] tracking-tight m-0 mb-4 leading-none">
          Delete Account Policy
        </h1>
        <p className="text-[14px] sm:text-[16px] text-gray-500 max-w-xl font-medium m-0 leading-relaxed">
          Learn about our procedures, data isolation guarantees, and archiving schedules when requesting account deletion.
        </p>
      </section>

      {/* Continuous Legal Document */}
      <main className="max-w-4xl mx-auto w-full px-6 pb-24 flex-grow box-border">
        <section className="bg-white border border-gray-200/85 rounded-[32px] p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-10 box-border">
          
          <article className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 m-0">1. Overview</h2>
            <p className="text-[14.5px] leading-relaxed text-gray-600 font-normal m-0">
              We respect your right to control your personal data, including the deletion of your account. Users can request complete deletion of their account credentials, profiles, bank records, and statutory information at any time. This policy outlines our standards for verifying requests, isolating data, and managing compliance.
            </p>
          </article>

          <div className="border-t border-gray-100" />

          <article className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 m-0">2. Request Mechanisms</h2>
            <p className="text-[14.5px] leading-relaxed text-gray-600 font-normal m-0">
              To initiate an account deletion request:
            </p>
            <ul className="text-[14.5px] leading-relaxed text-gray-600 font-normal space-y-2 pl-5 m-0">
              <li><strong>Internal Request:</strong> You can contact your company's tenant Administrator to request removal.</li>
              <li><strong>Support Desk:</strong> You can submit an online request using our secure <a href="/account-deletion" className="text-[#28823A] font-bold hover:underline">Account Deletion Form Page</a> or by emailing our support desk directly at support@gmaxepay.com.</li>
            </ul>
          </article>

          <div className="border-t border-gray-100" />

          <article className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 m-0">3. Scope of Data Deletion</h2>
            <p className="text-[14.5px] leading-relaxed text-gray-600 font-normal m-0">
              Upon successful verification of your identity and authorization from your company's administrator, we will purge:
            </p>
            <ul className="text-[14.5px] leading-relaxed text-gray-600 font-normal space-y-2 pl-5 m-0 font-medium">
              <li>• Your login credentials (email, hashed password, phone).</li>
              <li>• Personal identification parameters (first name, surname, DOB, addresses).</li>
              <li>• Financial processing coordinates (bank branch, account details, IFSC code).</li>
              <li>• Statutory numbers (PAN, Aadhar, UAN, PF records).</li>
            </ul>
          </article>

          <div className="border-t border-gray-100" />

          <article className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 m-0">4. Retention & Legal Compliance</h2>
            <p className="text-[14.5px] leading-relaxed text-gray-600 font-normal m-0">
              Certain operational data logs (such as submitted Tour Plans, sales orders, or approved DCR logs) cannot be immediately purged due to tax, accounting, and legal auditing mandates. These operational records will be securely anonymized, scrubbed of personal details, and archived strictly for company audit histories.
            </p>
          </article>

          <div className="border-t border-gray-100" />

          <article className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 m-0">5. Timeline</h2>
            <p className="text-[14.5px] leading-relaxed text-gray-600 font-normal m-0">
              Identity verification and deletion processing is completed within <strong>7 business days</strong> of submitting the request. Access to the platform is terminated immediately upon request approval.
            </p>

            <div className="pt-4 text-center">
              <a 
                href="/account-deletion" 
                className="inline-block px-8 py-3.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-2xl text-[14px] shadow-[0_4px_14px_rgba(239,68,68,0.2)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.3)] transition-all duration-200 cursor-pointer outline-none border-none no-underline"
              >
                Go to Account Deletion Request Form
              </a>
            </div>
          </article>

        </section>
      </main>

      {/* Global Landing Footer */}
      <Footer />
    </div>
  );
}

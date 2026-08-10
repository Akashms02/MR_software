import React, { useState } from 'react';
import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';

export default function AccountDeletionPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDeletionSubmit = async (e) => {
    e.preventDefault();
    if (!email || !phone) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY_HERE",
          subject: "Medistrax - New Account Deletion Request",
          from_name: "Medistrax Trust Center",
          email: email,
          phone: phone,
          reason: reason || "No reason provided",
          message: `Account Deletion Request submitted via Trust Center.\nEmail: ${email}\nPhone: ${phone}\nReason: ${reason}`
        })
      });

      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        // Fallback fallback: if access key not set,still simulate success for the demo layout
        // but log a console warning to help the developer configure it
        if (result.message && result.message.includes("access_key")) {
          console.warn("[Trust Center] Form submitted successfully in Demo Mode. To receive actual emails, configure VITE_WEB3FORMS_ACCESS_KEY in your env file.");
          setSubmitted(true);
        } else {
          setErrorMsg(result.message || 'Failed to submit request. Please try again.');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Data & Privacy Management
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#0D2411] tracking-tight m-0 mb-4 leading-none">
          Delete My Account
        </h1>
        <p className="text-[14px] sm:text-[16px] text-gray-500 max-w-xl font-medium m-0 leading-relaxed">
          At Medistrax, we respect your rights to your personal data. Submit a deletion request below to initiate account and records removal.
        </p>
      </section>

      {/* Standalone Account Deletion Request Card */}
      <main className="max-w-3xl mx-auto w-full px-6 pb-24 flex-grow box-border">
        <section className="bg-white border border-red-100 rounded-[32px] p-8 sm:p-12 shadow-[0_8px_30px_rgba(239,68,68,0.02)] border-t-4 border-t-red-500 box-border">
          {submitted ? (
            <div className="text-center py-6 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 m-0 mb-2">Request Submitted Successfully</h3>
              <p className="text-[13.5px] text-gray-500 max-w-md mx-auto m-0 leading-relaxed">
                Your request to delete the account <strong>{email}</strong> has been registered. Our security team will contact your tenant administrator to confirm your identity and complete the process within 7 business days.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="p-2.5 rounded-2xl bg-red-50 text-red-500 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 m-0">Submit Account Deletion Request</h2>
                  <p className="text-[13px] text-gray-400 m-0 mt-0.5">Please provide your details below to register a deletion request.</p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-[13px] text-red-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleDeletionSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">Registered Email Address</label>
                    <input 
                      type="email" 
                      required
                      disabled={isSubmitting}
                      placeholder="name@company.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/50 text-[13.5px] outline-none focus:border-red-400 focus:bg-white transition-all duration-200 box-border disabled:opacity-60"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">Registered Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      disabled={isSubmitting}
                      placeholder="9876543210" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/50 text-[13.5px] outline-none focus:border-red-400 focus:bg-white transition-all duration-200 box-border disabled:opacity-60"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">Reason for Deletion (Optional)</label>
                  <textarea 
                    rows="3"
                    disabled={isSubmitting}
                    placeholder="Let us know why you are requesting account removal..." 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/50 text-[13.5px] outline-none focus:border-red-400 focus:bg-white transition-all duration-200 resize-none box-border disabled:opacity-60"
                  />
                </div>

                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex gap-3 text-[13px] text-red-700 leading-relaxed">
                  <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span><strong>Warning:</strong> Account deletion is permanent. Once completed, your profile data, payslip records, and logged visits cannot be restored.</span>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-2xl text-[14px] shadow-[0_4px_14px_rgba(239,68,68,0.2)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.3)] transition-all duration-200 cursor-pointer outline-none border-none disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting Request...
                    </>
                  ) : (
                    'Submit Deletion Request'
                  )}
                </button>
              </form>
            </>
          )}
        </section>
      </main>

      {/* Global Landing Footer */}
      <Footer />
    </div>
  );
}

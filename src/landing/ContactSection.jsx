import { useState } from 'react'
import { motion } from 'framer-motion'
import axios from '../api/axiosInstance'
import { API_ROUTE } from '../data/env'

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    teamSize: '',
    preferredDate: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await axios.post(`${API_ROUTE}/demo/book`, formData)

      setSuccessMessage(response.data?.message || 'Demo request successfully submitted!')
      setSubmitted(true)
      // Reset success state after a delay
      setTimeout(() => {
        setSubmitted(false)
        setSuccessMessage('')
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          teamSize: '',
          preferredDate: ''
        })
      }, 5000)
    } catch (err) {
      console.error('Error submitting demo booking:', err)
      setSubmitError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="booking" className="py-24 bg-white overflow-hidden font-sans select-none border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">

          {/* Left Column: Headline and Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-[48%] space-y-6"
          >
            <h2
              className="text-[32px] sm:text-[40px] font-extrabold text-[#0D2411] tracking-tight leading-tight"
              style={{ fontFamily: '"Adelle Cyrillic", "Adelle", Georgia, Cambria, "Times New Roman", Times, serif' }}
            >
              Empower Your Medical Representatives Today
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#5C715E] font-medium leading-relaxed">
              See How Medistrax Helps Pharmaceutical Companies Streamline HR Operations, Track Medical Representatives In Real Time, And Boost Team Productivity—All From One Powerful Platform
            </p>
          </motion.div>

          {/* Right Column: Contact Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-[45%] flex justify-center"
          >
            <div className="w-full max-w-md bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_15px_45px_rgba(0,0,0,0.04)] border border-gray-100">
              <h3
                className="text-[20px] font-extrabold text-[#0D2411] text-center mb-6"
                style={{ fontFamily: '"Adelle Cyrillic", "Adelle", Georgia, Cambria, "Times New Roman", Times, serif' }}
              >
                Book a Demo
              </h3>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#E5F7E3] text-[#28823A] border border-[#28823A]/10 rounded-2xl p-6 text-center font-bold text-[15px]"
                >
                  {successMessage}
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <label className="block text-xs font-bold text-[#0D2411] uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/55 text-[#0D2411] text-[14px] font-medium placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-200 focus:ring-2 focus:ring-[#28823A]/10 focus:border-[#28823A]"
                    />
                  </div>

                  {/* Two column email & phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0D2411] uppercase tracking-wider mb-1.5">
                        Business Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/55 text-[#0D2411] text-[14px] font-medium placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-200 focus:ring-2 focus:ring-[#28823A]/10 focus:border-[#28823A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0D2411] uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength="10"
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit phone number"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/55 text-[#0D2411] text-[14px] font-medium placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-200 focus:ring-2 focus:ring-[#28823A]/10 focus:border-[#28823A]"
                      />
                    </div>
                  </div>

                  {/* Two column company name & preferred date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0D2411] uppercase tracking-wider mb-1.5">
                        Company Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Pharma Corp"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/55 text-[#0D2411] text-[14px] font-medium placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-200 focus:ring-2 focus:ring-[#28823A]/10 focus:border-[#28823A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0D2411] uppercase tracking-wider mb-1.5">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/55 text-[#0D2411] text-[14px] font-medium placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-200 focus:ring-2 focus:ring-[#28823A]/10 focus:border-[#28823A] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Team Size */}
                  <div>
                    <label className="block text-xs font-bold text-[#0D2411] uppercase tracking-wider mb-1.5">
                      Estimated Team Size
                    </label>
                    <select
                      required
                      value={formData.teamSize}
                      onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/55 text-[#0D2411] text-[14px] font-medium appearance-none focus:outline-none focus:bg-white transition-all duration-200 cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235C715E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px center',
                        backgroundSize: '16px'
                      }}
                    >
                      <option value="" disabled>Select team size</option>
                      <option value="1-10">1 - 10 Representatives</option>
                      <option value="11-50">11 - 50 Representatives</option>
                      <option value="51-200">51 - 200 Representatives</option>
                      <option value="201-500">201 - 500 Representatives</option>
                      <option value="500+">500+ Representatives</option>
                    </select>
                  </div>

                  {submitError && (
                    <div className="text-red-600 text-xs font-semibold bg-red-50 border border-red-200/50 rounded-xl p-3 text-center flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {submitError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#28823A] hover:bg-[#1f662c] text-white font-extrabold text-[15px] sm:text-[16px] rounded-xl shadow-[0_4px_15px_rgba(40,130,58,0.15)] transition duration-200 cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
                    style={{ fontFamily: '"Adelle Cyrillic", "Adelle", Georgia, Cambria, "Times New Roman", Times, serif' }}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Scheduling...
                      </>
                    ) : (
                      'Book a Demo'
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

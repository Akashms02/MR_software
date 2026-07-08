import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from '../api/axiosInstance'
import { API_ROUTE } from '../data/env'

export default function DemoModal({ isOpen, onClose }) {
  const autoCloseTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current)
      }
    }
  }, [])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    teamSize: '',
    preferredDate: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [submitError, setSubmitError] = useState(null)

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required'
    }
    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Please select your preferred date'
    }
    if (!formData.teamSize) {
      newErrors.teamSize = 'Please select your team size'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let val = value
    if (name === 'phone') {
      val = value.replace(/\D/g, '').slice(0, 10)
    }
    setFormData(prev => ({ ...prev, [name]: val }))
    // Clear validation error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await axios.post(`${API_ROUTE}/demo/book`, formData)

      setSuccessMessage(response.data?.message || 'Demo request successfully submitted!')
      setIsSuccess(true)
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        teamSize: '',
        preferredDate: ''
      })

      // Auto-close modal after 5 seconds
      autoCloseTimeoutRef.current = setTimeout(() => {
        handleClose()
      }, 5000)
    } catch (err) {
      console.error('Error submitting demo booking:', err)
      setSubmitError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current)
    }
    onClose()
    // Reset success state after transition ends
    setTimeout(() => {
      setIsSuccess(false)
      setSuccessMessage('')
    }, 300)
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: 'spring', duration: 0.5, bounce: 0.2 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 15,
      transition: { duration: 0.25 }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 select-none font-sans">
          
          {/* Backdrop Overlay */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-10"
          >

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 text-[#5C715E] hover:text-[#0D2411] bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors cursor-pointer z-20"
              aria-label="Close modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="p-8 sm:p-10">
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Icon and Title */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#E5F7E3] flex items-center justify-center text-[#28823A]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-extrabold text-[#0D2411]" style={{ fontFamily: '"Adelle Cyrillic", Georgia, serif' }}>
                          Book a Live Demo
                        </h3>
                        <p className="text-sm text-[#5C715E] font-medium mt-0.5">
                          See how GmaxepayHR empowers your pharma team.
                        </p>
                      </div>
                    </div>

                    {/* Booking Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name Field */}
                      <div>
                        <label className="block text-xs font-bold text-[#0D2411] uppercase tracking-wider mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-[#0D2411] text-[14px] font-medium placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-200 ${
                            errors.name ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-[#28823A]/10 focus:border-[#28823A]'
                          }`}
                        />
                        {errors.name && (
                          <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-red-500" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Two column email & phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#0D2411] uppercase tracking-wider mb-1.5">
                            Business Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@company.com"
                            className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-[#0D2411] text-[14px] font-medium placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-200 ${
                              errors.email ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-[#28823A]/10 focus:border-[#28823A]'
                            }`}
                          />
                          {errors.email && (
                            <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-red-500" />
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#0D2411] uppercase tracking-wider mb-1.5">
                            Phone Number
                          </label>
                          <input
                             type="tel"
                             name="phone"
                             value={formData.phone}
                             onChange={handleChange}
                             maxLength="10"
                             pattern="[0-9]{10}"
                             placeholder="9876543210"
                            className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-[#0D2411] text-[14px] font-medium placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-200 ${
                              errors.phone ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-[#28823A]/10 focus:border-[#28823A]'
                            }`}
                          />
                          {errors.phone && (
                            <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-red-500" />
                              {errors.phone}
                            </p>
                          )}
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
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Pharma Corp"
                            className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-[#0D2411] text-[14px] font-medium placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-200 ${
                              errors.company ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-[#28823A]/10 focus:border-[#28823A]'
                            }`}
                          />
                          {errors.company && (
                            <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-red-500" />
                              {errors.company}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#0D2411] uppercase tracking-wider mb-1.5">
                            Preferred Date
                          </label>
                          <input
                            type="date"
                            name="preferredDate"
                            value={formData.preferredDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-[#0D2411] text-[14px] font-medium placeholder-gray-400 focus:outline-none focus:bg-white transition-all duration-200 ${
                              errors.preferredDate ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-[#28823A]/10 focus:border-[#28823A]'
                            }`}
                          />
                          {errors.preferredDate && (
                            <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-red-500" />
                              {errors.preferredDate}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Team Size */}
                      <div>
                        <label className="block text-xs font-bold text-[#0D2411] uppercase tracking-wider mb-1.5">
                          Estimated Team Size
                        </label>
                        <select
                          name="teamSize"
                          value={formData.teamSize}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-[#0D2411] text-[14px] font-medium appearance-none focus:outline-none focus:bg-white transition-all duration-200 cursor-pointer ${
                            errors.teamSize ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:ring-2 focus:ring-[#28823A]/10 focus:border-[#28823A]'
                          }`}
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
                        {errors.teamSize && (
                          <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-red-500" />
                            {errors.teamSize}
                          </p>
                        )}
                      </div>

                      {submitError && (
                        <div className="text-red-600 text-xs font-semibold bg-red-50 border border-red-200/50 rounded-xl p-3 text-center flex items-center justify-center gap-1.5 mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          {submitError}
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#28823A] hover:bg-[#1f662c] text-white font-extrabold text-[15px] py-4 rounded-xl shadow-[0_4px_20px_rgba(40,130,58,0.2)] transition-all duration-200 transform hover:scale-[1.01] cursor-pointer mt-4 flex items-center justify-center gap-2 disabled:opacity-85 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
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
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="text-center py-6 flex flex-col items-center"
                  >
                    {/* Animated Checkmark Circle */}
                    <div className="w-20 h-20 bg-[#E5F7E3] rounded-full flex items-center justify-center text-[#28823A] mb-6 shadow-[0_8px_30px_rgba(40,130,58,0.15)]">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>

                    <h3 className="text-2xl font-extrabold text-[#0D2411] mb-3" style={{ fontFamily: '"Adelle Cyrillic", Georgia, serif' }}>
                      Demo Request Received!
                    </h3>
                    <p className="text-sm text-[#28823A] bg-[#E5F7E3] border border-[#28823A]/10 rounded-2xl p-4 font-bold max-w-sm mx-auto leading-relaxed mb-8">
                      {successMessage}
                    </p>

                    <button
                      onClick={handleClose}
                      className="bg-[#28823A] hover:bg-[#1f662c] text-white font-extrabold text-[14px] px-8 py-3 rounded-xl shadow-[0_4px_15px_rgba(40,130,58,0.15)] transition-all duration-200 cursor-pointer"
                    >
                      Done
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

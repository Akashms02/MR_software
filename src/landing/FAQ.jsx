import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const FAQ_ITEMS = [
  {
    question: 'Why Choose Us?',
    answer: 'We Deliver Simple, Efficient, Secure Solutions Backed By Expert Support. Our platform is built from the ground up for pharmaceutical field teams, ensuring complete compliance and high performance.'
  },
  {
    question: 'What is Medistrax?',
    answer: 'Medistrax is a comprehensive HRMS and Field Force Automation platform specifically designed for pharmaceutical teams. It helps manage attendance, doctor visits, live GPS tracking, expense claims, leaves, and analytics in one place.'
  },
  {
    question: 'How does the GPS tracking feature work?',
    answer: 'Medistrax uses secure, real-time GPS tracking to map field activities of your medical representatives. It logs check-in/check-out locations at doctor clinics and chemist shops to ensure transparency and optimized routing.'
  },
  {
    question: 'Can employees manage leaves and view reports on mobile?',
    answer: 'Yes, Medistrax provides a fully responsive mobile self-service portal. Employees can easily apply for leaves, track approval status, submit daily call reports (DCR), and view performance metrics directly from their smartphones.'
  },
  {
    question: 'Is Medistrax compliant with pharmaceutical industry regulations?',
    answer: 'Absolutely. Medistrax includes built-in compliance tracking for statutory requirements (like PF, ESI, TDS) and structures reporting templates in accordance with standard pharmaceutical DCR and field audit guidelines.'
  }
]

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null)

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-24 bg-white overflow-hidden font-sans select-none">
      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2
            className="text-[32px] sm:text-[40px] font-extrabold text-[#0D2411] tracking-tight leading-tight"
            style={{ fontFamily: '"Adelle Cyrillic", "Adelle", Georgia, Cambria, "Times New Roman", Times, serif' }}
          >
            Frequently Asked Question
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[#5C715E] font-medium max-w-2xl mx-auto leading-relaxed">
            Find Quick Answers To The Most Common Questions About Medistrax And Discover How It Helps Streamline HR And Field Force Management For Pharmaceutical Teams
          </p>
        </div>

        {/* FAQ Wrapper Accordion Box */}
        <div className="bg-[#F8F9F8] rounded-[32px] border border-gray-100/60 p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
          <div className="divide-y divide-gray-200/60">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = activeIndex === idx

              return (
                <div key={idx} className="py-6 first:pt-0 last:pb-0">
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full flex items-center justify-between text-left focus:outline-none group cursor-pointer"
                  >
                    <div className="space-y-2 pr-6">
                      <span
                        className="text-[17px] sm:text-[19px] font-extrabold text-[#0D2411] transition-colors duration-150 group-hover:text-green-700"
                        style={{ fontFamily: '"Adelle Cyrillic", "Adelle", Georgia, Cambria, "Times New Roman", Times, serif' }}
                      >
                        {item.question}
                      </span>
                      {/* Short answer preview / teaser when closed, expands to full on open */}
                      {!isOpen && (
                        <p className="text-[14px] sm:text-[15px] text-[#5C715E] font-medium leading-relaxed">
                          We Deliver Simple, Efficient, Secure Solutions Backed By Expert Support
                        </p>
                      )}
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-400 group-hover:text-green-700 flex-shrink-0"
                    >
                      <ChevronDown size={20} className="stroke-[2.5]" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 text-[14px] sm:text-[15px] text-[#5C715E] leading-relaxed font-normal">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  {
    id: 'onboarding',
    name: 'Onboarding Request',
    image: '/landing/onboarding request.svg',
    description: 'Simplify Onboarding With A Centralized System To Manage Doctors, Chemists, And Pharmacies Review Requests, Approve Applications, And Maintain Accurate Records Effortlessly'
  },
  {
    id: 'dcr',
    name: 'DCR Reports',
    image: '/landing/DCR Reports.svg',
    description: 'Simplify DCR Reports With A Centralized System To Manage Doctors, Chemists, And Pharmacies Review Requests, Approve Applications, And Maintain Accurate Records Effortlessly'
  },
  {
    id: 'leave',
    name: 'Leave Management',
    image: '/landing/leave mangement.svg',
    description: 'Simplify Leave Management With A Centralized System To Manage Doctors, Chemists, And Pharmacies Review Requests, Approve Applications, And Maintain Accurate Records Effortlessly'
  },
  {
    id: 'distributor',
    name: 'Distributor Sales',
    image: '/landing/Distributor sales.svg',
    description: 'Simplify Distributor Sales With A Centralized System To Manage Doctors, Chemists, And Pharmacies Review Requests, Approve Applications, And Maintain Accurate Records Effortlessly'
  },
  {
    id: 'attendance',
    name: 'Field Attendance',
    image: '/landing/field Attendance.svg',
    description: 'Simplify Field Attendance With A Centralized System To Manage Doctors, Chemists, And Pharmacies Review Requests, Approve Applications, And Maintain Accurate Records Effortlessly'
  },
  {
    id: 'tour',
    name: 'Tour Plan',
    image: '/landing/tour plan.svg',
    description: 'Simplify Tour Plan With A Centralized System To Manage Doctors, Chemists, And Pharmacies Review Requests, Approve Applications, And Maintain Accurate Records Effortlessly'
  }
]

export default function DemoPreview() {
  const [activeTabId, setActiveTabId] = useState('onboarding')

  const currentTab = TABS.find((t) => t.id === activeTabId)

  return (
    <section id="demo" className="py-24 bg-white overflow-hidden font-sans select-none">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center">

        {/* Live Demo Preview Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#28823A] text-white text-[13px] sm:text-[14px] font-bold px-5 py-2 rounded-full shadow-[0_4px_15px_rgba(40,130,58,0.15)] flex items-center gap-2.5 mb-6"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          Live Demo Preview
        </motion.div>

        {/* Title & Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2
            className="text-[32px] sm:text-[40px] font-extrabold text-[#0D2411] tracking-tight leading-tight"
            style={{ fontFamily: '"Adelle Cyrillic", "Adelle", Georgia, Cambria, "Times New Roman", Times, serif' }}
          >
            Powerful Web Portal
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[#5C715E] font-medium max-w-2xl mx-auto leading-relaxed">
            A Centralized Dashboard For Teams, Managers, And Administrators To Manage Employees, Monitor Field Activities, And Make Data-Driven Decisions With Ease
          </p>
        </motion.div>

        {/* Custom Tabs Capsule */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full max-w-[1140px] bg-white border border-gray-200/80 rounded-full py-2.5 px-6 shadow-[0_6px_25px_rgba(0,0,0,0.02)] flex flex-row flex-nowrap overflow-x-auto no-scrollbar justify-start lg:justify-center items-center gap-2 md:gap-3.5 mb-16 scroll-smooth"
        >
          {TABS.map((t) => {
            const isActive = t.id === activeTabId
            return (
              <button
                key={t.id}
                onClick={() => setActiveTabId(t.id)}
                className={`py-3 px-5 sm:px-7 rounded-full font-extrabold text-[13px] sm:text-[14px] lg:text-[15px] transition-all duration-200 cursor-pointer text-center whitespace-nowrap ${isActive
                    ? 'bg-[#28823A] text-white shadow-[0_4px_15px_rgba(40,130,58,0.2)]'
                    : 'text-[#0D2411] hover:text-[#28823A] bg-transparent'
                  }`}
              >
                {t.name}
              </button>
            )
          })}
        </motion.div>

        {/* Main Mockup Screen and Description Container */}
        <div className="w-full max-w-5xl flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTabId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full flex flex-col items-center"
            >
              {/* Image Showcase */}
              <div className="w-full rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 bg-[#E8F1EA]/10 p-2 md:p-3">
                <img
                  src={currentTab.image}
                  alt={currentTab.name}
                  className="w-full h-auto select-none pointer-events-none rounded-xl"
                />
              </div>

              {/* Text Description */}
              {/* <p className="mt-12 text-center text-[#0D2411] font-bold text-[16px] sm:text-[18px] max-w-4xl leading-relaxed px-4">
                {currentTab.description}
              </p> */}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  )
}

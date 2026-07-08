import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function HeroSection({ onBookDemoClick }) {
  const navigate = useNavigate()

  // Animation configurations
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVars = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  }

  return (
    <section id="home" className="relative min-h-screen bg-[#E5F7E3] overflow-hidden pt-36 pb-24 font-sans select-none">

      {/* Soft Grid Background & Radial Highlight */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.75) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.75) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(229,247,227,0.4)_100%)] pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-white/45 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Center Copywriting & CTAs */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center mb-16">
        <div className="space-y-6">
          <h1
            className="text-[22px] sm:text-[24px] md:text-[28px] lg:text-[32px] font-extrabold text-[#0D2411] tracking-tight leading-tight max-w-7xl mx-auto lg:whitespace-nowrap text-center"
            style={{ fontFamily: '"Adelle Cyrillic", "Adelle", Georgia, Cambria, "Times New Roman", Times, serif' }}
          >
            The Complete HRMS & Field Force Automation Platform for Pharmaceutical Teams
          </h1>

          <p
            className="text-[14px] sm:text-[15px] md:text-[16px] text-[#5C715E] font-medium max-w-3xl mx-auto leading-relaxed text-center"
          >
            Everything Your Medical Representatives Need–Attendance, Doctor Visits, GPS Tracking, Leave, And Analytics–All In One Platform
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-[#28823A] hover:bg-[#1f662c] text-white font-extrabold text-[15px] sm:text-[16px] px-10 py-3.5 rounded-xl shadow-[0_4px_20px_rgba(40,130,58,0.25)] transition duration-200 transform hover:scale-[1.02] cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={onBookDemoClick}
              className="bg-white hover:bg-[#28823A]/5 text-[#28823A] border-[1.5px] border-[#28823A]/30 font-extrabold text-[15px] sm:text-[16px] px-10 py-3.5 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition duration-200 transform hover:scale-[1.02] cursor-pointer"
            >
              Book A Demo
            </button>
          </div>
        </div>
      </div>

      {/* Screen Mockups Showcase */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 pb-12 flex flex-col lg:flex-row items-center lg:items-end justify-center gap-8 lg:gap-6 xl:gap-8 min-h-[580px]">

        {/* LEFT MOBILE MOCKUP: Leaves App */}
        <motion.div
          initial={{ opacity: 0, x: -60, rotate: 0 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          whileHover={{ scale: 1.03, zIndex: 30 }}
          className="w-full max-w-[230px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] rounded-[30px] overflow-hidden hidden lg:block transition-all duration-300 flex-shrink-0"
        >
          <img
            src="/landing/mobile L.svg"
            alt="Leaves Mobile View"
            className="w-full h-auto select-none pointer-events-none"
          />
        </motion.div>

        {/* CENTER DESKTOP MOCKUP: Main HRMS Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 w-full max-w-[920px] shadow-[0_30px_70px_rgba(0,0,0,0.18)] overflow-hidden flex-shrink-0"
        >
          <img
            src="/landing/Desktop.svg"
            alt="HRMS Desktop View"
            className="w-full h-auto select-none pointer-events-none rounded-1xl"
          />
        </motion.div>

        {/* RIGHT MOBILE MOCKUP: Field Attendance Map */}
        <motion.div
          initial={{ opacity: 0, x: 60, rotate: 0 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          whileHover={{ scale: 1.03, zIndex: 30 }}
          className="w-full max-w-[230px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] rounded-[30px] overflow-hidden hidden lg:block transition-all duration-300 flex-shrink-0"
        >
          <img
            src="/landing/mobile R.svg"
            alt="Map Mobile View"
            className="w-full h-auto select-none pointer-events-none"
          />
        </motion.div>
      </div>

    </section>
  )
}

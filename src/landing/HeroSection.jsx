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
    <section id="home" className="relative min-h-screen bg-[#E5F7E3] overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24 font-sans select-none">

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
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center mb-6 lg:mb-8">
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
              onClick={() => {
                const el = document.getElementById('booking')
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="bg-white hover:bg-[#28823A]/5 text-[#28823A] border-[1.5px] border-[#28823A]/30 font-extrabold text-[15px] sm:text-[16px] px-10 py-3.5 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition duration-200 transform hover:scale-[1.02] cursor-pointer"
            >
              Book A Demo
            </button>
          </div>
        </div>
      </div>

      {/* Screen Mockups Showcase (Desktop version) */}
      <div className="relative z-10 max-w-[1440px] w-full mx-auto px-4 hidden lg:flex flex-row items-end justify-center gap-8 lg:gap-6 xl:gap-8 overflow-visible min-h-[460px] lg:min-h-[500px]">

        {/* LEFT MOBILE MOCKUP: Leaves App */}
        <motion.div className="w-full max-w-[230px] flex-shrink-0 z-10 -translate-y-12 lg:-translate-y-16 xl:-translate-y-24">
          <motion.div
            initial={{ opacity: 0, x: -60, rotate: 0 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ scale: 1.03, zIndex: 30 }}
            className="w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] rounded-[30px] overflow-hidden transition-all duration-300 cursor-pointer"
          >
            <img
              src="/landing/mobile L.svg"
              alt="Leaves Mobile View"
              className="w-full h-auto select-none pointer-events-none"
            />
          </motion.div>
        </motion.div>

        {/* CENTER DESKTOP MOCKUP: Main HRMS Dashboard */}
        <motion.div className="relative z-20 w-full max-w-[920px] flex-shrink-0 -translate-y-8 xl:-translate-y-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full shadow-[0_30px_70px_rgba(0,0,0,0.18)] overflow-hidden rounded-2xl"
          >
            <img
              src="/landing/Desktop.svg"
              alt="HRMS Desktop View"
              className="w-full h-auto select-none pointer-events-none"
            />
          </motion.div>
        </motion.div>

        {/* RIGHT MOBILE MOCKUP: Field Attendance Map */}
        <motion.div className="w-full max-w-[230px] flex-shrink-0 z-10 -translate-y-12 lg:-translate-y-16 xl:-translate-y-24">
          <motion.div
            initial={{ opacity: 0, x: 60, rotate: 0 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ scale: 1.03, zIndex: 30 }}
            className="w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] rounded-[30px] overflow-hidden transition-all duration-300 cursor-pointer"
          >
            <img
              src="/landing/mobile R.svg"
              alt="Map Mobile View"
              className="w-full h-auto select-none pointer-events-none"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Screen Mockups Showcase (Mobile & Tablet version) */}
      <div className="relative z-10 w-full max-w-[540px] sm:max-w-[640px] mx-auto px-4 pb-0 pt-4 flex flex-col items-center justify-center lg:hidden overflow-visible">
        
        {/* CENTER DESKTOP MOCKUP (Mobile) */}
        <motion.div className="relative z-20 w-full max-w-[380px] xs:max-w-[440px] sm:max-w-[540px] flex-shrink-0 pb-0 translate-y-12 xs:translate-y-16 sm:translate-y-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full shadow-[0_25px_60px_rgba(0,0,0,0.18)] rounded-xl overflow-hidden"
          >
            <img
              src="/landing/Desktop.svg"
              alt="HRMS Desktop View"
              className="w-full h-auto select-none pointer-events-none"
            />
          </motion.div>
        </motion.div>
      </div>

    </section>
  )
}

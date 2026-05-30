import { motion } from 'framer-motion'

export default function HeroSection() {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  }

  const floatingVars = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
    }
  }

  return (
    <section className="pt-20 bg-white relative overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(200,240,74,0.15)_0%,transparent_60%)] rounded-full blur-[60px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(167,216,0,0.1)_0%,transparent_60%)] rounded-full blur-[60px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10 pt-16 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <motion.div variants={containerVars} initial="hidden" animate="show" className="flex flex-col items-start">
            <motion.div variants={itemVars} className="text-[12px] font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-[20px] uppercase tracking-[1px] mb-6 inline-flex">
              🌿 Built for Pharma Industry
            </motion.div>
            
            <motion.h1 variants={itemVars} className="text-[44px] md:text-[54px] lg:text-[64px] font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Intelligent HR for <br />
              <span className="bg-gradient-to-r from-green-600 to-[#16A34A] bg-clip-text text-transparent">Pharma Giants.</span>
            </motion.h1>

            <motion.p variants={itemVars} className="text-[18px] text-gray-500 leading-relaxed max-w-[520px] mb-10 font-medium">
              Replace 10+ siloed tools with one complete platform. Automate payroll, ensure 100% compliance, and manage field forces seamlessly.
            </motion.p>

            <motion.div variants={itemVars} className="flex gap-4 flex-wrap">
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="btn-lime text-[16px] py-3.5 px-8 rounded-xl shadow-[0_8px_24px_rgba(200,240,74,0.4)]"
              >
                Get a Demo
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: '#f8fafc' }} whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 py-3.5 px-8 bg-white text-gray-955 font-bold text-[16px] rounded-xl border-[1.5px] border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                onClick={() => scrollTo('features')}
              >
                Explore Features →
              </motion.button>
            </motion.div>

            <motion.div variants={itemVars} className="flex items-center gap-6 mt-16 flex-wrap pt-6 border-t border-gray-150 w-full">
              {[
                'SOC 2 Certified', 'GDPR Compliant', 'MeitY Empaneled'
              ].map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span className="text-[14px] text-gray-400 font-bold">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Abstract Floating Cards */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }}
            className="relative h-full min-h-[400px] flex items-center justify-center"
          >
            {/* Main Central Card */}
            <motion.div 
              variants={floatingVars} initial="initial" animate="animate"
              className="bg-white/90 backdrop-blur-md border border-gray-150 rounded-3xl p-8 shadow-2xl w-full max-w-[380px] relative z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#C8F04A] flex items-center justify-center text-[20px]">
                    📈
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-gray-900">Compliance Status</div>
                    <div className="text-[12px] text-gray-400">Real-time sync</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[12px] font-extrabold">
                  100% Filed
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-green-500 to-[#16A34A]" 
                />
              </div>
            </motion.div>

            {/* Floating Card 1 */}
            <motion.div 
              animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[10%] right-[-5%] z-20 bg-white border border-gray-150 rounded-2xl p-4 px-5 shadow-lg flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-[16px]">💰</div>
              <div>
                <div className="text-[12px] text-gray-400 font-bold">Payroll Processed</div>
                <div className="text-[15px] text-gray-950 font-extrabold">₹55,000</div>
              </div>
            </motion.div>

            {/* Floating Card 2 */}
            <motion.div 
              animate={{ y: [-15, 15, -15] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-[15%] left-[-5%] z-0 bg-white border border-gray-150 rounded-2xl p-4 px-5 shadow-lg flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-[16px]">👥</div>
              <div>
                <div className="text-[12px] text-gray-400 font-bold">Active Employees</div>
                <div className="text-[15px] text-gray-955 font-extrabold">1,250+</div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  )
}

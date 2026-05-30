import { motion } from 'framer-motion'

const FEATURES = [
  { icon: '🏢', title: 'All-in-One Platform',    desc: 'Unified HRMS covering payroll, attendance, compliance, recruitment, and performance — zero integration headaches.' },
  { icon: '⚙️', title: 'Automated Operations',   desc: 'Auto-calculate payroll, generate payslips, file statutory returns, and send alerts without manual intervention.' },
  { icon: '🗂️', title: 'Centralized Records',    desc: 'Secure, cloud-based employee data vault with version history, document storage, and audit trails.' },
  { icon: '⚖️', title: 'Built-In Compliance',    desc: 'PF, ESI, TDS, PT, LWF — auto-calculated and e-filed. Stay 100% compliant with every statutory update.' },
  { icon: '📱', title: 'Mobile Self-Service',    desc: 'Employees punch attendance, apply leaves, view payslips, and raise requests from any device, anytime.' },
  { icon: '⚡', title: '80% Faster HR',          desc: 'Reduce HR processing time by 80% through intelligent automation, bulk actions, and smart workflows.' },
]

export default function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
  }

  return (
    <section id="features" className="py-20 bg-slate-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
          className="mb-14 text-center flex flex-col items-center"
        >
          <div className="text-[12px] font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-[20px] uppercase tracking-[1px] mb-3">
            ✨ Core Capabilities
          </div>
          <h2 className="text-[32px] md:text-[38px] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            Everything your Pharma HR needs
          </h2>
          <p className="text-[15px] text-gray-500 max-w-xl leading-relaxed">
            One platform that replaces 10+ siloed tools. Built specifically for pharma industry workflows.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              variants={cardVariants}
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.05)] cursor-pointer"
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="text-[32px] mb-4">{f.icon}</div>
              <h3 className="text-[18px] font-extrabold text-gray-950 mb-2">
                {f.title}
              </h3>
              <p className="text-[14px] text-gray-500 leading-[1.65]">{f.desc}</p>
              <div className="mt-3.5 text-[13px] text-green-600 font-bold hover:text-green-700 transition-colors">
                Learn more →
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

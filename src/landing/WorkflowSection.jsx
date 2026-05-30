import { motion } from 'framer-motion'

const STEPS = [
  { icon: '🤝', label: 'Hiring &\nOnboarding' },
  { icon: '👤', label: 'Employee\nData' },
  { icon: '💰', label: 'Payroll' },
  { icon: '⚖️', label: 'Statutory\nCompliance' },
  { icon: '📁', label: 'Asset &\nDoc Vault' },
  { icon: '📚', label: 'Training\n& Dev' },
  { icon: '🎯', label: 'Performance\nMgmt' },
  { icon: '🔄', label: 'Separation\n& Rehire' },
]

export default function WorkflowSection() {
  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  }

  const nodeVars = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.5 } }
  }

  const lineVars = {
    hidden: { width: 0, opacity: 0 },
    visible: { width: '100%', opacity: 1, transition: { duration: 0.5, ease: 'easeInOut' } }
  }

  return (
    <section id="workflow" className="py-20 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
          className="mb-10 text-center flex flex-col items-center"
        >
          <div className="text-[12px] font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-[20px] uppercase tracking-[1px] mb-3">
            🔄 Hire-to-Rehire Workflow
          </div>
          <h2 className="text-[32px] md:text-[38px] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            The Complete Employee Lifecycle
          </h2>
          <p className="text-[15px] text-gray-500 max-w-xl leading-relaxed">
            From first offer letter to full-circle rehire — manage every touchpoint in one connected flow.
          </p>
        </motion.div>

        {/* Workflow strip */}
        <div className="overflow-x-auto pb-6 scrollbar-thin">
          <motion.div 
            variants={containerVars} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            className="flex items-start min-w-[800px] justify-between px-4 py-2"
          >
            {STEPS.map((step, i) => (
              <div key={i} className="flex-1 flex items-center relative">
                {/* Node */}
                <motion.div variants={nodeVars} className="flex flex-col items-center relative z-10 mx-auto">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full bg-slate-50 border-2 border-slate-100 shadow-sm flex items-center justify-center text-[28px]">
                      {step.icon}
                    </div>
                    {/* Step number */}
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#C8F04A] text-gray-900 text-[12px] font-extrabold flex items-center justify-center shadow-md border-2 border-white">
                      {i + 1}
                    </div>
                  </motion.div>
                  <div className="text-[11px] font-bold text-gray-500 text-center leading-normal whitespace-pre-line max-w-[80px] mt-2.5">
                    {step.label}
                  </div>
                </motion.div>

                {/* Connector */}
                {i < STEPS.length - 1 && (
                  <div className="absolute top-8 left-[60%] right-[-40%] h-0.5 z-0 flex items-center">
                    <motion.div variants={lineVars} className="h-full bg-slate-200" />
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

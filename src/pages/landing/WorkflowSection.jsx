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
    <section id="workflow" className="section-spacing" style={{ background: '#fff', overflow: 'hidden' }}>
      <div className="section-container">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
          style={{ marginBottom: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <div className="section-label">🔄 Hire-to-Rehire Workflow</div>
          <h2 className="section-title">The Complete Employee Lifecycle</h2>
          <p className="section-sub">
            From first offer letter to full-circle rehire — manage every touchpoint in one connected flow.
          </p>
        </motion.div>

        {/* Workflow strip */}
        <div style={{ overflowX: 'auto', paddingBottom: '24px', paddingTop: '16px', marginTop: '-16px' }}>
          <motion.div 
            variants={containerVars} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: '0', minWidth: '700px' }}
          >
            {STEPS.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {/* Node */}
                <motion.div variants={nodeVars} className="workflow-node" style={{ flex: 'none', width: '80px' }}>
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} style={{ position: 'relative' }}>
                    <div className="workflow-circle">
                      {step.icon}
                    </div>
                    {/* Step number */}
                    <div style={{
                      position: 'absolute', top: '-8px', right: '-8px',
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: 'var(--lime-dark)', color: '#1A1A1A',
                      fontSize: '12px', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      border: '2px solid #fff',
                    }}>{i + 1}</div>
                  </motion.div>
                  <div style={{
                    fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)',
                    textAlign: 'center', lineHeight: 1.4, whiteSpace: 'pre-line', maxWidth: '70px',
                    marginTop: '8px'
                  }}>{step.label}</div>
                </motion.div>

                {/* Connector */}
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: '2px', marginBottom: '34px', position: 'relative' }}>
                     <motion.div variants={lineVars} style={{ 
                        position: 'absolute', top: 0, left: 0, height: '100%', 
                        borderTop: '2px dashed var(--lime)', opacity: 0.5 
                     }} />
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

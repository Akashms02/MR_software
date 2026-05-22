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
    <section id="features" className="section-spacing" style={{ background: 'var(--bg-section)', overflow: 'hidden' }}>
      <div className="section-container">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
          style={{ marginBottom: '56px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <div className="section-label">✨ Core Capabilities</div>
          <h2 className="section-title">Everything your Pharma HR needs</h2>
          <p className="section-sub">
            One platform that replaces 10+ siloed tools. Built specifically for pharma industry workflows.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}
        >
          {FEATURES.map((f, i) => (
            <motion.div variants={cardVariants} key={i} className="feature-card" whileHover={{ y: -8, transition: { duration: 0.2 } }}>
              <div className="feature-icon">{f.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65 }}>{f.desc}</p>
              <div style={{ marginTop: '14px', fontSize: '13px', color: 'var(--lime-dark)', fontWeight: 700, cursor: 'pointer' }}>
                Learn more →
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

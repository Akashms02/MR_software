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
    <section style={{ paddingTop: '60px', background: '#fff', position: 'relative', overflow: 'hidden' }}>
      
      {/* Dynamic Background */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '60vw', height: '60vw',
        background: 'radial-gradient(circle, rgba(200, 240, 74, 0.15) 0%, transparent 60%)',
        borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', bottom: '0', right: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(167, 216, 0, 0.1) 0%, transparent 60%)',
        borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0
      }} />

      <div className="section-container" style={{ position: 'relative', zIndex: 1, padding: '60px 40px 120px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '80px', alignItems: 'center'
        }}>
          
          {/* Left Content */}
          <motion.div variants={containerVars} initial="hidden" animate="show">
            <motion.div variants={itemVars} className="section-label" style={{ marginBottom: '24px', display: 'inline-flex' }}>
              🌿 Built for Pharma Industry
            </motion.div>
            
            <motion.h1 variants={itemVars} style={{
              fontSize: 'clamp(44px, 5vw, 64px)', fontWeight: 900,
              color: 'var(--text-primary)', letterSpacing: '-1.5px', lineHeight: 1.1,
              marginBottom: '24px',
            }}>
              Intelligent HR for <br />
              <span style={{ 
                color: 'var(--lime-dark)', 
                background: 'linear-gradient(to right, var(--lime-dark), #16A34A)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>Pharma Giants.</span>
            </motion.h1>

            <motion.p variants={itemVars} style={{
              fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7,
              maxWidth: '520px', marginBottom: '40px', fontWeight: 500
            }}>
              Replace 10+ siloed tools with one complete platform. Automate payroll, ensure 100% compliance, and manage field forces seamlessly.
            </motion.p>

            <motion.div variants={itemVars} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(200, 240, 74, 0.4)' }}>
                Get a Demo
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: 'var(--bg-section)' }} whileTap={{ scale: 0.95 }}
                className="btn-outline" style={{ fontSize: '16px', padding: '14px 32px', borderRadius: '12px' }}
                onClick={() => scrollTo('features')}>
                Explore Features →
              </motion.button>
            </motion.div>

            <motion.div variants={itemVars} style={{
              display: 'flex', alignItems: 'center', gap: '24px', marginTop: '64px', flexWrap: 'wrap',
              paddingTop: '24px', borderTop: '1px solid var(--border)'
            }}>
              {[
                'SOC 2 Certified', 'GDPR Compliant', 'MeitY Empaneled'
              ].map((label, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--lime-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Abstract Floating Cards */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }}
            style={{ position: 'relative', height: '100%', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* Main Central Card */}
            <motion.div 
              variants={floatingVars} initial="initial" animate="animate"
              style={{
                background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)',
                border: '1px solid var(--border)', borderRadius: '24px',
                padding: '32px', boxShadow: '0 24px 64px rgba(0,0,0,0.08)',
                width: '100%', maxWidth: '380px', position: 'relative', zIndex: 2
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    📈
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Compliance Status</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Real-time sync</div>
                  </div>
                </div>
                <div style={{ padding: '6px 12px', background: 'var(--green-light)', color: 'var(--lime-dark)', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                  100% Filed
                </div>
              </div>
              <div style={{ height: '8px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, var(--lime), var(--lime-dark))' }} 
                />
              </div>
            </motion.div>

            {/* Floating Card 1 */}
            <motion.div 
              animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: '10%', right: '-5%', zIndex: 3,
                background: '#fff', border: '1px solid var(--border)', borderRadius: '16px',
                padding: '16px 20px', boxShadow: '0 12px 32px rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💰</div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Payroll Processed</div>
                <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 800 }}>₹55,000</div>
              </div>
            </motion.div>

            {/* Floating Card 2 */}
            <motion.div 
              animate={{ y: [-15, 15, -15] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', bottom: '15%', left: '-10%', zIndex: 1,
                background: '#fff', border: '1px solid var(--border)', borderRadius: '16px',
                padding: '16px 20px', boxShadow: '0 12px 32px rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👥</div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Active Employees</div>
                <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 800 }}>1,250+</div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  )
}

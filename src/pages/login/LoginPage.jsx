import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../../redux/actions/authActions'

const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"/>
  </svg>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error: authError, user, requiresPasswordChange } = useSelector((state) => state.auth)

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [localError, setLocalError] = useState('')

  const error = localError || authError;

  useEffect(() => {
    if (user) {
      if (requiresPasswordChange) { 
        navigate('/create-password', { replace: true }); 
        return; 
      }
      const roleStr = (user.role || '').toUpperCase().trim();
      if (roleStr === 'SUPER_ADMIN' || roleStr === 'SUPERADMIN' || roleStr === 'SUPER ADMIN') {
        navigate('/superadmin/dashboard', { replace: true });
      } else if (roleStr === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    }
  }, [user, requiresPasswordChange, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!email.trim())    { setLocalError('Please enter your email.'); return }
    if (!password.trim()) { setLocalError('Please enter your password.'); return }

    const result = await dispatch(login({ email: email.trim(), password }));
    if (result === 'CHANGE_PASSWORD_REQUIRED') {
      navigate('/create-password', {
        state: { mode: 'FIRST_LOGIN', email: email.trim(), tempPassword: password },
      });
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
      background: '#F8FAFC', // Crisp light background
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── DYNAMIC BACKGROUND ─────────────────────────────────────── */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '70vw', height: '70vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200, 240, 74, 0.4) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }} 
      />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '60vw', height: '60vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167, 216, 0, 0.2) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }} 
      />

      {/* ── MAIN CONTENT GRID ────────────────────────────────────── */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '60px',
        padding: '40px',
        position: 'relative',
        zIndex: 10,
        alignItems: 'center',
      }}>
        
        {/* Left Side: Brand & Messaging */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
          <motion.div 
            variants={itemVariants} 
            style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--lime) 0%, var(--lime-dark) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(200, 240, 74, 0.25)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#0F172A" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M12 2v20M3 7l9 5 9-5" stroke="#0F172A" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '28px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                GmaxepayHR
              </div>
              <div style={{ fontSize: '11px', color: 'var(--lime-dark)', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>
                Pharma HRMS
              </div>
            </div>
          </motion.div>

          <motion.h1 variants={itemVariants} style={{
            fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 900, color: 'var(--text-primary)',
            letterSpacing: '-1.5px', lineHeight: 1.1,
          }}>
            Enter the future of <span style={{ color: 'var(--lime-dark)' }}>Pharma HR.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} style={{
            fontSize: '18px', color: 'var(--text-secondary)',
            lineHeight: 1.6, maxWidth: '420px', fontWeight: 500
          }}>
            Secure, compliant, and lightning-fast. Access your workspace and manage operations from anywhere.
          </motion.p>
          
          <motion.div variants={itemVariants} style={{
             marginTop: '20px', padding: '16px 20px',
             background: '#fff', border: '1px solid var(--border)',
             borderRadius: '12px', display: 'inline-block', alignSelf: 'flex-start',
             boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>SYSTEM STATUS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--lime-dark)', boxShadow: '0 0 10px var(--lime)' }} />
              <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>All services operational</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side: Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotateY: -10 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          style={{ perspective: '1000px' }}
        >
          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: '48px 40px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.08)',
            maxWidth: '440px',
            margin: '0 auto',
            width: '100%',
          }}>
            
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Welcome back
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Please enter your credentials to continue.
              </p>
            </div>

            <form onSubmit={handleLogin} noValidate>
              
              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setLocalError('') }}
                  placeholder="you@gmaxepayhr.in"
                  autoComplete="email"
                  style={{
                    width: '100%', padding: '14px 16px',
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                    borderRadius: '12px', fontSize: '15px',
                    color: 'var(--text-primary)', outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    fontWeight: 500,
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--lime-dark)'; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = '#f8fafc'; }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setLocalError('') }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{
                      width: '100%', padding: '14px 48px 14px 16px',
                      background: '#f8fafc',
                      border: '1px solid var(--border)',
                      borderRadius: '12px', fontSize: '15px',
                      color: 'var(--text-primary)', outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      fontWeight: 500,
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--lime-dark)'; e.target.style.background = '#fff'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = '#f8fafc'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex',
                      padding: '4px', transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {showPw ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div style={{ textAlign: 'right', marginBottom: '28px' }}>
                <a href="#" style={{
                  fontSize: '13px', color: 'var(--lime-dark)',
                  textDecoration: 'none', fontWeight: 700,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Forgot password?
                </a>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      padding: '12px 16px', borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                      fontSize: '13px', color: '#dc2626', lineHeight: 1.5,
                      display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500
                    }}>
                      <span>⚠️</span> {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="login-btn"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px',
                  background: loading ? 'rgba(200, 240, 74, 0.5)' : 'var(--lime)',
                  color: '#0F172A', fontWeight: 800, fontSize: '15px',
                  border: 'none', borderRadius: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 8px 20px rgba(200, 240, 74, 0.2)'
                }}
              >
                {loading ? (
                  <>
                    <SpinnerIcon /> Authenticating...
                  </>
                ) : (
                  'Sign In to Dashboard'
                )}
              </motion.button>
            </form>

              {/* Demo Credentials Hint */}
            <div style={{
              marginTop: '36px', paddingTop: '24px',
              borderTop: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                One-Click Demo Access
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { email: 'superadmin@mrmedical.com', password: 'SuperAdmin@123', role: 'Super Admin' },
                  { email: 'admin.one@mrmedical.com', password: 'Password@123', role: 'Admin' },
                  { email: 'employee@mrmedical.com', password: 'password123', role: 'Employee' }
                ].map((c, i) => (
                  <motion.div 
                    whileHover={{ x: 4, background: 'var(--bg-section)' }}
                    key={i} 
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 12px', borderRadius: '8px',
                      cursor: 'pointer', transition: 'background 0.2s'
                    }}
                    onClick={() => { setEmail(c.email); setPassword(c.password); setLocalError('') }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: c.role.includes('Admin') ? '#F43F5E' : 'var(--lime-dark)'
                      }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{c.role}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>Click to fill</span>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      <style>{`
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
          -webkit-text-fill-color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  )
}

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 1s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke="rgba(15, 23, 42, 0.2)" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0110 10" stroke="#0F172A" strokeWidth="3" strokeLinecap="round"/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  )
}

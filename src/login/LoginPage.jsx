import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearErrors } from '../redux/actions/authActions'
import { useToast } from '../context/ToastContext'

const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" />
  </svg>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { showToast } = useToast()
  const { loading, error: authError, user, requiresPasswordChange } = useSelector((state) => state.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [localError, setLocalError] = useState('')

  const error = localError || authError;

  // Show Toast for authentication errors
  useEffect(() => {
    if (authError) {
      showToast(authError, 'error');
      // Clear errors after displaying them
      dispatch(clearErrors());
    }
  }, [authError, dispatch, showToast]);

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
      } else if (roleStr === 'MR') {
        navigate('/mr/dashboard', { replace: true });
      } else if (roleStr === 'HR') {
        navigate('/hr/dashboard', { replace: true });
      } else if (roleStr === 'REGIONAL_MANAGER' || roleStr === 'REGIONAL MANAGER') {
        navigate('/regional-manager/dashboard', { replace: true });
      } else if (roleStr === 'AREA_MANAGER' || roleStr === 'AREA MANAGER') {
        navigate('/area-manager/dashboard', { replace: true });
      } else if (roleStr === 'MEDICAL_MANAGER' || roleStr === 'MEDICAL MANAGER') {
        navigate('/medical-manager/dashboard', { replace: true });
      } else if (roleStr === 'DOCTOR') {
        navigate('/doctor/dashboard', { replace: true });
      } else if (roleStr === 'PHARMACIST') {
        navigate('/pharmacist/dashboard', { replace: true });
      } else if (roleStr === 'DISTRIBUTOR') {
        navigate('/distributor/dashboard', { replace: true });
      } else if (roleStr === 'PATIENT') {
        navigate('/patient/dashboard', { replace: true });
      } else if (roleStr === 'MEDICAL_EXECUTIVE' || roleStr === 'MEDICAL EXECUTIVE' || roleStr === 'ME') {
        navigate('/medical-executive/dashboard', { replace: true });
      } else if (
        roleStr === 'MEDICAL_SALES_EXECUTIVE' ||
        roleStr === 'MEDICAL SALES EXECUTIVE' ||
        roleStr === 'MSE' ||
        roleStr === 'MEDICAL_SALES_REPRESENTATIVE' ||
        roleStr === 'MEDICAL SALES REPRESENTATIVE' ||
        roleStr === 'MSR'
      ) {
        navigate('/medical-sales-executive/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    }
  }, [user, requiresPasswordChange, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!email.trim()) { 
      setLocalError('Please enter your email.');
      showToast('Please enter your email.', 'error');
      return;
    }
    if (!password.trim()) { 
      setLocalError('Please enter your password.');
      showToast('Please enter your password.', 'error');
      return;
    }

    showToast('Signing in...', 'loading');
    const result = await dispatch(login({ email: email.trim(), password }));
    if (result && result.success) {
      showToast(result.message, 'success');
    } else if (result === 'CHANGE_PASSWORD_REQUIRED') {
      showToast('Password change required on first login.', 'warning');
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
    <div className="min-h-screen bg-white relative flex items-center justify-center p-4 md:p-8 overflow-hidden font-sans">

      {/* ── DYNAMIC BACKGROUND ─────────────────────────────────────── */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(200,240,74,0.4)_0%,transparent_70%)] blur-[80px] pointer-events-none"
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(167,216,0,0.2)_0%,transparent_70%)] blur-[80px] pointer-events-none"
      />

      {/* ── MAIN CONTENT GRID ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl w-full relative z-10">

        {/* Left Side: Brand & Messaging */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start gap-6 lg:pr-10"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center cursor-pointer select-none"
            onClick={() => navigate('/')}
          >
            <img
              src="/landing/logo.png"
              alt="Medistrax"
              style={{ height: '80px', width: 'auto', objectFit: 'contain' }}
            />
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-[40px] md:text-[50px] lg:text-[56px] font-extrabold text-gray-900 tracking-tight leading-[1.1]">
            Enter the future of <span className="text-green-700">Pharma HR.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-[18px] text-gray-500 leading-relaxed max-w-[420px] font-medium">
            Secure, compliant, and lightning-fast. Access your workspace and manage operations from anywhere.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-5 p-4 px-5 bg-white border border-gray-200 rounded-xl shadow-sm inline-block">
            <div className="text-[12px] text-gray-400 mb-1 font-bold uppercase tracking-wider">SYSTEM STATUS</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-600 shadow-[0_0_10px_#10b981]" />
              <span className="text-[14px] text-gray-955 font-bold">All services operational</span>
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
          <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-2xl w-full max-w-[460px] mx-auto">

            <div className="mb-8">
              <h2 className="text-[24px] font-extrabold text-gray-900 mb-2">
                Welcome back
              </h2>
              <p className="text-[14px] text-gray-500 font-medium">
                Please enter your credentials to continue.
              </p>
            </div>

            <form onSubmit={handleLogin} noValidate>

              {/* Email */}
              <div className="mb-5">
                <label className="block text-[12px] font-bold text-gray-400 mb-2 uppercase tracking-[0.5px]">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setLocalError('') }}
                  placeholder="you@gmaxepayhr.in"
                  autoComplete="email"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl text-[15px] text-gray-950 font-medium outline-none transition-all duration-200 focus:border-green-600 focus:bg-white box-border"
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-[12px] font-bold text-gray-400 mb-2 uppercase tracking-[0.5px]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setLocalError('') }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full px-4 pr-12 py-3.5 bg-slate-50 border border-gray-200 rounded-xl text-[15px] text-gray-950 font-medium outline-none transition-all duration-200 focus:border-green-600 focus:bg-white box-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPw ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="text-right mb-7">
                <Link to="/forgot-password" className="text-[13px] text-green-700 font-bold hover:opacity-80 transition-opacity no-underline">
                  Forgot password?
                </Link>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 px-4 rounded-lg bg-rose-50 border border-rose-200 text-[13px] text-rose-600 leading-relaxed flex items-center gap-2 font-medium">
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
                className={`w-full py-3.5 text-gray-950 font-extrabold text-[15px] border-none rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-colors ${
                  loading ? 'bg-green-200 cursor-not-allowed' : 'bg-[#C8F04A] hover:bg-[#b5db3f]'
                }`}
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
            <div className="mt-9 pt-6 border-t border-gray-200">
              <div className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-[0.5px]">
                One-Click Demo Access
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { email: 'superadmin@mrmedical.com', password: 'SuperAdmin@123', role: 'Super Admin' },
                  { email: 'admin.one@mrmedical.com', password: 'Password@123', role: 'Admin' },
                  { email: 'msakash886100@gmail.com', password: 'Akash@1234', role: 'Medical Representative (MR)' },
                  { email: 'employee@mrmedical.com', password: 'password123', role: 'Employee' },
                  { email: 'akashms452002@gmail.com', password: 'Akash@1234', role: 'Medical Executive' },
                  { email: 'keerthikmlofficial@gmail.com', password: 'Keerthik@123', role: 'Medical Sales Executive' }
                ].map((c, i) => (
                  <motion.div
                    whileHover={{ x: 4, backgroundColor: '#f8fafc' }}
                    key={i}
                    className="flex justify-between items-center p-2 px-3 rounded-lg cursor-pointer transition-colors duration-150"
                    onClick={() => { setEmail(c.email); setPassword(c.password); setLocalError('') }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${c.role.includes('Admin') ? 'bg-rose-500' : 'bg-green-600'}`} />
                      <span className="text-[13px] font-bold text-gray-700">{c.role}</span>
                    </div>
                    <span className="text-[12px] font-medium text-gray-400">Click to fill</span>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  )
}

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="rgba(15, 23, 42, 0.2)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0110 10" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearErrors } from '../redux/actions/authActions';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error: authError, success, message } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  const error = localError || authError;

  useEffect(() => {
    // Clear any previous error/success states on mount
    dispatch(clearErrors());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

    if (!email.trim()) {
      setLocalError('Please enter your email.');
      return;
    }

    const result = await dispatch(forgotPassword(email.trim()));
    if (result) {
      setLocalSuccess('Reset link sent successfully! Check your inbox.');
      // Keep showing the success message, then redirect to login
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3500);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

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
            className="flex items-center gap-4 cursor-pointer select-none"
            onClick={() => navigate('/')}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C8F04A] to-green-600 flex items-center justify-center shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#0F172A" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M12 2v20M3 7l9 5 9-5" stroke="#0F172A" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="font-extrabold text-[28px] text-gray-900 tracking-tight leading-none">
                GmaxepayHR
              </div>
              <div className="text-[11px] text-green-700 font-bold tracking-[2px] uppercase leading-none mt-1">
                Pharma HRMS
              </div>
            </div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-[40px] md:text-[50px] lg:text-[56px] font-extrabold text-gray-900 tracking-tight leading-[1.1]">
            Restore your <span className="text-green-700">credentials.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-[18px] text-gray-500 leading-relaxed max-w-[420px] font-medium">
            Enter your email address to receive a secure password reset link to reactivate your access.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-5 p-4 px-5 bg-white border border-gray-200 rounded-xl shadow-sm inline-block">
            <div className="text-[12px] text-gray-400 mb-1 font-bold uppercase tracking-wider">PASSWORD RESET SYSTEM</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-600 shadow-[0_0_10px_#10b981]" />
              <span className="text-[14px] text-gray-955 font-bold">Automatic link expiry</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side: Forgot Password Card */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotateY: -10 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          style={{ perspective: '1000px' }}
        >
          <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-2xl w-full max-w-[460px] mx-auto">

            <div className="mb-8">
              <h2 className="text-[24px] font-extrabold text-gray-900 mb-2">
                Reset Password
              </h2>
              <p className="text-[14px] text-gray-550 font-medium">
                Please enter your email to receive a recovery link.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Email */}
              <div className="mb-7">
                <label className="block text-[12px] font-bold text-gray-400 mb-2 uppercase tracking-[0.5px]">
                  Email Address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setLocalError('') }}
                  placeholder="you@gmaxepayhr.in"
                  autoComplete="email"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl text-[15px] text-gray-950 font-medium outline-none transition-all duration-200 focus:border-green-600 focus:bg-white box-border"
                />
              </div>

              {/* Error & Success States */}
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

                {localSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 px-4 rounded-lg bg-green-50 border border-green-200 text-[13px] text-green-700 leading-relaxed flex items-center gap-2 font-bold">
                      <span>✅</span> {localSuccess}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="forgot-btn"
                type="submit"
                disabled={loading || !!localSuccess}
                className={`w-full py-3.5 text-gray-955 font-extrabold text-[15px] border-none rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-colors ${
                  loading || localSuccess ? 'bg-green-200 cursor-not-allowed' : 'bg-[#C8F04A] hover:bg-[#b5db3f]'
                }`}
              >
                {loading ? (
                  <>
                    <SpinnerIcon /> Processing Request...
                  </>
                ) : (
                  'Send Recovery Link'
                )}
              </motion.button>

              {/* Back to Login Link */}
              <div className="text-center mt-6">
                <span className="text-[13px] text-gray-500 font-medium">Remembered your password? </span>
                <span
                  onClick={() => navigate('/login')}
                  className="text-[13px] text-green-700 font-bold hover:opacity-80 transition-opacity cursor-pointer no-underline"
                >
                  Sign In
                </span>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="rgba(15, 23, 42, 0.2)" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0110 10" stroke="#0F172A" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

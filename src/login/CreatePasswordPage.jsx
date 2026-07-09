import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { firstLoginAction, clearErrors } from '../redux/actions/authActions';

const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"/>
  </svg>
);

export default function CreatePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error: authError } = useSelector((state) => state.auth);

  // Retrieve initial values from LoginPage redirection state
  const stateEmail = location.state?.email || '';
  const stateTempPassword = location.state?.tempPassword || '';

  const [email] = useState(stateEmail);
  const [tempPassword] = useState(stateTempPassword);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  const error = localError || authError;

  useEffect(() => {
    // Clear any previous authentication errors on component mount
    dispatch(clearErrors());

    // Redirect to login if email or temporary password is not present
    if (!stateEmail || !stateTempPassword) {
      navigate('/login', { replace: true });
    }
  }, [dispatch, stateEmail, stateTempPassword, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

    if (!email.trim()) {
      setLocalError('Please enter your email.');
      return;
    }
    if (!tempPassword.trim()) {
      setLocalError('Please enter your temporary password.');
      return;
    }
    if (!newPassword.trim()) {
      setLocalError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setLocalError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    const payload = {
      email: email.trim(),
      temporaryPassword: tempPassword.trim(),
      newPassword: newPassword.trim(),
      confirmPassword: confirmPassword.trim(),
    };

    const success = await dispatch(firstLoginAction(payload));
    if (success) {
      setLocalSuccess('Password updated successfully! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
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
            Secure your new <span className="text-green-700">workspace.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-[18px] text-gray-500 leading-relaxed max-w-[420px] font-medium">
            Please set your new permanent password to activate your employee profile and continue securely.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-5 p-4 px-5 bg-white border border-gray-200 rounded-xl shadow-sm inline-block">
            <div className="text-[12px] text-gray-400 mb-1 font-bold uppercase tracking-wider">SECURITY COMPLIANCE</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-600 shadow-[0_0_10px_#10b981]" />
              <span className="text-[14px] text-gray-955 font-bold">End-to-End Encrypted</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side: Create Password Card */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotateY: -10 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          style={{ perspective: '1000px' }}
        >
          <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-2xl w-full max-w-[460px] mx-auto">

            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-extrabold text-[var(--text-primary)]">
                Set New Password
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Required on your first login to ensure account security.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>



              {/* New Password */}
              <div className="mb-5">
                <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.5px] text-[var(--text-secondary)]">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="create-pw-new"
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full rounded-xl border border-[var(--border)] bg-[#f8fafc] px-4 py-3.5 pr-12 text-[15px] font-medium text-[var(--text-primary)] outline-none transition-all duration-200 focus:border-[var(--lime-dark)] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 flex cursor-pointer border-none bg-transparent p-1 text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--text-primary)]"
                  >
                    {showNewPw ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-7">
                <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.5px] text-[var(--text-secondary)]">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="create-pw-confirm"
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full rounded-xl border border-[var(--border)] bg-[#f8fafc] px-4 py-3.5 pr-12 text-[15px] font-medium text-[var(--text-primary)] outline-none transition-all duration-200 focus:border-[var(--lime-dark)] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 flex cursor-pointer border-none bg-transparent p-1 text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--text-primary)]"
                  >
                    {showConfirmPw ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-[13px] font-medium leading-relaxed text-red-600">
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
                    <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50/80 px-4 py-3 text-[13px] font-semibold leading-relaxed text-[var(--lime-dark)]">
                      <span>✅</span> {localSuccess}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="create-pw-btn"
                type="submit"
                disabled={loading || !!localSuccess}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border-none px-4 py-3.5 text-[15px] font-extrabold text-[#0F172A] shadow-[0_8px_20px_rgba(200,240,74,0.2)] transition-all font-[var(--font-sans)] ${
                  loading || localSuccess
                    ? 'cursor-not-allowed bg-[var(--lime)]/50'
                    : 'cursor-pointer bg-[var(--lime)] hover:brightness-105'
                }`}
              >
                {loading ? (
                  <>
                    <SpinnerIcon /> Updating Password...
                  </>
                ) : (
                  'Activate Account & Sign In'
                )}
              </motion.button>
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

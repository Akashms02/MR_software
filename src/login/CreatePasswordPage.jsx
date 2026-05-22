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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
      background: '#F8FAFC',
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
            Secure your new <span style={{ color: 'var(--lime-dark)' }}>workspace.</span>
          </motion.h1>

          <motion.p variants={itemVariants} style={{
            fontSize: '18px', color: 'var(--text-secondary)',
            lineHeight: 1.6, maxWidth: '420px', fontWeight: 500
          }}>
            Please set your new permanent password to activate your employee profile and continue securely.
          </motion.p>

          <motion.div variants={itemVariants} style={{
             marginTop: '20px', padding: '16px 20px',
             background: '#fff', border: '1px solid var(--border)',
             borderRadius: '12px', display: 'inline-block', alignSelf: 'flex-start',
             boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>SECURITY COMPLIANCE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--lime-dark)', boxShadow: '0 0 10px var(--lime)' }} />
              <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>End-to-End Encrypted</span>
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
                Set New Password
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Required on your first login to ensure account security.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>



              {/* New Password */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="create-pw-new"
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
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
                    onClick={() => setShowNewPw(!showNewPw)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex',
                      padding: '4px', transition: 'color 0.2s'
                    }}
                  >
                    {showNewPw ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="create-pw-confirm"
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
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
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex',
                      padding: '4px', transition: 'color 0.2s'
                    }}
                  >
                    {showConfirmPw ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              {/* Error & Success States */}
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

                {localSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      padding: '12px 16px', borderRadius: '10px',
                      background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
                      fontSize: '13px', color: 'var(--lime-dark)', lineHeight: 1.5,
                      display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
                    }}>
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
                style={{
                  width: '100%', padding: '14px',
                  background: loading || localSuccess ? 'rgba(200, 240, 74, 0.5)' : 'var(--lime)',
                  color: '#0F172A', fontWeight: 800, fontSize: '15px',
                  border: 'none', borderRadius: '12px',
                  cursor: loading || localSuccess ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 8px 20px rgba(200, 240, 74, 0.2)'
                }}
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 1s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke="rgba(15, 23, 42, 0.2)" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0110 10" stroke="#0F172A" strokeWidth="3" strokeLinecap="round"/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

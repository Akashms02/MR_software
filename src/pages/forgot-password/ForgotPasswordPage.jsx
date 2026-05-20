import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../../api/client.js';
import { forgotPassword } from '../../api/authService.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setStatus('Reset link sent! Check your email.');
      // After showing success message, redirect to landing page
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F8FAFC',
      fontFamily: 'var(--font-sans)'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          padding: '48px 40px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.08)',
          width: '100%',
          maxWidth: '440px'
        }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Forgot Password</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Enter your email to receive a reset link.</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontSize: '15px',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>
          {status && (
            <div style={{ marginBottom: '16px', color: status.includes('sent') ? 'green' : 'var(--text-primary)' }}>{status}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'rgba(200,240,74,0.5)' : 'var(--lime)',
              color: '#0F172A',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

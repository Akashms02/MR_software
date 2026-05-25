import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveOnboardingStep } from '../../redux/actions/teamActions';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, User, Mail, Phone } from 'lucide-react';

const DoctorOnboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSuccess, setLocalSuccess] = useState(null);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);

    if (!fullName.trim()) return setLocalError('Full Name is required.');
    if (!email.trim()) return setLocalError('Email is required.');
    if (!phone.trim()) return setLocalError('Phone number is required.');

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: 'DOCTOR',
        password: null,
        reportingToId: null,
      };

      const res = await dispatch(saveOnboardingStep(1, null, payload));
      if (res && (res.status === 200 || res.status === 201 || res.success || res.status === 'SUCCESS')) {
        setLocalSuccess('Doctor onboarded successfully! Step 1 configuration registered.');
        setFullName('');
        setEmail('');
        setPhone('');
      } else {
        setLocalError(res?.message || 'Something went wrong during onboarding.');
      }
    } catch (err) {
      setLocalError(err.message || 'Onboarding request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '20px',
    border: '1.5px solid #F3F4F6',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.02)',
    padding: '36px',
    maxWidth: '580px',
    margin: '0 auto',
  };

  const inputGroupStyle = {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const labelStyle = {
    fontSize: '12.5px',
    fontWeight: 700,
    color: '#374151',
  };

  const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px 12px 42px',
    borderRadius: '12px',
    border: '1.5px solid #E5E7EB',
    fontSize: '14px',
    color: '#1F2937',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#FAFAFA',
    transition: 'all 0.2s',
  };

  const iconStyle = {
    position: 'absolute',
    left: '14px',
    color: '#9CA3AF',
  };

  return (
    <div style={{ animation: 'fadeSlideIn 0.35s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
        <button
          onClick={() => navigate('/admin/myteam')}
          style={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#374151',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            REGISTRATION PORTAL
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '4px 0 0 0' }}>Onboard New Doctor</h2>
        </div>
      </div>

      {/* Main Card Form */}
      <div style={cardStyle}>
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>Step 1: Account Information</h3>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Enter the details below to initialize credentials and register the doctor profile.
          </p>
        </div>

        {/* Notifications */}
        {localSuccess && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontSize: '13.5px', fontWeight: 600, marginBottom: '24px' }}>
            <CheckCircle2 size={16} />
            {localSuccess}
          </div>
        )}
        {localError && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#B91C1C', fontSize: '13.5px', fontWeight: 600, marginBottom: '24px' }}>
            <AlertCircle size={16} />
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>
              Doctor Full Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={inputWrapperStyle}>
              <User size={16} style={iconStyle} />
              <input
                type="text"
                placeholder="Dr. Jane Doe"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setLocalError(null);
                }}
                required
                disabled={isSubmitting}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366F1';
                  e.target.style.background = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.background = '#FAFAFA';
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>
              Email Address <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={inputWrapperStyle}>
              <Mail size={16} style={iconStyle} />
              <input
                type="email"
                placeholder="doctor.name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLocalError(null);
                }}
                required
                disabled={isSubmitting}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366F1';
                  e.target.style.background = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.background = '#FAFAFA';
                }}
              />
            </div>
          </div>

          {/* Phone */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>
              Contact Number <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={inputWrapperStyle}>
              <Phone size={16} style={iconStyle} />
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setLocalError(null);
                }}
                required
                disabled={isSubmitting}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366F1';
                  e.target.style.background = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.background = '#FAFAFA';
                }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '30px', borderTop: '1px solid #F3F4F6', paddingTop: '24px' }}>
            <button
              type="button"
              onClick={() => navigate('/admin/myteam')}
              disabled={isSubmitting}
              style={{
                padding: '11px 22px',
                borderRadius: '12px',
                border: '1.5px solid #E5E7EB',
                background: '#fff',
                color: '#374151',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) e.currentTarget.style.background = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) e.currentTarget.style.background = '#fff';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 24px',
                borderRadius: '12px',
                border: 'none',
                background: '#111827',
                color: '#fff',
                fontWeight: 800,
                fontSize: '13.5px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(17, 24, 39, 0.15)',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) e.currentTarget.style.opacity = '1';
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Onboarding...
                </>
              ) : (
                'Onboard Doctor'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DoctorOnboarding;

import React from 'react';

const DoctorDashboard = () => {
  const stats = [
    { label: 'Patients Today', value: '18 Consults', sub: '12 Completed', color: '#7C3AED', bg: '#F5F3FF', icon: '👥' },
    { label: 'Digital Prescriptions', value: '86 Issued', sub: 'This Month', color: '#EC4899', bg: '#FDF2F8', icon: '✍️' },
    { label: 'Next Appointment', value: '04:15 PM', sub: 'Ramanathan Swamy', color: '#2563EB', bg: '#EFF6FF', icon: '⏰' },
    { label: 'Teleconsultations', value: '3 Scheduled', sub: 'Video Portal Link Active', color: '#0D9488', bg: '#F0FDFA', icon: '💻' },
  ];

  const appointments = [
    { patient: 'Ramanathan Swamy', age: '52, Male', time: '04:15 PM', type: 'Follow-up', illness: 'Hypertension review' },
    { patient: 'Meera Deshpande', age: '28, Female', time: '04:45 PM', type: 'First Visit', illness: 'Chronic Migraine consultation' },
    { patient: 'Master Aarav Kapoor', age: '8, Male', time: '05:15 PM', type: 'General Checkup', illness: 'Seasonal Fever & Cough' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', padding: '10px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)',
        borderRadius: '20px',
        padding: '30px',
        color: '#fff',
        marginBottom: '28px',
        boxShadow: '0 10px 25px rgba(124, 58, 237, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>
            PORTAL: MEDICAL CONSULTANT / DOCTOR
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '14px 0 6px 0', letterSpacing: '-0.5px' }}>
            Good Afternoon, Dr. Doctor!
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '500px' }}>
            Access your patient queues, write e-prescriptions directly linked with chemist inventory, and review diagnostic charts.
          </p>
        </div>
        <div style={{
          position: 'absolute', right: '-50px', bottom: '-50px', fontSize: '180px', opacity: 0.1, userSelect: 'none', pointerEvents: 'none'
        }}>
          🩺
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: '#fff',
            border: '1.5px solid #F3F4F6',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)';
          }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px', background: s.bg, fontSize: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', margin: '2px 0' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: s.color }}>
                {s.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Appointments Queue */}
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>Patient Consultation Queue</h3>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#7C3AED', cursor: 'pointer' }}>View Appointment Calendar ➔</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {appointments.map((ap, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: '#FAFAFA', border: '1px solid #F3F4F6'
              }}>
                <div style={{
                  fontSize: '18px', width: '38px', height: '38px', background: '#ECE6FC', color: '#7C3AED',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>{ap.patient}</span>
                    <span style={{ fontSize: '12px', color: '#7C3AED', fontWeight: 700 }}>{ap.time}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{ap.age} • <span style={{ fontWeight: 600, color: '#4B5563' }}>{ap.type}</span></div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px', fontStyle: 'italic' }}>Complaint: {ap.illness}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    padding: '8px 14px', fontSize: '11px', fontWeight: 700, borderRadius: '8px', border: 'none', background: '#7C3AED', color: '#fff', cursor: 'pointer'
                  }}>Start</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Operations */}
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 18px 0', fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>Clinic Controls</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#7C3AED', color: '#fff',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'opacity 0.2s', textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              ✍️ Write E-Prescription
            </button>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              🔍 Patient History Database
            </button>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              🔬 Lab Reports Center
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default DoctorDashboard;

import React from 'react';
import { useNavigate } from 'react-router-dom';

const MedicalManagerDashboard = () => {
  const navigate = useNavigate();
  const stats = [
    { label: 'Clinical Trials', value: '4 Active', sub: 'Phase II & III Progress', color: '#7C3AED', bg: '#F5F3FF', icon: '🧪' },
    { label: 'Compliance Rate', value: '98.4%', sub: 'Medical Guidelines Coverage', color: '#2563EB', bg: '#EFF6FF', icon: '📋' },
    { label: 'Medical Queries', value: '12 Pending', sub: 'Resolved in 24h avg', color: '#0D9488', bg: '#F0FDFA', icon: '❓' },
    { label: 'Adverse Events', value: '0 Active', sub: 'Safety metrics clean', color: '#DC2626', bg: '#FEF2F2', icon: '🛡️' },
  ];

  const researchProjects = [
    { name: 'Cardio-Z Trial (Efficacy Evaluation)', lead: 'Dr. Ramesh Sharma', status: 'In Progress', progress: 78, phase: 'Phase III' },
    { name: 'Pediatric Asthma Study (Safety Check)', lead: 'Dr. Sunita Patel', status: 'In Progress', progress: 45, phase: 'Phase II' },
    { name: 'Ortho-Joint Reliever Clinical Trial', lead: 'Dr. Vivek Verma', status: 'Completed', progress: 100, phase: 'Phase IV' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', padding: '10px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
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
            PORTAL: MEDICAL MANAGER
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '14px 0 6px 0', letterSpacing: '-0.5px' }}>
            Hello, Medical Manager!
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '500px' }}>
            Monitor active clinical trials, track compliance to safety guidelines, manage medical representative query escalations, and audit doctor engagement quality.
          </p>
        </div>
        <div style={{
          position: 'absolute', right: '-40px', bottom: '-50px', fontSize: '180px', opacity: 0.1, userSelect: 'none', pointerEvents: 'none'
        }}>
          🧬
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
        {/* Research & Trials Tracking */}
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>Clinical Research Status</h3>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#7C3AED', cursor: 'pointer' }}>View All Trials ➔</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {researchProjects.map((r, idx) => (
              <div key={idx} style={{
                padding: '16px', borderRadius: '12px', background: '#FAFAFA', border: '1px solid #F3F4F6'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>{r.name}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Principal Investigator: <span style={{ fontWeight: 600 }}>{r.lead}</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1F2937' }}>{r.phase}</div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: r.progress === 100 ? '#10B981' : '#F59E0B' }}>
                      {r.progress}% Enrolled
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '3px' }}>
                  <div style={{ height: '100%', width: `${r.progress}%`, background: r.progress === 100 ? '#10B981' : '#7C3AED', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 18px 0', fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>Management Tasks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#7C3AED', color: '#fff',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'opacity 0.2s', textAlign: 'center'
            }}
            onClick={() => navigate('/medical-manager/onboard-doctor')}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              ➕ Onboard Doctor
            </button>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              📖 Audit Clinical Guidelines
            </button>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              💰 Allocate Research Budget
            </button>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              📨 Message Research Team
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

export default MedicalManagerDashboard;

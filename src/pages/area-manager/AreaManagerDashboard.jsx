import React from 'react';

const AreaManagerDashboard = () => {
  const stats = [
    { label: 'MRs Under Management', value: '18 Active', sub: '2 On Leave Today', color: '#0D9488', bg: '#F0FDFA', icon: '🏃‍♂️' },
    { label: 'Visits Submitted', value: '42 / 60', sub: 'Pending Approval: 8', color: '#3B82F6', bg: '#EFF6FF', icon: '📝' },
    { label: 'Orders Collected', value: '₹3.2 Lakhs', sub: 'This Week', color: '#10B981', bg: '#ECFDF5', icon: '🛍️' },
    { label: 'Area Target Completion', value: '88.5%', sub: 'Target: ₹4 Lakhs', color: '#D97706', bg: '#FFFBEB', icon: '🎯' },
  ];

  const mrActivities = [
    { name: 'Rahul Sen', region: 'Downtown', activity: 'Visited 4 Doctors, 2 Chemists', time: '10 Mins Ago', location: 'Apollo Pharmacy, Sector 15' },
    { name: 'Pooja Hegde', region: 'South Hub', activity: 'Logged visit: Dr. Anjali Mehta', time: '45 Mins Ago', location: 'Heart Care Center' },
    { name: 'Kunal Kapoor', region: 'East Suburbs', activity: 'Collected order of ₹45,000', time: '2 Hours Ago', location: 'A-One Chemists' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', padding: '10px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
        borderRadius: '20px',
        padding: '30px',
        color: '#fff',
        marginBottom: '28px',
        boxShadow: '0 10px 25px rgba(13, 148, 136, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>
            PORTAL: AREA SALES MANAGER
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '14px 0 6px 0', letterSpacing: '-0.5px' }}>
            Hello, Area Manager!
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '500px' }}>
            Supervise field agents, review MR daily reporting, track doctor interactions, and boost pharmaceutical product sales in your area.
          </p>
        </div>
        <div style={{
          position: 'absolute', right: '-50px', bottom: '-50px', fontSize: '180px', opacity: 0.1, userSelect: 'none', pointerEvents: 'none'
        }}>
          🗺️
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
        {/* MR Live Activity Tracking */}
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>MR Field Activity Timeline</h3>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0D9488', cursor: 'pointer' }}>Track GPS Map ➔</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mrActivities.map((act, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: '#FAFAFA', border: '1px solid #F3F4F6'
              }}>
                <div style={{
                  fontSize: '18px', width: '36px', height: '36px', background: '#E2F1E8', color: '#0D9488',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  📍
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>{act.name}</span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>{act.time}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Zone: <span style={{ fontWeight: 600 }}>{act.region}</span> • {act.activity}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px', fontStyle: 'italic' }}>At: {act.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manager Controls */}
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 18px 0', fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#0D9488', color: '#fff',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'opacity 0.2s', textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              ✔️ Approve 8 Pending Logs
            </button>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              📦 Allocate Product Samples
            </button>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              📅 Schedule Joint Field Visit
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

export default AreaManagerDashboard;

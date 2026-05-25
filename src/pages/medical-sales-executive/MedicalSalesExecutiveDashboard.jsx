import React from 'react';

const MedicalSalesExecutiveDashboard = () => {
  const stats = [
    { label: 'Monthly Sales Target', value: '₹2.4L / ₹4.0L', sub: '60% Achieved', color: '#0D9488', bg: '#F0FDFA', icon: '📈' },
    { label: 'Distributor Orders', value: '18 Booked', sub: 'This Week', color: '#3B82F6', bg: '#EFF6FF', icon: '🛒' },
    { label: 'Chemist & Stockist Visits', value: '4 / 6', sub: 'Today\'s Target', color: '#F59E0B', bg: '#FEF3C7', icon: '🏬' },
    { label: 'Sample Stock Remaining', value: '140 Units', sub: 'Replenish Soon', color: '#EF4444', bg: '#FEF2F2', icon: '🧪' },
  ];

  const salesActivities = [
    { targetName: 'Metro Pharmacy', type: 'Order Booking', time: '11:00 AM', status: 'Pending Order', detail: 'Quoted ₹18,500 for Cardace orders' },
    { targetName: 'City Stockists', type: 'Payment Collection', time: '01:30 PM', status: 'Completed', detail: 'Collected Cheque of ₹42,000' },
    { targetName: 'Wellness Chemists', type: 'Sample Delivery', time: '04:00 PM', status: 'Scheduled', detail: 'Deliver Asthalin and generic samples' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', padding: '10px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #115E59 0%, #0D9488 100%)',
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
            PORTAL: MEDICAL SALES EXECUTIVE
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '14px 0 6px 0', letterSpacing: '-0.5px' }}>
            Sales Executive Dashboard
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '500px' }}>
            Monitor your monthly sales quotas, log new distributor order receipts, and record payment collections in the field.
          </p>
        </div>
        <div style={{
          position: 'absolute', right: '-40px', bottom: '-40px', fontSize: '180px', opacity: 0.1, userSelect: 'none', pointerEvents: 'none'
        }}>
          💼
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
        {/* Daily Schedule & Visits */}
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>Daily Sales Calls & Tasks</h3>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0D9488', cursor: 'pointer' }}>View Sales Route ➔</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {salesActivities.map((v, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: '#FAFAFA', border: '1px solid #F3F4F6'
              }}>
                <div style={{
                  fontSize: '20px', width: '40px', height: '40px', background: v.status === 'Completed' ? '#CCFBF1' : '#FEF3C7',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {v.status === 'Completed' ? '✓' : '🛒'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>{v.targetName}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Type: {v.type} • <span style={{ fontWeight: 600 }}>{v.time}</span></div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px', fontStyle: 'italic' }}>{v.detail}</div>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px',
                  background: v.status === 'Completed' ? '#E6FFFA' : '#FFFBEB',
                  color: v.status === 'Completed' ? '#0F766E' : '#B45309'
                }}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 18px 0', fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>Sales Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#0D9488', color: '#fff',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'opacity 0.2s', textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              📝 Book Distributor Order
            </button>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              🔍 Stockist Inventory Audit
            </button>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              💵 Log Payment Collection
            </button>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              📋 Submit Sales Call Report
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

export default MedicalSalesExecutiveDashboard;

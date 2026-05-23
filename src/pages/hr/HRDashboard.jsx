import React from 'react';

const HRDashboard = () => {
  const stats = [
    { label: 'Total Employees', value: '384 Active', sub: 'Across 4 Regions', color: '#10B981', bg: '#ECFDF5', icon: '👥' },
    { label: 'Pending Approvals', value: '12 Requests', sub: 'Leaves & Attendance', color: '#EF4444', bg: '#FEF2F2', icon: '📝' },
    { label: 'Active Job Openings', value: '6 Positions', sub: 'Recruiting Pipeline', color: '#3B82F6', bg: '#EFF6FF', icon: '💼' },
    { label: 'Payroll Status', value: 'May Cycle Done', sub: 'Disbursed on 1st', color: '#8B5CF6', bg: '#F5F3FF', icon: '💰' },
  ];

  const pendingApprovals = [
    { name: 'Amit Verma', role: 'Medical Representative', request: 'Casual Leave (3 Days)', date: '25-27 May', status: 'Pending' },
    { name: 'Dr. Neha Gupta', role: 'Consulting Physician', request: 'Maternity Extension', date: 'June-Aug', status: 'Review Required' },
    { name: 'Ravi Teja', role: 'Area Manager', request: 'Expense Reimbursement', date: '₹14,500', status: 'Pending' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', padding: '10px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #047857 0%, #10B981 100%)',
        borderRadius: '20px',
        padding: '30px',
        color: '#fff',
        marginBottom: '28px',
        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>
            PORTAL: HR MANAGEMENT
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '14px 0 6px 0', letterSpacing: '-0.5px' }}>
            Welcome, HR Admin!
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '500px' }}>
            Oversee company culture, process leave requests, track field recruitment pipelines, and manage employee onboarding.
          </p>
        </div>
        <div style={{
          position: 'absolute', right: '-50px', bottom: '-50px', fontSize: '180px', opacity: 0.1, userSelect: 'none', pointerEvents: 'none'
        }}>
          👩‍💼
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
        {/* Pending Approvals Feed */}
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>Pending Requests Inbox</h3>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857', cursor: 'pointer' }}>View All Requests ➔</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {pendingApprovals.map((p, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: '#FAFAFA', border: '1px solid #F3F4F6'
              }}>
                <div style={{
                  fontSize: '20px', width: '40px', height: '40px', background: p.status.includes('Review') ? '#FFE4E6' : '#EFF6FF',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {p.status.includes('Review') ? '⚠️' : '✉️'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{p.role} • <span style={{ fontWeight: 600, color: '#4B5563' }}>{p.request}</span></div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>Duration/Amount: {p.date}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    padding: '6px 12px', fontSize: '11px', fontWeight: 700, borderRadius: '8px', border: 'none', background: '#D1FAE5', color: '#065F46', cursor: 'pointer'
                  }}>Approve</button>
                  <button style={{
                    padding: '6px 12px', fontSize: '11px', fontWeight: 700, borderRadius: '8px', border: 'none', background: '#F3F4F6', color: '#374151', cursor: 'pointer'
                  }}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HR Operations Quick Links */}
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 18px 0', fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>HR Operations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => window.location.href = '/admin/onboard'}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#047857', color: '#fff',
                fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'opacity 0.2s', textAlign: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              ➕ Onboard New Employee
            </button>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              📊 Payroll Calculator
            </button>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              📁 Compliance Documents
            </button>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              🏢 Manage Departments
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

export default HRDashboard;

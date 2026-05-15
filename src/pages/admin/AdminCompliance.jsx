import { COMPLIANCE_STATUS } from '../../data/hrmsData'
import { Card, SectionHeader, StatCard } from '../../components/ui'

const DUE_CALENDAR = [
  { date: 'May 07', event: 'TDS Payment (Apr)',     status: 'Filed',    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  { date: 'May 15', event: 'PF Challan (Apr)',      status: 'Filed',    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  { date: 'May 15', event: 'ESI Challan (Apr)',     status: 'Filed',    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  { date: 'May 31', event: 'PT Return (Q4)',        status: 'Due',      color: '#d97706', bg: '#fef9ee', border: '#fde68a' },
  { date: 'May 31', event: 'LWF Contribution',     status: 'Due',      color: '#d97706', bg: '#fef9ee', border: '#fde68a' },
  { date: 'Jun 07', event: 'TDS Payment (May)',     status: 'Upcoming', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
  { date: 'Jun 15', event: 'PF Challan (May)',      status: 'Upcoming', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
  { date: 'Jun 30', event: 'PF Annual Return',      status: 'Upcoming', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
]

export default function AdminCompliance() {
  return (
    <div>
      <SectionHeader
        title="Statutory Compliance"
        sub="PF · ESI · TDS · Labour Law — All filings up to date for May 2026"
      />

      {/* Compliance Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {COMPLIANCE_STATUS.map((c, i) => (
          <Card key={i} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>✅</div>
              <span style={{ padding: '3px 10px', borderRadius: '100px', background: '#dcfce7', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '11px', fontWeight: 700 }}>Compliant</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '3px' }}>{c.label}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px' }}>{c.sub}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Due: <span style={{ color: '#374151', fontWeight: 600 }}>{c.due}</span></div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>{c.amount}</div>
          </Card>
        ))}
      </div>

      {/* Summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        <StatCard icon="🏦" label="PF Registered"   value="₹1,84,500" sub="Apr 2026 · UAN Filed"   color="#16a34a" />
        <StatCard icon="🏥" label="ESI Registered"  value="₹62,400"   sub="Apr 2026 · Filed"       color="#0891b2" bgColor="#e0f2fe" />
        <StatCard icon="📄" label="TDS Deducted"    value="₹94,200"   sub="Form 24Q Filed"         color="#7c3aed" bgColor="#ede9fe" />
        <StatCard icon="⚖️" label="PT / LWF"        value="₹21,950"   sub="All States Filed"       color="#d97706" bgColor="#fef3c7" />
      </div>

      {/* Filing Calendar */}
      <Card style={{ padding: '24px' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827', marginBottom: '18px' }}>📅 Compliance Filing Calendar</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {DUE_CALENDAR.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '12px 16px', borderRadius: '10px',
              background: item.bg, border: `1px solid ${item.border}`,
              transition: 'transform 0.12s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
            >
              <div style={{ width: '72px', flexShrink: 0, fontSize: '12px', fontWeight: 700, color: item.color }}>{item.date}</div>
              <div style={{ flex: 1, fontSize: '13px', color: '#374151', fontWeight: 500 }}>{item.event}</div>
              <div style={{
                padding: '3px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
                background: item.bg, border: `1px solid ${item.border}`, color: item.color,
              }}>
                {item.status === 'Filed' ? '✓ Filed' : item.status === 'Due' ? '⏰ Due Soon' : '📅 Upcoming'}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

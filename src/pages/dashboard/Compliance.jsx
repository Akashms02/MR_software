import { COMPLIANCE_STATUS } from './data'
import { Card, SectionHeader } from '../../components/ui'
import { COLORS } from './colors'

const C = COLORS

const DUE_CALENDAR = [
  { date: 'May 07', event: 'TDS Payment (Apr)',     status: 'Done',    color: '#4ade80' },
  { date: 'May 15', event: 'PF Challan (Apr)',      status: 'Done',    color: '#4ade80' },
  { date: 'May 15', event: 'ESI Challan (Apr)',     status: 'Done',    color: '#4ade80' },
  { date: 'May 31', event: 'PT Return (Q4)',        status: 'Due',     color: '#fb923c' },
  { date: 'May 31', event: 'LWF Contribution',     status: 'Due',     color: '#fb923c' },
  { date: 'Jun 07', event: 'TDS Payment (May)',     status: 'Upcoming',color: '#94a3b8' },
  { date: 'Jun 15', event: 'PF Challan (May)',      status: 'Upcoming',color: '#94a3b8' },
  { date: 'Jun 30', event: 'PF Annual Return',      status: 'Upcoming',color: '#94a3b8' },
]

const STAT_TILES = [
  { label: 'PF Registered',  value: '₹1,84,500', sub: 'Apr 2026 · UAN Filed', color: C.teal, icon: '🏦' },
  { label: 'ESI Registered', value: '₹62,400',   sub: 'Apr 2026 · Filed',     color: '#a78bfa', icon: '🏥' },
  { label: 'TDS Deducted',   value: '₹94,200',   sub: 'Form 24Q Filed',       color: C.pink, icon: '📄' },
  { label: 'PT / LWF',       value: '₹21,950',   sub: 'All States Filed',     color: '#fb923c', icon: '⚖️' },
]

export default function Compliance() {
  return (
    <div>
      <SectionHeader
        title="Statutory Compliance"
        sub="PF · ESI · TDS · Labour Law — All filings up to date"
      />

      {/* ── Status Cards ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {COMPLIANCE_STATUS.map((c, i) => (
          <Card key={i} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(74,222,128,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
              }}>✅</div>
              <span style={{ padding: '3px 10px', borderRadius: '100px', background: 'rgba(74,222,128,0.12)', color: '#4ade80', fontSize: '12px', fontWeight: 700 }}>Compliant</span>
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>{c.label}</div>
            <div style={{ fontSize: '12px', color: C.muted, marginBottom: '10px' }}>{c.sub}</div>
            <div style={{ fontSize: '12px', color: C.dim }}>Due: <span style={{ color: C.text }}>{c.due}</span></div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: C.teal, marginTop: '6px' }}>{c.amount}</div>
          </Card>
        ))}
      </div>

      {/* ── Stat Tiles ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        {STAT_TILES.map(t => (
          <Card key={t.label} style={{ padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '26px', marginBottom: '10px' }}>{t.icon}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 800, color: t.color, marginBottom: '4px' }}>{t.value}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '3px' }}>{t.label}</div>
            <div style={{ fontSize: '11px', color: C.dim }}>{t.sub}</div>
          </Card>
        ))}
      </div>

      {/* ── Filing Calendar ───────────────────────────── */}
      <Card style={{ padding: '20px' }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '18px' }}>
          📅 Compliance Filing Calendar
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {DUE_CALENDAR.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '12px 16px', borderRadius: '10px',
              background: item.status === 'Done' ? 'rgba(74,222,128,0.04)' : item.status === 'Due' ? 'rgba(251,146,60,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${item.color}20`,
            }}>
              <div style={{
                width: '72px', flexShrink: 0,
                fontSize: '12px', fontWeight: 700, color: item.color,
              }}>{item.date}</div>
              <div style={{ flex: 1, fontSize: '13px', color: C.text, fontWeight: 500 }}>{item.event}</div>
              <div style={{
                padding: '3px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
                background: `${item.color}18`, color: item.color,
              }}>
                {item.status === 'Done' ? '✓ Filed' : item.status === 'Due' ? '⏰ Due Soon' : '📅 Upcoming'}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

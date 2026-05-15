import React from 'react'
import { Share2, ExternalLink, ChevronRight, FileText, CreditCard, ShieldCheck, HeartHandshake, Network, Briefcase, Users, Calendar, Search, HelpCircle } from 'lucide-react'
import { CANDIDATES } from '../../data/hrmsData'

/* ── Stat Card — matching ref: icon top-left, big number bottom-right, label bottom-left ── */
function StatCard({ label, value, type }) {
  const configs = {
    teal:   { from: '#6EC6C2', to: '#4AAFA9', Icon: Users,    iconColor: '#2D9E98' },
    orange: { from: '#FFB07A', to: '#FF8F4E', Icon: Calendar,  iconColor: '#CC6B1A' },
    coral:  { from: '#FF9090', to: '#FF6B6B', Icon: Search,    iconColor: '#CC3333' },
    purple: { from: '#B8A6FB', to: '#9B87F5', Icon: HelpCircle,iconColor: '#6B4FD4' },
  }
  const c = configs[type] || configs.teal
  const { Icon } = c

  return (
    <div style={{
      borderRadius: '18px',
      background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
      padding: '20px 22px',
      display: 'flex', flexDirection: 'column',
      minHeight: '160px', position: 'relative',
      overflow: 'hidden', color: '#fff',
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)'
    }}>
      {/* Top row: icon + close circle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'rgba(255,255,255,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color="#fff" strokeWidth={2} />
        </div>
        <div style={{
          width: '22px', height: '22px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', cursor: 'pointer', color: '#fff', fontWeight: 700,
          lineHeight: 1
        }}>×</div>
      </div>

      {/* Bottom row: label left, value right */}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, opacity: 0.9, maxWidth: '90px', lineHeight: 1.3 }}>
          {label}
        </div>
        <div style={{ fontSize: '52px', fontWeight: 800, lineHeight: 0.9, letterSpacing: '-2px' }}>
          {value}
        </div>
      </div>
    </div>
  )
}

/* ── Event Row with colored date badge ─────────────────────────────────── */
function EventRow({ date, month, title, sub, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
        background: `${color}18`, border: `1.5px solid ${color}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{date}</div>
        <div style={{ fontSize: '8px', fontWeight: 700, color: color, textTransform: 'uppercase' }}>{month}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ fontSize: '11px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
    </div>
  )
}

/* ── Candidate row in Hiring Applications ──────────────────────────────── */
function HiringRow({ name, role, status }) {
  const badgeColors = {
    'Creative Lead':     { bg: '#EFF6FF', color: '#3B82F6' },
    'Front End Developer': { bg: '#F0FDF4', color: '#22C55E' },
    'Product Manager':   { bg: '#FEF3C7', color: '#F59E0B' },
  }
  const badge = badgeColors[role] || { bg: '#F3F4F6', color: '#6B7280' }

  const initials = name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #CBD5E1, #94A3B8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: 700, color: '#fff'
      }}>{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{name}</div>
        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{role.split(' ')[0]}</div>
      </div>
      <div style={{
        padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
        background: badge.bg, color: badge.color, flexShrink: 0, whiteSpace: 'nowrap'
      }}>{role}</div>
    </div>
  )
}

/* ── Quick Action Tile ──────────────────────────────────────────────────── */
function QATile({ icon: Icon, label }) {
  return (
    <div style={{
      background: '#F9FAFB', borderRadius: '12px', padding: '14px 10px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      cursor: 'pointer', transition: 'background 0.15s'
    }}
    onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
    onMouseLeave={e => e.currentTarget.style.background = '#F9FAFB'}
    >
      <Icon size={19} color="#6B7280" strokeWidth={1.8} />
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textAlign: 'center' }}>{label}</div>
    </div>
  )
}

/* ── Card wrapper ──────────────────────────────────────────────────────── */
function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px', ...style }}>
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  return (
    <div className="animate-fade">

      {/* ── Info Banner ──────────────────────────────────────────── */}
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid #F3F4F6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px' }}>⚡</span>
          <span style={{ fontSize: '13px', color: '#374151' }}>
            <strong style={{ color: '#111827' }}>Take Action :</strong> The appraisal cycle is around the corner. Let's get started.
          </span>
        </div>
        <button className="btn-lime" style={{ fontSize: '13px', padding: '9px 18px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
          Send Reminders
        </button>
      </div>

      {/* ── Stat Cards Row ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' }}>
        <StatCard label="Total Employees" value="289" type="teal"   />
        <StatCard label="On Leave"        value="08"  type="orange" />
        <StatCard label="Hiring Roles"    value="03"  type="coral"  />
        <StatCard label="Requests"        value="28"  type="purple" />
      </div>

      {/* ── Middle Row: Venn + News & Events + Hiring Applications ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Venn / Location Bubbles */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Location</div>
            <ExternalLink size={14} color="#9CA3AF" style={{ cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', position: 'relative', height: '130px' }}>
            {/* Bubble cluster */}
            <div style={{ position: 'relative', width: '160px', height: '130px' }}>
              <div style={{ position:'absolute', width:'90px', height:'90px', borderRadius:'50%', background:'rgba(99,102,241,0.18)', top:'0', left:'30px', display:'flex',alignItems:'center',justifyContent:'center', fontSize:'16px',fontWeight:800,color:'#4F46E5' }}>122</div>
              <div style={{ position:'absolute', width:'58px', height:'58px', borderRadius:'50%', background:'rgba(16,185,129,0.18)', bottom:'10px', right:'8px', display:'flex',alignItems:'center',justifyContent:'center', fontSize:'13px',fontWeight:800,color:'#059669' }}>38</div>
              <div style={{ position:'absolute', width:'46px', height:'46px', borderRadius:'50%', background:'rgba(245,158,11,0.2)', bottom:'5px', left:'30px', display:'flex',alignItems:'center',justifyContent:'center', fontSize:'12px',fontWeight:800,color:'#D97706' }}>27</div>
              <div style={{ position:'absolute', width:'38px', height:'38px', borderRadius:'50%', background:'rgba(239,68,68,0.15)', top:'30px', left:'5px', display:'flex',alignItems:'center',justifyContent:'center', fontSize:'11px',fontWeight:800,color:'#DC2626' }}>14</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
            {[['#4F46E5','Remote'],['#059669','France'],['#D97706','India'],['#DC2626','USA']].map(([color, label]) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'11px', color:'#6B7280' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: color, flexShrink:0 }} />
                {label}
              </div>
            ))}
          </div>
        </Card>

        {/* News & Events */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>News & Events</div>
            <ExternalLink size={14} color="#9CA3AF" style={{ cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
            <EventRow date="03" month="Aug" title="Board Meeting"   sub="Project Meeting"               color="#A78BFA" />
            <EventRow date="29" month="Aug" title="Holiday - India" sub="Holi by GreenHR Team"          color="#10B981" />
            <EventRow date="13" month="Aug" title="New Joinee"      sub="Welcome aboard, Rafi Ansari"   color="#F59E0B" />
            <EventRow date="22" month="Aug" title="New Joinee"      sub="Welcome aboard, Farmers M."    color="#EF4444" />
            <EventRow date="24" month="Aug" title="Work Anniversary" sub="Happy Work Anniversary, Eve…" color="#3B82F6" />
            <EventRow date="21" month="Aug" title="Policy Update"   sub="Travel Reimbursement - V.2.1"  color="#8B5CF6" />
          </div>
        </Card>

        {/* Hiring Applications */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>Hiring Applications</div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px',
              background: '#C8F04A', border: 'none', borderRadius: '8px',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer'
            }}>
              <Share2 size={12} /> Share
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <HiringRow name="Harper Lee"       role="Creative Lead"      status="processing" />
            <HiringRow name="Francis Degas"    role="Front End Developer" status="selected" />
            <HiringRow name="Leonora Carington" role="Product Manager"   status="processing" />
            <HiringRow name="Andrew Hunt, M"   role="Creative Lead"      status="selected" />
          </div>
        </Card>
      </div>

      {/* ── Bottom Row: Hiring Updates + Quick Actions ───────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Hiring Updates */}
        <Card>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827', marginBottom: '14px' }}>Hiring Updates</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Shortlisted Candidates' },
              { label: 'Upcoming Interviews' },
              { label: 'Rejected Applications' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', background: '#F9FAFB', borderRadius: '10px', cursor: 'pointer'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>{item.label}</span>
                <ChevronRight size={16} color="#C8F04A" strokeWidth={2.5} />
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827', marginBottom: '14px' }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
            <QATile icon={FileText}       label="Contracts"   />
            <QATile icon={CreditCard}     label="Payments"    />
            <QATile icon={ShieldCheck}    label="Security"    />
            <QATile icon={HeartHandshake} label="IT Support"  />
            <QATile icon={Network}        label="PSA"         />
            <QATile icon={Briefcase}      label="Integration" />
          </div>
        </Card>
      </div>
    </div>
  )
}

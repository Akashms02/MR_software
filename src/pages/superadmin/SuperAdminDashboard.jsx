import React from 'react'
import { Share2, ExternalLink, ChevronRight, FileText, CreditCard, ShieldCheck, HeartHandshake, Network, Briefcase, Users, Calendar, Search, HelpCircle, Server, Key, Database, Globe } from 'lucide-react'

/* ── Stat Card ── */
function StatCard({ label, value, type }) {
  const configs = {
    teal:   { from: '#6EC6C2', to: '#4AAFA9', Icon: Users,    iconColor: '#2D9E98' },
    orange: { from: '#FFB07A', to: '#FF8F4E', Icon: Globe,    iconColor: '#CC6B1A' },
    coral:  { from: '#FF9090', to: '#FF6B6B', Icon: ShieldCheck,iconColor: '#CC3333' },
    purple: { from: '#B8A6FB', to: '#9B87F5', Icon: Server,   iconColor: '#6B4FD4' },
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

/* ── Event Row ── */
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

/* ── HiringRow renamed to AdminRow ── */
function AdminRow({ name, role, status }) {
  const badgeColors = {
    'Branch Admin':    { bg: '#EFF6FF', color: '#3B82F6' },
    'HR Manager':      { bg: '#F0FDF4', color: '#22C55E' },
    'System Support':  { bg: '#FEF3C7', color: '#F59E0B' },
  }
  const badge = badgeColors[role] || { bg: '#F3F4F6', color: '#6B7280' }
  const initials = name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #111827, #374151)',
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

/* ── Quick Action Tile ── */
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

function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px', ...style }}>
      {children}
    </div>
  )
}

export default function SuperAdminDashboard() {
  return (
    <div className="animate-fade">
      {/* ── Info Banner ── */}
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid #F3F4F6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px' }}>🛡️</span>
          <span style={{ fontSize: '13px', color: '#374151' }}>
            <strong style={{ color: '#111827' }}>System Alert :</strong> Global system backup completed successfully. No vulnerabilities detected.
          </span>
        </div>
        <button className="btn-lime" style={{ fontSize: '13px', padding: '9px 18px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
          View Logs
        </button>
      </div>

      {/* ── Stat Cards Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' }}>
        <StatCard label="Global Users"    value="12,482" type="teal"   />
        <StatCard label="Total Branches"  value="18"     type="orange" />
        <StatCard label="Active Admins"   value="45"     type="coral"  />
        <StatCard label="Server Status"   value="99%"    type="purple" />
      </div>

      {/* ── Middle Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '16px', marginBottom: '16px' }}>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Global Distribution</div>
            <ExternalLink size={14} color="#9CA3AF" style={{ cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', position: 'relative', height: '130px' }}>
            <div style={{ position: 'relative', width: '160px', height: '130px' }}>
              <div style={{ position:'absolute', width:'90px', height:'90px', borderRadius:'50%', background:'rgba(99,102,241,0.18)', top:'0', left:'30px', display:'flex',alignItems:'center',justifyContent:'center', fontSize:'16px',fontWeight:800,color:'#4F46E5' }}>USHQ</div>
              <div style={{ position:'absolute', width:'58px', height:'58px', borderRadius:'50%', background:'rgba(16,185,129,0.18)', bottom:'10px', right:'8px', display:'flex',alignItems:'center',justifyContent:'center', fontSize:'13px',fontWeight:800,color:'#059669' }}>EMEA</div>
              <div style={{ position:'absolute', width:'46px', height:'46px', borderRadius:'50%', background:'rgba(245,158,11,0.2)', bottom:'5px', left:'30px', display:'flex',alignItems:'center',justifyContent:'center', fontSize:'12px',fontWeight:800,color:'#D97706' }}>APAC</div>
              <div style={{ position:'absolute', width:'38px', height:'38px', borderRadius:'50%', background:'rgba(239,68,68,0.15)', top:'30px', left:'5px', display:'flex',alignItems:'center',justifyContent:'center', fontSize:'11px',fontWeight:800,color:'#DC2626' }}>LATAM</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
            {[['#4F46E5','North America'],['#059669','Europe'],['#D97706','Asia Pacific'],['#DC2626','South America']].map(([color, label]) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'11px', color:'#6B7280' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: color, flexShrink:0 }} />
                {label}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>System Updates</div>
            <ExternalLink size={14} color="#9CA3AF" style={{ cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
            <EventRow date="01" month="Sep" title="Server Migration" sub="Database cluster switch" color="#A78BFA" />
            <EventRow date="05" month="Sep" title="Security Patch"   sub="v4.2 Auth Module"        color="#10B981" />
            <EventRow date="12" month="Sep" title="Global Sync"      sub="Cross-region replication" color="#F59E0B" />
            <EventRow date="18" month="Sep" title="Downtime"         sub="Scheduled maintenance"    color="#EF4444" />
            <EventRow date="22" month="Sep" title="API Update"       sub="Deprecating v1 endpoints" color="#3B82F6" />
            <EventRow date="25" month="Sep" title="Audit Review"     sub="Quarterly compliance check" color="#8B5CF6" />
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>Active Admins</div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px',
              background: '#C8F04A', border: 'none', borderRadius: '8px',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer'
            }}>
              Manage
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <AdminRow name="Sarah Connor"   role="Branch Admin"   status="active" />
            <AdminRow name="John Smith"     role="HR Manager"     status="active" />
            <AdminRow name="Elena Gilbert"  role="System Support" status="active" />
            <AdminRow name="Marcus Wright"  role="Branch Admin"   status="active" />
          </div>
        </Card>
      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        <Card>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827', marginBottom: '14px' }}>Administration Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Review Global Policies' },
              { label: 'Manage Data Retention' },
              { label: 'Configure SSO Integration' },
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

        <Card>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827', marginBottom: '14px' }}>Super Admin Tools</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
            <QATile icon={Database}       label="Database"    />
            <QATile icon={Key}            label="API Keys"    />
            <QATile icon={ShieldCheck}    label="Audit Logs"  />
            <QATile icon={Server}         label="Backups"     />
            <QATile icon={Network}        label="Routing"     />
            <QATile icon={Globe}          label="Regions"     />
          </div>
        </Card>
      </div>
    </div>
  )
}

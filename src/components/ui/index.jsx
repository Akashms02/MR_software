import React from 'react'
import { ChevronRight, X, MessageSquare, MoreHorizontal, ArrowRight } from 'lucide-react'

/* ─── Avatar ───────────────────────────────────────────────────────────── */
export function Avatar({ name, size = 32 }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%',
      background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: `${size * 0.4}px`, fontWeight: 700, color: '#475569',
      flexShrink: 0, overflow: 'hidden'
    }}>
      {initials}
    </div>
  )
}

/* ─── Card ─────────────────────────────────────────────────────────────── */
export function Card({ children, style, className = '' }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  )
}

/* ─── Stat Card Gradient ──────────────────────────────────────────────── */
export function StatCardGradient({ icon: Icon, label, value, type = 'teal' }) {
  const gradients = {
    teal:   { from: '#5CE1D4', to: '#3CBFB4', icon: '👤' },
    orange: { from: '#FFA552', to: '#FF8C3A', icon: '📅' },
    coral:  { from: '#FF7A7A', to: '#FF5A5A', icon: '🔍' },
    purple: { from: '#A78BFA', to: '#8B5CF6', icon: '❓' },
  }
  const g = gradients[type] || gradients.teal

  return (
    <div style={{
      padding: '24px',
      borderRadius: '24px',
      background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      minHeight: '170px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      overflow: 'hidden'
    }}>
      {/* Top Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ 
          width: '44px', height: '44px', borderRadius: '12px', 
          background: 'rgba(255,255,255,0.25)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', backdropFilter: 'blur(4px)'
        }}>
          {g.icon}
        </div>
        <div style={{ 
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', cursor: 'pointer'
        }}>
          <ChevronRight size={16} />
        </div>
      </div>

      {/* Bottom Section: Label Left, Big Value Right */}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ 
          fontSize: '13px', fontWeight: 600, opacity: 0.9, 
          maxWidth: '80px', lineHeight: 1.3, marginBottom: '6px'
        }}>
          {label}
        </div>
        <div style={{ fontSize: '56px', fontWeight: 800, lineHeight: 0.8, letterSpacing: '-2px' }}>
          {value}
        </div>
      </div>
    </div>
  )
}

/* ─── Info Banner ──────────────────────────────────────────────────────── */
export function InfoBanner({ icon = '💡', text, actionLabel, onAction }) {
  return (
    <div style={{
      background: '#fff',
      padding: '12px 24px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-card)',
      marginBottom: '24px',
      border: '1px solid var(--border-light)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '18px', filter: 'grayscale(1) brightness(0.5)' }}>{icon}</span>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>Take Action :</span> {text}
        </div>
      </div>
      {actionLabel && (
        <button onClick={onAction} className="btn-lime" style={{ padding: '10px 20px', fontSize: '12px', borderRadius: '10px' }}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

/* ─── Badge ────────────────────────────────────────────────────────────── */
export function Badge({ type = 'processing', children }) {
  const classes = {
    processing: 'badge-processing',
    selected:   'badge-selected',
    rejected:   'badge-rejected',
    pending:    'badge-pending',
    approved:   'badge-approved',
  }
  return (
    <div className={`badge ${classes[type] || classes.processing}`}>
      {children}
    </div>
  )
}

/* ─── Candidate Card ───────────────────────────────────────────────────── */
export function CandidateCard({ name, role, status, email, phone, experience, appliedOn }) {
  return (
    <Card style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
      <button style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}>
        <X size={18} />
      </button>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <Avatar name={name} size={64} />
      </div>
      
      <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>{name}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>{role}</div>
      
      <div style={{ marginBottom: '20px' }}>
        <Badge type={status.toLowerCase()}>{status}</Badge>
      </div>
      
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Mail</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{email}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Phone</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{phone}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Experience</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{experience}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Applied on</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{appliedOn}</span>
        </div>
      </div>
      
      <button className="btn-lime" style={{ width: '100%', marginTop: '16px', justifyContent: 'center', background: '#f0fdf4', color: '#16a34a', border: 'none' }}>
        <MessageSquare size={14} style={{ marginRight: '6px' }} /> Comments
      </button>
    </Card>
  )
}

/* ─── Event Row ────────────────────────────────────────────────────────── */
export function EventRow({ date, month, title, sub, color = 'var(--lime)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0' }}>
      <div style={{ 
        width: '44px', height: '44px', borderRadius: '12px', 
        background: `${color}15`, border: `1.5px solid ${color}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{date}</div>
        <div style={{ fontSize: '9px', fontWeight: 700, color: color, textTransform: 'uppercase' }}>{month}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</div>
      </div>
    </div>
  )
}

/* ─── Buttons ──────────────────────────────────────────────────────────── */
export function PrimaryBtn({ children, onClick, style }) {
  return (
    <button className="btn-lime" onClick={onClick} style={style}>
      {children}
    </button>
  )
}

export function OutlineBtn({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '10px 22px', background: '#fff', color: 'var(--text-primary)',
      fontWeight: 700, fontSize: '14px', borderRadius: '10px',
      border: '1.5px solid var(--border)', cursor: 'pointer',
      transition: 'all 0.2s', ...style
    }}
    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
    >
      {children}
    </button>
  )
}

export function GhostBtn({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '10px 22px', background: 'transparent', color: 'var(--text-secondary)',
      fontWeight: 600, fontSize: '14px', borderRadius: '10px',
      border: 'none', cursor: 'pointer',
      transition: 'all 0.2s', ...style
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {children}
    </button>
  )
}

/* ─── Table ────────────────────────────────────────────────────────────── */
export function TableWrap({ children }) {
  return (
    <Card style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
      {children}
    </Card>
  )
}

export function Th({ children }) {
  return (
    <th style={{
      textAlign: 'left', padding: '14px 20px', fontSize: '11px',
      fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase',
      letterSpacing: '0.5px', background: '#F9FAFB', borderBottom: '1px solid var(--border-light)'
    }}>
      {children}
    </th>
  )
}

export function Td({ children, style }) {
  return (
    <td style={{
      padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)',
      borderBottom: '1px solid var(--border-light)', ...style
    }}>
      {children}
    </td>
  )
}

/* ─── Navigation ───────────────────────────────────────────────────────── */
export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', background: '#F3F4F6', padding: '4px', borderRadius: '12px' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: active === t.id ? '#fff' : 'transparent',
          color: active === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
          fontWeight: 700, fontSize: '13px', cursor: 'pointer',
          boxShadow: active === t.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
          transition: 'all 0.2s'
        }}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

/* ─── Legacy Stat Card (Flat) ─────────────────────────────────────────── */
export function StatCard({ icon, label, value, color, bgColor }) {
  return (
    <Card style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px',
        background: bgColor || '#F3F4F6', color: color || 'var(--text-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </Card>
  )
}

/* ─── Section Header ───────────────────────────────────────────────────── */
export function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
        {sub && <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{sub}</p>}
      </div>
      <div>{action}</div>
    </div>
  )
}

/* ─── Quick Action Tile ────────────────────────────────────────────────── */
export function QuickActionTile({ icon: Icon, label }) {
  return (
    <div style={{ 
      background: '#F9FAFB', borderRadius: (typeof Icon === 'string' ? '12px' : '16px'), padding: '16px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
      cursor: 'pointer', transition: 'all 0.2s'
    }}
    onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
    onMouseLeave={e => e.currentTarget.style.background = '#F9FAFB'}
    >
      <div style={{ color: 'var(--text-secondary)' }}>
        {typeof Icon === 'string' ? <span style={{ fontSize: '20px' }}>{Icon}</span> : <Icon size={20} />}
      </div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>{label}</div>
    </div>
  )
}

/* ─── Chart Tooltip ────────────────────────────────────────────────────── */
export function ChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff', padding: '10px 14px', border: 'none',
        borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        fontSize: '12px', minWidth: '100px'
      }}>
        {label && <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{label}</div>}
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: p.color || 'var(--text-secondary)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color || p.fill }} />
            <span style={{ fontWeight: 500 }}>{p.name}:</span>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{p.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export const StatusBadge = Badge

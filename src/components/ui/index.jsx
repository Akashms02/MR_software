import React from 'react'
import { ChevronRight, X, MessageSquare, MoreHorizontal, ArrowRight } from 'lucide-react'

/* ─── Avatar ───────────────────────────────────────────────────────────── */
export function Avatar({ name, size = 32 }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'
  return (
    <div
      className="rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center font-bold text-slate-600 shrink-0 overflow-hidden"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.4}px`
      }}
    >
      {initials}
    </div>
  )
}

/* ─── Card ─────────────────────────────────────────────────────────────── */
export function Card({ children, style, className = '' }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] ${className}`} style={style}>
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
    <div
      className="p-6 rounded-[24px] text-white flex flex-col relative min-h-[170px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
      }}
    >
      {/* Top Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-11 h-11 rounded-xl bg-white/25 flex items-center justify-center text-[22px] backdrop-blur-[4px]">
          {g.icon}
        </div>
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white/30 transition-colors">
          <ChevronRight size={16} />
        </div>
      </div>

      {/* Bottom Section: Label Left, Big Value Right */}
      <div className="mt-auto flex items-end justify-between">
        <div className="text-[13px] font-semibold opacity-90 max-w-[80px] leading-tight mb-1.5">
          {label}
        </div>
        <div className="text-[56px] font-extrabold leading-none tracking-[-2px]">
          {value}
        </div>
      </div>
    </div>
  )
}

/* ─── Info Banner ──────────────────────────────────────────────────────── */
export function InfoBanner({ icon = '💡', text, actionLabel, onAction }) {
  return (
    <div className="bg-white p-3 px-6 rounded-2xl flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.02)] mb-6 border border-gray-100">
      <div className="flex items-center gap-3">
        <span className="text-[18px] grayscale contrast-50 brightness-75">{icon}</span>
        <div className="text-[13px] text-gray-500">
          <span className="text-gray-900 font-extrabold">Take Action :</span> {text}
        </div>
      </div>
      {actionLabel && (
        <button onClick={onAction} className="btn-lime py-2 px-5 text-[12px] rounded-[10px]">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

/* ─── Badge ────────────────────────────────────────────────────────────── */
export function Badge({ type = 'processing', children }) {
  const classes = {
    processing: 'bg-[#EFF6FF] text-[#1D4ED8] border-none',
    selected:   'bg-[#E0F2FE] text-[#0369A1] border-none',
    rejected:   'bg-[#FEF2F2] text-[#B91C1C] border-none',
    pending:    'bg-[#FFFBEB] text-[#B45309] border-none',
    approved:   'bg-[#ECFDF5] text-[#047857] border-none',
  }
  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-[10px] text-[12px] font-bold uppercase tracking-wider ${classes[type.toLowerCase()] || classes.processing}`}>
      {children}
    </div>
  )
}

/* ─── Candidate Card ───────────────────────────────────────────────────── */
export function CandidateCard({ name, role, status, email, phone, experience, appliedOn }) {
  return (
    <Card className="p-6 text-center relative">
      <button className="absolute top-4 right-4 bg-transparent border-none text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
        <X size={18} />
      </button>
      
      <div className="flex justify-center mb-4">
        <Avatar name={name} size={64} />
      </div>
      
      <div className="font-extrabold text-[16px] text-gray-900">{name}</div>
      <div className="text-[12px] text-gray-400 mb-3">{role}</div>
      
      <div className="mb-5">
        <Badge type={status.toLowerCase()}>{status}</Badge>
      </div>
      
      <div className="border-t border-gray-150 pt-4 flex flex-col gap-2 text-left">
        <div className="flex justify-between text-[12px]">
          <span className="text-gray-400">Mail</span>
          <span className="text-gray-600 font-semibold">{email}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-gray-400">Phone</span>
          <span className="text-gray-600 font-semibold">{phone}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-gray-400">Experience</span>
          <span className="text-gray-600 font-semibold">{experience}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-gray-400">Applied on</span>
          <span className="text-gray-600 font-semibold">{appliedOn}</span>
        </div>
      </div>
      
      <button className="btn-lime w-full mt-4 justify-center bg-green-50 text-green-600 border-none hover:bg-green-100/80 transition-colors">
        <MessageSquare size={14} className="mr-1.5" /> Comments
      </button>
    </Card>
  )
}

/* ─── Event Row ────────────────────────────────────────────────────────── */
export function EventRow({ date, month, title, sub, color = '#C8F04A' }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div
        className="w-11 h-11 rounded-xl border-[1.5px] flex flex-col items-center justify-center shrink-0"
        style={{
          backgroundColor: `${color}15`,
          borderColor: color,
        }}
      >
        <div className="text-[14px] font-extrabold text-gray-900 leading-none">{date}</div>
        <div className="text-[9px] font-bold text-gray-500 uppercase mt-0.5" style={{ color: color }}>{month}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-gray-900 truncate">{title}</div>
        <div className="text-[11px] text-gray-400">{sub}</div>
      </div>
    </div>
  )
}

/* ─── Buttons ──────────────────────────────────────────────────────────── */
export function PrimaryBtn({ children, onClick, style, className = '' }) {
  return (
    <button className={`btn-lime ${className}`} onClick={onClick} style={style}>
      {children}
    </button>
  )
}

export function OutlineBtn({ children, onClick, style, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 py-2.5 px-[22px] bg-white text-gray-950 font-bold text-[14px] rounded-[10px] border-[1.5px] border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer ${className}`}
      style={style}
    >
      {children}
    </button>
  )
}

export function GhostBtn({ children, onClick, style, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 py-2.5 px-[22px] bg-transparent text-gray-500 font-semibold text-[14px] rounded-[10px] border-none hover:bg-gray-100 transition-all duration-200 cursor-pointer ${className}`}
      style={style}
    >
      {children}
    </button>
  )
}

/* ─── Table ────────────────────────────────────────────────────────────── */
export function TableWrap({ children }) {
  return (
    <Card className="p-0 overflow-hidden border border-gray-100">
      {children}
    </Card>
  )
}

export function Th({ children, className = '' }) {
  const defaultAlign = className.includes('text-') ? '' : 'text-left';
  return (
    <th className={`${defaultAlign} py-3.5 px-5 text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.5px] bg-gray-50 border-b border-gray-100 ${className}`}>
      {children}
    </th>
  )
}

export function Td({ children, style, className = '' }) {
  return (
    <td 
      className={`py-3.5 px-5 text-[13px] text-gray-600 border-b border-gray-100 ${className}`}
      style={style}
    >
      {children}
    </td>
  )
}

/* ─── Navigation ───────────────────────────────────────────────────────── */
export function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex bg-gray-100 p-1 rounded-xl">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`py-2 px-4 rounded-lg border-none font-bold text-[13px] cursor-pointer transition-all duration-200 ${
            active === t.id ? 'bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'bg-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

/* ─── Legacy Stat Card (Flat) ─────────────────────────────────────────── */
export function StatCard({ icon, label, value, color, bgColor }) {
  return (
    <Card className="flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[20px]"
        style={{
          backgroundColor: bgColor || '#F3F4F6',
          color: color || '#1F2937'
        }}
      >
        {icon}
      </div>
      <div>
        <div className="text-[12px] font-semibold text-gray-400">{label}</div>
        <div className="text-[20px] font-extrabold text-gray-800">{value}</div>
      </div>
    </Card>
  )
}

/* ─── Section Header ───────────────────────────────────────────────────── */
export function SectionHeader({ title, sub, action }) {
  return (
    <div className="flex justify-between items-end mb-6">
      <div>
        <h2 className="text-[20px] font-extrabold text-gray-900 m-0">{title}</h2>
        {sub && <p className="text-[13px] text-gray-400 m-0 mt-1">{sub}</p>}
      </div>
      <div>{action}</div>
    </div>
  )
}

/* ─── Quick Action Tile ────────────────────────────────────────────────── */
export function QuickActionTile({ icon: Icon, label }) {
  return (
    <div
      className="bg-gray-50 rounded-xl p-4 flex flex-col items-center gap-2.5 cursor-pointer hover:bg-gray-100 transition-all duration-200"
      style={{
        borderRadius: typeof Icon === 'string' ? '12px' : '16px'
      }}
    >
      <div className="text-gray-600">
        {typeof Icon === 'string' ? <span className="text-[20px]">{Icon}</span> : <Icon size={20} />}
      </div>
      <div className="text-[11px] font-bold text-gray-400 text-center">{label}</div>
    </div>
  )
}

/* ─── Chart Tooltip ────────────────────────────────────────────────────── */
export function ChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2.5 px-3.5 border-none rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] text-[12px] min-w-[100px]">
        {label && <div className="font-extrabold text-gray-900 mb-1">{label}</div>}
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2" style={{ color: p.color || '#4B5563' }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
            <span className="font-medium">{p.name}:</span>
            <span className="font-extrabold text-gray-900">{p.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export const StatusBadge = Badge

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Share2, ExternalLink, ChevronRight, FileText, CreditCard, ShieldCheck, HeartHandshake, Network, Briefcase, Users, Calendar, Search, HelpCircle } from 'lucide-react'
import { CANDIDATES } from '../../data/hrmsData'
import { fetchProfile } from '../../redux/actions/authActions'

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
    <div
      className="rounded-[18px] px-[22px] py-5 flex flex-col min-h-[160px] relative overflow-hidden text-white shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
      style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
    >
      {/* Top row: icon + close circle */}
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-xl bg-white/28 flex items-center justify-center">
          <Icon size={20} color="#fff" strokeWidth={2} />
        </div>
        <div className="w-[22px] h-[22px] rounded-full bg-white/25 flex items-center justify-center text-[14px] cursor-pointer text-white font-bold leading-none">×</div>
      </div>

      {/* Bottom row: label left, value right */}
      <div className="mt-auto flex items-end justify-between">
        <div className="text-[13px] font-semibold opacity-90 max-w-[90px] leading-snug">
          {label}
        </div>
        <div className="text-[52px] font-extrabold leading-[0.9] tracking-[-2px]">
          {value}
        </div>
      </div>
    </div>
  )
}

/* ── Event Row with colored date badge ─────────────────────────────────── */
function EventRow({ date, month, title, sub, color }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <div
        className="w-10 h-10 rounded-lg shrink-0 border-[1.5px] flex flex-col items-center justify-center"
        style={{ background: `${color}18`, borderColor: color }}
      >
        <div className="text-[13px] font-extrabold text-[#111827] leading-none">{date}</div>
        <div className="text-[8px] font-bold uppercase" style={{ color: color }}>{month}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-[#111827] truncate">{title}</div>
        <div className="text-[11px] text-[#9CA3AF] truncate">{sub}</div>
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
    <div className="flex items-center gap-2.5">
      <div className="w-[34px] h-[34px] rounded-full shrink-0 bg-gradient-to-br from-[#CBD5E1] to-[#94A3B8] flex items-center justify-center text-[13px] font-bold text-white">{initials}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-[#111827]">{name}</div>
        <div className="text-[11px] text-[#9CA3AF]">{role.split(' ')[0]}</div>
      </div>
      <div
        className="px-2.5 py-[3px] rounded text-[10px] font-bold shrink-0 whitespace-nowrap"
        style={{ background: badge.bg, color: badge.color }}
      >
        {role}
      </div>
    </div>
  )
}

/* ── Quick Action Tile ──────────────────────────────────────────────────── */
function QATile({ icon: Icon, label }) {
  return (
    <div className="bg-[#F9FAFB] rounded-xl px-2.5 py-3.5 flex flex-col items-center gap-2 cursor-pointer transition-colors duration-150 hover:bg-[#F3F4F6]">
      <Icon size={19} color="#6B7280" strokeWidth={1.8} />
      <div className="text-[11px] font-semibold text-[#6B7280] text-center">{label}</div>
    </div>
  )
}

/* ── Card wrapper ──────────────────────────────────────────────────────── */
function Card({ children, style }) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5" style={style}>
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const displayName = user?.fullName || 'Company Admin';
  const displayEmail = user?.email || 'admin@mrmedical.com';
  const displayPhone = user?.phone || '9876543210';
  const displayRole = user?.role?.replace('_', ' ') || 'ADMIN';
  const displayRefCode = user?.adminReferenceCode || 'AD001';

  return (
    <div className="animate-fade">
      {/* ── Welcome Header Card ── */}
      <div className="bg-gradient-to-br from-[#064E3B] to-[#065F46] rounded-[20px] px-[30px] py-6 mb-5 text-white shadow-[0_10px_25px_-5px_rgba(6,78,59,0.3),0_8px_10px_-6px_rgba(6,78,59,0.3)] flex items-center justify-between flex-wrap gap-6 relative overflow-hidden border border-white/8">
        {/* Glowing ambient lights */}
        <div className="absolute -top-[50px] -right-[50px] w-[200px] h-[200px] rounded-full bg-[#C8F04A]/15 blur-[40px] pointer-events-none" />
        <div className="absolute -bottom-[50px] -left-[50px] w-[180px] h-[180px] rounded-full bg-[#10B981]/12 blur-[45px] pointer-events-none" />

        <div className="flex items-center gap-5 z-[1]">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8F04A] to-[#10B981] flex items-center justify-center text-[24px] font-extrabold text-[#064E3B] shadow-[0_4px_14px_rgba(200,240,74,0.4)] border-2 border-white/20">
            {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-xs text-[#A7F3D0] font-bold uppercase tracking-wider mb-1">
              Logged In Session · {displayRole}
            </div>
            <h1 className="text-[24px] font-extrabold text-white m-0 tracking-tight leading-normal">
              {displayName}
            </h1>
            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
              <span className="text-[13px] text-[#D1FAE5] flex items-center gap-1.5">
                📧 {displayEmail}
              </span>
              <span className="text-[13px] text-[#D1FAE5] flex items-center gap-1.5">
                📱 {displayPhone}
              </span>
              <span className="text-[11px] bg-white/10 text-[#F1F5F9] px-2 py-0.5 rounded-md border border-white/15 font-semibold">
                Ref Code: {displayRefCode}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 z-[1]">
          <button className="bg-white/8 border border-white/12 rounded-lg text-white px-4 py-2.5 text-[13px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-white/15">
            System Status
          </button>
          <button className="btn-lime px-5 py-2.5 rounded-lg text-[13px] font-bold cursor-pointer">
            Manager Controls
          </button>
        </div>
      </div>

      {/* ── Info Banner ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl px-5 py-3 flex items-center justify-between mb-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#F3F4F6]">
        <div className="flex items-center gap-2.5">
          <span className="text-base">⚡</span>
          <span className="text-[13px] text-[#374151]">
            <strong className="text-[#111827]">Take Action :</strong> The appraisal cycle is around the corner. Let's get started.
          </span>
        </div>
        <button className="btn-lime text-[13px] px-4 py-2 rounded-lg whitespace-nowrap">
          Send Reminders
        </button>
      </div>

      {/* ── Stat Cards Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Employees" value="289" type="teal"   />
        <StatCard label="On Leave"        value="08"  type="orange" />
        <StatCard label="Hiring Roles"    value="03"  type="coral"  />
        <StatCard label="Requests"        value="28"  type="purple" />
      </div>

      {/* ── Middle Row: Venn + News & Events + Hiring Applications ── */}
      <div className="grid grid-cols-[1fr_1.3fr_1fr] gap-4 mb-4">

        {/* Venn / Location Bubbles */}
        <Card>
          <div className="flex justify-between items-center mb-3">
            <div className="text-[13px] font-bold text-[#111827]">Location</div>
            <ExternalLink size={14} className="cursor-pointer text-[#9CA3AF]" />
          </div>
          <div className="flex items-center justify-center gap-0 relative h-[130px]">
            {/* Bubble cluster */}
            <div className="relative w-40 h-[130px]">
              <div className="absolute w-[90px] h-[90px] rounded-full bg-indigo-500/18 top-0 left-[30px] flex items-center justify-center text-base font-extrabold text-[#4F46E5]">122</div>
              <div className="absolute w-[58px] h-[58px] rounded-full bg-emerald-500/18 bottom-2.5 right-2 flex items-center justify-center text-[13px] font-extrabold text-[#059669]">38</div>
              <div className="absolute w-[46px] h-[46px] rounded-full bg-amber-500/20 bottom-1.25 left-[30px] flex items-center justify-center text-xs font-extrabold text-[#D97706]">27</div>
              <div className="absolute w-[38px] h-[38px] rounded-full bg-red-500/15 top-[30px] left-1.25 flex items-center justify-center text-[11px] font-extrabold text-[#DC2626]">14</div>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {[['#4F46E5','Remote'],['#059669','France'],['#D97706','India'],['#DC2626','USA']].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </Card>

        {/* News & Events */}
        <Card>
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-extrabold text-[#111827]">News & Events</div>
            <ExternalLink size={14} className="cursor-pointer text-[#9CA3AF]" />
          </div>
          <div className="grid grid-cols-2 gap-x-3">
            <EventRow date="03" month="Aug" title="Board Meeting"   sub="Project Meeting"               color="#A78BFA" />
            <EventRow date="29" month="Aug" title="Holiday - India" sub="Holi by GmaxepayHR Team"          color="#10B981" />
            <EventRow date="13" month="Aug" title="New Joinee"      sub="Welcome aboard, Rafi Ansari"   color="#F59E0B" />
            <EventRow date="22" month="Aug" title="New Joinee"      sub="Welcome aboard, Farmers M."    color="#EF4444" />
            <EventRow date="24" month="Aug" title="Work Anniversary" sub="Happy Work Anniversary, Eve…" color="#3B82F6" />
            <EventRow date="21" month="Aug" title="Policy Update"   sub="Travel Reimbursement - V.2.1"  color="#8B5CF6" />
          </div>
        </Card>

        {/* Hiring Applications */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-extrabold text-[#111827]">Hiring Applications</div>
            <button className="flex items-center gap-1 px-3 py-1.25 bg-[#C8F04A] border-0 rounded-lg text-xs font-bold cursor-pointer hover:bg-[#b8e040] transition-colors duration-150">
              <Share2 size={12} /> Share
            </button>
          </div>
          <div className="flex flex-col gap-3.5">
            <HiringRow name="Harper Lee"       role="Creative Lead"      status="processing" />
            <HiringRow name="Francis Degas"    role="Front End Developer" status="selected" />
            <HiringRow name="Leonora Carington" role="Product Manager"   status="processing" />
            <HiringRow name="Andrew Hunt, M"   role="Creative Lead"      status="selected" />
          </div>
        </Card>
      </div>

      {/* ── Bottom Row: Hiring Updates + Quick Actions ───────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Hiring Updates */}
        <Card>
          <div className="text-sm font-extrabold text-[#111827] mb-3.5">Hiring Updates</div>
          <div className="flex flex-col gap-2.5">
            {[
              { label: 'Shortlisted Candidates' },
              { label: 'Upcoming Interviews' },
              { label: 'Rejected Applications' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-[#F9FAFB] rounded-lg cursor-pointer transition-colors duration-150 hover:bg-[#F3F4F6]">
                <span className="text-[13px] font-medium text-[#374151]">{item.label}</span>
                <ChevronRight size={16} className="text-[#C8F04A]" strokeWidth={2.5} />
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div className="text-sm font-extrabold text-[#111827] mb-3.5">Quick Actions</div>
          <div className="grid grid-cols-3 gap-3">
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

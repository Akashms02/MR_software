import React from 'react'
import { ExternalLink, ChevronRight } from 'lucide-react'
import { LEAVE_BALANCE } from '../../data/hrmsData'

/* ── Small Donut Chart (SVG) ─────────────────────────────────────────── */
function DonutChart({ used, total, color }) {
  const remaining = total - used
  const r = 26
  const circ = 2 * Math.PI * r
  const usedDash = (used / total) * circ
  const remDash  = (remaining / total) * circ

  return (
    <svg width="68" height="68" viewBox="0 0 68 68">
      <circle cx="34" cy="34" r={r} fill="none" stroke="#F3F4F6" strokeWidth="7" />
      <circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${usedDash} ${circ - usedDash}`}
        strokeLinecap="round"
        transform="rotate(-90 34 34)"
      />
      <circle cx="34" cy="34" r={r} fill="none" stroke="#E5E7EB" strokeWidth="7"
        strokeDasharray={`${remDash} ${circ - remDash}`}
        strokeLinecap="round"
        transform={`rotate(${(used / total) * 360 - 90} 34 34)`}
      />
    </svg>
  )
}

/* ── Leave Balance Card ───────────────────────────────────────────────── */
function LeaveCard({ label, total, used, color }) {
  const available = total - used
  const bgClass = {
    '#A78BFA': 'bg-[#A78BFA]',
    '#3B82F6': 'bg-[#3B82F6]',
    '#10B981': 'bg-[#10B981]',
    '#F59E0B': 'bg-[#F59E0B]',
  }[color] || 'bg-gray-400'

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-[18px] py-4">
      <div className="text-xs font-bold text-[#111827] mb-3">{label}</div>
      <div className="flex items-center gap-3.5">
        <DonutChart used={used} total={total} color={color} />
        <div className="flex flex-col gap-1">
          <div className="text-[10px] text-[#9CA3AF]">Available</div>
          <div className="text-sm font-extrabold text-[#111827]">{available}</div>
          <div className="text-[10px] text-[#9CA3AF] mt-1">Total</div>
          <div className="text-xs font-bold text-[#374151]">{total}</div>
          <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${bgClass}`} />
            Excused {used}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Leave History Row ─────────────────────────────────────────────────── */
function LeaveHistoryRow({ type, sub, date, status }) {
  const badgeClasses = {
    'Approved': 'bg-[#F0FDF4] text-[#22C55E]',
    'Pending':  'bg-[#FFFBEB] text-[#F59E0B]',
    'Rejected': 'bg-[#FFF1F2] text-[#F43F5E]',
  }[status] || 'bg-[#F3F4F6] text-[#6B7280]'

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#F9FAFB]">
      <div>
        <div className="text-[13px] font-bold text-[#111827]">{type}</div>
        <div className="text-[11px] text-[#9CA3AF]">{sub}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-[11px] text-[#9CA3AF]">{date}</div>
        <div className={`px-3 py-[3px] rounded-md text-[10px] font-bold ${badgeClasses}`}>
          {status}
        </div>
      </div>
    </div>
  )
}

/* ── Calendar Event Row ─────────────────────────────────────────────────── */
function CalendarRow({ dateBg, dateColor, dateText, title, sub, actionLabel, actionColor }) {
  const bgClass = {
    '#F0FDF4': 'bg-[#F0FDF4]',
    '#EFF6FF': 'bg-[#EFF6FF]',
    '#FFF8F0': 'bg-[#FFF8F0]',
    '#FFF1F2': 'bg-[#FFF1F2]',
  }[dateBg] || 'bg-gray-100'

  const textClass = {
    '#22C55E': 'text-[#22C55E]',
    '#3B82F6': 'text-[#3B82F6]',
    '#F59E0B': 'text-[#F59E0B]',
    '#F43F5E': 'text-[#F43F5E]',
  }[dateColor] || 'text-gray-700'

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#F9FAFB]">
      <div className={`w-9 h-9 rounded-xl shrink-0 flex flex-col items-center justify-center ${bgClass}`}>
        <div className={`text-xs font-extrabold ${textClass}`}>{dateText}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-[#111827]">{title}</div>
        <div className="text-[11px] text-[#9CA3AF]">{sub}</div>
      </div>
      {actionLabel && (
        <button className={`px-3 py-1 rounded-md text-[10px] font-bold border-0 cursor-pointer ${actionColor === 'lime' ? 'bg-[#C8F04A] text-[#1A1A1A]' : 'bg-[#FFF1F2] text-[#F43F5E]'}`}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

/* ── Team Leave Calendar ─────────────────────────────────────────────────── */
function TeamCalendar() {
  const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT']
  const dates1 = [1,2,3,4,5,6,7]
  const dates2 = [8,9,10,11,12,13,14]

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 mt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-extrabold text-[#111827]">My Teams' Leave</div>
        <ExternalLink size={14} className="cursor-pointer text-[#9CA3AF]" />
      </div>

      {/* Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-[#9CA3AF] py-1">{d}</div>
        ))}
      </div>

      {/* Week 1 */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dates1.map(d => (
          <div key={d} className="py-2 px-1 text-center text-xs font-medium text-[#374151] rounded-md">{d}</div>
        ))}
      </div>

      {/* Employees on leave */}
      <div className="bg-[#FFF8F0] rounded-xl px-3 py-2 mb-2 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-[#CBD5E1] flex items-center justify-center text-[11px] font-bold text-white">NT</div>
        <div className="flex-1">
          <div className="text-xs font-bold text-[#374151]">Nandor T.R.</div>
          <div className="text-[10px] text-[#9CA3AF]">Front End Developer</div>
        </div>
        <div className="text-[10px] font-bold text-[#F59E0B] bg-[#FFF8E0] px-2 py-0.5 rounded">02 - 04 Aug</div>
      </div>
      <div className="bg-[#F0FDF4] rounded-xl px-3 py-2 mb-2 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-[#CBD5E1] flex items-center justify-center text-[11px] font-bold text-white">HL</div>
        <div className="flex-1">
          <div className="text-xs font-bold text-[#374151]">Harper Lee</div>
          <div className="text-[10px] text-[#9CA3AF]">Creative Lead</div>
        </div>
        <div className="text-[10px] font-bold text-[#22C55E] bg-[#DCFCE7] px-2 py-0.5 rounded">02 - 06 Aug</div>
      </div>

      {/* Week 2 */}
      <div className="grid grid-cols-7 gap-1">
        {dates2.map(d => (
          <div key={d} className="py-2 px-1 text-center text-xs font-medium text-[#374151] rounded-md">{d}</div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   ME > LEAVES PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export default function AdminAttendance() {
  return (
    <div className="animate-fade">

      {/* ── Leave Balance Cards Row ─────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <LeaveCard label="Casual / Sick Leave"  total={10} used={2} color="#A78BFA" />
        <LeaveCard label="Earned Leave"          total={20} used={5} color="#3B82F6" />
        <LeaveCard label="Marriage Leave"        total={5}  used={0} color="#10B981" />
        <LeaveCard label="Holidays this month"   total={4}  used={3} color="#F59E0B" />
      </div>

      {/* ── Middle Row: Leave History + Calendar + Other Leaves ── */}
      <div className="grid grid-cols-[1fr_1fr_220px] gap-4 mb-4">

        {/* Leave History */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-extrabold text-[#111827]">Leave History</div>
            <ExternalLink size={14} className="cursor-pointer text-[#9CA3AF]" />
          </div>
          <LeaveHistoryRow type="Casual / Sick Leave" sub="Medical Emergency"   date="Sep 28, 2023" status="Approved" />
          <LeaveHistoryRow type="Earned Leave"        sub="Travelling to Paris" date="Sep 14, 2023" status="Pending"  />
          <LeaveHistoryRow type="Earned Leave"        sub="Social Leave"        date="Aug 30, 2023" status="Approved" />
          <LeaveHistoryRow type="Earned Leave"        sub="Friend's Wedding"    date="Aug 02, 2023" status="Pending"  />
        </div>

        {/* Leave Calendar */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
          <div className="text-sm font-extrabold text-[#111827] mb-2">Leave Calendar</div>
          <CalendarRow dateBg="#F0FDF4" dateColor="#22C55E" dateText="23 Aug" title="Onam"                       sub="Festive"         actionLabel="Apply Leave" actionColor="lime" />
          <CalendarRow dateBg="#EFF6FF" dateColor="#3B82F6" dateText="30 Aug" title="Earned Leave"               sub="Festive"         actionLabel="Cancel"      actionColor="red"  />
          <CalendarRow dateBg="#FFF8F0" dateColor="#F59E0B" dateText="21 Aug" title="Carnaval des Français"      sub="Holiday this month" actionLabel={null} />
          <CalendarRow dateBg="#FFF1F2" dateColor="#F43F5E" dateText="23 Sep" title="Sick Leave"                 sub="Medical Emergency"  actionLabel="Cancel" actionColor="red" />
        </div>

        {/* Other Leaves */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
          <div className="text-sm font-extrabold text-[#111827] mb-3.5">Other Leaves</div>
          <div className="flex flex-col gap-2">
            {['Bereavement Leave','Maternity Leave','Covid Leave','Paternity Leave','Leave without Pay','Leave Exceptions'].map((l, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#F9FAFB] rounded-lg cursor-pointer transition-colors duration-150 hover:bg-[#F3F4F6]">
                <span className="text-xs font-semibold text-[#374151]">{l}</span>
                <ChevronRight size={14} className="text-[#C8F04A]" strokeWidth={2.5} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Team Calendar ─────────────────────────────────────────── */}
      <TeamCalendar />
    </div>
  )
}

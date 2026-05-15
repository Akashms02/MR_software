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
  return (
    <div style={{ background:'#fff', borderRadius:'14px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', padding:'16px 18px' }}>
      <div style={{ fontSize:'12px', fontWeight:700, color:'#111827', marginBottom:'12px' }}>{label}</div>
      <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
        <DonutChart used={used} total={total} color={color} />
        <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
          <div style={{ fontSize:'10px', color:'#9CA3AF' }}>Available</div>
          <div style={{ fontSize:'14px', fontWeight:800, color:'#111827' }}>{available}</div>
          <div style={{ fontSize:'10px', color:'#9CA3AF', marginTop:'4px' }}>Total</div>
          <div style={{ fontSize:'12px', fontWeight:700, color:'#374151' }}>{total}</div>
          <div style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'10px', color:'#9CA3AF' }}>
            <div style={{ width:'6px',height:'6px',borderRadius:'50%',background:color,flexShrink:0 }} />
            Excused {used}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Leave History Row ─────────────────────────────────────────────────── */
function LeaveHistoryRow({ type, sub, date, status }) {
  const badge = {
    'Approved': { bg:'#F0FDF4', color:'#22C55E' },
    'Pending':  { bg:'#FFFBEB', color:'#F59E0B' },
    'Rejected': { bg:'#FFF1F2', color:'#F43F5E' },
  }[status] || { bg:'#F3F4F6', color:'#6B7280' }

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #F9FAFB' }}>
      <div>
        <div style={{ fontSize:'13px', fontWeight:700, color:'#111827' }}>{type}</div>
        <div style={{ fontSize:'11px', color:'#9CA3AF' }}>{sub}</div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        <div style={{ fontSize:'11px', color:'#9CA3AF' }}>{date}</div>
        <div style={{ padding:'3px 12px', borderRadius:'6px', fontSize:'10px', fontWeight:700, background:badge.bg, color:badge.color }}>
          {status}
        </div>
      </div>
    </div>
  )
}

/* ── Calendar Event Row ─────────────────────────────────────────────────── */
function CalendarRow({ dateBg, dateColor, dateText, title, sub, actionLabel, actionColor }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'1px solid #F9FAFB' }}>
      <div style={{
        width:'36px', height:'36px', borderRadius:'10px', flexShrink:0,
        background: dateBg, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center'
      }}>
        <div style={{ fontSize:'12px', fontWeight:800, color: dateColor }}>{dateText}</div>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'12px', fontWeight:700, color:'#111827' }}>{title}</div>
        <div style={{ fontSize:'11px', color:'#9CA3AF' }}>{sub}</div>
      </div>
      {actionLabel && (
        <button style={{
          padding:'4px 12px', borderRadius:'6px', fontSize:'10px', fontWeight:700,
          background: actionColor === 'lime' ? '#C8F04A' : '#FFF1F2',
          color: actionColor === 'lime' ? '#1A1A1A' : '#F43F5E',
          border:'none', cursor:'pointer'
        }}>
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
    <div style={{ background:'#fff', borderRadius:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', padding:'20px', marginTop:'16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <div style={{ fontSize:'14px', fontWeight:800, color:'#111827' }}>My Teams' Leave</div>
        <ExternalLink size={14} color="#9CA3AF" style={{ cursor:'pointer' }} />
      </div>

      {/* Header */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px', marginBottom:'8px' }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:'10px', fontWeight:700, color:'#9CA3AF', padding:'4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Week 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px', marginBottom:'4px' }}>
        {dates1.map(d => (
          <div key={d} style={{ padding:'8px 4px', textAlign:'center', fontSize:'12px', fontWeight:500, color:'#374151', borderRadius:'6px' }}>{d}</div>
        ))}
      </div>

      {/* Employees on leave */}
      <div style={{ background:'#FFF8F0', borderRadius:'10px', padding:'8px 12px', marginBottom:'8px', display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ width:'28px',height:'28px',borderRadius:'50%',background:'#CBD5E1',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:'#fff' }}>NT</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'12px', fontWeight:700, color:'#374151' }}>Nandor T.R.</div>
          <div style={{ fontSize:'10px', color:'#9CA3AF' }}>Front End Developer</div>
        </div>
        <div style={{ fontSize:'10px', fontWeight:700, color:'#F59E0B', background:'#FFF8E0', padding:'2px 8px', borderRadius:'4px' }}>02 - 04 Aug</div>
      </div>
      <div style={{ background:'#F0FDF4', borderRadius:'10px', padding:'8px 12px', marginBottom:'8px', display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ width:'28px',height:'28px',borderRadius:'50%',background:'#CBD5E1',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:'#fff' }}>HL</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'12px', fontWeight:700, color:'#374151' }}>Harper Lee</div>
          <div style={{ fontSize:'10px', color:'#9CA3AF' }}>Creative Lead</div>
        </div>
        <div style={{ fontSize:'10px', fontWeight:700, color:'#22C55E', background:'#DCFCE7', padding:'2px 8px', borderRadius:'4px' }}>02 - 06 Aug</div>
      </div>

      {/* Week 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px' }}>
        {dates2.map(d => (
          <div key={d} style={{ padding:'8px 4px', textAlign:'center', fontSize:'12px', fontWeight:500, color:'#374151', borderRadius:'6px' }}>{d}</div>
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
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'20px' }}>
        <LeaveCard label="Casual / Sick Leave"  total={10} used={2} color="#A78BFA" />
        <LeaveCard label="Earned Leave"          total={20} used={5} color="#3B82F6" />
        <LeaveCard label="Marriage Leave"        total={5}  used={0} color="#10B981" />
        <LeaveCard label="Holidays this month"   total={4}  used={3} color="#F59E0B" />
      </div>

      {/* ── Middle Row: Leave History + Calendar + Other Leaves ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 220px', gap:'16px', marginBottom:'16px' }}>

        {/* Leave History */}
        <div style={{ background:'#fff', borderRadius:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', padding:'20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
            <div style={{ fontSize:'14px', fontWeight:800, color:'#111827' }}>Leave History</div>
            <ExternalLink size={14} color="#9CA3AF" style={{ cursor:'pointer' }} />
          </div>
          <LeaveHistoryRow type="Casual / Sick Leave" sub="Medical Emergency"   date="Sep 28, 2023" status="Approved" />
          <LeaveHistoryRow type="Earned Leave"        sub="Travelling to Paris" date="Sep 14, 2023" status="Pending"  />
          <LeaveHistoryRow type="Earned Leave"        sub="Social Leave"        date="Aug 30, 2023" status="Approved" />
          <LeaveHistoryRow type="Earned Leave"        sub="Friend's Wedding"    date="Aug 02, 2023" status="Pending"  />
        </div>

        {/* Leave Calendar */}
        <div style={{ background:'#fff', borderRadius:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', padding:'20px' }}>
          <div style={{ fontSize:'14px', fontWeight:800, color:'#111827', marginBottom:'8px' }}>Leave Calendar</div>
          <CalendarRow dateBg="#F0FDF4" dateColor="#22C55E" dateText="23 Aug" title="Onam"                       sub="Festive"         actionLabel="Apply Leave" actionColor="lime" />
          <CalendarRow dateBg="#EFF6FF" dateColor="#3B82F6" dateText="30 Aug" title="Earned Leave"               sub="Festive"         actionLabel="Cancel"      actionColor="red"  />
          <CalendarRow dateBg="#FFF8F0" dateColor="#F59E0B" dateText="21 Aug" title="Carnaval des Français"      sub="Holiday this month" actionLabel={null} />
          <CalendarRow dateBg="#FFF1F2" dateColor="#F43F5E" dateText="23 Sep" title="Sick Leave"                 sub="Medical Emergency"  actionLabel="Cancel" actionColor="red" />
        </div>

        {/* Other Leaves */}
        <div style={{ background:'#fff', borderRadius:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', padding:'20px' }}>
          <div style={{ fontSize:'14px', fontWeight:800, color:'#111827', marginBottom:'14px' }}>Other Leaves</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {['Bereavement Leave','Maternity Leave','Covid Leave','Paternity Leave','Leave without Pay','Leave Exceptions'].map((l, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'9px 12px', background:'#F9FAFB', borderRadius:'8px', cursor:'pointer'
              }}>
                <span style={{ fontSize:'12px', fontWeight:600, color:'#374151' }}>{l}</span>
                <ChevronRight size={14} color="#C8F04A" strokeWidth={2.5} />
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

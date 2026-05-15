import React from 'react'
import { Card, SectionHeader, OutlineBtn } from '../../components/ui'

/* ── Small Donut Chart (SVG) ─────────────────────────────────────────── */
function DonutChart({ used, total, color }) {
  const remaining = total - used
  const r = 26
  const circ = 2 * Math.PI * r
  const usedDash = (used / total) * circ
  
  return (
    <svg width="68" height="68" viewBox="0 0 68 68">
      <circle cx="34" cy="34" r={r} fill="none" stroke="#F3F4F6" strokeWidth="7" />
      <circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${usedDash} ${circ - usedDash}`}
        strokeLinecap="round"
        transform="rotate(-90 34 34)"
      />
    </svg>
  )
}

function LeaveCard({ label, total, used, color }) {
  return (
    <Card style={{ padding: '16px 18px' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <DonutChart used={used} total={total} color={color} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Available</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>{total - used}</div>
          <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>Total</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>{total}</div>
        </div>
      </div>
    </Card>
  )
}

export default function AttendanceLeave() {
  return (
    <div className="animate-fade">
      <SectionHeader 
        title="Me > Leaves" 
        sub="Your leave balance and history"
      />

      {/* Leave Balance Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <LeaveCard label="Casual / Sick Leave" total={10} used={2} color="#A78BFA" />
        <LeaveCard label="Earned Leave"         total={20} used={5} color="#3B82F6" />
        <LeaveCard label="Marriage Leave"       total={5}  used={0} color="#10B981" />
        <LeaveCard label="Holidays this month"  total={4}  used={3} color="#F59E0B" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.8fr', gap: '20px' }}>
        
        {/* Leave History */}
        <Card>
           <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '20px' }}>Leave History</div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { type: 'Casual / Sick Leave', reason: 'Medical Emergency', date: 'Sep 28, 2023', status: 'Approved', color: '#22C55E' },
                { type: 'Earned Leave', reason: 'Travelling to Paris', date: 'Sep 14, 2023', status: 'Pending', color: '#F59E0B' },
                { type: 'Earned Leave', reason: 'Social Leave', date: 'Aug 30, 2023', status: 'Approved', color: '#22C55E' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #F3F4F6' }}>
                   <div>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>{l.type}</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{l.reason}</div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>{l.date}</div>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: l.color, background: `${l.color}15`, padding: '2px 8px', borderRadius: '4px' }}>{l.status}</span>
                   </div>
                </div>
              ))}
           </div>
        </Card>

        {/* Leave Calendar */}
        <Card>
           <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '20px' }}>Leave Calendar</div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { date: '23 Aug', name: 'Onam', type: 'Festive', action: 'Apply Leave', btn: '#C8F04A' },
                { date: '30 Aug', name: 'Earned Leave', type: 'Personal', action: 'Cancel', btn: '#FEE2E2', txt: '#F43F5E' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '12px', borderBottom: '1px solid #F3F4F6' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>{item.date}</div>
                   <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{item.type}</div>
                   </div>
                   <button style={{ padding: '6px 12px', borderRadius: '8px', background: item.btn, border: 'none', color: item.txt || '#111827', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}>{item.action}</button>
                </div>
              ))}
           </div>
        </Card>

        {/* Other Leaves */}
        <Card>
           <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '20px' }}>Other Leaves</div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Bereavement Leave', 'Maternity Leave', 'Covid Leave', 'Paternity Leave', 'Leave without Pay'].map(l => (
                <div key={l} style={{ padding: '12px', background: '#F9FAFB', borderRadius: '10px', fontSize: '12px', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                   {l} <span style={{ color: '#C8F04A' }}>›</span>
                </div>
              ))}
           </div>
        </Card>

      </div>
    </div>
  )
}

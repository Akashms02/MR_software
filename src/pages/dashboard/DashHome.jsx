
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Card, SectionHeader, StatCardGradient, InfoBanner, QuickActionTile, ChartTooltip } from '../../components/ui'
import { EMPLOYEES } from './data'

const STAT_CONFIGS = [
  { label: 'Total Employees', type: 'teal',   value: 289 },
  { label: 'On Leave Today',  type: 'orange', value: 8   },
  { label: 'Hiring Roles',    type: 'coral',  value: 3   },
  { label: 'Pending Requests',type: 'purple', value: 28  }
]

const QUICK_ACTIONS = [
  { label: 'Payroll',    icon: '💰' },
  { label: 'Attendance', icon: '📅' },
  { label: 'Hiring',     icon: '👥' },
  { label: 'Reports',    icon: '📊' },
  { label: 'Settings',   icon: '⚙️' },
  { label: 'Support',    icon: '🎧' }
]

const VENN_DATA = [
  { name: 'Remote', value: 14,  color: '#A78BFA' },
  { name: 'Office', value: 122, color: '#3B82F6' },
  { name: 'Hybrid', value: 27,  color: '#F59E0B' },
  { name: 'On Site',value: 38,  color: '#10B981' }
]

export default function DashHome({ role, setActive }) {
  return (
    <div className="animate-fade">
      
      {/* ── Top Alert Banner ─────────────────────────── */}
      <InfoBanner 
        text="The appraisal cycle is around the corner. Let's get started."
        actionLabel="Send Reminders"
        onAction={() => alert('Reminders sent!')}
      />

      {/* ── Stat Cards ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {STAT_CONFIGS.map((s, i) => (
          <StatCardGradient key={i} {...s} />
        ))}
      </div>

      {/* ── Mid Row: Charts & Lists ──────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Venn Visualization Placeholder */}
        <Card>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800 }}>Location</span>
              <span style={{ fontSize: '12px', cursor: 'pointer', opacity: 0.5 }}>◱</span>
           </div>
           <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {/* Venn Circles - CSS implementation */}
              <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                 <div style={{ position: 'absolute', top: '10%', left: '10%', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(59,130,246,0.2)', border: '2px solid #3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#1E40AF' }}>122</div>
                 <div style={{ position: 'absolute', top: '40%', right: '0%', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.2)', border: '2px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#065F46' }}>38</div>
                 <div style={{ position: 'absolute', bottom: '10%', left: '20%', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(245,158,11,0.2)', border: '2px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#92400E' }}>27</div>
              </div>
           </div>
           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px' }}>
              {VENN_DATA.map(v => (
                <div key={v.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600 }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: v.color }} />
                   {v.name}
                </div>
              ))}
           </div>
        </Card>

        {/* News & Events */}
        <Card>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800 }}>News & Events</span>
              <span style={{ fontSize: '12px', cursor: 'pointer', opacity: 0.5 }}>◱</span>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { date: '03', month: 'Aug', title: 'Board Meeting', sub: 'Project Meeting', color: '#8B5CF6' },
                { date: '13', month: 'Aug', title: 'New Joinee', sub: 'Welcome aboard, Rafi Ansari', color: '#F59E0B' },
                { date: '24', month: 'Aug', title: 'Work Anniversary', sub: 'Happy Work Anniversary, Eve...', color: '#3B82F6' },
                { date: '29', month: 'Aug', title: 'Holiday - India', sub: 'Holi by GreenHR Team', color: '#10B981' },
              ].map((ev, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${ev.color}15`, border: `1.5px solid ${ev.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{ev.date}</div>
                      <div style={{ fontSize: '8px', fontWeight: 700, color: ev.color, textTransform: 'uppercase' }}>{ev.month}</div>
                   </div>
                   <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{ev.title}</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.sub}</div>
                   </div>
                </div>
              ))}
           </div>
        </Card>

        {/* Hiring Applications */}
        <Card>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800 }}>Hiring Applications</span>
              <button style={{ padding: '6px 12px', borderRadius: '8px', background: '#C8F04A', border: 'none', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>🔗 Share</button>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { name: 'Harper Lee', role: 'Creative Lead', color: '#3B82F6' },
                { name: 'Francis Degas', role: 'Front End Developer', color: '#10B981' },
                { name: 'Leonora Carington', role: 'Product Manager', color: '#F59E0B' },
                { name: 'Andrew Hunt, M', role: 'Creative Lead', color: '#3B82F6' },
              ].map((app, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', color: '#6B7280' }}>
                      {app.name.split(' ').map(n => n[0]).join('')}
                   </div>
                   <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{app.name}</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{app.role.split(' ')[0]}</div>
                   </div>
                   <span style={{ fontSize: '10px', fontWeight: 700, color: app.color, background: `${app.color}15`, padding: '2px 8px', borderRadius: '4px' }}>{app.role}</span>
                </div>
              ))}
           </div>
        </Card>
      </div>

      {/* ── Bottom Row: Quick Actions ────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
         <Card>
            <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '20px' }}>Hiring Updates</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
               {['Shortlisted Candidates', 'Upcoming Interviews', 'Rejected Applications', 'Review Reminders'].map(item => (
                 <div key={item} style={{ padding: '14px', background: '#F9FAFB', borderRadius: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{item}</span>
                    <span style={{ color: '#C8F04A', fontWeight: 800 }}>›</span>
                 </div>
               ))}
            </div>
         </Card>

         <Card>
            <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '20px' }}>Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
               {QUICK_ACTIONS.map(q => (
                 <QuickActionTile key={q.label} icon={q.icon} label={q.label} />
               ))}
            </div>
         </Card>
      </div>
    </div>
  )
}

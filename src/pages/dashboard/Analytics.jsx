import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'
import { HEADCOUNT_TREND, GENDER_RATIO, ATTRITION_DEPT, EMPLOYEES } from './data'
import { Card, SectionHeader } from '../../components/ui'
import { COLORS } from './colors'

const C = COLORS

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#07131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
      <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }}>{p.name || p.dataKey}: <strong>{p.value}</strong></div>
      ))}
    </div>
  )
}

const KPI_TILES = [
  { label: 'Avg Tenure',        value: '2.8 yrs',  icon: '📅', color: C.teal,    sub: 'Across all departments' },
  { label: 'High Performers',   value: '33%',       icon: '⭐', color: C.pink,    sub: '5 of 15 employees'      },
  { label: 'Turnover Rate',     value: '12.5%',     icon: '🔄', color: '#fb923c', sub: 'Last 12 months'         },
  { label: 'Open Positions',    value: '3',         icon: '📋', color: '#a78bfa', sub: 'Hiring in progress'     },
]

// Dept‐wise attrition
const DEPT_ATTRITION = ATTRITION_DEPT.map(d => ({ ...d, fill: d.rate > 12 ? C.pink : d.rate > 8 ? '#fb923c' : C.teal }))

export default function Analytics() {
  const female = EMPLOYEES.filter(e => e.gender === 'F').length
  const male   = EMPLOYEES.filter(e => e.gender === 'M').length

  return (
    <div>
      <SectionHeader title="HR Analytics" sub="Workforce insights & trends for GreenHR Pharma" />

      {/* KPI Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        {KPI_TILES.map(t => (
          <Card key={t.label} style={{ padding: '18px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: `${t.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', marginBottom: '12px',
            }}>{t.icon}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '26px', fontWeight: 800, color: t.color, marginBottom: '4px' }}>{t.value}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: C.text, marginBottom: '3px' }}>{t.label}</div>
            <div style={{ fontSize: '11px', color: C.dim }}>{t.sub}</div>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Headcount Line */}
        <Card style={{ padding: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>📈 Headcount Trend (12 Months)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={HEADCOUNT_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} domain={[8, 17]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" name="Headcount" stroke={C.teal} strokeWidth={2.5} dot={{ fill: C.teal, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Gender Donut */}
        <Card style={{ padding: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>👥 Gender Ratio</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={[{ name: 'Male', value: male, color: C.teal }, { name: 'Female', value: female, color: C.pink }]}
                cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value">
                {[C.teal, C.pink].map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px' }}>
            {[{ label: 'Male', val: male, color: C.teal }, { label: 'Female', val: female, color: C.pink }].map(g => (
              <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: g.color }} />
                <span style={{ color: C.muted }}>{g.label}</span>
                <span style={{ color: C.text, fontWeight: 700 }}>{g.val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Attrition Bar */}
        <Card style={{ padding: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>📉 Dept-wise Attrition Rate (%)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DEPT_ATTRITION} layout="vertical" barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="dept" type="category" tick={{ fill: C.muted, fontSize: 10 }} width={120} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rate" name="Attrition %" radius={[0,4,4,0]}>
                {DEPT_ATTRITION.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Summary table */}
        <Card style={{ padding: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>📋 Department Summary</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Department', 'Headcount', 'Avg Salary', 'Attrition'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 600, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.7px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['Medical Affairs','Clinical Research','Regulatory','Manufacturing','QA/QC','Sales & Marketing','HR','Finance','IT'].map(dept => {
                const emps = EMPLOYEES.filter(e => e.dept === dept)
                const avg = emps.length ? Math.round(emps.reduce((s, e) => s + e.salary, 0) / emps.length) : 0
                const att = ATTRITION_DEPT.find(a => a.dept === dept)?.rate || 0
                return (
                  <tr key={dept}>
                    <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px', color: C.text, fontWeight: 500 }}>{dept}</td>
                    <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px', color: C.teal, fontWeight: 600 }}>{emps.length}</td>
                    <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px', color: C.muted }}>₹{avg.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '9px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px', color: att > 12 ? C.pink : att > 8 ? '#fb923c' : '#4ade80', fontWeight: 600 }}>{att}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}

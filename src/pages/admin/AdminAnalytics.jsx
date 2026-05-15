import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { EMPLOYEES, HEADCOUNT_TREND, ATTRITION_DEPT, DEPARTMENTS } from '../../data/hrmsData'
import { Card, SectionHeader, StatCard, ChartTooltip } from '../../components/ui'

const GENDER_DATA = [
  { name: 'Male',   value: EMPLOYEES.filter(e => e.gender === 'M').length, color: '#16a34a' },
  { name: 'Female', value: EMPLOYEES.filter(e => e.gender === 'F').length, color: '#db2777' },
]

export default function AdminAnalytics() {
  return (
    <div>
      <SectionHeader
        title="HR Analytics"
        sub="Workforce insights and trends for GreenHR Pharma"
      />

      {/* KPI Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        <StatCard icon="📅" label="Avg Tenure"      value="2.8 yrs" sub="Across all departments" color="#16a34a"  />
        <StatCard icon="⭐" label="High Performers" value="33%"      sub="5 of 15 employees"      color="#d97706" bgColor="#fef3c7" />
        <StatCard icon="🔄" label="Turnover Rate"   value="12.5%"    sub="Last 12 months"         color="#dc2626" bgColor="#fee2e2" />
        <StatCard icon="📋" label="Open Positions"  value="3"        sub="Hiring in progress"      color="#7c3aed" bgColor="#ede9fe" />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Headcount line */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '4px' }}>Headcount Trend</div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px' }}>Last 12 months</div>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={HEADCOUNT_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} domain={[8,17]} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="count" name="Headcount" stroke="#16a34a" strokeWidth={2.5}
                dot={{ fill: '#16a34a', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Gender donut */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '4px' }}>Gender Ratio</div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>Total {EMPLOYEES.length} employees</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={GENDER_DATA} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value">
                {GENDER_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px' }}>
            {GENDER_DATA.map(g => (
              <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: g.color }} />
                <span style={{ color: '#6b7280' }}>{g.name}</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>{g.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Attrition bar */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '4px' }}>Dept-wise Attrition (%)</div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px' }}>Last 12 months</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ATTRITION_DEPT} layout="vertical" barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="dept" type="category" tick={{ fill: '#6b7280', fontSize: 10 }} width={120} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="rate" name="Attrition %" radius={[0,4,4,0]}>
                {ATTRITION_DEPT.map((d, i) => <Cell key={i} fill={d.rate > 12 ? '#dc2626' : d.rate > 8 ? '#d97706' : '#16a34a'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Summary table */}
        <Card style={{ padding: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '16px' }}>Department Summary</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Department','Count','Avg Salary','Attrition'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'left', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEPARTMENTS.map(dept => {
                const emps = EMPLOYEES.filter(e => e.dept === dept)
                const avg  = emps.length ? Math.round(emps.reduce((s, e) => s + e.salary, 0) / emps.length) : 0
                const att  = ATTRITION_DEPT.find(a => a.dept === dept)?.rate || 0
                return (
                  <tr key={dept}
                    style={{ transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 10px', borderBottom: '1px solid #f9fafb', fontSize: '12px', color: '#374151', fontWeight: 500 }}>{dept}</td>
                    <td style={{ padding: '10px 10px', borderBottom: '1px solid #f9fafb', fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>{emps.length}</td>
                    <td style={{ padding: '10px 10px', borderBottom: '1px solid #f9fafb', fontSize: '12px', color: '#6b7280' }}>₹{avg.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px 10px', borderBottom: '1px solid #f9fafb', fontSize: '12px', fontWeight: 700, color: att > 12 ? '#dc2626' : att > 8 ? '#d97706' : '#16a34a' }}>{att}%</td>
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

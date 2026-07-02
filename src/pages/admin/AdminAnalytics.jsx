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
        sub="Workforce insights and trends for GmaxepayHR Pharma"
      />

      {/* KPI Tiles */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard icon="📅" label="Avg Tenure"      value="2.8 yrs" sub="Across all departments" color="#16a34a"  />
        <StatCard icon="⭐" label="High Performers" value="33%"      sub="5 of 15 employees"      color="#d97706" bgColor="#fef3c7" />
        <StatCard icon="🔄" label="Turnover Rate"   value="12.5%"    sub="Last 12 months"         color="#dc2626" bgColor="#fee2e2" />
        <StatCard icon="📋" label="Open Positions"  value="3"        sub="Hiring in progress"      color="#7c3aed" bgColor="#ede9fe" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-[2fr_1fr] gap-4 mb-4">
        {/* Headcount line */}
        <Card>
          <div className="font-bold text-sm text-[#111827] mb-1">Headcount Trend</div>
          <div className="text-xs text-[#9ca3af] mb-4">Last 12 months</div>
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
          <div className="font-bold text-sm text-[#111827] mb-1">Gender Ratio</div>
          <div className="text-xs text-[#9ca3af] mb-3">Total {EMPLOYEES.length} employees</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={GENDER_DATA} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value">
                {GENDER_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 mt-2">
            {GENDER_DATA.map(g => (
              <div key={g.name} className="flex items-center gap-1.25 text-xs">
                <div className={`w-2 h-2 rounded-full ${g.name === 'Male' ? 'bg-[#16a34a]' : 'bg-[#db2777]'}`} />
                <span className="text-[#6b7280]">{g.name}</span>
                <span className="font-bold text-[#111827]">{g.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Attrition bar */}
        <Card>
          <div className="font-bold text-sm text-[#111827] mb-1">Dept-wise Attrition (%)</div>
          <div className="text-xs text-[#9ca3af] mb-4">Last 12 months</div>
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
        <Card className="p-5">
          <div className="font-bold text-sm text-[#111827] mb-4">Department Summary</div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Department','Count','Avg Salary','Attrition'].map(h => (
                  <th key={h} className="px-2.5 py-2 text-[11px] font-semibold text-[#9ca3af] uppercase tracking-[0.6px] text-left border-b border-[#f3f4f6]">{h}</th>
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
                    className="transition-colors duration-150 hover:bg-[#f9fafb]"
                  >
                    <td className="px-2.5 py-2 border-b border-[#f9fafb] text-xs text-[#374151] font-medium">{dept}</td>
                    <td className="px-2.5 py-2 border-b border-[#f9fafb] text-xs text-[#16a34a] font-bold">{emps.length}</td>
                    <td className="px-2.5 py-2 border-b border-[#f9fafb] text-xs text-[#6b7280]">₹{avg.toLocaleString('en-IN')}</td>
                    <td className={`px-2.5 py-2 border-b border-[#f9fafb] text-xs font-bold ${
                      att > 12 ? 'text-[#dc2626]' : att > 8 ? 'text-[#d97706]' : 'text-[#16a34a]'
                    }`}>{att}%</td>
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

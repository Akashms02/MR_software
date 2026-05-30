import { COMPLIANCE_STATUS } from '../../data/hrmsData'
import { Card, SectionHeader, StatCard } from '../../components/ui'

const DUE_CALENDAR = [
  { date: 'May 07', event: 'TDS Payment (Apr)',     status: 'Filed' },
  { date: 'May 15', event: 'PF Challan (Apr)',      status: 'Filed' },
  { date: 'May 15', event: 'ESI Challan (Apr)',     status: 'Filed' },
  { date: 'May 31', event: 'PT Return (Q4)',        status: 'Due' },
  { date: 'May 31', event: 'LWF Contribution',     status: 'Due' },
  { date: 'Jun 07', event: 'TDS Payment (May)',     status: 'Upcoming' },
  { date: 'Jun 15', event: 'PF Challan (May)',      status: 'Upcoming' },
  { date: 'Jun 30', event: 'PF Annual Return',      status: 'Upcoming' },
]

const STATUS_STYLES = {
  Filed: {
    bgClass: 'bg-[#f0fdf4]',
    borderClass: 'border-[#bbf7d0]',
    textClass: 'text-[#16a34a]'
  },
  Due: {
    bgClass: 'bg-[#fef9ee]',
    borderClass: 'border-[#fde68a]',
    textClass: 'text-[#d97706]'
  },
  Upcoming: {
    bgClass: 'bg-[#f9fafb]',
    borderClass: 'border-[#e5e7eb]',
    textClass: 'text-[#6b7280]'
  }
}

export default function AdminCompliance() {
  return (
    <div>
      <SectionHeader
        title="Statutory Compliance"
        sub="PF · ESI · TDS · Labour Law — All filings up to date for May 2026"
      />

      {/* Compliance Status Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {COMPLIANCE_STATUS.map((c, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-[38px] h-[38px] rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[18px]">✅</div>
              <span className="px-2.5 py-[3px] rounded-full bg-[#dcfce7] border border-[#bbf7d0] text-[#16a34a] text-[11px] font-bold">Compliant</span>
            </div>
            <div className="font-bold text-[14px] text-[#111827] mb-1">{c.label}</div>
            <div className="text-[12px] text-[#9ca3af] mb-2.5">{c.sub}</div>
            <div className="text-[12px] text-[#6b7280] mb-1.5">Due: <span className="text-[#374151] font-semibold">{c.due}</span></div>
            <div className="text-[16px] font-extrabold text-[#16a34a]">{c.amount}</div>
          </Card>
        ))}
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard icon="🏦" label="PF Registered"   value="₹1,84,500" sub="Apr 2026 · UAN Filed"   color="#16a34a" />
        <StatCard icon="🏥" label="ESI Registered"  value="₹62,400"   sub="Apr 2026 · Filed"       color="#0891b2" bgColor="#e0f2fe" />
        <StatCard icon="📄" label="TDS Deducted"    value="₹94,200"   sub="Form 24Q Filed"         color="#7c3aed" bgColor="#ede9fe" />
        <StatCard icon="⚖️" label="PT / LWF"        value="₹21,950"   sub="All States Filed"       color="#d97706" bgColor="#fef3c7" />
      </div>

      {/* Filing Calendar */}
      <Card className="p-6">
        <div className="font-bold text-[15px] text-[#111827] mb-[18px]">📅 Compliance Filing Calendar</div>
        <div className="flex flex-col gap-2">
          {DUE_CALENDAR.map((item, i) => {
            const styleObj = STATUS_STYLES[item.status] || STATUS_STYLES.Upcoming;
            return (
              <div key={i} className={`flex items-center gap-4 px-4 py-3 rounded-lg border transition-transform duration-100 hover:translate-x-1 ${styleObj.bgClass} ${styleObj.borderClass}`}>
                <div className={`w-[72px] shrink-0 text-xs font-bold ${styleObj.textClass}`}>{item.date}</div>
                <div className="flex-1 text-[13px] text-[#374151] font-medium">{item.event}</div>
                <div className={`px-3 py-[3px] rounded-full border text-[11px] font-bold ${styleObj.bgClass} ${styleObj.borderClass} ${styleObj.textClass}`}>
                  {item.status === 'Filed' ? '✓ Filed' : item.status === 'Due' ? '⏰ Due Soon' : '📅 Upcoming'}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

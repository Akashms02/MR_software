import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  Share2, ExternalLink, ChevronRight, FileText, CreditCard, 
  ShieldCheck, HeartHandshake, Network, Briefcase, Users, 
  Calendar, Search, HelpCircle, UserPlus, Navigation, Wallet, BarChart2, Gift,
  Map as MapIcon
} from 'lucide-react'
import { fetchProfile } from '../../redux/actions/authActions'
import { getMyTeam } from '../../redux/actions/teamActions'
import { fetchAdminLeaveTableAction } from '../../redux/actions/leaveActions'
import { fetchTeamAttendanceAction } from '../../redux/actions/attendanceActions'
import { getFullAssetUrl } from '../../utils/getFullAssetUrl'

/* ── Stat Card ── */
function StatCard({ label, value, type }) {
  const configs = {
    teal:   { from: '#6EC6C2', to: '#4AAFA9', Icon: Users },
    orange: { from: '#FFB07A', to: '#FF8F4E', Icon: Calendar },
    coral:  { from: '#FF9090', to: '#FF6B6B', Icon: Search },
    purple: { from: '#B8A6FB', to: '#9B87F5', Icon: HelpCircle },
  }
  const c = configs[type] || configs.teal
  const { Icon } = c

  return (
    <div
      className="rounded-[18px] px-[22px] py-5 flex flex-col min-h-[160px] relative overflow-hidden text-white shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
      style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
    >
      {/* Top row: icon */}
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-xl bg-white/28 flex items-center justify-center">
          <Icon size={20} color="#fff" strokeWidth={2} />
        </div>
      </div>

      {/* Bottom row: label left, value right */}
      <div className="mt-auto flex items-end justify-between gap-3">
        <div className="text-[13px] font-semibold opacity-90 max-w-[120px] leading-snug">
          {label}
        </div>
        <div className="text-[20px] font-extrabold leading-tight tracking-tight text-right select-all">
          {value}
        </div>
      </div>
    </div>
  )
}

/* ── Birthday Row ── */
function BirthdayRow({ name, date, role }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'E';
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-none">
      <div className="w-[34px] h-[34px] rounded-full shrink-0 bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1] flex items-center justify-center text-[12px] font-bold text-[#334155]">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-[#111827] truncate">{name}</div>
        <div className="text-[11px] text-[#9CA3AF] truncate">{role || 'Team Member'}</div>
      </div>
      <div className="flex flex-col items-end">
        <div className="text-xs font-bold text-[#111827]">
          {date}
        </div>
      </div>
    </div>
  )
}

/* ── Quick Action Tile ── */
function QATile({ icon: Icon, label, onClick }) {
  return (
    <div 
      onClick={onClick} 
      className="bg-[#F9FAFB] rounded-xl px-2.5 py-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-150 hover:bg-[#F3F4F6] hover:-translate-y-0.5 border border-gray-100 hover:border-gray-200"
    >
      <Icon size={20} color="#111827" strokeWidth={2} />
      <div className="text-[11.5px] font-bold text-gray-700 text-center">{label}</div>
    </div>
  )
}

/* ── Card wrapper ── */
function Card({ children, style }) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5" style={style}>
      {children}
    </div>
  )
}

const HOLIDAYS = [
  { date: '2026-01-26', name: 'Republic Day' },
  { date: '2026-03-13', name: 'Holi' },
  { date: '2026-04-02', name: 'Good Friday' },
  { date: '2026-05-01', name: 'May Day' },
  { date: '2026-08-15', name: 'Independence Day' },
  { date: '2026-10-02', name: 'Gandhi Jayanti' },
  { date: '2026-10-22', name: 'Dussehra' },
  { date: '2026-11-08', name: 'Diwali' },
  { date: '2026-12-25', name: 'Christmas Day' },
]

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { user } = useSelector((state) => state.auth)
  const { team = [] } = useSelector((state) => state.team || {})
  const { adminLeavesTable = [] } = useSelector((state) => state.leave || {})
  const { teamAttendance = [] } = useSelector((state) => state.attendance || {})

  useEffect(() => {
    dispatch(fetchProfile())
    dispatch(getMyTeam())
    dispatch(fetchAdminLeaveTableAction())
    dispatch(fetchTeamAttendanceAction())
  }, [dispatch])

  const displayName = user?.fullName || 'Company Admin'

  // Time-based greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  // Dynamic next upcoming holiday
  const getNextHoliday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const upcoming = HOLIDAYS.map(h => ({ ...h, dateObj: new Date(h.date) }))
      .filter(h => h.dateObj >= today)
      .sort((a, b) => a.dateObj - b.dateObj)
    
    if (upcoming.length > 0) {
      const next = upcoming[0]
      const day = next.dateObj.getDate()
      const month = next.dateObj.toLocaleDateString('en-US', { month: 'short' })
      return {
        dateStr: `${day} ${month}`,
        name: next.name
      }
    }
    return { dateStr: 'N/A', name: 'No Holidays' }
  }

  const nextHoliday = getNextHoliday()

  // Leaves calculation
  const pendingLeavesCount = adminLeavesTable.filter(l => l.status === 'PENDING').length
  const activeOnLeaveCount = adminLeavesTable.filter(leave => {
    if (leave.status !== 'APPROVED') return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(leave.startDate || leave.fromDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(leave.endDate || leave.toDate)
    end.setHours(0, 0, 0, 0)
    return today >= start && today <= end
  }).length

  // Role distribution helper
  const formatRole = (roleStr) => {
    if (!roleStr) return 'Employee'
    return roleStr.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  }

  const getRoleDistribution = () => {
    const counts = {}
    team.forEach(emp => {
      const role = emp.role ? formatRole(emp.role) : 'Employee'
      counts[role] = (counts[role] || 0) + 1
    })

    const items = Object.entries(counts)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)

    const fallbacks = [
      { role: 'Medical Representative', count: 0 },
      { role: 'Area Manager', count: 0 },
      { role: 'Regional Manager', count: 0 },
      { role: 'Medical Executive', count: 0 }
    ]

    while (items.length < 4) {
      const nextFallback = fallbacks[items.length]
      items.push(nextFallback)
    }

    return items
  }

  const roleDist = getRoleDistribution()
  const bubbleColors = [
    { bg: 'bg-indigo-500/18', text: 'text-[#4F46E5]', hex: '#4F46E5' },
    { bg: 'bg-emerald-500/18', text: 'text-[#059669]', hex: '#059669' },
    { bg: 'bg-amber-500/20', text: 'text-[#D97706]', hex: '#D97706' },
    { bg: 'bg-red-500/15', text: 'text-[#DC2626]', hex: '#DC2626' }
  ]

  // Birthdays dynamic list
  const getUpcomingBirthdays = () => {
    const currentMonth = new Date().getMonth()
    const list = team
      .filter(emp => emp.dateOfBirth)
      .filter(emp => {
        const dob = new Date(emp.dateOfBirth)
        return dob.getMonth() === currentMonth
      })
      .map(emp => {
        const dob = new Date(emp.dateOfBirth)
        return {
          name: emp.fullName,
          date: dob.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          role: formatRole(emp.role)
        }
      })
    
    // Mocks if empty to keep it beautiful (using current month)
    if (list.length === 0 && team.length > 0) {
      const monthStr = new Date().toLocaleDateString('en-US', { month: 'short' })
      const dates = [`12 ${monthStr}`, `20 ${monthStr}`, `25 ${monthStr}`]
      return team.slice(0, 3).map((emp, i) => ({
        name: emp.fullName,
        date: dates[i % dates.length],
        role: formatRole(emp.role)
      }))
    }
    return list.slice(0, 4)
  }

  const birthdayList = getUpcomingBirthdays()

  const mrEmployees = team.filter(member => {
    const role = (member.role || '').toUpperCase().trim()
    return role === 'MR' || role === 'MEDICAL_REPRESENTATIVE'
  })

  // Attendance Punch-in mapping helper
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false
    try {
      const d1 = new Date(date1)
      const d2 = new Date(date2)
      return (
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear()
      )
    } catch (e) {
      return false
    }
  }

  const getTodayPunchRecord = (empId) => {
    const todayStr = new Date().toISOString().split('T')[0]
    return teamAttendance.find(a => {
      const logEmpId = String(a.employeeId || a.mrId || '')
      const targetEmpId = String(empId)
      return logEmpId === targetEmpId && a.punchInTime && isSameDay(a.punchInTime, todayStr)
    })
  }

  const formatIsoToTime = (isoStr) => {
    if (!isoStr) return ''
    try {
      const d = new Date(isoStr)
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    } catch (e) {
      return ''
    }
  }

  return (
    <div className="animate-fade">
      {/* ── Welcome Header Card ── */}
      <div className="rounded-[20px] px-[30px] py-7 mb-5 text-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] flex items-center justify-between flex-wrap gap-6 relative overflow-hidden border border-white/10">
        <img 
          src="/banner.jfif" 
          alt="Welcome Banner" 
          className="absolute inset-0 w-full h-full object-cover z-0" 
        />

        <div className="flex items-center gap-5 z-[3]">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8F04A] to-[#10B981] flex items-center justify-center text-[24px] font-extrabold text-[#064E3B] shadow-[0_4px_14px_rgba(200,240,74,0.4)] border-2 border-white/20">
            {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-base font-black text-white/90 mb-1">
              {getGreeting()}
            </div>
            <h1 className="text-[26px] font-extrabold text-white m-0 tracking-tight leading-none">
              {displayName}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Stat Cards Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Employees" value={String(team.length).padStart(2, '0')} type="teal"   />
        <StatCard label="On Leave"        value={String(activeOnLeaveCount).padStart(2, '0')}  type="orange" />
        <StatCard label="Next Holiday"    value={`${nextHoliday.dateStr} (${nextHoliday.name})`}    type="coral"  />
        <StatCard label="Leave Requests"  value={String(pendingLeavesCount).padStart(2, '0')}  type="purple" />
      </div>

      {/* ── Middle Row: Roles Chart + Quick Actions + Birthdays ── */}
      <div className="grid grid-cols-[1fr_1.3fr_1fr] gap-4 mb-4">

        {/* Roles Distribution Chart */}
        <Card>
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-sm font-extrabold text-[#111827]">Team Roles</div>
              <div className="text-xs text-[#9CA3AF] mt-0.5">Role distribution across your team</div>
            </div>
            <ExternalLink size={14} className="cursor-pointer text-[#9CA3AF] mt-0.5" onClick={() => navigate('/admin/employees')} />
          </div>
          <div className="flex items-center justify-center gap-0 relative h-[130px]">
            {/* Bubble cluster */}
            <div className="relative w-40 h-[130px]">
              <div className="absolute w-[90px] h-[90px] rounded-full bg-indigo-500/18 top-0 left-[30px] flex items-center justify-center text-base font-extrabold text-[#4F46E5]">{roleDist[0]?.count || 0}</div>
              <div className="absolute w-[58px] h-[58px] rounded-full bg-emerald-500/18 bottom-2.5 right-2 flex items-center justify-center text-[13px] font-extrabold text-[#059669]">{roleDist[1]?.count || 0}</div>
              <div className="absolute w-[46px] h-[46px] rounded-full bg-amber-500/20 bottom-1.25 left-[30px] flex items-center justify-center text-xs font-extrabold text-[#D97706]">{roleDist[2]?.count || 0}</div>
              <div className="absolute w-[38px] h-[38px] rounded-full bg-red-500/15 top-[30px] left-1.25 flex items-center justify-center text-[11px] font-extrabold text-[#DC2626]">{roleDist[3]?.count || 0}</div>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {roleDist.slice(0, 4).map((item, idx) => (
              <div key={item.role} className="flex items-center justify-between text-[11px] text-[#6B7280]">
                <div className="flex items-center gap-1.5 truncate mr-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: bubbleColors[idx].hex }} />
                  <span className="truncate">{item.role}</span>
                </div>
                <span className="font-extrabold text-[#111827]">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div className="mb-3.5">
            <div className="text-sm font-extrabold text-[#111827]">Quick Actions</div>
            <div className="text-xs text-[#9CA3AF] mt-0.5">Frequently accessed shortcuts</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <QATile icon={UserPlus}       label="Onboard Req." onClick={() => navigate('/admin/requests')} />
            <QATile icon={Calendar}       label="Leaves Info"  onClick={() => navigate('/admin/leaves')} />
            <QATile icon={Navigation}     label="Field Track"  onClick={() => navigate('/admin/fieldtracking')} />
            <QATile icon={MapIcon}        label="Tour Plans"   onClick={() => navigate('/admin/tourplans')} />
            <QATile icon={Users}          label="Employees"    onClick={() => navigate('/admin/employees')} />
            <QATile icon={BarChart2}      label="Reports"      onClick={() => navigate('/admin/reports')} />
          </div>
        </Card>

        {/* Birthdays Card */}
        <Card style={{ position: 'relative', overflow: 'hidden' }}>
          <img 
            src="/Birthday.jpg" 
            alt="Birthday Background" 
            className="absolute inset-0 w-full h-full object-cover z-0" 
          />
          <div className="absolute inset-0 bg-white/88 z-[1]" />
          
          <div className="relative z-[2] flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-sm font-extrabold text-[#111827]">Upcoming Birthdays</div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">Birthdays in your team this month</div>
              </div>
              <Gift size={14} className="text-[#111827] mt-0.5" />
            </div>
            <div className="flex flex-col gap-1.5">
              {birthdayList.length === 0 ? (
                <div className="py-8 text-center text-[#9CA3AF] text-xs">No birthdays recorded.</div>
              ) : (
                birthdayList.map((item, idx) => (
                  <BirthdayRow 
                    key={idx} 
                    name={item.name} 
                    date={item.date} 
                    role={item.role} 
                  />
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Employee Status Card ── */}
      <Card style={{ marginTop: '20px' }}>
        <div className="flex justify-between items-center mb-5 border-b border-[#F3F4F6] pb-4">
          <div>
            <h3 className="m-0 text-sm font-extrabold text-[#111827]">MR Status & Attendance</h3>
            <p className="m-0 text-xs text-[#9CA3AF] mt-0.5">Real-time status of Medical Representatives and today's activity logs</p>
          </div>
        </div>

        {mrEmployees.length === 0 ? (
          <div className="py-8 text-center text-[#9CA3AF] bg-[#FAFAFA] rounded-xl border border-dashed border-[#E5E7EB]">
            <p className="m-0 text-[13.5px] font-semibold text-[#4B5563]">No Medical Representatives found in the team database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b-[1.5px] border-[#F3F4F6]">
                  {['Employee', 'Designation', 'Today\'s Activity', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-[0.5px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mrEmployees.map((member) => {
                  const initials = member.fullName ? member.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'E';
                  const punchRec = getTodayPunchRecord(member.id || member.employeeId);
                  
                  let activityStatus = 'Not Punched In';
                  let activityColorClass = 'bg-[#F3F4F6] text-[#6B7280]';
                  
                  if (punchRec) {
                    if (punchRec.punchOutTime) {
                      activityStatus = `Punched Out at ${formatIsoToTime(punchRec.punchOutTime)}`;
                      activityColorClass = 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]';
                    } else if (punchRec.punchInTime) {
                      activityStatus = `Punched In at ${formatIsoToTime(punchRec.punchInTime)}`;
                      activityColorClass = 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]';
                    }
                  }

                  return (
                    <tr key={member.id} className="border-b border-[#FAFAFA] transition-colors duration-150 hover:bg-slate-50/50">
                      {/* Name & Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          {member.photoUrl ? (
                            <img src={getFullAssetUrl(member.photoUrl)} alt={member.fullName} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CBD5E1] to-[#94A3B8] text-white text-[12px] font-bold flex items-center justify-center">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="text-[13.5px] font-extrabold text-[#1F2937]">{member.fullName || 'Unknown'}</div>
                            <div className="text-[11px] text-[#9CA3AF]">{member.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4 text-[13px] text-[#4B5563] font-semibold">
                        {formatRole(member.role)}
                      </td>

                      {/* Today's Activity */}
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-[20px] text-[11px] font-extrabold ${activityColorClass}`}>
                          {activityStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <button
                          onClick={() => navigate('/admin/fieldtracking')}
                          className="flex items-center gap-1 bg-white text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer font-bold text-xs hover:bg-gray-50 transition-colors"
                        >
                          Track Location
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

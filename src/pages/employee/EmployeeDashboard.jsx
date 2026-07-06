import React, { useEffect } from 'react'
import { Card, SectionHeader, StatCard } from '../../components/ui'
import { LEAVE_BALANCE, RECENT_ACTIVITY, UPCOMING_EVENTS } from '../../data/hrmsData'
import { useSelector, useDispatch } from 'react-redux'
import { fetchProfile } from '../../redux/actions/authActions'
import DailyQuote from '../../components/DailyQuote'

export default function EmployeeDashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])
  
  const displayName = user?.fullName || user?.name || 'Employee';
  const displayRole = user?.role?.replace('_', ' ') || 'Team Member';
  const displayDept = user?.dept || 'Operations';
  return (
    <div>
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-green-600 to-cyan-600 rounded-2xl p-6 px-7 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-white/75 mb-1 font-medium">Welcome back 👋</div>
          <div className="text-[22px] font-extrabold text-white mb-1">{displayName}</div>
          <div className="text-[13px] text-white/80">{displayRole} · {displayDept}</div>
          <DailyQuote userRole="EMPLOYEE" variant="welcome" />
        </div>
        <div className="text-right">
          <div className="text-[12px] text-white/70 mb-1">Today</div>
          <div className="text-[14px] font-semibold text-white">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <StatCard icon="✅" label="Present Days"  value="22"     sub="This month"         color="#16a34a" />
        <StatCard icon="🏖️" label="Leave Balance" value="13"     sub="Days remaining"     color="#0891b2" bgColor="#e0f2fe" />
        <StatCard icon="💰" label="Net Salary"    value="₹45K"   sub="April 2026"         color="#7c3aed" bgColor="#ede9fe" />
        <StatCard icon="⭐" label="Performance"   value="4.2/5"  sub="Last review cycle"  color="#d97706" bgColor="#fef3c7" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Leave Balance */}
        <Card>
          <div className="font-bold text-[14px] text-gray-900 mb-4">Leave Balance</div>
          <div className="flex flex-col gap-3.5">
            {LEAVE_BALANCE.map(lb => (
              <div key={lb.code}>
                <div className="flex justify-between text-[13px] mb-1.5">
                  <span className="text-gray-700 font-medium">{lb.type}</span>
                  <span className="text-green-600 font-bold">{lb.total - lb.used} <span className="text-gray-400 font-normal">/ {lb.total}</span></span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full bg-green-600 rounded-full" style={{ width: `${(lb.used / lb.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming events */}
        <Card>
          <div className="font-bold text-[14px] text-gray-900 mb-4">Upcoming Events</div>
          <div className="flex flex-col gap-2.5">
            {UPCOMING_EVENTS.map(ev => (
              <div key={ev.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-[20px]">{ev.icon}</span>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-gray-900">{ev.name}</div>
                  <div className="text-[11px] text-gray-400">{ev.type}</div>
                </div>
                <div className="text-[12px] text-green-600 font-bold">{ev.date}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

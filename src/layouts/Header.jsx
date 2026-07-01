import { Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { ADMIN_NAV, SUPER_ADMIN_NAV, EMPLOYEE_NAV } from './navConfig'

/* ── Page Title  ───────────────────────────────────────────── */
function getPageTitle(activePage, role) {
  if (activePage === 'dashboard') {
    if (role === 'ADMIN') return 'Admin Dashboard'
    return 'Dashboard'
  }
  if (activePage === 'dcr') return 'Daily Call Reports (DCR)'
  if (activePage === 'me') return 'Me > Leaves'
  if (activePage === 'recruitment') return 'Recruitment > Candidates'
  if (activePage === 'myteam') return 'My Team'
  if (activePage === 'fieldtracking') return 'Field Tracking'
  if (activePage === 'leaves') return 'Leave Approvals'
  if (activePage === 'requests') return 'Onboarding Requests'
  if (activePage === 'tourplans') return 'Tour Plan'
  
  const navItem = 
    ADMIN_NAV.find(n => n.id === activePage) || 
    SUPER_ADMIN_NAV.find(n => n.id === activePage) ||
    EMPLOYEE_NAV.find(n => n.id === activePage)

  return navItem?.label || 'Dashboard'
}

function getPageSub(activePage, role) {
  if (activePage === 'dashboard') {
    if (role === 'ADMIN') return null
    return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  if (activePage === 'dcr') return 'Log and track call visits submitted to your reporting manager.'
  if (activePage === 'me') return 'Working Hard? Request time off!'
  if (activePage === 'recruitment') return '189 Total'
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Header({ role }) {
  const location = useLocation()
  const pathParts = location.pathname.split('/')
  const activePage = pathParts[pathParts.length - 1] || 'dashboard'

  const showApplyLeave = activePage === 'me'

  return (
    <header className="h-[72px] bg-transparent flex items-center px-8 gap-4 shrink-0">
      {/* Page Title */}
      <div className="shrink-0">
        <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight leading-tight m-0">
          {getPageTitle(activePage, role)}
        </h1>
        {getPageSub(activePage, role) && (
          <p className="text-xs text-gray-400 mt-0.5">
            {getPageSub(activePage, role)}
          </p>
        )}
      </div>

      {/* Apply Leave button (only on Me page) */}
      {showApplyLeave && (
        <button className="inline-flex items-center gap-1.5 py-[9px] px-[18px] bg-[#C8F04A] text-[#1A1A1A] font-bold text-[13px] rounded-[10px] border-none cursor-pointer transition-all duration-[180ms] hover:bg-[#B8E040] hover:-translate-y-0.5 font-sans ml-4 shrink-0">
          Apply Leave
        </button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search Bar */}
      {role !== 'ADMIN' && role !== 'EMPLOYEE' && role !== 'SUPER_ADMIN' && role !== 'SUPER ADMIN' && (
        <div className="relative w-60 shrink-0">
          <Search
            size={15}
            color="#9CA3AF"
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            placeholder="Search employees or actions..."
            className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-[10px] py-[9px] pl-[38px] pr-[14px] text-[13px] text-gray-500 outline-none transition-all duration-[180ms] focus:bg-white focus:border-[#C8F04A] font-sans"
          />
        </div>
      )}

      {/* Bell Icon */}
      <button className="w-[38px] h-[38px] rounded-[10px] bg-white border border-gray-200 flex items-center justify-center cursor-pointer shrink-0">
        <Bell size={18} color="#9CA3AF" />
      </button>
    </header>
  )
}

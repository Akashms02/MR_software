import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, LayoutDashboard, FileText, User, Coffee, Settings, ClipboardList, BarChart3, MapPin, Calendar, Navigation, UserPlus, Bell } from 'lucide-react'
import { logout } from '../../redux/actions/authActions'

function SidebarAvatar({ name, size = 38 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  return (
    <div 
      style={{ width: `${size}px`, height: `${size}px`, fontSize: `${size * 0.36}px` }}
      className="rounded-full bg-gradient-to-br from-[#CBD5E1] 0% to-[#94A3B8] 100% flex items-center justify-center text-white font-bold shrink-0 overflow-hidden"
    >
      {initials}
    </div>
  )
}

function SnowflakeLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
      <line x1="12" y1="2"    x2="12" y2="22" />
      <line x1="2"  y1="12"   x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
      <circle cx="12" cy="12" r="2" fill="white" stroke="none" />
    </svg>
  )
}

function MRHeader() {
  const location = useLocation()
  const pathParts = location.pathname.split('/')
  const activePage = pathParts[pathParts.length - 1] || 'dashboard'

  const getTitle = () => {
    if (activePage === 'dashboard') return 'Dashboard'
    if (activePage === 'dcr') return 'DCR Reports'
    if (activePage === 'requests') return 'Onboarding Requests'
    if (activePage === 'attendance') return 'Field Attendance'
    if (activePage === 'tourplan') return 'Tour Plans'
    if (activePage === 'reports') return 'Reports & Analytics'
    if (activePage === 'leaves') return 'Leave Management'
    if (activePage === 'finance') return 'My Payslips'
    if (activePage === 'me') return 'Me'
    if (activePage === 'settings') return 'Settings'
    if (activePage === 'onboard-doctor') return 'Doctor Onboarding'
    return 'Dashboard'
  }

  return (
    <header className="h-[72px] bg-transparent flex items-center px-8 gap-4 shrink-0">
      <div className="shrink-0">
        <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight leading-tight m-0">
          {getTitle()}
        </h1>
      </div>
      <div className="flex-1" />
      <button className="w-[38px] h-[38px] rounded-[10px] bg-white border border-gray-200 flex items-center justify-center cursor-pointer shrink-0">
        <Bell size={18} color="#9CA3AF" />
      </button>
    </header>
  )
}

export default function MRLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  const displayName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'MR Employee'
  const displayRole = 'Medical Representative (MR)'

  const pathParts = location.pathname.split('/')
  const activePage = pathParts[pathParts.length - 1] || 'dashboard'

  const navItems = [
    { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard',     path: '/mr/dashboard' },
    { id: 'dcr',          icon: ClipboardList,   label: 'DCR Reports',   path: '/mr/dcr' },
    { id: 'requests',     icon: UserPlus,        label: 'Onboarding Requests', path: '/mr/requests' },
    { id: 'attendance',   icon: Navigation,      label: 'Field Attendance', path: '/mr/attendance' },
    { id: 'tourplan',     icon: MapPin,          label: 'Tour Plans',    path: '/mr/tourplan' },
    { id: 'reports',      icon: BarChart3,       label: 'Reports & Analytics', path: '/mr/reports' },
    { id: 'leaves',       icon: Calendar,        label: 'Leave Management', path: '/mr/leaves' },
    { id: 'finance',      icon: FileText,        label: 'My Payslips',   path: '/mr/finance' },
    { id: 'me',           icon: User,            label: 'Me',            path: '/mr/me' },
    { id: 'settings',     icon: Settings,        label: 'Settings',      path: '/mr/settings' },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F2F5] font-sans">
      <aside className="w-[220px] shrink-0 bg-white flex flex-col fixed top-0 left-0 bottom-0 z-[100] shadow-[2px_0_16px_rgba(0,0,0,0.04)]">
        {/* Logo */}
        <div className="h-[72px] flex items-center px-5 gap-2.5 shrink-0 border-b border-[#F3F4F6]">
          <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
            <SnowflakeLogo />
          </div>
          <span className="font-black text-[18px] text-gray-900 tracking-[-0.5px]">
            HRMS
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          {navItems.map(item => {
            const isActive = activePage === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl cursor-pointer border-none text-[13.5px] text-left transition-all duration-[180ms] outline-none ${
                  isActive 
                    ? "bg-[#C8F04A] text-[#1A1A1A] font-bold" 
                    : "bg-transparent text-gray-500 font-medium hover:bg-gray-50"
                }`}
              >
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  color={isActive ? '#1A1A1A' : '#9CA3AF'}
                />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-[#F3F4F6] shrink-0">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl mb-1 bg-gray-50">
            <SidebarAvatar name={displayName} size={38} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-gray-900 truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-gray-400">{displayRole}</div>
            </div>
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl bg-transparent border-none cursor-pointer text-gray-400 text-[13px] font-medium transition-colors duration-150 hover:bg-gray-50 mt-0.5"
          >
            <LogOut size={16} color="#9CA3AF" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <div className="ml-[220px] flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <MRHeader />
        <main className="flex-1 px-8 pb-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

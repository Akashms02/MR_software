import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, LayoutDashboard, FileText, User, Coffee, Settings, BarChart3, MapPin, UserPlus, Navigation, Calendar } from 'lucide-react'
import { logout } from '../../redux/actions/authActions'
import Header from '../Header'

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

export default function MedicalExecutiveLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  const displayName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'Medical Executive'
  const displayRole = 'Medical Executive (ME)'

  const pathParts = location.pathname.split('/')
  const activePage = pathParts[pathParts.length - 1] || 'dashboard'

  const navItems = [
    { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard',     path: '/medical-executive/dashboard' },
    { id: 'requests',     icon: UserPlus,        label: 'Onboarding Requests', path: '/medical-executive/requests' },
    { id: 'leaves',       icon: Calendar,        label: 'Leave Approvals', path: '/medical-executive/leaves' },
    { id: 'tourplan',     icon: MapPin,          label: 'Tour Plans',    path: '/medical-executive/tourplan' },
    { id: 'fieldtracking', icon: Navigation,      label: 'Field Tracking', path: '/medical-executive/fieldtracking' },
    { id: 'reports',      icon: BarChart3,       label: 'Reports & Analytics', path: '/medical-executive/reports' },
    { id: 'finance',      icon: FileText,        label: 'My Payslips',   path: '/medical-executive/finance' },
    { id: 'me',           icon: User,            label: 'Me',            path: '/medical-executive/me' },
    { id: 'watercooler',  icon: Coffee,          label: 'Water Cooler',  path: '/medical-executive/watercooler' },
    { id: 'settings',     icon: Settings,        label: 'Settings',      path: '/medical-executive/settings' },
  ]

  return (
    <div className="flex min-h-screen bg-[#F0F2F5] font-sans">
      <aside className="w-[220px] shrink-0 bg-white flex flex-col fixed top-0 left-0 bottom-0 z-[100] shadow-[2px_0_16px_rgba(0,0,0,0.04)]">
        {/* Logo */}
        <div className="h-[72px] flex items-center px-5 gap-2.5 shrink-0 border-b border-[#F3F4F6]">
          <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center shrink-0">
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
                    ? "bg-[#EEF2FF] text-[#4F46E5] font-bold" 
                    : "bg-transparent text-gray-500 font-medium hover:bg-gray-50"
                }`}
              >
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  color={isActive ? '#4F46E5' : '#9CA3AF'}
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

      <div className="ml-[220px] flex-1 flex flex-col min-w-0">
        <Header role="EMPLOYEE" />
        <main className="flex-1 px-8 pb-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

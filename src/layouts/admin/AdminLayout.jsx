import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Briefcase, 
  Network, 
  User, 
  UsersRound, 
  Coffee, 
  FileText, 
  Settings,
  BarChart2,
  Map,
  Calendar,
  Navigation
} from 'lucide-react'
import { logout } from '../../redux/actions/authActions'
import Header from '../Header'

function SidebarAvatar({ name, size = 38 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%',
      background: 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: `${size * 0.36}px`, fontWeight: 700, color: '#fff',
      flexShrink: 0, overflow: 'hidden'
    }}>
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

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  const displayName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'Admin'
  const displayRole = 'Admin'

  const pathParts = location.pathname.split('/')
  const activePage = pathParts[pathParts.length - 1] || 'dashboard'

  const navItems = [
    { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard',     path: '/admin/dashboard' },
    { id: 'employees',    icon: Users,           label: 'Employees',     path: '/admin/employees' },
    { id: 'finance',      icon: Wallet,          label: 'Finance',       path: '/admin/finance' },
    { id: 'reports',      icon: BarChart2,       label: 'Reports & Analytics', path: '/admin/reports' },
    { id: 'tourplans',    icon: Map,             label: 'Tour Plans',    path: '/admin/tourplans' },
    { id: 'fieldtracking', icon: Navigation,      label: 'Field Tracking', path: '/admin/fieldtracking' },
    { id: 'leaves',       icon: Calendar,        label: 'Leave Approvals', path: '/admin/leaves' },
    { id: 'recruitment',  icon: Briefcase,       label: 'Recruitment',   path: '/admin/recruitment' },
    { id: 'orgstructure', icon: Network,         label: 'Org Structure', path: '/admin/orgstructure' },
    { id: 'me',           icon: User,            label: 'Me',            path: '/admin/me' },
    { id: 'myteam',       icon: UsersRound,      label: 'My Team',       path: '/admin/myteam' },
    { id: 'watercooler',  icon: Coffee,          label: 'Water Cooler',  path: '/admin/watercooler' },
    { id: 'hrdocuments',  icon: FileText,        label: 'HR Documents',  path: '/admin/hrdocuments' },
    { id: 'settings',     icon: Settings,        label: 'Settings',      path: '/admin/settings' },
  ]

  return (
    <div className="flex min-h-screen bg-[#F0F2F5] font-[Inter,sans-serif]">
      <aside className="w-[220px] shrink-0 bg-white flex flex-col fixed top-0 left-0 bottom-0 z-[100] shadow-[2px_0_16px_rgba(0,0,0,0.04)]">
        {/* Logo */}
        <div className="h-[72px] flex items-center px-5 gap-2.5 shrink-0 border-b border-gray-100">
          <div className="w-9 h-9 rounded-[10px] bg-gray-900 flex items-center justify-center shrink-0">
            <SnowflakeLogo />
          </div>
          <span className="font-extrabold text-[18px] text-gray-900 tracking-tight">
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
                className={`flex items-center gap-2.5 w-full py-2.5 px-3.5 rounded-[10px] mb-0.5 cursor-pointer border-none font-[inherit] text-left text-[13.5px] transition-all duration-[180ms] outline-none ${isActive ? 'bg-[#C8F04A] text-gray-900 font-bold' : 'bg-transparent text-gray-500 font-medium hover:bg-gray-50'}`}
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
        <div className="p-3 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5 p-2.5 rounded-[10px] mb-1 bg-gray-50">
            <SidebarAvatar name={displayName} size={38} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                {displayName}
              </div>
              <div className="text-[11px] text-gray-400">{displayRole}</div>
            </div>
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center gap-2 w-full py-[9px] px-3.5 rounded-[10px] bg-transparent border-none cursor-pointer text-gray-400 text-[13px] font-medium font-[inherit] mt-0.5 hover:bg-gray-50 transition-colors"
          >
            <LogOut size={16} color="#9CA3AF" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <div className="ml-[220px] flex-1 flex flex-col min-w-0">
        <Header role="ADMIN" />
        <main className="flex-1 px-8 pb-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

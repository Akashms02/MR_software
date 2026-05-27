import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, LayoutDashboard, FileText, User, Coffee, Settings, UserPlus } from 'lucide-react'
import { logout } from '../../redux/actions/authActions'
import Header from '../Header'

function SidebarAvatar({ name, size = 38 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'MM'
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%',
      background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
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

export default function MedicalManagerLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  const displayName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'Medical Manager'
  const displayRole = 'Medical Manager'

  const pathParts = location.pathname.split('/')
  const activePage = pathParts[pathParts.length - 1] || 'dashboard'

  const navItems = [
    { id: 'dashboard',      icon: LayoutDashboard, label: 'Dashboard',      path: '/medical-manager/dashboard' },
    { id: 'onboard-doctor', icon: UserPlus,        label: 'Onboard Doctor', path: '/medical-manager/onboard-doctor' },
    { id: 'finance',        icon: FileText,        label: 'My Payslips',    path: '/medical-manager/finance' },
    { id: 'me',             icon: User,            label: 'Me',             path: '/medical-manager/me' },
    { id: 'watercooler',    icon: Coffee,          label: 'Water Cooler',   path: '/medical-manager/watercooler' },
    { id: 'settings',       icon: Settings,        label: 'Settings',       path: '/medical-manager/settings' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F2F5', fontFamily: "'Inter', sans-serif" }}>
      <aside style={{
        width: '220px', flexShrink: 0,
        background: '#FFFFFF',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        boxShadow: '2px 0 16px rgba(0,0,0,0.04)',
      }}>
        {/* Logo */}
        <div style={{
          height: '72px', display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: '10px', flexShrink: 0,
          borderBottom: '1px solid #F3F4F6'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: '#111827',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <SnowflakeLogo />
          </div>
          <span style={{ fontWeight: 800, fontSize: '18px', color: '#111827', letterSpacing: '-0.5px' }}>
            HRMS
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
          {navItems.map(item => {
            const isActive = activePage === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '10px 14px', borderRadius: '10px',
                  marginBottom: '2px', cursor: 'pointer', border: 'none',
                  background: isActive ? '#7C3AED' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#6B7280',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13.5px',
                  fontFamily: 'inherit', textAlign: 'left',
                  transition: 'all 0.18s ease',
                  boxShadow: 'none',
                  outline: 'none'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F9FAFB' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  color={isActive ? '#FFFFFF' : '#9CA3AF'}
                />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #F3F4F6', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 10px', borderRadius: '10px',
            marginBottom: '4px', background: '#F9FAFB'
          }}>
            <SidebarAvatar name={displayName} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{displayRole}</div>
            </div>
          </div>
          <button
            onClick={() => dispatch(logout())}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '9px 14px', borderRadius: '10px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#9CA3AF', fontSize: '13px', fontWeight: 500,
              fontFamily: 'inherit', marginTop: '2px'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={16} color="#9CA3AF" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header role="EMPLOYEE" />
        <main style={{ flex: 1, padding: '0 32px 32px 32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

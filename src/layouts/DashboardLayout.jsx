import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
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
  Bell,
  Search,
  LogOut
} from 'lucide-react'

/* ── Nav Definitions ─────────────────────────────────────────────── */
const ADMIN_NAV = [
  { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard'     },
  { id: 'employees',    icon: Users,            label: 'Employees'     },
  { id: 'finance',      icon: Wallet,           label: 'Finance'       },
  { id: 'recruitment',  icon: Briefcase,        label: 'Recruitment'   },
  { id: 'orgstructure', icon: Network,          label: 'Org Structure' },
  { id: 'me',           icon: User,             label: 'Me'            },
  { id: 'myteam',       icon: UsersRound,       label: 'My Team'       },
  { id: 'watercooler',  icon: Coffee,           label: 'Water Cooler'  },
  { id: 'hrdocuments',  icon: FileText,         label: 'HR Documents'  },
  { id: 'settings',     icon: Settings,         label: 'Settings'      },
]

const EMPLOYEE_NAV = [
  { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard'     },
  { id: 'finance',      icon: FileText,         label: 'My Payslips'   },
  { id: 'me',           icon: User,             label: 'Me'            },
  { id: 'watercooler',  icon: Coffee,           label: 'Water Cooler'  },
  { id: 'settings',     icon: Settings,         label: 'Settings'      },
]

/* ── Profile Images (initials avatar fallback) ───────────────────── */
function SidebarAvatar({ name, size = 42 }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
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

/* ── Snowflake Logo SVG (matches reference exactly) ──────────────── */
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

/* ── Page Title helper ───────────────────────────────────────────── */
function getPageTitle(activePage, role) {
  if (activePage === 'dashboard') return role === 'Employee' ? 'Good Morning' : 'Good Morning'
  if (activePage === 'me') return 'Me > Leaves'
  if (activePage === 'recruitment') return 'Recruitment > Candidates'
  return ADMIN_NAV.find(n => n.id === activePage)?.label || 'Dashboard'
}

function getPageSub(activePage) {
  if (activePage === 'dashboard') return '18 Aug 2023'
  if (activePage === 'me') return 'Working Hard? Request time off!'
  if (activePage === 'recruitment') return '189 Total'
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ── Layout ──────────────────────────────────────────────────────── */
export default function DashboardLayout({ role = 'HR Admin', activePage, setActivePage, children }) {
  const navigate = useNavigate()

  const user = role === 'Employee'
    ? { name: 'Sandor Marai', sub: 'Content Manager' }
    : { name: 'Knut Hamsun',  sub: 'HR Manager' }

  const showApplyLeave = activePage === 'me'
  const showCandidateCount = activePage === 'recruitment'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F2F5', fontFamily: "'Inter', sans-serif" }}>

      {/* ══════════════════════════════════════════════════════
          SIDEBAR — white, fixed, 220px
      ══════════════════════════════════════════════════════ */}
      <aside style={{
        width: '220px', flexShrink: 0,
        background: '#FFFFFF',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        boxShadow: '2px 0 16px rgba(0,0,0,0.04)',
      }}>

        {/* Logo ─────────────────────────────────────── */}
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

        {/* Navigation ──────────────────────────────── */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
          {(role === 'HR Admin' || role === 'Manager' ? ADMIN_NAV : EMPLOYEE_NAV).map(item => {
            const isActive = activePage === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '10px 14px', borderRadius: '10px',
                  marginBottom: '2px', cursor: 'pointer', border: 'none',
                  background: isActive ? '#C8F04A' : 'transparent',
                  color: isActive ? '#1A1A1A' : '#6B7280',
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
                  color={isActive ? '#1A1A1A' : '#9CA3AF'}
                />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom — User + Logout ───────────────────── */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #F3F4F6', flexShrink: 0 }}>
          {/* User card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 10px', borderRadius: '10px',
            marginBottom: '4px', background: '#F9FAFB'
          }}>
            <SidebarAvatar name={user.name} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{user.sub}</div>
            </div>
          </div>

          {/* Log Out */}
          <button
            onClick={() => navigate('/login')}
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

      {/* ══════════════════════════════════════════════════════
          MAIN AREA
      ══════════════════════════════════════════════════════ */}
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top Header ──────────────────────────────── */}
        <header style={{
          height: '72px', background: 'transparent',
          display: 'flex', alignItems: 'center',
          padding: '0 32px', gap: '16px',
          flexShrink: 0
        }}>
          {/* Page Title */}
          <div style={{ flexShrink: 0 }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px', lineHeight: 1.2, margin: 0 }}>
              {getPageTitle(activePage, role)}
            </h1>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
              {getPageSub(activePage)}
            </p>
          </div>

          {/* Apply Leave button (only on Me page) */}
          {showApplyLeave && (
            <button className="btn-lime" style={{ marginLeft: '16px', flexShrink: 0, borderRadius: '10px', padding: '9px 18px', fontSize: '13px' }}>
              Apply Leave
            </button>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Search Bar */}
          <div style={{ position: 'relative', width: '240px', flexShrink: 0 }}>
            <Search
              size={15}
              color="#9CA3AF"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              placeholder="Search employees or actions..."
              className="search-pill"
              style={{ width: '240px' }}
            />
          </div>

          {/* Bell Icon */}
          <button style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: '#FFFFFF', border: '1px solid #E5E7EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0
          }}>
            <Bell size={18} color="#9CA3AF" />
          </button>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '0 32px 32px 32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

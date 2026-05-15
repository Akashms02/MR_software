import { Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { ADMIN_NAV, SUPER_ADMIN_NAV } from './navConfig'

/* ── Page Title helper ───────────────────────────────────────────── */
function getPageTitle(activePage, role) {
  if (activePage === 'dashboard') return role === 'Employee' ? 'Good Morning' : 'Good Morning'
  if (activePage === 'me') return 'Me > Leaves'
  if (activePage === 'recruitment') return 'Recruitment > Candidates'
  
  const navItem = ADMIN_NAV.find(n => n.id === activePage) || SUPER_ADMIN_NAV.find(n => n.id === activePage)
  return navItem?.label || 'Dashboard'
}

function getPageSub(activePage) {
  if (activePage === 'dashboard') return '18 Aug 2023'
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
  )
}

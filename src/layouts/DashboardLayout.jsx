import { useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import Header from './Header'

export default function DashboardLayout({ children }) {
  const { user } = useSelector(state => state.auth)

  // Fallbacks if user is somehow null
  const role = user?.role || 'EMPLOYEE'
  const displayName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'User'
  
  // Format the role to look nicer (e.g. "SUPER_ADMIN" -> "Super Admin")
  const displayRole = role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  const normalizedRole = role.toLowerCase()
  const isSuperAdmin = normalizedRole === 'superadmin' || normalizedRole === 'super admin' || normalizedRole === 'super_admin'
  const isEmployee = !isSuperAdmin && !normalizedRole.includes('admin') && normalizedRole !== 'manager'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F2F5', fontFamily: "'Inter', sans-serif" }}>
      {/* ══════════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════════ */}
      <Sidebar 
        isSuperAdmin={isSuperAdmin}
        isEmployee={isEmployee}
        displayName={displayName}
        displayRole={displayRole}
      />

      {/* ══════════════════════════════════════════════════════
          MAIN AREA
      ══════════════════════════════════════════════════════ */}
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Header */}
        <Header role={role} />

        {/* Page Content */}
        <main style={{ flex: 1, padding: '0 32px 32px 32px', overflowY: 'auto' }}>
          {children}
        </main>

      </div>
    </div>
  )
}


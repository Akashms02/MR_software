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

  const roleStr = (role || '').toUpperCase().trim();
  const isSuperAdmin = roleStr === 'SUPER_ADMIN' || roleStr === 'SUPERADMIN' || roleStr === 'SUPER ADMIN';
  const isAdmin = roleStr === 'ADMIN';
  const isEmployee = !isSuperAdmin && !isAdmin;

  return (
    <div className="flex min-h-screen bg-[#F0F2F5] font-[Inter,sans-serif]">
      <Sidebar 
        isSuperAdmin={isSuperAdmin}
        isEmployee={isEmployee}
        displayName={displayName}
        displayRole={displayRole}
      />
      <div className="ml-[220px] flex-1 flex flex-col min-w-0">
        <Header role={role} />
        <main className="flex-1 px-8 pb-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

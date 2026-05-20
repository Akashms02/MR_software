import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'

// Role-based Route Managers
import SuperAdminRouter from './superadmin/SuperAdminRouter'
import AdminRouter from './admin/AdminRouter'
import EmployeeRouter from './employee/EmployeeRouter'

export default function DashContainer({ rolePath }) {
  const { user } = useSelector(state => state.auth)
  
  let role = 'Employee';
  if (user && user.role) {
    role = user.role;
  } else {
    try {
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser && localUser.role) role = localUser.role;
    } catch (e) {}
  }

  const normalizedRole = (role || '').toUpperCase().trim();
  const isSuperAdmin = normalizedRole === 'SUPER_ADMIN' || normalizedRole === 'SUPERADMIN' || normalizedRole === 'SUPER ADMIN';
  const isAdmin = normalizedRole === 'ADMIN';

  // Dynamic automatic path guard & redirection
  if (isSuperAdmin && rolePath !== 'superadmin') {
    return <Navigate to="/superadmin/dashboard" replace />
  }
  if (isAdmin && rolePath !== 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  if (!isSuperAdmin && !isAdmin && rolePath !== 'employee') {
    return <Navigate to="/employee/dashboard" replace />
  }

  const renderContent = () => {
    if (isSuperAdmin) {
      return <SuperAdminRouter />;
    }
    if (isAdmin) {
      return <AdminRouter />;
    }
    return <EmployeeRouter />;
  }

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  )
}

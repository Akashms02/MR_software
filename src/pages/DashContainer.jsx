import { useSelector } from 'react-redux'
import DashboardLayout from '../layouts/DashboardLayout'

// Role-based Route Managers
import SuperAdminRouter from './superadmin/SuperAdminRouter'
import AdminRouter from './admin/AdminRouter'
import EmployeeRouter from './employee/EmployeeRouter'

export default function DashContainer() {
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

  const renderContent = () => {
    const normalizedRole = role.toLowerCase();
    
    if (normalizedRole === 'superadmin' || normalizedRole === 'super admin' || normalizedRole === 'super_admin') {
      return <SuperAdminRouter />
    } 
    else if (normalizedRole.includes('admin') || normalizedRole === 'manager') {
      return <AdminRouter />
    } 
    else {
      return <EmployeeRouter />
    }
  }

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  )
}

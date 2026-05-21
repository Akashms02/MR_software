import { Routes, Route, Navigate } from 'react-router-dom'
import SuperAdminDashboard from './SuperAdminDashboard'
import AdminManagement from './AdminManagement'
import SystemSettings from './SystemSettings'

export default function SuperAdminRouter() {
  return (
    <Routes>
      <Route path="/" element={<SuperAdminDashboard />} />
      <Route path="dashboard" element={<SuperAdminDashboard />} />
      <Route path="admins" element={<AdminManagement />} />
      <Route path="system-settings" element={<SystemSettings />} />
      <Route path="*" element={<Navigate to="/superadmin/dashboard" replace />} />
    </Routes>
  )
}

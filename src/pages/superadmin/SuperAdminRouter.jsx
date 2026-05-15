import { Routes, Route, Navigate } from 'react-router-dom'
import SuperAdminDashboard from './SuperAdminDashboard'
import AdminManagement from './AdminManagement'

export default function SuperAdminRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/dashboard" replace />} />
      <Route path="dashboard" element={<SuperAdminDashboard />} />
      <Route path="admins" element={<AdminManagement />} />
      <Route path="*" element={<Navigate to="/dashboard/dashboard" replace />} />
    </Routes>
  )
}

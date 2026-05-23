import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SuperAdminLayout from './SuperAdminLayout'
import SuperAdminDashboard from '../../pages/superadmin/SuperAdminDashboard'
import AdminManagement from '../../pages/superadmin/AdminManagement'
import SystemSettings from '../../pages/superadmin/SystemSettings'

export default function SuperAdminLayoutRouter() {
  return (
    <SuperAdminLayout>
      <Routes>
        <Route path="/" element={<SuperAdminDashboard />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="admins" element={<AdminManagement />} />
        <Route path="system-settings" element={<SystemSettings />} />
        <Route path="*" element={<Navigate to="/superadmin/dashboard" replace />} />
      </Routes>
    </SuperAdminLayout>
  )
}

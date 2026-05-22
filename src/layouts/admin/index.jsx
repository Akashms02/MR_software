import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import AdminDashboard from '../../pages/admin/AdminDashboard'
import AdminEmployees from '../../pages/admin/AdminEmployees'
import AdminPayroll from '../../pages/admin/AdminPayroll'
import AdminAnalytics from '../../pages/admin/AdminAnalytics'
import AdminCompliance from '../../pages/admin/AdminCompliance'
import AdminAttendance from '../../pages/admin/AdminAttendance'
import TeamManagement from '../../pages/admin/TeamManagement'
import OnboardingWizard from '../../pages/admin/OnboardingWizard'
import WaterCooler from '../../pages/admin/WaterCooler'

export default function AdminLayoutRouter() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="employees" element={<AdminEmployees />} />
        <Route path="finance" element={<AdminPayroll />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="compliance" element={<AdminCompliance />} />
        <Route path="me" element={<AdminAttendance />} />
        <Route path="myteam" element={<TeamManagement />} />
        <Route path="myteam/onboard" element={<OnboardingWizard />} />
        <Route path="watercooler" element={<WaterCooler />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  )
}

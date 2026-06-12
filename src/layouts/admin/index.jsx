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
import DoctorOnboarding from '../../pages/admin/DoctorOnboarding'
import WaterCooler from '../../pages/admin/WaterCooler'
import AdminReports from '../../pages/admin/AdminReports'
import AdminTourPlanReviewPage from '../../pages/admin/AdminTourPlanReviewPage'
import AdminFieldTracking from '../../pages/admin/AdminFieldTracking'
import Documents from '../../pages/admin/Documents'
import AdminLeaveReviewPage from '../../pages/admin/AdminLeaveReviewPage'
import Holidays from '../../pages/admin/Holidays'
import Settings from '../../pages/admin/Settings'
import AdminRequestsPage from '../../pages/admin/AdminRequestsPage'
import NoticeManagement from '../../pages/admin/NoticeManagement'

export default function AdminLayoutRouter() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="employees" element={<AdminEmployees />} />
        <Route path="finance" element={<AdminPayroll />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="requests" element={<AdminRequestsPage />} />
        <Route path="tourplans" element={<AdminTourPlanReviewPage />} />
        <Route path="fieldtracking" element={<AdminFieldTracking />} />
        <Route path="leaves" element={<AdminLeaveReviewPage />} />
        <Route path="holidays" element={<Holidays />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="compliance" element={<AdminCompliance />} />
        <Route path="me" element={<AdminAttendance />} />
        <Route path="myteam" element={<TeamManagement />} />
        <Route path="myteam/onboard" element={<OnboardingWizard />} />
        <Route path="myteam/onboard-doctor" element={<DoctorOnboarding />} />
        <Route path="watercooler" element={<WaterCooler />} />
        <Route path="hrdocuments" element={<Documents />} />
        <Route path="notices" element={<NoticeManagement />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  )
}

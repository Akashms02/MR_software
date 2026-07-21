import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ManagerLayout from './ManagerLayout'
import ManagerDashboard from '../../pages/manager/ManagerDashboard'
import TeamManagement from '../../pages/admin/TeamManagement'
import OnboardingWizard from '../../pages/admin/OnboardingWizard'
import DoctorOnboarding from '../../pages/admin/DoctorOnboarding'
import DoctorAssignment from '../../pages/admin/DoctorAssignment'
import DcrReviewPage from '../../pages/admin/DcrReviewPage'
import AdminFieldTracking from '../../pages/admin/AdminFieldTracking'
import AdminLeaveReviewPage from '../../pages/admin/AdminLeaveReviewPage'
import AdminTourPlanReviewPage from '../../pages/admin/AdminTourPlanReviewPage'
import AdminAttendance from '../../pages/admin/AdminAttendance'
import WaterCooler from '../../pages/admin/WaterCooler'
import AdminSalesPage from '../../pages/admin/AdminSalesPage'
import EmployeeDocument from '../../pages/employee/EmployeeDocument'
import AdminVisualAidPage from '../../pages/admin/AdminVisualAidPage'

export default function ManagerLayoutRouter() {
  return (
    <ManagerLayout>
      <Routes>
        <Route path="/" element={<ManagerDashboard />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="myteam" element={<TeamManagement />} />
        <Route path="myteam/onboard" element={<OnboardingWizard />} />
        <Route path="myteam/onboard-doctor" element={<DoctorOnboarding />} />
        <Route path="myteam/assign-doctor" element={<DoctorAssignment />} />
        <Route path="dcr-approvals" element={<DcrReviewPage />} />
        <Route path="fieldtracking" element={<AdminFieldTracking />} />
        <Route path="leaves" element={<AdminLeaveReviewPage />} />
        <Route path="tourplans" element={<AdminTourPlanReviewPage />} />
        <Route path="sales" element={<AdminSalesPage />} />
        <Route path="finance" element={<EmployeeDocument />} />
        <Route path="products" element={<AdminVisualAidPage />} />
        <Route path="me" element={<AdminAttendance />} />
        <Route path="watercooler" element={<WaterCooler />} />
        <Route path="*" element={<Navigate to="/manager/dashboard" replace />} />
      </Routes>
    </ManagerLayout>
  )
}

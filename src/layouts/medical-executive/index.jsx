import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MedicalExecutiveLayout from './MedicalExecutiveLayout'
import MedicalExecutiveDashboard from '../../pages/medical-executive/MedicalExecutiveDashboard'
import MEReports from '../../pages/medical-executive/MEReports'
import EmployeePayslip from '../../pages/employee/EmployeePayslip'
import AdminAttendance from '../../pages/admin/AdminAttendance'
import WaterCooler from '../../pages/admin/WaterCooler'
import METourPlanPage from '../../pages/medical-executive/METourPlanPage'
import MEDoctorOnboarding from '../../pages/medical-executive/MEDoctorOnboarding'
import MERequestsPage from '../../pages/medical-executive/MERequestsPage'
import MEFieldTracking from '../../pages/medical-executive/MEFieldTracking'
import MELeaveReviewPage from '../../pages/medical-executive/MELeaveReviewPage'

const SettingsPlaceholder = () => (
  <div className="p-6 bg-white rounded-2xl border border-gray-200">
    <h3 className="text-[18px] font-extrabold text-gray-900 mb-2 m-0">Settings</h3>
    <p className="text-[13px] text-gray-500 m-0">Configure your personal preferences, notifications, and profile security here.</p>
  </div>
)

export default function MedicalExecutiveLayoutRouter() {
  return (
    <MedicalExecutiveLayout>
      <Routes>
        <Route path="/" element={<MedicalExecutiveDashboard />} />
        <Route path="dashboard" element={<MedicalExecutiveDashboard />} />
        <Route path="tourplan" element={<METourPlanPage />} />
        <Route path="requests" element={<MERequestsPage />} />
        <Route path="reports" element={<MEReports />} />
        <Route path="fieldtracking" element={<MEFieldTracking />} />
        <Route path="leaves" element={<MELeaveReviewPage />} />
        <Route path="onboard-doctor" element={<MEDoctorOnboarding />} />
        <Route path="finance" element={<EmployeePayslip />} />
        <Route path="me" element={<AdminAttendance />} />
        <Route path="watercooler" element={<WaterCooler />} />
        <Route path="settings" element={<SettingsPlaceholder />} />
        <Route path="*" element={<Navigate to="/medical-executive/dashboard" replace />} />
      </Routes>
    </MedicalExecutiveLayout>
  )
}

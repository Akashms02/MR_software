import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MedicalSalesExecutiveLayout from './MedicalSalesExecutiveLayout'
import MedicalSalesExecutiveDashboard from '../../pages/medical-sales-executive/MedicalSalesExecutiveDashboard'
import MSEReports from '../../pages/medical-sales-executive/MSEReports'
import MSEPayslip from '../../pages/medical-sales-executive/MSEPayslip'
import AdminAttendance from '../../pages/admin/AdminAttendance'
import MSETourPlanPage from '../../pages/medical-sales-executive/MSETourPlanPage'
import MSEDoctorOnboarding from '../../pages/medical-sales-executive/MSEDoctorOnboarding'
import MSERequestsPage from '../../pages/medical-sales-executive/MSERequestsPage'
import MSEFieldTracking from '../../pages/medical-sales-executive/MSEFieldTracking'
import MSELeaveReviewPage from '../../pages/medical-sales-executive/MSELeaveReviewPage'

const SettingsPlaceholder = () => (
  <div className="p-6 bg-white rounded-2xl border border-gray-200">
    <h3 className="text-[18px] font-extrabold text-gray-900 mb-2 m-0">Settings</h3>
    <p className="text-[13px] text-gray-500 m-0">Configure your personal preferences, notifications, and profile security here.</p>
  </div>
)

export default function MedicalSalesExecutiveLayoutRouter() {
  return (
    <MedicalSalesExecutiveLayout>
      <Routes>
        <Route path="/" element={<MedicalSalesExecutiveDashboard />} />
        <Route path="dashboard" element={<MedicalSalesExecutiveDashboard />} />
        <Route path="tourplan" element={<MSETourPlanPage />} />
        <Route path="requests" element={<MSERequestsPage />} />
        <Route path="reports" element={<MSEReports />} />
        <Route path="fieldtracking" element={<MSEFieldTracking />} />
        <Route path="leaves" element={<MSELeaveReviewPage />} />
        <Route path="onboard-doctor" element={<MSEDoctorOnboarding />} />
        <Route path="finance" element={<MSEPayslip />} />
        <Route path="me" element={<AdminAttendance />} />
        <Route path="settings" element={<SettingsPlaceholder />} />
        <Route path="*" element={<Navigate to="/medical-sales-executive/dashboard" replace />} />
      </Routes>
    </MedicalSalesExecutiveLayout>
  )
}

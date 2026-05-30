import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MRLayout from './MRLayout'
import MRDashboard from '../../pages/mr/MRDashboard'
import MRDcrPage from '../../pages/mr/MRDcrPage'
import MRAttendancePage from '../../pages/mr/MRAttendancePage'
import MRReports from '../../pages/mr/MRReports'
import EmployeePayslip from '../../pages/employee/EmployeePayslip'
import AdminAttendance from '../../pages/admin/AdminAttendance'
import WaterCooler from '../../pages/admin/WaterCooler'
import MRTourPlanPage from '../../pages/mr/MRTourPlanPage'
import MRLeavePage from '../../pages/mr/MRLeavePage'

const SettingsPlaceholder = () => (
  <div className="p-6 bg-white rounded-2xl border border-gray-200">
    <h3 className="text-[18px] font-extrabold text-gray-900 mb-2">Settings</h3>
    <p className="text-[13px] text-gray-500">Configure your personal preferences, notifications, and profile security here.</p>
  </div>
)

export default function MRLayoutRouter() {
  return (
    <MRLayout>
      <Routes>
        <Route path="/" element={<MRDashboard />} />
        <Route path="dashboard" element={<MRDashboard />} />
        <Route path="dcr" element={<MRDcrPage />} />
        <Route path="attendance" element={<MRAttendancePage />} />
        <Route path="tourplan" element={<MRTourPlanPage />} />
        <Route path="reports" element={<MRReports />} />
        <Route path="leaves" element={<MRLeavePage />} />
        <Route path="finance" element={<EmployeePayslip />} />
        <Route path="me" element={<AdminAttendance />} />
        <Route path="watercooler" element={<WaterCooler />} />
        <Route path="settings" element={<SettingsPlaceholder />} />
        <Route path="*" element={<Navigate to="/mr/dashboard" replace />} />
      </Routes>
    </MRLayout>
  )
}

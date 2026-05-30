import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import RegionalManagerLayout from './RegionalManagerLayout'
import RegionalManagerDashboard from '../../pages/regional-manager/RegionalManagerDashboard'
import EmployeePayslip from '../../pages/employee/EmployeePayslip'
import AdminAttendance from '../../pages/admin/AdminAttendance'
import WaterCooler from '../../pages/admin/WaterCooler'

const SettingsPlaceholder = () => (
  <div className="p-6 bg-white rounded-2xl border border-gray-200">
    <h3 className="text-[18px] font-extrabold text-gray-900 mb-2 mt-0">Settings</h3>
    <p className="text-[13px] text-gray-500 m-0">Configure your personal preferences, notifications, and profile security here.</p>
  </div>
)

export default function RegionalManagerLayoutRouter() {
  return (
    <RegionalManagerLayout>
      <Routes>
        <Route path="/" element={<RegionalManagerDashboard />} />
        <Route path="dashboard" element={<RegionalManagerDashboard />} />
        <Route path="finance" element={<EmployeePayslip />} />
        <Route path="me" element={<AdminAttendance />} />
        <Route path="watercooler" element={<WaterCooler />} />
        <Route path="settings" element={<SettingsPlaceholder />} />
        <Route path="*" element={<Navigate to="/regional-manager/dashboard" replace />} />
      </Routes>
    </RegionalManagerLayout>
  )
}

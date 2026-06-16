import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HRLayout from './HRLayout'
import HRDashboard from '../../pages/hr/HRDashboard'
import EmployeeDocument from '../../pages/employee/EmployeeDocument'
import AdminAttendance from '../../pages/admin/AdminAttendance'
import WaterCooler from '../../pages/admin/WaterCooler'

const SettingsPlaceholder = () => (
  <div className="p-6 bg-white rounded-2xl border border-gray-200">
    <h3 className="text-[18px] font-extrabold text-gray-900 mb-2 mt-0">Settings</h3>
    <p className="text-[13px] text-gray-500 m-0">Configure your personal preferences, notifications, and profile security here.</p>
  </div>
)

export default function HRLayoutRouter() {
  return (
    <HRLayout>
      <Routes>
        <Route path="/" element={<HRDashboard />} />
        <Route path="dashboard" element={<HRDashboard />} />
        <Route path="finance" element={<EmployeeDocument />} />
        <Route path="me" element={<AdminAttendance />} />
        <Route path="watercooler" element={<WaterCooler />} />
        <Route path="settings" element={<SettingsPlaceholder />} />
        <Route path="*" element={<Navigate to="/hr/dashboard" replace />} />
      </Routes>
    </HRLayout>
  )
}

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DoctorLayout from './DoctorLayout'
import DoctorDashboard from '../../pages/doctor/DoctorDashboard'
import EmployeePayslip from '../../pages/employee/EmployeePayslip'
import AdminAttendance from '../../pages/admin/AdminAttendance'
import WaterCooler from '../../pages/admin/WaterCooler'

const SettingsPlaceholder = () => (
  <div style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>Settings</h3>
    <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Configure your personal preferences, notifications, and profile security here.</p>
  </div>
)

export default function DoctorLayoutRouter() {
  return (
    <DoctorLayout>
      <Routes>
        <Route path="/" element={<DoctorDashboard />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="finance" element={<EmployeePayslip />} />
        <Route path="me" element={<AdminAttendance />} />
        <Route path="watercooler" element={<WaterCooler />} />
        <Route path="settings" element={<SettingsPlaceholder />} />
        <Route path="*" element={<Navigate to="/doctor/dashboard" replace />} />
      </Routes>
    </DoctorLayout>
  )
}

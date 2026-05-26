import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MedicalSalesExecutiveLayout from './MedicalSalesExecutiveLayout'
import MedicalSalesExecutiveDashboard from '../../pages/medical-sales-executive/MedicalSalesExecutiveDashboard'
import MSEReports from '../../pages/medical-sales-executive/MSEReports'
import EmployeePayslip from '../../pages/employee/EmployeePayslip'
import AdminAttendance from '../../pages/admin/AdminAttendance'
import WaterCooler from '../../pages/admin/WaterCooler'
import MSETourPlanPage from '../../pages/medical-sales-executive/MSETourPlanPage'

const SettingsPlaceholder = () => (
  <div style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>Settings</h3>
    <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Configure your personal preferences, notifications, and profile security here.</p>
  </div>
)

export default function MedicalSalesExecutiveLayoutRouter() {
  return (
    <MedicalSalesExecutiveLayout>
      <Routes>
        <Route path="/" element={<MedicalSalesExecutiveDashboard />} />
        <Route path="dashboard" element={<MedicalSalesExecutiveDashboard />} />
        <Route path="tourplan" element={<MSETourPlanPage />} />
        <Route path="reports" element={<MSEReports />} />
        <Route path="finance" element={<EmployeePayslip />} />
        <Route path="me" element={<AdminAttendance />} />
        <Route path="watercooler" element={<WaterCooler />} />
        <Route path="settings" element={<SettingsPlaceholder />} />
        <Route path="*" element={<Navigate to="/medical-sales-executive/dashboard" replace />} />
      </Routes>
    </MedicalSalesExecutiveLayout>
  )
}

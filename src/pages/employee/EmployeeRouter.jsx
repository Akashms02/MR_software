import { Routes, Route, Navigate } from 'react-router-dom'
import EmployeeDashboard from './EmployeeDashboard'
import EmployeePayslip from './EmployeePayslip'
// Assuming AdminAttendance is reused for employee 'me' section
import AdminAttendance from '../admin/AdminAttendance' 

export default function EmployeeRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/dashboard" replace />} />
      <Route path="dashboard" element={<EmployeeDashboard />} />
      <Route path="finance" element={<EmployeePayslip />} />
      <Route path="me" element={<AdminAttendance />} />
      <Route path="*" element={<Navigate to="/dashboard/dashboard" replace />} />
    </Routes>
  )
}

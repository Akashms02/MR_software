import { Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'
import AdminEmployees from './AdminEmployees'
import AdminPayroll from './AdminPayroll'
import AdminAnalytics from './AdminAnalytics'
import AdminCompliance from './AdminCompliance'
import AdminAttendance from './AdminAttendance'
import MyTeam from './MyTeam'
import WaterCooler from './WaterCooler'

export default function AdminRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="employees" element={<AdminEmployees />} />
      <Route path="finance" element={<AdminPayroll />} />
      <Route path="analytics" element={<AdminAnalytics />} />
      <Route path="compliance" element={<AdminCompliance />} />
      <Route path="me" element={<AdminAttendance />} />
      <Route path="myteam" element={<MyTeam />} />
      <Route path="watercooler" element={<WaterCooler />} />
      <Route path="*" element={<Navigate to="/dashboard/dashboard" replace />} />
    </Routes>
  )
}

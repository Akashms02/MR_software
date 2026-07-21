import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MRLayout from './MRLayout'
import MRDashboard from '../../pages/mr/MRDashboard'
import MRDcrPage from '../../pages/mr/MRDcrPage'
import MRAttendancePage from '../../pages/mr/MRAttendancePage'
import MRReports from '../../pages/mr/MRReports'
import MRDocument from '../../pages/mr/MRDocument'
import AdminAttendance from '../../pages/admin/AdminAttendance'
import WaterCooler from '../../pages/admin/WaterCooler'
import MRTourPlanPage from '../../pages/mr/MRTourPlanPage'
import MRLeavePage from '../../pages/mr/MRLeavePage'
import MRDoctorOnboarding from '../../pages/mr/MRDoctorOnboarding'
import MRRequestsPage from '../../pages/mr/MRRequestsPage'
import MRSalesPage from '../../pages/mr/MRSalesPage'
import DistributerReport from '../../pages/mr/DistributerReport'
import MRVisualAidPage from '../../pages/mr/MRVisualAidPage'

export default function MRLayoutRouter() {
  return (
    <MRLayout>
      <Routes>
        <Route path="/" element={<MRDashboard />} />
        <Route path="dashboard" element={<MRDashboard />} />
        <Route path="dcr" element={<MRDcrPage />} />
        <Route path="attendance" element={<MRAttendancePage />} />
        <Route path="tourplan" element={<MRTourPlanPage />} />
        <Route path="requests" element={<MRRequestsPage />} />
        <Route path="reports" element={<MRReports />} />
        <Route path="leaves" element={<MRLeavePage />} />
        <Route path="sales" element={<MRSalesPage />} />
        <Route path="distributor-report" element={<DistributerReport />} />
        <Route path="onboard-doctor" element={<MRDoctorOnboarding />} />
        <Route path="finance" element={<MRDocument />} />
        <Route path="products" element={<MRVisualAidPage />} />
        <Route path="me" element={<AdminAttendance />} />
        <Route path="watercooler" element={<WaterCooler />} />
        <Route path="*" element={<Navigate to="/mr/dashboard" replace />} />
      </Routes>
    </MRLayout>
  )
}

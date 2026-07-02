import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MedicalExecutiveLayout from './MedicalExecutiveLayout'
import MedicalExecutiveDashboard from '../../pages/medical-executive/MedicalExecutiveDashboard'
import MEReports from '../../pages/medical-executive/MEReports'
import MEDocument from '../../pages/medical-executive/MEDocument'
import AdminAttendance from '../../pages/admin/AdminAttendance'
import WaterCooler from '../../pages/admin/WaterCooler'
import METourPlanPage from '../../pages/medical-executive/METourPlanPage'
import MEDoctorOnboarding from '../../pages/medical-executive/MEDoctorOnboarding'
import MEDoctorAssignment from '../../pages/medical-executive/MEDoctorAssignment'
import MERequestsPage from '../../pages/medical-executive/MERequestsPage'
import MEFieldTracking from '../../pages/medical-executive/MEFieldTracking'
import MELeaveReviewPage from '../../pages/medical-executive/MELeaveReviewPage'
import MESalesPage from '../../pages/medical-executive/MESalesPage'


export default function MedicalExecutiveLayoutRouter() {
  return (
    <MedicalExecutiveLayout>
      <Routes>
        <Route path="/" element={<MedicalExecutiveDashboard />} />
        <Route path="dashboard" element={<MedicalExecutiveDashboard />} />
        <Route path="tourplan" element={<METourPlanPage />} />
        <Route path="requests" element={<MERequestsPage />} />
        <Route path="reports" element={<MEReports />} />
        <Route path="sales" element={<MESalesPage />} />
        <Route path="fieldtracking" element={<MEFieldTracking />} />
        <Route path="leaves" element={<MELeaveReviewPage />} />
        <Route path="onboard-doctor" element={<MEDoctorOnboarding />} />
        <Route path="assign-doctor" element={<MEDoctorAssignment />} />
        <Route path="finance" element={<MEDocument />} />
        <Route path="me" element={<AdminAttendance />} />
        <Route path="watercooler" element={<WaterCooler />} />
        <Route path="*" element={<Navigate to="/medical-executive/dashboard" replace />} />
      </Routes>
    </MedicalExecutiveLayout>
  )
}

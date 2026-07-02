import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MedicalSalesExecutiveLayout from './MedicalSalesExecutiveLayout'
import MedicalSalesExecutiveDashboard from '../../pages/medical-sales-executive/MedicalSalesExecutiveDashboard'
import MSEReports from '../../pages/medical-sales-executive/MSEReports'
import MSEDocument from '../../pages/medical-sales-executive/MSEDocument'
import AdminAttendance from '../../pages/admin/AdminAttendance'
import MSETourPlanPage from '../../pages/medical-sales-executive/MSETourPlanPage'
import MSEDoctorOnboarding from '../../pages/medical-sales-executive/MSEDoctorOnboarding'
import MSEDoctorAssignment from '../../pages/medical-sales-executive/MSEDoctorAssignment'
import MSERequestsPage from '../../pages/medical-sales-executive/MSERequestsPage'
import MSEFieldTracking from '../../pages/medical-sales-executive/MSEFieldTracking'
import MSELeaveReviewPage from '../../pages/medical-sales-executive/MSELeaveReviewPage'
import MSESalesPage from '../../pages/medical-sales-executive/MSESalesPage'


export default function MedicalSalesExecutiveLayoutRouter() {
  return (
    <MedicalSalesExecutiveLayout>
      <Routes>
        <Route path="/" element={<MedicalSalesExecutiveDashboard />} />
        <Route path="dashboard" element={<MedicalSalesExecutiveDashboard />} />
        <Route path="tourplan" element={<MSETourPlanPage />} />
        <Route path="requests" element={<MSERequestsPage />} />
        <Route path="reports" element={<MSEReports />} />
        <Route path="sales" element={<MSESalesPage />} />
        <Route path="fieldtracking" element={<MSEFieldTracking />} />
        <Route path="leaves" element={<MSELeaveReviewPage />} />
        <Route path="onboard-doctor" element={<MSEDoctorOnboarding />} />
        <Route path="assign-doctor" element={<MSEDoctorAssignment />} />
        <Route path="finance" element={<MSEDocument />} />
        <Route path="me" element={<AdminAttendance />} />
        <Route path="*" element={<Navigate to="/medical-sales-executive/dashboard" replace />} />
      </Routes>
    </MedicalSalesExecutiveLayout>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'

// Admin Pages
import AdminDashboard from './admin/AdminDashboard'
import AdminEmployees from './admin/AdminEmployees'
import AdminPayroll from './admin/AdminPayroll'
import AdminAnalytics from './admin/AdminAnalytics'
import AdminCompliance from './admin/AdminCompliance'
import AdminAttendance from './admin/AdminAttendance'
import MyTeam from './admin/MyTeam'
import WaterCooler from './admin/WaterCooler'

// Employee Pages
import EmployeeDashboard from './employee/EmployeeDashboard'
import EmployeePayslip from './employee/EmployeePayslip'

export default function DashContainer() {
  const navigate = useNavigate()
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'Employee')
  const [activePage, setActivePage] = useState('dashboard')

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole')
    if (!savedRole) {
      navigate('/login')
    } else {
      setRole(savedRole)
    }
  }, [navigate])

  const renderContent = () => {
    if (role === 'HR Admin' || role === 'Manager') {
      switch (activePage) {
        case 'dashboard':    return <AdminDashboard />
        case 'employees':    return <AdminEmployees />
        case 'finance':      return <AdminPayroll />
        case 'analytics':    return <AdminAnalytics />
        case 'compliance':   return <AdminCompliance />
        case 'me':           return <AdminAttendance />
        case 'myteam':       return <MyTeam />
        case 'watercooler':  return <WaterCooler />
        default:             return <AdminDashboard />
      }
    } else {
      // Employee role
      switch (activePage) {
        case 'dashboard':    return <EmployeeDashboard />
        case 'finance':      return <EmployeePayslip />
        case 'me':           return <AdminAttendance /> // Reuse or use specific employee view if exists
        default:             return <EmployeeDashboard />
      }
    }
  }

  return (
    <DashboardLayout role={role} activePage={activePage} setActivePage={setActivePage}>
      {renderContent()}
    </DashboardLayout>
  )
}

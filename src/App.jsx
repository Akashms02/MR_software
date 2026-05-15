import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage    from './pages/landing/LandingPage'
import LoginPage      from './pages/login/LoginPage'
import DashContainer from './pages/DashContainer'

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<LandingPage />} />
      <Route path="/login"     element={<LoginPage />} />
      <Route path="/dashboard" element={<DashContainer />} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  )
}

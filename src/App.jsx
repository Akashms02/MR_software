import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';


// Components
import LandingPage from './landing/LandingPage';
import LoginPage from './login/LoginPage';
import ForgotPasswordPage from './login/ForgotPasswordPage';
import CreatePasswordPage from './login/CreatePasswordPage';
import ProtectedRoute from './components/ProtectedRoute';

// Layout Routers for Roles
import SuperAdminLayoutRouter from './layouts/superadmin';
import AdminLayoutRouter from './layouts/admin';
import MRLayoutRouter from './layouts/mr';
import HRLayoutRouter from './layouts/hr';
import RegionalManagerLayoutRouter from './layouts/regional-manager';
import AreaManagerLayoutRouter from './layouts/area-manager';
import MedicalManagerLayoutRouter from './layouts/medical-manager';
import DoctorLayoutRouter from './layouts/doctor';
import PharmacistLayoutRouter from './layouts/pharmacist';
import DistributorLayoutRouter from './layouts/distributor';
import PatientLayoutRouter from './layouts/patient';
import MedicalExecutiveLayoutRouter from './layouts/medical-executive';
import MedicalSalesExecutiveLayoutRouter from './layouts/medical-sales-executive';

function DashboardRedirect() {
  const { user } = useSelector((state) => state.auth);
  
  let role = 'employee';
  if (user && user.role) {
    role = user.role;
  } else {
    try {
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser && localUser.role) role = localUser.role;
    } catch (e) {}
  }
  
  const normalizedRole = (role || '').toUpperCase().trim();
  
  switch (normalizedRole) {
    case 'SUPER_ADMIN':
    case 'SUPERADMIN':
    case 'SUPER ADMIN':
      return <Navigate to="/superadmin/dashboard" replace />;
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'MR':
      return <Navigate to="/mr/dashboard" replace />;
    case 'HR':
      return <Navigate to="/hr/dashboard" replace />;
    case 'REGIONAL_MANAGER':
    case 'REGIONAL MANAGER':
      return <Navigate to="/regional-manager/dashboard" replace />;
    case 'AREA_MANAGER':
    case 'AREA MANAGER':
      return <Navigate to="/area-manager/dashboard" replace />;
    case 'MEDICAL_MANAGER':
    case 'MEDICAL MANAGER':
      return <Navigate to="/medical-manager/dashboard" replace />;
    case 'DOCTOR':
      return <Navigate to="/doctor/dashboard" replace />;
    case 'PHARMACIST':
      return <Navigate to="/pharmacist/dashboard" replace />;
    case 'DISTRIBUTOR':
      return <Navigate to="/distributor/dashboard" replace />;
    case 'PATIENT':
      return <Navigate to="/patient/dashboard" replace />;
    case 'MEDICAL_EXECUTIVE':
    case 'MEDICAL EXECUTIVE':
    case 'ME':
      return <Navigate to="/medical-executive/dashboard" replace />;
    case 'MEDICAL_SALES_EXECUTIVE':
    case 'MEDICAL SALES EXECUTIVE':
    case 'MSE':
    case 'MEDICAL_SALES_REPRESENTATIVE':
    case 'MEDICAL SALES REPRESENTATIVE':
    case 'MSR':
      return <Navigate to="/medical-sales-executive/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

// Actions & Utils
import { initializeAuth, refreshToken, logout } from './redux/actions/authActions';


export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // 1. Initial Synchronization on App Boot
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // 2. Token Refresh Scheduler (Triggers immediately and then every 5 minutes if authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;

    let refreshTimer;

    const runRefresh = async () => {
      const rToken = localStorage.getItem("refreshToken");
      console.log("[Auth Scheduler] Checking refresh token...", { rToken });
      
      if (rToken) {
        console.log("%c[Auth Scheduler] Hitting refresh token API...", "color: #00ff00; font-weight: bold;");
        const success = await dispatch(refreshToken({ refreshToken: rToken }));
        if (!success) {
          console.warn("[Auth Scheduler] Refresh token failed or was rejected. Logging out...");
          dispatch(logout());
          return;
        }
      } else {
        console.warn("[Auth Scheduler] No refresh token found in localStorage. Logging out...");
        dispatch(logout());
        return;
      }
      // Schedule the next check in 5 minutes (300,000 ms)
      refreshTimer = setTimeout(runRefresh, 300000);
    };

    // Run 2 seconds after mount/login so they can see it instantly on load
    refreshTimer = setTimeout(runRefresh, 2000);

    return () => {
      clearTimeout(refreshTimer);
    };
  }, [dispatch, isAuthenticated]);

  // 3. Register Firebase Cloud Messaging (FCM) Push Notifications
  useEffect(() => {
    if (isAuthenticated) {
      import('./utils/firebase')
        .then(({ requestForToken }) => {
          requestForToken();
        })
        .catch((err) => {
          console.error('[App] Failed to load firebase utilities:', err);
        });
    }
  }, [isAuthenticated]);

  // 4. Proactive Session Heartbeat & Cross-Tab Sync (Commented out until /profile API is stable)
  /*
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleStorageChange = (e) => {
      if (e.key === "logout") {
        window.location.reload();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    const interval = setInterval(async () => {
      try {
        // Adjust heartbeat URL based on role if needed
        const heartbeatUrl = `${API_ROUTE}/auth/me`;
        await axios.get(heartbeatUrl);
      } catch (err) {
        // Errors are handled globally by axiosInstance interceptor
      }
    }, 60000); // Heartbeat every minute

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [isAuthenticated, user]);
  */

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/create-password" element={<CreatePasswordPage />} />
      
      {/* Role-Specific Layout Routers */}
      <Route
        path="/superadmin/*"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'super_admin', 'super admin']}>
            <SuperAdminLayoutRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayoutRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mr/*"
        element={
          <ProtectedRoute allowedRoles={['mr']}>
            <MRLayoutRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/*"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <HRLayoutRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/regional-manager/*"
        element={
          <ProtectedRoute allowedRoles={['regional_manager', 'regional manager']}>
            <RegionalManagerLayoutRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/area-manager/*"
        element={
          <ProtectedRoute allowedRoles={['area_manager', 'area manager']}>
            <AreaManagerLayoutRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medical-manager/*"
        element={
          <ProtectedRoute allowedRoles={['medical_manager', 'medical manager']}>
            <MedicalManagerLayoutRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/*"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorLayoutRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/*"
        element={
          <ProtectedRoute allowedRoles={['pharmacist']}>
            <PharmacistLayoutRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/distributor/*"
        element={
          <ProtectedRoute allowedRoles={['distributor']}>
            <DistributorLayoutRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/*"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientLayoutRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medical-executive/*"
        element={
          <ProtectedRoute allowedRoles={['medical_executive', 'medical executive', 'me']}>
            <MedicalExecutiveLayoutRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medical-sales-executive/*"
        element={
          <ProtectedRoute allowedRoles={['medical_sales_representative', 'medical sales representative', 'msr', 'medical_sales_executive', 'medical sales executive', 'mse']}>
            <MedicalSalesExecutiveLayoutRouter />
          </ProtectedRoute>
        }
      />

      {/* Redirect fallbacks for legacy or generic paths */}
      <Route
        path="/employee/*"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

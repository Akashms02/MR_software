import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Eagerly loaded components for instant landing page boot
import LandingPage from './landing/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded authentication & secondary pages for fast initial FCP/LCP
const LoginPage = lazy(() => import('./login/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./login/ForgotPasswordPage'));
const CreatePasswordPage = lazy(() => import('./login/CreatePasswordPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const AccountDeletionPage = lazy(() => import('./pages/AccountDeletionPage'));
const DeleteAccountPolicyPage = lazy(() => import('./pages/DeleteAccountPolicyPage'));

// Lazy-loaded Role Layout Routers
const SuperAdminLayoutRouter = lazy(() => import('./layouts/superadmin'));
const AdminLayoutRouter = lazy(() => import('./layouts/admin'));
const MRLayoutRouter = lazy(() => import('./layouts/mr'));
const HRLayoutRouter = lazy(() => import('./layouts/hr'));
const ManagerLayoutRouter = lazy(() => import('./layouts/manager'));
const DoctorLayoutRouter = lazy(() => import('./layouts/doctor'));
const PharmacistLayoutRouter = lazy(() => import('./layouts/pharmacist'));
const DistributorLayoutRouter = lazy(() => import('./layouts/distributor'));
const PatientLayoutRouter = lazy(() => import('./layouts/patient'));

// Fast fallback spinner for lazy route transitions
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-400">Loading Medistrax...</p>
    </div>
  </div>
);

function DashboardRedirect() {
  const { user } = useSelector((state) => state.auth);

  let role = 'employee';
  if (user && user.role) {
    role = user.role;
  } else {
    try {
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser && localUser.role) role = localUser.role;
    } catch (e) { }
  }

  if (isFieldSalesRole(role)) {
    return <Navigate to="/mr/dashboard" replace />;
  }
  if (isManagerRole(role)) {
    return <Navigate to="/manager/dashboard" replace />;
  }

  const normalizedRole = (role || '').toUpperCase().trim();

  switch (normalizedRole) {
    case 'SUPER_ADMIN':
    case 'SUPERADMIN':
    case 'SUPER ADMIN':
      return <Navigate to="/superadmin/dashboard" replace />;
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'HR':
      return <Navigate to="/hr/dashboard" replace />;
    case 'DOCTOR':
      return <Navigate to="/doctor/dashboard" replace />;
    case 'PHARMACIST':
      return <Navigate to="/pharmacist/dashboard" replace />;
    case 'DISTRIBUTOR':
      return <Navigate to="/distributor/dashboard" replace />;
    case 'PATIENT':
      return <Navigate to="/patient/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

// Actions & Utils
import { initializeAuth, refreshToken, logout } from './redux/actions/authActions';
import { isManagerRole, isFieldSalesRole } from './utils/roleHelpers';


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
      if (rToken) {
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
      // Schedule the next check in 29 minutes (1,740,000 ms)
      refreshTimer = setTimeout(runRefresh, 1740000);
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
      let unsubscribe;
      import('./utils/firebase')
        .then(({ requestForToken, onMessageListener }) => {
          requestForToken();

          unsubscribe = onMessageListener((payload) => {
            console.log('%c[FCM] Notification Received in Foreground:', 'color: #00ff00; font-weight: bold;', payload);
            if (payload.notification) {
              const { title, body } = payload.notification;
              alert(`[Medistrax Alert]\nTitle: ${title}\nMessage: ${body}`);
            }
          });
        })
        .catch((err) => {
          console.error('[App] Failed to load firebase utilities:', err);
        });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [isAuthenticated]);

  // 4. WebSocket Notifications Connection
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    let socket = null;
    let reconnectTimer = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let active = true;

    import('./utils/websocket').then(({ getWebSocketUrl }) => {
      import('./redux/actions/notificationActions').then(({ receiveNotification }) => {
        if (!active) return;

        const wsUrl = `${getWebSocketUrl()}?token=${token}`;

        const connect = () => {
          if (!active) return;
          console.log('[WebSocket] Connecting to:', wsUrl);
          socket = new WebSocket(wsUrl);

          socket.onopen = () => {
            console.log('%c[WebSocket] Connected to notification server', 'color: #00ff00; font-weight: bold;');
            reconnectAttempts = 0;
          };

          socket.onmessage = (event) => {
            try {
              const notification = JSON.parse(event.data);
              console.log('%c[WebSocket] Received notification:', 'color: #00ff00; font-weight: bold;', notification);
              dispatch(receiveNotification(notification));

              if (notification.title || notification.message || notification.description) {
                const title = notification.title || 'New Alert';
                const msg = notification.message || notification.description || 'You have a new notification';
                alert(`[Notification Alert]\nTitle: ${title}\nMessage: ${msg}`);
              }
            } catch (err) {
              console.error('[WebSocket] Failed to parse message:', err);
            }
          };

          socket.onclose = (event) => {
            console.log('[WebSocket] Connection closed:', event.reason);
            if (active && reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              console.log(`[WebSocket] Reconnecting in 5s... (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
              reconnectTimer = setTimeout(connect, 5000);
            }
          };

          socket.onerror = (err) => {
            console.error('[WebSocket] Connection error:', err);
          };
        };

        connect();
      });
    });

    return () => {
      active = false;
      if (socket) {
        socket.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [dispatch, isAuthenticated]);

  // 5. Proactive Session Heartbeat & Cross-Tab Sync (Commented out until /profile API is stable)
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
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/account-deletion" element={<AccountDeletionPage />} />
        <Route path="/delete-account-policy" element={<DeleteAccountPolicyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/create-password" element={<CreatePasswordPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

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
          path="/manager/*"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerLayoutRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/regional-manager/*"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerLayoutRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/area-manager/*"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerLayoutRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medical-manager/*"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerLayoutRouter />
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
    </Suspense>
  );
}

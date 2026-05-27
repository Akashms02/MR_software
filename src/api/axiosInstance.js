import axios from 'axios';
import { API_ROUTE } from '../data/env';

let _accessToken = localStorage.getItem('accessToken') || null;

export const setAccessToken = (token) => {
  _accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
    // Also set common header as fallback
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const getAccessToken = () => _accessToken;

let _isRefreshing = false;
let _failedQueue = [];

export const isRefreshing = () => _isRefreshing;

const processQueue = (error, token = null) => {
  _failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  _failedQueue = [];
};

const shouldForceLogout = (error) => {
  const status = error?.response?.status;
  return status === 400 || status === 401 || status === 403;
};


export const silentRefresh = async () => {
  if (_isRefreshing) {
    // Already refreshing – wait for it to finish
    return new Promise((resolve, reject) => _failedQueue.push({ resolve, reject }));
  }

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.warn('[Auth] silentRefresh: No refresh token found. Logging out.');
    handleLogoutRedirect('missing_refresh_token');
    return null;
  }

  _isRefreshing = true;

  try {
    const res = await axios.post(`${API_ROUTE}/auth/refresh-token`, { refreshToken });
    const resData = res.data;

    const ok = resData?.status === 200 || resData?.status === 'SUCCESS' || resData?.success === true;
    const payload = resData?.data || resData; // Handle different API response shapes
    const newAccessToken = payload?.accessToken || payload?.token;
    const newRefreshToken = payload?.refreshToken || payload?.refresh_token;
    const expiresIn = payload?.expiresIn || payload?.expireIn || 900;

    if (ok && newAccessToken) {
      setAccessToken(newAccessToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('expiryTime', Date.now() + expiresIn * 1000);

      processQueue(null, newAccessToken);
      return newAccessToken;
    } else {
      throw new Error('Refresh response did not contain a valid access token.');
    }
  } catch (err) {
    console.error('[Auth] silentRefresh: ❌ Failed –', err.message);
    processQueue(err, null);
    // Force logout only when refresh token is actually invalid/unauthorized.
    if (shouldForceLogout(err)) {
      handleLogoutRedirect('refresh_rejected', {
        status: err?.response?.status,
        message: err?.response?.data?.message || err?.message,
      });
    }
    return null;
  } finally {
    _isRefreshing = false;
  }
};

// ─────────────────────────────────────────────
// 4. GLOBAL REQUEST INTERCEPTOR (attach token)
// ─────────────────────────────────────────────
const PUBLIC_ROUTES = ['/auth/login', '/auth/refresh', '/auth/refresh-token', '/otp/'];

const isPublic = (url = '') => PUBLIC_ROUTES.some((r) => url.includes(r));

axios.defaults.withCredentials = false;
axios.defaults.timeout = 60000;

axios.interceptors.request.use(
  (config) => {
    // Check if it's our API (relative URL or matches API_ROUTE)
    const isOurApi = !config.url.startsWith('http') || config.url.includes(API_ROUTE);

    if (isOurApi) {
      const token = _accessToken;
      if (token && token.startsWith('mock-')) {
        config.adapter = async (cfg) => {
          let mockData = {};
          if (cfg.url.includes('/auth/me')) {
            if (token === 'mock-executive-token') {
              mockData = {
                success: true,
                data: {
                  role: "MEDICAL_EXECUTIVE",
                  fullName: "Alex Executive",
                  email: "executive@mrmedical.com",
                  id: "EMP-ME-001"
                }
              };
            } else if (token === 'mock-mr-token') {
              mockData = {
                success: true,
                data: {
                  role: "MR",
                  fullName: "Marcus Rep",
                  email: "mr@mrmedical.com",
                  id: "EMP-MR-001"
                }
              };
            } else {
              mockData = {
                success: true,
                data: {
                  role: "MEDICAL_SALES_EXECUTIVE",
                  fullName: "Sam SalesRep",
                  email: "salesrep@mrmedical.com",
                  id: "EMP-MSE-001"
                }
              };
            }
          } else if (cfg.url.includes('/auth/logout')) {
            mockData = { success: true };
          } else if (cfg.url.includes('/auth/refresh-token')) {
            mockData = {
              success: true,
              data: {
                accessToken: token,
                refreshToken: "mock-refresh",
                expiresIn: 900
              }
            };
          } else if (cfg.url.includes('/doctor') && cfg.method === 'get') {
            mockData = {
              success: true,
              data: [
                { id: 1, fullName: 'Dr. Ramesh Sharma', speciality: 'CARDIOLOGY', clinicName: 'City Heart Clinic' },
                { id: 2, fullName: 'Dr. Sunita Patel', speciality: 'PEDIATRICS', clinicName: 'Metro General Hospital' },
                { id: 3, fullName: 'Dr. Vivek Verma', speciality: 'ORTHOPEDICS', clinicName: 'Verma Ortho Care' },
                { id: 4, fullName: 'Dr. Neha Gupta', speciality: 'GENERAL PHYSICIAN', clinicName: 'Care Clinic' },
              ]
            };
          } else if (cfg.url.includes('/dcr/me') && cfg.method === 'get') {
            let dcrs = [];
            try {
              const saved = localStorage.getItem('mock_dcrs');
              if (saved) {
                dcrs = JSON.parse(saved);
              } else {
                dcrs = [
                  {
                    id: 101,
                    mrName: 'Amit Verma',
                    reportDate: '2026-05-24',
                    status: 'APPROVED',
                    remarks: 'Excellent feedback on cardiology products.',
                    visits: [
                      {
                        doctorId: 1,
                        visitTime: '11:30:00',
                        productsDiscussed: 'MR-Cardio 10mg, MR-HeartCare',
                        samplesGiven: 'MR-Cardio 10mg (5 tablets)',
                        feedback: 'Doctor was receptive, requested more literature',
                        isGpsVerified: true
                      }
                    ]
                  },
                  {
                    id: 102,
                    mrName: 'Rohan Deshmukh',
                    reportDate: '2026-05-25',
                    status: 'SUBMITTED',
                    remarks: '',
                    visits: [
                      {
                        doctorId: 2,
                        visitTime: '12:00:00',
                        productsDiscussed: 'Asthalin Inhaler',
                        samplesGiven: 'Asthalin Inhaler (2 units)',
                        feedback: 'Requested visit next week for orthopedics division updates',
                        isGpsVerified: true
                      }
                    ]
                  }
                ];
                localStorage.setItem('mock_dcrs', JSON.stringify(dcrs));
              }
            } catch (e) {}
            mockData = { success: true, status: 200, data: dcrs };
          } else if (cfg.url.includes('/dcr/team') && cfg.method === 'get') {
            let dcrs = [];
            try {
              const saved = localStorage.getItem('mock_dcrs');
              if (saved) {
                dcrs = JSON.parse(saved);
              } else {
                dcrs = [
                  {
                    id: 101,
                    mrName: 'Amit Verma',
                    reportDate: '2026-05-24',
                    status: 'APPROVED',
                    remarks: 'Excellent feedback on cardiology products.',
                    visits: [
                      {
                        doctorId: 1,
                        visitTime: '11:30:00',
                        productsDiscussed: 'MR-Cardio 10mg, MR-HeartCare',
                        samplesGiven: 'MR-Cardio 10mg (5 tablets)',
                        feedback: 'Doctor was receptive, requested more literature',
                        isGpsVerified: true
                      }
                    ]
                  },
                  {
                    id: 102,
                    mrName: 'Rohan Deshmukh',
                    reportDate: '2026-05-25',
                    status: 'SUBMITTED',
                    remarks: '',
                    visits: [
                      {
                        doctorId: 2,
                        visitTime: '12:00:00',
                        productsDiscussed: 'Asthalin Inhaler',
                        samplesGiven: 'Asthalin Inhaler (2 units)',
                        feedback: 'Requested visit next week for orthopedics division updates',
                        isGpsVerified: true
                      }
                    ]
                  },
                  {
                    id: 103,
                    mrName: 'Sanjay Dutt',
                    reportDate: '2026-05-25',
                    status: 'SUBMITTED',
                    remarks: '',
                    visits: [
                      {
                        doctorId: 3,
                        visitTime: '14:15:00',
                        productsDiscussed: 'Calpol 650mg',
                        samplesGiven: 'Calpol leaflets',
                        feedback: 'Requested regular follow ups',
                        isGpsVerified: true
                      }
                    ]
                  }
                ];
                localStorage.setItem('mock_dcrs', JSON.stringify(dcrs));
              }
            } catch (e) {}
            mockData = { success: true, status: 200, data: dcrs };
          } else if (cfg.url.includes('/dcr/') && cfg.url.includes('/review') && cfg.method === 'put') {
            const parts = cfg.url.split('/');
            const reviewIdx = parts.indexOf('review');
            const dcrId = parseInt(parts[reviewIdx - 1]);
            
            // Extract status and remarks from query parameters
            let status = 'APPROVED';
            let remarks = '';
            try {
              const urlStr = cfg.url.startsWith('http') ? cfg.url : 'http://localhost' + cfg.url;
              const urlObj = new URL(urlStr);
              status = urlObj.searchParams.get('status') || 'APPROVED';
              remarks = urlObj.searchParams.get('remarks') || '';
            } catch (e) {}

            let dcrs = [];
            try {
              const saved = localStorage.getItem('mock_dcrs');
              if (saved) dcrs = JSON.parse(saved);
            } catch (e) {}

            const dcr = dcrs.find(d => d.id === dcrId);
            if (dcr) {
              dcr.status = status;
              dcr.remarks = remarks;
              localStorage.setItem('mock_dcrs', JSON.stringify(dcrs));
            }
            mockData = { success: true, status: 200, message: `DCR status updated to ${status}.` };
          } else if (cfg.url.includes('/dcr/draft') && cfg.method === 'post') {
            const body = JSON.parse(cfg.data || '{}');
            let dcrs = [];
            try {
              const saved = localStorage.getItem('mock_dcrs');
              if (saved) dcrs = JSON.parse(saved);
            } catch (e) {}

            const newDcr = {
              id: Math.floor(Math.random() * 10000),
              mrName: 'Marcus Rep', // fallback default MR
              reportDate: body.reportDate,
              status: 'DRAFT',
              remarks: '',
              visits: body.visits || []
            };
            dcrs.push(newDcr);
            localStorage.setItem('mock_dcrs', JSON.stringify(dcrs));
            mockData = { success: true, status: 200, data: newDcr };
          } else if (cfg.url.includes('/dcr/') && cfg.url.includes('/submit') && cfg.method === 'post') {
            const parts = cfg.url.split('/');
            const submitIdx = parts.indexOf('submit');
            const dcrId = parseInt(parts[submitIdx - 1]);
            
            let dcrs = [];
            try {
              const saved = localStorage.getItem('mock_dcrs');
              if (saved) dcrs = JSON.parse(saved);
            } catch (e) {}

            const dcr = dcrs.find(d => d.id === dcrId);
            if (dcr) {
              dcr.status = 'SUBMITTED';
              localStorage.setItem('mock_dcrs', JSON.stringify(dcrs));
            }
            mockData = { success: true, status: 200, message: 'DCR submitted for approval.' };
          } else if (cfg.url.includes('/dcr/') && cfg.method === 'get') {
            const parts = cfg.url.split('/');
            const dcrIdStr = parts[parts.length - 1];
            const dcrId = parseInt(dcrIdStr);

            let dcrs = [];
            try {
              const saved = localStorage.getItem('mock_dcrs');
              if (saved) dcrs = JSON.parse(saved);
            } catch (e) {}

            const dcr = dcrs.find(d => d.id === dcrId);
            mockData = { success: true, status: 200, data: dcr || null };
          } else if (cfg.url.includes('/admin/my-team') && cfg.method === 'get') {
            mockData = {
              success: true,
              data: [
                { id: 1, fullName: 'Marcus Rep', email: 'mr@mrmedical.com', role: 'MR', status: 'ACTIVE' },
                { id: 2, fullName: 'Amit Verma', email: 'amit.verma@mrmedical.com', role: 'MR', status: 'ACTIVE' },
                { id: 3, fullName: 'Rohan Deshmukh', email: 'rohan.deshmukh@mrmedical.com', role: 'MR', status: 'ACTIVE' },
                { id: 4, fullName: 'Sanjay Dutt', email: 'sanjay.dutt@mrmedical.com', role: 'MR', status: 'ACTIVE' }
              ]
            };
          } else if (cfg.url.includes('/reports/') && cfg.method === 'get') {
            if (cfg.url.includes('visit-summary')) {
              mockData = {
                success: true,
                data: {
                  totalPlanned: 45,
                  totalCompleted: 38,
                  successRate: '84%',
                  territories: [
                    { name: 'Chennai South', planned: 20, completed: 18 },
                    { name: 'Chennai Central', planned: 15, completed: 12 },
                    { name: 'Chennai North', planned: 10, completed: 8 }
                  ]
                }
              };
            } else if (cfg.url.includes('datewise-daily')) {
              mockData = {
                success: true,
                data: [
                  { date: '2026-05-20', visits: 5, chemistCalls: 2, calls: 4, travelKm: 25 },
                  { date: '2026-05-21', visits: 6, chemistCalls: 3, calls: 5, travelKm: 32 },
                  { date: '2026-05-22', visits: 4, chemistCalls: 1, calls: 3, travelKm: 18 },
                  { date: '2026-05-23', visits: 7, chemistCalls: 4, calls: 6, travelKm: 40 },
                  { date: '2026-05-24', visits: 8, chemistCalls: 3, calls: 7, travelKm: 35 }
                ]
              };
            } else if (cfg.url.includes('call-visit')) {
              mockData = {
                success: true,
                data: [
                  { specialty: 'CARDIOLOGY', target: 15, actual: 14, samples: 10 },
                  { specialty: 'PEDIATRICS', target: 12, actual: 11, samples: 8 },
                  { specialty: 'ORTHOPEDICS', target: 10, actual: 8, samples: 5 },
                  { specialty: 'GENERAL PHYSICIAN', target: 8, actual: 5, samples: 4 }
                ]
              };
            } else if (cfg.url.includes('dcr-day')) {
              mockData = {
                success: true,
                data: {
                  date: '2026-05-24',
                  status: 'APPROVED',
                  approvedBy: 'Alex Executive',
                  comments: 'Great doctor visits today.',
                  expenses: { travel: 120, food: 80, status: 'APPROVED' },
                  doctorsMet: [
                    { name: 'Dr. Ramesh Sharma', clinic: 'City Heart Clinic', time: '11:30 AM', samples: 'Cardio 10mg', feedback: 'Very receptive' },
                    { name: 'Dr. Sunita Patel', clinic: 'Metro Hospital', time: '02:00 PM', samples: 'Pediatric drops', feedback: 'Requested more brochures' }
                  ]
                }
              };
            } else if (cfg.url.includes('daily-activity')) {
              mockData = {
                success: true,
                data: {
                  date: '2026-05-24',
                  plannedTerritory: 'Chennai South',
                  tourPlanStatus: 'APPROVED',
                  summary: {
                    workingStatus: 'Present',
                    totalVisits: 2,
                    productiveVisits: 2,
                    nonProductiveVisits: 0,
                    remarks: 'Visited target clinics in the south territory.'
                  }
                }
              };
            } else if (cfg.url.includes('weekly-cross')) {
              mockData = {
                success: true,
                data: [
                  { day: 'Mon', territory: 'Chennai South', doctorVisits: 5, chemistCalls: 2, dcrStatus: 'APPROVED' },
                  { day: 'Tue', territory: 'Chennai South', doctorVisits: 6, chemistCalls: 3, dcrStatus: 'APPROVED' },
                  { day: 'Wed', territory: 'Chennai Central', doctorVisits: 4, chemistCalls: 1, dcrStatus: 'APPROVED' },
                  { day: 'Thu', territory: 'Chennai Central', doctorVisits: 7, chemistCalls: 4, dcrStatus: 'SUBMITTED' },
                  { day: 'Fri', territory: 'Chennai North', doctorVisits: 8, chemistCalls: 3, dcrStatus: 'SUBMITTED' }
                ]
              };
            }
          }

          return {
            data: mockData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: cfg,
            request: {}
          };
        };
      } else if (!isPublic(config.url) && token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const response = error.response;

    if (response?.status === 401) {
      const msg = response?.data?.message || "";
      
      // Handle Multi-Device Logout (Prioritize over Refresh)
      if (msg.includes("Your session was terminated (Logged in on another device)")) {
        console.warn('[Auth] Multi-device logout detected. Force logging out.');
        handleLogoutRedirect('multi_device_logout', { message: msg });
        return Promise.reject(error);
      }

      // Handle Normal Token Expiry (Silent Refresh)
      if (!originalRequest._retry && !isPublic(originalRequest.url)) {
        console.warn('[Auth] 401 Unauthorized - Attempting silent token refresh.');
        originalRequest._retry = true;
        const newToken = await silentRefresh();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        } else {
          console.warn('[Auth] 401 Unauthorized - Silent refresh failed. Force logging out.');
          handleLogoutRedirect('session_expired');
        }
      }
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────
// 6. LOGOUT HELPER
// ─────────────────────────────────────────────
export const handleLogoutRedirect = (reason = 'unknown', meta = null) => {
  try {
    localStorage.setItem(
      'logoutReason',
      JSON.stringify({
        time: Date.now(),
        reason,
        meta,
      }),
    );
  } catch {
    // ignore
  }
  setAccessToken(null);
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('expiryTime');
  localStorage.setItem('logout', Date.now());
  window.location.href = '/login';
};

export default axios;

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

const getApiOrigin = () => {
  if (API_ROUTE.startsWith('http://') || API_ROUTE.startsWith('https://')) {
    try {
      return new URL(API_ROUTE).origin;
    } catch {
      return '';
    }
  }
  return '';
};

const getOrInitializeOnboardingRequests = () => {
  try {
    const saved = localStorage.getItem('mock_onboarding_requests');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}

  const defaultRequests = [
    {
      id: 201,
      type: "DOCTOR",
      name: "Dr. Stephen Strange",
      email: "doctorstrange@example.com",
      phone: "9876543009",
      address: "Sanctum Sanctorum, New York",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600008",
      latitude: 13.08268,
      longitude: 80.27072,
      doctorSpeciality: "NEUROLOGY",
      doctorQualification: "MD, PhD",
      doctorLicenseNumber: "MC-99999",
      status: "PENDING",
      remarks: "",
      submittedBy: "Marcus Rep"
    },
    {
      id: 202,
      type: "CHEMIST",
      name: "Strange Remedies Pharmacy",
      email: "strangeremedies@example.com",
      phone: "9876543008",
      address: "Bleecker Street, New York",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600008",
      latitude: 13.08270,
      longitude: 80.27074,
      chemistContactPerson: "Wong",
      status: "PENDING",
      remarks: "",
      submittedBy: "Marcus Rep"
    },
    {
      id: 1,
      type: "DOCTOR",
      name: "Dr. Ramesh Sharma",
      email: "ramesh@example.com",
      phone: "9876543010",
      address: "City Heart Clinic, Anna Nagar",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600040",
      latitude: 13.08500,
      longitude: 80.27200,
      doctorSpeciality: "CARDIOLOGY",
      doctorQualification: "MD",
      doctorLicenseNumber: "MC-10001",
      doctorId: 1,
      status: "APPROVED",
      remarks: "Approved for field visits",
      submittedBy: "Marcus Rep"
    },
    {
      id: 2,
      type: "DOCTOR",
      name: "Dr. Sunita Patel",
      email: "sunita@example.com",
      phone: "9876543011",
      address: "Metro General Hospital",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600006",
      latitude: 13.08000,
      longitude: 80.26800,
      doctorSpeciality: "PEDIATRICS",
      doctorQualification: "MD",
      doctorLicenseNumber: "MC-10002",
      doctorId: 2,
      status: "PENDING",
      remarks: "",
      submittedBy: "Marcus Rep"
    },
    {
      id: 3,
      type: "DOCTOR",
      name: "Dr. Vivek Verma",
      email: "vivek@example.com",
      phone: "9876543012",
      address: "Verma Ortho Care",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600008",
      latitude: 13.08200,
      longitude: 80.27400,
      doctorSpeciality: "ORTHOPEDICS",
      doctorQualification: "MS",
      doctorLicenseNumber: "MC-10003",
      doctorId: 3,
      status: "APPROVED",
      remarks: "Approved ortho clinic",
      submittedBy: "Marcus Rep"
    },
    {
      id: 4,
      type: "DOCTOR",
      name: "Dr. Neha Gupta",
      email: "neha@example.com",
      phone: "9876543013",
      address: "Care Clinic",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600008",
      latitude: 13.08400,
      longitude: 80.27600,
      doctorSpeciality: "GENERAL PHYSICIAN",
      doctorQualification: "MBBS",
      doctorLicenseNumber: "MC-10004",
      doctorId: 4,
      status: "APPROVED",
      remarks: "Approved clinic",
      submittedBy: "Marcus Rep"
    }
  ];

  try {
    localStorage.setItem('mock_onboarding_requests', JSON.stringify(defaultRequests));
  } catch (e) {}
  return defaultRequests;
};

axios.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || '';
    const apiOrigin = getApiOrigin();
    // API routes, uploads on API host, or relative paths
    const isOurApi =
      !requestUrl.startsWith('http') ||
      requestUrl.includes(API_ROUTE) ||
      (apiOrigin && requestUrl.startsWith(apiOrigin));

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
          } else if (cfg.url.includes('/doctor/unified-contacts') && cfg.method === 'get') {
            const mrList = [
              { id: 'EMP-MR-001', fullName: 'Marcus Rep', email: 'mr@mrmedical.com', role: 'MR', status: 'ACTIVE' },
              { id: '2', fullName: 'Amit Verma', email: 'amit.verma@mrmedical.com', role: 'MR', status: 'ACTIVE' },
              { id: '3', fullName: 'Rohan Deshmukh', email: 'rohan.deshmukh@mrmedical.com', role: 'MR', status: 'ACTIVE' },
              { id: '4', fullName: 'Sanjay Dutt', email: 'sanjay.dutt@mrmedical.com', role: 'MR', status: 'ACTIVE' }
            ];

            const onboardingReqs = getOrInitializeOnboardingRequests();

            let assignments = [];
            try {
              assignments = JSON.parse(localStorage.getItem('mock_assignments') || '[]');
            } catch (e) {}

            const mergedList = [
              { id: 1, fullName: 'Dr. Ramesh Sharma', speciality: 'CARDIOLOGY', clinicName: 'City Heart Clinic', type: 'DOCTOR' },
              { id: 3, fullName: 'Dr. Vivek Verma', speciality: 'ORTHOPEDICS', clinicName: 'Verma Ortho Care', type: 'DOCTOR' },
              { id: 4, fullName: 'Dr. Neha Gupta', speciality: 'GENERAL PHYSICIAN', clinicName: 'Care Clinic', type: 'DOCTOR' }
            ];

            onboardingReqs.filter(r => r.status === 'APPROVED').forEach(req => {
              const isChemist = String(req.type).toUpperCase() === 'CHEMIST';
              const reqId = req.doctorId || req.chemistId || req.id;
              if (mergedList.some(d => String(d.id) === String(reqId))) {
                return;
              }
              mergedList.push({
                id: reqId,
                fullName: req.name,
                speciality: isChemist ? 'CHEMIST' : req.doctorSpeciality || 'GENERAL PHYSICIAN',
                clinicName: req.address || req.city || '',
                type: isChemist ? 'CHEMIST' : 'DOCTOR',
                latitude: req.latitude,
                longitude: req.longitude
              });
            });

            mergedList.forEach(doc => {
              const assignment = assignments.find(a => String(a.doctorId) === String(doc.id));
              if (assignment) {
                doc.assignedMrId = assignment.mrId;
                const mr = mrList.find(m => String(m.id) === String(assignment.mrId));
                doc.assignedMrName = mr ? mr.fullName : `MR #${assignment.mrId}`;
              } else {
                doc.assignedMrId = null;
                doc.assignedMrName = null;
              }
            });

            mockData = {
              success: true,
              status: true,
              message: "Unified contacts fetched successfully",
              data: {
                doctors: mergedList.filter(d => d.type === 'DOCTOR'),
                chemists: mergedList.filter(d => d.type === 'CHEMIST').map(c => ({
                  ...c,
                  name: c.fullName,
                  contactPerson: c.speciality
                }))
              }
            };
          } else if (cfg.url.includes('/doctor/my-assigned') && cfg.method === 'get') {
            const currentEmpId = token === 'mock-mr-token' ? 'EMP-MR-001' : 'EMP-ADM-001';
            let filterMrId = currentEmpId;
            try {
              const urlStr = cfg.url.startsWith('http') ? cfg.url : 'http://localhost' + cfg.url;
              const urlObj = new URL(urlStr);
              filterMrId = urlObj.searchParams.get('mrId') || currentEmpId;
            } catch (e) {}

            const mrList = [
              { id: 'EMP-MR-001', fullName: 'Marcus Rep', email: 'mr@mrmedical.com', role: 'MR', status: 'ACTIVE' },
              { id: '2', fullName: 'Amit Verma', email: 'amit.verma@mrmedical.com', role: 'MR', status: 'ACTIVE' },
              { id: '3', fullName: 'Rohan Deshmukh', email: 'rohan.deshmukh@mrmedical.com', role: 'MR', status: 'ACTIVE' },
              { id: '4', fullName: 'Sanjay Dutt', email: 'sanjay.dutt@mrmedical.com', role: 'MR', status: 'ACTIVE' }
            ];

            const onboardingReqs = getOrInitializeOnboardingRequests();

            let assignments = [];
            try {
              assignments = JSON.parse(localStorage.getItem('mock_assignments') || '[]');
            } catch (e) {}

            const mergedList = [
              { id: 1, fullName: 'Dr. Ramesh Sharma', speciality: 'CARDIOLOGY', clinicName: 'City Heart Clinic', type: 'DOCTOR' },
              { id: 3, fullName: 'Dr. Vivek Verma', speciality: 'ORTHOPEDICS', clinicName: 'Verma Ortho Care', type: 'DOCTOR' },
              { id: 4, fullName: 'Dr. Neha Gupta', speciality: 'GENERAL PHYSICIAN', clinicName: 'Care Clinic', type: 'DOCTOR' }
            ];

            onboardingReqs.filter(r => r.status === 'APPROVED').forEach(req => {
              const isChemist = String(req.type).toUpperCase() === 'CHEMIST';
              const reqId = req.doctorId || req.chemistId || req.id;
              if (mergedList.some(d => String(d.id) === String(reqId))) {
                return;
              }
              mergedList.push({
                id: reqId,
                fullName: req.name,
                speciality: isChemist ? 'CHEMIST' : req.doctorSpeciality || 'GENERAL PHYSICIAN',
                clinicName: req.address || req.city || '',
                type: isChemist ? 'CHEMIST' : 'DOCTOR',
                latitude: req.latitude,
                longitude: req.longitude
              });
            });

            const myAssigned = [];
            mergedList.forEach(doc => {
              const assignment = assignments.find(a => String(a.doctorId) === String(doc.id));
              if (assignment && String(assignment.mrId) === String(filterMrId)) {
                doc.assignedMrId = assignment.mrId;
                const mr = mrList.find(m => String(m.id) === String(assignment.mrId));
                doc.assignedMrName = mr ? mr.fullName : `MR #${assignment.mrId}`;
                myAssigned.push(doc);
              }
            });

            mockData = {
              success: true,
              data: myAssigned
            };
          } else if (cfg.url.includes('/assign/') && cfg.method === 'put') {
            const parts = cfg.url.split('?')[0].split('/');
            const assignIdx = parts.indexOf('assign');
            const doctorId = parts[assignIdx - 1];
            const mrId = parts[assignIdx + 1];

            let assignments = [];
            try {
              assignments = JSON.parse(localStorage.getItem('mock_assignments') || '[]');
            } catch (e) {}

            if (mrId === 'none' || mrId === 'null') {
              assignments = assignments.filter(a => String(a.doctorId) !== String(doctorId));
            } else {
              const idx = assignments.findIndex(a => String(a.doctorId) === String(doctorId));
              if (idx !== -1) {
                assignments[idx].mrId = mrId;
              } else {
                assignments.push({ doctorId, mrId });
              }
            }
            localStorage.setItem('mock_assignments', JSON.stringify(assignments));

            mockData = {
              success: true,
              message: 'Assignment updated successfully.'
            };
          } else if ((cfg.url.endsWith('/mr') || cfg.url.includes('/mr?')) && cfg.method === 'get') {
            mockData = {
              success: true,
              data: [
                { id: 'EMP-MR-001', fullName: 'Marcus Rep', email: 'mr@mrmedical.com', role: 'MR', status: 'ACTIVE' },
                { id: '2', fullName: 'Amit Verma', email: 'amit.verma@mrmedical.com', role: 'MR', status: 'ACTIVE' },
                { id: '3', fullName: 'Rohan Deshmukh', email: 'rohan.deshmukh@mrmedical.com', role: 'MR', status: 'ACTIVE' },
                { id: '4', fullName: 'Sanjay Dutt', email: 'sanjay.dutt@mrmedical.com', role: 'MR', status: 'ACTIVE' }
              ]
            };
          } else if (cfg.url.includes('/doctor') && cfg.method === 'get') {
            const mrList = [
              { id: 'EMP-MR-001', fullName: 'Marcus Rep', email: 'mr@mrmedical.com', role: 'MR', status: 'ACTIVE' },
              { id: '2', fullName: 'Amit Verma', email: 'amit.verma@mrmedical.com', role: 'MR', status: 'ACTIVE' },
              { id: '3', fullName: 'Rohan Deshmukh', email: 'rohan.deshmukh@mrmedical.com', role: 'MR', status: 'ACTIVE' },
              { id: '4', fullName: 'Sanjay Dutt', email: 'sanjay.dutt@mrmedical.com', role: 'MR', status: 'ACTIVE' }
            ];

            const onboardingReqs = getOrInitializeOnboardingRequests();

            let assignments = [];
            try {
              assignments = JSON.parse(localStorage.getItem('mock_assignments') || '[]');
            } catch (e) {}

            const mergedList = [
              { id: 1, fullName: 'Dr. Ramesh Sharma', speciality: 'CARDIOLOGY', clinicName: 'City Heart Clinic', type: 'DOCTOR' },
              { id: 3, fullName: 'Dr. Vivek Verma', speciality: 'ORTHOPEDICS', clinicName: 'Verma Ortho Care', type: 'DOCTOR' },
              { id: 4, fullName: 'Dr. Neha Gupta', speciality: 'GENERAL PHYSICIAN', clinicName: 'Care Clinic', type: 'DOCTOR' }
            ];

            onboardingReqs.filter(r => r.status === 'APPROVED').forEach(req => {
              const isChemist = String(req.type).toUpperCase() === 'CHEMIST';
              const reqId = req.doctorId || req.chemistId || req.id;
              if (mergedList.some(d => String(d.id) === String(reqId))) {
                return;
              }
              mergedList.push({
                id: reqId,
                fullName: req.name,
                speciality: isChemist ? 'CHEMIST' : req.doctorSpeciality || 'GENERAL PHYSICIAN',
                clinicName: req.address || req.city || '',
                type: isChemist ? 'CHEMIST' : 'DOCTOR',
                latitude: req.latitude,
                longitude: req.longitude
              });
            });

            mergedList.forEach(doc => {
              const assignment = assignments.find(a => String(a.doctorId) === String(doc.id));
              if (assignment) {
                doc.assignedMrId = assignment.mrId;
                const mr = mrList.find(m => String(m.id) === String(assignment.mrId));
                doc.assignedMrName = mr ? mr.fullName : `MR #${assignment.mrId}`;
              } else {
                doc.assignedMrId = null;
                doc.assignedMrName = null;
              }
            });

            mockData = {
              success: true,
              data: mergedList
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
          } else if (cfg.url.includes('/jfw/team-visits') && cfg.method === 'get') {
            mockData = {
              success: true,
              status: 200,
              message: "Fetched team JFW visits successfully",
              data: [
                {
                  visitId: 201,
                  dcrId: 101,
                  reportDate: new Date().toISOString().split('T')[0],
                  mrId: 10,
                  mrName: "Marcus Rep",
                  doctorId: 1,
                  doctorName: "Dr. Ramesh Sharma",
                  speciality: "CARDIOLOGY",
                  visitTime: "10:30:00",
                  productsDiscussed: "Cardiace-M",
                  samplesGiven: "2 strips",
                  feedback: "Discussed renewal and prescription behavior",
                  gpsVerified: true,
                  jfwManagerId: 1,
                  jfwManagerName: "Admin User"
                },
                {
                  visitId: 202,
                  dcrId: 102,
                  reportDate: new Date().toISOString().split('T')[0],
                  mrId: 11,
                  mrName: "Sarah Connor",
                  doctorId: 3,
                  doctorName: "Dr. Vivek Verma",
                  speciality: "ORTHOPEDICS",
                  visitTime: "12:15:00",
                  productsDiscussed: "Osteoshield",
                  samplesGiven: "5 boxes",
                  feedback: "Requested new medical brochure",
                  gpsVerified: false,
                  jfwManagerId: 2,
                  jfwManagerName: "Sam Manager"
                }
              ]
            };
          } else if (cfg.url.includes('/jfw/my-visits') && cfg.method === 'get') {
            mockData = {
              success: true,
              status: 200,
              message: "Fetched your JFW visits successfully",
              data: [
                {
                  visitId: 201,
                  dcrId: 101,
                  reportDate: new Date().toISOString().split('T')[0],
                  mrId: 10,
                  mrName: "Marcus Rep",
                  doctorId: 1,
                  doctorName: "Dr. Ramesh Sharma",
                  speciality: "CARDIOLOGY",
                  visitTime: "10:30:00",
                  productsDiscussed: "Cardiace-M",
                  samplesGiven: "2 strips",
                  feedback: "Discussed renewal and prescription behavior",
                  gpsVerified: true,
                  jfwManagerId: 1,
                  jfwManagerName: "Admin User"
                }
              ]
            };
          } else if (cfg.url.includes('/dcr/') && cfg.url.includes('/review') && cfg.method === 'put') {
            const urlWithoutParams = cfg.url.split('?')[0];
            const parts = urlWithoutParams.split('/');
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
              visits: body.visits || [],
              chemistVisits: body.chemistVisits || []
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
          } else if (cfg.url.includes('/admin/my-team') && cfg.method === 'post') {
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
          } else if (cfg.url.includes('/requests/me') && cfg.method === 'post') {
              const requests = getOrInitializeOnboardingRequests();
              let statusFilter = '';
              try {
                const body = JSON.parse(cfg.data || '{}');
                statusFilter = body.status || '';
              } catch (e) {}
              const isAll = !statusFilter || statusFilter.toUpperCase() === 'ALL';
              const list = isAll
                ? requests
                : requests.filter((r) => String(r.status).toUpperCase() === statusFilter.toUpperCase());
              mockData = { success: true, status: 200, data: list };
            } else if (cfg.url.includes('/requests/pending') && cfg.method === 'post') {
              const requests = getOrInitializeOnboardingRequests();
              let statusFilter = 'PENDING';
              let search = '';
              let page = 0;
              let size = 10;
              try {
                const body = JSON.parse(cfg.data || '{}');
                const raw = (body.status || 'PENDING').toUpperCase();
                statusFilter = raw === 'ALL' ? 'ALL' : raw;
                search = (body.search || '').toLowerCase().trim();
                page = parseInt(body.page || '0', 10);
                size = parseInt(body.size || '10', 10);
              } catch (e) {}
              let filteredList =
                statusFilter === 'ALL'
                  ? requests
                  : requests.filter((r) => String(r.status).toUpperCase() === statusFilter);

              if (search) {
                filteredList = filteredList.filter((r) =>
                  (r.name || '').toLowerCase().includes(search) ||
                  (r.email || '').toLowerCase().includes(search) ||
                  (r.phone || '').includes(search) ||
                  (r.type || '').toLowerCase().includes(search) ||
                  (r.city || '').toLowerCase().includes(search) ||
                  (r.submittedBy || '').toLowerCase().includes(search)
                );
              }

              const totalElements = filteredList.length;
              const totalPages = Math.ceil(totalElements / size);
              const content = filteredList.slice(page * size, (page + 1) * size);

              mockData = {
                success: true,
                status: 200,
                data: {
                  content,
                  empty: content.length === 0,
                  first: page === 0,
                  last: page >= totalPages - 1 || totalPages === 0,
                  number: page,
                  numberOfElements: content.length,
                  size: size,
                  totalElements,
                  totalPages
                }
              };
            } else if (cfg.url.includes('/requests/') && cfg.url.includes('/review') && cfg.method === 'put') {
              const urlWithoutParams = cfg.url.split('?')[0];
              const parts = urlWithoutParams.split('/');
              const reviewIdx = parts.indexOf('review');
              const requestId = parseInt(parts[reviewIdx - 1]);

              let status = 'APPROVED';
              let remarks = '';
              try {
                const urlStr = cfg.url.startsWith('http') ? cfg.url : 'http://localhost' + cfg.url;
                const urlObj = new URL(urlStr);
                status = urlObj.searchParams.get('status') || 'APPROVED';
                remarks = urlObj.searchParams.get('remarks') || '';
              } catch (e) {}

              const requests = getOrInitializeOnboardingRequests();

              const req = requests.find(r => r.id === requestId);
              if (req) {
                req.status = status;
                req.remarks = remarks;
                if (status === 'APPROVED') {
                  if (req.type === 'CHEMIST') req.chemistId = req.chemistId || req.id;
                  else req.doctorId = req.doctorId || req.id;
                }
                localStorage.setItem('mock_onboarding_requests', JSON.stringify(requests));
              }
              mockData = { success: true, status: 200, message: `Request status updated to ${status}.` };
            } else if ((cfg.url.includes('/doctor/') || cfg.url.includes('/chemist/')) && cfg.url.includes('/location') && cfg.method === 'put') {
              const urlWithoutParams = cfg.url.split('?')[0];
              const parts = urlWithoutParams.split('/');
              const locIdx = parts.indexOf('location');
              const targetId = parseInt(parts[locIdx - 1]);

              const body = JSON.parse(cfg.data || '{}');
              const lat = parseFloat(body.latitude);
              const lng = parseFloat(body.longitude);

              const requests = getOrInitializeOnboardingRequests();

              const req = requests.find(r => 
                r.id === targetId || 
                r.doctorId === targetId || 
                r.chemistId === targetId || 
                String(r.id) === String(targetId) || 
                String(r.doctorId) === String(targetId) || 
                String(r.chemistId) === String(targetId)
              );
              if (req) {
                req.latitude = lat;
                req.longitude = lng;
                localStorage.setItem('mock_onboarding_requests', JSON.stringify(requests));
              }

              mockData = { success: true, status: 200, message: "Location updated successfully." };
            } else if (cfg.url.includes('/settings/gps-threshold')) {
              if (cfg.method === 'get') {
                const saved = localStorage.getItem('company_gps_threshold_meters') || '200';
                mockData = { success: true, data: { gpsThresholdMeters: parseFloat(saved) } };
              } else if (cfg.method === 'put') {
                const body = JSON.parse(cfg.data || '{}');
                const threshold = Math.min(200, Math.max(1, body.gpsThresholdMeters || 200));
                localStorage.setItem('company_gps_threshold_meters', String(threshold));
                mockData = { success: true, data: { gpsThresholdMeters: threshold }, message: "GPS threshold updated successfully." };
              }
            } else if (cfg.url.includes('/requests') && !cfg.url.includes('/requests/pending') && !cfg.url.includes('/requests/me') && cfg.method === 'post') {
              const body = JSON.parse(cfg.data || '{}');
              const requests = getOrInitializeOnboardingRequests();

              const newReq = {
                id: Math.floor(Math.random() * 10000),
                type: body.type || 'DOCTOR',
                name: body.name || '',
                email: body.email || '',
                phone: body.phone || '',
                address: body.address || '',
                city: body.city || '',
                state: body.state || '',
                pincode: body.pincode || '',
                latitude: body.latitude || 13.08268,
                longitude: body.longitude || 80.27072,
                doctorSpeciality: body.doctorSpeciality || '',
                doctorQualification: body.doctorQualification || '',
                doctorLicenseNumber: body.doctorLicenseNumber || '',
                chemistContactPerson: body.chemistContactPerson || '',
                status: 'PENDING',
                remarks: '',
                submittedBy: 'Marcus Rep'
              };
              requests.push(newReq);
              localStorage.setItem('mock_onboarding_requests', JSON.stringify(requests));
              mockData = { success: true, status: 201, data: newReq };
            } else if (cfg.url.includes('/attendance/punch-in') && cfg.method === 'post') {
              const body = JSON.parse(cfg.data || '{}');
              let db = [];
              try {
                db = JSON.parse(localStorage.getItem('mock_attendance_db') || '[]');
              } catch (e) {}
              
              const todayStr = new Date().toISOString().split('T')[0];
              db = db.filter(a => !a.punchInTime.startsWith(todayStr));
              
              const newLog = {
                id: Math.floor(Math.random() * 100000),
                employeeId: token === 'mock-mr-token' ? 'EMP-MR-001' : 'EMP-ADM-001',
                employeeName: token === 'mock-mr-token' ? 'Marcus Rep' : 'Admin User',
                punchInTime: new Date().toISOString(),
                punchInLatitude: body.latitude,
                punchInLongitude: body.longitude,
                punchInRemarks: body.remarks,
                punchOutTime: null,
                punchOutLatitude: null,
                punchOutLongitude: null,
                punchOutRemarks: null,
                workType: body.workType || 'FIELD_WORK',
                status: 'PUNCHED_IN'
              };
              db.push(newLog);
              localStorage.setItem('mock_attendance_db', JSON.stringify(db));
              mockData = { success: true, status: 200, data: newLog };
              
            } else if (cfg.url.includes('/attendance/punch-out') && cfg.method === 'post') {
              const body = JSON.parse(cfg.data || '{}');
              let db = [];
              try {
                db = JSON.parse(localStorage.getItem('mock_attendance_db') || '[]');
              } catch (e) {}
              
              const todayStr = new Date().toISOString().split('T')[0];
              const activeLogIndex = db.findIndex(a => a.punchInTime.startsWith(todayStr) && !a.punchOutTime);
              let updatedLog = null;
              if (activeLogIndex !== -1) {
                db[activeLogIndex] = {
                  ...db[activeLogIndex],
                  punchOutTime: new Date().toISOString(),
                  punchOutLatitude: body.latitude,
                  punchOutLongitude: body.longitude,
                  punchOutRemarks: body.remarks,
                  status: 'PUNCHED_OUT'
                };
                updatedLog = db[activeLogIndex];
              } else {
                updatedLog = {
                  id: Math.floor(Math.random() * 100000),
                  employeeId: token === 'mock-mr-token' ? 'EMP-MR-001' : 'EMP-ADM-001',
                  employeeName: token === 'mock-mr-token' ? 'Marcus Rep' : 'Admin User',
                  punchInTime: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
                  punchInLatitude: body.latitude,
                  punchInLongitude: body.longitude,
                  punchOutTime: new Date().toISOString(),
                  punchOutLatitude: body.latitude,
                  punchOutLongitude: body.longitude,
                  punchOutRemarks: body.remarks,
                  workType: 'FIELD_WORK',
                  status: 'PUNCHED_OUT'
                };
                db.push(updatedLog);
              }
              localStorage.setItem('mock_attendance_db', JSON.stringify(db));
              mockData = { success: true, status: 200, data: updatedLog };

            } else if (cfg.url.includes('/attendance/me') && cfg.method === 'get') {
              let db = [];
              try {
                db = JSON.parse(localStorage.getItem('mock_attendance_db') || '[]');
              } catch (e) {}
              
              const empId = token === 'mock-mr-token' ? 'EMP-MR-001' : 'EMP-ADM-001';
              const empName = token === 'mock-mr-token' ? 'Marcus Rep' : 'Admin User';
              
              if (db.length === 0) {
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                const dayBefore = new Date(Date.now() - 172800000).toISOString().split('T')[0];
                db = [
                  {
                    id: 1,
                    employeeId: empId,
                    employeeName: empName,
                    punchInTime: `${dayBefore}T09:12:00Z`,
                    punchInLatitude: 12.9716,
                    punchInLongitude: 77.5946,
                    punchInRemarks: "Punching in",
                    punchOutTime: `${dayBefore}T17:30:00Z`,
                    punchOutLatitude: 12.9830,
                    punchOutLongitude: 77.6110,
                    punchOutRemarks: "Exiting for the day",
                    workType: "FIELD_WORK",
                    status: "PUNCHED_OUT"
                  },
                  {
                    id: 2,
                    employeeId: empId,
                    employeeName: empName,
                    punchInTime: `${yesterday}T09:05:00Z`,
                    punchInLatitude: 12.9650,
                    punchInLongitude: 77.5890,
                    punchInRemarks: "Starting route",
                    punchOutTime: `${yesterday}T18:00:00Z`,
                    punchOutLatitude: 12.9780,
                    punchOutLongitude: 77.5995,
                    punchOutRemarks: "Ending day",
                    workType: "FIELD_WORK",
                    status: "PUNCHED_OUT"
                  }
                ];
                localStorage.setItem('mock_attendance_db', JSON.stringify(db));
              }
              
              const filtered = db.filter(a => String(a.employeeId) === String(empId));
              mockData = { success: true, status: 200, data: filtered };

            } else if (cfg.url.includes('/attendance/team') && cfg.method === 'get') {
              let db = [];
              try {
                db = JSON.parse(localStorage.getItem('mock_attendance_db') || '[]');
              } catch (e) {}
              
              const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
              const dayBefore = new Date(Date.now() - 172800000).toISOString().split('T')[0];
              
              if (db.length <= 2) {
                const teamMembers = [
                  { id: 'EMP-MR-001', name: 'Marcus Rep' },
                  { id: '1', name: 'Marcus Rep' },
                  { id: '2', name: 'Amit Verma' },
                  { id: '3', name: 'Rohan Deshmukh' },
                  { id: '4', name: 'Sanjay Dutt' }
                ];
                
                const newLogs = [];
                teamMembers.forEach((m, idx) => {
                  newLogs.push({
                    id: 10 + idx * 2,
                    employeeId: m.id,
                    employeeName: m.name,
                    punchInTime: `${dayBefore}T09:12:00Z`,
                    punchInLatitude: 12.9716 + idx * 0.002,
                    punchInLongitude: 77.5946 - idx * 0.002,
                    punchInRemarks: "Punching in",
                    punchOutTime: `${dayBefore}T17:30:00Z`,
                    punchOutLatitude: 12.9830 + idx * 0.002,
                    punchOutLongitude: 77.6110 - idx * 0.002,
                    punchOutRemarks: "Ending day",
                    workType: "FIELD_WORK",
                    status: "PUNCHED_OUT"
                  });
                  newLogs.push({
                    id: 11 + idx * 2,
                    employeeId: m.id,
                    employeeName: m.name,
                    punchInTime: `${yesterday}T09:05:00Z`,
                    punchInLatitude: 12.9650 - idx * 0.001,
                    punchInLongitude: 77.5890 + idx * 0.001,
                    punchInRemarks: "Starting route",
                    punchOutTime: `${yesterday}T18:00:00Z`,
                    punchOutLatitude: 12.9780 - idx * 0.001,
                    punchOutLongitude: 77.5995 + idx * 0.001,
                    punchOutRemarks: "Ending day",
                    workType: "FIELD_WORK",
                    status: "PUNCHED_OUT"
                  });
                });
                db = [...db, ...newLogs];
                localStorage.setItem('mock_attendance_db', JSON.stringify(db));
              }
              mockData = { success: true, status: 200, data: db };

            } else if (cfg.url.includes('/attendance/location/check-in') && cfg.method === 'post') {
              const body = JSON.parse(cfg.data || '{}');
              let db = [];
              try {
                db = JSON.parse(localStorage.getItem('mock_visits_db') || '[]');
              } catch (e) {}
              
              const empId = token === 'mock-mr-token' ? 'EMP-MR-001' : 'EMP-ADM-001';
              const empName = token === 'mock-mr-token' ? 'Marcus Rep' : 'Admin User';
              
              let approvedTargets = [];
              try {
                const onboardingReqs = getOrInitializeOnboardingRequests();
                approvedTargets = onboardingReqs
                  .filter((r) => r.status === 'APPROVED')
                  .map((r) => ({
                    id: r.doctorId || r.chemistId || r.id,
                    name: r.name,
                    type: r.type === 'CHEMIST' ? 'Pharmacy' : 'Doctor',
                    specialty: r.doctorSpeciality || r.chemistContactPerson || '',
                    clinic: [r.address, r.city].filter(Boolean).join(', ') || r.city || '',
                  }));
              } catch (e) {}
              const t = approvedTargets.find(item => String(item.id) === String(body.targetId)) || {
                name: 'Unknown Target',
                type: body.visitType === 'CHEMIST' ? 'Pharmacy' : 'Doctor',
                specialty: 'General',
                clinic: 'Unknown clinic',
              };
              
              const newVisit = {
                id: Math.floor(Math.random() * 100000),
                employeeId: empId,
                employeeName: empName,
                visitType: body.visitType || t.type.toUpperCase(),
                targetId: body.targetId,
                targetName: t.name,
                clinicName: t.clinic,
                specialty: t.specialty,
                checkInTime: new Date().toISOString(),
                checkInLatitude: body.latitude,
                checkInLongitude: body.longitude,
                checkOutTime: null,
                checkOutLatitude: null,
                checkOutLongitude: null,
                productsDiscussed: "",
                samplesGiven: "",
                feedback: "",
                status: "CHECKED_IN",
                gpsVerified: true
              };
              db.push(newVisit);
              localStorage.setItem('mock_visits_db', JSON.stringify(db));
              mockData = { success: true, status: 200, data: newVisit };

            } else if (cfg.url.includes('/attendance/location/check-out') && cfg.method === 'post') {
              const body = JSON.parse(cfg.data || '{}');
              let db = [];
              try {
                db = JSON.parse(localStorage.getItem('mock_visits_db') || '[]');
              } catch (e) {}
              
              const empId = token === 'mock-mr-token' ? 'EMP-MR-001' : 'EMP-ADM-001';
              
              const activeIndex = db.findIndex(v => String(v.employeeId) === String(empId) && v.status === 'CHECKED_IN');
              let updatedVisit = null;
              if (activeIndex !== -1) {
                db[activeIndex] = {
                  ...db[activeIndex],
                  checkOutTime: new Date().toISOString(),
                  checkOutLatitude: body.latitude,
                  checkOutLongitude: body.longitude,
                  productsDiscussed: body.productsDiscussed,
                  samplesGiven: body.samplesGiven,
                  feedback: body.feedback,
                  status: 'COMPLETED'
                };
                updatedVisit = db[activeIndex];
              } else {
                updatedVisit = {
                  id: Math.floor(Math.random() * 100000),
                  employeeId: empId,
                  employeeName: token === 'mock-mr-token' ? 'Marcus Rep' : 'Admin User',
                  visitType: 'DOCTOR',
                  targetId: 1,
                  targetName: 'Dr. Ramesh Sharma',
                  clinicName: 'City Heart Clinic',
                  specialty: 'Cardiology',
                  checkInTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                  checkInLatitude: body.latitude,
                  checkInLongitude: body.longitude,
                  checkOutTime: new Date().toISOString(),
                  checkOutLatitude: body.latitude,
                  checkOutLongitude: body.longitude,
                  productsDiscussed: body.productsDiscussed,
                  samplesGiven: body.samplesGiven,
                  feedback: body.feedback,
                  status: 'COMPLETED',
                  gpsVerified: true
                };
                db.push(updatedVisit);
              }
              localStorage.setItem('mock_visits_db', JSON.stringify(db));
              mockData = { success: true, status: 200, data: updatedVisit };

            } else if (cfg.url.includes('/attendance/location/me') && cfg.method === 'get') {
              let db = [];
              try {
                db = JSON.parse(localStorage.getItem('mock_visits_db') || '[]');
              } catch (e) {}
              
              const empId = token === 'mock-mr-token' ? 'EMP-MR-001' : 'EMP-ADM-001';
              
              if (db.length === 0) {
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                const dayBefore = new Date(Date.now() - 172800000).toISOString().split('T')[0];
                db = [
                  {
                    id: 1001,
                    employeeId: empId,
                    employeeName: token === 'mock-mr-token' ? 'Marcus Rep' : 'Admin User',
                    visitType: 'DOCTOR',
                    targetId: 1,
                    targetName: 'Dr. Ramesh Sharma',
                    clinicName: 'City Heart Clinic',
                    specialty: 'Cardiology',
                    checkInTime: `${dayBefore}T10:30:00Z`,
                    checkInLatitude: 12.9716,
                    checkInLongitude: 77.5946,
                    checkOutTime: `${dayBefore}T11:05:00Z`,
                    checkOutLatitude: 12.9720,
                    checkOutLongitude: 77.5950,
                    productsDiscussed: 'Cardace 5mg, Lipvas 10mg',
                    samplesGiven: 'Cardace (10 Tabs)',
                    feedback: 'Doctor agreed to increase prescription count for hypertensive patients.',
                    status: 'COMPLETED',
                    gpsVerified: true
                  },
                  {
                    id: 1002,
                    employeeId: empId,
                    employeeName: token === 'mock-mr-token' ? 'Marcus Rep' : 'Admin User',
                    visitType: 'CHEMIST',
                    targetId: 5,
                    targetName: 'Apollo Pharmacy',
                    clinicName: 'Indiranagar Branch',
                    specialty: 'Chemist',
                    checkInTime: `${dayBefore}T13:45:00Z`,
                    checkInLatitude: 12.9785,
                    checkInLongitude: 77.6408,
                    checkOutTime: `${dayBefore}T14:15:00Z`,
                    checkOutLatitude: 12.9785,
                    checkOutLongitude: 77.6408,
                    productsDiscussed: 'Amlong 5mg stocking',
                    samplesGiven: 'Visual aid pamphlets (2 packs)',
                    feedback: 'Stock checked, placed order for 50 boxes of Lipvas.',
                    status: 'COMPLETED',
                    gpsVerified: true
                  },
                  {
                    id: 1003,
                    employeeId: empId,
                    employeeName: token === 'mock-mr-token' ? 'Marcus Rep' : 'Admin User',
                    visitType: 'DOCTOR',
                    targetId: 3,
                    targetName: 'Dr. Vivek Verma',
                    clinicName: 'Verma Ortho Care',
                    specialty: 'Orthopedics',
                    checkInTime: `${yesterday}T11:15:00Z`,
                    checkInLatitude: 12.9650,
                    checkInLongitude: 77.5890,
                    checkOutTime: `${yesterday}T11:55:00Z`,
                    checkOutLatitude: 12.9655,
                    checkOutLongitude: 77.5895,
                    productsDiscussed: 'Chymoral Forte discussions',
                    samplesGiven: 'Chymoral Forte (2 Strips)',
                    feedback: 'Very positive response. Doctor has been prescribing regularly.',
                    status: 'COMPLETED',
                    gpsVerified: true
                  },
                  {
                    id: 1004,
                    employeeId: empId,
                    employeeName: token === 'mock-mr-token' ? 'Marcus Rep' : 'Admin User',
                    visitType: 'DOCTOR',
                    targetId: 2,
                    targetName: 'Dr. Sunita Patel',
                    clinicName: 'Metro General Hospital',
                    specialty: 'Pediatrics',
                    checkInTime: `${yesterday}T15:10:00Z`,
                    checkInLatitude: 12.9780,
                    checkInLongitude: 77.5995,
                    checkOutTime: `${yesterday}T15:50:00Z`,
                    checkOutLatitude: 12.9782,
                    checkOutLongitude: 77.5997,
                    productsDiscussed: 'Augmentin DDS Suspessions',
                    samplesGiven: 'Augmentin DDS Pediatric samples (5 bottles)',
                    feedback: 'Inquired about syrup stock levels in local pharmacies.',
                    status: 'COMPLETED',
                    gpsVerified: true
                  }
                ];
                localStorage.setItem('mock_visits_db', JSON.stringify(db));
              }
              
              const filtered = db.filter(v => String(v.employeeId) === String(empId));
              mockData = { success: true, status: 200, data: filtered };

            } else if (cfg.url.includes('/attendance/location/team') && cfg.method === 'get') {
              let db = [];
              try {
                db = JSON.parse(localStorage.getItem('mock_visits_db') || '[]');
              } catch (e) {}
              mockData = { success: true, status: 200, data: db };
            } else if (cfg.url.includes('/attendance/location/history') && cfg.method === 'get') {
              let db = [];
              try {
                db = JSON.parse(localStorage.getItem('mock_visits_db') || '[]');
              } catch (e) {}

              let visitType = '';
              let targetId = '';
              let mrId = '';
              try {
                const urlStr = cfg.url.startsWith('http') ? cfg.url : 'http://localhost' + cfg.url;
                const urlObj = new URL(urlStr);
                visitType = urlObj.searchParams.get('visitType') || '';
                targetId = urlObj.searchParams.get('targetId') || '';
                mrId = urlObj.searchParams.get('mrId') || '';
              } catch (e) {}

              const currentEmpId = token === 'mock-mr-token' ? 'EMP-MR-001' : 'EMP-ADM-001';
              const filterMrId = mrId || currentEmpId;

              const history = db.filter(v => {
                const matchesEmp = String(v.employeeId) === String(filterMrId);
                const matchesTarget = String(v.targetId) === String(targetId);
                const matchesType = visitType 
                  ? v.visitType?.toUpperCase() === visitType.toUpperCase() || v.type?.toUpperCase() === visitType.toUpperCase()
                  : true;
                return matchesEmp && matchesTarget && matchesType && v.status === 'COMPLETED';
              }).sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));

              mockData = { success: true, status: 200, data: history };
            } else if (cfg.url.includes('/admin/departments') && cfg.method === 'get') {
              mockData = {
                success: true,
                status: 200,
                data: [
                  { id: "1", departmentName: "Sales" },
                  { id: "2", departmentName: "Marketing" },
                  { id: "3", departmentName: "Operations" }
                ]
              };
            } else if (cfg.url.includes('/admin/roles') && cfg.method === 'get') {
              mockData = {
                success: true,
                status: 200,
                data: [
                  { id: "1", designationName: "Medical Representative" },
                  { id: "2", designationName: "Medical Sales Executive" },
                  { id: "3", designationName: "Medical Executive" },
                  { id: "4", designationName: "Regional Manager" }
                ]
              };
            } else if (cfg.url.includes('/notices/active') && cfg.method === 'get') {
              let notices = [];
              try {
                const saved = localStorage.getItem('mock_notices');
                if (saved) {
                  notices = JSON.parse(saved);
                } else {
                  notices = [
                    {
                      id: 1,
                      title: "Quarterly Strategy Meeting",
                      message: "All Medical Representatives and Sales Executives are requested to attend the Q2 Strategy Meeting scheduled for next Monday. We will discuss new product launches and territory expansion plans.",
                      active: true,
                      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
                    },
                    {
                      id: 2,
                      title: "Emergency Update: Server Maintenance",
                      message: "The HRMS system will undergo scheduled database maintenance tonight from 11:00 PM to 1:00 AM. Access might be intermittent during this period. Please plan your punch-outs accordingly.",
                      active: true,
                      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
                    },
                    {
                      id: 3,
                      title: "Independence Day Holiday Announcement",
                      message: "Please note that the office will remain closed on August 15th, 2026, in observance of Independence Day. Regular field visits and reporting will resume from August 16th.",
                      active: true,
                      createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
                    }
                  ];
                  localStorage.setItem('mock_notices', JSON.stringify(notices));
                }
              } catch (e) {}

              // Filter active notices
              const activeList = notices.filter(notice => notice.active);
              mockData = { success: true, status: 200, data: activeList };

            } else if (cfg.url.includes('/notices') && cfg.method === 'get') {
              let notices = [];
              try {
                const saved = localStorage.getItem('mock_notices');
                if (saved) {
                  notices = JSON.parse(saved);
                } else {
                  notices = [
                    {
                      id: 1,
                      title: "Quarterly Strategy Meeting",
                      message: "All Medical Representatives and Sales Executives are requested to attend the Q2 Strategy Meeting scheduled for next Monday. We will discuss new product launches and territory expansion plans.",
                      active: true,
                      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
                    },
                    {
                      id: 2,
                      title: "Emergency Update: Server Maintenance",
                      message: "The HRMS system will undergo scheduled database maintenance tonight from 11:00 PM to 1:00 AM. Access might be intermittent during this period. Please plan your punch-outs accordingly.",
                      active: true,
                      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
                    },
                    {
                      id: 3,
                      title: "Independence Day Holiday Announcement",
                      message: "Please note that the office will remain closed on August 15th, 2026, in observance of Independence Day. Regular field visits and reporting will resume from August 16th.",
                      active: true,
                      createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
                    }
                  ];
                  localStorage.setItem('mock_notices', JSON.stringify(notices));
                }
              } catch (e) {}

              mockData = { success: true, status: 200, data: notices };

            } else if (cfg.url.includes('/notices') && cfg.method === 'post') {
              const body = JSON.parse(cfg.data || '{}');
              let notices = [];
              try {
                notices = JSON.parse(localStorage.getItem('mock_notices') || '[]');
              } catch (e) {}

              const newNotice = {
                id: Math.floor(Math.random() * 100000),
                title: body.title,
                message: body.message || body.content || '',
                active: body.active !== undefined ? body.active : true,
                createdAt: new Date().toISOString()
              };

              notices.unshift(newNotice);
              localStorage.setItem('mock_notices', JSON.stringify(notices));
              mockData = { success: true, status: 201, data: newNotice };

            } else if (cfg.url.includes('/notices/') && cfg.url.includes('/toggle-active') && cfg.method === 'patch') {
              const parts = cfg.url.split('/');
              const idx = parts.indexOf('toggle-active');
              const noticeId = parseInt(parts[idx - 1]);

              let notices = [];
              try {
                notices = JSON.parse(localStorage.getItem('mock_notices') || '[]');
              } catch (e) {}

              const notice = notices.find(n => n.id === noticeId);
              if (notice) {
                notice.active = !notice.active;
                localStorage.setItem('mock_notices', JSON.stringify(notices));
              }
              mockData = { success: true, status: 200, data: notice };

            } else if (cfg.url.includes('/notices/') && cfg.method === 'put') {
              const parts = cfg.url.split('/');
              const noticeId = parseInt(parts[parts.length - 1]);
              const body = JSON.parse(cfg.data || '{}');

              let notices = [];
              try {
                notices = JSON.parse(localStorage.getItem('mock_notices') || '[]');
              } catch (e) {}

              const noticeIndex = notices.findIndex(n => n.id === noticeId);
              let updatedNotice = null;
              if (noticeIndex !== -1) {
                updatedNotice = {
                  ...notices[noticeIndex],
                  title: body.title,
                  message: body.message || body.content || '',
                  active: body.active !== undefined ? body.active : notices[noticeIndex].active
                };
                notices[noticeIndex] = updatedNotice;
                localStorage.setItem('mock_notices', JSON.stringify(notices));
              }
              mockData = { success: true, status: 200, data: updatedNotice };

            } else if (cfg.url.includes('/notices/') && cfg.method === 'delete') {
              const parts = cfg.url.split('/');
              const noticeId = parseInt(parts[parts.length - 1]);

              let notices = [];
              try {
                notices = JSON.parse(localStorage.getItem('mock_notices') || '[]');
              } catch (e) {}

              notices = notices.filter(n => n.id !== noticeId);
              localStorage.setItem('mock_notices', JSON.stringify(notices));
              mockData = { success: true, status: 200, data: noticeId };
            } else if (cfg.url.includes('/quotes/today') && cfg.method === 'get') {
              let todayStr = new Date().toISOString().split('T')[0];
              mockData = {
                success: true,
                status: 200,
                message: "Daily quote fetched successfully",
                data: {
                  id: 4,
                  quote: "Production admin quote",
                  author: "Admin",
                  date: todayStr
                }
              };
            } else if (cfg.url.includes('/quotes/refresh') && cfg.method === 'post') {
              mockData = {
                success: true,
                status: 200,
                message: "Quote refreshed successfully",
                data: "Quote refreshed successfully"
              };
            } else if (cfg.url.includes('/dcr/team') && cfg.method === 'get') {
              let saved = localStorage.getItem('mock_team_dcrs');
              let dcrs = [];
              if (saved) {
                try { dcrs = JSON.parse(saved); } catch (e) {}
              } else {
                let todayStr = new Date().toISOString().split('T')[0];
                let yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                dcrs = [
                  {
                    id: 101,
                    mrId: 10,
                    mrName: "Marcus Rep",
                    reportDate: todayStr,
                    status: "SUBMITTED",
                    managerRemarks: "",
                    approvedById: null,
                    approvedByName: null,
                    visits: [
                      { id: 1, doctorId: 1, doctorName: "Dr. Ramesh Sharma", speciality: "CARDIOLOGY", visitTime: "10:30:00", productsDiscussed: "Cardiace-M", samplesGiven: "2 strips", feedback: "Doctor showed positive response", isGpsVerified: true },
                      { id: 2, doctorId: 2, doctorName: "Dr. Sunita Patel", speciality: "PEDIATRICS", visitTime: "11:45:00", productsDiscussed: "Pediatone", samplesGiven: "1 bottle", feedback: "Wants a follow-up next week", isGpsVerified: true }
                    ],
                    chemistVisits: [
                      { id: 1, chemistId: 1, chemistName: "Apollo Pharmacy", address: "Sector 15, Dwarka", visitTime: "14:15:00", productsDiscussed: "Cardiace-M, Pediatone", feedback: "Ordered 10 boxes", isGpsVerified: true }
                    ],
                    createdAt: todayStr + "T17:00:00Z"
                  },
                  {
                    id: 102,
                    mrId: 11,
                    mrName: "Sarah Connor",
                    reportDate: todayStr,
                    status: "SUBMITTED",
                    managerRemarks: "",
                    approvedById: null,
                    approvedByName: null,
                    visits: [
                      { id: 3, doctorId: 3, doctorName: "Dr. Vivek Verma", speciality: "ORTHOPEDICS", visitTime: "12:15:00", productsDiscussed: "Osteoshield", samplesGiven: "5 boxes", feedback: "Requested medical brochure", isGpsVerified: false }
                    ],
                    chemistVisits: [],
                    createdAt: todayStr + "T16:30:00Z"
                  },
                  {
                    id: 103,
                    mrId: 10,
                    mrName: "Marcus Rep",
                    reportDate: yesterdayStr,
                    status: "APPROVED",
                    managerRemarks: "Well done!",
                    approvedById: 1,
                    approvedByName: "Admin User",
                    visits: [
                      { id: 4, doctorId: 1, doctorName: "Dr. Ramesh Sharma", speciality: "CARDIOLOGY", visitTime: "10:00:00", productsDiscussed: "Cardiace-M", samplesGiven: "1 strip", feedback: "Discussed renewal", isGpsVerified: true }
                    ],
                    chemistVisits: [],
                    createdAt: yesterdayStr + "T16:00:00Z"
                  }
                ];
                localStorage.setItem('mock_team_dcrs', JSON.stringify(dcrs));
              }
              mockData = {
                success: true,
                status: 200,
                message: "Fetched team DCRs successfully",
                data: dcrs
              };
            } else if (cfg.url.includes('/dcr/') && cfg.url.includes('/review') && cfg.method === 'put') {
              const parts = cfg.url.split('?')[0].split('/');
              const reviewIdx = parts.indexOf('review');
              const dcrId = parseInt(parts[reviewIdx - 1]);
              
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
                dcrs = JSON.parse(localStorage.getItem('mock_team_dcrs') || '[]');
              } catch (e) {}

              const idx = dcrs.findIndex(d => d.id === dcrId);
              let updated = null;
              if (idx !== -1) {
                dcrs[idx].status = status;
                dcrs[idx].managerRemarks = remarks;
                dcrs[idx].approvedByName = "Admin User";
                updated = dcrs[idx];
                localStorage.setItem('mock_team_dcrs', JSON.stringify(dcrs));
              }
              mockData = {
                success: true,
                status: 200,
                message: `DCR successfully ${status.toLowerCase()}`,
                data: updated
              };
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

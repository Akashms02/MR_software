// ─── Sample Data for GreenHR HRMS ────────────────────────────────────────────

export const EMPLOYEES = [
  { id: 'GH001', name: 'Rajesh Kumar',    photo: 'RK', dept: 'Medical Affairs',   designation: 'Sr. Medical Officer',      location: 'Mumbai',    salary: 95000,  status: 'Active',    gender: 'M', joined: '2021-03-15', email: 'rajesh.k@greenhr.in',   phone: '9820012345' },
  { id: 'GH002', name: 'Priya Sharma',    photo: 'PS', dept: 'Clinical Research', designation: 'Clinical Research Assoc.', location: 'Pune',      salary: 72000,  status: 'Active',    gender: 'F', joined: '2022-07-01', email: 'priya.s@greenhr.in',    phone: '9011234567' },
  { id: 'GH003', name: 'Anita Singh',     photo: 'AS', dept: 'Regulatory',        designation: 'Regulatory Affairs Mgr.',  location: 'Delhi',     salary: 88000,  status: 'On Leave',  gender: 'F', joined: '2020-11-10', email: 'anita.s@greenhr.in',    phone: '9312345678' },
  { id: 'GH004', name: 'Mohammed Ali',    photo: 'MA', dept: 'Manufacturing',     designation: 'Production Manager',       location: 'Hyderabad', salary: 78000,  status: 'Active',    gender: 'M', joined: '2019-06-20', email: 'mohammed.a@greenhr.in', phone: '9440012345' },
  { id: 'GH005', name: 'Sneha Patel',     photo: 'SP', dept: 'QA/QC',            designation: 'QA Lead',                  location: 'Ahmedabad', salary: 82000,  status: 'Active',    gender: 'F', joined: '2021-09-05', email: 'sneha.p@greenhr.in',    phone: '9712345678' },
  { id: 'GH006', name: 'Rohit Verma',     photo: 'RV', dept: 'Sales & Marketing', designation: 'Regional Sales Manager',   location: 'Bangalore', salary: 91000,  status: 'Active',    gender: 'M', joined: '2020-02-14', email: 'rohit.v@greenhr.in',    phone: '9845012345' },
  { id: 'GH007', name: 'Kavitha Nair',    photo: 'KN', dept: 'HR',               designation: 'HR Manager',               location: 'Chennai',   salary: 76000,  status: 'Active',    gender: 'F', joined: '2021-05-22', email: 'kavitha.n@greenhr.in',  phone: '9444012345' },
  { id: 'GH008', name: 'Arun Gupta',      photo: 'AG', dept: 'Finance',           designation: 'Finance Controller',       location: 'Mumbai',    salary: 112000, status: 'Active',    gender: 'M', joined: '2018-08-01', email: 'arun.g@greenhr.in',     phone: '9820198765' },
  { id: 'GH009', name: 'Deepak Sharma',   photo: 'DS', dept: 'IT',               designation: 'IT Lead',                  location: 'Pune',      salary: 85000,  status: 'Active',    gender: 'M', joined: '2022-01-10', email: 'deepak.s@greenhr.in',   phone: '9011987654' },
  { id: 'GH010', name: 'Pooja Mehta',     photo: 'PM', dept: 'Medical Affairs',   designation: 'Medical Officer',          location: 'Delhi',     salary: 68000,  status: 'Probation', gender: 'F', joined: '2024-02-01', email: 'pooja.m@greenhr.in',    phone: '9312987654' },
  { id: 'GH011', name: 'Suresh Iyer',     photo: 'SI', dept: 'Clinical Research', designation: 'Sr. CRA',                  location: 'Bangalore', salary: 79000,  status: 'Active',    gender: 'M', joined: '2020-10-15', email: 'suresh.i@greenhr.in',   phone: '9845987654' },
  { id: 'GH012', name: 'Ritu Aggarwal',   photo: 'RA', dept: 'Regulatory',        designation: 'RA Associate',             location: 'Mumbai',    salary: 58000,  status: 'Active',    gender: 'F', joined: '2023-04-01', email: 'ritu.a@greenhr.in',     phone: '9820987654' },
  { id: 'GH013', name: 'Vikram Singh',    photo: 'VS', dept: 'Manufacturing',     designation: 'Shift Supervisor',         location: 'Hyderabad', salary: 54000,  status: 'Active',    gender: 'M', joined: '2021-08-20', email: 'vikram.s@greenhr.in',   phone: '9440987654' },
  { id: 'GH014', name: 'Anjali Reddy',    photo: 'AR', dept: 'QA/QC',            designation: 'QC Analyst',               location: 'Chennai',   salary: 61000,  status: 'On Leave',  gender: 'F', joined: '2022-11-01', email: 'anjali.r@greenhr.in',   phone: '9444987654' },
  { id: 'GH015', name: 'Sanjay Bose',     photo: 'SB', dept: 'Sales & Marketing', designation: 'Medical Representative',   location: 'Kolkata',   salary: 48000,  status: 'Active',    gender: 'M', joined: '2023-06-15', email: 'sanjay.b@greenhr.in',   phone: '9830012345' },
]

export const DEPARTMENTS = ['Medical Affairs','Clinical Research','Regulatory','Manufacturing','QA/QC','Sales & Marketing','HR','Finance','IT']

export const DEPT_HEADCOUNT = [
  { dept: 'Sales & Marketing', count: 4 },
  { dept: 'Medical Affairs',   count: 3 },
  { dept: 'Clinical Research', count: 3 },
  { dept: 'Manufacturing',     count: 2 },
  { dept: 'Regulatory',        count: 2 },
  { dept: 'QA/QC',             count: 2 },
  { dept: 'Finance',           count: 2 },
  { dept: 'HR',                count: 2 },
  { dept: 'IT',                count: 1 },
]

export const ATTENDANCE_WEEK = [
  { day: 'Mon', present: 11, absent: 2, halfday: 2 },
  { day: 'Tue', present: 13, absent: 1, halfday: 1 },
  { day: 'Wed', present: 12, absent: 2, halfday: 1 },
  { day: 'Thu', present: 14, absent: 1, halfday: 0 },
  { day: 'Fri', present: 10, absent: 3, halfday: 2 },
  { day: 'Sat', present: 6,  absent: 8, halfday: 1 },
  { day: 'Sun', present: 2,  absent: 12, halfday: 1 },
]

export const HEADCOUNT_TREND = [
  { month: 'Jun', count: 10 }, { month: 'Jul', count: 11 },
  { month: 'Aug', count: 11 }, { month: 'Sep', count: 12 },
  { month: 'Oct', count: 13 }, { month: 'Nov', count: 13 },
  { month: 'Dec', count: 14 }, { month: 'Jan', count: 14 },
  { month: 'Feb', count: 14 }, { month: 'Mar', count: 15 },
  { month: 'Apr', count: 15 }, { month: 'May', count: 15 },
]

export const PAYROLL_SUMMARY = [
  { name: 'Processed', value: 13, color: '#2dd4bf' },
  { name: 'Pending',   value: 2,  color: '#f472b6' },
]

export const LEAVE_REQUESTS = [
  { id: 1, name: 'Anita Singh',  type: 'Sick Leave',   from: '2026-05-16', to: '2026-05-18', days: 3, reason: 'Fever and rest',          status: 'Pending' },
  { id: 2, name: 'Anjali Reddy', type: 'Earned Leave', from: '2026-05-20', to: '2026-05-22', days: 3, reason: 'Family function',          status: 'Pending' },
  { id: 3, name: 'Sanjay Bose',  type: 'Casual Leave', from: '2026-05-26', to: '2026-05-26', days: 1, reason: 'Personal work',           status: 'Pending' },
]

export const RECENT_ACTIVITY = [
  { id: 1, action: 'Priya Sharma marked attendance',         time: '9:02 AM', icon: '✅', type: 'attendance' },
  { id: 2, action: 'Payslip generated for April 2026',       time: '8:50 AM', icon: '💰', type: 'payroll'    },
  { id: 3, action: 'Leave approved for Rohit Verma',         time: '8:30 AM', icon: '📋', type: 'leave'      },
  { id: 4, action: 'New employee Pooja Mehta onboarded',     time: 'Yesterday', icon: '👤', type: 'employee' },
  { id: 5, action: 'PF filing completed for March 2026',     time: 'Yesterday', icon: '⚖️', type: 'compliance'},
]

export const UPCOMING_EVENTS = [
  { id: 1, type: 'Birthday',     name: 'Rajesh Kumar',   date: 'May 18', icon: '🎂' },
  { id: 2, type: 'Anniversary',  name: 'Arun Gupta',     date: 'May 22', icon: '🎉' },
  { id: 3, type: 'Review Cycle', name: 'Q1 PMS Reviews', date: 'May 30', icon: '🎯' },
  { id: 4, type: 'Holiday',      name: 'Buddha Purnima', date: 'May 31', icon: '📅' },
]

export const COMPLIANCE_STATUS = [
  { label: 'PF Compliant',    sub: 'Filed for Apr 2026',   status: true,  due: '15 May 2026', amount: '₹1,84,500' },
  { label: 'ESI Compliant',   sub: 'Filed for Apr 2026',   status: true,  due: '15 May 2026', amount: '₹62,400'   },
  { label: 'TDS Compliant',   sub: 'Filed for Apr 2026',   status: true,  due: '07 May 2026', amount: '₹94,200'   },
  { label: 'Labour Law',      sub: 'PT, LWF up to date',   status: true,  due: '31 May 2026', amount: '₹21,950'   },
]

export const PAYROLL_HISTORY = [
  { month: 'April 2026',    employees: 15, gross: '₹11,47,000', net: '₹9,98,500',  status: 'Processed' },
  { month: 'March 2026',    employees: 15, gross: '₹11,47,000', net: '₹9,98,500',  status: 'Processed' },
  { month: 'February 2026', employees: 14, gross: '₹10,72,000', net: '₹9,33,000',  status: 'Processed' },
  { month: 'January 2026',  employees: 14, gross: '₹10,72,000', net: '₹9,33,000',  status: 'Processed' },
  { month: 'December 2025', employees: 13, gross: '₹9,95,000',  net: '₹8,66,000',  status: 'Processed' },
]

export const ATTRITION_DEPT = [
  { dept: 'Sales & Marketing', rate: 18 },
  { dept: 'Manufacturing',     rate: 12 },
  { dept: 'Clinical Research', rate: 8  },
  { dept: 'QA/QC',             rate: 6  },
  { dept: 'Medical Affairs',   rate: 5  },
  { dept: 'Regulatory',        rate: 4  },
]

export const GENDER_RATIO = [
  { name: 'Male',   value: 8, color: '#2dd4bf' },
  { name: 'Female', value: 7, color: '#f472b6' },
]

export const LEAVE_BALANCE = [
  { type: 'Earned Leave',  code: 'EL', total: 21, used: 8, color: '#2dd4bf' },
  { type: 'Casual Leave',  code: 'CL', total: 12, used: 5, color: '#f472b6' },
  { type: 'Sick Leave',    code: 'SL', total: 10, used: 3, color: '#a78bfa' },
  { type: 'Restricted Holiday', code: 'RH', total: 2, used: 0, color: '#fb923c' },
]

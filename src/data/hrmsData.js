// ─── Centralized HRMS Sample Data ────────────────────────────────────────────

export const EMPLOYEES = [
  { id: 'GH001', name: 'Rajesh Kumar',   initials: 'RK', dept: 'Medical Affairs',    designation: 'Sr. Medical Officer',      location: 'Mumbai',    salary: 95000,  status: 'Active',    gender: 'M', joined: '2021-03-15', email: 'rajesh.k@greenhr.in',   phone: '9820012345' },
  { id: 'GH002', name: 'Priya Sharma',   initials: 'PS', dept: 'Clinical Research',  designation: 'Clinical Research Assoc.', location: 'Pune',      salary: 72000,  status: 'Active',    gender: 'F', joined: '2022-07-01', email: 'priya.s@greenhr.in',    phone: '9011234567' },
  { id: 'GH003', name: 'Anita Singh',    initials: 'AS', dept: 'Regulatory',         designation: 'Regulatory Affairs Mgr.',  location: 'Delhi',     salary: 88000,  status: 'On Leave',  gender: 'F', joined: '2020-11-10', email: 'anita.s@greenhr.in',    phone: '9312345678' },
  { id: 'GH004', name: 'Mohammed Ali',   initials: 'MA', dept: 'Manufacturing',      designation: 'Production Manager',       location: 'Hyderabad', salary: 78000,  status: 'Active',    gender: 'M', joined: '2019-06-20', email: 'mohammed.a@greenhr.in', phone: '9440012345' },
  { id: 'GH005', name: 'Sneha Patel',    initials: 'SP', dept: 'QA/QC',             designation: 'QA Lead',                  location: 'Ahmedabad', salary: 82000,  status: 'Active',    gender: 'F', joined: '2021-09-05', email: 'sneha.p@greenhr.in',    phone: '9712345678' },
  { id: 'GH006', name: 'Rohit Verma',    initials: 'RV', dept: 'Sales & Marketing',  designation: 'Regional Sales Manager',   location: 'Bangalore', salary: 91000,  status: 'Active',    gender: 'M', joined: '2020-02-14', email: 'rohit.v@greenhr.in',    phone: '9845012345' },
  { id: 'GH007', name: 'Kavitha Nair',   initials: 'KN', dept: 'HR',                designation: 'HR Manager',               location: 'Chennai',   salary: 76000,  status: 'Active',    gender: 'F', joined: '2021-05-22', email: 'kavitha.n@greenhr.in',  phone: '9444012345' },
  { id: 'GH008', name: 'Arun Gupta',     initials: 'AG', dept: 'Finance',            designation: 'Finance Controller',       location: 'Mumbai',    salary: 112000, status: 'Active',    gender: 'M', joined: '2018-08-01', email: 'arun.g@greenhr.in',     phone: '9820198765' },
  { id: 'GH009', name: 'Deepak Sharma',  initials: 'DS', dept: 'IT',                designation: 'IT Lead',                  location: 'Pune',      salary: 85000,  status: 'Active',    gender: 'M', joined: '2022-01-10', email: 'deepak.s@greenhr.in',   phone: '9011987654' },
  { id: 'GH010', name: 'Pooja Mehta',    initials: 'PM', dept: 'Medical Affairs',    designation: 'Medical Officer',          location: 'Delhi',     salary: 68000,  status: 'Probation', gender: 'F', joined: '2024-02-01', email: 'pooja.m@greenhr.in',    phone: '9312987654' },
]

export const CANDIDATES = [
  { name: 'Harper Lee',    role: 'Product Designer', status: 'Processing', email: 'harper.l@gmail.com', phone: '123 456 7890', experience: '4 Years', appliedOn: '12 Sep, 2023' },
  { name: 'Francis Degas', role: 'Front End Dev',    status: 'Selected',   email: 'francis.d@gmail.com', phone: '234 567 8901', experience: '2 Years', appliedOn: '10 Aug, 2023' },
  { name: 'Leonora C.',    role: 'Product Manager', status: 'Processing', email: 'leonora.c@gmail.com', phone: '345 678 9012', experience: '5 Years', appliedOn: '23 Sep, 2023' },
  { name: 'Andrew Hunt',   role: 'Creative Lead',   status: 'Selected',   email: 'andrew.h@gmail.com',  phone: '456 789 0123', experience: '8 Years', appliedOn: '15 Jan, 2023' },
  { name: 'Sealey Booth',  role: 'Content Writer',  status: 'Selected',   email: 'sealey.b@gmail.com',  phone: '567 890 1234', experience: '3 Years', appliedOn: '12 May, 2023' },
  { name: 'Ruth Vega',     role: 'Front End Dev',    status: 'Processing', email: 'ruth.v@gmail.com',    phone: '678 901 2345', experience: '6 Years', appliedOn: '23 Sep, 2023' },
]

export const DEPARTMENTS = [
  'Medical Affairs','Clinical Research','Regulatory','Manufacturing',
  'QA/QC','Sales & Marketing','HR','Finance','IT'
]

export const DEPT_HEADCOUNT = [
  { dept: 'Sales & Marketing', count: 2 },
  { dept: 'Medical Affairs',   count: 2 },
  { dept: 'Clinical Research', count: 2 },
  { dept: 'Manufacturing',     count: 2 },
  { dept: 'Regulatory',        count: 2 },
  { dept: 'QA/QC',             count: 2 },
  { dept: 'Finance',           count: 1 },
  { dept: 'HR',                count: 1 },
  { dept: 'IT',                count: 1 },
]

export const ATTENDANCE_WEEK = [
  { day: 'Mon', present: 11, absent: 2, halfday: 2 },
  { day: 'Tue', present: 13, absent: 1, halfday: 1 },
  { day: 'Wed', present: 12, absent: 2, halfday: 1 },
  { day: 'Thu', present: 14, absent: 1, halfday: 0 },
  { day: 'Fri', present: 10, absent: 3, halfday: 2 },
  { day: 'Sat', present: 6,  absent: 8, halfday: 1 },
  { day: 'Sun', present: 2,  absent: 12,halfday: 1 },
]

export const HEADCOUNT_TREND = [
  { month: 'Jun', count: 10 }, { month: 'Jul', count: 11 },
  { month: 'Aug', count: 11 }, { month: 'Sep', count: 12 },
  { month: 'Oct', count: 13 }, { month: 'Nov', count: 13 },
  { month: 'Dec', count: 14 }, { month: 'Jan', count: 14 },
  { month: 'Feb', count: 14 }, { month: 'Mar', count: 15 },
  { month: 'Apr', count: 15 }, { month: 'May', count: 15 },
]

export const LEAVE_REQUESTS = [
  { id: 1, name: 'Anita Singh',  type: 'Sick Leave',   from: '2026-05-16', to: '2026-05-18', days: 3, reason: 'Fever and rest',  status: 'Pending'  },
  { id: 2, name: 'Anjali Reddy', type: 'Earned Leave', from: '2026-05-20', to: '2026-05-22', days: 3, reason: 'Family function', status: 'Pending'  },
  { id: 3, name: 'Sanjay Bose',  type: 'Casual Leave', from: '2026-05-26', to: '2026-05-26', days: 1, reason: 'Personal work',  status: 'Pending'  },
]

export const PAYROLL_HISTORY = [
  { month: 'April 2026',    employees: 15, gross: '₹11,47,000', net: '₹9,98,500',  status: 'Processed' },
  { month: 'March 2026',    employees: 15, gross: '₹11,47,000', net: '₹9,98,500',  status: 'Processed' },
  { month: 'February 2026', employees: 14, gross: '₹10,72,000', net: '₹9,33,000',  status: 'Processed' },
  { month: 'January 2026',  employees: 14, gross: '₹10,72,000', net: '₹9,33,000',  status: 'Processed' },
  { month: 'December 2025', employees: 13, gross: '₹9,95,000',  net: '₹8,66,000',  status: 'Processed' },
]

export const COMPLIANCE_STATUS = [
  { label: 'PF Compliant',  sub: 'Filed for Apr 2026', due: '15 May 2026', amount: '₹1,84,500' },
  { label: 'ESI Compliant', sub: 'Filed for Apr 2026', due: '15 May 2026', amount: '₹62,400'   },
  { label: 'TDS Compliant', sub: 'Filed for Apr 2026', due: '07 May 2026', amount: '₹94,200'   },
  { label: 'Labour Law',    sub: 'PT, LWF up to date', due: '31 May 2026', amount: '₹21,950'   },
]

export const LEAVE_BALANCE = [
  { type: 'Earned Leave',       code: 'EL', total: 21, used: 8  },
  { type: 'Casual Leave',       code: 'CL', total: 12, used: 5  },
  { type: 'Sick Leave',         code: 'SL', total: 10, used: 3  },
  { type: 'Restricted Holiday', code: 'RH', total: 2,  used: 0  },
]

export const FEED_POSTS = [
  { id: 1, user: 'Knut Hamsun', role: 'HR Manager', type: 'Announcement', title: 'Annual Meet in France 🥐', content: 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system...', time: '12:30 PM' },
  { id: 2, user: 'Santor Marie', role: 'Content Manager', type: 'Poll', title: 'Get new software for Lead Generation 🚀', content: 'But I must explain to you how all this mistaken idea of denouncing pleasure...', time: 'Yesterday' },
]

export const TEAM_MEMBERS = [
  { name: 'Harper Lee', role: 'Creative Lead', performance: '08', potential: 'High', feedback: 'Given', flpp: 'Passed' },
  { name: 'Francis Degas', role: 'Front End Developer', performance: '07', potential: 'High', feedback: 'Given', flpp: 'Passed' },
]

export const ATTRITION_DEPT = [
  { dept: 'Sales & Marketing', rate: 18 },
  { dept: 'Manufacturing',     rate: 12 },
  { dept: 'Clinical Research', rate: 8  },
  { dept: 'QA/QC',             rate: 6  },
  { dept: 'Medical Affairs',   rate: 5  },
  { dept: 'Regulatory',        rate: 4  },
]

export const RECENT_ACTIVITY = [
  { id: 1, action: 'Priya Sharma marked attendance',       time: '9:02 AM',   icon: '✅' },
  { id: 2, action: 'Payslip generated for April 2026',     time: '8:50 AM',   icon: '💰' },
  { id: 3, action: 'Leave approved for Rohit Verma',       time: '8:30 AM',   icon: '📋' },
  { id: 4, action: 'New employee Pooja Mehta onboarded',   time: 'Yesterday', icon: '👤' },
]

export const UPCOMING_EVENTS = [
  { id: 1, type: 'Birthday',     name: 'Rajesh Kumar',   date: 'May 18', icon: '🎂' },
  { id: 2, type: 'Anniversary',  name: 'Arun Gupta',     date: 'May 22', icon: '🎉' },
  { id: 3, type: 'Review Cycle', name: 'Q1 PMS Reviews', date: 'May 30', icon: '🎯' },
]

export const CALENDAR_MAY = {
  1:'P',2:'P',3:'P',4:'P',5:'P',6:'W',7:'W',
  8:'P',9:'P',10:'P',11:'P',12:'P',13:'W',14:'W',
  15:'P',16:'P',17:'A',18:'P',19:'L',20:'W',21:'W',
  22:'P',23:'H',24:'P',25:'P',26:'P',27:'W',28:'W',
  29:'P',30:'P',31:'P',
}

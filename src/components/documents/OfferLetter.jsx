import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import html2pdf from 'html2pdf.js'
import { ArrowLeft, Printer, RefreshCw, CheckCircle2, X, ExternalLink, Mail, FileText } from 'lucide-react'
import { PrimaryBtn, OutlineBtn } from '../ui'
import { fetchProfile } from '../../redux/actions/authActions'
import { CompanyOfferLetter, CompanyRoles, CompanyDepartments } from '../../redux/actions/companyAction'
import { getMyTeam } from '../../redux/actions/teamActions'

const getFullAssetUrl = (relativeUrl) => {
  if (!relativeUrl) return "";
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://") || relativeUrl.startsWith("data:")) {
    return relativeUrl;
  }
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const base = isLocalhost ? 'https://api-mr-software.gmaxepay.in' : window.location.origin;
  return `${base}${relativeUrl}`;
};

// Helper to convert salary numbers to Indian currency words
function numberToWordsINR(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];

  num = Math.floor(Number(num) || 0);
  if (num === 0) return 'Zero';

  function translate(n) {
    let word = '';
    if (n < 20) {
      word = a[n];
    } else if (n < 100) {
      word = b[Math.floor(n / 10)] + a[n % 10];
    } else {
      word = a[Math.floor(n / 100)] + 'Hundred ' + translate(n % 100);
    }
    return word;
  }

  let result = '';
  if (num >= 10000000) {
    result += translate(Math.floor(num / 10000000)) + 'Crore ';
    num %= 10000000;
  }
  if (num >= 100000) {
    result += translate(Math.floor(num / 100000)) + 'Lakh ';
    num %= 100000;
  }
  if (num >= 1000) {
    result += translate(Math.floor(num / 1000)) + 'Thousand ';
    num %= 1000;
  }
  if (num > 0) {
    if (result !== '' && num < 100) {
      result += 'and ' + translate(num);
    } else {
      result += translate(num);
    }
  }

  return result.trim();
}

export default function OfferLetter({ onBack }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { team: employees = [] } = useSelector((state) => state.team);
  const { getRoles = [], getDepartments = [] } = useSelector((state) => state.company);

  // Fetch profile, team, and roles on mount
  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(getMyTeam());
    dispatch(CompanyRoles());
    dispatch(CompanyDepartments());
  }, [dispatch]);

  // Prepopulated state defaults mapping the Noel Pharma sample letter
  const [candidateName, setCandidateName] = useState('AMARESH')
  const [parentName, setParentName] = useState('Timmanagouda')
  const [addressLine1, setAddressLine1] = useState('R/o Basavanilaya')
  const [addressLine2, setAddressLine2] = useState('Near Gadderaya Temple Kanaka Nagar')
  const [addressLine3, setAddressLine3] = useState('SHAHAPUR DIST. Yadagiri -585223')
  const [mobile, setMobile] = useState('9845173883')
  const [email, setEmail] = useState('amaresh.dond1@gmail.com')

  // Offer Details
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Sales & Marketing Department')
  const [companyName, setCompanyName] = useState('NOEL PHARMA (INDIA) PRIVATE LIMITED')
  const [companyRegAddress, setCompanyRegAddress] = useState('Survey Nos: 1 to 40, Plot No. 109, Uppal Bhagagayath Revenue Village, Uppal-Mandal, Medchal-Malkajgiri, Hyderabad-500039')
  const [joiningDate, setJoiningDate] = useState('2025-12-18')
  const [baseLocation, setBaseLocation] = useState('SURVEY NOS: 1 TO 40, PLOT NO. 109, UPPAL BHAGAGAYATH REVENUE VILLAGE, UPPAL-MANDAL, MEDCHAL-MALKAJGIRI, HYDERABAD-500039')

  // Salary & Allowance Specs
  const [salaryAmount, setSalaryAmount] = useState(25000)
  const [salaryWords, setSalaryWords] = useState('Twenty-Five Thousand')
  const [hqAllowance, setHqAllowance] = useState(200)
  const [exStationAllowance, setExStationAllowance] = useState(250)
  const [outStationAllowance, setOutStationAllowance] = useState(400)
  const [conveyanceRate, setConveyanceRate] = useState(2.25)

  // Exit/HR Contact & Manager reporting details
  const [reportingManager, setReportingManager] = useState('Area Sales Manager, Mr. Basavaraj')
  const [reportingPhone, setReportingPhone] = useState('9886024514')
  const [hrEmail, setHrEmail] = useState('mail-noelhr1975@gmail.com')
  const [hrHeadName, setHrHeadName] = useState('CH. MURTHY')
  const [hrHeadDesignation, setHrHeadDesignation] = useState('Head - HR')

  const [probationPeriod, setProbationPeriod] = useState('3 months')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState({ emailSentTo: '', previewUrl: '', status: '' })
  const [modalError, setModalError] = useState('')

  // Ref to the printable live document sheet
  const printableRef = useRef(null)

  // Dynamic company assets sync when user profile loads
  useEffect(() => {
    if (user) {
      if (user.fullName) setCompanyName(user.fullName.toUpperCase());
      if (user.address) {
        setCompanyRegAddress(user.address);
        setBaseLocation(user.address.toUpperCase());
      }
      if (user.email) setHrEmail(user.email);
    }
  }, [user]);

  // Format date helper to DD.MM.YYYY
  const formatDateIN = (dateStr) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`
    }
    return dateStr
  }

  // Handle salary inputs to auto generate words in Title Case
  const handleSalaryChange = (value) => {
    const amt = Number(value) || 0
    setSalaryAmount(amt)
    const words = numberToWordsINR(amt)
    if (words) {
      const formattedWords = words.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      setSalaryWords(formattedWords)
    } else {
      setSalaryWords('')
    }
  }

  // Load a live employee record from API team into form states
  const handleLoadEmployee = (empId) => {
    const emp = employees.find(e => (e.employeeId || e.id) === empId)
    if (emp) {
      setCandidateName((emp.fullName || emp.name || '').toUpperCase())
      setParentName('_______________')
      setAddressLine1('R/o ' + (emp.location || emp.city || '_______________'))
      setAddressLine2('_______________')
      setAddressLine3((emp.location || emp.city || '') + ' DIST.')
      setMobile(emp.phone || emp.mobileNumber || '9999999999')
      setEmail(emp.email || '')
      setDesignation(emp.designation === 'Sr. Medical Officer' ? 'TSE' : (emp.designation || 'TSE'))
      setDepartment(emp.department || emp.dept || 'Sales & Marketing Department')
      setBaseLocation(companyRegAddress.toUpperCase())

      const sal = emp.salary || emp.salaryAmount || 25000
      setSalaryAmount(sal)
      const words = numberToWordsINR(sal)
      const formattedWords = words.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      setSalaryWords(formattedWords)
    }
  }

  // Handle preloading of reporting manager from team list
  const handleSelectManager = (empId) => {
    const mgr = employees.find(e => (e.employeeId || e.id) === empId || e.id?.toString() === empId);
    if (mgr) {
      const formattedRole = mgr.role 
        ? mgr.role.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') 
        : 'Manager';
      
      setReportingManager(`${formattedRole}, ${mgr.fullName}`);
      setReportingPhone(mgr.phone || '');
    }
  };

  const handlePrint = () => {
    if (!joiningDate) {
      setJoiningDate(new Date().toISOString().split('T')[0])
    }
    window.print()
  }

  const handleGenerateOfferLetter = async () => {
    if (!email || !email.includes('@')) {
      setModalError('Please enter a valid candidate email address before generating.')
      setShowModal(true)
      return
    }

    setIsGenerating(true)
    setModalError('')

    try {
      // 1. Capture the live rendered document HTML from the printable sheet ref
      const sheetElement = printableRef.current
      if (!sheetElement) throw new Error('Document preview not ready. Please try again.')

      const fileName = `offer_letter_${candidateName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.pdf`

      // 2. Configure html2pdf options
      const opt = {
        margin: [0, 0, 0, 0],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          letterRendering: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // 3. Generate PDF as a blob
      const pdfBlob = await html2pdf().set(opt).from(sheetElement).output('blob');

      // 4. Build FormData with email and file
      const formData = new FormData()
      formData.append('email', email)
      formData.append('file', pdfBlob, fileName)

      // 5. Dispatch the FormData to the API
      const res = await dispatch(CompanyOfferLetter(formData))

      if (res && res.data) {
        setModalData({
          emailSentTo: res.data.emailSentTo || email,
          previewUrl: res.data.previewUrl || '',
          status: res.data.status || 'SENT'
        })
        setModalError('')
        setShowModal(true)
      } else {
        setModalError(res?.message || 'Failed to generate offer letter. Backend did not return expected data.')
        setShowModal(true)
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'An unexpected error occurred.')
      setShowModal(true)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      {/* Editor Control Console (Screen-only) */}
      <div className="no-print mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Navigation & Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <OutlineBtn onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-sm">
              <ArrowLeft size={16} /> Back to Hub
            </OutlineBtn>
            <h3 className="text-base font-extrabold text-gray-900">Noel Pharma Offer Customizer</h3>
          </div>

          {/* Quick Preload */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">Load Database Template:</span>
            <select
              onChange={e => handleLoadEmployee(e.target.value)}
              defaultValue=""
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
            >
              <option value="" disabled>Select Employee Template…</option>
              {employees.map(emp => (
                <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                  {emp.fullName || emp.name} ({emp.designation || 'Employee'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Matrix Grid */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

          <div className="col-span-full mt-4 mb-2 border-b border-gray-100 pb-1 text-xs font-black uppercase tracking-wider text-teal-700">Candidate Profile</div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Candidate Name (uppercase)</label>
            <input type="text" value={candidateName} onChange={e => setCandidateName(e.target.value.toUpperCase())} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Father Name (S/o)</label>
            <input type="text" value={parentName} onChange={e => setParentName(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Mobile Number</label>
            <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Address Line 1 (Residence)</label>
            <input type="text" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" placeholder="e.g. R/o Basavanilaya" />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Address Line 2 (Locality/St)</label>
            <input type="text" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" placeholder="e.g. Near Gadderaya Temple" />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Address Line 3 (District/PIN)</label>
            <input type="text" value={addressLine3} onChange={e => setAddressLine3(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" placeholder="e.g. SHAHAPUR DIST. Yadagiri - 585223" />
          </div>

          <div className="col-span-full mt-4 mb-2 border-b border-gray-100 pb-1 text-xs font-black uppercase tracking-wider text-teal-700">Offer & Base details</div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Designation / Capacity</label>
             <select
               value={designation}
               onChange={e => setDesignation(e.target.value)}
               className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 cursor-pointer"
             >
               <option value="" disabled>Select Role…</option>
               {getRoles.map((role) => (
                 <option key={role} value={role}>
                   {role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                 </option>
               ))}
             </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Department</label>
            <select
               value={department}
               onChange={e => setDepartment(e.target.value)}
               className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 cursor-pointer"
             >
               <option value="" disabled>Select Department…</option>
               {getDepartments.map((dept) => (
                 <option key={dept} value={dept}>
                   {dept.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                 </option>
               ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Joining / Offer Date</label>
            <input type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Base Location (uppercase)</label>
            <input type="text" value={baseLocation} onChange={e => setBaseLocation(e.target.value.toUpperCase())} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Probation Period</label>
            <input type="text" value={probationPeriod} onChange={e => setProbationPeriod(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>

          <div className="col-span-full mt-4 mb-2 border-b border-gray-100 pb-1 text-xs font-black uppercase tracking-wider text-teal-700">Remuneration & Allowances</div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Monthly Consolidated Salary (₹)</label>
            <input type="number" value={salaryAmount} onChange={e => handleSalaryChange(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Salary in Words</label>
            <input type="text" value={salaryWords} onChange={e => setSalaryWords(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">HQ Allowance (Daily ₹)</label>
            <input type="number" value={hqAllowance} onChange={e => setHqAllowance(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Ex-Station Allowance (Daily ₹)</label>
            <input type="number" value={exStationAllowance} onChange={e => setExStationAllowance(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Out-Station Allowance (Daily ₹)</label>
            <input type="number" value={outStationAllowance} onChange={e => setOutStationAllowance(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Conveyance Rate per KM (₹)</label>
            <input type="number" step="0.01" value={conveyanceRate} onChange={e => setConveyanceRate(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>

          <div className="col-span-full mt-4 mb-2 border-b border-gray-100 pb-1 text-xs font-black uppercase tracking-wider text-teal-700">Reporting & HR Signature Info</div>
          <div className="col-span-1 sm:col-span-2">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Choose Reporting Manager</label>
            <select
              onChange={e => handleSelectManager(e.target.value)}
              defaultValue=""
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 cursor-pointer"
            >
              <option value="" disabled>Select manager to autofill…</option>
              {employees.map(emp => (
                <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                  {emp.fullName || emp.name} ({emp.role ? emp.role.replace(/_/g, ' ') : 'Employee'})
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Reporting Manager Title & Name</label>
            <input type="text" value={reportingManager} onChange={e => setReportingManager(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Reporting Phone</label>
            <input type="text" value={reportingPhone} onChange={e => setReportingPhone(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">HR Signatory Name</label>
            <input type="text" value={hrHeadName} onChange={e => setHrHeadName(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">HR Signatory Title</label>
            <input type="text" value={hrHeadDesignation} onChange={e => setHrHeadDesignation(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
          </div>

        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap justify-end gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
          <OutlineBtn onClick={handleGenerateOfferLetter} disabled={isGenerating} className="flex items-center gap-2 px-5 py-2 text-sm">
            <RefreshCw size={16} className={isGenerating ? "animate-spin" : ""} />
            {isGenerating ? "Generating..." : "Generate Offer Letter"}
          </OutlineBtn>
          <PrimaryBtn onClick={handlePrint} className="flex items-center gap-2 px-5 py-2 text-sm">
            <Printer size={16} /> Print / Export PDF
          </PrimaryBtn>
        </div>

      </div>

      {/* Success / Error Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl transition-all">
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <X size={18} />
            </button>

            {modalError ? (
              /* Error State */
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                  <X size={24} className="text-red-500" />
                </div>
                <h3 className="text-base font-extrabold text-gray-900">Generation Failed</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-sm">{modalError}</p>
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-2 w-full rounded-xl bg-gray-950 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-gray-900 shadow-sm cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Success State */
              <>
                {/* Header */}
                <div className="flex flex-col items-center gap-2 text-center mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                    <CheckCircle2 size={28} className="text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">Offer Letter Dispatched!</h3>
                  <p className="text-xs text-gray-500">The document has been emailed successfully to the candidate.</p>
                </div>

                {/* Info Rows */}
                <div className="flex flex-col gap-3 mb-6">
                  {/* Email Sent To */}
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Email Sent To</p>
                      <p className="text-sm font-bold text-gray-800">{modalData.emailSentTo}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Delivery Status</p>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-2xs font-extrabold uppercase text-emerald-600 tracking-wider inline-block mt-0.5">
                        {modalData.status}
                      </span>
                    </div>
                  </div>

                  {/* Preview URL */}
                  {modalData.previewUrl && (
                    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <FileText size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Preview URL</p>
                        <a
                          href={getFullAssetUrl(modalData.previewUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition overflow-hidden text-overflow-ellipsis whitespace-nowrap"
                        >
                          Open Document <ExternalLink size={12} className="shrink-0" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action */}
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full rounded-2xl bg-gray-950 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-gray-900 shadow-sm cursor-pointer"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Live Document Sheet View */}
      <div
        ref={printableRef}
        className="printable-sheet relative mx-auto flex w-full max-w-[800px] min-h-[297mm] flex-col justify-between overflow-hidden rounded-lg border border-gray-200 bg-white px-12 md:px-16 pt-12 md:pt-14 pb-4 md:pb-6 shadow-xl leading-relaxed text-gray-800 box-border"
      >
        {/* Top-Right Decorative Accents */}
        <div
          className="absolute top-0 right-0 z-10 h-[86px] w-[295px] bg-amber-600"
          style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
        />
        <div
          className="absolute top-0 right-0 z-20 h-20 w-[280px] bg-gradient-to-br from-green-700 to-green-800"
          style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
        />

        {/* Bottom Decorative Slanted Accents */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 h-[47px] bg-amber-600"
          style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 35%)' }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 z-20 h-10 bg-gradient-to-r from-green-700 to-green-800"
          style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 45%)' }}
        />

        {/* Main content wrapper containing header, body and signature block */}
        <div className="relative z-30 flex flex-1 flex-col gap-2 md:gap-3">
          {/* Letterhead Header */}
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3.5">
              {user?.logoUrl ? (
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
                  <img src={getFullAssetUrl(user.logoUrl)} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 15 C38 28, 16 38, 16 58 C16 78, 50 88, 50 88 C50 88, 84 78, 84 58 C84 38, 62 28, 50 15 Z" fill="#166534" />
                  <path d="M50 19 C42 31, 25 40, 25 56 C25 71, 50 78, 50 78 C50 78, 75 71, 75 56 C75 40, 58 31, 50 19 Z" fill="#ffffff" />
                  <path d="M50 19 L50 78" stroke="#166534" strokeWidth="3" />
                  <path d="M50 36 C42 41, 38 48, 38 56" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M50 46 C58 51, 62 58, 62 66" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M50 28 C58 33, 62 40, 62 48" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M50 54 C42 59, 38 66, 38 74" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              )}
              <div>
                <div className="max-w-[280px] font-serif text-lg font-black uppercase leading-none tracking-wider text-green-800">
                  {companyName}
                </div>
              </div>
            </div>

            {/* Document Date */}
            <div className="mt-2 text-sm font-semibold text-gray-700 sm:mt-4 sm:pr-24">
              Date: {formatDateIN(joiningDate)}
            </div>
          </div>

          {/* Recipient Block */}
          <div className="mb-4 text-xs leading-relaxed text-gray-800">
            <div className="font-bold">To,</div>
            <div className="mt-0.5 text-[13px] font-extrabold uppercase tracking-wide text-gray-900">{candidateName}</div>
            <div className="mt-0.5">S/o {parentName} {addressLine1}</div>
            {addressLine2 && <div>{addressLine2}</div>}
            <div>{addressLine3}</div>
            {mobile && <div>Mobile: {mobile}</div>}
            {email && <div>Email: {email}</div>}
          </div>

          {/* Salutation */}
          <div className="mb-2 text-xs font-bold text-gray-800">
            Dear Mr. {candidateName.split(' ')[0]},
          </div>

          {/* Subject Header */}
          <div className="mb-4 text-center text-xs font-extrabold uppercase tracking-wider text-gray-900 underline">
            Sub: Offer Letter
          </div>

          {/* Body Paragraphs */}
          <div className="flex flex-col gap-3 text-justify text-xs leading-relaxed text-gray-800 font-medium">
            <p className="margin-0 indent-8">
              We are pleased to offer you an employment in the capacity of <strong>{designation}</strong>, in <strong>{department}</strong> in M/s. <strong>{companyName}</strong>, {companyRegAddress}.
            </p>

            <p className="margin-0">
              Please report to duty <strong>on or before {formatDateIN(joiningDate)}</strong>. Your base location will be <strong>{baseLocation}</strong>. You will be governed by policies of the Company. Please be noted that fail to report on or before the said date, this offer will be ceased.
            </p>

            <p className="margin-0">
              We believe that your skills and background would be a valuable asset to our organization.
            </p>

            <p className="margin-0">
              You will be entitled to a consolidated salary of <strong>INR {Number(salaryAmount).toLocaleString('en-IN')}/- ({salaryWords} only)</strong> per month. Apart from the salary you will be entitled to get HQs.{hqAllowance}/-, Ex. Station Allowances Rs.{exStationAllowance}/-, Out Station Allowances Rs.{outStationAllowance}/- per day and Rs.{conveyanceRate} paise per KM for Ex. Station and Out station work.
            </p>

            <p className="margin-0">
              On your joining date please bring/send (<strong>{hrEmail}</strong>) the documents i.e A) 2 Passport size photographs. B) Photocopy of all Educational and Technical Qualification Certificates. C) Relieving Letter and Experience Certificate from your present employer. D) Last drawn Salary Slip /Certificate showing monthly salary and Annual benefits, from the present employer, Pan card, Aadhar card, Driving License copy etc.
            </p>

            <p className="margin-0">
              This is a provisional offer letter. The detailed letter with terms and conditions of employment will be handed over to you on your joining date.
            </p>

            <div className="mt-1">
              <div className="font-bold mb-1">Please review this offer and to confirm your acceptance.</div>
              <ul className="pl-5 list-disc flex flex-col gap-1">
                <li>Please confirm your acceptance <strong>before {formatDateIN(joiningDate)}</strong>, via an email, failing which this offer will cease to exist.</li>
                <li>Any change of joining date request must be intimated in advance and should be agreed mutually.</li>
                <li>Your will be reporting your <strong>{reportingManager} ({reportingPhone})</strong>.</li>
                <li>Reporting: <strong>Reporting time & location</strong> will be communicated by your Reporting Manager at the time of joining.</li>
              </ul>
            </div>
            <p className="mt-1">
              We look forward to your joining the company and become a productive member of the team.<br />
              <strong>Welcome to {companyName},</strong>
            </p>
          </div>

          {/* Signatures Footer */}
          <div className="signature-block mt-auto flex flex-row items-end justify-between pt-6 text-xs text-gray-800">
            <div>
              <div className="font-bold">Yours Sincerely,</div>
              <div className="mb-6 text-[10px] font-black uppercase text-gray-900">for {companyName},</div>

              {/* Stamp Image if configured, fallback to Simulated Sign */}
              {user?.companyStampUrl ? (
                <div className="mb-1 flex h-14 items-center">
                  <img src={getFullAssetUrl(user.companyStampUrl)} alt="Stamp" className="max-h-full object-contain" />
                </div>
              ) : (
                /* Ink Blue Sign Simulation */
                <div
                  className="mb-0.5 h-8 select-none font-serif text-xl font-bold text-blue-900 rotate-[-4deg] translate-x-2.5"
                  style={{ fontFamily: "'Brush Script MT', cursive, sans-serif" }}
                >
                  {hrHeadName}
                </div>
              )}

              <div className="mb-1 w-40 border-t border-gray-400"></div>
              <div className="text-[10px] font-black uppercase tracking-wide text-gray-950">{hrHeadName}</div>
              <div className="text-[9px] font-semibold text-gray-500">{hrHeadDesignation}</div>
            </div>

            <div className="text-right flex flex-col items-end">
              <div className="h-14"></div>

              <div className="mb-1 w-40 border-t border-gray-400"></div>
              <div className="text-[10px] font-black uppercase tracking-wide text-gray-950">Candidate Signature</div>
              <div className="text-[9px] font-semibold text-gray-500">Date: ________________</div>
            </div>
          </div>
        </div>

        {/* Letter Footer Address - Rendered as flex child below content, ensuring zero overlap */}
        <div className="relative z-30 mt-6 border-t border-gray-100 pt-3 pb-12 text-center text-[10px] leading-relaxed text-gray-500">
          <div className="mb-0.5 font-sans text-sm font-black uppercase tracking-widest text-amber-700">
            {companyName}
          </div>
          <div>
            Regd. Office: {companyRegAddress}
          </div>
          <div className="font-bold text-gray-600">
            {user?.phone && `Ph: ${user.phone} | `}Email: {hrEmail}
          </div>
        </div>

      </div>
    </div>
  )
}

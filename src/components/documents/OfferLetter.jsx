import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ArrowLeft, Printer } from 'lucide-react'
import { EMPLOYEES } from '../../data/hrmsData'
import { PrimaryBtn, OutlineBtn } from '../ui'
import { fetchProfile } from '../../redux/actions/authActions'
import { API_ROUTE } from '../../data/env'

// Helper to resolve backend relative file upload paths to absolute URLs using the API origin
const getFullAssetUrl = (relativeUrl) => {
  if (!relativeUrl) return "";
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://") || relativeUrl.startsWith("data:")) {
    return relativeUrl;
  }
  try {
    const url = new URL(API_ROUTE);
    return `${url.origin}${relativeUrl}`;
  } catch (e) {
    // Fallback path mapping for dev and production
    return `https://api-mr-software.gmaxepay.in${relativeUrl}`;
  }
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

  // Fetch admin profile on mount to sync dynamic company assets
  useEffect(() => {
    dispatch(fetchProfile());
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
  const [designation, setDesignation] = useState('TSE')
  const [department, setDepartment] = useState('Sales & Marketing Department')
  const [companyName, setCompanyName] = useState('NOEL PHARMA (INDIA) PRIVATE LIMITED')
  const [companyRegAddress, setCompanyRegAddress] = useState('Survey Nos: 1 to 40, Plot No. 109, Uppal Bhagagayath Revenue Village, Uppal-Mandal, Medchal-Malkajgiri, Hyderabad-500039')
  const [joiningDate, setJoiningDate] = useState('2025-12-18')
  const [baseLocation, setBaseLocation] = useState('SHAHAPUR, KARNATAKA')

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

  // Dynamic company assets sync when user profile loads
  useEffect(() => {
    if (user) {
      if (user.fullName) setCompanyName(user.fullName.toUpperCase());
      if (user.address) setCompanyRegAddress(user.address);
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

  // Load a pre-existing employee database record into states
  const handleLoadEmployee = (empId) => {
    const emp = EMPLOYEES.find(e => e.id === empId)
    if (emp) {
      setCandidateName(emp.name.toUpperCase())
      setParentName('_______________') // Default blank for father
      setAddressLine1('R/o ' + emp.location)
      setAddressLine2('_______________')
      setAddressLine3(emp.location + ' DIST.')
      setMobile(emp.phone || '9999999999')
      setEmail(emp.email || '')
      setDesignation(emp.designation === 'Sr. Medical Officer' ? 'TSE' : emp.designation)
      setDepartment(emp.dept || 'Sales & Marketing Department')
      setBaseLocation(emp.location.toUpperCase() + ', KARNATAKA')
      
      const sal = emp.salary || 25000
      setSalaryAmount(sal)
      const words = numberToWordsINR(sal)
      const formattedWords = words.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      setSalaryWords(formattedWords)
    }
  }

  const handlePrint = () => {
    if (!joiningDate) {
      setJoiningDate(new Date().toISOString().split('T')[0])
    }
    window.print()
  }

  // Editor Inputs Styles
  const inpStyle = {
    background: '#f9fafb',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    color: '#111827',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s ease'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#4b5563',
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }

  const sectionHeaderStyle = {
    fontSize: '13px',
    fontWeight: 800,
    color: '#0f766e',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '4px',
    marginBottom: '12px',
    marginTop: '16px',
    gridColumn: '1 / -1',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }

  return (
    <div className="document-container">
      {/* Editor Control Console (Screen-only) */}
      <div className="no-print" style={{
        background: '#fff',
        padding: '24px',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        border: '1px solid #e5e7eb',
        marginBottom: '28px'
      }}>
        {/* Navigation & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <OutlineBtn onClick={onBack} style={{ padding: '8px 16px', fontSize: '13px' }}>
              <ArrowLeft size={16} /> Back to Hub
            </OutlineBtn>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>Noel Pharma Offer Customizer</h3>
          </div>
          
          {/* Quick Preload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', color: '#6b7280', fontWeight: 500 }}>Load Database Template:</span>
            <select
              onChange={e => handleLoadEmployee(e.target.value)}
              defaultValue=""
              style={{
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#111827',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="" disabled>Select Employee Template…</option>
              {EMPLOYEES.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.designation})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Matrix Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          
          <div style={sectionHeaderStyle}>Candidate Profile</div>
          <div>
            <label style={labelStyle}>Candidate Name (uppercase)</label>
            <input type="text" value={candidateName} onChange={e => setCandidateName(e.target.value.toUpperCase())} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Father Name (S/o)</label>
            <input type="text" value={parentName} onChange={e => setParentName(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Mobile Number</label>
            <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inpStyle} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Address Line 1 (Residence)</label>
            <input type="text" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} style={inpStyle} placeholder="e.g. R/o Basavanilaya" />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Address Line 2 (Locality/St)</label>
            <input type="text" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} style={inpStyle} placeholder="e.g. Near Gadderaya Temple" />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Address Line 3 (District/PIN)</label>
            <input type="text" value={addressLine3} onChange={e => setAddressLine3(e.target.value)} style={inpStyle} placeholder="e.g. SHAHAPUR DIST. Yadagiri - 585223" />
          </div>

          <div style={sectionHeaderStyle}>Offer & Base details</div>
          <div>
            <label style={labelStyle}>Designation / Capacity</label>
            <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Department</label>
            <input type="text" value={department} onChange={e => setDepartment(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Joining / Offer Date</label>
            <input type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Base Location (uppercase)</label>
            <input type="text" value={baseLocation} onChange={e => setBaseLocation(e.target.value.toUpperCase())} style={inpStyle} />
          </div>

          <div style={sectionHeaderStyle}>Remuneration & Allowances</div>
          <div>
            <label style={labelStyle}>Monthly Consolidated Salary (₹)</label>
            <input type="number" value={salaryAmount} onChange={e => handleSalaryChange(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Salary in Words</label>
            <input type="text" value={salaryWords} onChange={e => setSalaryWords(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>HQ Allowance (Daily ₹)</label>
            <input type="number" value={hqAllowance} onChange={e => setHqAllowance(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Ex-Station Allowance (Daily ₹)</label>
            <input type="number" value={exStationAllowance} onChange={e => setExStationAllowance(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Out-Station Allowance (Daily ₹)</label>
            <input type="number" value={outStationAllowance} onChange={e => setOutStationAllowance(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Conveyance Rate per KM (₹)</label>
            <input type="number" step="0.01" value={conveyanceRate} onChange={e => setConveyanceRate(e.target.value)} style={inpStyle} />
          </div>

          <div style={sectionHeaderStyle}>Reporting & HR Signature Info</div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Reporting Manager Title & Name</label>
            <input type="text" value={reportingManager} onChange={e => setReportingManager(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Reporting Phone</label>
            <input type="text" value={reportingPhone} onChange={e => setReportingPhone(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>HR Signatory Name</label>
            <input type="text" value={hrHeadName} onChange={e => setHrHeadName(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>HR Signatory Title</label>
            <input type="text" value={hrHeadDesignation} onChange={e => setHrHeadDesignation(e.target.value)} style={inpStyle} />
          </div>

        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', background: '#f9fafb', borderRadius: '12px', padding: '12px 18px', border: '1px solid #f3f4f6' }}>
          <PrimaryBtn onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', fontSize: '13.5px' }}>
            <Printer size={16} /> Print / Export PDF
          </PrimaryBtn>
        </div>

      </div>

      {/* Live Document Sheet View */}
      <div className="printable-sheet" style={{
        background: '#fff',
        margin: '0 auto',
        maxWidth: '800px',
        minHeight: '297mm', // Fits A4 print page aspect ratio exactly
        padding: '45px 70px 0 70px', // Bottom padding removed as footer margins handle page clearance
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontFamily: "'Inter', sans-serif",
        color: '#1f2937',
        lineHeight: 1.5,
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Top-Right Decorative Accents */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '280px',
          height: '80px',
          background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
          clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
          zIndex: 2
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '295px',
          height: '86px',
          background: '#d97706',
          clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
          zIndex: 1
        }} />

        {/* Bottom Decorative Slanted Accents */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: 'linear-gradient(90deg, #15803d 0%, #166534 100%)',
          clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 45%)',
          zIndex: 2
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '47px',
          background: '#d97706',
          clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 35%)',
          zIndex: 1
        }} />

        {/* Main content wrapper containing header, body and signature block */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 10 }}>
          {/* Letterhead Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            {/* Logo & Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {user?.logoUrl ? (
                <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={getFullAssetUrl(user.logoUrl)} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
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
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#166534', fontFamily: "'Georgia', serif", letterSpacing: '0.8px', lineHeight: 1.1, textTransform: 'uppercase', maxWidth: '280px' }}>
                  {companyName}
                </div>
                <div style={{ fontSize: '9.5px', color: '#374151', fontWeight: 700, letterSpacing: '0.5px', marginTop: '2px' }}>
                  {user?.adminReferenceCode ? `Ref: ${user.adminReferenceCode}` : 'Since 1975'}
                </div>
              </div>
            </div>
            
            {/* Document Date */}
            <div style={{ paddingRight: '120px', marginTop: '16px', fontSize: '12.5px', color: '#1f2937', fontWeight: 600 }}>
              Date: {formatDateIN(joiningDate)}
            </div>
          </div>

          {/* Recipient Block */}
          <div style={{ marginBottom: '14px', fontSize: '12px', color: '#1f2937', lineHeight: 1.45 }}>
            <div style={{ fontWeight: 700 }}>To,</div>
            <div style={{ fontWeight: 800, fontSize: '13.5px', marginTop: '2px', textTransform: 'uppercase' }}>{candidateName}</div>
            <div>S/o {parentName} {addressLine1}</div>
            {addressLine2 && <div>{addressLine2}</div>}
            <div>{addressLine3}</div>
            {mobile && <div>Mobile: {mobile}</div>}
            {email && <div>Email: {email}</div>}
          </div>

          {/* Salutation */}
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937', marginBottom: '10px' }}>
            Dear Mr. {candidateName.split(' ')[0]},
          </div>

          {/* Subject Header */}
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#111827', textDecoration: 'underline', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Sub: Offer Letter
            </span>
          </div>

          {/* Body Paragraphs */}
          <div style={{ fontSize: '12px', color: '#1f2937', textAlign: 'justify', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ margin: 0, textIndent: '30px' }}>
              We are pleased to offer you an employment in the capacity of <strong>{designation}</strong>, in <strong>{department}</strong> in M/s. <strong>{companyName}</strong>, {companyRegAddress}.
            </p>

            <p style={{ margin: 0 }}>
              Please report to duty <strong>on or before {formatDateIN(joiningDate)}</strong>. Your base location will be <strong>{baseLocation}</strong>. You will be governed by policies of the Company. Please be noted that fail to report on or before the said date, this offer will be ceased.
            </p>

            <p style={{ margin: 0 }}>
              We believe that your skills and background would be a valuable asset to our organization.
            </p>

            <p style={{ margin: 0 }}>
              You will be entitled to a consolidated salary of <strong>INR {Number(salaryAmount).toLocaleString('en-IN')}/- ({salaryWords} only)</strong> per month. Apart from the salary you will be entitled to get HQs.{hqAllowance}/-, Ex. Station Allowances Rs.{exStationAllowance}/-, Out Station Allowances Rs.{outStationAllowance}/- per day and Rs.{conveyanceRate} paise per KM for Ex. Station and Out station work.
            </p>

            <p style={{ margin: 0 }}>
              On your joining date please bring/send (<strong>{hrEmail}</strong>) the documents i.e A) 2 Passport size photographs. B) Photocopy of all Educational and Technical Qualification Certificates. C) Relieving Letter and Experience Certificate from your present employer. D) Last drawn Salary Slip /Certificate showing monthly salary and Annual benefits, from the present employer, Pan card, Aadhar card, Driving License copy etc.
            </p>

            <p style={{ margin: 0 }}>
              This is a provisional offer letter. The detailed letter with terms and conditions of employment will be handed over to you on your joining date.
            </p>

            <div style={{ margin: '4px 0 0 0' }}>
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>Please review this offer and to confirm your acceptance.</div>
              <ul style={{ paddingLeft: '18px', margin: 0, listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <li>Please confirm your acceptance <strong>before {formatDateIN(joiningDate)}</strong>, via an email, failing which this offer will cease to exist.</li>
                <li>Any change of joining date request must be intimated in advance and should be agreed mutually.</li>
                <li>Your will be reporting your <strong>{reportingManager} ({reportingPhone})</strong>.</li>
                <li>Reporting: <strong>Reporting time & location</strong> will be communicated by your Reporting Manager at the time of joining.</li>
              </ul>
            </div>
            <p style={{ margin: '4px 0 0 0' }}>
              We look forward to your joining the company and become a productive member of the team.<br />
              <strong>Welcome to {companyName},</strong>
            </p>
          </div>

          {/* Signatures Footer */}
          <div className="signature-block" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: 'auto',
            paddingTop: '20px',
            fontSize: '12px',
            color: '#1f2937'
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>Yours Sincerely,</div>
              <div style={{ fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', marginBottom: '24px' }}>for {companyName},</div>
              
              {/* Stamp Image if configured, fallback to Simulated Sign */}
              {user?.companyStampUrl ? (
                <div style={{ height: '56px', display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <img src={getFullAssetUrl(user.companyStampUrl)} alt="Stamp" style={{ maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                /* Ink Blue Sign Simulation */
                <div style={{
                  fontFamily: "'Brush Script MT', cursive, sans-serif",
                  fontSize: '24px',
                  color: '#1e3a8a',
                  height: '32px',
                  lineHeight: 1,
                  transform: 'rotate(-4deg) translateX(10px)',
                  marginBottom: '2px',
                  userSelect: 'none'
                }}>
                  {hrHeadName}
                </div>
              )}
              
              <div style={{ borderBottom: '1px solid #4b5563', width: '160px', marginBottom: '3px' }}></div>
              <div style={{ fontWeight: 800, fontSize: '11px' }}>{hrHeadName}</div>
              <div style={{ fontSize: '10px', color: '#4b5563' }}>{hrHeadDesignation}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ height: '56px' }}></div>
              
              {/* Candidate Ink Sign Simulation */}
              <div style={{
                fontFamily: "'Brush Script MT', cursive, sans-serif",
                fontSize: '24px',
                color: '#1e3a8a',
                height: '32px',
                lineHeight: 1,
                transform: 'rotate(-2deg) translateX(-10px)',
                marginBottom: '2px',
                userSelect: 'none'
              }}>
                {candidateName.split(' ')[0]}
              </div>

              <div style={{ borderBottom: '1px solid #4b5563', width: '160px', marginBottom: '3px', marginLeft: 'auto' }}></div>
              <div style={{ fontWeight: 800, fontSize: '11px' }}>Candidate Signature</div>
              <div style={{ fontSize: '10px', color: '#4b5563' }}>Date: {formatDateIN(joiningDate)}</div>
            </div>
          </div>
        </div>

        {/* Letter Footer Address - Rendered as flex child below content, ensuring zero overlap */}
        <div style={{
          textAlign: 'center',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '8px',
          fontSize: '9px',
          color: '#4b5563',
          lineHeight: 1.35,
          zIndex: 10,
          marginTop: '20px', // Small margin below the signatures
          paddingBottom: '50px' // Clear space for the absolute background accent triangles
        }}>
          <div style={{ fontSize: '13px', fontWeight: 900, color: '#b45309', fontFamily: "'Georgia', serif", letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '2px' }}>
            {companyName}
          </div>
          <div>
            Regd. Office: {companyRegAddress}
          </div>
          <div style={{ fontWeight: 600 }}>
            {user?.phone && `Ph: ${user.phone} | `}Email: {hrEmail}
          </div>
        </div>

      </div>
    </div>
  )
}

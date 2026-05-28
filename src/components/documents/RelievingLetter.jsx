import React, { useState } from 'react'
import { ArrowLeft, Printer } from 'lucide-react'
import { EMPLOYEES } from '../../data/hrmsData'
import { PrimaryBtn, OutlineBtn } from '../ui'
import { CompanyReleivingLetter } from '../../redux/actions/companyAction'
import { fetchProfile } from '../../redux/actions/authActions'
export default function RelievingLetter({ onBack }) {
  const [selectedId, setSelectedId] = useState(EMPLOYEES[0]?.id || '')
  
  // Customizer States
  const [candidateName, setCandidateName] = useState('RAJESH KUMAR')
  const [designation, setDesignation] = useState('Sr. Medical Officer')
  const [department, setDepartment] = useState('Medical Affairs')
  const [joinedDate, setJoinedDate] = useState('2021-03-15')
  const [relievingDate, setRelievingDate] = useState(() => new Date().toISOString().split('T')[0])
  const [reason, setReason] = useState('Career Progression')
  
  const [companyName, setCompanyName] = useState('NOEL PHARMA (INDIA) PRIVATE LIMITED')
  const [companyRegAddress, setCompanyRegAddress] = useState('Survey Nos: 1 to 40, Plot No. 109, Uppal Bhagagayath Revenue Village, Uppal-Mandal, Medchal-Malkajgiri, Hyderabad-500039')
  const [hrEmail, setHrEmail] = useState('mail-noelhr1975@gmail.com')
  const [hrHeadName, setHrHeadName] = useState('CH. MURTHY')
  const [hrHeadDesignation, setHrHeadDesignation] = useState('Head - HR')

  // Date Formatter to DD.MM.YYYY
  const formatDateIN = (dateStr) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`
    }
    return dateStr
  }

  // Load a pre-existing employee database record into states
  const handleLoadEmployee = (empId) => {
    setSelectedId(empId)
    const emp = EMPLOYEES.find(e => e.id === empId)
    if (emp) {
      setCandidateName(emp.name.toUpperCase())
      setDesignation(emp.designation)
      setDepartment(emp.dept)
      setJoinedDate(emp.joined || '2021-03-15')
    }
  }

  const handlePrint = () => {
    if (!relievingDate) {
      setRelievingDate(new Date().toISOString().split('T')[0])
    }
    window.print()
  }

  // Input styles
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
      {/* Control Panel (Screen-only) */}
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
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>Noel Relieving Certificate Customizer</h3>
          </div>
          
          {/* Quick Preload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', color: '#6b7280', fontWeight: 500 }}>Select Employee:</span>
            <select
              value={selectedId}
              onChange={e => handleLoadEmployee(e.target.value)}
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
              {EMPLOYEES.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          
          <div style={sectionHeaderStyle}>Employee Exit Details</div>
          <div>
            <label style={labelStyle}>Employee Name (uppercase)</label>
            <input type="text" value={candidateName} onChange={e => setCandidateName(e.target.value.toUpperCase())} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Employee ID</label>
            <input type="text" value={selectedId} onChange={e => setSelectedId(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Designation</label>
            <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Department</label>
            <input type="text" value={department} onChange={e => setDepartment(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Joined Date</label>
            <input type="date" value={joinedDate} onChange={e => setJoinedDate(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Relieving Date</label>
            <input type="date" value={relievingDate} onChange={e => setRelievingDate(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Reason for Leaving</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={inpStyle}
            >
              <option value="Career Progression">Career Progression</option>
              <option value="Personal Endeavors">Personal Endeavors</option>
              <option value="Higher Studies">Higher Studies</option>
              <option value="Relocation">Relocation</option>
            </select>
          </div>

          <div style={sectionHeaderStyle}>HR & Signatory Details</div>
          <div>
            <label style={labelStyle}>HR Signatory Name</label>
            <input type="text" value={hrHeadName} onChange={e => setHrHeadName(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>HR Signatory Designation</label>
            <input type="text" value={hrHeadDesignation} onChange={e => setHrHeadDesignation(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Contact Email</label>
            <input type="email" value={hrEmail} onChange={e => setHrEmail(e.target.value)} style={inpStyle} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Company Registered Entity</label>
            <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} style={inpStyle} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Company Registered Address</label>
            <input type="text" value={companyRegAddress} onChange={e => setCompanyRegAddress(e.target.value)} style={inpStyle} />
          </div>

        </div>

        {/* Action controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', background: '#f9fafb', borderRadius: '12px', padding: '12px 18px', border: '1px solid #f3f4f6' }}>
          <PrimaryBtn onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '13.5px' }}>
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
        padding: '45px 70px 0 70px',
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

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 10 }}>
          
          {/* Letterhead Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            {/* Logo & Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 15 C38 28, 16 38, 16 58 C16 78, 50 88, 50 88 C50 88, 84 78, 84 58 C84 38, 62 28, 50 15 Z" fill="#166534" />
                <path d="M50 19 C42 31, 25 40, 25 56 C25 71, 50 78, 50 78 C50 78, 75 71, 75 56 C75 40, 58 31, 50 19 Z" fill="#ffffff" />
                <path d="M50 19 L50 78" stroke="#166534" strokeWidth="3" />
                <path d="M50 36 C42 41, 38 48, 38 56" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M50 46 C58 51, 62 58, 62 66" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M50 28 C58 33, 62 40, 62 48" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M50 54 C42 59, 38 66, 38 74" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#166534', fontFamily: "'Georgia', serif", letterSpacing: '1.2px', lineHeight: 1.1 }}>
                  NOEL
                </div>
                <div style={{ fontSize: '10.5px', color: '#374151', fontWeight: 700, letterSpacing: '0.8px', marginTop: '1px' }}>
                  Since 1975
                </div>
              </div>
            </div>
            
            {/* Document Date */}
            <div style={{ paddingRight: '120px', marginTop: '16px', fontSize: '12.5px', color: '#1f2937', fontWeight: 600 }}>
              Date: {formatDateIN(relievingDate)}
            </div>
          </div>

          {/* Reference & Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '12.5px' }}>
            <div>
              <strong>Ref:</strong> GPHR/HR/REL/2026/{selectedId}
            </div>
          </div>

          <h3 style={{
            textAlign: 'center',
            textTransform: 'uppercase',
            fontSize: '15px',
            fontWeight: 800,
            color: '#111827',
            borderBottom: '1.5px solid #111827',
            paddingBottom: '4px',
            marginBottom: '24px',
            letterSpacing: '1px'
          }}>
            Relieving Order & Experience Certificate
          </h3>

          {/* Body Text */}
          <div style={{ fontSize: '12.5px', color: '#1f2937', textAlign: 'justify', display: 'flex', flexDirection: 'column', gap: '14px', textIndent: '40px', lineHeight: 1.6 }}>
            <p style={{ margin: 0 }}>
              This is to certify that Mr. <strong>{candidateName}</strong> (Employee ID: <strong>{selectedId}</strong>) was employed with M/s. <strong>{companyName}</strong> as <strong>{designation}</strong> in the <strong>{department}</strong> Department.
            </p>

            <p style={{ margin: 0 }}>
              Mr. <strong>{candidateName}</strong> joined the services of the Company on <strong>{formatDateIN(joinedDate)}</strong> and has been relieved from their duties with effect from the close of business hours on <strong>{formatDateIN(relievingDate)}</strong> following their resignation submitted due to <strong>{reason}</strong>.
            </p>

            <p style={{ margin: 0 }}>
              During their tenure of service with us, we found them to be extremely diligent, committed, and professional in carrying out their responsibilities. They have shown great clinical analytical precision and stellar teamwork in our pharmaceutical operations.
            </p>

            <p style={{ margin: 0 }}>
              We also confirm that they have successfully completed all handover processes, resolved any company asset clearances, and fulfilled all exit compliance guidelines. No outstanding dues remain between the Company and Mr. <strong>{candidateName}</strong>.
            </p>

            <p style={{ margin: 0 }}>
              We deeply appreciate their contributions to our pharmaceutical research and development goals and wish them the absolute best in all their future professional endeavors.
            </p>
          </div>

          {/* Signatures Row */}
          <div className="signature-block" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: 'auto',
            paddingTop: '20px',
            fontSize: '12.5px',
            color: '#1f2937'
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>Yours Sincerely,</div>
              <div style={{ fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', marginBottom: '24px' }}>for {companyName},</div>
              
              {/* HR Head Sign Simulation */}
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
                Ch. Murthy
              </div>

              <div style={{ borderBottom: '1px solid #4b5563', width: '160px', marginBottom: '3px' }}></div>
              <div style={{ fontWeight: 800, fontSize: '11px' }}>{hrHeadName}</div>
              <div style={{ fontSize: '10px', color: '#4b5563' }}>{hrHeadDesignation}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11.5px', color: '#6b7280', marginBottom: '40px' }}>Received Certificate Copy:</div>
              <div style={{ borderBottom: '1px solid #4b5563', width: '160px', marginBottom: '3px', marginLeft: 'auto' }}></div>
              <div style={{ fontWeight: 800, fontSize: '11px' }}>{candidateName}</div>
              <div style={{ fontSize: '10px', color: '#4b5563' }}>Date: {formatDateIN(relievingDate)}</div>
            </div>
          </div>

        </div>

        {/* Footer address info */}
        <div style={{
          textAlign: 'center',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '8px',
          fontSize: '9px',
          color: '#4b5563',
          lineHeight: 1.35,
          zIndex: 10,
          marginTop: '20px',
          paddingBottom: '50px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 900, color: '#b45309', fontFamily: "'Georgia', serif", letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '2px' }}>
            NOEL PHARMA (INDIA) PVT. LTD.
          </div>
          <div>
            Regd. Office: 24-85/7, Laxmi Narayana Nagar Colony, New IDA, Uppal, Hyderabad - 500 039 (T.S.), B.O: Mumbai - 400057.
          </div>
          <div style={{ fontWeight: 600 }}>
            Ph: 766 99 88 444 | Email: bipinnoel@gmail.com, hrnoelpharmapvtltd@gmail.com
          </div>
        </div>

      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { ArrowLeft, Printer, RefreshCw, Upload, X } from 'lucide-react'
import { EMPLOYEES } from '../../data/hrmsData'
import { Card, PrimaryBtn, OutlineBtn } from '../ui'

export default function OfferLetter({ onBack }) {
  // Prepopulated state defaults
  const initialEmp = EMPLOYEES[0] || {
    id: 'GH001',
    name: 'Rajesh Kumar',
    designation: 'Sr. Medical Officer',
    dept: 'Medical Affairs',
    location: 'Mumbai',
    email: 'rajesh.k@gmaxepayhr.in',
    phone: '9820012345',
    salary: 95000
  }

  // Candidate State
  const [candidateName, setCandidateName] = useState(initialEmp.name)
  const [designation, setDesignation] = useState(initialEmp.designation)
  const [department, setDepartment] = useState(initialEmp.dept)
  const [location, setLocation] = useState(initialEmp.location)
  const [email, setEmail] = useState(initialEmp.email)
  const [phone, setPhone] = useState(initialEmp.phone)

  // Company Branding & Logo State
  const [companyName, setCompanyName] = useState('GmaxepayHR Pharma Ltd.')
  const [companyTagline, setCompanyTagline] = useState('Advanced Therapeutics & Biotech Research Labs')
  const [companyAddress, setCompanyAddress] = useState('Plot 42, Biotech Enclave, BKC, Mumbai, Maharashtra 400051')
  const [companyLogo, setCompanyLogo] = useState(null) // Base64 uploaded image URL
  const [companyEmoji, setCompanyEmoji] = useState('🔬') // Default fallback emoji

  // Salary Component State (Direct Monthly Editing)
  const initialSalary = initialEmp.salary
  const [basic, setBasic] = useState(Math.round(initialSalary * 0.5))
  const [hra, setHra] = useState(Math.round(initialSalary * 0.2))
  const [allowances, setAllowances] = useState(Math.round(initialSalary * 0.18))
  const [pf, setPf] = useState(Math.round(initialSalary * 0.12))

  // Calculated CTC Sum
  const monthlyCtc = Number(basic) + Number(hra) + Number(allowances) + Number(pf)

  // Today's Date dynamically
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Load a pre-existing employee into the states
  const handleLoadEmployee = (empId) => {
    const emp = EMPLOYEES.find(e => e.id === empId)
    if (emp) {
      setCandidateName(emp.name)
      setDesignation(emp.designation)
      setDepartment(emp.dept)
      setLocation(emp.location)
      setEmail(emp.email)
      setPhone(emp.phone)
      
      const sal = emp.salary
      setBasic(Math.round(sal * 0.5))
      setHra(Math.round(sal * 0.2))
      setAllowances(Math.round(sal * 0.18))
      setPf(Math.round(sal * 0.12))
    }
  }

  // Handle Logo image file reading
  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCompanyLogo(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Input styling
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
    fontSize: '11.5px',
    fontWeight: 700,
    color: '#4b5563',
    marginBottom: '5px',
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
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>Offer Letter Customizer</h3>
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

        {/* Input Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          
          {/* Candidate Bio */}
          <div>
            <label style={labelStyle}>Candidate Name</label>
            <input type="text" value={candidateName} onChange={e => setCandidateName(e.target.value)} style={inpStyle} placeholder="Full Name" />
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
            <label style={labelStyle}>Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} style={inpStyle} placeholder="City, Country" />
          </div>

          {/* Contact Details */}
          <div>
            <label style={labelStyle}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={inpStyle} />
          </div>

          {/* Company details */}
          <div>
            <label style={labelStyle}>Company Name</label>
            <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Company Tagline</label>
            <input type="text" value={companyTagline} onChange={e => setCompanyTagline(e.target.value)} style={inpStyle} />
          </div>

        </div>

        {/* Interactive Logo & Icon Editor Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px'
        }}>
          {/* Logo Uploader */}
          <div>
            <label style={labelStyle}>📤 Upload Custom Logo Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
              <OutlineBtn style={{ padding: '8px 14px', fontSize: '12px', position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Upload size={14} /> Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              </OutlineBtn>
              
              {companyLogo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={companyLogo} alt="Preview" style={{ height: '36px', width: 'auto', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fff' }} />
                  <button
                    onClick={() => setCompanyLogo(null)}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '6px' }}>Supports PNG, JPG, or SVG. Uploaded logo overrides fallback icon.</span>
          </div>

          {/* Emoji/Icon Selector */}
          <div>
            <label style={labelStyle}>🎭 Or Select Fallback Brand Icon</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              {['🔬', '🏢', '🏥', '🧬', '💊', '💻', '📈', '🏦'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    setCompanyEmoji(emoji)
                    setCompanyLogo(null) // remove base64 logo if they explicitly click an emoji
                  }}
                  style={{
                    width: '36px',
                    height: '36px',
                    fontSize: '20px',
                    background: companyEmoji === emoji && !companyLogo ? '#c8f04a' : '#fff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {emoji}
                </button>
              ))}
              <input
                type="text"
                value={companyEmoji}
                onChange={e => {
                  setCompanyEmoji(e.target.value)
                  setCompanyLogo(null)
                }}
                maxLength={2}
                style={{
                  width: '44px',
                  height: '36px',
                  textAlign: 'center',
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
                placeholder="Custom"
              />
            </div>
          </div>
        </div>

        {/* Address and Salary Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', borderTop: '1px dashed #f3f4f6', paddingTop: '16px', marginBottom: '20px' }}>
          
          {/* Company address */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Registered Office Address</label>
            <input type="text" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} style={inpStyle} />
          </div>

          {/* Salary Components */}
          <div>
            <label style={labelStyle}>Basic Salary (Monthly ₹)</label>
            <input type="number" value={basic} onChange={e => setBasic(e.target.value)} style={{ ...inpStyle, borderColor: '#10b981' }} />
          </div>
          <div>
            <label style={labelStyle}>Employer PF (Monthly ₹)</label>
            <input type="number" value={pf} onChange={e => setPf(e.target.value)} style={{ ...inpStyle, borderColor: '#3b82f6' }} />
          </div>
          <div>
            <label style={labelStyle}>HRA (Monthly ₹)</label>
            <input type="number" value={hra} onChange={e => setHra(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Other Allowances (Monthly ₹)</label>
            <input type="number" value={allowances} onChange={e => setAllowances(e.target.value)} style={inpStyle} />
          </div>

        </div>

        {/* Action controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', borderRadius: '12px', padding: '12px 18px', border: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
            Calculated Total Monthly CTC: <strong style={{ color: '#10b981', fontSize: '15px' }}>₹{monthlyCtc.toLocaleString('en-IN')}</strong> 
            <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: '8px' }}>({(monthlyCtc * 12).toLocaleString('en-IN')} Annual)</span>
          </div>
          <PrimaryBtn onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', fontSize: '13.5px' }}>
            <Printer size={16} /> Print / Export PDF
          </PrimaryBtn>
        </div>

      </div>

      {/* Document Sheet View */}
      <div className="printable-sheet" style={{
        background: '#fff',
        margin: '0 auto',
        maxWidth: '800px',
        padding: '64px 80px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontFamily: "'Courier New', Courier, monospace, 'Inter', sans-serif",
        color: '#1f2937',
        lineHeight: 1.6,
        position: 'relative'
      }}>
        {/* Decorative Letterhead Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px double #10b981',
          paddingBottom: '20px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {companyLogo ? (
              <img
                src={companyLogo}
                alt="Logo"
                style={{
                  height: '52px',
                  width: 'auto',
                  maxWidth: '120px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            ) : (
              <span style={{ fontSize: '36px', lineHeight: 1 }}>{companyEmoji}</span>
            )}
            
            <div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#065f46', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {companyName}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {companyTagline}
              </div>
              <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>
                {companyAddress}
              </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#6b7280' }}>
            <div>Web: www.gmaxepayhr.in</div>
            <div>Tel: +91 22 8876 5432</div>
            <div>CIN: L24239MH2021PLC356789</div>
          </div>
        </div>

        {/* Document Title & Reference */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '13px' }}>
          <div>
            <strong>Ref:</strong> GPHR/HR/OFFER/2026/CUSTOM
          </div>
          <div>
            <strong>Date:</strong> {currentDate}
          </div>
        </div>

        <div style={{ marginBottom: '24px', fontSize: '14px' }}>
          <strong>To,</strong><br />
          <span style={{ fontSize: '15px', fontWeight: 700 }}>{candidateName}</span><br />
          {location}<br />
          Email: {email}<br />
          Phone: +91 {phone}
        </div>

        <h3 style={{
          textAlign: 'center',
          textTransform: 'uppercase',
          fontSize: '16px',
          fontWeight: 800,
          color: '#111827',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '8px',
          marginBottom: '24px',
          letterSpacing: '0.5px'
        }}>
          Subject: Offer of Appointment as {designation}
        </h3>

        <div style={{ fontSize: '13.5px', marginBottom: '20px', textAlign: 'justify' }}>
          Dear <strong>{candidateName}</strong>,
        </div>

        <div style={{ fontSize: '13.5px', marginBottom: '20px', textAlign: 'justify' }}>
          Following your interviews and subsequent discussions with our panel, we are delighted to offer you the position of <strong>{designation}</strong> in the <strong>{department}</strong> Department with <strong>{companyName}</strong>. Your join date is scheduled for <strong>June 15, 2026</strong>.
        </div>

        <div style={{ fontSize: '13.5px', marginBottom: '20px', textAlign: 'justify' }}>
          Your Cost to Company (CTC) will be <strong>₹{(monthlyCtc * 12).toLocaleString('en-IN')}</strong> per annum. The detailed break-up of your monthly package components is structured as follows:
        </div>

        {/* Salary Component Grid */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12.5px',
          marginBottom: '28px',
          border: '1px solid #d1d5db'
        }}>
          <thead>
            <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #d1d5db' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', borderRight: '1px solid #d1d5db' }}>Salary Component</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', borderRight: '1px solid #d1d5db' }}>Monthly (₹)</th>
              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Annualized (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px 12px', borderRight: '1px solid #d1d5db' }}>Basic Salary (Customized)</td>
              <td style={{ padding: '8px 12px', textAlign: 'right', borderRight: '1px solid #d1d5db' }}>{Number(basic).toLocaleString('en-IN')}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right' }}>{(Number(basic) * 12).toLocaleString('en-IN')}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px 12px', borderRight: '1px solid #d1d5db' }}>House Rent Allowance (HRA)</td>
              <td style={{ padding: '8px 12px', textAlign: 'right', borderRight: '1px solid #d1d5db' }}>{Number(hra).toLocaleString('en-IN')}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right' }}>{(Number(hra) * 12).toLocaleString('en-IN')}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px 12px', borderRight: '1px solid #d1d5db' }}>Special / Research Allowances</td>
              <td style={{ padding: '8px 12px', textAlign: 'right', borderRight: '1px solid #d1d5db' }}>{Number(allowances).toLocaleString('en-IN')}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right' }}>{(Number(allowances) * 12).toLocaleString('en-IN')}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #d1d5db' }}>
              <td style={{ padding: '8px 12px', borderRight: '1px solid #d1d5db' }}>Employer Provident Fund (PF contribution)</td>
              <td style={{ padding: '8px 12px', textAlign: 'right', borderRight: '1px solid #d1d5db' }}>{Number(pf).toLocaleString('en-IN')}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right' }}>{(Number(pf) * 12).toLocaleString('en-IN')}</td>
            </tr>
            <tr style={{ background: '#f9fafb', fontWeight: 'bold' }}>
              <td style={{ padding: '8px 12px', borderRight: '1px solid #d1d5db' }}>Total Cost to Company (CTC)</td>
              <td style={{ padding: '8px 12px', textAlign: 'right', borderRight: '1px solid #d1d5db', color: '#065f46' }}>{monthlyCtc.toLocaleString('en-IN')}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right', color: '#065f46' }}>{(monthlyCtc * 12).toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        {/* Dynamic Terms */}
        <div style={{ fontSize: '13px', marginBottom: '32px' }}>
          <strong style={{ fontSize: '14px', color: '#111827', display: 'block', marginBottom: '6px' }}>Terms & Scope of Appointment:</strong>
          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Probationary Phase:</strong> You will be on probation for a period of 6 months. Upon successful assessment of metrics, your employment status will be confirmed.</li>
            <li><strong>Confidentiality Agreement:</strong> As part of scientific development, you are bound to absolute records privacy and research secrecy guidelines.</li>
            <li><strong>Notice Obligation:</strong> Under standard operating processes, a notice duration of 60 days is required on either side to conclude this agreement.</li>
          </ul>
        </div>

        {/* Signature blocks */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginTop: '48px',
          borderTop: '1px dashed #d1d5db',
          paddingTop: '24px'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '40px' }}>Accepted & Acknowledged:</div>
            <div style={{ borderBottom: '1px solid #9ca3af', width: '200px', marginBottom: '4px' }}></div>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>{candidateName}</div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Date: ____ / ____ / ________</div>
          </div>

          <div style={{ textAlign: 'right', position: 'relative' }}>
            {/* Stamp Simulation */}
            <div style={{
              position: 'absolute',
              top: '-55px',
              right: '20px',
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              border: '3px double rgba(16, 185, 129, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              color: 'rgba(16, 185, 129, 0.6)',
              fontWeight: 800,
              transform: 'rotate(-12deg)',
              pointerEvents: 'none',
              letterSpacing: '0.2px',
              lineHeight: 1.1
            }}>
              <span>GMAXEPAYHR</span>
              <span>PHARMA</span>
              <span style={{ fontSize: '7px', borderTop: '1px solid rgba(16,185,129,0.3)', marginTop: '2px', paddingTop: '2px' }}>SEAL</span>
            </div>

            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>For <strong>{companyName}</strong></div>
            <div style={{
              fontFamily: "'Brush Script MT', cursive, sans-serif",
              fontSize: '24px',
              color: '#065f46',
              height: '30px',
              lineHeight: 1,
              transform: 'rotate(-4deg)',
              marginBottom: '4px',
              userSelect: 'none'
            }}>
              Kavitha Nair
            </div>
            <div style={{ borderBottom: '1px solid #9ca3af', width: '200px', marginBottom: '4px', marginLeft: 'auto' }}></div>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>Kavitha Nair</div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Director of Human Resources</div>
          </div>
        </div>
      </div>

      {/* Print CSS styling embedded natively */}
      <style>{`
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .document-container {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}

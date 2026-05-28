import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import html2pdf from 'html2pdf.js'
import { ArrowLeft, Printer, RefreshCw, CheckCircle2, X, Mail, FileText, ExternalLink } from 'lucide-react'
import { PrimaryBtn, OutlineBtn } from '../ui'
import { fetchProfile } from '../../redux/actions/authActions'
import { CompanyReleivingLetter } from '../../redux/actions/companyAction'
import { getMyTeam } from '../../redux/actions/teamActions'
// Helper to resolve backend relative file upload paths to absolute URLs
// On localhost (dev) -> use the live API server URL
// On production (deployed) -> use the app's own origin
const getFullAssetUrl = (relativeUrl) => {
  if (!relativeUrl) return "";
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://") || relativeUrl.startsWith("data:")) {
    return relativeUrl;
  }
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const base = isLocalhost ? 'https://api-mr-software.gmaxepay.in' : window.location.origin;
  return `${base}${relativeUrl}`;
};

export default function RelievingLetter({ onBack }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { team: employees = [] } = useSelector((state) => state.team)

  // Fetch admin profile and team on mount
  useEffect(() => {
    dispatch(fetchProfile())
    dispatch(getMyTeam())
  }, [dispatch])

  const [selectedId, setSelectedId] = useState('')

  // Set first employee as default once team loads
  useEffect(() => {
    if (employees.length > 0 && !selectedId) {
      setSelectedId(employees[0]?.employeeId || '')
    }
  }, [employees])

  // Employee exit fields
  const [candidateName, setCandidateName] = useState('RAJESH KUMAR')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [designation, setDesignation] = useState('Sr. Medical Officer')
  const [department, setDepartment] = useState('Medical Affairs')
  const [joinedDate, setJoinedDate] = useState('2021-03-15')
  const [relievingDate, setRelievingDate] = useState(() => new Date().toISOString().split('T')[0])
  const [reason, setReason] = useState('Career Progression')

  // HR Signatory (editable)
  const [hrHeadName, setHrHeadName] = useState('CH. MURTHY')
  const [hrHeadDesignation, setHrHeadDesignation] = useState('Head - HR')

  // Company details — bound from API profile (read-only display)
  const [companyName, setCompanyName] = useState('NOEL PHARMA (INDIA) PRIVATE LIMITED')
  const [companyRegAddress, setCompanyRegAddress] = useState('')
  const [hrEmail, setHrEmail] = useState('')

  // Modal / generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState({ emailSentTo: '', previewUrl: '', status: '' })
  const [modalError, setModalError] = useState('')

  // Ref to the printable document
  const printableRef = useRef(null)

  // Sync company data from Redux when profile loads
  useEffect(() => {
    if (user) {
      if (user.fullName) setCompanyName(user.fullName.toUpperCase())
      if (user.address) setCompanyRegAddress(user.address)
      if (user.email) setHrEmail(user.email)
    }
  }, [user])

  // Date Formatter to DD.MM.YYYY
  const formatDateIN = (dateStr) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`
    return dateStr
  }

  // Load employee record into form
  const handleLoadEmployee = (empId) => {
    setSelectedId(empId)
    const emp = employees.find(e => (e.employeeId || e.id) === empId)
    if (emp) {
      setCandidateName((emp.fullName || emp.name || '').toUpperCase())
      setDesignation(emp.designation || '')
      setDepartment(emp.department || emp.dept || '')
      setJoinedDate(emp.joiningDate || emp.joined || '2021-03-15')
      setCandidateEmail(emp.email || '')
    }
  }

  const handlePrint = () => {
    if (!relievingDate) setRelievingDate(new Date().toISOString().split('T')[0])
    window.print()
  }

  const handleGenerate = async () => {
    if (!candidateEmail || !candidateEmail.includes('@')) {
      setModalError('Please enter a valid candidate email address before generating.')
      setShowModal(true)
      return
    }

    setIsGenerating(true)
    setModalError('')

    try {
      const sheetElement = printableRef.current
      if (!sheetElement) throw new Error('Document preview not ready. Please try again.')

      const fileName = `relieving_letter_${candidateName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.pdf`

      // Configure html2pdf options
      const opt = {
        margin: [0, 0, 0, 0],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          letterRendering: true,
          onclone: (clonedDoc) => {
            const elements = clonedDoc.getElementsByTagName('*');
            
            const oklchToRgb = (l, c, h, a = 1) => {
              const hRad = (h * Math.PI) / 180;
              const L = l;
              const a_ = c * Math.cos(hRad);
              const b_ = c * Math.sin(hRad);
              const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_;
              const m_ = L - 0.1055613458 * a_ - 0.0638541728 * b_;
              const s_ = L - 0.0894841775 * a_ - 1.2914855480 * b_;
              const l3 = l_ * l_ * l_;
              const m3 = m_ * m_ * m_;
              const s3 = s_ * s_ * s_;
              const r_raw = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699294 * s3;
              const g_raw = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
              const b_raw = -0.0041960863 * l3 - 0.7034186145 * m3 + 1.7076147010 * s3;
              const f = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
              const r = Math.max(0, Math.min(255, Math.round(f(r_raw) * 255)));
              const g = Math.max(0, Math.min(255, Math.round(f(g_raw) * 255)));
              const b = Math.max(0, Math.min(255, Math.round(f(b_raw) * 255)));
              return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
            };

            const oklabToRgb = (l, a_, b_, a = 1) => {
              const L = l;
              const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_;
              const m_ = L - 0.1055613458 * a_ - 0.0638541728 * b_;
              const s_ = L - 0.0894841775 * a_ - 1.2914855480 * b_;
              const l3 = l_ * l_ * l_;
              const m3 = m_ * m_ * m_;
              const s3 = s_ * s_ * s_;
              const r_raw = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699294 * s3;
              const g_raw = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
              const b_raw = -0.0041960863 * l3 - 0.7034186145 * m3 + 1.7076147010 * s3;
              const f = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
              const r = Math.max(0, Math.min(255, Math.round(f(r_raw) * 255)));
              const g = Math.max(0, Math.min(255, Math.round(f(g_raw) * 255)));
              const b = Math.max(0, Math.min(255, Math.round(f(b_raw) * 255)));
              return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
            };

            const resolveModernColors = (colorStr) => {
              if (!colorStr || typeof colorStr !== 'string') return colorStr;
              let resolved = colorStr;
              
              if (resolved.includes('oklch')) {
                try {
                  resolved = resolved.replace(/oklch\(([^)]+)\)/g, (match, p1) => {
                    const parts = p1.trim().split(/[\s/]+/);
                    if (parts.length >= 3) {
                      let l = parseFloat(parts[0]);
                      if (parts[0].includes('%')) l /= 100;
                      const c = parseFloat(parts[1]);
                      const h = parseFloat(parts[2]);
                      let a = 1;
                      if (parts[3]) {
                        a = parseFloat(parts[3]);
                        if (parts[3].includes('%')) a /= 100;
                      }
                      if (!isNaN(l) && !isNaN(c) && !isNaN(h)) {
                        return oklchToRgb(l, c, h, a);
                      }
                    }
                    return match;
                  });
                } catch (e) {}
              }

              if (resolved.includes('oklab')) {
                try {
                  resolved = resolved.replace(/oklab\(([^)]+)\)/g, (match, p1) => {
                    const parts = p1.trim().split(/[\s/]+/);
                    if (parts.length >= 3) {
                      let l = parseFloat(parts[0]);
                      if (parts[0].includes('%')) l /= 100;
                      const a_coord = parseFloat(parts[1]);
                      const b_coord = parseFloat(parts[2]);
                      let a = 1;
                      if (parts[3]) {
                        a = parseFloat(parts[3]);
                        if (parts[3].includes('%')) a /= 100;
                      }
                      if (!isNaN(l) && !isNaN(a_coord) && !isNaN(b_coord)) {
                        return oklabToRgb(l, a_coord, b_coord, a);
                      }
                    }
                    return match;
                  });
                } catch (e) {}
              }

              return resolved;
            };

            const properties = [
              'color', 'backgroundColor', 'borderColor', 
              'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 
              'fill', 'stroke', 'backgroundImage', 'boxShadow'
            ];

            for (let i = 0; i < elements.length; i++) {
              const el = elements[i];
              const computed = clonedDoc.defaultView ? clonedDoc.defaultView.getComputedStyle(el) : window.getComputedStyle(el);
              
              properties.forEach(prop => {
                const val = computed[prop];
                if (val && typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                  try {
                    el.style[prop] = resolveModernColors(val);
                  } catch (err) {}
                }
              });
            }

            // Force single page A4 layout constraints
            const sheet = clonedDoc.querySelector('.printable-sheet');
            if (sheet) {
              sheet.style.width = '210mm';
              sheet.style.height = '295mm';
              sheet.style.minHeight = '295mm';
              sheet.style.maxHeight = '295mm';
              sheet.style.paddingLeft = '50px';
              sheet.style.paddingRight = '50px';
              sheet.style.paddingTop = '16px';
              sheet.style.paddingBottom = '16px';
              sheet.style.boxSizing = 'border-box';
              sheet.style.borderRadius = '0px';
              sheet.style.border = 'none';
              sheet.style.boxShadow = 'none';
              sheet.style.overflow = 'hidden';

              // Compact internal spacing
              const bodyDiv = sheet.querySelector('.letter-body-content');
              if (bodyDiv) {
                bodyDiv.style.gap = '8px';
                bodyDiv.style.lineHeight = '1.35';
                bodyDiv.style.fontSize = '11px';
              }
              const signatureBlock = sheet.querySelector('.signature-block');
              if (signatureBlock) {
                signatureBlock.style.marginTop = '10px';
                signatureBlock.style.paddingTop = '10px';
              }
            }
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Generate PDF as a blob
      const pdfBlob = await html2pdf().set(opt).from(sheetElement).output('blob');

      const formData = new FormData()
      formData.append('email', candidateEmail)
      formData.append('file', pdfBlob, fileName)

      const res = await dispatch(CompanyReleivingLetter(selectedId, formData))

      if (res && res.data) {
        setModalData({
          emailSentTo: res.data.emailSentTo || candidateEmail,
          previewUrl: res.data.previewUrl || '',
          status: res.data.status || 'SENT'
        })
        setModalError('')
        setShowModal(true)
      } else {
        setModalError(res?.message || 'Failed to generate relieving letter. Backend did not return expected data.')
        setShowModal(true)
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'An unexpected error occurred.')
      setShowModal(true)
    } finally {
      setIsGenerating(false)
    }
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
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>Relieving Certificate Customizer</h3>
          </div>

          {/* Quick Preload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', color: '#6b7280', fontWeight: 500 }}>Load Employee:</span>
            <select
              onChange={e => handleLoadEmployee(e.target.value)}
              value={selectedId}
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
              <option value="" disabled>Select Employee…</option>
              {employees.map(emp => (
                <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                  {emp.fullName || emp.name} ({emp.designation || 'Employee'})
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
            <label style={labelStyle}>Candidate Email</label>
            <input type="email" value={candidateEmail} onChange={e => setCandidateEmail(e.target.value)} style={inpStyle} placeholder="employee@example.com" />
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
            <select value={reason} onChange={e => setReason(e.target.value)} style={inpStyle}>
              <option value="Career Progression">Career Progression</option>
              <option value="Personal Endeavors">Personal Endeavors</option>
              <option value="Higher Studies">Higher Studies</option>
              <option value="Relocation">Relocation</option>
            </select>
          </div>

          <div style={sectionHeaderStyle}>HR Signatory Details</div>
          <div>
            <label style={labelStyle}>HR Signatory Name</label>
            <input type="text" value={hrHeadName} onChange={e => setHrHeadName(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>HR Signatory Designation</label>
            <input type="text" value={hrHeadDesignation} onChange={e => setHrHeadDesignation(e.target.value)} style={inpStyle} />
          </div>

          {/* Read-only Company Info from API */}
          <div style={sectionHeaderStyle}>Company Info (from Profile)</div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Company Name</label>
            <div style={{ ...inpStyle, background: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }}>{companyName || '—'}</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Registered Address</label>
            <div style={{ ...inpStyle, background: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed', whiteSpace: 'pre-wrap' }}>{companyRegAddress || '—'}</div>
          </div>
          <div>
            <label style={labelStyle}>HR / Contact Email</label>
            <div style={{ ...inpStyle, background: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }}>{hrEmail || '—'}</div>
          </div>
        </div>

        {/* Action controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb', borderRadius: '12px', padding: '12px 18px', border: '1px solid #f3f4f6' }}>
          <OutlineBtn onClick={handleGenerate} disabled={isGenerating} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', fontSize: '13.5px' }}>
            <RefreshCw size={16} className={isGenerating ? "animate-spin" : ""} />
            {isGenerating ? "Generating..." : "Generate & Send Letter"}
          </OutlineBtn>
          <PrimaryBtn onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '13.5px' }}>
            <Printer size={16} /> Print / Export PDF
          </PrimaryBtn>
        </div>
      </div>

      {/* Success / Error Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            position: 'relative',
            fontFamily: "'Inter', sans-serif"
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '6px' }}
            >
              <X size={18} />
            </button>

            {modalError ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={24} color="#ef4444" />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', margin: 0 }}>Generation Failed</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{modalError}</p>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ marginTop: '8px', padding: '10px 24px', background: '#111827', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '24px', textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={28} color="#059669" />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>Relieving Letter Dispatched!</h3>
                  <p style={{ fontSize: '12.5px', color: '#6b7280', margin: 0 }}>The certificate has been emailed successfully to the employee.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Mail size={16} color="#3b82f6" />
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px 0' }}>Email Sent To</p>
                      <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827', margin: 0 }}>{modalData.emailSentTo}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle2 size={16} color="#059669" />
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px 0' }}>Delivery Status</p>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669', background: '#d1fae5', padding: '2px 10px', borderRadius: '999px', border: '1px solid #a7f3d0' }}>
                        {modalData.status}
                      </span>
                    </div>
                  </div>

                  {modalData.previewUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={16} color="#d97706" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px 0' }}>Preview URL</p>
                        <a
                          href={getFullAssetUrl(modalData.previewUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '12.5px', fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          Open Document <ExternalLink size={12} style={{ flexShrink: 0 }} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  style={{ width: '100%', padding: '12px', background: '#111827', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Live Document Sheet View */}
      <div ref={printableRef} className="printable-sheet" style={{
        background: '#fff',
        margin: '0 auto',
        maxWidth: '800px',
        minHeight: '297mm',
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
          position: 'absolute', top: 0, right: 0, width: '280px', height: '80px',
          background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
          clipPath: 'polygon(100% 0, 0 0, 100% 100%)', zIndex: 2
        }} />
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '295px', height: '86px',
          background: '#d97706', clipPath: 'polygon(100% 0, 0 0, 100% 100%)', zIndex: 1
        }} />

        {/* Bottom Decorative Slanted Accents */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px',
          background: 'linear-gradient(90deg, #15803d 0%, #166534 100%)',
          clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 45%)', zIndex: 2
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '47px',
          background: '#d97706', clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 35%)', zIndex: 1
        }} />

        {/* Main Content Area */}
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
            Relieving Order &amp; Experience Certificate
          </h3>

          {/* Body Text */}
          <div className="letter-body-content" style={{ fontSize: '12.5px', color: '#1f2937', textAlign: 'justify', display: 'flex', flexDirection: 'column', gap: '14px', textIndent: '40px', lineHeight: 1.6 }}>
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

              {/* Stamp or Simulated Signature */}
              {user?.companyStampUrl ? (
                <div style={{ height: '56px', display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <img src={getFullAssetUrl(user.companyStampUrl)} alt="Stamp" style={{ maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
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
              <div style={{ fontSize: '11.5px', color: '#6b7280', marginBottom: '40px' }}>Received Certificate Copy:</div>
              <div style={{ borderBottom: '1px solid #4b5563', width: '160px', marginBottom: '3px', marginLeft: 'auto' }}></div>
              <div style={{ fontWeight: 800, fontSize: '11px' }}>Candidate Signature</div>
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
            {companyName}
          </div>
          {companyRegAddress && <div>{companyRegAddress}</div>}
          {hrEmail && <div style={{ fontWeight: 600 }}>Email: {hrEmail} {user?.phone ? `| Ph: ${user.phone}` : ''}</div>}
        </div>

      </div>
    </div>
  )
}

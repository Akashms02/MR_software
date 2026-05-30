import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import html2pdf from 'html2pdf.js'
import { ArrowLeft, Printer, RefreshCw, CheckCircle2, X, Mail, FileText, ExternalLink } from 'lucide-react'
import { PrimaryBtn, OutlineBtn } from '../ui'
import { fetchProfile } from '../../redux/actions/authActions'
import { CompanyReleivingLetter } from '../../redux/actions/companyAction'
import { getMyTeam } from '../../redux/actions/teamActions'
import { getFullAssetUrl, inlineDocumentImages, useCompanyBrandAssets } from '../../utils/getFullAssetUrl'

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
        const parts = p1.trim().split(/[\s/,]+/);
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
        const parts = p1.trim().split(/[\s/,]+/);
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

export default function RelievingLetter({ onBack }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { team: employees = [] } = useSelector((state) => state.team)
  const { logoSrc, stampSrc } = useCompanyBrandAssets(user)

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

    let originalWindowGetComputedStyle = null;

    try {
      // Temporarily override the main window's getComputedStyle to resolve OKLCH/OKLAB colors dynamically
      originalWindowGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = function (el, pseudoEl) {
        const style = originalWindowGetComputedStyle.call(window, el, pseudoEl);
        return new Proxy(style, {
          get(target, prop) {
            if (prop === 'getPropertyValue') {
              return function(key) {
                const val = target.getPropertyValue(key);
                if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                  try {
                    return resolveModernColors(val);
                  } catch (e) {
                    return val;
                  }
                }
                return val;
              };
            }
            const val = target[prop];
            if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
              try {
                return resolveModernColors(val);
              } catch (e) {
                return val;
              }
            }
            if (typeof val === 'function') {
              return val.bind(target);
            }
            return val;
          }
        });
      };

      const sheetElement = printableRef.current
      if (!sheetElement) throw new Error('Document preview not ready. Please try again.')

      const fileName = `relieving_letter_${candidateName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.pdf`

      await document.fonts.ready
      await inlineDocumentImages(sheetElement)
      await new Promise((resolve) => setTimeout(resolve, 100))

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
                    const parts = p1.trim().split(/[\s/,]+/);
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
                    const parts = p1.trim().split(/[\s/,]+/);
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

            // Override getComputedStyle inside the iframe to dynamically convert all OKLCH/OKLAB colors on the fly!
            if (clonedDoc.defaultView) {
              const originalGetComputedStyle = clonedDoc.defaultView.getComputedStyle;
              clonedDoc.defaultView.getComputedStyle = function (el, pseudoEl) {
                const style = originalGetComputedStyle.call(clonedDoc.defaultView, el, pseudoEl);
                return new Proxy(style, {
                  get(target, prop) {
                    if (prop === 'getPropertyValue') {
                      return function(key) {
                        const val = target.getPropertyValue(key);
                        if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                          try {
                            return resolveModernColors(val);
                          } catch (e) {
                            return val;
                          }
                        }
                        return val;
                      };
                    }
                    const val = target[prop];
                    if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                      try {
                        return resolveModernColors(val);
                      } catch (e) {
                        return val;
                      }
                    }
                    if (typeof val === 'function') {
                      return val.bind(target);
                    }
                    return val;
                  }
                });
              };
            }

            // Preprocess stylesheets inside the iframe to replace oklch references with fallback rgb
            clonedDoc.querySelectorAll('style').forEach(styleTag => {
              if (styleTag.textContent) {
                styleTag.textContent = resolveModernColors(styleTag.textContent);
              }
            });

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
              sheet.style.height = '296mm';
              sheet.style.minHeight = '296mm';
              sheet.style.maxHeight = '296mm';
              sheet.style.paddingLeft = '50px';
              sheet.style.paddingRight = '50px';
              sheet.style.paddingTop = '16px';
              sheet.style.paddingBottom = '16px';
              sheet.style.boxSizing = 'border-box';
              sheet.style.borderRadius = '0px';
              sheet.style.border = 'none';
              sheet.style.boxShadow = 'none';
              sheet.style.overflow = 'hidden';

              // Force A4 layout width for bottom SVGs/images to fix the html2canvas width="100%" bug
              const svgOrImgs = sheet.querySelectorAll('svg, img');
              svgOrImgs.forEach((el) => {
                const widthAttr = el.getAttribute('width');
                const srcAttr = el.getAttribute('src') || '';
                if (widthAttr === '100%' || el.style.width === '100%' || srcAttr.startsWith('data:image/svg+xml')) {
                  if (el.style.width === '100%' || widthAttr === '100%') {
                    el.setAttribute('width', '794');
                    el.style.width = '794px';
                  }
                }
              });

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

      if (res?.data) {
        setModalData({
          emailSentTo: res.data.emailSentTo || candidateEmail,
          previewUrl: res.data.previewUrl || res.data.releivingLetterPDF || '',
          status: res.data.status || 'SENT'
        })
        setModalError('')
        setShowModal(true)
      } else {
        setModalError(res?.message || 'Failed to generate relieving letter. Please try again.')
        setShowModal(true)
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'An unexpected error occurred.')
      setShowModal(true)
    } finally {
      if (originalWindowGetComputedStyle) {
        window.getComputedStyle = originalWindowGetComputedStyle;
      }
      setIsGenerating(false)
    }
  }

  const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
  const readonlyCls = "w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-500 cursor-not-allowed"
  const labelCls = "mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500"
  const sectionHeaderCls = "col-span-full mt-4 mb-2 border-b border-gray-100 pb-1 text-xs font-black uppercase tracking-wider text-teal-700"

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      {/* Control Panel (Screen-only) */}
      <div className="no-print mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Navigation & Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <OutlineBtn onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-sm">
              <ArrowLeft size={16} /> Back to Hub
            </OutlineBtn>
            <h3 className="text-base font-extrabold text-gray-900">Relieving Certificate Customizer</h3>
          </div>

          {/* Quick Preload */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">Load Employee:</span>
            <select
              onChange={e => handleLoadEmployee(e.target.value)}
              value={selectedId}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
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
        <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

          <div className={sectionHeaderCls}>Employee Exit Details</div>
          <div>
            <label className={labelCls}>Employee Name (uppercase)</label>
            <input type="text" value={candidateName} onChange={e => setCandidateName(e.target.value.toUpperCase())} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Employee ID</label>
            <input type="text" value={selectedId} onChange={e => setSelectedId(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Candidate Email</label>
            <input type="email" value={candidateEmail} onChange={e => setCandidateEmail(e.target.value)} className={inputCls} placeholder="employee@example.com" />
          </div>
          <div>
            <label className={labelCls}>Designation</label>
            <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Department</label>
            <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Joined Date</label>
            <input type="date" value={joinedDate} onChange={e => setJoinedDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Relieving Date</label>
            <input type="date" value={relievingDate} onChange={e => setRelievingDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Reason for Leaving</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className={inputCls}>
              <option value="Career Progression">Career Progression</option>
              <option value="Personal Endeavors">Personal Endeavors</option>
              <option value="Higher Studies">Higher Studies</option>
              <option value="Relocation">Relocation</option>
            </select>
          </div>

          <div className={sectionHeaderCls}>HR Signatory Details</div>
          <div>
            <label className={labelCls}>HR Signatory Name</label>
            <input type="text" value={hrHeadName} onChange={e => setHrHeadName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>HR Signatory Designation</label>
            <input type="text" value={hrHeadDesignation} onChange={e => setHrHeadDesignation(e.target.value)} className={inputCls} />
          </div>

          {/* Read-only Company Info from API */}
          <div className={sectionHeaderCls}>Company Info (from Profile)</div>
          <div className="col-span-2">
            <label className={labelCls}>Company Name</label>
            <div className={readonlyCls}>{companyName || '—'}</div>
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Registered Address</label>
            <div className={`${readonlyCls} whitespace-pre-wrap`}>{companyRegAddress || '—'}</div>
          </div>
          <div>
            <label className={labelCls}>HR / Contact Email</label>
            <div className={readonlyCls}>{hrEmail || '—'}</div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap justify-end gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
          <OutlineBtn onClick={handleGenerate} disabled={isGenerating} className="flex items-center gap-2 px-5 py-2 text-sm">
            <RefreshCw size={16} className={isGenerating ? "animate-spin" : ""} />
            {isGenerating ? "Generating..." : "Generate & Send Letter"}
          </OutlineBtn>
          <PrimaryBtn onClick={handlePrint} className="flex items-center gap-2 px-5 py-2 text-sm">
            <Printer size={16} /> Print / Export PDF
          </PrimaryBtn>
        </div>
      </div>

      {/* Success / Error Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <X size={18} />
            </button>

            {modalError ? (
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
              <>
                <div className="flex flex-col items-center gap-2 text-center mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                    <CheckCircle2 size={28} className="text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">Relieving Letter Dispatched!</h3>
                  <p className="text-xs text-gray-500">The certificate has been emailed successfully to the employee.</p>
                </div>

                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Email Sent To</p>
                      <p className="text-sm font-bold text-gray-800">{modalData.emailSentTo}</p>
                    </div>
                  </div>

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
        {/* Top-Right Decorative Accents (Base64 SVGs for perfect html2canvas/PDF rendering compatibility) */}
        <img 
          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOTUiIGhlaWdodD0iODYiIHZpZXdCb3g9IjAgMCAyOTUgODYiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0gMCAwIEwgMjk1IDAgTCAyOTUgODYgWiIgZmlsbD0iI2Q5NzcwNiIvPjwvc3ZnPg==" 
          style={{ position: 'absolute', top: 0, right: 0, zIndex: 40, width: '295px', height: '86px', userSelect: 'none', pointerEvents: 'none' }}
          alt="" 
        />
        <img 
          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyODAgODAiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0gMCAwIEwgMjgwIDAgTCAyODAgODAgWiIgZmlsbD0iIzE2NjUzNCIvPjwvc3ZnPg==" 
          style={{ position: 'absolute', top: 0, right: 0, zIndex: 50, width: '280px', height: '80px', userSelect: 'none', pointerEvents: 'none' }}
          alt="" 
        />

        {/* Bottom Decorative Slanted Accents (Responsive stretching SVGs for clean print dimensions) */}
        <img 
          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTSAwIDM1IEwgMTAwIDAgTCAxMDAgMTAwIEwgMCAxMDAgWiIgZmlsbD0iI2Q5NzcwNiIvPjwvc3ZnPg==" 
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40, width: '100%', height: '47px', userSelect: 'none', pointerEvents: 'none' }}
          width="100%"
          height="47"
          alt="" 
        />
        <img 
          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTSAwIDQ1IEwgMTAwIDAgTCAxMDAgMTAwIEwgMCAxMDAgWiIgZmlsbD0iIzE2NjUzNCIvPjwvc3ZnPg==" 
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50, width: '100%', height: '40px', userSelect: 'none', pointerEvents: 'none' }}
          width="100%"
          height="40"
          alt="" 
        />

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 10 }}>

          {/* Letterhead Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            {/* Logo & Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {logoSrc ? (
                  <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img crossOrigin="anonymous" src={logoSrc} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
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
                <div className="text-lg font-black uppercase leading-tight tracking-wide text-emerald-800 max-w-[280px]" style={{ fontFamily: "'Georgia', serif" }}>
                  {companyName}
                </div>
                <div className="mt-0.5 text-[9.5px] font-bold tracking-wide text-gray-700">
                  {user?.adminReferenceCode ? `Ref: ${user.adminReferenceCode}` : 'Since 1975'}
                </div>
              </div>
            </div>

            {/* Document Date */}
            <div className="mt-4 pr-[120px] text-[12.5px] font-semibold text-gray-800">
              Date: {formatDateIN(relievingDate)}
            </div>
          </div>

          {/* Reference & Title */}
          <div className="mb-3 flex justify-between text-[12.5px]">
            <div>
              <strong>Ref:</strong> GPHR/HR/REL/2026/{selectedId}
            </div>
          </div>

          <h3 className="mb-6 border-b-2 border-gray-900 pb-1 text-center text-[15px] font-extrabold uppercase tracking-widest text-gray-900">
            Relieving Order &amp; Experience Certificate
          </h3>

          {/* Body Text */}
          <div className="letter-body-content flex flex-col gap-3.5 text-justify text-[12.5px] leading-relaxed text-gray-800" style={{ textIndent: '40px' }}>
            <p className="m-0">
              This is to certify that Mr. <strong>{candidateName}</strong> (Employee ID: <strong>{selectedId}</strong>) was employed with M/s. <strong>{companyName}</strong> as <strong>{designation}</strong> in the <strong>{department}</strong> Department.
            </p>

            <p className="m-0">
              Mr. <strong>{candidateName}</strong> joined the services of the Company on <strong>{formatDateIN(joinedDate)}</strong> and has been relieved from their duties with effect from the close of business hours on <strong>{formatDateIN(relievingDate)}</strong> following their resignation submitted due to <strong>{reason}</strong>.
            </p>

            <p className="m-0">
              During their tenure of service with us, we found them to be extremely diligent, committed, and professional in carrying out their responsibilities. They have shown great clinical analytical precision and stellar teamwork in our pharmaceutical operations.
            </p>

            <p className="m-0">
              We also confirm that they have successfully completed all handover processes, resolved any company asset clearances, and fulfilled all exit compliance guidelines. No outstanding dues remain between the Company and Mr. <strong>{candidateName}</strong>.
            </p>

            <p className="m-0">
              We deeply appreciate their contributions to our pharmaceutical research and development goals and wish them the absolute best in all their future professional endeavors.
            </p>
          </div>

          {/* Signatures Row */}
          <div className="signature-block mt-auto flex items-end justify-between pt-5 text-[12.5px] text-gray-800">
            <div>
              <div className="font-semibold">Yours Sincerely,</div>
              <div className="mb-6 text-[11px] font-extrabold uppercase">for {companyName},</div>

              {/* Stamp or Simulated Signature */}
              {stampSrc ? (
                <div className="mb-1 flex h-14 items-center">
                  <img crossOrigin="anonymous" src={stampSrc} alt="Stamp" className="max-h-full object-contain" />
                </div>
              ) : (
                <div
                  className="mb-0.5 h-8 select-none text-2xl font-bold text-blue-900 rotate-[-4deg] translate-x-2.5"
                  style={{ fontFamily: "'Brush Script MT', cursive, sans-serif" }}
                >
                  {hrHeadName}
                </div>
              )}

              <div className="mb-0.5 w-40 border-t border-gray-500"></div>
              <div className="text-[11px] font-extrabold">{hrHeadName}</div>
              <div className="text-[10px] text-gray-600">{hrHeadDesignation}</div>
            </div>

            <div className="text-right">
              <div className="mb-10 text-[11.5px] text-gray-500">Received Certificate Copy:</div>
              <div className="mb-0.5 ml-auto w-40 border-t border-gray-500"></div>
              <div className="text-[11px] font-extrabold">Candidate Signature</div>
              <div className="text-[10px] text-gray-600">Date: {formatDateIN(relievingDate)}</div>
            </div>
          </div>

        </div>

        {/* Footer address info */}
        <div className="relative z-10 mt-5 border-t border-gray-200 pb-12 pt-2 text-center text-[9px] leading-snug text-gray-600">
          <div className="mb-0.5 text-[13px] font-black uppercase tracking-wide text-amber-700" style={{ fontFamily: "'Georgia', serif" }}>
            {companyName}
          </div>
          {companyRegAddress && <div>{companyRegAddress}</div>}
          {hrEmail && <div className="font-semibold">Email: {hrEmail} {user?.phone ? `| Ph: ${user.phone}` : ''}</div>}
        </div>

      </div>
    </div>
  )
}

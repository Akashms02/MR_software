import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import html2pdf from 'html2pdf.js'
import {
  ArrowLeft,
  Printer,
  RefreshCw,
  CheckCircle2,
  X,
  Mail,
  FileText,
  ExternalLink
} from 'lucide-react'

import { PrimaryBtn, OutlineBtn } from '../ui'
import { fetchProfile } from '../../redux/actions/authActions'
import { CompanyTerminationLetter } from '../../redux/actions/companyAction'
import { getMyTeam } from '../../redux/actions/teamActions'
import { getFullAssetUrl, inlineDocumentImages, useCompanyBrandAssets } from '../../utils/getFullAssetUrl'
import HrSignatureBlock from './shared/HrSignatureBlock'
import { loadLetterheadSettings, LetterheadHeader, LetterheadFooter, applyLetterheadContactPdfFixes, getLetterheadTheme, resolveModernColors } from './shared/letterheadContact'

export default function TerminationLetter({ letterheadSettings: propLetterheadSettings, onBack }) {
  const dispatch = useDispatch()
  const printableRef = useRef(null)

  const { user } = useSelector((state) => state.auth)
  const { team: employees = [] } = useSelector((state) => state.team)
  const { logoSrc, stampSrc } = useCompanyBrandAssets(user)

  // Load defaults and selection states
  const [selectedId, setSelectedId] = useState('')
  const [employeeName, setEmployeeName] = useState('RAJESH KUMAR')
  const [employeeEmail, setEmployeeEmail] = useState('')
  const [designation, setDesignation] = useState('Sr. Medical Officer')
  const [department, setDepartment] = useState('Medical Affairs')
  const [joiningDate, setJoiningDate] = useState('2021-03-15')
  const [terminationDate, setTerminationDate] = useState(() => new Date().toISOString().split('T')[0])
  const [reason, setReason] = useState('Violation of Company Policies')
  const [terminationType, setTerminationType] = useState('Termination')
  const [noticePeriod, setNoticePeriod] = useState('Immediate')
  const [lastWorkingDay, setLastWorkingDay] = useState(() => new Date().toISOString().split('T')[0])
  const [remarks, setRemarks] = useState('All company assets must be returned immediately.')

  const [hrHeadName, setHrHeadName] = useState('CH. MURTHY')
  const [hrHeadDesignation, setHrHeadDesignation] = useState('Head - HR')

  const [companyName, setCompanyName] = useState('NOEL PHARMA (INDIA) PRIVATE LIMITED')
  const [companyRegAddress, setCompanyRegAddress] = useState('')
  const [hrEmail, setHrEmail] = useState('')

  const [isGenerating, setIsGenerating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalError, setModalError] = useState('')
  const [modalData, setModalData] = useState({ emailSentTo: '', previewUrl: '', status: '' })

  const [letterheadSettings, setLetterheadSettings] = useState(() => propLetterheadSettings || loadLetterheadSettings(user))

  // Sync company details from custom settings, props or Redux when profile/props change
  useEffect(() => {
    const settings = propLetterheadSettings || loadLetterheadSettings(user)
    setLetterheadSettings(settings)
    if (settings.companyName) {
      setCompanyName(settings.companyName.toUpperCase())
    }
    if (settings.address) setCompanyRegAddress(settings.address)
    if (settings.email) setHrEmail(settings.email)
  }, [user, propLetterheadSettings])

  // Fetch admin profile and team on mount
  useEffect(() => {
    dispatch(fetchProfile())
    dispatch(getMyTeam())
  }, [dispatch])

  // Set first employee as default once team loads
  useEffect(() => {
    if (employees.length > 0 && !selectedId) {
      const first = employees[0]
      const id = first?.employeeId || first?.id || ''
      if (id) {
        handleLoadEmployee(id)
      }
    }
  }, [employees])

  const handleLoadEmployee = (empId) => {
    setSelectedId(empId)
    const emp = employees.find(e => (e.employeeId || e.id)?.toString() === empId?.toString())
    if (emp) {
      setEmployeeName((emp.fullName || emp.name || '').toUpperCase())
      setDesignation(emp.designation || '')
      setDepartment(emp.department || emp.dept || '')
      setJoiningDate(emp.joiningDate || emp.joined || '2021-03-15')
      setEmployeeEmail(emp.email || '')
    }
  }

  const formatDateIN = (dateStr) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`
    return dateStr
  }

  const handlePrint = () => {
    if (!terminationDate) setTerminationDate(new Date().toISOString().split('T')[0])
    window.print()
  }

  const handleGenerate = async () => {
    if (!employeeEmail || !employeeEmail.includes('@')) {
      setModalError('Please enter a valid employee email address before generating.')
      setShowModal(true)
      return
    }

    setIsGenerating(true)
    setModalError('')

    let originalWindowGetComputedStyle = null

    try {
      originalWindowGetComputedStyle = window.getComputedStyle
      window.getComputedStyle = function (el, pseudoEl) {
        const style = originalWindowGetComputedStyle.call(window, el, pseudoEl)
        return new Proxy(style, {
          get(target, prop) {
            if (prop === 'getPropertyValue') {
              return function(key) {
                const val = target.getPropertyValue(key)
                if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                  try {
                    return resolveModernColors(val)
                  } catch (e) {
                    return val
                  }
                }
                return val
              }
            }
            const val = target[prop]
            if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
              try {
                return resolveModernColors(val)
              } catch (e) {
                return val
              }
            }
            if (typeof val === 'function') {
              return val.bind(target)
            }
            return val
          }
        })
      }

      const sheetElement = printableRef.current
      if (!sheetElement) throw new Error('Document preview not ready. Please try again.')

      const fileName = `termination_letter_${employeeName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.pdf`

      await document.fonts.ready
      await inlineDocumentImages(sheetElement)
      await new Promise((resolve) => setTimeout(resolve, 100))

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
            applyLetterheadContactPdfFixes(clonedDoc);
            clonedDoc.querySelectorAll('style').forEach(styleTag => {
              if (styleTag.textContent) {
                styleTag.textContent = resolveModernColors(styleTag.textContent);
              }
            });

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
                          try { return resolveModernColors(val); } catch (e) { return val; }
                        }
                        return val;
                      };
                    }
                    const val = target[prop];
                    if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                      try { return resolveModernColors(val); } catch (e) { return val; }
                    }
                    if (typeof val === 'function') return val.bind(target);
                    return val;
                  }
                });
              };
            }

            const sheet = clonedDoc.querySelector('.printable-sheet');
            if (sheet) {
              sheet.style.width = '210mm';
              sheet.style.height = '296mm';
              sheet.style.minHeight = '296mm';
              sheet.style.maxHeight = '296mm';
              sheet.style.paddingLeft = '0px';
              sheet.style.paddingRight = '0px';
              sheet.style.paddingTop = '0px';
              sheet.style.paddingBottom = '0px';
              sheet.style.boxSizing = 'border-box';
              sheet.style.borderRadius = '0px';
              sheet.style.border = 'none';
              sheet.style.boxShadow = 'none';
              sheet.style.overflow = 'hidden';

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
      }

      const pdfBlob = await html2pdf().set(opt).from(sheetElement).output('blob')

      const formData = new FormData()
      formData.append('email', employeeEmail)
      formData.append('file', pdfBlob, fileName)

      const res = await dispatch(CompanyTerminationLetter(selectedId, formData))

      if (res?.data) {
        setModalData({
          emailSentTo: res.data.emailSentTo || employeeEmail,
          previewUrl: res.data.previewUrl || res.data.terminationLetterPDF || '',
          status: res.data.status || 'SENT'
        })
        setModalError('')
        setShowModal(true)
      } else {
        setModalError(res?.message || 'Failed to generate termination letter. Please try again.')
        setShowModal(true)
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'An unexpected error occurred.')
      setShowModal(true)
    } finally {
      if (originalWindowGetComputedStyle) {
        window.getComputedStyle = originalWindowGetComputedStyle
      }
      setIsGenerating(false)
    }
  }

  const inputCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 text-sm font-medium"
  const readonlyCls = "w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-sm font-medium"
  const labelCls = "text-sm font-medium text-slate-700 block mb-1.5"
  const sectionHeaderCls = "col-span-full mt-6 mb-2 border-b border-slate-100 pb-3 text-sm font-bold uppercase tracking-wider text-blue-600"

  return (
    <div className="animate-in fade-in duration-500">
      {/* Control Panel (Screen-only) */}
      <div className="no-print mb-8 rounded-xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm flex flex-col">
        {/* Navigation & Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-extrabold text-slate-800">Termination Customizer</h3>
          </div>

          {/* Preload Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-400">Load Employee:</span>
            <select
              onChange={e => handleLoadEmployee(e.target.value)}
              value={selectedId}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
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

        {/* Input Fields Grid */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          
          <div className={sectionHeaderCls}>Employee Details</div>
          <div>
            <label className={labelCls}>Employee Name (uppercase)</label>
            <input type="text" value={employeeName} onChange={e => setEmployeeName(e.target.value.toUpperCase())} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Employee ID</label>
            <input type="text" value={selectedId} onChange={e => setSelectedId(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Employee Email</label>
            <input type="email" value={employeeEmail} onChange={e => setEmployeeEmail(e.target.value)} className={inputCls} placeholder="employee@example.com" />
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
            <label className={labelCls}>Joining Date</label>
            <input type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} className={inputCls} />
          </div>

          <div className={sectionHeaderCls}>Termination Specifics</div>
          <div>
            <label className={labelCls}>Termination Date</label>
            <input type="date" value={terminationDate} onChange={e => setTerminationDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Last Working Day</label>
            <input type="date" value={lastWorkingDay} onChange={e => setLastWorkingDay(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Notice Period Required</label>
            <input type="text" value={noticePeriod} onChange={e => setNoticePeriod(e.target.value)} className={inputCls} placeholder="e.g. Immediate, 30 Days" />
          </div>
          <div>
            <label className={labelCls}>Separation Type</label>
            <select value={terminationType} onChange={e => setTerminationType(e.target.value)} className={inputCls}>
              <option value="Termination">Termination</option>
              <option value="Separation">Separation</option>
              <option value="Layoff">Layoff</option>
              <option value="Resignation Acceptance">Resignation Acceptance</option>
            </select>
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className={labelCls}>Primary Reason</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              className={`${inputCls} h-[42px] min-h-[42px] max-h-[120px] resize-y py-2`}
              placeholder="e.g. Violation of Policy, Restructuring"
              rows={1}
            />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className={labelCls}>Additional Remarks / Instructions</label>
            <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} className={inputCls} placeholder="e.g. Asset handover requirements..." />
          </div>

          <div className={sectionHeaderCls}>HR Signatory</div>
          <div>
            <label className={labelCls}>HR Signatory Name</label>
            <input type="text" value={hrHeadName} onChange={e => setHrHeadName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>HR Signatory Title</label>
            <input type="text" value={hrHeadDesignation} onChange={e => setHrHeadDesignation(e.target.value)} className={inputCls} />
          </div>

          <div className={sectionHeaderCls}>Company Information (Read-Only)</div>
          <div className="col-span-1 sm:col-span-2">
            <label className={labelCls}>Company Name</label>
            <div className={readonlyCls}>{companyName || '—'}</div>
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className={labelCls}>Registered Office Address</label>
            <div className={`${readonlyCls} whitespace-pre-wrap`}>{companyRegAddress || '—'}</div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex flex-wrap justify-end gap-3 mt-6">
          <OutlineBtn onClick={handleGenerate} disabled={isGenerating} className="flex items-center gap-2 px-5 py-2 text-sm">
            <RefreshCw size={16} className={isGenerating ? "animate-spin text-blue-600" : "text-blue-600"} />
            <span className="text-blue-600 font-bold">{isGenerating ? "Generating..." : "Generate & Send Letter"}</span>
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
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
            >
              <X size={18} />
            </button>

            {modalError ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
                  <X size={24} className="text-rose-500" />
                </div>
                <h3 className="text-base font-extrabold text-slate-800">Generation Failed</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">{modalError}</p>
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-2 w-full rounded-xl bg-slate-900 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-slate-800 shadow-sm cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-2 text-center mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                    <CheckCircle2 size={28} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">Letter Dispatched!</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[280px]">
                    The termination certificate has been successfully generated and emailed to the employee.
                  </p>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                      <Mail size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Email Sent To</span>
                      <span className="text-xs font-bold text-slate-700">{modalData.emailSentTo}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Delivery Status</span>
                      <span className="inline-block text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-0.5">
                        {modalData.status}
                      </span>
                    </div>
                  </div>

                  {modalData.previewUrl && (
                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-3.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                        <FileText size={16} className="text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Preview Reference</span>
                        <a
                          href={getFullAssetUrl(modalData.previewUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1 mt-0.5 truncate"
                        >
                          Download / View PDF <ExternalLink size={11} className="shrink-0" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800 shadow-sm cursor-pointer"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Live Paper Document Sheet (Preview & Print container) */}
      <div ref={printableRef} className="printable-sheet-container mx-auto flex flex-col gap-8 max-w-[800px] multipage-print">
        <div className="printable-sheet relative flex w-full min-h-[296mm] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl text-gray-800 box-border" style={{padding:0}}>

          {/* GP watermark — bottom right area, just above the footer */}
          <img
            src={logoSrc || "/GP.png"}
            alt=""
            crossOrigin="anonymous"
            className="offer-theme-decor"
            style={{
              position: 'absolute',
              right: '20px',
              bottom: '125px',
              width: '270px',
              height: '209px',
              opacity: 0.12,
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 1,
              filter: 'grayscale(20%)',
            }}
          />

          {/* FIXED HEADER */}
          <LetterheadHeader logoSrc={logoSrc} settings={letterheadSettings} />

          {/* BODY */}
          <div className="relative z-10 flex flex-1 flex-col gap-1.5" style={{padding:'20px 44px 115px 44px'}}>
            <div className="text-right text-[11px] font-semibold text-gray-700 mb-0.5">Date: {formatDateIN(terminationDate)}</div>

            {/* Reference & Title */}
            <div className="mb-1 text-[11px] text-gray-800 font-bold">
              Ref: GPHR/HR/TERM/2026/{selectedId || '_______________'}
            </div>

            <h3 className="mb-2.5 border-b border-red-200 pb-1 text-center text-[13px] font-extrabold uppercase tracking-wider text-red-600 underline">
              {terminationType} Letter
            </h3>

            {/* Body Text */}
            <div className="letter-body-content flex flex-col gap-1.5 text-justify text-[11.5px] leading-normal text-gray-800 font-medium">
              <p className="m-0">
                To,<br />
                <strong>{employeeName}</strong><br />
                {designation} · {department}<br />
                Employee ID: {selectedId || '_______________'}
              </p>

              <p className="m-0 font-bold text-red-700 bg-red-50/70 p-1.5 border-l-4 border-red-500 rounded-r-lg">
                Subject: Formal Notice of Employment {terminationType}
              </p>

              <p className="m-0">
                Dear {employeeName},
              </p>

              <p className="m-0">
                This letter serves as formal notification that your employment with M/s. <strong>{companyName}</strong> is being concluded in the capacity of <strong>{terminationType.toLowerCase()}</strong>. This decision has been reached after careful consideration of all relevant factors.
              </p>

              <p className="m-0">
                The reason for this separation is: <strong>{reason}</strong>.
              </p>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 p-2 rounded-lg text-[10.5px]">
                <div>
                  <span className="text-[8.5px] font-bold text-slate-400 block uppercase tracking-wide">Date of Joining</span>
                  <strong className="text-slate-800">{formatDateIN(joiningDate) || "—"}</strong>
                </div>
                <div>
                  <span className="text-[8.5px] font-bold text-slate-400 block uppercase tracking-wide">Last Working Day</span>
                  <strong className="text-red-600">{formatDateIN(lastWorkingDay || terminationDate)}</strong>
                </div>
              </div>

              {noticePeriod && (
                <p className="m-0">
                  As per your employment agreement, your notice period is designated as <strong>{noticePeriod}</strong>. You are required to fulfill all corresponding responsibilities during this phase unless explicitly excused by human resources.
                </p>
              )}

              {remarks && (
                <div className="bg-amber-50/80 border border-amber-100 p-2 rounded-lg text-[10.5px] leading-relaxed">
                  <span className="text-[8.5px] font-extrabold text-amber-800 block uppercase tracking-wider mb-0.5">Special Instructions</span>
                  <p className="m-0 text-amber-900 font-medium">{remarks}</p>
                </div>
              )}

              <p className="m-0">
                You are requested to hand over all company properties, files, designs, databases, security keys, laptops, and other assets in your possession to your department head, and secure a signed clearance certificate prior to your departure. Your final full &amp; final settlement, including any accrued benefits, will be released upon successful asset verification.
              </p>

              <p className="m-0">
                We appreciate the contributions you made during your tenure and wish you the best in your future career endeavors.
              </p>
            </div>

            {/* Signatures Row */}
            <div className="signature-block mt-auto flex items-end justify-between pt-2.5 text-[11px] text-gray-800">
              <HrSignatureBlock
                companyName={companyName}
                hrHeadName={hrHeadName}
                hrHeadDesignation={hrHeadDesignation}
                stampSrc={stampSrc}
                closingText="Sincerely,"
                compact
              />

              <div className="text-right flex flex-col items-end">
                <div className="mb-7 text-[10px] text-gray-500">Acknowledgment Signature:</div>
                <div className="mb-1 w-36 border-t border-gray-400"></div>
                <div className="text-[9.5px] font-black uppercase tracking-wide text-gray-950">Employee Signature</div>
                <div className="text-[8.5px] font-semibold text-gray-500">Date: {formatDateIN(terminationDate)}</div>
              </div>
            </div>
          </div>

          {/* FIXED FOOTER */}
          <LetterheadFooter settings={letterheadSettings} />
        </div>
      </div>
    </div>
  )
}
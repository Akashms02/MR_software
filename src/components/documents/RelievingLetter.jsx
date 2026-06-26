import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import html2pdf from 'html2pdf.js'
import { ArrowLeft, Printer, RefreshCw, CheckCircle2, X, Mail, FileText, ExternalLink } from 'lucide-react'
import { PrimaryBtn, OutlineBtn } from '../ui'
import { fetchProfile } from '../../redux/actions/authActions'
import { CompanyReleivingLetter } from '../../redux/actions/companyAction'
import { getMyTeam } from '../../redux/actions/teamActions'
import { getFullAssetUrl, inlineDocumentImages, useCompanyBrandAssets } from '../../utils/getFullAssetUrl'
import { loadLetterheadSettings, LetterheadHeader, LetterheadFooter, applyLetterheadContactPdfFixes, getLetterheadTheme, resolveModernColors } from './shared/letterheadContact'
import HrSignatureBlock from './shared/HrSignatureBlock'

export default function RelievingLetter({ letterheadSettings: propLetterheadSettings, onBack }) {
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
      const empId = employees[0]?.employeeId || employees[0]?.id || ''
      if (empId) {
        handleLoadEmployee(empId)
      }
    }
  }, [employees, selectedId])

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

  // Company details
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

  const [letterheadSettings, setLetterheadSettings] = useState(() => propLetterheadSettings || loadLetterheadSettings(user))

  // Sync company data from custom settings, props or Redux when profile/props change
  useEffect(() => {
    const settings = propLetterheadSettings || loadLetterheadSettings(user)
    setLetterheadSettings(settings)
    if (settings.companyName) {
      setCompanyName(settings.companyName.toUpperCase())
    }
    if (settings.address) setCompanyRegAddress(settings.address)
    if (settings.email) setHrEmail(settings.email)
  }, [user, propLetterheadSettings])

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

      const opt = {
        margin: [0, 0, 0, 0],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          letterRendering: false,
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
      };

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
        throw new Error(res?.message || 'Failed to generate relieving letter. Please try again.')
      }
    } catch (err) {
      setModalError(err.message || 'An unexpected error occurred.')
      setShowModal(true)
    } finally {
      if (originalWindowGetComputedStyle) {
        window.getComputedStyle = originalWindowGetComputedStyle;
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
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="text-base font-extrabold text-slate-800">Relieving Certificate Customizer</h3>

          {/* Quick Preload */}
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

        {/* Action Row */}
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
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"><X size={18} /></button>
            {modalError ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50"><X size={24} className="text-rose-500" /></div>
                <h3 className="text-base font-extrabold text-slate-800">Generation Failed</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">{modalError}</p>
                <button onClick={() => setShowModal(false)} className="mt-2 w-full rounded-xl bg-slate-900 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-slate-800 shadow-sm cursor-pointer">Close</button>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-2 text-center mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50"><CheckCircle2 size={28} className="text-blue-600" /></div>
                  <h3 className="text-lg font-black text-slate-800">Relieving Letter Dispatched!</h3>
                  <p className="text-xs text-slate-400">The certificate has been generated and emailed successfully to the employee.</p>
                </div>

                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Mail size={16} /></div>
                    <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Email Sent To</p><p className="text-sm font-bold text-slate-700">{modalData.emailSentTo}</p></div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={16} /></div>
                    <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Delivery Status</p><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-2xs font-extrabold uppercase text-emerald-600 tracking-wider inline-block mt-0.5">{modalData.status}</span></div>
                  </div>

                  {modalData.previewUrl && (
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><FileText size={16} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Preview Document</p>
                        <a href={getFullAssetUrl(modalData.previewUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition overflow-hidden text-overflow-ellipsis whitespace-nowrap">Download / View PDF <ExternalLink size={12} className="shrink-0" /></a>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={() => setShowModal(false)} className="w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-slate-800 shadow-sm cursor-pointer">Done</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Live Document Sheet View */}
      <div ref={printableRef} className="printable-sheet-container mx-auto flex flex-col gap-8 max-w-[800px] multipage-print">
        <div className="printable-sheet relative flex w-full min-h-[296mm] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl text-gray-800 box-border" style={{padding:0}}>
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

          <LetterheadHeader logoSrc={logoSrc} settings={letterheadSettings} />

          <div className="relative z-10 flex flex-1 flex-col gap-2" style={{padding:'32px 44px 130px 44px'}}>
            <div className="text-right text-[12px] font-semibold text-gray-700 mb-1">Date: {formatDateIN(relievingDate)}</div>

            <div className="mb-2 text-[12px] text-gray-800 font-bold">
              Ref: GPHR/HR/REL/2026/{selectedId || '_______________'}
            </div>

            <h3 className="mb-4 border-b border-gray-200 pb-1.5 text-center text-[13.5px] font-extrabold uppercase tracking-wider text-gray-900 underline">
              Relieving Order &amp; Experience Certificate
            </h3>

            <div className="letter-body-content flex flex-col gap-2.5 text-justify text-[12px] leading-relaxed text-gray-800 font-medium">
              <p className="indent-8">
                This is to certify that Mr. <strong>{candidateName}</strong> (Employee ID: <strong>{selectedId || '_______________'}</strong>) was employed with M/s. <strong>{companyName}</strong> as <strong>{designation}</strong> in the <strong>{department}</strong> Department.
              </p>
              <p>
                Mr. <strong>{candidateName}</strong> joined the services of the Company on <strong>{formatDateIN(joinedDate)}</strong> and has been relieved from their duties with effect from the close of business hours on <strong>{formatDateIN(relievingDate)}</strong> following their resignation submitted due to <strong>{reason}</strong>.
              </p>
              <p>
                During their tenure of service with us, we found them to be extremely diligent, committed, and professional in carrying out their responsibilities. They have shown great clinical analytical precision and stellar teamwork in our corporate operations.
              </p>
              <p>
                We also confirm that they have successfully completed all handover processes, resolved any company asset clearances, and fulfilled all exit compliance guidelines. No outstanding dues remain between the Company and Mr. <strong>{candidateName}</strong>.
              </p>
              <p>
                We deeply appreciate their contributions to our corporate development goals and wish them the absolute best in all their future professional endeavors.
              </p>
            </div>

            <div className="signature-block mt-auto flex items-end justify-between pt-3 text-[12px] text-gray-800">
              <HrSignatureBlock
                companyName={companyName}
                hrHeadName={hrHeadName}
                hrHeadDesignation={hrHeadDesignation}
                stampSrc={stampSrc}
              />

              <div className="text-right flex flex-col items-end">
                <div className="mb-8 text-[11px] text-gray-500">Received Certificate Copy:</div>
                <div className="mb-1 w-38 border-t border-gray-400"></div>
                <div className="text-[10px] font-black uppercase tracking-wide text-gray-950">Candidate Signature</div>
                <div className="text-[9px] font-semibold text-gray-500">Date: {formatDateIN(relievingDate)}</div>
              </div>
            </div>
          </div>

          <LetterheadFooter settings={letterheadSettings} />
        </div>
      </div>
    </div>
  )
}

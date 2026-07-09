import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import html2pdf from 'html2pdf.js'
import { ArrowLeft, Printer, RefreshCw, CheckCircle2, X, Mail, FileText, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { PrimaryBtn, OutlineBtn } from '../ui'
import { fetchProfile } from '../../redux/actions/authActions'
import { CompanyPayslip } from '../../redux/actions/companyAction'
import { getMyTeam } from '../../redux/actions/teamActions'
import { getFullAssetUrl, inlineDocumentImages, useCompanyBrandAssets } from '../../utils/getFullAssetUrl'
import { loadLetterheadSettings, LetterheadHeader, LetterheadFooter, applyLetterheadContactPdfFixes, getLetterheadTheme, resolveModernColors } from './shared/letterheadContact'

const waitForImages = async (rootEl, { timeoutMs = 4000 } = {}) => {
  if (!rootEl) return;
  const imgs = Array.from(rootEl.querySelectorAll('img'));
  if (imgs.length === 0) return;
  const waitOne = (img) =>
    new Promise((resolve) => {
      if (img.complete && img.naturalWidth > 0) return resolve();
      let settled = false;
      const cleanup = () => {
        if (settled) return; settled = true;
        img.removeEventListener('load', onDone);
        img.removeEventListener('error', onDone);
        resolve();
      };
      const onDone = () => cleanup();
      img.addEventListener('load', onDone, { once: true });
      img.addEventListener('error', onDone, { once: true });
      window.setTimeout(cleanup, timeoutMs);
    });
  await Promise.all(imgs.map(waitOne));
};

// Helper to convert number to Indian Rupees words
function numberToRupeesWords(amount) {
  const words = {
    0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine',
    10: 'Ten', 11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen', 16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen',
    20: 'Twenty', 30: 'Thirty', 40: 'Forty', 50: 'Fifty', 60: 'Sixty', 70: 'Seventy', 80: 'Eighty', 90: 'Ninety'
  }

  if (amount === 0) return 'Rupees Zero Only'

  let n = Math.floor(amount)
  let str = ''

  function getBelowHundred(num) {
    if (num < 20) return words[num]
    const tens = Math.floor(num / 10) * 10
    const units = num % 10
    return words[tens] + (units > 0 ? '-' + words[units] : '')
  }

  function getBelowThousand(num) {
    if (num === 0) return ''
    const hundreds = Math.floor(num / 100)
    const rest = num % 100
    let res = ''
    if (hundreds > 0) res += words[hundreds] + ' Hundred '
    if (rest > 0) res += getBelowHundred(rest)
    return res.trim()
  }

  if (n >= 10000000) { str += getBelowThousand(Math.floor(n / 10000000)) + ' Crore '; n %= 10000000 }
  if (n >= 100000)   { str += getBelowThousand(Math.floor(n / 100000)) + ' Lakh ';   n %= 100000 }
  if (n >= 1000)     { str += getBelowThousand(Math.floor(n / 1000)) + ' Thousand '; n %= 1000 }
  if (n > 0)         { str += getBelowThousand(n) }

  return 'Rupees ' + str.trim() + ' Only'
}

const formatMonthValue = (val) => {
  if (!val) return '';
  const match = val.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const [_, year, monthNum] = match;
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = parseInt(monthNum, 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${months[monthIndex]} ${year}`;
    }
  }
  return val;
};

const getDaysInMonth = (monthStr) => {
  if (!monthStr) return 30;
  const match = monthStr.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const year = parseInt(match[1], 10);
    const monthNum = parseInt(match[2], 10);
    return new Date(year, monthNum, 0).getDate();
  }
  return 30;
};

const paginateSalarySlip = (earnings, deductions) => {
  const pages = [];
  const maxLength = Math.max(earnings.length, deductions.length);
  
  // Safe limit of rows per page
  // Page 1 can hold up to 12 rows safely with employee info and summary cards.
  // Subsequent pages can hold up to 16 rows safely.
  const page1Limit = 12;
  const otherPageLimit = 16;
  
  let currentIndex = 0;
  let isFirstPage = true;
  
  while (currentIndex < maxLength) {
    const limit = isFirstPage ? page1Limit : otherPageLimit;
    const chunkRows = [];
    
    for (let i = currentIndex; i < Math.min(currentIndex + limit, maxLength); i++) {
      chunkRows.push({
        earning: earnings[i] || null,
        deduction: deductions[i] || null,
      });
    }
    
    pages.push({
      rows: chunkRows,
      isFirstPage,
      isLastPage: currentIndex + limit >= maxLength,
    });
    
    currentIndex += limit;
    isFirstPage = false;
  }
  
  return pages.length > 0 ? pages : [{ rows: [], isFirstPage: true, isLastPage: true }];
};

export default function SalarySlip({ letterheadSettings: propLetterheadSettings, onBack }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { logoSrc } = useCompanyBrandAssets(user)
  const { team: employees = [] } = useSelector((state) => state.team)

  // Fetch admin profile and team on mount
  useEffect(() => {
    dispatch(fetchProfile())
    dispatch(getMyTeam())
  }, [dispatch])

  const [selectedId, setSelectedId] = useState('')
  const [month, setMonth] = useState('2026-05')

  // Set first employee as default once team loads
  useEffect(() => {
    if (employees.length > 0 && !selectedId) {
      setSelectedId(employees[0]?.employeeId || employees[0]?.id || '')
    }
  }, [employees])

  // Company details
  const [companyName, setCompanyName] = useState('NOEL PHARMA (INDIA) PRIVATE LIMITED')
  const [companyAddress, setCompanyAddress] = useState('')

  // Modal / generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState({ emailSentTo: '', previewUrl: '', status: '' })
  const [modalError, setModalError] = useState('')

  // Ref to the printable document
  const printableRef = useRef(null)

  const [letterheadSettings, setLetterheadSettings] = useState(() => propLetterheadSettings || loadLetterheadSettings(user))

  // Sync company details from custom settings, props or Redux when profile/props change
  useEffect(() => {
    const settings = propLetterheadSettings || loadLetterheadSettings(user)
    setLetterheadSettings(settings)
    if (settings.companyName) {
      setCompanyName(settings.companyName.toUpperCase())
    }
    if (settings.address) setCompanyAddress(settings.address)
  }, [user, propLetterheadSettings])

  const employee = employees.find(e => (e.employeeId || e.id) === selectedId) || employees[0]

  // Salary customizer state
  const [earnings, setEarnings] = useState([])
  const [deductions, setDeductions] = useState([])

  const prevEmployeeIdRef = useRef('')
  const prevSalaryRef = useRef(0)

  useEffect(() => {
    if (!employee) return

    let sal = employee?.salary || employee?.salaryAmount || employee?.salaryDetails || 25000
    sal = Number(sal) || 0
    
    const empId = employee?.employeeId || employee?.id || selectedId

    if (prevEmployeeIdRef.current !== empId || prevSalaryRef.current !== sal) {
      prevEmployeeIdRef.current = empId
      prevSalaryRef.current = sal

      const basicVal = Math.round(sal * 0.50)
      const hraVal = Math.round(sal * 0.20)
      const daVal = Math.round(sal * 0.05)
      const allowancesVal = Math.round(sal * 0.05)
      const pfVal = Math.round(sal * 0.12)
      const esiVal = Math.round(sal * 0.0075)
      const tdsVal = Math.round(sal * 0.05)

      setEarnings([
        { id: '1', label: 'Basic Salary', amount: basicVal },
        { id: '2', label: 'House Rent Allowance', amount: hraVal },
        { id: '3', label: 'Dearness Allowance (DA)', amount: daVal },
        { id: '4', label: 'Special & Conveyance Allowance', amount: allowancesVal }
      ])
      setDeductions([
        { id: '1', label: 'Provident Fund (PF)', amount: pfVal },
        { id: '2', label: 'ESI Contribution', amount: esiVal },
        { id: '3', label: 'TDS (Tax Deducted)', amount: tdsVal }
      ])
    }
  }, [employee, selectedId])

  if (employees.length > 0 && !employee) return <div>No employee records available.</div>
  if (!employee) return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading team data…</div>

  const handleAddEarning = () => {
    setEarnings([...earnings, { id: Date.now().toString(), label: '', amount: 0 }])
  }

  const handleUpdateEarning = (index, field, value) => {
    const updated = [...earnings]
    updated[index][field] = field === 'amount' ? (value === '' ? '' : Number(value)) : value
    setEarnings(updated)
  }

  const handleRemoveEarning = (index) => {
    setEarnings(earnings.filter((_, i) => i !== index))
  }

  const handleAddDeduction = () => {
    setDeductions([...deductions, { id: Date.now().toString(), label: '', amount: 0 }])
  }

  const handleUpdateDeduction = (index, field, value) => {
    const updated = [...deductions]
    updated[index][field] = field === 'amount' ? (value === '' ? '' : Number(value)) : value
    setDeductions(updated)
  }

  const handleRemoveDeduction = (index) => {
    setDeductions(deductions.filter((_, i) => i !== index))
  }

  // Calculated totals
  const gross = earnings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const totalDeductions = deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const netPay = gross - totalDeductions

  const handlePrint = () => window.print()

  const handleGenerate = async () => {
    const empEmail = employee.email
    if (!empEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(empEmail.trim())) {
      setModalError("No valid email found for this employee. Please update the employee's email in the system.")
      setShowModal(true)
      return
    }
    if (!month || month.trim() === '') {
      setModalError("Please select a valid cycle month.")
      setShowModal(true)
      return
    }
    if (earnings.length === 0) {
      setModalError("At least one Earning component is required.")
      setShowModal(true)
      return
    }
    // Check components
    for (let i = 0; i < earnings.length; i++) {
      if (!earnings[i].label || earnings[i].label.trim() === '') {
        setModalError(`Earning row #${i + 1} has an empty label.`)
        setShowModal(true)
        return
      }
      if (earnings[i].amount === '' || Number(earnings[i].amount) < 0) {
        setModalError(`Earning row #${i + 1} amount must be 0 or positive.`)
        setShowModal(true)
        return
      }
    }
    for (let i = 0; i < deductions.length; i++) {
      if (!deductions[i].label || deductions[i].label.trim() === '') {
        setModalError(`Deduction row #${i + 1} has an empty label.`)
        setShowModal(true)
        return
      }
      if (deductions[i].amount === '' || Number(deductions[i].amount) < 0) {
        setModalError(`Deduction row #${i + 1} amount must be 0 or positive.`)
        setShowModal(true)
        return
      }
    }
    if (gross <= 0) {
      setModalError("Gross salary must be a positive number.")
      setShowModal(true)
      return
    }
    if (netPay < 0) {
      setModalError("Net pay cannot be negative (deductions exceed gross earnings).")
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

      const empName = employee.fullName || employee.name || 'employee'
      const formattedMonth = formatMonthValue(month)
      const fileName = `payslip_${empName.replace(/\s+/g, '_').toLowerCase()}_${formattedMonth.replace(/\s+/g, '_')}_${Date.now()}.pdf`

      await document.fonts.ready
      await inlineDocumentImages(sheetElement)
      await waitForImages(sheetElement)
      await new Promise((resolve) => setTimeout(resolve, 120))

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

            const clonedContainer = clonedDoc.querySelector('.printable-sheet-container');
            if (clonedContainer) {
              clonedContainer.classList.add('generating-pdf');
              Object.assign(clonedContainer.style, { display: 'block', gap: '0', margin: '0', padding: '0', width: '210mm', maxWidth: '210mm' });
            }
            clonedDoc.querySelectorAll('.printable-sheet').forEach((sheet) => {
              Object.assign(sheet.style, {
                width: '210mm',
                height: '296mm',
                minHeight: '296mm',
                maxHeight: '296mm',
                boxSizing: 'border-box',
                borderRadius: '0px',
                border: 'none',
                boxShadow: 'none',
                overflow: 'hidden',
                background: '#ffffff',
                margin: '0',
              });

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
            });
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
      };

      sheetElement.classList.add('generating-pdf');
      const pdfBlob = await html2pdf().set(opt).from(sheetElement).output('blob');

      let monthName = ''
      let yearStr = ''
      if (month && month.includes('-')) {
        const parts = month.split('-')
        yearStr = parts[0]
        const monthNum = parseInt(parts[1], 10)
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ]
        if (monthNum >= 1 && monthNum <= 12) {
          monthName = months[monthNum - 1]
        }
      }

      const formData = new FormData()
      formData.append('email', empEmail)
      formData.append('file', pdfBlob, fileName)

      const queryParams = monthName && yearStr ? `?month=${monthName}&year=${yearStr}` : ''
      const res = await dispatch(CompanyPayslip(employee.employeeId || selectedId, formData, queryParams))

      if (res?.data) {
        setModalData({
          emailSentTo: res.data.emailSentTo || empEmail,
          previewUrl: res.data.previewUrl || res.data.payslipPDF || '',
          status: res.data.status || 'SENT'
        })
        setModalError('')
        setShowModal(true)
      } else {
        setModalError(res?.message || 'Failed to generate payslip. Please try again.')
        setShowModal(true)
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'An unexpected error occurred.')
      setShowModal(true)
    } finally {
      if (printableRef.current) {
        printableRef.current.classList.remove('generating-pdf')
      }
      if (originalWindowGetComputedStyle) {
        window.getComputedStyle = originalWindowGetComputedStyle;
      }
      setIsGenerating(false)
    }
  }

  const displaySalaryPages = paginateSalarySlip(earnings, deductions)

  return (
    <div className="animate-in fade-in duration-500">
      {/* Control Panel */}
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          {/* Employee Select */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-slate-500">
              Employee:
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              {employees.map((emp) => (
                <option
                  key={emp.employeeId || emp.id}
                  value={emp.employeeId || emp.id}
                >
                  {emp.fullName || emp.name} ({emp.employeeId || emp.id})
                </option>
              ))}
            </select>
          </div>

          {/* Month Select */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-slate-500">
              Payslip Cycle:
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <OutlineBtn
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2 text-sm"
          >
            <RefreshCw
              size={16}
              className={isGenerating ? "animate-spin text-blue-600" : "text-blue-600"}
            />
            <span className="text-blue-600 font-bold">{isGenerating ? "Generating..." : "Generate & Send Payslip"}</span>
          </OutlineBtn>

          <PrimaryBtn
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-sm"
          >
            <Printer size={16} />
            Print Payslip
          </PrimaryBtn>
        </div>
      </div>

      {/* Earnings & Deductions Customizer */}
      <div className="no-print mb-8 rounded-xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm animate-in fade-in duration-300">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-extrabold text-slate-800">Salary Table Customizer</h3>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Earnings Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-sm font-bold text-slate-700">Earnings</span>
              <button
                type="button"
                onClick={handleAddEarning}
                className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <Plus size={14} /> Add Row
              </button>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {earnings.map((item, index) => (
                <div key={item.id || index} className="flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleUpdateEarning(index, 'label', e.target.value)}
                    placeholder="Earning Label"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none"
                  />
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleUpdateEarning(index, 'amount', e.target.value)}
                    placeholder="Amount"
                    className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-right"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveEarning(index)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {earnings.length === 0 && (
                <p className="text-xs text-slate-400 italic">No earnings added yet.</p>
              )}
            </div>
          </div>
          
          {/* Deductions Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-sm font-bold text-slate-700">Deductions</span>
              <button
                type="button"
                onClick={handleAddDeduction}
                className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
              >
                <Plus size={14} /> Add Row
              </button>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {deductions.map((item, index) => (
                <div key={item.id || index} className="flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleUpdateDeduction(index, 'label', e.target.value)}
                    placeholder="Deduction Label"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none"
                  />
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => handleUpdateDeduction(index, 'amount', e.target.value)}
                    placeholder="Amount"
                    className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-right"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveDeduction(index)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {deductions.length === 0 && (
                <p className="text-xs text-slate-400 italic">No deductions added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success / Error Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl">
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
                  <h3 className="text-lg font-black text-slate-800">Payslip Dispatched!</h3>
                  <p className="text-xs text-slate-400">The payslip has been generated and emailed successfully to the employee.</p>
                </div>

                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Email Sent To</p>
                      <p className="text-sm font-bold text-slate-700">{modalData.emailSentTo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Delivery Status</p>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-2xs font-extrabold uppercase text-emerald-600 tracking-wider inline-block mt-0.5">
                        {modalData.status}
                      </span>
                    </div>
                  </div>

                  {modalData.previewUrl && (
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <FileText size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Preview Document</p>
                        <a
                          href={getFullAssetUrl(modalData.previewUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition overflow-hidden text-overflow-ellipsis whitespace-nowrap"
                        >
                          Download / View PDF <ExternalLink size={12} className="shrink-0" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-slate-800 shadow-sm cursor-pointer"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Payslip Document Container */}
      <div ref={printableRef} className="printable-sheet-container mx-auto flex flex-col gap-8 max-w-[800px] multipage-print">
        {displaySalaryPages.map((page, pageIndex) => (
          <div
            key={pageIndex}
            className="printable-sheet relative flex w-full min-h-[296mm] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl text-gray-800 box-border"
            style={{ padding: 0 }}
          >
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
            <div className="relative z-10 flex flex-1 flex-col gap-2" style={{ padding: '32px 44px 130px 44px' }}>
              {/* Title / Cycle Block */}
              <div className="flex flex-row justify-between items-center mb-4 pb-2 border-b border-slate-200">
                <h3 className="text-[13.5px] font-extrabold uppercase tracking-wider text-gray-900">
                  PAYSLIP CERTIFICATE
                </h3>
                <p className="text-[12px] font-bold text-pink-600">
                  Cycle: {formatMonthValue(month)}
                </p>
              </div>

              {/* Employee Info */}
              {page.isFirstPage && (
                <div className="mb-4 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs md:grid-cols-2">
                  <div>
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr>
                          <td className="py-1 text-slate-500 font-medium">Employee Name:</td>
                          <td className="py-1 font-bold text-slate-900">
                            {employee.fullName || employee.name || '—'}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 text-slate-500 font-medium">Employee ID:</td>
                          <td className="py-1 font-semibold text-slate-700">
                            {employee.employeeId || employee.id || '—'}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 text-slate-500 font-medium">Designation:</td>
                          <td className="py-1 text-slate-700">
                            {employee.designation || '—'}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 text-slate-500 font-medium">Department:</td>
                          <td className="py-1 text-slate-700">
                            {employee.department || employee.dept || '—'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t border-slate-200 pt-3 md:border-l md:border-t-0 md:pl-4 md:pt-0">
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr>
                          <td className="py-1 text-slate-500 font-medium">Bank Account:</td>
                          <td className="py-1 font-semibold text-slate-700">
                            {employee.bankName
                              ? `${employee.bankName}${employee.accountNumber ? ' · *****' + String(employee.accountNumber).slice(-4) : ''}`
                              : employee.accountNumber
                              ? `*****${String(employee.accountNumber).slice(-4)}`
                              : 'N/A'}
                          </td>
                        </tr>
                        {employee.ifscCode && (
                          <tr>
                            <td className="py-1 text-slate-500 font-medium">IFSC Code:</td>
                            <td className="py-1 text-slate-700">{employee.ifscCode}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="py-1 text-slate-500 font-medium">PF Number:</td>
                          <td className="py-1 text-slate-700">{employee.pfNumber || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-slate-500 font-medium">Days in Month:</td>
                          <td className="py-1 text-slate-700">
                            {getDaysInMonth(month)} Days
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 text-slate-500 font-medium">Worked Days:</td>
                          <td className="py-1 font-semibold text-emerald-600">
                            {getDaysInMonth(month)} Days (0 LOP)
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Salary Table */}
              <div className="overflow-x-auto mb-4 p-[1px]">
                <table className="w-full border border-slate-200 text-xs">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="border-r border-slate-200 px-3 py-2 text-left text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        Earnings
                      </th>
                      <th className="border-r border-slate-200 px-3 py-2 text-right text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        Amount (₹)
                      </th>
                      <th className="border-r border-slate-200 px-3 py-2 text-left text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        Deductions
                      </th>
                      <th className="px-3 py-2 text-right text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        Amount (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.rows.map((row, rIndex) => {
                      const earningItem = row.earning;
                      const deductionItem = row.deduction;
                      return (
                        <tr key={rIndex} className="border-b border-slate-200">
                          <td className="border-r border-slate-200 px-3 py-2 text-slate-600">
                            {earningItem ? earningItem.label : ''}
                          </td>
                          <td className="border-r border-slate-200 px-3 py-2 text-right font-medium">
                            {earningItem && earningItem.amount !== '' ? Number(earningItem.amount).toLocaleString("en-IN") : ''}
                          </td>
                          <td className="border-r border-slate-200 px-3 py-2 text-slate-600">
                            {deductionItem ? deductionItem.label : ''}
                          </td>
                          <td className="px-3 py-2 text-right text-rose-600 font-medium">
                            {deductionItem && deductionItem.amount !== '' ? Number(deductionItem.amount).toLocaleString("en-IN") : ''}
                          </td>
                        </tr>
                      );
                    })}
                    {page.isLastPage && (
                      <tr className="border-b border-slate-200 bg-slate-50 font-bold">
                        <td className="border-r border-slate-200 px-3 py-2 text-slate-800">
                          Total Gross Earnings
                        </td>
                        <td className="border-r border-slate-200 px-3 py-2 text-right text-pink-700">
                          {gross.toLocaleString("en-IN")}
                        </td>
                        <td className="border-r border-slate-200 px-3 py-2 text-slate-800">
                          Total Deductions
                        </td>
                        <td className="px-3 py-2 text-right text-rose-600">
                          {totalDeductions.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Net Salary */}
              {page.isLastPage && (
                <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-xl border border-pink-200 bg-pink-50/30 p-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-pink-700">
                      Net Take-Home Salary
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">In Words:</span>{" "}
                      {numberToRupeesWords(netPay)}
                    </p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-black tracking-tight text-pink-700">
                      ₹{netPay.toLocaleString("en-IN")}
                    </h2>
                  </div>
                </div>
              )}

              {/* Signature & Bottom Details */}
              {page.isLastPage ? (
                <div className="mt-auto flex flex-col print:flex-row justify-between gap-4 border-t border-dashed border-slate-200 pt-3 text-[10px] text-slate-500 md:flex-row md:items-center print:items-center">
                  <div>
                    📍 Mode of Payment: Direct Corporate Bank Transfer (NEFT)
                    <br />
                    ⚠️ Digitally approved computer-generated payslip.
                  </div>
                  <div className="rotate-[-4deg] rounded-md border border-emerald-250 px-3 py-1 font-bold uppercase tracking-wider text-emerald-700 text-[10px] bg-white w-fit self-end md:self-auto print:self-auto shrink-0 shadow-sm">
                    PAID BY {companyName}
                  </div>
                </div>
              ) : (
                <div className="mt-auto text-[10px] text-slate-400 text-right">
                  Continued on next page...
                </div>
              )}
            </div>

            {/* FIXED FOOTER */}
            <LetterheadFooter settings={letterheadSettings} />
          </div>
        ))}
      </div>
    </div>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import html2pdf from 'html2pdf.js'
import { ArrowLeft, Printer, RefreshCw, CheckCircle2, X, Mail, FileText, ExternalLink } from 'lucide-react'
import { PrimaryBtn, OutlineBtn } from '../ui'
import { fetchProfile } from '../../redux/actions/authActions'
import { CompanyPayslip } from '../../redux/actions/companyAction'
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

export default function SalarySlip({ onBack }) {
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

  // Company info from API (read-only)
  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')

  // Modal / generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState({ emailSentTo: '', previewUrl: '', status: '' })
  const [modalError, setModalError] = useState('')

  // Ref to the printable document
  const printableRef = useRef(null)

  // Sync company details from Redux profile
  useEffect(() => {
    if (user) {
      if (user.fullName) setCompanyName(user.fullName.toUpperCase())
      if (user.address) setCompanyAddress(user.address)
    }
  }, [user])

  const employee = employees.find(e => (e.employeeId || e.id) === selectedId) || employees[0]
  if (employees.length > 0 && !employee) return <div>No employee records available.</div>
  if (!employee) return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading team data…</div>

  // Salary breakdown
  const sal = employee.salary || employee.salaryAmount || 25000
  const basic = Math.round(sal * 0.50)
  const hra = Math.round(sal * 0.20)
  const da = Math.round(sal * 0.05)
  const allowances = Math.round(sal * 0.05)
  const gross = Math.round(sal * 0.80)
  const pf = Math.round(sal * 0.12)
  const esi = Math.round(sal * 0.0075)
  const tds = Math.round(sal * 0.05)
  const totalDeductions = pf + esi + tds
  const netPay = gross - totalDeductions

  const handlePrint = () => window.print()

  const handleGenerate = async () => {
    const empEmail = employee.email
    if (!empEmail || !empEmail.includes('@')) {
      setModalError('No valid email found for this employee. Please update the employee\'s email in the system.')
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

      const empName = employee.fullName || employee.name || 'employee'
      const formattedMonth = formatMonthValue(month)
      const fileName = `payslip_${empName.replace(/\s+/g, '_').toLowerCase()}_${formattedMonth.replace(/\s+/g, '_')}_${Date.now()}.pdf`

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
              sheet.style.paddingTop = '24px';
              sheet.style.paddingBottom = '24px';
              sheet.style.boxSizing = 'border-box';
              sheet.style.borderRadius = '0px';
              sheet.style.border = 'none';
              sheet.style.boxShadow = 'none';
              sheet.style.overflow = 'hidden';
            }
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Generate PDF as a blob
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
      if (originalWindowGetComputedStyle) {
        window.getComputedStyle = originalWindowGetComputedStyle;
      }
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 document-page-container">
  {/* Control Panel */}
  <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
    
    <div className="flex flex-wrap items-center gap-4">
      
      <OutlineBtn
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 text-sm"
      >
        <ArrowLeft size={16} />
        Back to Hub
      </OutlineBtn>

      <div className="hidden h-6 w-px bg-gray-200 md:block"></div>

      {/* Employee Select */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-gray-500">
          Employee:
        </label>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-gray-500">
          Payslip Cycle:
        </label>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
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
          className={isGenerating ? "animate-spin" : ""}
        />

        {isGenerating ? "Generating..." : "Generate & Send Payslip"}
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

  {/* Success / Error Modal */}
  {showModal && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
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
              <h3 className="text-lg font-black text-gray-900">Payslip Dispatched!</h3>
              <p className="text-xs text-gray-500">The payslip has been emailed successfully to the employee.</p>
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

  {/* Payslip Document */}
  <div
    ref={printableRef}
    className="printable-sheet mx-auto max-w-4xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg md:p-12"
  >
    
    {/* Header */}
    <div className="mb-6 flex flex-col justify-between gap-4 border-b-2 border-gray-200 pb-4 md:flex-row">
      
      <div className="flex items-start gap-4">
        
        {logoSrc ? (
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
            <img
              crossOrigin="anonymous"
              src={logoSrc}
              alt="Logo"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-600 text-2xl">
            🔬
          </div>
        )}

        <div>
          <h1 className="text-lg font-extrabold uppercase tracking-wide text-emerald-800">
            {companyName || "Company Name"}
          </h1>

          {companyAddress && (
            <p className="mt-1 max-w-sm text-xs text-gray-500">
              {companyAddress}
            </p>
          )}

          {user?.adminReferenceCode && (
            <p className="mt-1 text-[11px] font-semibold text-gray-400">
              Code: {user.adminReferenceCode}
            </p>
          )}
        </div>
      </div>

      <div className="text-right">
        <h2 className="text-lg font-extrabold text-gray-900">
          PAYSLIP CERTIFICATE
        </h2>

        <p className="mt-1 text-sm font-semibold text-emerald-600">
          Cycle: {formatMonthValue(month)}
        </p>
      </div>
    </div>

    {/* Employee Info */}
    <div className="mb-6 grid gap-6 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm md:grid-cols-2">
      
      <div>
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="py-1 text-gray-500">Employee Name:</td>
              <td className="py-1 font-bold text-gray-900">
                {employee.fullName || employee.name}
              </td>
            </tr>

            <tr>
              <td className="py-1 text-gray-500">Employee ID:</td>
              <td className="py-1 font-semibold text-gray-700">
                {employee.employeeId || employee.id}
              </td>
            </tr>

            <tr>
              <td className="py-1 text-gray-500">Designation:</td>
              <td className="py-1 text-gray-700">
                {employee.designation}
              </td>
            </tr>

            <tr>
              <td className="py-1 text-gray-500">Department:</td>
              <td className="py-1 text-gray-700">
                {employee.department || employee.dept}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="py-1 text-gray-500">Bank Account:</td>
              <td className="py-1 font-semibold text-gray-700">
                HDFC Bank · *******4820
              </td>
            </tr>

            <tr>
              <td className="py-1 text-gray-500">PF Number:</td>
              <td className="py-1 text-gray-700">
                10098273
              </td>
            </tr>

            <tr>
              <td className="py-1 text-gray-500">Days in Month:</td>
              <td className="py-1 text-gray-700">
                {getDaysInMonth(month)} Days
              </td>
            </tr>

            <tr>
              <td className="py-1 text-gray-500">Worked Days:</td>
              <td className="py-1 font-semibold text-emerald-600">
                {getDaysInMonth(month)} Days (0 LOP)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {/* Salary Table */}
    <div className="overflow-x-auto">
      <table className="mb-6 w-full border border-gray-200 text-sm">
        
        <thead className="bg-gray-100">
          <tr className="border-b border-gray-200">
            <th className="border-r border-gray-200 px-4 py-3 text-left">
              Earnings
            </th>

            <th className="border-r border-gray-200 px-4 py-3 text-right">
              Amount (₹)
            </th>

            <th className="border-r border-gray-200 px-4 py-3 text-left">
              Deductions
            </th>

            <th className="px-4 py-3 text-right">
              Amount (₹)
            </th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-b border-gray-200">
            <td className="border-r border-gray-200 px-4 py-3 text-gray-600">
              Basic Salary
            </td>

            <td className="border-r border-gray-200 px-4 py-3 text-right font-medium">
              {basic.toLocaleString("en-IN")}
            </td>

            <td className="border-r border-gray-200 px-4 py-3 text-gray-600">
              Provident Fund (PF)
            </td>

            <td className="px-4 py-3 text-right text-red-600">
              {pf.toLocaleString("en-IN")}
            </td>
          </tr>

          <tr className="border-b border-gray-200">
            <td className="border-r border-gray-200 px-4 py-3 text-gray-600">
              House Rent Allowance
            </td>

            <td className="border-r border-gray-200 px-4 py-3 text-right font-medium">
              {hra.toLocaleString("en-IN")}
            </td>

            <td className="border-r border-gray-200 px-4 py-3 text-gray-600">
              ESI Contribution
            </td>

            <td className="px-4 py-3 text-right text-red-600">
              {esi.toLocaleString("en-IN")}
            </td>
          </tr>

          <tr className="border-b border-gray-200 bg-gray-50 font-bold">
            <td className="border-r border-gray-200 px-4 py-3">
              Total Gross Earnings
            </td>

            <td className="border-r border-gray-200 px-4 py-3 text-right text-emerald-700">
              {gross.toLocaleString("en-IN")}
            </td>

            <td className="border-r border-gray-200 px-4 py-3">
              Total Deductions
            </td>

            <td className="px-4 py-3 text-right text-red-600">
              {totalDeductions.toLocaleString("en-IN")}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* Net Salary */}
    <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-green-200 bg-green-50 p-5 md:flex-row md:items-center">
      
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Net Take-Home Salary
        </p>

        <p className="mt-2 text-sm text-gray-600">
          <span className="font-semibold">In Words:</span>{" "}
          {numberToRupeesWords(netPay)}
        </p>
      </div>

      <div className="text-right">
        <h2 className="text-3xl font-black tracking-tight text-emerald-700">
          ₹{netPay.toLocaleString("en-IN")}
        </h2>
      </div>
    </div>

    {/* Footer */}
    <div className="mt-4 flex flex-col justify-between gap-4 border-t border-dashed border-gray-300 pt-4 text-xs text-gray-400 md:flex-row md:items-center">
      
      <div>
        📍 Mode of Payment: Direct Corporate Bank Transfer (NEFT)
        <br />
        ⚠️ Digitally approved computer-generated payslip.
      </div>

      <div className="rotate-[-4deg] rounded-md border border-emerald-200 px-3 py-1 font-bold uppercase tracking-wide text-emerald-600">
        PAID · {user?.adminReferenceCode || "GPHR"}
      </div>
    </div>
  </div>
</div>
  )
}

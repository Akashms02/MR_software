import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import html2pdf from 'html2pdf.js'
import { ArrowLeft, Printer, RefreshCw, CheckCircle2, X, ExternalLink, Mail, FileText } from 'lucide-react'
import { PrimaryBtn, OutlineBtn } from '../ui'
import { fetchProfile } from '../../redux/actions/authActions'
import { CompanyOfferLetter, CompanyRoles, CompanyDepartments } from '../../redux/actions/companyAction'
import { getMyTeam } from '../../redux/actions/teamActions'
import { getFullAssetUrl, inlineDocumentImages, useCompanyBrandAssets } from '../../utils/getFullAssetUrl'

// Base64 SVG images render reliably in html2canvas/html2pdf (inline SVG often does not)
const OFFER_THEME_SVG = {
  topGold:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOTUiIGhlaWdodD0iODYiIHZpZXdCb3g9IjAgMCAyOTUgODYiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0gMCAwIEwgMjk1IDAgTCAyOTUgODYgWiIgZmlsbD0iI2Q5NzcwNiIvPjwvc3ZnPg==',
  topGreen:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyODAgODAiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0gMCAwIEwgMjgwIDAgTCAyODAgODAgWiIgZmlsbD0iIzE2NjUzNCIvPjwvc3ZnPg==',
  bottomGold:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTSAwIDM1IEwgMTAwIDAgTCAxMDAgMTAwIEwgMCAxMDAgWiIgZmlsbD0iI2Q5NzcwNiIvPjwvc3ZnPg==',
  bottomGreen:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTSAwIDQ1IEwgMTAwIDAgTCAxMDAgMTAwIEwgMCAxMDAgWiIgZmlsbD0iIzE2NjUzNCIvPjwvc3ZnPg==',
};

const offerLetterDateClass =
  'relative z-[60] shrink-0 self-start pt-2 ml-auto mr-[100px] text-right text-sm font-semibold text-gray-900 bg-white/95 px-2 py-1 rounded';

const offerLetterCompanyNameClass =
  'font-serif text-sm font-black uppercase leading-none tracking-wide whitespace-nowrap';

function OfferLetterThemeDecorations({ bottomWidth = '100%' }) {
  const bottomBase = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    userSelect: 'none',
    pointerEvents: 'none',
    width: bottomWidth,
  };

  return (
    <>
      <img
        src={OFFER_THEME_SVG.topGold}
        alt=""
        className="offer-theme-decor"
        style={{ position: 'absolute', top: 0, right: 0, zIndex: 40, width: '295px', height: '86px' }}
      />
      <img
        src={OFFER_THEME_SVG.topGreen}
        alt=""
        className="offer-theme-decor"
        style={{ position: 'absolute', top: 0, right: 0, zIndex: 50, width: '280px', height: '80px' }}
      />
      <img
        src={OFFER_THEME_SVG.bottomGold}
        alt=""
        className="offer-theme-decor offer-theme-bottom"
        data-decor-position="bottom"
        style={{ ...bottomBase, zIndex: 40, height: '47px' }}
        height="47"
      />
      <img
        src={OFFER_THEME_SVG.bottomGreen}
        alt=""
        className="offer-theme-decor offer-theme-bottom"
        data-decor-position="bottom"
        style={{ ...bottomBase, zIndex: 50, height: '40px' }}
        height="40"
      />
    </>
  );
}

const waitForImages = async (rootEl, { timeoutMs = 4000 } = {}) => {
  if (!rootEl) return;

  const imgs = Array.from(rootEl.querySelectorAll('img'));
  if (imgs.length === 0) return;

  const waitOne = (img) =>
    new Promise((resolve) => {
      if (img.complete && img.naturalWidth > 0) return resolve();

      let settled = false;
      const cleanup = () => {
        if (settled) return;
        settled = true;
        img.removeEventListener('load', onDone);
        img.removeEventListener('error', onDone);
        resolve();
      };
      const onDone = () => cleanup();

      img.addEventListener('load', onDone, { once: true });
      img.addEventListener('error', onDone, { once: true });

      // Avoid hanging forever on slow/broken assets
      window.setTimeout(cleanup, timeoutMs);
    });

  await Promise.all(imgs.map(waitOne));
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

export default function OfferLetter({ onBack }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { team: employees = [] } = useSelector((state) => state.team);
  const { getRoles = [], getDepartments = [] } = useSelector((state) => state.company);
  const { logoSrc, stampSrc } = useCompanyBrandAssets(user);

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
  const pdfPrintRef = useRef(null)

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

    let originalWindowGetComputedStyle = null;
    let captureRoot = null;

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

      captureRoot = printableRef.current
      if (!captureRoot) throw new Error('Document preview not ready. Please try again.')

      const sheets = captureRoot.querySelectorAll('.printable-sheet')
      if (sheets.length === 0) throw new Error('No printable pages found.')

      await document.fonts.ready
      await inlineDocumentImages(captureRoot)
      await waitForImages(captureRoot)
      await new Promise((resolve) => setTimeout(resolve, 120))

      const fileName = `offer_letter_${candidateName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.pdf`

      const applyColorFixesInClone = (clonedDoc) => {
        clonedDoc.querySelectorAll('style').forEach((styleTag) => {
          if (styleTag.textContent) {
            styleTag.textContent = resolveModernColors(styleTag.textContent)
          }
        })

        if (clonedDoc.defaultView) {
          const origGCS = clonedDoc.defaultView.getComputedStyle
          clonedDoc.defaultView.getComputedStyle = function (el, pseudo) {
            const s = origGCS.call(clonedDoc.defaultView, el, pseudo)
            return new Proxy(s, {
              get(target, prop) {
                if (prop === 'getPropertyValue') {
                  return function (key) {
                    const val = target.getPropertyValue(key)
                    if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                      try { return resolveModernColors(val) } catch { return val }
                    }
                    return val
                  }
                }
                const val = target[prop]
                if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                  try { return resolveModernColors(val) } catch { return val }
                }
                if (typeof val === 'function') return val.bind(target)
                return val
              }
            })
          }
        }

        const colorProps = [
          'color', 'backgroundColor', 'borderColor',
          'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
          'fill', 'stroke', 'backgroundImage', 'boxShadow'
        ]

        const allElements = clonedDoc.getElementsByTagName('*')
        for (let j = 0; j < allElements.length; j++) {
          const el = allElements[j]
          const computed = clonedDoc.defaultView
            ? clonedDoc.defaultView.getComputedStyle(el)
            : window.getComputedStyle(el)
          colorProps.forEach((prop) => {
            const val = computed[prop]
            if (val && typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
              try { el.style[prop] = resolveModernColors(val) } catch (_) {}
            }
          })
        }

        const clonedContainer = clonedDoc.querySelector('.printable-sheet-container')
        if (clonedContainer) {
          clonedContainer.classList.add('generating-pdf')
          clonedContainer.style.display = 'block'
          clonedContainer.style.gap = '0'
          clonedContainer.style.margin = '0'
          clonedContainer.style.padding = '0'
          clonedContainer.style.width = '210mm'
          clonedContainer.style.maxWidth = '210mm'
        }

        clonedDoc.querySelectorAll('.printable-sheet').forEach((sheet) => {
          sheet.style.width = '210mm'
          sheet.style.height = '297mm'
          sheet.style.minHeight = '297mm'
          sheet.style.maxHeight = '297mm'
          sheet.style.margin = '0'
          sheet.style.borderRadius = '0'
          sheet.style.border = 'none'
          sheet.style.boxShadow = 'none'
          sheet.style.overflow = 'hidden'
          sheet.style.boxSizing = 'border-box'
          sheet.style.background = '#ffffff'
        })

        clonedDoc.querySelectorAll('.offer-theme-bottom').forEach((img) => {
          img.style.width = '794px'
          img.setAttribute('width', '794')
        })

        clonedDoc.querySelectorAll('.printable-sheet svg, .printable-sheet img').forEach((el) => {
          const widthAttr = el.getAttribute('width')
          if (widthAttr === '100%' || el.style.width === '100%') {
            el.setAttribute('width', '794')
            el.style.width = '794px'
          }
          el.style.display = 'block'
          el.style.visibility = 'visible'
        })
      }

      captureRoot.classList.add('generating-pdf')

      const opt = {
        margin: [0, 0, 0, 0],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          letterRendering: true,
          imageTimeout: 15000,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => applyColorFixesInClone(clonedDoc)
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], before: '.html2pdf__page-break' }
      }

      const pdfBlob = await html2pdf().set(opt).from(captureRoot).output('blob')

      const formData = new FormData()
      formData.append('email', email)
      formData.append('file', pdfBlob, fileName)

      const res = await dispatch(CompanyOfferLetter(formData))

      if (res?.data) {
        setModalData({
          emailSentTo: res.data.emailSentTo || email,
          previewUrl: res.data.previewUrl || res.data.offerLetterPDF || '',
          status: res.data.status || 'SENT'
        })
        setModalError('')
        setShowModal(true)
      } else {
        setModalError(res?.message || 'Failed to generate offer letter. Please try again.')
        setShowModal(true)
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'An unexpected error occurred.')
      setShowModal(true)
    } finally {
      if (captureRoot) {
        captureRoot.classList.remove('generating-pdf')
      }
      if (originalWindowGetComputedStyle) {
        window.getComputedStyle = originalWindowGetComputedStyle
      }
      setIsGenerating(false);
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

      {/* Live Document Sheet View (2-Page Stacked Print View) */}
      <div
        ref={printableRef}
        className="printable-sheet-container mx-auto flex flex-col gap-8 max-w-[800px] multipage-print"
      >
        {/* PAGE 1: Formal Offer Letter */}
        <div
          className="printable-sheet relative flex w-full min-h-[297mm] flex-col justify-between overflow-hidden rounded-lg border border-gray-200 bg-white px-12 md:px-16 pt-12 md:pt-14 pb-4 md:pb-6 shadow-xl leading-relaxed text-gray-800 box-border"
        >
          <OfferLetterThemeDecorations />

          {/* Main content wrapper containing header, body and signature block */}
          <div className="relative z-10 flex flex-1 flex-col gap-2 md:gap-3">
            {/* Letterhead Header */}
            <div className="mb-4 flex flex-row justify-between items-start gap-4">
              {/* Logo & Brand */}
              <div className="flex min-w-0 flex-1 items-center gap-3.5 pr-3">
                {logoSrc ? (
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
                    <img crossOrigin="anonymous" src={logoSrc} alt="Logo" className="max-h-full max-w-full object-contain" />
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
                  <div className={offerLetterCompanyNameClass} style={{ color: '#166534' }}>
                    {companyName}
                  </div>
                </div>
              </div>

              {/* Document Date — offset from top-right theme wedge */}
              <div className={offerLetterDateClass}>
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
                We are pleased to offer you employment in the capacity of <strong>{designation}</strong>, in <strong>{department}</strong> in M/s. <strong>{companyName}</strong>, {companyRegAddress}.
              </p>

              <p className="margin-0">
                Please report to duty <strong>on or before {formatDateIN(joiningDate)}</strong>. Your base location will be <strong>{baseLocation}</strong>. You will be governed by the policies of the Company. Please be noted that if you fail to report on or before the said date, this offer will cease to exist.
              </p>

              <p className="margin-0">
                We believe that your skills and background would be a valuable asset to our organization.
              </p>

              <p className="margin-0 font-bold">
                Your monthly and annual consolidated compensation structure is detailed in the attached **Annexure A** of this offer letter.
              </p>

              <p className="margin-0">
                On your joining date, please bring/send (<strong>{hrEmail}</strong>) the following documents: A) 2 Passport size photographs. B) Photocopy of all Educational and Technical Qualification Certificates. C) Relieving Letter and Experience Certificate from your present employer. D) Last drawn Salary Slip/Certificate showing monthly salary and annual benefits from the present employer, PAN card, Aadhar card, Driving License copy, etc.
              </p>

              <p className="margin-0">
                This is a provisional offer letter. The detailed letter with terms and conditions of employment will be handed over to you on your joining date.
              </p>

              <p className="mt-1">
                We look forward to your joining the company and becoming a productive member of the team.<br />
                <strong>Welcome to {companyName},</strong>
              </p>
            </div>

            {/* Signatures Footer */}
            <div className="signature-block mt-auto flex flex-row items-end justify-between pt-6 text-xs text-gray-800">
              <div>
                <div className="font-bold">Yours Sincerely,</div>
                <div className="mb-6 text-[10px] font-black uppercase text-gray-900">for {companyName},</div>

                {/* Stamp Image if configured, fallback to Simulated Sign */}
                {stampSrc ? (
                  <div className="mb-1 flex h-14 items-center">
                    <img crossOrigin="anonymous" src={stampSrc} alt="Stamp" className="max-h-full object-contain" />
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
            </div>
          </div>

          {/* Letter Footer Address - Rendered as flex child below content, ensuring zero overlap */}
          <div className="relative z-30 mt-6 border-t border-gray-100 pt-3 pb-12 text-center text-[10px] leading-relaxed text-gray-500">
            <div className="mb-0.5 font-sans text-sm font-black uppercase tracking-widest text-amber-700" style={{ color: '#b45309' }}>
              {companyName}
            </div>
            <div>
              Regd. Office: {companyRegAddress}
            </div>
            <div className="font-bold text-gray-600" style={{ color: '#4b5563' }}>
              {user?.phone && `Ph: ${user.phone} | `}Email: {hrEmail}
            </div>
          </div>
        </div>

        {/* Page Break for html2pdf rendering */}
        <div className="html2pdf__page-break"></div>

        {/* PAGE 2: Annexure A (Salary Table & Terms) */}
        <div
          className="printable-sheet relative flex w-full min-h-[297mm] flex-col justify-between overflow-hidden rounded-lg border border-gray-200 bg-white px-12 md:px-16 pt-12 md:pt-14 pb-4 md:pb-6 shadow-xl leading-relaxed text-gray-800 box-border"
        >
          <OfferLetterThemeDecorations />

          <div className="relative z-10 flex flex-1 flex-col gap-2 md:gap-3">
            {/* Annexure Header */}
            <div className="mb-4 flex flex-row justify-between items-start gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-3.5 pr-3">
                {logoSrc ? (
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
                    <img crossOrigin="anonymous" src={logoSrc} alt="Logo" className="max-h-full max-w-full object-contain" />
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
                  <div className={offerLetterCompanyNameClass} style={{ color: '#166534' }}>
                    {companyName}
                  </div>
                </div>
              </div>
              <div className={offerLetterDateClass}>
                Date: {formatDateIN(joiningDate)}
              </div>
            </div>

            <div className="text-center text-sm font-extrabold uppercase tracking-wider text-gray-900 underline mb-2">
              Annexure A: Compensation & Allowances Structure
            </div>

            {/* Candidate & Designation Details */}
            <div className="mb-4 grid grid-cols-2 gap-3 text-xs bg-gray-50 border border-gray-100 rounded-lg p-3">
              <div>
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Employee Name:</span>
                <span className="block font-extrabold text-gray-800">{candidateName}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Designation / Role:</span>
                <span className="block font-extrabold text-gray-800">{designation}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Department:</span>
                <span className="block font-semibold text-gray-700">{department}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Base Work Location:</span>
                <span className="block font-semibold text-gray-700">{baseLocation}</span>
              </div>
            </div>

            {/* Compensation Table */}
            <div className="mb-4">
              <div className="font-bold text-xs text-gray-800 mb-1.5 uppercase tracking-wide">A. Monthly Salary Breakdown</div>
              <table className="w-full border-collapse border border-gray-200 text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left font-bold text-gray-700">Salary Component</th>
                    <th className="border border-gray-200 px-4 py-2 text-right font-bold text-gray-700">Percentage</th>
                    <th className="border border-gray-200 px-4 py-2 text-right font-bold text-gray-700">Monthly Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-gray-600">Basic Salary</td>
                    <td className="border border-gray-200 px-4 py-2 text-right text-gray-600">50%</td>
                    <td className="border border-gray-200 px-4 py-2 text-right font-semibold text-gray-800">₹{Math.round(salaryAmount * 0.50).toLocaleString('en-IN')}/-</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-gray-600">House Rent Allowance (HRA)</td>
                    <td className="border border-gray-200 px-4 py-2 text-right text-gray-600">20%</td>
                    <td className="border border-gray-200 px-4 py-2 text-right font-semibold text-gray-800">₹{Math.round(salaryAmount * 0.20).toLocaleString('en-IN')}/-</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-gray-600">Special & Conveyance Allowance</td>
                    <td className="border border-gray-200 px-4 py-2 text-right text-gray-600">30%</td>
                    <td className="border border-gray-200 px-4 py-2 text-right font-semibold text-gray-800">₹{Math.round(salaryAmount * 0.30).toLocaleString('en-IN')}/-</td>
                  </tr>
                  <tr className="bg-emerald-50 font-bold">
                    <td className="border border-gray-200 px-4 py-2 text-emerald-800">Gross Monthly Salary</td>
                    <td className="border border-gray-200 px-4 py-2 text-right text-emerald-800">100%</td>
                    <td className="border border-gray-200 px-4 py-2 text-right text-emerald-800">₹{Number(salaryAmount).toLocaleString('en-IN')}/-</td>
                  </tr>
                </tbody>
              </table>
              <div className="text-[10px] text-gray-500 font-semibold mt-1">
                * Consolidated Salary: <strong>₹{Number(salaryAmount).toLocaleString('en-IN')}/- per month ({salaryWords} Only)</strong>.
              </div>
            </div>

            {/* Field Allowances Table */}
            <div className="mb-4">
              <div className="font-bold text-xs text-gray-800 mb-1.5 uppercase tracking-wide">B. Field Work Allowances & Conveyance</div>
              <table className="w-full border-collapse border border-gray-200 text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left font-bold text-gray-700">Allowance Parameter</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-bold text-gray-700">Description / Rates</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-gray-600">HQ Allowance</td>
                    <td className="border border-gray-200 px-4 py-2 text-gray-800 font-semibold">₹{hqAllowance}/- per day</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-gray-600">Ex-Station Allowance</td>
                    <td className="border border-gray-200 px-4 py-2 text-gray-800 font-semibold">₹{exStationAllowance}/- per day</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-gray-600">Out-Station Allowance</td>
                    <td className="border border-gray-200 px-4 py-2 text-gray-800 font-semibold">₹{outStationAllowance}/- per day</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-gray-600">Conveyance Rate per KM</td>
                    <td className="border border-gray-200 px-4 py-2 text-gray-800 font-semibold">₹{conveyanceRate}/- per KM for Ex-station and Out-station work</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Reporting & Acceptance Rules */}
            <div className="text-[11px] leading-normal text-gray-800 border-l-4 border-amber-500 pl-3 py-1 bg-amber-50/50 rounded-r-lg mb-2">
              <strong>Reporting & Acceptance:</strong> You will report to <strong>{reportingManager} ({reportingPhone})</strong>. Please confirm your formal acceptance on or before <strong>{formatDateIN(joiningDate)}</strong>.
            </div>

            {/* Signature Blocks */}
            <div className="signature-block mt-auto flex flex-row items-end justify-between pt-6 text-xs text-gray-800">
              <div>
                <div className="font-bold">Yours Sincerely,</div>
                <div className="mb-4 text-[10px] font-black uppercase text-gray-900">for {companyName},</div>

                {stampSrc ? (
                  <div className="mb-1 flex h-12 items-center">
                    <img crossOrigin="anonymous" src={stampSrc} alt="Stamp" className="max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="mb-0.5 h-6 select-none font-serif text-lg font-bold text-blue-900 rotate-[-4deg] translate-x-2">
                    {hrHeadName}
                  </div>
                )}
                <div className="mb-1 w-36 border-t border-gray-400"></div>
                <div className="text-[10px] font-black uppercase text-gray-950">{hrHeadName}</div>
                <div className="text-[9px] font-semibold text-gray-500">{hrHeadDesignation}</div>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="font-bold mb-8">Candidate Acceptance Signature</div>
                <div className="mb-1 w-40 border-t border-gray-400"></div>
                <div className="text-[10px] font-black uppercase tracking-wide text-gray-950">{candidateName}</div>
                <div className="text-[9px] font-semibold text-gray-500">Date: ________________</div>
              </div>
            </div>
          </div>

          {/* Letter Footer Address */}
          <div className="relative z-30 mt-6 border-t border-gray-100 pt-3 pb-12 text-center text-[10px] leading-relaxed text-gray-500">
            <div className="mb-0.5 font-sans text-sm font-black uppercase tracking-widest text-amber-700" style={{ color: '#b45309' }}>
              {companyName}
            </div>
            <div>
              Regd. Office: {companyRegAddress}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden PDF template container */}
      <div
        ref={pdfPrintRef}
        className="no-print"
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '794px',
          pointerEvents: 'none',
          zIndex: -1000
        }}
      >
        {/* PAGE 1: Formal Offer Letter */}
        <div
          className="printable-sheet relative flex flex-col justify-between overflow-hidden bg-white text-gray-800"
          style={{
            width: '794px',
            height: '1123px',
            minHeight: '1123px',
            maxHeight: '1123px',
            paddingLeft: '64px',
            paddingRight: '64px',
            paddingTop: '56px',
            paddingBottom: '24px',
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          <OfferLetterThemeDecorations bottomWidth="794px" />

          {/* Main content wrapper */}
          <div className="relative z-10 flex flex-1 flex-col justify-start gap-2.5">
            {/* Letterhead Header */}
            <div className="mb-3 flex flex-row justify-between items-start gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-3.5 pr-3">
                {logoSrc ? (
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
                    <img crossOrigin="anonymous" src={logoSrc} alt="Logo" className="max-h-full max-w-full object-contain" />
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
                  <div className={offerLetterCompanyNameClass} style={{ color: '#166534' }}>
                    {companyName}
                  </div>
                </div>
              </div>
              <div className={offerLetterDateClass}>
                Date: {formatDateIN(joiningDate)}
              </div>
            </div>

            {/* Recipient Block */}
            <div className="mb-3 text-xs leading-normal text-gray-800">
              <div className="font-bold">To,</div>
              <div className="mt-0.5 text-[13px] font-extrabold uppercase tracking-wide text-gray-900">{candidateName}</div>
              <div className="mt-0.5">S/o {parentName} {addressLine1}</div>
              {addressLine2 && <div>{addressLine2}</div>}
              <div>{addressLine3}</div>
              {mobile && <div>Mobile: {mobile}</div>}
              {email && <div>Email: {email}</div>}
            </div>

            {/* Salutation */}
            <div className="mb-1 text-xs font-bold text-gray-800">
              Dear Mr. {candidateName.split(' ')[0]},
            </div>

            {/* Subject Header */}
            <div className="mb-3 text-center text-xs font-extrabold uppercase tracking-wider text-gray-900 underline">
              Sub: Offer Letter
            </div>

            {/* Body Paragraphs */}
            <div className="flex flex-col gap-2.5 text-justify text-xs leading-normal text-gray-800 font-medium">
              <p className="margin-0 indent-8">
                We are pleased to offer you employment in the capacity of <strong>{designation}</strong>, in <strong>{department}</strong> in M/s. <strong>{companyName}</strong>, {companyRegAddress}.
              </p>
              <p className="margin-0">
                Please report to duty <strong>on or before {formatDateIN(joiningDate)}</strong>. Your base location will be <strong>{baseLocation}</strong>. You will be governed by the policies of the Company. Please be noted that if you fail to report on or before the said date, this offer will cease to exist.
              </p>
              <p className="margin-0">
                We believe that your skills and background would be a valuable asset to our organization.
              </p>
              <p className="margin-0 font-bold">
                Your monthly and annual consolidated compensation structure is detailed in the attached **Annexure A** of this offer letter.
              </p>
              <p className="margin-0">
                On your joining date, please bring/send (<strong>{hrEmail}</strong>) the following documents: A) 2 Passport size photographs. B) Photocopy of all Educational and Technical Qualification Certificates. C) Relieving Letter and Experience Certificate from your present employer. D) Last drawn Salary Slip/Certificate showing monthly salary and annual benefits from the present employer, PAN card, Aadhar card, Driving License copy, etc.
              </p>
              <p className="margin-0">
                This is a provisional offer letter. The detailed letter with terms and conditions of employment will be handed over to you on your joining date.
              </p>
              <p className="mt-0.5">
                We look forward to your joining the company and becoming a productive member of the team.<br />
                <strong>Welcome to {companyName},</strong>
              </p>
            </div>

            {/* Flex Spacer to push signatures to the bottom */}
            <div className="flex-1" style={{ minHeight: '30px' }} />

            {/* Signatures Footer */}
            <div className="signature-block flex flex-row items-end justify-between pt-4 text-xs text-gray-800">
              <div>
                <div className="font-bold">Yours Sincerely,</div>
                <div className="mb-6 text-[10px] font-black uppercase text-gray-900">for {companyName},</div>
                {stampSrc ? (
                  <div className="mb-1 flex h-14 items-center">
                    <img crossOrigin="anonymous" src={stampSrc} alt="Stamp" className="max-h-full object-contain" />
                  </div>
                ) : (
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
            </div>
          </div>

          {/* Letter Footer Address */}
          <div className="relative z-30 mt-4 border-t border-gray-100 pt-3 pb-8 text-center text-[10px] leading-relaxed text-gray-500">
            <div className="mb-0.5 font-sans text-sm font-black uppercase tracking-widest text-amber-700" style={{ color: '#b45309' }}>
              {companyName}
            </div>
            <div>
              Regd. Office: {companyRegAddress}
            </div>
            <div className="font-bold text-gray-600" style={{ color: '#4b5563' }}>
              {user?.phone && `Ph: ${user.phone} | `}Email: {hrEmail}
            </div>
          </div>
        </div>

        {/* PAGE 2: Annexure A (Salary Table & Terms) */}
        <div
          className="printable-sheet relative flex flex-col justify-between overflow-hidden bg-white text-gray-800"
          style={{
            width: '794px',
            height: '1123px',
            minHeight: '1123px',
            maxHeight: '1123px',
            paddingLeft: '64px',
            paddingRight: '64px',
            paddingTop: '56px',
            paddingBottom: '24px',
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          <OfferLetterThemeDecorations bottomWidth="794px" />

          <div className="relative z-10 flex flex-1 flex-col justify-start gap-2.5">
            {/* Annexure Header */}
            <div className="mb-3 flex flex-row justify-between items-start gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-3.5 pr-3">
                {logoSrc ? (
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
                    <img crossOrigin="anonymous" src={logoSrc} alt="Logo" className="max-h-full max-w-full object-contain" />
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
                  <div className={offerLetterCompanyNameClass} style={{ color: '#166534' }}>
                    {companyName}
                  </div>
                </div>
              </div>
              <div className={offerLetterDateClass}>
                Date: {formatDateIN(joiningDate)}
              </div>
            </div>

            <div className="text-center text-sm font-extrabold uppercase tracking-wider text-gray-900 underline mb-2">
              Annexure A: Compensation & Allowances Structure
            </div>

            {/* Candidate & Designation Details */}
            <div className="mb-3 grid grid-cols-2 gap-3 text-xs bg-gray-50 border border-gray-100 rounded-lg p-3">
              <div>
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Employee Name:</span>
                <span className="block font-extrabold text-gray-800">{candidateName}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Designation / Role:</span>
                <span className="block font-extrabold text-gray-800">{designation}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Department:</span>
                <span className="block font-semibold text-gray-700">{department}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Base Work Location:</span>
                <span className="block font-semibold text-gray-700">{baseLocation}</span>
              </div>
            </div>

            {/* Compensation Table */}
            <div className="mb-3">
              <div className="font-bold text-xs text-gray-800 mb-1.5 uppercase tracking-wide">A. Monthly Salary Breakdown</div>
              <table className="w-full border-collapse border border-gray-200 text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left font-bold text-gray-700">Salary Component</th>
                    <th className="border border-gray-200 px-4 py-2 text-right font-bold text-gray-700">Percentage</th>
                    <th className="border border-gray-200 px-4 py-2 text-right font-bold text-gray-700">Monthly Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-gray-600">Basic Salary</td>
                    <td className="border border-gray-200 px-4 py-2 text-right text-gray-600">50%</td>
                    <td className="border border-gray-200 px-4 py-2 text-right font-semibold text-gray-800">₹{Math.round(salaryAmount * 0.50).toLocaleString('en-IN')}/-</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-gray-600">House Rent Allowance (HRA)</td>
                    <td className="border border-gray-200 px-4 py-2 text-right text-gray-600">20%</td>
                    <td className="border border-gray-200 px-4 py-2 text-right font-semibold text-gray-800">₹{Math.round(salaryAmount * 0.20).toLocaleString('en-IN')}/-</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-gray-600">Special & Conveyance Allowance</td>
                    <td className="border border-gray-200 px-4 py-2 text-right text-gray-600">30%</td>
                    <td className="border border-gray-200 px-4 py-2 text-right font-semibold text-gray-800">₹{Math.round(salaryAmount * 0.30).toLocaleString('en-IN')}/-</td>
                  </tr>
                  <tr className="bg-emerald-50 font-bold">
                    <td className="border border-gray-200 px-4 py-2 text-emerald-800">Gross Monthly Salary</td>
                    <td className="border border-gray-200 px-4 py-2 text-right text-emerald-800">100%</td>
                    <td className="border border-gray-200 px-4 py-2 text-right text-emerald-800">₹{Number(salaryAmount).toLocaleString('en-IN')}/-</td>
                  </tr>
                </tbody>
              </table>
              <div className="text-[10px] text-gray-500 font-semibold mt-1">
                * Consolidated Salary: <strong>₹{Number(salaryAmount).toLocaleString('en-IN')}/- per month ({salaryWords} Only)</strong>.
              </div>
            </div>

            {/* Field Allowances Table */}
            <div className="mb-3">
              <div className="font-bold text-xs text-gray-800 mb-1.5 uppercase tracking-wide">B. Field Work Allowances & Conveyance</div>
              <table className="w-full border-collapse border border-gray-200 text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left font-bold text-gray-700">Allowance Parameter</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-bold text-gray-700">Description / Rates</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-gray-600">HQ Allowance</td>
                    <td className="border border-gray-200 px-4 py-2 text-gray-800 font-semibold">₹{hqAllowance}/- per day</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-gray-600">Ex-Station Allowance</td>
                    <td className="border border-gray-200 px-4 py-2 text-gray-800 font-semibold">₹{exStationAllowance}/- per day</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-gray-600">Out-Station Allowance</td>
                    <td className="border border-gray-200 px-4 py-2 text-gray-800 font-semibold">₹{outStationAllowance}/- per day</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 text-gray-600">Conveyance Rate per KM</td>
                    <td className="border border-gray-200 px-4 py-2 text-gray-800 font-semibold">₹{conveyanceRate}/- per KM for Ex-station and Out-station work</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Reporting & Acceptance Rules */}
            <div className="text-[11px] leading-normal text-gray-800 border-l-4 border-amber-500 pl-3 py-1 bg-amber-50/50 rounded-r-lg mb-2" style={{ fontSize: '9.5px', marginBottom: '4px', paddingTop: '2px', paddingBottom: '2px' }}>
              <strong>Reporting & Acceptance:</strong> You will report to <strong>{reportingManager} ({reportingPhone})</strong>. Please confirm your formal acceptance on or before <strong>{formatDateIN(joiningDate)}</strong>.
            </div>

            {/* Flex Spacer to push signatures to the bottom */}
            <div className="flex-1" style={{ minHeight: '20px' }} />

            {/* Signature Blocks */}
            <div className="signature-block flex flex-row items-end justify-between pt-6 text-xs text-gray-800" style={{ marginTop: '24px', paddingTop: '2px' }}>
              <div>
                <div className="font-bold">Yours Sincerely,</div>
                <div className="mb-4 text-[10px] font-black uppercase text-gray-900">for {companyName},</div>

                {stampSrc ? (
                  <div className="mb-1 flex h-12 items-center">
                    <img crossOrigin="anonymous" src={stampSrc} alt="Stamp" className="max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="mb-0.5 h-6 select-none font-serif text-lg font-bold text-blue-900 rotate-[-4deg] translate-x-2">
                    {hrHeadName}
                  </div>
                )}
                <div className="mb-1 w-36 border-t border-gray-400"></div>
                <div className="text-[10px] font-black uppercase text-gray-950">{hrHeadName}</div>
                <div className="text-[9px] font-semibold text-gray-500">{hrHeadDesignation}</div>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="font-bold mb-8">Candidate Acceptance Signature</div>
                <div className="mb-1 w-40 border-t border-gray-400"></div>
                <div className="text-[10px] font-black uppercase tracking-wide text-gray-950">{candidateName}</div>
                <div className="text-[9px] font-semibold text-gray-500">Date: ________________</div>
              </div>
            </div>
          </div>

          {/* Letter Footer Address */}
          <div
            className="border-t border-gray-100 text-center text-[10px] leading-relaxed text-gray-500"
            style={{
              marginTop: '0px',
              paddingBottom: '50px',
              paddingTop: '6px',
              flexShrink: '0',
              position: 'relative',
              zIndex: 30
            }}
          >
            <div className="mb-0.5 font-sans text-sm font-black uppercase tracking-widest text-amber-700" style={{ color: '#b45309' }}>
              {companyName}
            </div>
            <div>
              Regd. Office: {companyRegAddress}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

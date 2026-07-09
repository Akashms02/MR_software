import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import html2pdf from 'html2pdf.js'
import { Printer, RefreshCw, CheckCircle2, X, ExternalLink, Mail, FileText, Plus, Trash2, ArrowLeft } from 'lucide-react'
import { PrimaryBtn, OutlineBtn } from '../ui'
import { fetchProfile } from '../../redux/actions/authActions'
import { CompanyOfferLetter, CompanyRoles, CompanyDepartments } from '../../redux/actions/companyAction'
import { getMyTeam } from '../../redux/actions/teamActions'
import { getFullAssetUrl, inlineDocumentImages, useCompanyBrandAssets } from '../../utils/getFullAssetUrl'
import { loadLetterheadSettings, LetterheadHeader, LetterheadFooter, applyLetterheadContactPdfFixes, getLetterheadTheme } from './shared/letterheadContact'
import HrSignatureBlock from './shared/HrSignatureBlock'

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────
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

function numberToWordsINR(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];
  num = Math.floor(Number(num) || 0);
  if (num === 0) return 'Zero';
  function translate(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + a[n % 10];
    return a[Math.floor(n / 100)] + 'Hundred ' + translate(n % 100);
  }
  let result = '';
  if (num >= 10000000) { result += translate(Math.floor(num / 10000000)) + 'Crore '; num %= 10000000; }
  if (num >= 100000) { result += translate(Math.floor(num / 100000)) + 'Lakh '; num %= 100000; }
  if (num >= 1000) { result += translate(Math.floor(num / 1000)) + 'Thousand '; num %= 1000; }
  if (num > 0) result += (result !== '' && num < 100 ? 'and ' : '') + translate(num);
  return result.trim();
}

const oklchToRgb = (l, c, h, a = 1) => {
  const hRad = (h * Math.PI) / 180;
  const a_ = c * Math.cos(hRad); const b_ = c * Math.sin(hRad);
  const l_ = l + 0.3963377774 * a_ + 0.2158037573 * b_;
  const m_ = l - 0.1055613458 * a_ - 0.0638541728 * b_;
  const s_ = l - 0.0894841775 * a_ - 1.2914855480 * b_;
  const l3 = l_ ** 3; const m3 = m_ ** 3; const s3 = s_ ** 3;
  const rr = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699294 * s3;
  const gr = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const br = -0.0041960863 * l3 - 0.7034186145 * m3 + 1.7076147010 * s3;
  const f = x => x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  const r = Math.max(0, Math.min(255, Math.round(f(rr) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(f(gr) * 255)));
  const b2 = Math.max(0, Math.min(255, Math.round(f(br) * 255)));
  return a === 1 ? `rgb(${r},${g},${b2})` : `rgba(${r},${g},${b2},${a})`;
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
          let l = parseFloat(parts[0]); if (parts[0].includes('%')) l /= 100;
          const c = parseFloat(parts[1]); const h = parseFloat(parts[2]);
          let a = 1; if (parts[3]) { a = parseFloat(parts[3]); if (parts[3].includes('%')) a /= 100; }
          if (!isNaN(l) && !isNaN(c) && !isNaN(h)) return oklchToRgb(l, c, h, a);
        }
        return match;
      });
    } catch (e) { }
  }
  if (resolved.includes('oklab')) {
    try {
      resolved = resolved.replace(/oklab\(([^)]+)\)/g, (match, p1) => {
        const parts = p1.trim().split(/[\s/,]+/);
        if (parts.length >= 3) {
          let l = parseFloat(parts[0]); if (parts[0].includes('%')) l /= 100;
          const a_coord = parseFloat(parts[1]); const b_coord = parseFloat(parts[2]);
          let a = 1; if (parts[3]) { a = parseFloat(parts[3]); if (parts[3].includes('%')) a /= 100; }
          if (!isNaN(l) && !isNaN(a_coord) && !isNaN(b_coord)) return oklabToRgb(l, a_coord, b_coord, a);
        }
        return match;
      });
    } catch (e) { }
  }
  return resolved;
};

const paginateSections = (sections) => {
  const pages = [];
  let currentPage = [];
  let currentHeight = 0;
  
  const maxNormalHeight = 800; 
  const maxLastPageHeight = 650; 
  
  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    
    const titleLength = sec.title ? sec.title.length : 0;
    const contentLength = sec.content ? sec.content.length : 0;
    const titleLines = Math.ceil(titleLength / 80) || 1;
    const contentLines = Math.ceil(contentLength / 75) || 1;
    const secHeight = (titleLines * 15) + 4 + (contentLines * 19) + 16;
    
    if (currentPage.length > 0 && currentHeight + secHeight > maxNormalHeight) {
      pages.push(currentPage);
      currentPage = [];
      currentHeight = 0;
    }
    
    currentPage.push(sec);
    currentHeight += secHeight;
  }
  
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  
  while (pages.length > 0) {
    const lastPageIndex = pages.length - 1;
    const lastPage = pages[lastPageIndex];
    
    let lastPageHeight = 0;
    for (const sec of lastPage) {
      const titleLines = Math.ceil((sec.title ? sec.title.length : 0) / 80) || 1;
      const contentLines = Math.ceil((sec.content ? sec.content.length : 0) / 75) || 1;
      lastPageHeight += (titleLines * 15) + 4 + (contentLines * 19) + 16;
    }
    
    if (lastPageHeight > maxLastPageHeight && lastPage.length > 1) {
      const popped = lastPage.pop();
      pages.push([popped]);
    } else {
      break;
    }
  }
  
  return pages;
};

const paginateAnnexureA = (salaryComponents, allowanceComponents, showAllowances) => {
  const pages = [];
  let currentPage = [];
  let currentHeight = 0;
  
  const maxNormalHeight = 800; 
  const signatureHeight = 160;
  const metadataHeight = 85;
  const reportingHeight = 60;
  const rowHeight = 38;
  
  currentPage.push({ type: 'metadata' });
  currentHeight += metadataHeight;
  
  const numRowsA = salaryComponents.length;
  if (numRowsA > 0) {
    const tableABaseHeight = 141; 
    let remainingRows = [...salaryComponents];
    let isFirstTableAChunk = true;
    
    while (remainingRows.length > 0) {
      const availableSpace = maxNormalHeight - currentHeight;
      const neededBase = isFirstTableAChunk ? tableABaseHeight : 50;
      
      let rowsThatFit = Math.floor((availableSpace - neededBase) / rowHeight);
      if (rowsThatFit < 1) {
        pages.push(currentPage);
        currentPage = [];
        currentHeight = 0;
        rowsThatFit = Math.floor((maxNormalHeight - 50) / rowHeight);
      }
      
      const chunk = remainingRows.splice(0, Math.max(1, rowsThatFit));
      currentPage.push({ type: 'tableA', rows: chunk, isFirstChunk: isFirstTableAChunk, isLastChunk: remainingRows.length === 0 });
      currentHeight += (isFirstTableAChunk ? tableABaseHeight : 50) + chunk.length * rowHeight;
      isFirstTableAChunk = false;
    }
  }
  
  if (showAllowances && allowanceComponents.length > 0) {
    const tableBBaseHeight = 83; 
    const tableBNeededHeight = tableBBaseHeight + (allowanceComponents.length * rowHeight);
    
    const forceTableBToNewPage = (currentHeight + tableBNeededHeight <= maxNormalHeight) && 
      (currentHeight + tableBNeededHeight + reportingHeight + signatureHeight > maxNormalHeight);
    
    let remainingRows = [...allowanceComponents];
    let isFirstTableBChunk = true;
    
    while (remainingRows.length > 0) {
      const availableSpace = maxNormalHeight - currentHeight;
      const neededBase = isFirstTableBChunk ? tableBBaseHeight : 40;
      
      let rowsThatFit = Math.floor((availableSpace - neededBase) / rowHeight);
      if (rowsThatFit < 1 || (isFirstTableBChunk && (forceTableBToNewPage || availableSpace < neededBase + 2 * rowHeight))) {
        pages.push(currentPage);
        currentPage = [];
        currentHeight = 0;
        rowsThatFit = Math.floor((maxNormalHeight - (isFirstTableBChunk ? tableBBaseHeight : 40)) / rowHeight);
      }
      
      const chunk = remainingRows.splice(0, Math.max(1, rowsThatFit));
      currentPage.push({ type: 'tableB', rows: chunk, isFirstChunk: isFirstTableBChunk, isLastChunk: remainingRows.length === 0 });
      currentHeight += (isFirstTableBChunk ? tableBBaseHeight : 40) + chunk.length * rowHeight;
      isFirstTableBChunk = false;
    }
  }
  
  if (currentHeight + reportingHeight + signatureHeight > maxNormalHeight) {
    pages.push(currentPage);
    currentPage = [];
    currentHeight = 0;
  }
  currentPage.push({ type: 'reporting' });
  currentPage.push({ type: 'signatures' });
  currentHeight += reportingHeight + signatureHeight;
  
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  
  return pages;
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function OfferLetter({ letterheadSettings: propLetterheadSettings, onBack }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { team: employees = [] } = useSelector((state) => state.team);
  const { getRoles = [], getDepartments = [] } = useSelector((state) => state.company);
  const { logoSrc, stampSrc } = useCompanyBrandAssets(user);

  const [letterheadSettings, setLetterheadSettings] = useState(() => propLetterheadSettings || loadLetterheadSettings(user));

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(getMyTeam());
    dispatch(CompanyRoles());
    dispatch(CompanyDepartments());
  }, [dispatch]);

  // Sync company details from custom settings, props or Redux profile
  useEffect(() => {
    const settings = propLetterheadSettings || loadLetterheadSettings(user);
    setLetterheadSettings(settings);
    if (settings.companyName) setCompanyName(settings.companyName.toUpperCase());
    if (settings.address) {
      setCompanyRegAddress(settings.address);
      setBaseLocation(settings.address.toUpperCase());
    }
    if (settings.email) setHrEmail(settings.email);
  }, [user, propLetterheadSettings]);

  const [candidateName, setCandidateName] = useState('AMARESH')
  const [parentName, setParentName] = useState('Timmanagouda')
  const [addressLine1, setAddressLine1] = useState('R/o Basavanilaya')
  const [addressLine2, setAddressLine2] = useState('Near Gadderaya Temple Kanaka Nagar')
  const [addressLine3, setAddressLine3] = useState('SHAHAPUR DIST. Yadagiri -585223')
  const [mobile, setMobile] = useState('9845173883')
  const [email, setEmail] = useState('amaresh.dond1@gmail.com')
  const [designation, setDesignation] = useState('')
  const [department, setDepartment] = useState('Sales & Marketing Department')
  const [companyName, setCompanyName]             = useState('NOEL PHARMA (INDIA) PRIVATE LIMITED')
  const [companyRegAddress, setCompanyRegAddress] = useState('Survey Nos: 1 to 40, Plot No. 109, Uppal Bhagagayath Revenue Village, Uppal-Mandal, Medchal-Malkajgiri, Hyderabad-500039')
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().split('T')[0])
  const [baseLocation, setBaseLocation] = useState('HYDERABAD')
  const [salaryAmount, setSalaryAmount] = useState(25000)
  const [salaryWords, setSalaryWords] = useState('Twenty-Five Thousand')
  const [showAllowances, setShowAllowances] = useState(true)
  const [allowanceComponents, setAllowanceComponents] = useState([
    { id: '1', label: 'HQ Allowance', rate: '₹200/- per day' },
    { id: '2', label: 'Ex-Station Allowance', rate: '₹250/- per day' },
    { id: '3', label: 'Out-Station Allowance', rate: '₹400/- per day' },
    { id: '4', label: 'Conveyance Rate per KM', rate: '₹2.25/- per KM' },
  ])
  const [reportingManager, setReportingManager] = useState('Area Sales Manager, Mr. Basavaraj')
  const [reportingPhone, setReportingPhone] = useState('9886024514')
  const [hrEmail, setHrEmail] = useState('mail-noelhr1975@gmail.com')
  const [hrHeadName, setHrHeadName] = useState('CH. MURTHY')
  const [hrHeadDesignation, setHrHeadDesignation] = useState('Head - HR')
  const [probationPeriod, setProbationPeriod] = useState('3 months')
  const [isFresher, setIsFresher] = useState(false)
  const [salutation, setSalutation] = useState('Mr.')
  const [currentDateStr] = useState(() => new Date().toISOString().split('T')[0])

  // Page 3 Policy Texts
  const [policySections, setPolicySections] = useState([
    { id: '1', title: '1. Work Period & Shift Policy', content: 'The standard working hours shall be 40 hours per week, Monday through Friday. Shift timings may vary depending on project requirements and client schedules.' },
    { id: '2', title: '2. Benching & Project Assignment Policy', content: 'In the event you are on the bench (awaiting client project assignment), you will report daily for internal training, skill development, and mock tasks as assigned.' },
    { id: '3', title: '3. Separation, Layoff & Notice Period', content: 'Either party may terminate employment by giving 30 days\' written notice. The company reserves the right of immediate termination for misconduct or breach of policies.' },
    { id: '4', title: '4. Confidentiality & General Conduct', content: 'You agree to maintain absolute confidentiality regarding company software, source code, client profiles, and databases during and after your tenure.' }
  ]);

  // Page 2 Salary Breakdown Components
  const [salaryComponents, setSalaryComponents] = useState([
    { id: '1', label: 'Basic Salary', percentage: '50%', amount: 12500 },
    { id: '2', label: 'House Rent Allowance (HRA)', percentage: '20%', amount: 5000 },
    { id: '3', label: 'Special & Conveyance Allowance', percentage: '30%', amount: 7500 },
  ]);

  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState({ emailSentTo: '', previewUrl: '', status: '' })
  const [modalError, setModalError] = useState('')
  const printableRef = useRef(null)

  const totalMonthlySalary = salaryComponents.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalPercentage = salaryComponents.reduce((sum, item) => {
    const cleanPct = typeof item.percentage === 'string' ? item.percentage.replace('%', '') : item.percentage;
    const pct = parseFloat(cleanPct) || 0;
    return sum + pct;
  }, 0);

  // Keep salaryAmount and words in sync with totalMonthlySalary
  useEffect(() => {
    setSalaryAmount(totalMonthlySalary);
    const words = numberToWordsINR(totalMonthlySalary);
    setSalaryWords(words ? words.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : 'Zero');
  }, [totalMonthlySalary]);

  const handleAddSalaryComponent = () => {
    setSalaryComponents([...salaryComponents, { id: Date.now().toString(), label: '', percentage: '', amount: 0 }]);
  };

  const handleUpdateSalaryComponent = (index, field, value) => {
    const updated = [...salaryComponents];
    if (field === 'percentage') {
      updated[index].percentage = value;
      const cleanPct = typeof value === 'string' ? value.replace('%', '') : value;
      const pct = parseFloat(cleanPct) || 0;
      updated[index].amount = Math.round(salaryAmount * (pct / 100));
    } else if (field === 'amount') {
      const amt = value === '' ? '' : Number(value);
      updated[index].amount = amt;
      if (salaryAmount > 0) {
        const numericAmt = Number(amt) || 0;
        updated[index].percentage = Math.round((numericAmt / salaryAmount) * 100) + '%';
      }
    } else {
      updated[index][field] = value;
    }
    setSalaryComponents(updated);
  };

  const handleRemoveSalaryComponent = (index) => {
    setSalaryComponents(salaryComponents.filter((_, i) => i !== index));
  };

  const handleAddAllowanceComponent = () => {
    setAllowanceComponents([...allowanceComponents, { id: Date.now().toString(), label: '', rate: '' }]);
  };

  const handleUpdateAllowanceComponent = (index, field, value) => {
    const updated = [...allowanceComponents];
    updated[index][field] = value;
    setAllowanceComponents(updated);
  };

  const handleRemoveAllowanceComponent = (index) => {
    setAllowanceComponents(allowanceComponents.filter((_, i) => i !== index));
  };

  const handleAddPolicySection = () => {
    const nextNum = policySections.length + 1;
    setPolicySections([...policySections, { id: Date.now().toString(), title: `${nextNum}. Policy Title`, content: '' }]);
  };

  const handleUpdatePolicySection = (index, field, value) => {
    const updated = [...policySections];
    updated[index][field] = value;
    setPolicySections(updated);
  };

  const handleRemovePolicySection = (index) => {
    setPolicySections(policySections.filter((_, i) => i !== index));
  };

  const formatDateIN = (dateStr) => {
    if (!dateStr) return '';
    const p = dateStr.split('-');
    return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : dateStr;
  };

  const handleSalaryChange = (value) => {
    const amt = Number(value) || 0;
    setSalaryAmount(amt);
    const updated = salaryComponents.map(comp => {
      const cleanPct = typeof comp.percentage === 'string' ? comp.percentage.replace('%', '') : comp.percentage;
      const pct = parseFloat(cleanPct) || 0;
      return {
        ...comp,
        amount: Math.round(amt * (pct / 100))
      };
    });
    setSalaryComponents(updated);
  };

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
      setDesignation(emp.designation || '')
      setDepartment(emp.department || emp.dept || 'Sales & Marketing Department')
      setBaseLocation(companyRegAddress.toUpperCase())

      const sal = emp.salary || emp.salaryAmount || 25000
      setSalaryAmount(sal)
      const words = numberToWordsINR(sal)
      const formattedWords = words.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      setSalaryWords(formattedWords)
    }
  }

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

  const downloadPdfBlob = (blob, fileName) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    if (!joiningDate) setJoiningDate(new Date().toISOString().split('T')[0]);
    window.print();
  };

  const buildOfferLetterPdf = async () => {
    let origGCS = null; let captureRoot = null; let pageBreakRestore = [];
    try {
      origGCS = window.getComputedStyle;
      window.getComputedStyle = function (el, pseudo) {
        const style = origGCS.call(window, el, pseudo);
        return new Proxy(style, {
          get(target, prop) {
            if (prop === 'getPropertyValue') return (key) => {
              const val = target.getPropertyValue(key);
              return (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) ? resolveModernColors(val) : val;
            };
            const val = target[prop];
            if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) { try { return resolveModernColors(val); } catch { return val; } }
            return typeof val === 'function' ? val.bind(target) : val;
          }
        });
      };
      captureRoot = printableRef.current;
      if (!captureRoot) throw new Error('Document preview not ready.');
      if (captureRoot.querySelectorAll('.printable-sheet').length === 0) throw new Error('No printable pages found.');
      await document.fonts.ready;
      await inlineDocumentImages(captureRoot);
      await waitForImages(captureRoot);
      await new Promise(r => setTimeout(r, 120));
      const fileName = `offer_letter_${candidateName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.pdf`;
      const applyFixes = (clonedDoc) => {
        clonedDoc.querySelectorAll('style').forEach(s => { if (s.textContent) s.textContent = resolveModernColors(s.textContent); });

        clonedDoc.querySelectorAll('.html2pdf__page-break').forEach((el) => el.remove());

        if (clonedDoc.defaultView) {
          const originalGetComputedStyle = clonedDoc.defaultView.getComputedStyle;
          clonedDoc.defaultView.getComputedStyle = function (el, pseudoEl) {
            const style = originalGetComputedStyle.call(clonedDoc.defaultView, el, pseudoEl);
            return new Proxy(style, {
              get(target, prop) {
                if (prop === 'getPropertyValue') {
                  return function (key) {
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
        clonedDoc.querySelectorAll('.printable-sheet').forEach(sheet => {
          Object.assign(sheet.style, { width: '210mm', height: '296mm', minHeight: '296mm', maxHeight: '296mm', margin: '0', borderRadius: '0', border: 'none', boxShadow: 'none', overflow: 'hidden', boxSizing: 'border-box', background: '#ffffff' });
        });
        clonedDoc.querySelectorAll('.offer-theme-header-stripe, .offer-theme-footer-stripe').forEach(img => {
          img.style.width = '794px'; img.setAttribute('width', '794');
        });
        clonedDoc.querySelectorAll('svg, img').forEach((el) => {
          const widthAttr = el.getAttribute('width');
          const srcAttr = el.getAttribute('src') || '';
          if (widthAttr === '100%' || el.style.width === '100%' || srcAttr.startsWith('data:image/svg+xml')) {
            if (el.style.width === '100%' || widthAttr === '100%') {
              el.setAttribute('width', '794');
              el.style.width = '794px';
            }
          }
        });
        applyLetterheadContactPdfFixes(clonedDoc);
        clonedDoc.querySelectorAll('.offer-theme-bottom-corner').forEach(img => {
          img.style.width = '300px'; img.style.height = '110px';
        });
      };

      const pageBreakMarkers = Array.from(captureRoot.querySelectorAll('.html2pdf__page-break'));
      pageBreakRestore = pageBreakMarkers.map((el) => ({
        el,
        parent: el.parentNode,
        next: el.nextSibling,
      }));
      pageBreakMarkers.forEach((el) => el.remove());

      captureRoot.classList.add('generating-pdf');
      const opt = {
        margin: [0, 0, 0, 0], filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false, letterRendering: true, imageTimeout: 15000, backgroundColor: '#ffffff', onclone: applyFixes },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' },
      };
      const pdfBlob = await html2pdf().set(opt).from(captureRoot).output('blob');
      return { blob: pdfBlob, fileName };
    } finally {
      if (captureRoot) {
        captureRoot.classList.remove('generating-pdf');
        pageBreakRestore.forEach(({ el, parent, next }) => {
          if (parent) parent.insertBefore(el, next);
        });
      }
      if (origGCS) window.getComputedStyle = origGCS;
    }
  };

  const handleGenerateOfferLetter = async () => {
    if (!candidateName || candidateName.trim().length < 2) {
      setModalError('Candidate Name must be at least 2 characters.');
      setShowModal(true);
      return;
    }
    if (!parentName || parentName.trim().length < 2) {
      setModalError("Father's Name must be at least 2 characters.");
      setShowModal(true);
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setModalError('Please enter a valid candidate email address.');
      setShowModal(true);
      return;
    }
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile.trim())) {
      setModalError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      setShowModal(true);
      return;
    }
    const combinedAddress = `${addressLine1} ${addressLine2} ${addressLine3}`.trim();
    if (combinedAddress.length < 10) {
      setModalError('Combined Address lines must be at least 10 characters.');
      setShowModal(true);
      return;
    }
    if (!designation || designation.trim() === '') {
      setModalError('Designation is required.');
      setShowModal(true);
      return;
    }
    if (!department || department.trim() === '') {
      setModalError('Department is required.');
      setShowModal(true);
      return;
    }
    if (!joiningDate) {
      setModalError('Joining Date is required.');
      setShowModal(true);
      return;
    }
    if (!baseLocation || baseLocation.trim() === '') {
      setModalError('Base Location is required.');
      setShowModal(true);
      return;
    }
    if (!salaryAmount || salaryAmount <= 0) {
      setModalError('Monthly Salary must be a positive number.');
      setShowModal(true);
      return;
    }
    if (!hrHeadName || hrHeadName.trim().length < 2) {
      setModalError('HR Head Signatory Name is required.');
      setShowModal(true);
      return;
    }

    setIsGenerating(true);
    setModalError('');
    try {
      const { blob: pdfBlob, fileName } = await buildOfferLetterPdf();
      downloadPdfBlob(pdfBlob, fileName);

      const formDataToSend = new FormData();
      formDataToSend.append('email', email);
      formDataToSend.append('file', pdfBlob, fileName);

      const result = await dispatch(CompanyOfferLetter(formDataToSend));

      if (result?.data) {
        const respData = result.data;
        setModalError('');
        setModalData({
          emailSentTo: respData.emailSentTo || email,
          previewUrl: respData.previewUrl || respData.offerLetterPDF || '',
          status: respData.status || 'SENT',
        });
      } else {
        throw new Error(result?.message || 'Failed to dispatch offer letter via API.');
      }
      setShowModal(true);
    } catch (err) {
      setModalError(err.message || 'An unexpected error occurred.');
      setShowModal(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const paginatedPages = paginateSections(policySections);
  const displayPages = paginatedPages.length > 0 ? paginatedPages : [[]];
  const paginatedAnnexurePages = paginateAnnexureA(salaryComponents, allowanceComponents, showAllowances);
  const displayAnnexurePages = paginatedAnnexurePages.length > 0 ? paginatedAnnexurePages : [[]];

  const inputCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 text-sm font-medium";
  const labelCls = "text-sm font-medium text-slate-700 block mb-1.5";
  const sectionHeaderCls = "col-span-full mt-6 mb-2 border-b border-slate-100 pb-3 text-sm font-bold uppercase tracking-wider text-blue-600";

  return (
    <div className="animate-in fade-in duration-500">
      {/* Editor Console */}
      <div className="no-print mb-8 rounded-xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm flex flex-col">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="text-base font-extrabold text-slate-800">Offer &amp; Appointment Customizer</h3>

          {/* Quick Preload */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-400">Load Employee:</span>
            <select
              onChange={e => handleLoadEmployee(e.target.value)}
              defaultValue=""
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
        
        <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className={sectionHeaderCls}>Candidate Profile</div>
          <div>
            <label className={labelCls}>Salutation</label>
            <select value={salutation} onChange={e => setSalutation(e.target.value)} className={inputCls}>
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Ms.">Ms.</option>
            </select>
          </div>
          <div><label className={labelCls}>Candidate Name</label><input type="text" value={candidateName} onChange={e => setCandidateName(e.target.value.toUpperCase())} className={inputCls} /></div>
          <div><label className={labelCls}>Father Name (S/o)</label><input type="text" value={parentName} onChange={e => setParentName(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Mobile</label><input type="text" value={mobile} onChange={e => setMobile(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} /></div>
          <div className="col-span-1 sm:col-span-2"><label className={labelCls}>Address Line 1</label><input type="text" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} className={inputCls} /></div>
          <div className="col-span-1 sm:col-span-2"><label className={labelCls}>Address Line 2</label><input type="text" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} className={inputCls} /></div>
          <div className="col-span-1 sm:col-span-2"><label className={labelCls}>Address Line 3</label><input type="text" value={addressLine3} onChange={e => setAddressLine3(e.target.value)} className={inputCls} /></div>
          
          <div className="col-span-full mt-2">
            <label className="flex items-center gap-2.5 text-sm font-bold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFresher}
                onChange={e => setIsFresher(e.target.checked)}
                className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              Candidate is a Fresher (Omit Relieving Letter &amp; Salary Slip requirements)
            </label>
          </div>

          <div className={sectionHeaderCls}>Offer &amp; Position</div>
          <div>
            <label className={labelCls}>Designation</label>
            <select value={designation} onChange={e => setDesignation(e.target.value)} className={inputCls}>
              <option value="" disabled>Select Role…</option>
              {getRoles.map((role) => (
                <option key={role} value={role}>
                  {role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Department</label>
            <select value={department} onChange={e => setDepartment(e.target.value)} className={inputCls}>
              <option value="" disabled>Select Department…</option>
              {getDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div><label className={labelCls}>Joining Date</label><input type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Base Location</label><input type="text" value={baseLocation} onChange={e => setBaseLocation(e.target.value.toUpperCase())} className={inputCls} /></div>
          <div><label className={labelCls}>Probation Period</label><input type="text" value={probationPeriod} onChange={e => setProbationPeriod(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Company Name</label><input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className={inputCls} /></div>

          <div className={sectionHeaderCls}>Remuneration &amp; Allowances</div>
          <div><label className={labelCls}>Monthly Salary (₹)</label><input type="number" value={salaryAmount} onChange={e => handleSalaryChange(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Salary in Words</label><input type="text" value={salaryWords} onChange={e => setSalaryWords(e.target.value)} className={inputCls} /></div>

          <div className={sectionHeaderCls}>Salary Table Customizer (Page 2 - Table A)</div>
          <div className="col-span-full space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-sm font-bold text-slate-800">Salary Breakdown Components</span>
              <button
                type="button"
                onClick={handleAddSalaryComponent}
                className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <Plus size={14} /> Add Row
              </button>
            </div>

            <div className="space-y-3">
              {salaryComponents.map((comp, idx) => (
                <div key={comp.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-150 shadow-sm relative group">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Component Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Basic Salary"
                      value={comp.label}
                      onChange={(e) => handleUpdateSalaryComponent(idx, 'label', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="w-full sm:w-28">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Percentage (%)</label>
                    <input
                      type="text"
                      placeholder="e.g. 50%"
                      value={comp.percentage}
                      onChange={(e) => handleUpdateSalaryComponent(idx, 'percentage', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="w-full sm:w-36">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={comp.amount}
                      onChange={(e) => handleUpdateSalaryComponent(idx, 'amount', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  {salaryComponents.length > 1 && (
                    <div className="flex items-end justify-end sm:pt-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveSalaryComponent(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-100 rounded-xl p-4 text-xs font-bold text-slate-800 gap-2">
              <span>Total calculated monthly salary:</span>
              <span className="text-sm font-black text-blue-600">₹{totalMonthlySalary.toLocaleString('en-IN')}/- ({totalPercentage}%)</span>
            </div>
          </div>

          <div className={sectionHeaderCls}>Field Work Allowances (Page 2 - Table B)</div>
          <div className="col-span-full mb-2">
            <label className="flex items-center gap-2.5 text-sm font-bold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showAllowances}
                onChange={e => setShowAllowances(e.target.checked)}
                className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              Include Field Work Allowances &amp; Conveyance Table (Table B)
            </label>
          </div>

          {showAllowances && (
            <div className="col-span-full space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <span className="text-sm font-bold text-slate-800">Allowance Components</span>
                <button
                  type="button"
                  onClick={handleAddAllowanceComponent}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <Plus size={14} /> Add Allowance Row
                </button>
              </div>

              <div className="space-y-3">
                {allowanceComponents.map((comp, idx) => (
                  <div key={comp.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-150 shadow-sm relative group">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Allowance Name</label>
                      <input
                        type="text"
                        placeholder="e.g. HQ Allowance"
                        value={comp.label}
                        onChange={(e) => handleUpdateAllowanceComponent(idx, 'label', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Rate / Description</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹200/- per day"
                        value={comp.rate}
                        onChange={(e) => handleUpdateAllowanceComponent(idx, 'rate', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    {allowanceComponents.length > 1 && (
                      <div className="flex items-end justify-end sm:pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveAllowanceComponent(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={sectionHeaderCls}>Reporting &amp; HR Info</div>
          <div className="col-span-1 sm:col-span-2">
            <label className={labelCls}>Choose Reporting Manager</label>
            <select
              onChange={e => handleSelectManager(e.target.value)}
              defaultValue=""
              className={inputCls}
            >
              <option value="" disabled>Select manager to autofill…</option>
              {employees.map(emp => (
                <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                  {emp.fullName || emp.name} ({emp.role ? emp.role.replace(/_/g, ' ') : 'Employee'})
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-1 sm:col-span-2"><label className={labelCls}>Reporting Manager Title &amp; Name</label><input type="text" value={reportingManager} onChange={e => setReportingManager(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Reporting Phone</label><input type="text" value={reportingPhone} onChange={e => setReportingPhone(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>HR Email</label><input type="email" value={hrEmail} onChange={e => setHrEmail(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>HR Signatory Name</label><input type="text" value={hrHeadName} onChange={e => setHrHeadName(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>HR Signatory Title</label><input type="text" value={hrHeadDesignation} onChange={e => setHrHeadDesignation(e.target.value)} className={inputCls} /></div>

          <div className={sectionHeaderCls}>Company Conditions &amp; Policies (Page 3)</div>
          <div className="col-span-full space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-sm font-bold text-slate-800">Policy Sections</span>
              <button
                type="button"
                onClick={handleAddPolicySection}
                className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <Plus size={14} /> Add Policy Section
              </button>
            </div>

            <div className="space-y-4">
              {policySections.map((sec, idx) => (
                <div key={sec.id} className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-slate-150 shadow-sm relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Section {idx + 1}</span>
                    {policySections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePolicySection(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Section Title</label>
                    <input
                      type="text"
                      placeholder="e.g. 1. Work Period & Shift Policy"
                      value={sec.title}
                      onChange={(e) => handleUpdatePolicySection(idx, 'title', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Policy Content</label>
                    <textarea
                      rows="3"
                      placeholder="Enter policy details..."
                      value={sec.content}
                      onChange={(e) => handleUpdatePolicySection(idx, 'content', e.target.value)}
                      className={inputCls + " resize-none"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 mt-6">
          <OutlineBtn onClick={handleGenerateOfferLetter} disabled={isGenerating || isExporting} className="flex items-center gap-2 px-5 py-2 text-sm">
            <RefreshCw size={16} className={isGenerating ? "animate-spin text-blue-600" : "text-blue-600"} />
            <span className="text-blue-600 font-bold">{isGenerating ? "Generating..." : "Generate Offer Letter"}</span>
          </OutlineBtn>
          <PrimaryBtn onClick={handlePrint} disabled={isGenerating || isExporting} className="flex items-center gap-2 px-5 py-2 text-sm">
            <Printer size={16} />
            Print / Export PDF
          </PrimaryBtn>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 transition"><X size={18} /></button>
            {modalError ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50"><X size={24} className="text-rose-500" /></div>
                <h3 className="text-base font-extrabold text-slate-800">Generation Failed</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{modalError}</p>
                <button onClick={() => setShowModal(false)} className="mt-2 w-full rounded-xl bg-slate-900 px-5 py-3 text-xs font-extrabold text-white hover:bg-slate-800 cursor-pointer">Close</button>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-2 text-center mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50"><CheckCircle2 size={28} className="text-blue-600" /></div>
                  <h3 className="text-lg font-black text-slate-800">Offer Letter Dispatched!</h3>
                  <p className="text-xs text-slate-400">Generated and emailed to the candidate.</p>
                </div>
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50"><Mail size={16} className="text-blue-600" /></div>
                    <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Email Sent To</p><p className="text-sm font-bold text-slate-700">{modalData.emailSentTo}</p></div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50"><CheckCircle2 size={16} className="text-emerald-600" /></div>
                    <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Status</p><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-emerald-600">{modalData.status}</span></div>
                  </div>
                  {modalData.previewUrl && (
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50"><FileText size={16} className="text-amber-600" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Download</p>
                        <a href={getFullAssetUrl(modalData.previewUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800">
                          Download PDF <ExternalLink size={12} className="shrink-0" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={() => setShowModal(false)} className="w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-extrabold text-white hover:bg-slate-800 cursor-pointer">Done</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* LIVE DOCUMENT PREVIEW */}
      <div ref={printableRef} className="printable-sheet-container mx-auto flex flex-col gap-8 max-w-[800px] multipage-print">

        {/* ── PAGE 1: Offer Letter ── */}
        <div className="printable-sheet relative flex w-full min-h-[296mm] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl text-gray-800 box-border" style={{ padding: 0 }}>
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

          <div className="relative z-10 flex flex-1 flex-col gap-1.5" style={{ padding: '32px 44px 130px 44px' }}>
            <div className="text-right text-[12px] font-semibold text-gray-700 mb-1">Date: {formatDateIN(currentDateStr)}</div>

            <div className="mb-2 text-[12px] leading-relaxed text-gray-800">
              <div className="font-bold">To,</div>
              <div className="mt-0.5 text-[14px] font-extrabold uppercase tracking-wide text-gray-900">{candidateName}</div>
              <div className="mt-0.5">{parentName ? `S/o ${parentName} ` : ''}{addressLine1}</div>
              {addressLine2 && <div>{addressLine2}</div>}
              {addressLine3 && <div>{addressLine3}</div>}
              {(mobile || email) && (
                <div className="mt-0.5">
                  {mobile && <span>Mobile: {mobile}</span>}
                  {mobile && email && <span className="mx-1.5">|</span>}
                  {email && <span>Email: {email}</span>}
                </div>
              )}
            </div>

            <div className="mb-1.5 text-[12px] font-bold text-gray-800">Dear {salutation} {candidateName.split(' ')[0]},</div>

            <div className="mb-2.5 text-center text-[12.5px] font-extrabold uppercase tracking-wider text-gray-900 underline">
              Sub: Offer Letter
            </div>

            <div className="flex flex-col gap-2.5 text-justify text-[12px] leading-relaxed text-gray-800 font-medium">
              <p className="indent-8">
                We are pleased to offer you employment in the capacity of <strong>{designation}</strong>, in <strong>{department}</strong> in M/s. <strong>{companyName}</strong>, {companyRegAddress}.
              </p>
              <p>
                Please report to duty <strong>on or before {formatDateIN(joiningDate)}</strong>. Your base location will be <strong>{baseLocation}</strong>. You will be governed by the policies of the Company. Please be noted that if you fail to report on or before the said date, this offer will cease to exist.
              </p>
              <p>
                We believe that your skills and background would be a valuable asset to our organization. Your monthly and annual consolidated compensation structure is detailed in the attached Annexure A of this offer letter.
              </p>
              <p>
                On your joining date, please bring/send (<strong>{hrEmail}</strong>) the following documents: A) 2 Passport size photographs. B) Photocopy of all Educational and Technical Qualification Certificates.{isFresher ? " C) PAN card, Aadhar card, Driving License copy, etc." : " C) Relieving Letter and Experience Certificate from your present employer. D) Last drawn Salary Slip/Certificate, PAN card, Aadhar card, Driving License copy, etc."} This is a provisional offer letter; the detailed letter with terms and conditions of employment will be handed over to you on your joining date.
              </p>
              <p>
                We look forward to your joining the company and becoming a productive member of the team. <br /><strong>Welcome to {companyName},</strong>
              </p>
            </div>

            <div className="signature-block mt-auto flex flex-row items-end justify-between pt-3 text-[12px] text-gray-800">
              <HrSignatureBlock
                companyName={companyName}
                hrHeadName={hrHeadName}
                hrHeadDesignation={hrHeadDesignation}
                stampSrc={stampSrc}
              />
            </div>
          </div>

          <LetterheadFooter settings={letterheadSettings} />
        </div>

        {/* ── PAGE(S) 2+: Annexure A ── */}
        {displayAnnexurePages.map((pageItems, pageIdx, pagesArr) => (
          <div key={`page-2-sub-${pageIdx}`} className="printable-sheet relative flex w-full min-h-[296mm] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl text-gray-800 box-border" style={{ padding: 0 }}>
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

            <div className="relative z-10 flex flex-1 flex-col gap-2.5" style={{ padding: '32px 44px 130px 44px' }}>
              <div className="text-right text-xs font-semibold text-gray-700 mb-2">Date: {formatDateIN(currentDateStr)}</div>

              <div className="text-center text-sm font-extrabold uppercase tracking-wider text-gray-900 underline mb-3.5">
                Annexure A: Compensation &amp; Allowances Structure
                {pagesArr.length > 1 ? ` - Part ${pageIdx + 1}` : ''}
              </div>

              {pageItems.map((item, itemIdx) => {
                if (item.type === 'metadata') {
                  return (
                    <div key="metadata" className="mb-4 grid grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-100 rounded-lg p-3">
                      <div><span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Employee Name:</span><span className="block font-extrabold text-slate-800">{candidateName}</span></div>
                      <div><span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Designation:</span><span className="block font-extrabold text-slate-800">{designation}</span></div>
                      <div><span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Department:</span><span className="block font-semibold text-slate-700">{department}</span></div>
                      <div><span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Base Location:</span><span className="block font-semibold text-slate-700">{baseLocation}</span></div>
                    </div>
                  );
                }

                if (item.type === 'tableA') {
                  return (
                    <div key={`tableA-${itemIdx}`} className="mb-4">
                      {item.isFirstChunk && (
                        <div className="font-bold text-xs text-gray-800 mb-1.5 uppercase tracking-wide">A. Monthly Salary Breakdown</div>
                      )}
                      <table className="w-full border-collapse border border-slate-200 text-xs">
                        {item.isFirstChunk && (
                          <thead>
                            <tr className="bg-slate-50">
                              <th className="border border-slate-200 px-4 py-2 text-left font-bold text-slate-700">Salary Component</th>
                              <th className="border border-slate-200 px-4 py-2 text-right font-bold text-slate-700">Percentage</th>
                              <th className="border border-slate-200 px-4 py-2 text-right font-bold text-slate-700">Monthly Amount (INR)</th>
                            </tr>
                          </thead>
                        )}
                        <tbody>
                          {item.rows.map((comp) => (
                            <tr key={comp.id}>
                              <td className="border border-slate-200 px-4 py-2">{comp.label || 'Component Name'}</td>
                              <td className="border border-slate-200 px-4 py-2 text-right text-slate-500">
                                {typeof comp.percentage === 'string' ? comp.percentage.replace('%', '') : comp.percentage}%
                              </td>
                              <td className="border border-slate-200 px-4 py-2 text-right font-semibold">₹{Number(comp.amount || 0).toLocaleString('en-IN')}/-</td>
                            </tr>
                          ))}
                          {item.isLastChunk && (
                            <tr className="bg-pink-50/50 font-bold">
                              <td className="border border-slate-200 px-4 py-2 text-pink-700">Gross Monthly Salary</td>
                              <td className="border border-slate-200 px-4 py-2 text-right text-pink-700">{totalPercentage}%</td>
                              <td className="border border-slate-200 px-4 py-2 text-right text-pink-700">₹{totalMonthlySalary.toLocaleString('en-IN')}/-</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      {item.isLastChunk && (
                        <div className="text-[10px] text-slate-400 font-semibold mt-1">
                          * Consolidated Salary: <strong>₹{totalMonthlySalary.toLocaleString('en-IN')}/- per month ({salaryWords} Only)</strong>.
                        </div>
                      )}
                    </div>
                  );
                }

                if (item.type === 'tableB') {
                  return (
                    <div key={`tableB-${itemIdx}`} className="mb-4">
                      {item.isFirstChunk && (
                        <div className="font-bold text-xs text-gray-800 mb-1.5 uppercase tracking-wide">B. Field Work Allowances &amp; Conveyance</div>
                      )}
                      <table className="w-full border-collapse border border-slate-200 text-xs">
                        {item.isFirstChunk && (
                          <thead>
                            <tr className="bg-slate-50">
                              <th className="border border-slate-200 px-4 py-2 text-left font-bold text-slate-700">Allowance</th>
                              <th className="border border-slate-200 px-4 py-2 text-left font-bold text-slate-700">Rate</th>
                            </tr>
                          </thead>
                        )}
                        <tbody>
                          {item.rows.map((comp) => (
                            <tr key={comp.id}>
                              <td className="border border-slate-200 px-4 py-2">{comp.label || 'Allowance Label'}</td>
                              <td className="border border-slate-200 px-4 py-2 font-semibold">{comp.rate || 'Rate / Description'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                if (item.type === 'reporting') {
                  return (
                    <div key="reporting" className="text-[11px] leading-normal text-slate-800 border-l-4 border-pink-400 pl-3 py-1 bg-pink-50/30 rounded-r-lg mb-2.5">
                      <strong>Reporting &amp; Acceptance:</strong> You will report to <strong>{reportingManager} ({reportingPhone})</strong>. Please confirm acceptance on or before <strong>{formatDateIN(joiningDate)}</strong>.
                    </div>
                  );
                }

                if (item.type === 'signatures') {
                  return (
                    <div key="signatures" className="signature-block mt-auto flex flex-row items-end justify-between pt-3 text-[10px] text-gray-800">
                      <HrSignatureBlock
                        companyName={companyName}
                        hrHeadName={hrHeadName}
                        hrHeadDesignation={hrHeadDesignation}
                        stampSrc={stampSrc}
                        compact
                      />
                      <div className="text-right flex flex-col items-end">
                        <div className="font-bold mb-5">Candidate Acceptance Signature</div>
                        <div className="mb-1 w-36 border-t border-gray-400"></div>
                        <div className="text-[9px] font-black uppercase tracking-wide text-gray-950">{candidateName}</div>
                        <div className="text-[8px] font-semibold text-gray-500">Date: ________________</div>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            <LetterheadFooter settings={letterheadSettings} />
          </div>
        ))}

        {/* ── PAGE(S) 3+: Annexure B ── */}
        {displayPages.map((pageSections, pageIdx, pagesArr) => {
          const isLastPage = pageIdx === pagesArr.length - 1;
          return (
            <div key={`page-3-sub-${pageIdx}`} className="printable-sheet relative flex w-full min-h-[296mm] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl text-gray-800 box-border" style={{ padding: 0 }}>
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

              <div className="relative z-10 flex flex-1 flex-col gap-3.5" style={{ padding: '32px 44px 130px 44px' }}>
                <div className="text-right text-xs font-semibold text-gray-700 mb-2">Date: {formatDateIN(currentDateStr)}</div>

                <div className="text-center text-sm font-extrabold uppercase tracking-wider text-gray-900 underline mb-4">
                  Annexure B: Company Terms &amp; Conditions of Employment
                  {pagesArr.length > 1 ? ` - Part ${pageIdx + 1}` : ''}
                </div>

                <div className="flex flex-col gap-4 text-justify text-[11.5px] leading-relaxed text-gray-800 font-medium">
                  {pageSections.map((sec) => (
                    <div key={sec.id}>
                      <strong className="block text-slate-900 uppercase tracking-wide text-[10px] mb-1">{sec.title}</strong>
                      <p>{sec.content}</p>
                    </div>
                  ))}
                </div>

                {isLastPage && (
                  <div className="signature-block mt-auto flex flex-row items-end justify-between pt-3 text-[10px] text-gray-800">
                    <HrSignatureBlock
                      companyName={companyName}
                      hrHeadName={hrHeadName}
                      hrHeadDesignation={hrHeadDesignation}
                      stampSrc={stampSrc}
                      compact
                    />
                    <div className="text-right flex flex-col items-end">
                      <div className="font-bold mb-5">Candidate Acceptance Signature</div>
                      <div className="mb-1 w-36 border-t border-gray-400"></div>
                      <div className="text-[9px] font-black uppercase tracking-wide text-gray-950">{candidateName}</div>
                      <div className="text-[8px] font-semibold text-gray-500">Date: ________________</div>
                    </div>
                  </div>
                )}
              </div>

              <LetterheadFooter settings={letterheadSettings} />
            </div>
          );
        })}

      </div>
    </div>
  );
}

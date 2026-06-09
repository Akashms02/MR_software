import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import html2pdf from 'html2pdf.js';
import { Calendar, Download } from 'lucide-react';

const breakdown = sal => [
  { k: 'Basic Salary',       v: Math.round(sal * 0.50), type: 'earn' },
  { k: 'HRA',                v: Math.round(sal * 0.20), type: 'earn' },
  { k: 'DA',                 v: Math.round(sal * 0.05), type: 'earn' },
  { k: 'Other Allowances',   v: Math.round(sal * 0.05), type: 'earn' },
  { k: 'Gross Pay',          v: Math.round(sal * 0.80), type: 'gross' },
  { k: 'PF (12%)',           v: Math.round(sal * 0.12), type: 'ded' },
  { k: 'ESI (0.75%)',        v: Math.round(sal * 0.0075), type: 'ded' },
  { k: 'TDS',                v: Math.round(sal * 0.05), type: 'ded' },
  { k: 'Net Pay',            v: Math.round(sal * 0.63), type: 'net' },
];

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

function numberToRupeesWords(amount) {
  const words = {
    0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine',
    10: 'Ten', 11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen', 16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen',
    20: 'Twenty', 30: 'Thirty', 40: 'Forty', 50: 'Fifty', 60: 'Sixty', 70: 'Seventy', 80: 'Eighty', 90: 'Ninety'
  };

  if (amount === 0) return 'Rupees Zero Only';

  let n = Math.floor(amount);
  let str = '';

  function getBelowHundred(num) {
    if (num < 20) return words[num];
    const tens = Math.floor(num / 10) * 10;
    const units = num % 10;
    return words[tens] + (units > 0 ? '-' + words[units] : '');
  }

  function getBelowThousand(num) {
    if (num === 0) return '';
    const hundreds = Math.floor(num / 100);
    const rest = num % 100;
    let res = '';
    if (hundreds > 0) res += words[hundreds] + ' Hundred ';
    if (rest > 0) res += getBelowHundred(rest);
    return res.trim();
  }

  if (n >= 10000000) { str += getBelowThousand(Math.floor(n / 10000000)) + ' Crore '; n %= 10000000; }
  if (n >= 100000)   { str += getBelowThousand(Math.floor(n / 100000)) + ' Lakh ';   n %= 100000; }
  if (n >= 1000)     { str += getBelowThousand(Math.floor(n / 1000)) + ' Thousand '; n %= 1000; }
  if (n > 0)         { str += getBelowThousand(n); }

  return 'Rupees ' + str.trim() + ' Only';
}

export default function MSEPayslip() {
  const { user } = useSelector(state => state.auth);
  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const printableRef = useRef(null);

  const empName = user?.fullName || user?.name || 'Medical Sales Executive';
  const empId = user?.employeeId || user?.id || 'MSE001';
  const designation = user?.designation || 'Medical Sales Executive';
  const department = user?.department || 'Sales & Marketing';
  const salary = user?.salary || user?.salaryAmount || 45000;

  // Breakdown figures
  const basic = Math.round(salary * 0.50);
  const hra = Math.round(salary * 0.20);
  const da = Math.round(salary * 0.05);
  const allowances = Math.round(salary * 0.05);
  const gross = Math.round(salary * 0.80);
  const pf = Math.round(salary * 0.12);
  const esi = Math.round(salary * 0.0075);
  const tds = Math.round(salary * 0.05);
  const totalDeductions = pf + esi + tds;
  const netPay = gross - totalDeductions;

  const getFormattedMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleDownload = async () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = `payslip_mse_${selectedMonth}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (!printableRef.current) return;
    setDownloading(true);

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
                  try { return resolveModernColors(val); } catch (e) { return val; }
                }
                return val;
              };
            }
            const val = target[prop];
            if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
              try { return resolveModernColors(val); } catch (e) { return val; }
            }
            if (typeof val === 'function') {
              return val.bind(target);
            }
            return val;
          }
        });
      };

      const element = printableRef.current;
      const formattedMonth = getFormattedMonth(selectedMonth).replace(/\s+/g, '_');
      const opt = {
        margin: [0, 0, 0, 0],
        filename: `payslip_mse_${empName.replace(/\s+/g, '_').toLowerCase()}_${formattedMonth}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          letterRendering: true,
          onclone: (clonedDoc) => {
            const elements = clonedDoc.getElementsByTagName('*');
            
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
                    if (typeof val === 'function') {
                      return val.bind(target);
                    }
                    return val;
                  }
                });
              };
            }

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
                  try { el.style[prop] = resolveModernColors(val); } catch (err) {}
                }
              });
            }
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      if (originalWindowGetComputedStyle) {
        window.getComputedStyle = originalWindowGetComputedStyle;
      }
      setDownloading(false);
    }
  };

  return (
    <div className="animate-[fadeSlideIn_0.35s_ease-out] flex flex-col h-[calc(100vh-104px)] min-h-0 overflow-hidden">
      {/* Top Controls Row */}
      <div className="flex justify-between items-center mb-4 shrink-0 flex-wrap gap-3">
        {/* Month Select */}
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-extrabold text-gray-500 uppercase tracking-[1px] flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-400" /> Select Month:
          </span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-255 text-[13px] bg-white outline-none font-bold text-[#111827] focus:border-[#0D9488] transition-colors duration-150 cursor-pointer"
          />
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 px-[18px] py-2 rounded-xl border-none bg-[#0D9488] text-white font-extrabold text-[12.5px] cursor-pointer shadow-[0_4px_12px_rgba(13,148,136,0.2)] hover:opacity-90 transition-opacity duration-150 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download size={14} strokeWidth={2.5} /> {downloading ? 'Exporting PDF...' : 'Download PDF'}
        </button>
      </div>

      {/* Payslip Preview Container Card */}
      <div className="bg-[#F8FAFC] rounded-[20px] border border-[#E5E7EB] p-6 flex-1 flex justify-center items-start overflow-y-auto min-h-0">
        
        {previewUrl ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-4 max-w-[800px] w-full flex flex-col items-center">
            {previewUrl.endsWith('.pdf') ? (
              <iframe src={previewUrl} className="w-full h-[600px] border-none rounded-lg" title="Payslip PDF" />
            ) : (
              <img src={previewUrl} alt="Payslip Preview" className="max-w-full h-auto object-contain rounded-lg shadow-sm" />
            )}
          </div>
        ) : (
          /* Printable/Preview Sheet */
          <div 
            ref={printableRef} 
            className="bg-white w-full max-w-[800px] border border-gray-200 shadow-md p-8 md:p-12 rounded-xl text-sm font-sans flex flex-col gap-6"
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-[#E5E7EB] pb-4 flex-wrap gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#111827] text-2xl">
                  🔬
                </div>
                <div>
                  <h1 className="text-[17px] font-extrabold uppercase tracking-wide text-gray-900 m-0">
                    GmaxepayHR Pharma Private Limited
                  </h1>
                  <p className="mt-1 max-w-sm text-[12px] text-gray-500 m-0">
                    12, Industrial Area, Phase-I, New Delhi - 110020
                  </p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-[16px] font-extrabold text-gray-900 m-0">
                  PAY SLIP CERTIFICATE
                </h2>
                <p className="mt-1 text-[13.5px] font-bold text-gray-600 m-0">
                  Cycle: {getFormattedMonth(selectedMonth)}
                </p>
              </div>
            </div>

            {/* Employee Info Grid */}
            <div className="grid md:grid-cols-2 gap-5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4.5 text-[13px]">
              <div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="py-1 text-gray-400 font-semibold w-1/3">Employee Name:</td>
                      <td className="py-1 font-bold text-gray-800">{empName}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-400 font-semibold">Employee ID:</td>
                      <td className="py-1 font-bold text-gray-800">{empId}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-400 font-semibold">Designation:</td>
                      <td className="py-1 text-gray-700">{designation}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-400 font-semibold">Department:</td>
                      <td className="py-1 text-gray-700">{department}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="border-t border-[#E5E7EB] pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="py-1 text-gray-400 font-semibold w-1/3">Bank Account:</td>
                      <td className="py-1 font-bold text-gray-700">HDFC Bank · *******4820</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-400 font-semibold">PF Number:</td>
                      <td className="py-1 text-gray-700">PF-10098273</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-400 font-semibold">Days in Month:</td>
                      <td className="py-1 text-gray-700">30 Days</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-400 font-semibold">Worked Days:</td>
                      <td className="py-1 font-bold text-emerald-600">30 Days (0 LOP)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3 border-r border-[#E5E7EB]">Earnings</th>
                    <th className="px-4 py-3 border-r border-[#E5E7EB] text-right">Amount (₹)</th>
                    <th className="px-4 py-3 border-r border-[#E5E7EB]">Deductions</th>
                    <th className="px-4 py-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#E5E7EB]">
                    <td className="px-4 py-3 border-r border-[#E5E7EB] text-gray-500">Basic Salary</td>
                    <td className="px-4 py-3 border-r border-[#E5E7EB] text-right font-medium text-gray-800">{basic.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 border-r border-[#E5E7EB] text-gray-500">Provident Fund (PF)</td>
                    <td className="px-4 py-3 text-right font-medium text-red-650">{pf.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b border-[#E5E7EB]">
                    <td className="px-4 py-3 border-r border-[#E5E7EB] text-gray-500">House Rent Allowance (HRA)</td>
                    <td className="px-4 py-3 border-r border-[#E5E7EB] text-right font-medium text-gray-800">{hra.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 border-r border-[#E5E7EB] text-gray-500">ESI Contribution</td>
                    <td className="px-4 py-3 text-right font-medium text-red-650">{esi.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b border-[#E5E7EB]">
                    <td className="px-4 py-3 border-r border-[#E5E7EB] text-gray-500">Dearness Allowance (DA)</td>
                    <td className="px-4 py-3 border-r border-[#E5E7EB] text-right font-medium text-gray-800">{da.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 border-r border-[#E5E7EB] text-gray-500">TDS</td>
                    <td className="px-4 py-3 text-right font-medium text-red-650">{tds.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="border-b border-[#E5E7EB]">
                    <td className="px-4 py-3 border-r border-[#E5E7EB] text-gray-500">Other Allowances</td>
                    <td className="px-4 py-3 border-r border-[#E5E7EB] text-right font-medium text-gray-800">{allowances.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 border-r border-[#E5E7EB] text-gray-500">-</td>
                    <td className="px-4 py-3 text-right text-gray-400">—</td>
                  </tr>
                  <tr className="bg-[#F9FAFB] font-extrabold border-b border-[#E5E7EB]">
                    <td className="px-4 py-3.5 border-r border-[#E5E7EB] text-gray-900">Total Gross Earnings</td>
                    <td className="px-4 py-3.5 border-r border-[#E5E7EB] text-right text-emerald-700">{gross.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5 border-r border-[#E5E7EB] text-gray-900">Total Deductions</td>
                    <td className="px-4 py-3.5 text-right text-red-600">{totalDeductions.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Net Pay Box */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-5 gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 m-0">Net Take-Home Salary</p>
                <p className="text-[12.5px] text-gray-600 mt-1 mb-0"><span className="font-semibold">In Words:</span> {numberToRupeesWords(netPay)}</p>
              </div>
              <div className="text-right">
                <h2 className="text-[28px] font-black text-emerald-800 m-0">₹{netPay.toLocaleString('en-IN')}</h2>
              </div>
            </div>

            {/* Footer Note */}
            <div className="border-t border-dashed border-[#E5E7EB] pt-4 flex justify-between items-center text-[11px] text-gray-400 mt-2">
              <div>📍 Mode of Payment: Direct Corporate Bank Transfer (NEFT)</div>
              <div>Generated automatically via GmaxepayHR Hub</div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

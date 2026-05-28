import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import html2pdf from 'html2pdf.js'
import { ArrowLeft, Printer, RefreshCw, CheckCircle2, X, Mail, FileText, ExternalLink } from 'lucide-react'
import { PrimaryBtn, OutlineBtn } from '../ui'
import { fetchProfile } from '../../redux/actions/authActions'
import { CompanyPayslip } from '../../redux/actions/companyAction'
import { getMyTeam } from '../../redux/actions/teamActions'

const getFullAssetUrl = (relativeUrl) => {
  if (!relativeUrl) return "";
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://") || relativeUrl.startsWith("data:")) {
    return relativeUrl;
  }
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const base = isLocalhost ? 'https://api-mr-software.gmaxepay.in' : window.location.origin;
  return `${base}${relativeUrl}`;
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

export default function SalarySlip({ onBack }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { team: employees = [] } = useSelector((state) => state.team)

  // Fetch admin profile and team on mount
  useEffect(() => {
    dispatch(fetchProfile())
    dispatch(getMyTeam())
  }, [dispatch])

  const [selectedId, setSelectedId] = useState('')
  const [month, setMonth] = useState('May 2026')

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

    try {
      const sheetElement = printableRef.current
      if (!sheetElement) throw new Error('Document preview not ready. Please try again.')

      const empName = employee.fullName || employee.name || 'employee'
      const fileName = `payslip_${empName.replace(/\s+/g, '_').toLowerCase()}_${month.replace(/\s+/g, '_')}_${Date.now()}.pdf`

      // Configure html2pdf options
      const opt = {
        margin: [0, 0, 0, 0],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          letterRendering: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Generate PDF as a blob
      const pdfBlob = await html2pdf().set(opt).from(sheetElement).output('blob');

      const formData = new FormData()
      formData.append('email', empEmail)
      formData.append('file', pdfBlob, fileName)

      const res = await dispatch(CompanyPayslip(employee.employeeId || selectedId, formData))

      if (res && res.data) {
        setModalData({
          emailSentTo: res.data.emailSentTo || empEmail,
          previewUrl: res.data.previewUrl || '',
          status: res.data.status || 'SENT'
        })
        setModalError('')
        setShowModal(true)
      } else {
        setModalError(res?.message || 'Failed to generate payslip. Backend did not return expected data.')
        setShowModal(true)
      }
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'An unexpected error occurred.')
      setShowModal(true)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
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

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="May 2026">May 2026</option>
          <option value="April 2026">April 2026</option>
          <option value="March 2026">March 2026</option>
          <option value="February 2026">February 2026</option>
        </select>
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

  {/* Payslip Document */}
  <div
    ref={printableRef}
    className="mx-auto max-w-4xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg md:p-12"
  >
    
    {/* Header */}
    <div className="mb-6 flex flex-col justify-between gap-4 border-b-2 border-gray-200 pb-4 md:flex-row">
      
      <div className="flex items-start gap-4">
        
        {user?.logoUrl ? (
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
            <img
              src={getFullAssetUrl(user.logoUrl)}
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
          Cycle: {month}
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
                31 Days
              </td>
            </tr>

            <tr>
              <td className="py-1 text-gray-500">Worked Days:</td>
              <td className="py-1 font-semibold text-emerald-600">
                31 Days (0 LOP)
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

import React, { useState } from 'react'
import { ArrowLeft, Printer, Landmark, FileText } from 'lucide-react'
import { EMPLOYEES } from '../../data/hrmsData'
import { Card, PrimaryBtn, OutlineBtn } from '../ui'

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
    if (hundreds > 0) {
      res += words[hundreds] + ' Hundred '
    }
    if (rest > 0) {
      res += getBelowHundred(rest)
    }
    return res.trim()
  }

  // Crores
  if (n >= 10000000) {
    const cr = Math.floor(n / 10000000)
    str += getBelowThousand(cr) + ' Crore '
    n %= 10000000
  }

  // Lakhs
  if (n >= 100000) {
    const lk = Math.floor(n / 100000)
    str += getBelowThousand(lk) + ' Lakh '
    n %= 100000
  }

  // Thousands
  if (n >= 1000) {
    const th = Math.floor(n / 1000)
    str += getBelowThousand(th) + ' Thousand '
    n %= 1000
  }

  // Remainder
  if (n > 0) {
    str += getBelowThousand(n)
  }

  return 'Rupees ' + str.trim() + ' Only'
}

export default function SalarySlip({ onBack }) {
  const [selectedId, setSelectedId] = useState(EMPLOYEES[0]?.id || '')
  const [month, setMonth] = useState('May 2026')

  const employee = EMPLOYEES.find(e => e.id === selectedId) || EMPLOYEES[0]

  if (!employee) return <div>No employee records available.</div>

  const handlePrint = () => {
    window.print()
  }

  // Exact breakdown matches what is processed in AdminPayroll.jsx
  const sal = employee.salary
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

  return (
    <div className="document-container">
      {/* Control Panel (Screen-only) */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        padding: '16px 24px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid #e5e7eb',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <OutlineBtn onClick={onBack} style={{ padding: '8px 16px', fontSize: '13px' }}>
            <ArrowLeft size={16} /> Back to Hub
          </OutlineBtn>
          <div style={{ height: '24px', width: '1px', background: '#e5e7eb' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Employee:</label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              style={{
                background: '#f9fafb',
                border: '1.5px solid #e5e7eb',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#111827',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {EMPLOYEES.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.id})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Payslip Cycle:</label>
            <select
              value={month}
              onChange={e => setMonth(e.target.value)}
              style={{
                background: '#f9fafb',
                border: '1.5px solid #e5e7eb',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#111827',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="May 2026">May 2026</option>
              <option value="April 2026">April 2026</option>
              <option value="March 2026">March 2026</option>
              <option value="February 2026">February 2026</option>
            </select>
          </div>
        </div>

        <PrimaryBtn onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '13.5px' }}>
          <Printer size={16} /> Print Payslip
        </PrimaryBtn>
      </div>

      {/* Document Sheet View */}
      <div className="printable-sheet" style={{
        background: '#fff',
        margin: '0 auto',
        maxWidth: '800px',
        padding: '48px 60px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#1f2937',
        lineHeight: 1.5,
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '20px', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🔬 GmaxepayHR Pharma Ltd.
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
              Plot 42, Biotech Enclave, BKC, Mumbai - 400051
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: '16px', color: '#111827' }}>PAYSLIP CERTIFICATE</div>
            <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>Cycle: {month}</div>
          </div>
        </div>

        {/* Employee details matrix */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '16px 20px',
          fontSize: '12.5px',
          marginBottom: '24px'
        }}>
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0', color: '#6b7280', width: '120px' }}>Employee Name:</td>
                  <td style={{ padding: '4px 0', fontWeight: 700, color: '#111827' }}>{employee.name}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', color: '#6b7280' }}>Employee ID:</td>
                  <td style={{ padding: '4px 0', fontWeight: 600, color: '#374151' }}>{employee.id}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', color: '#6b7280' }}>Designation:</td>
                  <td style={{ padding: '4px 0', color: '#374151' }}>{employee.designation}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', color: '#6b7280' }}>Department:</td>
                  <td style={{ padding: '4px 0', color: '#374151' }}>{employee.dept}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0', color: '#6b7280', width: '120px' }}>Bank Account:</td>
                  <td style={{ padding: '4px 0', fontWeight: 600, color: '#374151' }}>HDFC Bank · *******{4820 + parseInt(employee.id.slice(-2) || '1')}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', color: '#6b7280' }}>PF Number (UAN):</td>
                  <td style={{ padding: '4px 0', color: '#374151' }}>10098273{employee.id.slice(-3)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', color: '#6b7280' }}>Days in Month:</td>
                  <td style={{ padding: '4px 0', color: '#374151' }}>31 Days</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', color: '#6b7280' }}>Worked Days:</td>
                  <td style={{ padding: '4px 0', color: '#059669', fontWeight: 600 }}>31 Days (0 LOP)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Ledger Table */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12.5px',
          border: '1px solid #e5e7eb',
          marginBottom: '24px'
        }}>
          <thead>
            <tr style={{ background: '#f3f4f6', borderBottom: '1.5px solid #e5e7eb', fontWeight: 700 }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', borderRight: '1px solid #e5e7eb', width: '35%' }}>Earnings</th>
              <th style={{ padding: '10px 14px', textAlign: 'right', borderRight: '1px solid #e5e7eb', width: '15%' }}>Amount (₹)</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', borderRight: '1px solid #e5e7eb', width: '35%' }}>Deductions</th>
              <th style={{ padding: '10px 14px', textAlign: 'right', width: '15%' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px 14px', borderRight: '1px solid #e5e7eb', color: '#4b5563' }}>Basic Salary</td>
              <td style={{ padding: '8px 14px', textAlign: 'right', borderRight: '1px solid #e5e7eb', fontWeight: 500 }}>{basic.toLocaleString('en-IN')}</td>
              <td style={{ padding: '8px 14px', borderRight: '1px solid #e5e7eb', color: '#4b5563' }}>Provident Fund (PF)</td>
              <td style={{ padding: '8px 14px', textAlign: 'right', color: '#dc2626' }}>{pf.toLocaleString('en-IN')}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px 14px', borderRight: '1px solid #e5e7eb', color: '#4b5563' }}>House Rent Allowance (HRA)</td>
              <td style={{ padding: '8px 14px', textAlign: 'right', borderRight: '1px solid #e5e7eb', fontWeight: 500 }}>{hra.toLocaleString('en-IN')}</td>
              <td style={{ padding: '8px 14px', borderRight: '1px solid #e5e7eb', color: '#4b5563' }}>ESI Contribution</td>
              <td style={{ padding: '8px 14px', textAlign: 'right', color: '#dc2626' }}>{esi.toLocaleString('en-IN')}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px 14px', borderRight: '1px solid #e5e7eb', color: '#4b5563' }}>Dearness Allowance (DA)</td>
              <td style={{ padding: '8px 14px', textAlign: 'right', borderRight: '1px solid #e5e7eb', fontWeight: 500 }}>{da.toLocaleString('en-IN')}</td>
              <td style={{ padding: '8px 14px', borderRight: '1px solid #e5e7eb', color: '#4b5563' }}>TDS / Income Tax</td>
              <td style={{ padding: '8px 14px', textAlign: 'right', color: '#dc2626' }}>{tds.toLocaleString('en-IN')}</td>
            </tr>
            <tr style={{ borderBottom: '1.5px solid #e5e7eb' }}>
              <td style={{ padding: '8px 14px', borderRight: '1px solid #e5e7eb', color: '#4b5563' }}>Other Allowances</td>
              <td style={{ padding: '8px 14px', textAlign: 'right', borderRight: '1px solid #e5e7eb', fontWeight: 500 }}>{allowances.toLocaleString('en-IN')}</td>
              <td style={{ padding: '8px 14px', borderRight: '1px solid #e5e7eb', color: '#4b5563' }}>Professional Tax (PT)</td>
              <td style={{ padding: '8px 14px', textAlign: 'right', color: '#dc2626' }}>0</td>
            </tr>
            <tr style={{ fontWeight: 'bold', background: '#f9fafb' }}>
              <td style={{ padding: '10px 14px', borderRight: '1px solid #e5e7eb' }}>Total Gross Earnings</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', borderRight: '1px solid #e5e7eb', color: '#065f46' }}>{gross.toLocaleString('en-IN')}</td>
              <td style={{ padding: '10px 14px', borderRight: '1px solid #e5e7eb' }}>Total Deductions</td>
              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#dc2626' }}>{totalDeductions.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        {/* Net payout row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f0fdf4',
          border: '1.5px solid #bbf7d0',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#047857', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Take-Home Salary</div>
            <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px', fontWeight: 500 }}>
              <strong>In Words:</strong> {numberToRupeesWords(netPay)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#047857', letterSpacing: '-0.5px' }}>
              ₹{netPay.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Note / Disclaimer */}
        <div style={{
          borderTop: '1px dashed #e5e7eb',
          paddingTop: '16px',
          marginTop: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: '#9ca3af'
        }}>
          <div>
            📍 Mode of Payment: Direct Corporate Bank Transfer (NEFT)<br />
            ⚠️ This is an digitally approved computer-generated payslip, no signature required.
          </div>
          <div style={{
            border: '1.5px solid rgba(5, 150, 105, 0.2)',
            borderRadius: '6px',
            padding: '4px 8px',
            color: 'rgba(5, 150, 105, 0.45)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transform: 'rotate(-4deg)',
            userSelect: 'none'
          }}>
            PAID · GPHR
          </div>
        </div>
      </div>
    </div>
  )
}

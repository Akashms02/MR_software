import { useState } from 'react'
import { EMPLOYEES, PAYROLL_HISTORY } from '../../data/hrmsData'
import {
  Card, SectionHeader, StatusBadge,
  TableWrap, Th, Td, TabBar, StatCard
} from '../../components/ui'

const TABS = [
  { id: 'summary', icon: '📊', label: 'Summary'  },
  { id: 'payslip', icon: '🧾', label: 'Payslips' },
  { id: 'history', icon: '📋', label: 'History'  },
]

const breakdown = sal => ({
  'Basic Salary':      Math.round(sal * 0.50),
  'HRA':               Math.round(sal * 0.20),
  'DA':                Math.round(sal * 0.05),
  'Other Allowances':  Math.round(sal * 0.05),
  'Gross Pay':         Math.round(sal * 0.80),
  'PF (12%)':          Math.round(sal * 0.12),
  'ESI (0.75%)':       Math.round(sal * 0.0075),
  'TDS':               Math.round(sal * 0.05),
  'Net Pay':           Math.round(sal * 0.63),
})

const EARNING_KEYS  = ['Basic Salary','HRA','DA','Other Allowances']
const DEDUCT_KEYS   = ['PF (12%)','ESI (0.75%)','TDS']

export default function AdminPayroll({ role }) {
  const [tab, setTab]           = useState('summary')
  const [empId, setEmpId]       = useState('')
  const [showModal, setModal]   = useState(false)
  const [processed, setProc]    = useState(false)

  const selectedEmp = EMPLOYEES.find(e => e.id === empId) || null
  const totalGross  = EMPLOYEES.reduce((s, e) => s + Math.round(e.salary * 0.80), 0)
  const totalNet    = EMPLOYEES.reduce((s, e) => s + Math.round(e.salary * 0.63), 0)

  return (
    <div>
      <SectionHeader
        title="Payroll & Salary"
        sub="May 2026 Payroll Cycle"
        action={<TabBar tabs={TABS} active={tab} onChange={setTab} />}
      />

      {/* ── Summary ─────────────────────────────────────────────── */}
      {tab === 'summary' && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-3.5 mb-6">
            <StatCard icon="👥" label="Total Employees" value={EMPLOYEES.length} color="#16a34a" />
            <StatCard icon="💼" label="Gross Payroll" value={`₹${(totalGross/100000).toFixed(1)}L`} color="#0891b2" bgColor="#e0f2fe" />
            <StatCard icon="💰" label="Net Payroll"   value={`₹${(totalNet/100000).toFixed(1)}L`}  color="#7c3aed" bgColor="#ede9fe" />
            <StatCard icon="📊" label="Avg Net Salary" value={`₹${Math.round(totalNet/EMPLOYEES.length/1000)}K`} color="#d97706" bgColor="#fef3c7" />
          </div>

          {/* Run Payroll card */}
          {!processed ? (
            <Card className="mb-6 p-6 border-[1.5px] border-[#bbf7d0] bg-gradient-to-br from-[#f0fdf4] to-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="font-bold text-base text-[#111827] mb-1">Run May 2026 Payroll</div>
                  <div className="text-[13px] text-[#6b7280]">
                    {EMPLOYEES.length} employees · Estimated net: <strong className="text-[#16a34a]">₹{totalNet.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
                {role === 'HR Admin' && (
                  <button
                    onClick={() => setModal(true)}
                    className="btn-lime px-6 py-[11px] text-[14px] cursor-pointer font-bold rounded-lg border-0 transition-colors duration-150"
                  >
                    ▶ Process Payroll
                  </button>
                )}
              </div>
            </Card>
          ) : (
            <Card className="mb-6 p-5 border-[1.5px] border-[#bbf7d0] bg-[#f0fdf4]">
              <div className="text-[#16a34a] font-semibold text-[14px]">✅ Payroll processed for May 2026. Payslips sent to all employees.</div>
            </Card>
          )}

          {/* Confirm Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-900/40 z-[400] flex items-center justify-center">
              <Card className="w-[420px] p-7 rounded-2xl border-[1.5px] border-[#e5e7eb] z-[401]">
                <div className="text-[28px] mb-3">⚠️</div>
                <div className="font-bold text-[18px] text-[#111827] mb-2.5">Confirm Payroll Run</div>
                <p className="text-[14px] text-[#6b7280] leading-relaxed mb-5">
                  This will process payroll for <strong className="text-[#111827]">{EMPLOYEES.length} employees</strong>,
                  totalling <strong className="text-[#16a34a]">₹{totalNet.toLocaleString('en-IN')}</strong> net payout. This action cannot be undone.
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => { setProc(true); setModal(false) }}
                    className="btn-lime px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer border-0"
                  >
                    ✅ Confirm & Process
                  </button>
                  <button
                    onClick={() => setModal(false)}
                    className="px-5 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#374151] font-bold text-sm cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* Salary Table */}
          <TableWrap>
            <div className="px-5 py-3.5 border-b border-[#e5e7eb] font-bold text-[14px] text-[#111827]">Employee Salary Breakdown</div>
            <table className="w-full border-collapse">
              <thead><tr>{['Employee','Basic','HRA','Allowances','Gross','PF','TDS','Net Pay'].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
              <tbody>
                {EMPLOYEES.map(emp => {
                  const b = breakdown(emp.salary)
                  return (
                    <tr key={emp.id} className="transition-colors duration-100 hover:bg-[#f9fafb]">
                      <Td className="font-semibold text-[#111827]">{emp.name}</Td>
                      {[b['Basic Salary'], b.HRA, b['Other Allowances'], b['Gross Pay'], b['PF (12%)'], b.TDS, b['Net Pay']].map((v, i) => (
                        <Td 
                          key={i} 
                          className={i === 6 ? 'text-[#16a34a] font-bold' : i >= 4 ? 'text-[#dc2626]' : 'text-[#374151]'}
                        >
                          ₹{v.toLocaleString('en-IN')}
                        </Td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </TableWrap>
        </>
      )}

      {/* ── Payslip ─────────────────────────────────────────────── */}
      {tab === 'payslip' && (
        <div>
          <div className="mb-5">
            <select
              value={empId}
              onChange={e => setEmpId(e.target.value)}
              className="bg-white border-[1.5px] border-[#e5e7eb] rounded-lg px-3 py-2 text-[#374151] text-[13px] outline-none min-w-[280px]"
            >
              <option value="">Select Employee…</option>
              {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name} — {e.id}</option>)}
            </select>
          </div>

          {selectedEmp && (
            <Card className="max-w-[580px] p-7">
              {/* Header */}
              <div className="flex justify-between items-start pb-4.5 border-b border-[#f3f4f6] mb-5">
                <div>
                  <div className="font-bold text-[20px] text-[#16a34a]">GmaxepayHR Pharma</div>
                  <div className="text-[12px] text-[#9ca3af]">Payslip — April 2026</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[15px] text-[#111827]">{selectedEmp.name}</div>
                  <div className="text-[12px] text-[#9ca3af]">{selectedEmp.id} · {selectedEmp.dept}</div>
                </div>
              </div>

              {/* Earnings + Deductions */}
              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <div className="text-[11px] font-bold text-[#16a34a] uppercase tracking-wider mb-3">Earnings</div>
                  {EARNING_KEYS.map(k => {
                    const b = breakdown(selectedEmp.salary)
                    return (
                      <div key={k} className="flex justify-between py-2 border-b border-[#f9fafb] text-[13px]">
                        <span className="text-[#6b7280]">{k}</span>
                        <span className="text-[#111827] font-medium">₹{b[k].toLocaleString('en-IN')}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="pl-4 border-l border-[#f3f4f6]">
                  <div className="text-[11px] font-bold text-[#dc2626] uppercase tracking-wider mb-3">Deductions</div>
                  {DEDUCT_KEYS.map(k => {
                    const b = breakdown(selectedEmp.salary)
                    return (
                      <div key={k} className="flex justify-between py-2 border-b border-[#f9fafb] text-[13px]">
                        <span className="text-[#6b7280]">{k}</span>
                        <span className="text-[#dc2626]">₹{b[k].toLocaleString('en-IN')}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Net Pay */}
              <div className="p-4 bg-[#f0fdf4] border-[1.5px] border-[#bbf7d0] rounded-xl flex items-center justify-between mb-4">
                <span className="font-bold text-[15px] text-[#374151]">Net Pay</span>
                <span className="font-extrabold text-[24px] text-[#16a34a]">₹{breakdown(selectedEmp.salary)['Net Pay'].toLocaleString('en-IN')}</span>
              </div>
              <button className="w-full px-5 py-2.5 rounded-lg border border-[#e5e7eb] bg-white text-[#374151] font-bold text-sm cursor-pointer hover:bg-gray-50 transition-colors duration-150">
                ⬇ Download PDF
              </button>
            </Card>
          )}
        </div>
      )}

      {/* ── History ─────────────────────────────────────────────── */}
      {tab === 'history' && (
        <TableWrap>
          <div className="px-5 py-3.5 border-b border-[#e5e7eb] font-bold text-[14px] text-[#111827]">Payroll History</div>
          <table className="w-full border-collapse">
            <thead><tr>{['Month','Employees','Gross Payroll','Net Payroll','Status',''].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
            <tbody>
              {PAYROLL_HISTORY.map(h => (
                <tr key={h.month} className="transition-colors duration-100 hover:bg-[#f9fafb]">
                  <Td className="font-semibold text-[#111827]">{h.month}</Td>
                  <Td>{h.employees}</Td>
                  <Td className="text-[#6b7280]">{h.gross}</Td>
                  <Td className="text-[#16a34a] font-bold">{h.net}</Td>
                  <Td><StatusBadge status={h.status} /></Td>
                  <Td>
                    <button className="px-3 py-1.25 rounded-md border border-[#e5e7eb] bg-white text-[#6b7280] text-xs cursor-pointer hover:bg-gray-50 font-medium font-sans">
                      ⬇ Download
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </div>
  )
}

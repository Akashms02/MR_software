import { useState } from 'react'
import { EMPLOYEES, PAYROLL_HISTORY } from '../../data/hrmsData'
import {
  Card, SectionHeader, StatusBadge, PrimaryBtn, OutlineBtn,
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

  const inStyle = {
    background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '8px',
    padding: '9px 12px', color: '#374151', fontSize: '13px',
    fontFamily: 'inherit', outline: 'none',
  }

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
            <StatCard icon="👥" label="Total Employees" value={EMPLOYEES.length} color="#16a34a" />
            <StatCard icon="💼" label="Gross Payroll" value={`₹${(totalGross/100000).toFixed(1)}L`} color="#0891b2" bgColor="#e0f2fe" />
            <StatCard icon="💰" label="Net Payroll"   value={`₹${(totalNet/100000).toFixed(1)}L`}  color="#7c3aed" bgColor="#ede9fe" />
            <StatCard icon="📊" label="Avg Net Salary" value={`₹${Math.round(totalNet/EMPLOYEES.length/1000)}K`} color="#d97706" bgColor="#fef3c7" />
          </div>

          {/* Run Payroll card */}
          {!processed ? (
            <Card style={{ marginBottom: '24px', padding: '24px', border: '1.5px solid #bbf7d0', background: 'linear-gradient(135deg,#f0fdf4,#fff)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#111827', marginBottom: '4px' }}>Run May 2026 Payroll</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {EMPLOYEES.length} employees · Estimated net: <strong style={{ color: '#16a34a' }}>₹{totalNet.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
                {role === 'HR Admin' && (
                  <PrimaryBtn onClick={() => setModal(true)} style={{ padding: '11px 24px', fontSize: '14px' }}>
                    ▶ Process Payroll
                  </PrimaryBtn>
                )}
              </div>
            </Card>
          ) : (
            <Card style={{ marginBottom: '24px', padding: '20px', border: '1.5px solid #bbf7d0', background: '#f0fdf4' }}>
              <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '14px' }}>✅ Payroll processed for May 2026. Payslips sent to all employees.</div>
            </Card>
          )}

          {/* Confirm Modal */}
          {showModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.4)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Card style={{ width: '420px', padding: '28px', borderRadius: '16px', border: '1.5px solid #e5e7eb', zIndex: 401 }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>⚠️</div>
                <div style={{ fontWeight: 700, fontSize: '18px', color: '#111827', marginBottom: '10px' }}>Confirm Payroll Run</div>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '20px' }}>
                  This will process payroll for <strong style={{ color: '#111827' }}>{EMPLOYEES.length} employees</strong>,
                  totalling <strong style={{ color: '#16a34a' }}>₹{totalNet.toLocaleString('en-IN')}</strong> net payout. This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <PrimaryBtn onClick={() => { setProc(true); setModal(false) }}>✅ Confirm & Process</PrimaryBtn>
                  <OutlineBtn onClick={() => setModal(false)}>Cancel</OutlineBtn>
                </div>
              </Card>
            </div>
          )}

          {/* Salary Table */}
          <TableWrap>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '14px', color: '#111827' }}>Employee Salary Breakdown</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Employee','Basic','HRA','Allowances','Gross','PF','TDS','Net Pay'].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
              <tbody>
                {EMPLOYEES.map(emp => {
                  const b = breakdown(emp.salary)
                  return (
                    <tr key={emp.id}
                      style={{ transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Td style={{ fontWeight: 600, color: '#111827' }}>{emp.name}</Td>
                      {[b['Basic Salary'], b.HRA, b['Other Allowances'], b['Gross Pay'], b['PF (12%)'], b.TDS, b['Net Pay']].map((v, i) => (
                        <Td key={i} style={{ color: i === 6 ? '#16a34a' : i >= 4 ? '#dc2626' : '#374151', fontWeight: i === 6 ? 700 : 400 }}>
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
          <div style={{ marginBottom: '20px' }}>
            <select value={empId} onChange={e => setEmpId(e.target.value)} style={{ ...inStyle, minWidth: '280px' }}>
              <option value="">Select Employee…</option>
              {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name} — {e.id}</option>)}
            </select>
          </div>

          {selectedEmp && (
            <Card style={{ maxWidth: '580px', padding: '28px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '18px', borderBottom: '1px solid #f3f4f6', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '20px', color: '#16a34a' }}>GreenHR Pharma</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>Payslip — April 2026</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>{selectedEmp.name}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{selectedEmp.id} · {selectedEmp.dept}</div>
                </div>
              </div>

              {/* Earnings + Deductions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Earnings</div>
                  {EARNING_KEYS.map(k => {
                    const b = breakdown(selectedEmp.salary)
                    return (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9fafb', fontSize: '13px' }}>
                        <span style={{ color: '#6b7280' }}>{k}</span>
                        <span style={{ color: '#111827', fontWeight: 500 }}>₹{b[k].toLocaleString('en-IN')}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ paddingLeft: '16px', borderLeft: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Deductions</div>
                  {DEDUCT_KEYS.map(k => {
                    const b = breakdown(selectedEmp.salary)
                    return (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9fafb', fontSize: '13px' }}>
                        <span style={{ color: '#6b7280' }}>{k}</span>
                        <span style={{ color: '#dc2626' }}>₹{b[k].toLocaleString('en-IN')}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Net Pay */}
              <div style={{ padding: '16px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontWeight: 700, fontSize: '15px', color: '#374151' }}>Net Pay</span>
                <span style={{ fontWeight: 800, fontSize: '24px', color: '#16a34a' }}>₹{breakdown(selectedEmp.salary)['Net Pay'].toLocaleString('en-IN')}</span>
              </div>
              <OutlineBtn>⬇ Download PDF</OutlineBtn>
            </Card>
          )}
        </div>
      )}

      {/* ── History ─────────────────────────────────────────────── */}
      {tab === 'history' && (
        <TableWrap>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '14px', color: '#111827' }}>Payroll History</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Month','Employees','Gross Payroll','Net Payroll','Status',''].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
            <tbody>
              {PAYROLL_HISTORY.map(h => (
                <tr key={h.month}
                  style={{ transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Td style={{ fontWeight: 600, color: '#111827' }}>{h.month}</Td>
                  <Td>{h.employees}</Td>
                  <Td style={{ color: '#6b7280' }}>{h.gross}</Td>
                  <Td style={{ color: '#16a34a', fontWeight: 700 }}>{h.net}</Td>
                  <Td><StatusBadge status={h.status} /></Td>
                  <Td>
                    <button style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
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

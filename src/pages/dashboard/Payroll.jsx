import { useState } from 'react'
import { EMPLOYEES, PAYROLL_HISTORY } from './data'
import { Card, SectionHeader, StatusBadge, PrimaryBtn, GhostBtn } from '../../components/ui'
import { COLORS } from './colors'

const C = COLORS

const BREAKDOWN = (salary) => ({
  Basic:        Math.round(salary * 0.50),
  HRA:          Math.round(salary * 0.20),
  'DA':         Math.round(salary * 0.05),
  'Other Allowances': Math.round(salary * 0.05),
  'Gross Pay':  Math.round(salary * 0.80),
  'PF (12%)':   Math.round(salary * 0.12),
  'ESI (0.75%)':Math.round(salary * 0.0075),
  'TDS':        Math.round(salary * 0.05),
  'Net Pay':    Math.round(salary * 0.63),
})

const EARNING_KEYS    = ['Basic','HRA','DA','Other Allowances']
const DEDUCTION_KEYS  = ['PF (12%)','ESI (0.75%)','TDS']
const TOTAL_KEYS      = ['Gross Pay','Net Pay']

export default function Payroll({ role }) {
  const [view, setView]           = useState('summary')
  const [showConfirm, setConfirm] = useState(false)
  const [processed, setProcessed] = useState(false)
  const [selectedEmp, setEmp]     = useState(null)

  const totalGross = EMPLOYEES.reduce((s, e) => s + Math.round(e.salary * 0.80), 0)
  const totalNet   = EMPLOYEES.reduce((s, e) => s + Math.round(e.salary * 0.63), 0)

  const handleConfirm = () => {
    setProcessed(true)
    setConfirm(false)
  }

  return (
    <div>
      <SectionHeader
        title="Payroll & Salary"
        sub="May 2026 Payroll Cycle"
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            {['summary','payslip','history'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '8px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                background: view === v ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.04)',
                color: view === v ? C.teal : C.muted,
                fontWeight: view === v ? 600 : 400, fontSize: '13px', fontFamily: 'inherit',
              }}>
                {v === 'summary' ? '📊 Summary' : v === 'payslip' ? '🧾 Payslips' : '📋 History'}
              </button>
            ))}
          </div>
        }
      />

      {/* ── Summary ───────────────────────────────────── */}
      {view === 'summary' && (
        <>
          {/* KPI tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
            {[
              { label: 'Total Employees',  value: EMPLOYEES.length,                   color: C.teal },
              { label: 'Gross Payroll',    value: `₹${(totalGross/100000).toFixed(1)}L`, color: '#a78bfa' },
              { label: 'Net Payroll',      value: `₹${(totalNet/100000).toFixed(1)}L`,  color: C.teal },
              { label: 'Avg Salary',       value: `₹${Math.round(totalNet/EMPLOYEES.length/1000)}K`,color: C.pink },
            ].map(k => (
              <Card key={k.label} style={{ padding: '18px' }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 800, color: k.color, marginBottom: '4px' }}>{k.value}</div>
                <div style={{ fontSize: '12px', color: C.muted }}>{k.label}</div>
              </Card>
            ))}
          </div>

          {/* Run Payroll */}
          {!processed ? (
            <Card style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(45,212,191,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 700, color: C.text }}>Run May 2026 Payroll</div>
                  <div style={{ fontSize: '13px', color: C.muted, marginTop: '4px' }}>{EMPLOYEES.length} employees · Estimated net: ₹{totalNet.toLocaleString('en-IN')}</div>
                </div>
                {(role === 'HR Admin') && (
                  <PrimaryBtn onClick={() => setConfirm(true)} style={{ fontSize: '14px', padding: '11px 24px' }}>
                    ▶ Process Payroll
                  </PrimaryBtn>
                )}
              </div>
            </Card>
          ) : (
            <Card style={{ padding: '20px', marginBottom: '24px', border: '1px solid rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.05)' }}>
              <div style={{ color: '#4ade80', fontWeight: 600, fontSize: '15px' }}>✅ Payroll processed for May 2026. Payslips sent to all employees.</div>
            </Card>
          )}

          {/* 2FA Confirm Modal */}
          {showConfirm && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(2,11,20,0.8)', zIndex: 300,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Card style={{ width: '400px', padding: '28px' }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 700, color: C.text, marginBottom: '12px' }}>⚠️ Confirm Payroll Run</div>
                <p style={{ fontSize: '14px', color: C.muted, marginBottom: '20px', lineHeight: 1.6 }}>
                  You are about to process payroll for <strong style={{ color: C.text }}>{EMPLOYEES.length} employees</strong> totalling <strong style={{ color: C.teal }}>₹{totalNet.toLocaleString('en-IN')}</strong>. This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <PrimaryBtn onClick={handleConfirm}>✅ Confirm & Process</PrimaryBtn>
                  <GhostBtn onClick={() => setConfirm(false)}>Cancel</GhostBtn>
                </div>
              </Card>
            </div>
          )}

          {/* Employee Salary Table */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '14px', fontWeight: 700, color: C.text }}>Employee Salary Breakdown</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {['Employee','Basic','HRA','Allowances','Gross','PF','TDS','Net Pay'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', fontSize: '11px', fontWeight: 600, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.7px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EMPLOYEES.map(emp => {
                    const b = BREAKDOWN(emp.salary)
                    return (
                      <tr key={emp.id} className="dash-table">
                        <td style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', color: C.text, fontWeight: 600 }}>{emp.name}</td>
                        {[b.Basic, b.HRA, b['Other Allowances'], b['Gross Pay'], b['PF (12%)'], b.TDS, b['Net Pay']].map((v, i) => (
                          <td key={i} style={{ padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', color: i === 6 ? C.teal : i >= 4 ? '#f87171' : C.muted, fontWeight: i === 6 ? 700 : 400 }}>
                            ₹{v.toLocaleString('en-IN')}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* ── Payslip View ──────────────────────────────── */}
      {view === 'payslip' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <select onChange={e => setEmp(EMPLOYEES.find(x => x.id === e.target.value) || null)}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', color: C.text, fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}>
              <option value="">Select Employee…</option>
              {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name} — {e.id}</option>)}
            </select>
          </div>
          {selectedEmp && (
            <Card style={{ padding: '28px', maxWidth: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 800, color: C.teal }}>GreenHR Pharma</div>
                  <div style={{ fontSize: '12px', color: C.muted }}>Payslip — April 2026</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: C.text }}>{selectedEmp.name}</div>
                  <div style={{ fontSize: '12px', color: C.muted }}>{selectedEmp.id} · {selectedEmp.dept}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Earnings</div>
                  {EARNING_KEYS.map(k => {
                    const b = BREAKDOWN(selectedEmp.salary)
                    return (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px' }}>
                        <span style={{ color: C.muted }}>{k}</span>
                        <span style={{ color: C.text }}>₹{b[k].toLocaleString('en-IN')}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ paddingLeft: '24px', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Deductions</div>
                  {DEDUCTION_KEYS.map(k => {
                    const b = BREAKDOWN(selectedEmp.salary)
                    return (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px' }}>
                        <span style={{ color: C.muted }}>{k}</span>
                        <span style={{ color: '#f87171' }}>₹{b[k].toLocaleString('en-IN')}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Net Pay Banner */}
              <div style={{ marginTop: '20px', padding: '16px', borderRadius: '10px', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: C.text, fontSize: '15px' }}>Net Pay</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 800, color: C.teal }}>₹{BREAKDOWN(selectedEmp.salary)['Net Pay'].toLocaleString('en-IN')}</span>
              </div>
              <div style={{ marginTop: '16px' }}>
                <GhostBtn>⬇ Download PDF</GhostBtn>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── History ───────────────────────────────────── */}
      {view === 'history' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '14px', fontWeight: 700, color: C.text }}>Payroll History</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['Month','Employees','Gross Payroll','Net Payroll','Status',''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', fontSize: '11px', fontWeight: 600, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.7px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAYROLL_HISTORY.map(h => (
                <tr key={h.month}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', color: C.text, fontWeight: 600 }}>{h.month}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', color: C.muted }}>{h.employees}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', color: C.muted }}>{h.gross}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', color: C.teal, fontWeight: 600 }}>{h.net}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}><StatusBadge status={h.status} /></td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <GhostBtn style={{ padding: '5px 10px', fontSize: '12px' }}>⬇ Download</GhostBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

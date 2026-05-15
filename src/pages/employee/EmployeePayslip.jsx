import { Card, SectionHeader, OutlineBtn } from '../../components/ui'
import { EMPLOYEES } from '../../data/hrmsData'

const ME = EMPLOYEES.find(e => e.id === 'GH002')

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
]

const MONTHS = ['April 2026','March 2026','February 2026','January 2026','December 2025']

export default function EmployeePayslip() {
  return (
    <div>
      <SectionHeader title="My Payslips" sub="View and download your monthly payslips" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Current Payslip */}
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6', marginBottom: '18px' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '18px', color: '#16a34a' }}>GreenHR Pharma</div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>Payslip — April 2026</div>
            </div>
            <OutlineBtn style={{ fontSize: '12px', padding: '6px 12px' }}>⬇ PDF</OutlineBtn>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', marginBottom: '18px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px' }}>👤</div>
            <div>
              <div style={{ fontWeight: 700, color: '#111827', fontSize: '14px' }}>{ME.name}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{ME.id} · {ME.dept}</div>
            </div>
          </div>

          {breakdown(ME.salary).map(({ k, v, type }) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between', padding: '9px 0',
              borderBottom: '1px solid #f9fafb',
              background: type === 'net' ? '#f0fdf4' : 'transparent',
              paddingLeft: type === 'net' ? '8px' : 0, paddingRight: type === 'net' ? '8px' : 0,
              borderRadius: type === 'net' ? '6px' : 0,
            }}>
              <span style={{ fontSize: '13px', color: type === 'ded' ? '#dc2626' : type === 'net' ? '#16a34a' : '#6b7280', fontWeight: type === 'net' ? 700 : 500 }}>{k}</span>
              <span style={{ fontSize: '13px', color: type === 'net' ? '#16a34a' : type === 'ded' ? '#dc2626' : '#111827', fontWeight: type === 'net' ? 800 : 500 }}>
                {type === 'ded' ? '−' : ''}₹{v.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </Card>

        {/* History */}
        <Card style={{ padding: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '16px' }}>Payslip History</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {MONTHS.map((m, i) => (
              <div key={m} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: '10px', background: '#f9fafb',
                border: '1px solid #f3f4f6',
                transition: 'border-color 0.15s, background 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#bbf7d0'; e.currentTarget.style.background = '#f0fdf4' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.background = '#f9fafb' }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{m}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>₹{Math.round(ME.salary * 0.63).toLocaleString('en-IN')} net</div>
                </div>
                <button style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                  ⬇ Download
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

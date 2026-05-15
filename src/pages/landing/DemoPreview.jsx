import { useState } from 'react'

const TABS = ['Payroll', 'Attendance', 'Compliance']

const PAYROLL = [
  { name: 'Aisha Sharma',  role: 'Sr. MR',       basic: '₹32,000', hra: '₹12,800', net: '₹55,000',  status: 'Processed', color: '#16a34a' },
  { name: 'Rohit Verma',   role: 'Area Manager',  basic: '₹45,000', hra: '₹18,000', net: '₹76,500',  status: 'Processed', color: '#16a34a' },
  { name: 'Priya Nair',    role: 'MR',            basic: '₹25,000', hra: '₹10,000', net: '₹42,000',  status: 'Pending',   color: '#d97706' },
  { name: 'Ankit Joshi',   role: 'Pharmacist',    basic: '₹28,000', hra: '₹11,200', net: '₹47,200',  status: 'Processed', color: '#16a34a' },
  { name: 'Sneha Patil',   role: 'Lab Tech',      basic: '₹22,000', hra: '₹8,800',  net: '₹37,000',  status: 'On Hold',   color: '#dc2626' },
]

const ATTENDANCE = [
  { name: 'Aisha Sharma',  dept: 'Sales',     present: 24, absent: 2, leave: 4, status: 'Active',    color: '#16a34a' },
  { name: 'Rohit Verma',   dept: 'Sales',     present: 26, absent: 0, leave: 4, status: 'Active',    color: '#16a34a' },
  { name: 'Priya Nair',    dept: 'Marketing', present: 20, absent: 4, leave: 6, status: 'On Leave',  color: '#2563eb' },
  { name: 'Ankit Joshi',   dept: 'QA/QC',    present: 25, absent: 1, leave: 4, status: 'Active',    color: '#16a34a' },
  { name: 'Sneha Patil',   dept: 'Lab',       present: 22, absent: 3, leave: 5, status: 'Active',    color: '#16a34a' },
]

const COMPLIANCE = [
  { type: 'PF Contribution', month: 'Apr 2026', due: '15 May 2026', amount: '₹1,84,500', status: 'Filed',   color: '#16a34a' },
  { type: 'ESI Contribution', month: 'Apr 2026', due: '15 May 2026', amount: '₹62,400',  status: 'Filed',   color: '#16a34a' },
  { type: 'TDS (Salary)',      month: 'Apr 2026', due: '07 May 2026', amount: '₹94,200',  status: 'Filed',   color: '#16a34a' },
  { type: 'Prof. Tax (PT)',    month: 'Apr 2026', due: '30 Apr 2026', amount: '₹18,750',  status: 'Filed',   color: '#16a34a' },
  { type: 'LWF',               month: 'Apr 2026', due: '31 May 2026', amount: '₹3,200',   status: 'Pending', color: '#d97706' },
]

function StatusBadge({ status, color }) {
  const bg = color === '#16a34a' ? '#dcfce7' : color === '#d97706' ? '#fef3c7' : color === '#dc2626' ? '#fee2e2' : '#dbeafe'
  const border = color === '#16a34a' ? '#bbf7d0' : color === '#d97706' ? '#fde68a' : color === '#dc2626' ? '#fecaca' : '#bfdbfe'
  return (
    <span style={{
      padding: '2px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 600,
      background: bg, border: `1px solid ${border}`, color,
    }}>{status}</span>
  )
}

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function DemoPreview() {
  const [tab, setTab] = useState('Payroll')
  const ref = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // GSAP-like Parallax Effect
  const yOffset = useTransform(scrollYProgress, [0, 1], [100, -100])
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, -10])

  return (
    <section ref={ref} className="section-spacing" style={{ background: '#fff', perspective: '1500px', overflow: 'hidden' }}>
      <div className="section-container">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
          style={{ marginBottom: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <div className="section-label">🖥️ Live Demo Preview</div>
          <h2 className="section-title">See GmaxepayHR in Action</h2>
        </motion.div>

        <motion.div 
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            y: yOffset, rotateX: rotateX
          }}
        >
          {/* Tabs */}
          <div style={{
            display: 'inline-flex', gap: '4px', padding: '4px',
            background: 'var(--bg-section)', border: '1px solid var(--border)',
            borderRadius: '10px', marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            {TABS.map(t => (
              <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                {t === 'Payroll' ? '💰' : t === 'Attendance' ? '📅' : '⚖️'} {t}
              </button>
            ))}
          </div>

          {/* Browser Window Mockup */}
          <motion.div 
            whileHover={{ scale: 1.02 }} transition={{ type: 'spring', bounce: 0.4 }}
            className="browser-mockup" style={{ width: '100%', maxWidth: '900px', margin: '0 auto', boxShadow: '0 40px 80px rgba(0,0,0,0.15)', borderRadius: '16px', border: '1px solid var(--border)', background: '#fff', overflow: 'hidden' }}
          >
            <div className="browser-header" style={{ padding: '16px 20px', background: 'var(--bg-section)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="browser-dots" style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, background: '#fff', padding: '4px 16px', borderRadius: '6px', border: '1px solid var(--border)' }}>app.gmaxepayhr.in/dashboard</div>
            </div>

            <div style={{ padding: '0', background: '#fff' }}>
              <div style={{ overflowX: 'auto' }}>
                {tab === 'Payroll' && (
                  <table className="demo-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ borderBottom: '1px solid var(--border)', background: '#FAFAFA' }}><tr>{['Employee','Role','Basic','HRA','Net Pay','Status'].map(h => <th key={h} style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {PAYROLL.map((r, i) => (
                        <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{r.name}</td>
                          <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>{r.role}</td><td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>{r.basic}</td><td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>{r.hra}</td>
                          <td style={{ padding: '16px', color: 'var(--lime-dark)', fontWeight: 700, fontSize: '14px' }}>{r.net}</td>
                          <td style={{ padding: '16px' }}><StatusBadge status={r.status} color={r.color} /></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {tab === 'Attendance' && (
                  <table className="demo-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ borderBottom: '1px solid var(--border)', background: '#FAFAFA' }}><tr>{['Employee','Dept.','Present','Absent','Leave','Status'].map(h => <th key={h} style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {ATTENDANCE.map((r, i) => (
                        <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{r.name}</td>
                          <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>{r.dept}</td>
                          <td style={{ padding: '16px', color: '#16a34a', fontWeight: 600, fontSize: '14px' }}>{r.present}</td>
                          <td style={{ padding: '16px', color: '#dc2626', fontWeight: 600, fontSize: '14px' }}>{r.absent}</td>
                          <td style={{ padding: '16px', color: '#2563eb', fontWeight: 600, fontSize: '14px' }}>{r.leave}</td>
                          <td style={{ padding: '16px' }}><StatusBadge status={r.status} color={r.color} /></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {tab === 'Compliance' && (
                  <table className="demo-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ borderBottom: '1px solid var(--border)', background: '#FAFAFA' }}><tr>{['Statutory Type','Month','Due Date','Amount','Status'].map(h => <th key={h} style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {COMPLIANCE.map((r, i) => (
                        <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{r.type}</td>
                          <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>{r.month}</td><td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>{r.due}</td>
                          <td style={{ padding: '16px', color: 'var(--lime-dark)', fontWeight: 700, fontSize: '14px' }}>{r.amount}</td>
                          <td style={{ padding: '16px' }}><StatusBadge status={r.status} color={r.color} /></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 20px', borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-section)',
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Showing 5 of {tab === 'Compliance' ? '18' : '1,250'} records</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['⬇ Export', '🖨 Print', '📊 Report'].map(a => (
                  <button key={a} style={{
                    padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
                    background: '#fff', border: '1px solid var(--border)',
                    color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500,
                  }}>{a}</button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}


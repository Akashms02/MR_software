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
  const bg = color === '#16a34a' ? 'bg-green-100 text-green-800' : color === '#d97706' ? 'bg-amber-100 text-amber-800' : color === '#dc2626' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-bold tracking-wide uppercase ${bg}`}>{status}</span>
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
    <section ref={ref} className="py-20 bg-white overflow-hidden" style={{ perspective: '1500px' }}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
          className="mb-10 text-center flex flex-col items-center"
        >
          <div className="text-[12px] font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-[20px] uppercase tracking-[1px] mb-3 inline-block">
            🖥️ Live Demo Preview
          </div>
          <h2 className="text-[32px] md:text-[38px] font-extrabold text-gray-900 tracking-tight leading-tight">
            See GmaxepayHR in Action
          </h2>
        </motion.div>

        <motion.div 
          style={{
            y: yOffset, rotateX: rotateX
          }}
          className="flex flex-col items-center"
        >
          {/* Tabs */}
          <div className="inline-flex gap-1 p-1 bg-slate-50 border border-gray-200 rounded-xl mb-6 shadow-sm">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 py-2.5 px-5 rounded-lg border-none font-bold text-[14px] cursor-pointer transition-all duration-200 ${
                  tab === t ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {t === 'Payroll' ? '💰' : t === 'Attendance' ? '📅' : '⚖️'} {t}
              </button>
            ))}
          </div>

          {/* Browser Window Mockup */}
          <motion.div 
            whileHover={{ scale: 1.02 }} transition={{ type: 'spring', bounce: 0.4 }}
            className="w-full max-w-[900px] mx-auto shadow-2xl rounded-2xl border border-gray-200 bg-white overflow-hidden"
          >
            <div className="p-4 px-5 bg-slate-50 border-b border-gray-200 flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="text-[12px] text-gray-400 font-bold bg-white px-4 py-1 rounded-md border border-gray-200">
                app.gmaxepayhr.in/dashboard
              </div>
            </div>

            <div className="p-0 bg-white">
              <div className="overflow-x-auto">
                {tab === 'Payroll' && (
                  <table className="w-full border-collapse text-left">
                    <thead className="border-b border-gray-200 bg-slate-50">
                      <tr>{['Employee','Role','Basic','HRA','Net Pay','Status'].map(h => <th key={h} className="p-4 text-[13px] font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {PAYROLL.map((r, i) => (
                        <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={i} className="border-b border-gray-200 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-gray-955 text-[14px]">{r.name}</td>
                          <td className="p-4 text-[14px] text-gray-500">{r.role}</td>
                          <td className="p-4 text-[14px] text-gray-500">{r.basic}</td>
                          <td className="p-4 text-[14px] text-gray-500">{r.hra}</td>
                          <td className="p-4 text-green-600 font-bold text-[14px]">{r.net}</td>
                          <td className="p-4"><StatusBadge status={r.status} color={r.color} /></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {tab === 'Attendance' && (
                  <table className="w-full border-collapse text-left">
                    <thead className="border-b border-gray-200 bg-slate-50">
                      <tr>{['Employee','Dept.','Present','Absent','Leave','Status'].map(h => <th key={h} className="p-4 text-[13px] font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {ATTENDANCE.map((r, i) => (
                        <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={i} className="border-b border-gray-200 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-gray-955 text-[14px]">{r.name}</td>
                          <td className="p-4 text-[14px] text-gray-500">{r.dept}</td>
                          <td className="p-4 text-green-600 font-bold text-[14px]">{r.present}</td>
                          <td className="p-4 text-red-600 font-bold text-[14px]">{r.absent}</td>
                          <td className="p-4 text-blue-600 font-bold text-[14px]">{r.leave}</td>
                          <td className="p-4"><StatusBadge status={r.status} color={r.color} /></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {tab === 'Compliance' && (
                  <table className="w-full border-collapse text-left">
                    <thead className="border-b border-gray-200 bg-slate-50">
                      <tr>{['Statutory Type','Month','Due Date','Amount','Status'].map(h => <th key={h} className="p-4 text-[13px] font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {COMPLIANCE.map((r, i) => (
                        <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={i} className="border-b border-gray-200 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-gray-955 text-[14px]">{r.type}</td>
                          <td className="p-4 text-[14px] text-gray-500">{r.month}</td>
                          <td className="p-4 text-[14px] text-gray-500">{r.due}</td>
                          <td className="p-4 text-green-600 font-bold text-[14px]">{r.amount}</td>
                          <td className="p-4"><StatusBadge status={r.status} color={r.color} /></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-5 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
              <span className="text-[12px] text-gray-400 font-medium">Showing 5 of {tab === 'Compliance' ? '18' : '1,250'} records</span>
              <div className="flex gap-2">
                {['⬇ Export', '🖨 Print', '📊 Report'].map(a => (
                  <button key={a} className="py-1.5 px-3 rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-700 text-[12px] font-bold cursor-pointer transition-colors">{a}</button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

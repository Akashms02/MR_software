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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Current Payslip */}
        <Card className="p-6">
          <div className="flex justify-between items-start pb-4 border-b border-gray-100 mb-4.5">
            <div>
              <div className="font-extrabold text-[18px] text-green-600">GmaxepayHR Pharma</div>
              <div className="text-[12px] text-gray-400">Payslip — April 2026</div>
            </div>
            <OutlineBtn className="text-[12px] py-1.5 px-3">⬇ PDF</OutlineBtn>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-xl border border-green-200 mb-4.5">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white text-[16px]">👤</div>
            <div>
              <div className="font-bold text-gray-900 text-[14px]">{ME.name}</div>
              <div className="text-[12px] text-gray-500">{ME.id} · {ME.dept}</div>
            </div>
          </div>

          {breakdown(ME.salary).map(({ k, v, type }) => (
            <div key={k} className={`flex justify-between py-2 border-b border-gray-50/50 ${type === 'net' ? 'bg-green-50/50 px-2 rounded-lg' : ''}`}>
              <span className={`text-[13px] ${type === 'ded' ? 'text-red-600' : type === 'net' ? 'text-green-600 font-bold' : 'text-gray-500 font-medium'}`}>{k}</span>
              <span className={`text-[13px] ${type === 'net' ? 'text-green-600 font-extrabold' : type === 'ded' ? 'text-red-600 font-medium' : 'text-gray-900 font-medium'}`}>
                {type === 'ded' ? '−' : ''}₹{v.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </Card>

        {/* History */}
        <Card className="p-5">
          <div className="font-bold text-[14px] text-gray-900 mb-4">Payslip History</div>
          <div className="flex flex-col gap-2.5">
            {MONTHS.map((m, i) => (
              <div key={m} className="flex items-center justify-between p-3 px-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all duration-150">
                <div>
                  <div className="text-[13px] font-semibold text-gray-900">{m}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">₹{Math.round(ME.salary * 0.63).toLocaleString('en-IN')} net</div>
                </div>
                <button className="py-1 px-3 rounded-md border border-gray-200 bg-white text-gray-500 text-[12px] hover:bg-gray-50 hover:text-gray-700 transition-colors cursor-pointer font-medium">
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

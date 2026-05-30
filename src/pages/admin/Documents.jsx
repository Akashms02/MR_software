import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { SectionHeader } from '../../components/ui'
import OfferLetter from '../../components/documents/OfferLetter'
import RelievingLetter from '../../components/documents/RelievingLetter'
import SalarySlip from '../../components/documents/SalarySlip'

export default function Documents() {
  const [activeView, setActiveView] = useState('hub') // 'hub', 'offer', 'relieving', 'payslip'

  return (
    <div className="pb-10">
      {activeView === 'hub' && (
        <>
          <SectionHeader
            title="HR Document Generator Hub"
            sub="Design, customize, and print high-fidelity corporate documents instantly."
          />

          {/* Dynamic 3-Column Premium Document Cards Grid */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6 mt-3">
            
            {/* Offer Letter Card */}
            <div
              onClick={() => setActiveView('offer')}
              className="doc-card p-7 rounded-[24px] bg-white border-[1.5px] border-gray-200 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden flex flex-col justify-between min-h-[280px] shadow-sm hover:-translate-y-1.5 hover:border-emerald-500 hover:shadow-[0_20px_25px_-5px_rgba(16,185,129,0.1),0_10px_10px_-5px_rgba(16,185,129,0.04)]"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border-[1.5px] border-emerald-100 flex items-center justify-center text-2xl text-emerald-500 mb-6">
                  📝
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">Offer & Appointment Letter</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed m-0">
                  Generate professional recruitment offer letters with dynamic salary CTC breakdowns, probation clauses, and corporate seal simulation.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-500 mt-6">
                Configure Document <ChevronRight size={14} />
              </div>
            </div>

            {/* Relieving Letter Card */}
            <div
              onClick={() => setActiveView('relieving')}
              className="doc-card p-7 rounded-[24px] bg-white border-[1.5px] border-gray-200 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden flex flex-col justify-between min-h-[280px] shadow-sm hover:-translate-y-1.5 hover:border-blue-500 hover:shadow-[0_20px_25px_-5px_rgba(59,130,246,0.1),0_10px_10px_-5px_rgba(59,130,246,0.04)]"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border-[1.5px] border-blue-100 flex items-center justify-center text-2xl text-blue-500 mb-6">
                  🎓
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">Relieving & Experience Certificate</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed m-0">
                  Issue professional relieving orders and experience letters verifying dynamic tenures, conduct summaries, and clearance validation.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-blue-500 mt-6">
                Configure Document <ChevronRight size={14} />
              </div>
            </div>

            {/* Pay Slip Card */}
            <div
              onClick={() => setActiveView('payslip')}
              className="doc-card p-7 rounded-[24px] bg-white border-[1.5px] border-gray-200 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden flex flex-col justify-between min-h-[280px] shadow-sm hover:-translate-y-1.5 hover:border-amber-500 hover:shadow-[0_20px_25px_-5px_rgba(245,158,11,0.1),0_10px_10px_-5px_rgba(245,158,11,0.04)]"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border-[1.5px] border-amber-100 flex items-center justify-center text-2xl text-amber-500 mb-6">
                  💵
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">Salary Pay Slip (Payslip)</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed m-0">
                  Generate detailed corporate salary pay slips with structured earnings, statutory deductions, bank accounts, and numerical word conversion.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-amber-500 mt-6">
                Configure Document <ChevronRight size={14} />
              </div>
            </div>

          </div>
        </>
      )}

      {activeView === 'offer' && (
        <OfferLetter onBack={() => setActiveView('hub')} />
      )}

      {activeView === 'relieving' && (
        <RelievingLetter onBack={() => setActiveView('hub')} />
      )}

      {activeView === 'payslip' && (
        <SalarySlip onBack={() => setActiveView('hub')} />
      )}
    </div>
  )
}
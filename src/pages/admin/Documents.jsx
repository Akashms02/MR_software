import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { SectionHeader } from '../../components/ui'
import OfferLetter from '../../components/documents/OfferLetter'
import RelievingLetter from '../../components/documents/RelievingLetter'
import SalarySlip from '../../components/documents/SalarySlip'
import TerminationLetter from '../../components/documents/TerminationLetter'

const Documents = () => {
  const [activeView, setActiveView] = useState('hub')

  const documentCards = [
    {
      key: 'offer',
      icon: '📝',
      title: 'Offer & Appointment Letter',
      description:
        'Generate professional recruitment offer letters with dynamic salary CTC breakdowns, probation clauses, and corporate seal simulation.',
      iconBg: 'bg-emerald-50 border-emerald-100',
      iconColor: 'text-emerald-500',
      accent: 'hover:border-emerald-500 hover:shadow-emerald-100 text-emerald-500'
    },
    {
      key: 'relieving',
      icon: '🎓',
      title: 'Relieving & Experience Certificate',
      description:
        'Issue professional relieving orders and experience letters verifying dynamic tenures, conduct summaries, and clearance validation.',
      iconBg: 'bg-blue-50 border-blue-100',
      iconColor: 'text-blue-500',
      accent: 'hover:border-blue-500 hover:shadow-blue-100 text-blue-500'
    },
    {
      key: 'payslip',
      icon: '💵',
      title: 'Salary Pay Slip (Payslip)',
      description:
        'Generate detailed corporate salary pay slips with structured earnings, statutory deductions, bank accounts, and numerical word conversion.',
      iconBg: 'bg-amber-50 border-amber-100',
      iconColor: 'text-amber-500',
      accent: 'hover:border-amber-500 hover:shadow-amber-100 text-amber-500'
    },
    {
      key: 'termination',
      icon: '⚠️',
      title: 'Termination & Separation Letter',
      description:
        'Generate professional termination and employee separation letters with notice period details, policy references, exit formalities, and HR authorization.',
      iconBg: 'bg-red-50 border-red-100',
      iconColor: 'text-red-500',
      accent: 'hover:border-red-500 hover:shadow-red-100 text-red-500'
    }
  ]

  return (
    <div className="pb-10">
      {activeView === 'hub' && (
        <>
          <SectionHeader
            title="HR Document Generator Hub"
            sub="Design, customize, and print high-fidelity corporate documents instantly."
          />

          <div className="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2 xl:grid-cols-4">
            {documentCards.map((card) => (
              <div
                key={card.key}
                onClick={() => setActiveView(card.key)}
                className={`
                  group cursor-pointer rounded-3xl border border-gray-200 bg-white p-7
                  shadow-sm transition-all duration-300 ease-in-out
                  hover:-translate-y-2 hover:shadow-2xl
                  ${card.accent}
                `}
              >
                <div className="flex flex-col justify-between h-full min-h-[280px]">
                  <div>
                    <div
                      className={`
                        mb-6 flex h-14 w-14 items-center justify-center
                        rounded-2xl border text-2xl
                        ${card.iconBg} ${card.iconColor}
                      `}
                    >
                      {card.icon}
                    </div>

                    <h3 className="mb-2 text-lg font-extrabold text-gray-900">
                      {card.title}
                    </h3>

                    <p className="text-sm leading-6 text-gray-500">
                      {card.description}
                    </p>
                  </div>

                  <div
                    className={`
                      mt-6 flex items-center gap-2 text-sm font-bold
                      ${card.iconColor}
                    `}
                  >
                    Configure Document
                    <ChevronRight size={15} />
                  </div>
                </div>
              </div>
            ))}
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

      {activeView === 'termination' && (
        <TerminationLetter onBack={() => setActiveView('hub')} />
      )}
    </div>
  )
}

export default Documents
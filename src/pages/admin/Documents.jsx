import React, { useState } from 'react'
import { FileText, Award, Landmark, ChevronRight } from 'lucide-react'
import { Card, SectionHeader } from '../../components/ui'
import OfferLetter from '../../components/documents/OfferLetter'
import RelievingLetter from '../../components/documents/RelievingLetter'
import SalarySlip from '../../components/documents/SalarySlip'

export default function Documents() {
  const [activeView, setActiveView] = useState('hub') // 'hub', 'offer', 'relieving', 'payslip'

  // Standard CSS transitions and glassmorphic colors
  const cardHoverStyle = (bgColor, borderColor) => ({
    padding: '28px',
    borderRadius: '24px',
    background: '#fff',
    border: '1.5px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '280px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
  })

  return (
    <div style={{ paddingBottom: '40px' }}>
      {activeView === 'hub' && (
        <>
          <SectionHeader
            title="HR Document Generator Hub"
            sub="Design, customize, and print high-fidelity corporate documents instantly."
          />

          {/* Dynamic 3-Column Premium Document Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '12px' }}>
            
            {/* Offer Letter Card */}
            <div
              onClick={() => setActiveView('offer')}
              style={cardHoverStyle()}
              className="doc-card"
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.borderColor = '#10b981'
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: '#f0fdf4', border: '1.5px solid #dcfce7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', color: '#10b981', marginBottom: '24px'
                }}>
                  📝
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>Offer & Appointment Letter</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                  Generate professional recruitment offer letters with dynamic salary CTC breakdowns, probation clauses, and corporate seal simulation.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#10b981', marginTop: '24px' }}>
                Configure Document <ChevronRight size={14} />
              </div>
            </div>

            {/* Relieving Letter Card */}
            <div
              onClick={() => setActiveView('relieving')}
              style={cardHoverStyle()}
              className="doc-card"
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.borderColor = '#3b82f6'
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: '#eff6ff', border: '1.5px solid #dbeafe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', color: '#3b82f6', marginBottom: '24px'
                }}>
                  🎓
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>Relieving & Experience Certificate</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                  Issue professional relieving orders and experience letters verifying dynamic tenures, conduct summaries, and clearance validation.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#3b82f6', marginTop: '24px' }}>
                Configure Document <ChevronRight size={14} />
              </div>
            </div>

            {/* Pay Slip Card */}
            <div
              onClick={() => setActiveView('payslip')}
              style={cardHoverStyle()}
              className="doc-card"
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.borderColor = '#f59e0b'
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(245, 158, 11, 0.1), 0 10px 10px -5px rgba(245, 158, 11, 0.04)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: '#fffbeb', border: '1.5px solid #fef3c7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', color: '#f59e0b', marginBottom: '24px'
                }}>
                  💵
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>Salary Pay Slip (Payslip)</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                  Generate detailed corporate salary pay slips with structured earnings, statutory deductions, bank accounts, and numerical word conversion.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#f59e0b', marginTop: '24px' }}>
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
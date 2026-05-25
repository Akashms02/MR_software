import React, { useState } from 'react'
import { ArrowLeft, Printer, Award, ShieldAlert } from 'lucide-react'
import { EMPLOYEES } from '../../data/hrmsData'
import { Card, PrimaryBtn, OutlineBtn } from '../ui'

export default function RelievingLetter({ onBack }) {
  const [selectedId, setSelectedId] = useState(EMPLOYEES[0]?.id || '')
  const [relievingDate, setRelievingDate] = useState('2026-05-25')
  const [reason, setReason] = useState('Career Progression')

  const employee = EMPLOYEES.find(e => e.id === selectedId) || EMPLOYEES[0]

  if (!employee) return <div>No employee records available.</div>

  const handlePrint = () => {
    window.print()
  }

  // Format joined date beautifully
  const formatJoinedDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatRelievingDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="document-container">
      {/* Control Panel (Screen-only) */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        padding: '16px 24px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid #e5e7eb',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <OutlineBtn onClick={onBack} style={{ padding: '8px 16px', fontSize: '13px' }}>
            <ArrowLeft size={16} /> Back to Hub
          </OutlineBtn>
          <div style={{ height: '24px', width: '1px', background: '#e5e7eb' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Employee:</label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              style={{
                background: '#f9fafb',
                border: '1.5px solid #e5e7eb',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#111827',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {EMPLOYEES.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.id})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Relieved On:</label>
            <input
              type="date"
              value={relievingDate}
              onChange={e => setRelievingDate(e.target.value)}
              style={{
                background: '#f9fafb',
                border: '1.5px solid #e5e7eb',
                borderRadius: '8px',
                padding: '5px 12px',
                fontSize: '13px',
                color: '#111827',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Reason:</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{
                background: '#f9fafb',
                border: '1.5px solid #e5e7eb',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#111827',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Career Progression">Career Progression</option>
              <option value="Personal Endeavors">Personal Endeavors</option>
              <option value="Higher Studies">Higher Studies</option>
              <option value="Relocation">Relocation</option>
            </select>
          </div>
        </div>

        <PrimaryBtn onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '13.5px' }}>
          <Printer size={16} /> Print / Export PDF
        </PrimaryBtn>
      </div>

      {/* Document Sheet View */}
      <div className="printable-sheet" style={{
        background: '#fff',
        margin: '0 auto',
        maxWidth: '800px',
        padding: '64px 80px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontFamily: "'Courier New', Courier, monospace, 'Inter', sans-serif",
        color: '#1f2937',
        lineHeight: 1.7,
        position: 'relative'
      }}>
        {/* Decorative Letterhead Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px double #10b981',
          paddingBottom: '20px',
          marginBottom: '32px'
        }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#065f46', letterSpacing: '1px', textTransform: 'uppercase' }}>
              🔬 GmaxepayHR Pharma Ltd.
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Advanced Therapeutics & Biotech Research Labs
            </div>
            <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>
              Plot 42, Biotech Enclave, BKC, Mumbai, Maharashtra 400051
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#6b7280' }}>
            <div>Web: www.gmaxepayhr.in</div>
            <div>Tel: +91 22 8876 5432</div>
            <div>CIN: L24239MH2021PLC356789</div>
          </div>
        </div>

        {/* Document Title & Reference */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', fontSize: '13px' }}>
          <div>
            <strong>Ref:</strong> GPHR/HR/REL/2026/{employee.id}
          </div>
          <div>
            <strong>Date:</strong> {formatRelievingDate(relievingDate)}
          </div>
        </div>

        <h3 style={{
          textAlign: 'center',
          textTransform: 'uppercase',
          fontSize: '17px',
          fontWeight: 800,
          color: '#111827',
          borderBottom: '1.5px solid #111827',
          paddingBottom: '6px',
          marginBottom: '36px',
          letterSpacing: '1px'
        }}>
          Relieving Order & Experience Certificate
        </h3>

        <div style={{ fontSize: '14px', marginBottom: '20px', textAlign: 'justify', textIndent: '40px' }}>
          This is to certify that <strong>{employee.name}</strong> (Employee ID: <strong>{employee.id}</strong>) was employed with <strong>GmaxepayHR Pharma Ltd.</strong> as <strong>{employee.designation}</strong> in the <strong>{employee.dept}</strong> Department.
        </div>

        <div style={{ fontSize: '14px', marginBottom: '20px', textAlign: 'justify', textIndent: '40px' }}>
          <strong>{employee.name}</strong> joined the services of the Company on <strong>{formatJoinedDate(employee.joined)}</strong> and has been relieved from their duties with effect from the close of business hours on <strong>{formatRelievingDate(relievingDate)}</strong> following their resignation submitted due to <strong>{reason}</strong>.
        </div>

        <div style={{ fontSize: '14px', marginBottom: '20px', textAlign: 'justify', textIndent: '40px' }}>
          During their tenure of service with us, we found them to be extremely diligent, committed, and professional in carrying out their responsibilities. They have shown great clinical analytical precision and stellar teamwork.
        </div>

        <div style={{ fontSize: '14px', marginBottom: '20px', textAlign: 'justify', textIndent: '40px' }}>
          We also confirm that they have successfully completed all handover processes, resolved any company asset clearances, and fulfilled all exit compliance guidelines. No outstanding dues remain between the Company and <strong>{employee.name}</strong>.
        </div>

        <div style={{ fontSize: '14px', marginBottom: '48px', textAlign: 'justify', textIndent: '40px' }}>
          We deeply appreciate their contributions to our pharmaceutical research and development goals and wish them the absolute best in all their future professional endeavors.
        </div>

        {/* Signatures */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginTop: '60px'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '40px' }}>Received Certificate Copy:</div>
            <div style={{ borderBottom: '1px solid #9ca3af', width: '200px', marginBottom: '4px' }}></div>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>{employee.name}</div>
          </div>

          <div style={{ textAlign: 'right', position: 'relative' }}>
            {/* Stamp Simulation */}
            <div style={{
              position: 'absolute',
              top: '-65px',
              right: '25px',
              width: '95px',
              height: '95px',
              borderRadius: '50%',
              border: '3px double rgba(16, 185, 129, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              color: 'rgba(16, 185, 129, 0.6)',
              fontWeight: 800,
              transform: 'rotate(-8deg)',
              pointerEvents: 'none',
              letterSpacing: '0.2px',
              lineHeight: 1.1
            }}>
              <span>GMAXEPAYHR</span>
              <span>PHARMA</span>
              <span style={{ fontSize: '7px', borderTop: '1px solid rgba(16,185,129,0.3)', marginTop: '2px', paddingTop: '2px' }}>SEAL</span>
            </div>

            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>For <strong>GmaxepayHR Pharma Ltd.</strong></div>
            <div style={{
              fontFamily: "'Brush Script MT', cursive, sans-serif",
              fontSize: '24px',
              color: '#065f46',
              height: '30px',
              lineHeight: 1,
              transform: 'rotate(-4deg)',
              marginBottom: '4px',
              userSelect: 'none'
            }}>
              Kavitha Nair
            </div>
            <div style={{ borderBottom: '1px solid #9ca3af', width: '200px', marginBottom: '4px', marginLeft: 'auto' }}></div>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>Kavitha Nair</div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Director of Human Resources</div>
          </div>
        </div>
      </div>

      {/* Print CSS styling embedded natively */}
      <style>{`
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .document-container {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}

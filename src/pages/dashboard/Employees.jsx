import React, { useState } from 'react'
import { Card, SectionHeader, Avatar, StatusBadge, PrimaryBtn, OutlineBtn } from '../../components/ui'
import { EMPLOYEES } from './data'

export default function Employees({ role }) {
  const [search, setSearch] = useState('')

  const filtered = EMPLOYEES.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.id.includes(search)
  )

  return (
    <div className="animate-fade">
      <SectionHeader 
        title="Recruitment > Candidates" 
        sub="189 Total"
        action={
          <div style={{ display: 'flex', gap: '12px' }}>
             <OutlineBtn>Position ▾</OutlineBtn>
             <OutlineBtn>Sort : New ▾</OutlineBtn>
          </div>
        }
      />

      {/* Recruitment Grid matching reference image 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {filtered.slice(0, 8).map(emp => (
          <Card key={emp.id} style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
             {/* Small arrow top right */}
             <div style={{ position: 'absolute', top: '16px', right: '16px', color: '#D1D5DB', fontSize: '10px' }}>↗</div>
             
             <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#6B7280' }}>
                   {emp.name.split(' ').map(n => n[0]).join('')}
                </div>
             </div>

             <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>{emp.name}</div>
             <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '14px' }}>{emp.designation}</div>

             <div style={{ marginBottom: '20px' }}>
                <span style={{ padding: '4px 14px', borderRadius: '6px', background: '#EFF6FF', color: '#3B82F6', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
                   {emp.status === 'Active' ? 'SELECTED' : 'PROCESSING'}
                </span>
             </div>

             {/* Details Table */}
             <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                   <span style={{ color: '#9CA3AF' }}>Mail</span>
                   <span style={{ color: '#374151', fontWeight: 600 }}>{emp.email.split('@')[0]}@...</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                   <span style={{ color: '#9CA3AF' }}>Phone</span>
                   <span style={{ color: '#374151', fontWeight: 600 }}>234 567 8901</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                   <span style={{ color: '#9CA3AF' }}>Experience</span>
                   <span style={{ color: '#374151', fontWeight: 600 }}>2 Years</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                   <span style={{ color: '#9CA3AF' }}>Applied on</span>
                   <span style={{ color: '#374151', fontWeight: 600 }}>12 Sep, 2023</span>
                </div>
             </div>

             <button style={{ marginTop: '20px', width: '100%', padding: '10px', borderRadius: '10px', background: '#F0FDF4', border: 'none', color: '#22C55E', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span>💬</span> Comments
             </button>
          </Card>
        ))}
      </div>
    </div>
  )
}

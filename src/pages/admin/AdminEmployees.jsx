import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { CANDIDATES } from '../../data/hrmsData'

const ALL_CANDIDATES = [
  ...CANDIDATES,
  { name: 'Temperance Brennen', role: 'Creative Lead',      status: 'Rejected',   email: 'temps@gmail.com',  phone: '183 249 2402', experience: '3 Years', appliedOn: '18 Jan, 1975' },
  { name: 'Nandor T.R',         role: 'Front End Developer', status: 'Rejected',   email: 'nandor@gmail.com', phone: '183 249 7401', experience: '5 Years', appliedOn: '16 Feb, 2023' },
]

const STATUS_BADGE = {
  'Processing': { bg: '#EFF6FF', color: '#3B82F6' },
  'Selected':   { bg: '#F0FDF4', color: '#22C55E' },
  'Rejected':   { bg: '#FFF1F2', color: '#F43F5E' },
}

function Avatar({ name, size = 72 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #CBD5E1, #94A3B8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color: '#fff', flexShrink: 0
    }}>
      {name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
    </div>
  )
}

function CandidateCard({ name, role, status, email, phone, experience, appliedOn }) {
  const badge = STATUS_BADGE[status] || STATUS_BADGE['Processing']
  return (
    <div style={{
      background: '#fff', borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      padding: '20px 18px', position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center'
    }}>
      {/* External link top right */}
      <button style={{ position:'absolute', top:'14px', right:'14px', background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', fontSize:'14px', padding:0 }}>
        ↗
      </button>

      {/* Avatar */}
      <Avatar name={name} size={72} />

      {/* Name + Role */}
      <div style={{ fontSize:'14px', fontWeight:800, color:'#111827', marginTop:'12px', marginBottom:'2px' }}>{name}</div>
      <div style={{ fontSize:'11px', color:'#9CA3AF', marginBottom:'12px' }}>{role}</div>

      {/* Status badge */}
      <div style={{
        padding:'4px 14px', borderRadius:'6px', fontSize:'10px', fontWeight:700,
        background: badge.bg, color: badge.color, marginBottom:'16px',
        letterSpacing: '0.3px'
      }}>
        {status.toUpperCase()}
      </div>

      {/* Details */}
      <div style={{ width:'100%', borderTop:'1px solid #F3F4F6', paddingTop:'14px', display:'flex', flexDirection:'column', gap:'6px', textAlign:'left' }}>
        {[['Mail', email], ['Phone', phone], ['Experience', experience], ['Applied on', appliedOn]].map(([k, v]) => (
          <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'11px' }}>
            <span style={{ color:'#9CA3AF', fontWeight:500 }}>{k}</span>
            <span style={{ color:'#374151', fontWeight:600, maxWidth:'130px', textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Comments button */}
      <button style={{
        width:'100%', marginTop:'16px', padding:'9px',
        background:'#F0FDF4', color:'#16a34a', border:'1px solid #BBF7D0',
        borderRadius:'10px', fontSize:'12px', fontWeight:700, cursor:'pointer',
        fontFamily:'inherit'
      }}>
        💬 Comments
      </button>
    </div>
  )
}

export default function AdminEmployees() {
  return (
    <div className="animate-fade">

      {/* Alert Banner */}
      <div style={{
        background:'#fff', borderRadius:'12px', padding:'12px 20px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)',
        border:'1px solid #F3F4F6'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'16px' }}>⚡</span>
          <span style={{ fontSize:'13px', color:'#374151' }}>
            <strong style={{ color:'#111827' }}>Alert :</strong> Hired - Product Developer Role. Remove from the Candidate list.
          </span>
        </div>
        <button className="btn-lime" style={{ fontSize:'13px', padding:'9px 18px', borderRadius:'10px', whiteSpace:'nowrap' }}>
          Remove Job Role
        </button>
      </div>

      {/* Hiring header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <span style={{ fontSize:'16px', fontWeight:800, color:'#111827' }}>Hiring</span>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'4px', background:'#F3F4F6', padding:'4px 10px', borderRadius:'8px', fontSize:'12px', cursor:'pointer' }}>
              <span style={{ color:'#374151', fontWeight:600 }}>Position</span>
              <span style={{ color:'#9CA3AF' }}>⊕</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'4px', background:'#F3F4F6', padding:'4px 10px', borderRadius:'8px', fontSize:'12px', cursor:'pointer' }}>
              <span style={{ color:'#374151', fontWeight:600 }}>Sort : New</span>
              <span style={{ color:'#9CA3AF' }}>⊕</span>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button style={{ background:'none', border:'1.5px solid #E5E7EB', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:'#6B7280', fontSize:'16px', lineHeight:1 }}>☰</button>
          <button style={{ background:'none', border:'1.5px solid #E5E7EB', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:'#6B7280', fontSize:'16px', lineHeight:1 }}>⊞</button>
        </div>
      </div>

      {/* Main Grid: cards + sidebar */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 240px', gap:'20px' }}>

        {/* Candidate cards grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px' }}>
          {ALL_CANDIDATES.map((c, i) => (
            <CandidateCard key={i} {...c} />
          ))}
        </div>

        {/* Quick Actions Sidebar */}
        <div>
          <div style={{ background:'#fff', borderRadius:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', padding:'20px' }}>
            <div style={{ fontSize:'14px', fontWeight:800, color:'#111827', marginBottom:'14px' }}>Quick Actions</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {['Shortlisted Candidates','Upcoming Interviews','Rejected Applications','Review Reminders'].map((label, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'11px 14px', background:'#F9FAFB', borderRadius:'10px', cursor:'pointer'
                }}>
                  <span style={{ fontSize:'12px', fontWeight:600, color:'#374151' }}>{label}</span>
                  <ChevronRight size={15} color="#C8F04A" strokeWidth={2.5} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

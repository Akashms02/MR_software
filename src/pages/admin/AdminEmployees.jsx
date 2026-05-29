import React, { useState, useEffect } from 'react'
import { ChevronRight, Search, Loader2, Mail, Phone, Users, AlertCircle } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { getMyTeam } from '../../redux/actions/teamActions'

const STATUS_BADGE = {
  'Active':   { bg: '#ECFDF5', color: '#059669' },
  'Inactive': { bg: '#FFF1F2', color: '#F43F5E' },
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch (e) {
    return dateStr
  }
}

const formatRole = (roleStr) => {
  if (!roleStr) return 'Employee'
  return roleStr.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function Avatar({ name, size = 72 }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #CBD5E1, #94A3B8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color: '#fff', flexShrink: 0
    }}>
      {initials}
    </div>
  )
}

function EmployeeCard({ name, role, status, email, phone, employeeId, joinedOn, photoUrl }) {
  const [hovered, setHovered] = useState(false)
  const badge = STATUS_BADGE[status] || STATUS_BADGE['Active']

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: hovered ? '0 12px 24px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
        padding: '22px 18px', position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        border: '1.5px solid #F3F4F6',
      }}
    >
      {/* External link top right */}
      <button style={{ position:'absolute', top:'14px', right:'14px', background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', fontSize:'14px', padding:0 }}>
        ↗
      </button>

      {/* Avatar */}
      {photoUrl ? (
          <img src={photoUrl} alt={name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <Avatar name={name} size={72} />
        )}

      {/* Name + Role */}
      <div style={{ fontSize:'14px', fontWeight:800, color:'#111827', marginTop:'12px', marginBottom:'2px' }}>{name}</div>
      <div style={{ fontSize:'11.5px', color:'#9CA3AF', marginBottom:'12px', fontWeight: 600 }}>{role}</div>

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
        {[
          ['ID', employeeId],
          ['Mail', email],
          ['Phone', phone],
          ['Joined', joinedOn]
        ].map(([k, v]) => (
          <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'11px' }}>
            <span style={{ color:'#9CA3AF', fontWeight:500 }}>{k}</span>
            <span style={{ color:'#374151', fontWeight:600, maxWidth:'130px', textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SidebarItem({ label }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'11px 14px', background: hovered ? '#F3F4F6' : '#F9FAFB', borderRadius:'10px', cursor:'pointer',
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
        transition: 'all 0.2s ease'
      }}
    >
      <span style={{ fontSize:'12px', fontWeight:600, color:'#374151' }}>{label}</span>
      <ChevronRight size={15} color="#C8F04A" strokeWidth={2.5} />
    </div>
  )
}

const SkeletonCard = () => (
  <div style={{
    background: '#fff', borderRadius: '20px',
    padding: '24px 20px', position: 'relative',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    border: '1.5px solid #F3F4F6',
    gap: '12px'
  }}>
    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#F3F4F6', animation: 'pulse 1.5s infinite ease-in-out' }} />
    <div style={{ width: '120px', height: '16px', borderRadius: '4px', background: '#F3F4F6', animation: 'pulse 1.5s infinite ease-in-out' }} />
    <div style={{ width: '80px', height: '12px', borderRadius: '4px', background: '#F3F4F6', animation: 'pulse 1.5s infinite ease-in-out' }} />
    <div style={{ width: '60px', height: '20px', borderRadius: '6px', background: '#F3F4F6', animation: 'pulse 1.5s infinite ease-in-out' }} />
    <div style={{ width: '100%', borderTop: '1px solid #F3F4F6', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '50px', height: '10px', borderRadius: '4px', background: '#F3F4F6', animation: 'pulse 1.5s infinite ease-in-out' }} />
          <div style={{ width: '80px', height: '10px', borderRadius: '4px', background: '#F3F4F6', animation: 'pulse 1.5s infinite ease-in-out' }} />
        </div>
      ))}
    </div>
  </div>
)

export default function AdminEmployees() {
  const dispatch = useDispatch()
  const { team, loading, error } = useSelector((state) => state.team)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(getMyTeam())
  }, [dispatch])

  // Filters based on the exact live API fields
  const filteredEmployees = (team || []).filter(
    (emp) =>
      !searchQuery ||
      emp.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="animate-fade" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Employees header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'18px', fontWeight:850, color:'#111827' }}>Company Employees</span>
          <span style={{ background: '#F3F4F6', color: '#6B7280', fontSize: '12px', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
            {filteredEmployees.length} Total
          </span>
        </div>

        {/* Search Input bar and layout selector */}
        <div style={{ display:'flex', alignItems: 'center', gap:'12px' }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={15} 
              color="#9CA3AF" 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input 
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 12px 8px 34px',
                borderRadius: '10px',
                border: '1.5px solid #E5E7EB',
                fontSize: '13px',
                outline: 'none',
                width: '240px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#111827'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            />
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button style={{ background:'none', border:'1.5px solid #E5E7EB', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:'#6B7280', fontSize:'16px', lineHeight:1 }}>☰</button>
            <button style={{ background:'none', border:'1.5px solid #E5E7EB', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:'#6B7280', fontSize:'16px', lineHeight:1 }}>⊞</button>
          </div>
        </div>
      </div>

      {/* Main Grid: cards + sidebar */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 240px', gap:'20px' }}>

        {/* Profiles Grid */}
        <div>
          {/* Skeleton Loader during fetch */}
          {loading && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* API Error Notification */}
          {error && (
            <div style={{
              padding: '24px',
              background: '#FEF2F2',
              border: '1.5px solid #FCA5A5',
              borderRadius: '16px',
              color: '#B91C1C',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              <AlertCircle size={20} />
              <span><strong>Failed to load employees:</strong> {error}. Please verify server connection parameters.</span>
            </div>
          )}

          {/* Employees List View */}
          {!loading && (
            <>
              {filteredEmployees.length === 0 ? (
                <div style={{
                  padding: '50px 24px',
                  textAlign: 'center',
                  background: '#fff',
                  borderRadius: '16px',
                  border: '1.5px dashed #E5E7EB',
                  color: '#9CA3AF'
                }}>
                  <Users size={40} style={{ marginBottom: '12px', color: '#CBD5E1' }} />
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#4B5563', margin: '0 0 6px 0' }}>No Employees Found</h4>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                    {searchQuery ? `No employees match "${searchQuery}"` : 'Your database team list is empty.'}
                  </p>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' }}>
                  {filteredEmployees.map((member) => (
                    <EmployeeCard 
                      key={member.id}
                      name={member.fullName || 'Unknown'}
                      role={formatRole(member.role)}
                      status={member.enabled ? 'Active' : 'Inactive'}
                      email={member.email || 'N/A'}
                      phone={member.phone || 'N/A'}
                      employeeId={member.employeeId || 'N/A'}
                      photoUrl={member.photoUrl}
                      joinedOn={formatDate(member.createdAt)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Actions Sidebar */}
        <div>
          <div style={{ background:'#fff', borderRadius:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', padding:'20px' }}>
            <div style={{ fontSize:'14px', fontWeight:800, color:'#111827', marginBottom:'14px' }}>Quick Actions</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {['Onboard Employee','Statutory Filings','Active Departments','Department Directory'].map((label, i) => (
                <SidebarItem key={i} label={label} />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Styled Animations */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>

    </div>
  )
}

import { Card, SectionHeader, StatCard } from '../../components/ui'
import { LEAVE_BALANCE, RECENT_ACTIVITY, UPCOMING_EVENTS } from '../../data/hrmsData'
import { useSelector } from 'react-redux'

export default function EmployeeDashboard() {
  const { user } = useSelector(state => state.auth)
  
  const displayName = user?.fullName || user?.name || 'Employee';
  const displayRole = user?.role?.replace('_', ' ') || 'Team Member';
  const displayDept = user?.dept || 'Operations';
  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #16a34a 0%, #0891b2 100%)',
        borderRadius: '16px', padding: '24px 28px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginBottom: '4px', fontWeight: 500 }}>Welcome back 👋</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{displayName}</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{displayRole} · {displayDept}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>Today</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        <StatCard icon="✅" label="Present Days"  value="22"     sub="This month"         color="#16a34a" />
        <StatCard icon="🏖️" label="Leave Balance" value="13"     sub="Days remaining"     color="#0891b2" bgColor="#e0f2fe" />
        <StatCard icon="💰" label="Net Salary"    value="₹45K"   sub="April 2026"         color="#7c3aed" bgColor="#ede9fe" />
        <StatCard icon="⭐" label="Performance"   value="4.2/5"  sub="Last review cycle"  color="#d97706" bgColor="#fef3c7" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Leave Balance */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '16px' }}>Leave Balance</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {LEAVE_BALANCE.map(lb => (
              <div key={lb.code}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>{lb.type}</span>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>{lb.total - lb.used} <span style={{ color: '#9ca3af', fontWeight: 400 }}>/ {lb.total}</span></span>
                </div>
                <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px' }}>
                  <div style={{ height: '100%', width: `${(lb.used / lb.total) * 100}%`, background: '#16a34a', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming events */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '16px' }}>Upcoming Events</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {UPCOMING_EVENTS.map(ev => (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '20px' }}>{ev.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{ev.name}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>{ev.type}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>{ev.date}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

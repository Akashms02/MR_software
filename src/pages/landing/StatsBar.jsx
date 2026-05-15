const STATS = [
  { value: '80%',   label: 'Faster HR Tasks',       icon: '⚡' },
  { value: '1,250+', label: 'Employees Managed',     icon: '👥' },
  { value: '100%',  label: 'Compliance Rate',         icon: '✅' },
  { value: '85%',   label: 'Employee Satisfaction',   icon: '⭐' },
]

export default function StatsBar() {
  return (
    <div style={{
      background: '#fff', borderBottom: '1px solid var(--border)',
      borderTop: '1px solid var(--border)', padding: '28px 0',
    }}>
      <div className="section-container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '12px 16px',
              borderRight: i < 3 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
              <div className="stat-number" style={{ marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

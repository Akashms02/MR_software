const FIELD_FEATURES = [
  { icon: '📍', title: 'Real-Time GPS Tracking',  desc: 'Track field reps live with accurate location updates every 30 seconds.' },
  { icon: '🔔', title: 'Geo-Fenced Attendance',   desc: 'Auto punch-in when reps enter client zones. Zero buddy punching.' },
  { icon: '🗺️', title: 'Route Optimization',      desc: 'AI-suggested optimal routes for doctor visits, saving 25% travel time.' },
  { icon: '📊', title: 'Visit Reports',            desc: 'Instant digital call reports synced to CRM and manager dashboard.' },
  { icon: '💊', title: 'Doctor Coverage',          desc: 'Monitor doctor visit frequency, product detailing, and sample distribution.' },
  { icon: '📱', title: 'Offline Mode',             desc: 'Works without internet — syncs when connectivity returns.' },
]

const REP_DOTS = [
  { top: '35%', left: '25%', name: 'Rohit V.',  visits: 6 },
  { top: '55%', left: '55%', name: 'Aisha S.',  visits: 4 },
  { top: '25%', left: '58%', name: 'Priya N.',  visits: 3 },
  { top: '65%', left: '28%', name: 'Ankit J.',  visits: 5 },
]

export default function FieldTracking() {
  return (
    <section id="field" className="section-spacing" style={{ background: 'var(--bg-section)' }}>
      <div className="section-container">
        <div id="field-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>

          {/* Left */}
          <div>
            <div className="section-label">📍 Field Force Tracking</div>
            <h2 className="section-title">Track Every Rep, Everywhere</h2>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '32px' }}>
              GPS-based attendance, route planning, and visit reporting — all in one mobile app.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {FIELD_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                    background: 'var(--green-light)', border: '1px solid var(--green-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                  }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{f.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.55 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Phone mockup */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="phone-frame">
              {/* Status bar */}
              <div style={{ padding: '14px 14px 8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>9:41 AM</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>● ●</span>
              </div>

              {/* App header */}
              <div style={{
                padding: '6px 14px 10px', borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green)' }}>GmaxepayHR Field</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>4 Reps Active · May 14</div>
                </div>
                <div className="badge-green" style={{ fontSize: '10px', padding: '2px 8px' }}>Live</div>
              </div>

              {/* Map */}
              <div style={{
                height: '210px', position: 'relative',
                background: '#f0fdf4',
                borderBottom: '1px solid var(--border)',
              }}>
                {/* Grid lines */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                  backgroundSize: '30px 30px', opacity: 0.5,
                }} />
                {/* Roads */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 220 210">
                  <path d="M0,105 Q55,85 110,110 Q165,135 220,95" stroke="#d1d5db" strokeWidth="7" fill="none" />
                  <path d="M55,0 Q75,60 95,105 Q115,150 105,210" stroke="#d1d5db" strokeWidth="5" fill="none" />
                </svg>

                {/* Rep dots */}
                {REP_DOTS.map((d, i) => (
                  <div key={i} style={{
                    position: 'absolute', top: d.top, left: d.left,
                    transform: 'translate(-50%,-50%)',
                  }}>
                    <div style={{
                      width: '12px', height: '12px', borderRadius: '50%',
                      background: 'var(--green)',
                      border: '2px solid #fff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }} />
                    <div style={{
                      position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)',
                      fontSize: '8px', fontWeight: 700, color: 'var(--green-text)',
                      whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.85)',
                      padding: '1px 4px', borderRadius: '3px',
                    }}>{d.name}</div>
                  </div>
                ))}
              </div>

              {/* List */}
              <div style={{ padding: '10px 14px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Today's Activity
                </div>
                {REP_DOTS.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)' }} />
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{r.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600 }}>{r.visits} visits</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #field-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </section>
  )
}

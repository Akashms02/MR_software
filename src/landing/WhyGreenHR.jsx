const PILLARS = [
  { icon: '📈', title: 'Scalable & Customizable', desc: 'Grows from 50 to 50,000 employees. Configure workflows, roles, and policies to fit your exact needs.' },
  { icon: '☁️', title: 'Cloud-Based',             desc: 'Zero infrastructure hassle. Access anywhere with 99.9% uptime SLA and automatic backups.' },
  { icon: '📱', title: 'Mobile-Friendly',          desc: 'Full-featured iOS and Android apps. Field reps can punch attendance and view payslips on the go.' },
  { icon: '🛡️', title: 'Enterprise Security',     desc: 'AES-256 encryption, role-based access control, MFA, and complete audit logging.' },
]

export default function WhyGmaxepayHR() {
  return (
    <section id="whyus" className="section-spacing" style={{ background: 'var(--bg-section)' }}>
      <div className="section-container">
        {/* Header */}
        <div style={{ marginBottom: '56px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="section-label">🌿 Why GmaxepayHR</div>
          <h2 className="section-title">Built on 4 Core Pillars</h2>
          <p className="section-sub">
            The four fundamental principles that make GmaxepayHR the preferred HRMS for pharma enterprises.
          </p>
        </div>

        {/* Grid */}
        <div className="whyus-grid">
          {PILLARS.map((p, i) => (
            <div key={i} className="pillar-card">
              <div style={{
                width: '48px', height: '48px', borderRadius: '10px',
                background: 'var(--green-light)', border: '1px solid var(--green-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', marginBottom: '16px',
              }}>{p.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {p.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

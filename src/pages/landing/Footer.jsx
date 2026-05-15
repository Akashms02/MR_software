const NAV_GROUPS = [
  { title: 'Product',  links: ['Features', 'Workflow', 'Pricing', 'Security', 'Integrations'] },
  { title: 'Company',  links: ['About Us', 'Blog', 'Careers', 'Press Kit', 'Partners'] },
  { title: 'Support',  links: ['Documentation', 'API Reference', 'Status Page', 'Help Center', 'Contact Us'] },
]

export default function Footer() {
  return (
    <footer id="contact" className="footer-bg">
      <div className="section-container" style={{ padding: '56px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', paddingBottom: '48px' }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M12 2v20M3 7l9 5 9-5" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)' }}>
                  Green<span style={{ color: 'var(--green)' }}>HR</span>
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '1px' }}>PHARMA HRMS</div>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '240px', marginBottom: '20px' }}>
              The intelligent HRMS built for pharma enterprises. From hire to rehire — one seamless platform.
            </p>

            {[
              { icon: '📧', text: 'hello@greenhr.in' },
              { icon: '📞', text: '+91 98765 43210' },
              { icon: '🏢', text: 'Mumbai · Bengaluru · Hyderabad' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px' }}>{c.icon}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{c.text}</span>
              </div>
            ))}

            <div style={{ marginTop: '20px' }}>
              <span className="badge-green" style={{ fontSize: '11px' }}>
                🏛️ Empaneled with NICSI · MeitY, Govt. of India
              </span>
            </div>
          </div>

          {/* Nav groups */}
          {NAV_GROUPS.map((group, i) => (
            <div key={i}>
              <div style={{
                fontSize: '11px', fontWeight: 700, color: 'var(--green)',
                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px',
              }}>{group.title}</div>
              {group.links.map(link => (
                <a key={link} href="#" style={{
                  display: 'block', fontSize: '13px', color: 'var(--text-muted)',
                  textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s',
                }}
                  onMouseEnter={e => e.target.style.color = 'var(--green)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >{link}</a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border)', padding: '20px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            © 2026 GreenHR. Powered by <span style={{ color: 'var(--green)', fontWeight: 600 }}>GreenCall Technologies Pvt. Ltd.</span> · All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['Privacy Policy', 'Terms', 'Cookies'].map(l => (
              <a key={l} href="#" style={{
                fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none',
              }}
                onMouseEnter={e => e.target.style.color = 'var(--green)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          footer .section-container > div { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          footer .section-container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const NAV_LINKS = ['Features', 'Workflow', 'Why Us', 'Contact']

export default function Navbar() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    const map = { 'Features': 'features', 'Workflow': 'workflow', 'Why Us': 'whyus', 'Contact': 'contact' }
    const el = document.getElementById(map[id])
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="navbar">
      <div className="navbar-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#C8F04A" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M12 2v20M3 7l9 5 9-5" stroke="#C8F04A" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                Gmaxepay<span style={{ color: 'var(--green)' }}>HR</span>
              </span>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '1px', lineHeight: 1 }}>
                PHARMA HRMS
              </div>
            </div>
          </div>

          {/* Nav links (Desktop) */}
          <div className="nav-links-desktop">
            {NAV_LINKS.map(link => (
              <button key={link} onClick={() => scrollTo(link)}
                style={{
                  padding: '7px 14px', background: 'transparent', border: 'none',
                  color: 'var(--text-muted)', fontWeight: 500, fontSize: '14px',
                  cursor: 'pointer', borderRadius: '6px', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.target.style.color = 'var(--green)'; e.target.style.background = 'var(--green-light)' }}
                onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.background = 'transparent' }}
              >{link}</button>
            ))}
          </div>

          {/* Login (Desktop) */}
          <div className="nav-links-desktop">
            <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 18px' }}
              onClick={() => navigate('/login')}>
              Login
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button className="nav-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>

          {/* Mobile Menu Dropdown */}
          {menuOpen && (
            <div className="nav-mobile-menu">
              {NAV_LINKS.map(link => (
                <button key={link} onClick={() => { scrollTo(link); setMenuOpen(false); }}
                  style={{
                    padding: '10px 16px', background: 'transparent', border: 'none',
                    color: 'var(--text-muted)', fontWeight: 600, fontSize: '15px',
                    cursor: 'pointer', borderRadius: '8px', transition: 'all 0.15s',
                    textAlign: 'left', width: '100%'
                  }}
                  onMouseEnter={e => { e.target.style.color = 'var(--green)'; e.target.style.background = 'var(--green-light)' }}
                  onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.background = 'transparent' }}
                >{link}</button>
              ))}
              <button className="btn-primary" style={{ fontSize: '14px', padding: '12px', width: '100%', marginTop: '8px' }}
                onClick={() => { navigate('/login'); setMenuOpen(false); }}>
                Login
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  )
}

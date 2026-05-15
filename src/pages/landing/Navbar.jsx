import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const NAV_LINKS = ['Features', 'Workflow', 'Why Us', 'Contact']

export default function Navbar() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

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
      <div style={{ width: '100%', padding: '0 40px' }}>
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
                Green<span style={{ color: 'var(--green)' }}>HR</span>
              </span>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '1px', lineHeight: 1 }}>
                PHARMA HRMS
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
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

          {/* Login */}
          <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 18px' }}
            onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </div>
    </nav>
  )
}

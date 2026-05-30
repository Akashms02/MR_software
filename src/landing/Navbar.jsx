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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-150 py-2.5 shadow-sm' : 'bg-transparent py-4'}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#C8F04A" strokeWidth="2.5" strokeLinejoin="round"/>
                <path d="M12 2v20M3 7l9 5 9-5" stroke="#C8F04A" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-[17px] text-gray-900 tracking-tight leading-none">
                Gmaxepay<span className="text-green-600">HR</span>
              </span>
              <div className="text-[9px] text-gray-400 font-bold tracking-[1px] leading-none mt-0.5 uppercase">
                PHARMA HRMS
              </div>
            </div>
          </div>

          {/* Nav links (Desktop) */}
          <div className="hidden md:flex items-center gap-2.5">
            {NAV_LINKS.map(link => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className="px-3.5 py-1.5 bg-transparent border-none text-gray-500 font-bold text-[14px] cursor-pointer rounded-lg hover:text-green-600 hover:bg-green-50/55 transition-all duration-200"
              >
                {link}
              </button>
            ))}
          </div>

          {/* Login (Desktop) */}
          <div className="hidden md:block">
            <button
              className="btn-lime text-[13px] py-2 px-5"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button className="md:hidden text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer p-1" onClick={() => setMenuOpen(!menuOpen)}>
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
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="md:hidden mt-2.5 bg-white border border-gray-150 rounded-2xl p-3 shadow-lg flex flex-col gap-1.5">
            {NAV_LINKS.map(link => (
              <button
                key={link}
                onClick={() => { scrollTo(link); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 bg-transparent border-none text-gray-500 font-bold text-[15px] cursor-pointer rounded-xl hover:text-green-600 hover:bg-green-50/55 transition-all duration-200"
              >
                {link}
              </button>
            ))}
            <button
              className="btn-lime w-full text-center py-3 text-[14px] mt-2"
              onClick={() => { navigate('/login'); setMenuOpen(false); }}
            >
              Login
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

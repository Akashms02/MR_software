import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const NAV_LINKS = [
  { name: 'Home', target: 'home' },
  { name: 'Features', target: 'features' },
  { name: 'FAQ', target: 'faq' },
  { name: 'Demo Portal', target: 'demo' },
  { name: 'Testimonials', target: 'testimonials' },
  { name: 'Book Demo', target: 'booking' }
]

export default function Navbar({ onBookDemoClick }) {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Scroll spy to highlight active section and update URL hash
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20
      setIsScrolled(prev => prev !== scrolled ? scrolled : prev)

      const scrollPosition = window.scrollY + 250 // Offset for active section detection

      let currentSection = 'home'
      if (window.scrollY < 100) {
        currentSection = 'home'
      } else {
        for (const link of NAV_LINKS) {
          const el = document.getElementById(link.target)
          if (el) {
            const top = el.offsetTop
            const height = el.offsetHeight
            if (scrollPosition >= top && scrollPosition < top + height) {
              currentSection = link.target
              break
            }
          }
        }
      }

      if (currentSection !== activeSection) {
        setActiveSection(currentSection)
        // Update URL path without jumping/reloading page
        const path = currentSection === 'home' ? '/' : `/${currentSection}`
        if (window.location.pathname !== path) {
          window.history.replaceState(null, null, path)
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial run
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeSection])

  const handleNavClick = (targetId) => {
    if (window.location.pathname !== '/') {
      window.location.href = '/' + (targetId === 'home' ? '' : '#' + targetId);
      return;
    }

    setActiveSection(targetId)

    window.history.pushState(null, null, targetId === 'home' ? '/' : `/${targetId}`)

    if (targetId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const el = document.getElementById(targetId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const showSolidNavbar = isScrolled || menuOpen

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 py-3 font-sans select-none ${
      showSolidNavbar
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
        : 'bg-transparent shadow-none border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <div
            className="flex items-center cursor-pointer select-none"
            onClick={() => handleNavClick('home')}
          >
            <img src="/landing/logo.png" alt="Gmaxepay HR Logo" className="h-12 w-auto" />
          </div>

          {/* Nav links (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map(link => (
              <button
                key={link.target}
                onClick={() => handleNavClick(link.target)}
                className={`px-3.5 py-1.5 bg-transparent border-none font-bold text-[14px] cursor-pointer rounded-lg transition-all duration-200 ${activeSection === link.target
                    ? 'text-[#28823A] font-extrabold bg-[#28823A]/5'
                    : 'text-[#5C715E] hover:text-[#28823A] hover:bg-[#28823A]/5'
                  }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Login (Desktop) */}
          <div className="hidden md:block">
            <button
              className="bg-[#28823A] hover:bg-[#1f662c] text-white font-extrabold rounded-xl py-2.5 px-6 text-[13px] shadow-[0_4px_12px_rgba(40,130,58,0.15)] transition-all duration-200 cursor-pointer"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button className="md:hidden text-[#0D2411] hover:text-[#28823A] bg-transparent border-none cursor-pointer p-1" onClick={() => setMenuOpen(!menuOpen)}>
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
                key={link.target}
                onClick={() => { handleNavClick(link.target); setMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 bg-transparent border-none font-bold text-[15px] cursor-pointer rounded-xl transition-all duration-200 ${activeSection === link.target
                    ? 'text-[#28823A] font-extrabold bg-[#28823A]/5'
                    : 'text-[#5C715E] hover:text-[#28823A] hover:bg-[#28823A]/5'
                  }`}
              >
                {link.name}
              </button>
            ))}
            <button
              className="bg-[#28823A] hover:bg-[#1f662c] text-white font-extrabold w-full text-center py-3 text-[14px] mt-2 rounded-xl shadow-[0_4px_12px_rgba(40,130,58,0.15)] transition-all duration-200 cursor-pointer"
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

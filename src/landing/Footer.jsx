import { Link } from 'react-router-dom';

const NAV_GROUPS = [
  {
    title: 'Product',
    links: ['Features', 'FAQ', 'Demo Portal', 'Testimonials', 'Book Demo']
  },
  {
    title: 'Company',
    links: ['Privacy Policy', 'Terms & Conditions']
  }
]

const TARGET_MAP = {
  'Features': 'features',
  'FAQ': 'faq',
  'Demo Portal': 'demo',
  'Testimonials': 'testimonials',
  'Book Demo': 'booking'
}

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
)

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
)

const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
)

const WhatsappIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21l1.6-4.9C3.6 14.7 3 13.1 3 11.5 3 6.8 6.8 3 11.5 3S20 6.8 20 11.5 16.2 20 11.5 20c-1.6 0-3.2-.6-4.6-1.6L3 21z" />
    <path d="M9 9c.2-.4.6-.4.8-.2.5.5.9.9 1.4 1.4.2.2.2.6 0 .8l-.3.3c-.2.2-.2.5 0 .7.5.5 1.1 1.1 1.6 1.6.2.2.5.2.7 0l.3-.3c.2-.2.6-.2.8 0 .5.5.9.9 1.4 1.4.2.2.2.6-.2.8-.2.2-.5.3-.8.3-1.6 0-3.3-.7-4.5-1.9S8.2 10.6 8.2 9c0-.3.4-.6.8-.8z" />
  </svg>
)

export default function Footer() {
  return (
    <div className="bg-[#E5F7E3]/60 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
      <footer id="contact" className="max-w-7xl mx-auto bg-white rounded-[32px] border border-gray-200/50 p-8 sm:p-12 md:p-16 shadow-[0_8px_30px_rgba(0,0,0,0.015)] font-sans select-none">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16">

          {/* Left Column: Brand Logo, Copywriting, Social Icons */}
          <div className="md:col-span-6 space-y-6">
            <div
              className="flex items-center cursor-pointer select-none"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.history.pushState(null, null, '/');
              }}
            >
              <img src="/landing/logo.png" alt="Gmaxepay HR Logo" className="h-12 w-auto" />
            </div>

            <p className="text-[14px] text-gray-500 leading-relaxed max-w-md font-normal">
              Gmaxepay Fintech Solutions Pvt Ltd.

              2nd Floor, No 712, Modi Hospital Rd.

              Mahalakshmi Puram, West of Chord Road, Stage 2, Nagapura, Bengaluru,

              Karnataka 560086
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-5 text-gray-400">
              <a
                href="https://www.facebook.com/gmaxepayfintech"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#28823A] transition-colors duration-150"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://www.instagram.com/gmaxepay_fintech"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#28823A] transition-colors duration-150"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.linkedin.com/company/gmaxepay-fintech/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#28823A] transition-colors duration-150"
                aria-label="LinkedIn"
              >
                <LinkedinIcon />
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=918088651844&text&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#28823A] transition-colors duration-150"
                aria-label="WhatsApp"
              >
                <WhatsappIcon />
              </a>
            </div>
          </div>

          {/* Right Columns: Navigation Columns */}
          <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {NAV_GROUPS.map((group, i) => (
              <div key={i} className="space-y-4">
                <div className="text-[14px] font-bold text-[#0D2411] tracking-wide">
                  {group.title}
                </div>
                <div className="space-y-2.5">
                  {group.links.map(link => {
                    if (link === 'Privacy Policy') {
                      return (
                        <Link
                          key={link}
                          to="/privacy-policy"
                          className="block text-[13px] sm:text-[14px] text-gray-400 hover:text-[#28823A] transition-colors duration-150 font-normal no-underline"
                        >
                          {link}
                        </Link>
                      );
                    }
                    return (
                      <a
                        key={link}
                        href={group.title === 'Product' ? `#${TARGET_MAP[link]}` : '#'}
                        onClick={(e) => {
                          if (group.title === 'Product') {
                            e.preventDefault();
                            if (window.location.pathname !== '/') {
                              window.location.href = '/#' + TARGET_MAP[link];
                              return;
                            }
                            const el = document.getElementById(TARGET_MAP[link]);
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="block text-[13px] sm:text-[14px] text-gray-400 hover:text-[#28823A] transition-colors duration-150 font-normal no-underline"
                      >
                        {link}
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Bar: Copyright and Legal */}
        <div className="border-t border-gray-150 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="text-[13px] text-gray-400 font-normal">
            © 2026 Gmaxepay. All rights reserved.
          </div>
          <div className="text-[13px] text-gray-400 font-normal">
            Crafted by <a href="https://www.gmaxepay.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#5C715E] hover:text-[#28823A] transition-colors duration-150 no-underline">Gmaxepay</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

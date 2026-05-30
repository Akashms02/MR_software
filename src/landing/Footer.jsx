const NAV_GROUPS = [
  { title: 'Product',  links: ['Features', 'Workflow', 'Pricing', 'Security', 'Integrations'] },
  { title: 'Company',  links: ['About Us', 'Blog', 'Careers', 'Press Kit', 'Partners'] },
  { title: 'Support',  links: ['Documentation', 'API Reference', 'Status Page', 'Help Center', 'Contact Us'] },
]

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12 pb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M12 2v20M3 7l9 5 9-5" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="font-extrabold text-[17px] text-gray-900 leading-none">
                  Gmaxepay<span className="text-green-600">HR</span>
                </div>
                <div className="text-[9px] text-gray-400 font-bold tracking-[1px] leading-none mt-0.5 uppercase">PHARMA HRMS</div>
              </div>
            </div>

            <p className="text-[13px] text-gray-400 leading-relaxed max-w-[240px] mb-5">
              The intelligent HRMS built for pharma enterprises. From hire to rehire — one seamless platform.
            </p>

            {[
              { icon: '📧', text: 'hello@gmaxepayhr.in' },
              { icon: '📞', text: '+91 98765 43210' },
              { icon: '🏢', text: 'Mumbai · Bengaluru · Hyderabad' },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="text-[13px]">{c.icon}</span>
                <span className="text-[13px] text-gray-400 font-medium">{c.text}</span>
              </div>
            ))}

            <div className="mt-5">
              <span className="bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold px-3 py-1 rounded-[20px] tracking-wide inline-block">
                🏛️ Empaneled with NICSI · MeitY, Govt. of India
              </span>
            </div>
          </div>

          {/* Nav groups */}
          {NAV_GROUPS.map((group, i) => (
            <div key={i}>
              <div className="text-[11px] font-bold text-green-700 uppercase tracking-widest mb-4">
                {group.title}
              </div>
              {group.links.map(link => (
                <a
                  key={link}
                  href="#"
                  className="block text-[13px] text-gray-400 hover:text-green-600 transition-colors duration-150 mb-2.5 font-medium no-underline"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 py-6 flex flex-wrap items-center justify-between gap-3 text-center sm:text-left">
          <div className="text-[12px] text-gray-400 font-medium">
            © 2026 GmaxepayHR. Powered by <span className="text-green-600 font-bold">GreenCall Technologies Pvt. Ltd.</span> · All rights reserved.
          </div>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms', 'Cookies'].map(l => (
              <a
                key={l}
                href="#"
                className="text-[12px] text-gray-400 hover:text-green-600 transition-colors duration-150 font-semibold no-underline"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

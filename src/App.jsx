import { useState, useEffect } from 'react'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { title: 'AEPS Solutions', desc: 'Seamless biometric authentication and financial transactions.', icon: '💳' },
    { title: 'HRMS Portal', desc: 'Unified employee management, attendance, and leave tracking.', icon: '👥' },
    { title: 'Medical CRM', desc: 'Specialized tools for healthcare providers and inventory.', icon: '🏥' },
    { title: 'Smart Notifications', desc: 'Real-time alerts with role-based transparency.', icon: '🔔' },
  ];

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-xl">MR</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Software</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">Solutions</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Resources</a>
            <button className="btn-primary">Launch Dashboard</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              v4.0 Now Live
            </div>
            
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Next-Gen <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500">
                Software Solutions
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              Empowering businesses with robust HRMS, AEPS, and Healthcare platforms. 
              Built for scale, security, and unparalleled user experience.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary text-lg px-8 py-4">Get Started Free</button>
              <button className="px-8 py-4 rounded-full font-semibold border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2">
                View Demo
              </button>
            </div>

            <div className="pt-8 flex items-center gap-6 border-t border-slate-200">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Joined by <span className="text-slate-900">2,000+</span> enterprises worldwide
              </p>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right duration-1000 delay-200">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-[2.5rem] blur-2xl opacity-20" />
            <div className="relative glass rounded-[2.5rem] overflow-hidden border border-white/40 shadow-2xl">
              <img 
                src={heroImg} 
                alt="Dashboard Preview" 
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
              />
              
              {/* Floating Notification Mock */}
              <div className="absolute top-6 right-6 w-64 glass p-4 rounded-2xl shadow-xl animate-bounce-slow">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    🔔
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">New Approval Request</p>
                    <p className="text-[10px] text-slate-500">Manager approved leave for John Doe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto mt-32 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-slate-900">Comprehensive Ecosystem</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Everything you need to manage your business operations in one unified dashboard.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card group">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MR</span>
            </div>
            <span className="font-bold text-slate-900">MR Software</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 MR Software Solutions. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Twitter', 'GitHub', 'LinkedIn'].map(s => (
              <a key={s} href="#" className="text-sm text-slate-400 hover:text-indigo-600 transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App


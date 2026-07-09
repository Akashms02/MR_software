import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sparkles, RotateCcw, Eye, UploadCloud, Check, X, ArrowLeft, ChevronRight } from 'lucide-react'
import { fetchProfile } from '../../redux/actions/authActions'
import { useToast } from '../../context/ToastContext'
import { useCompanyBrandAssets } from '../../utils/getFullAssetUrl'
import {
  loadLetterheadSettings,
  LetterheadHeader,
  LetterheadFooter,
  THEME_COLORS
} from '../../components/documents/shared/letterheadContact'

import OfferLetter from '../../components/documents/OfferLetter'
import RelievingLetter from '../../components/documents/RelievingLetter'
import SalarySlip from '../../components/documents/SalarySlip'
import TerminationLetter from '../../components/documents/TerminationLetter'

export default function Documents() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { logoSrc: brandLogoSrc } = useCompanyBrandAssets(user)

  const { showToast } = useToast()
  const [activeView, setActiveView] = useState('hub')
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [letterheadSettings, setLetterheadSettings] = useState(() => loadLetterheadSettings(user))

  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  useEffect(() => {
    if (user) {
      setLetterheadSettings(loadLetterheadSettings(user))
    }
  }, [user])

  const handleSaveLetterhead = () => {
    if (!letterheadSettings.companyName || !letterheadSettings.companyName.trim()) {
      showToast('Company Name is required.', 'error')
      return false
    }
    if (letterheadSettings.companyName.trim().length < 2) {
      showToast('Company Name must be at least 2 characters.', 'error')
      return false
    }

    if (!letterheadSettings.email || !letterheadSettings.email.trim()) {
      showToast('Official Email is required.', 'error')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(letterheadSettings.email.trim())) {
      showToast('Please enter a valid official email address.', 'error')
      return false
    }

    if (!letterheadSettings.phone || !letterheadSettings.phone.trim()) {
      showToast('Contact Phone number is required.', 'error')
      return false
    }
    if (!/^[0-9\s+,;-]{10,40}$/.test(letterheadSettings.phone.trim())) {
      showToast('Please enter a valid phone number (at least 10 digits).', 'error')
      return false
    }

    if (!letterheadSettings.website || !letterheadSettings.website.trim()) {
      showToast('Corporate Website is required.', 'error')
      return false
    }
    const webRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
    if (!webRegex.test(letterheadSettings.website.trim())) {
      showToast('Please enter a valid corporate website URL.', 'error')
      return false
    }

    if (!letterheadSettings.address || !letterheadSettings.address.trim()) {
      showToast('Registered Office Address is required.', 'error')
      return false
    }
    if (letterheadSettings.address.trim().length < 10) {
      showToast('Office Address must be at least 10 characters long.', 'error')
      return false
    }

    localStorage.setItem('custom_letterhead_settings', JSON.stringify(letterheadSettings))
    showToast('Letterhead style successfully updated!', 'success')
    return true
  }

  const handleResetLetterhead = () => {
    let compName = 'NOEL PHARMA';
    let compTagline = '(INDIA) PRIVATE LIMITED';

    if (user?.fullName) {
      const fullName = user.fullName.toUpperCase();
      if (fullName.includes('NOEL PHARMA')) {
        compName = 'NOEL PHARMA';
        compTagline = fullName.replace('NOEL PHARMA', '').trim();
      } else {
        const parts = fullName.split(' ');
        compName = parts[0];
        compTagline = parts.slice(1).join(' ');
      }
    }

    const defaults = {
      themeId: '1',
      companyName: compName,
      companyTagline: compTagline,
      phone: user?.phone || '9886024514',
      email: user?.email || 'mail-noelhr1975@gmail.com',
      website: 'www.noelpharma.com',
      address: user?.address || "Survey Nos: 1 to 40, Plot No. 109, Uppal Bhagagayath Revenue Village, Uppal-Mandal, Medchal-Malkajgiri, Hyderabad-500039",
      primaryColor: '#166534',
      secondaryColor: '#d97706'
    }
    setLetterheadSettings(defaults)
  }

  const documentCards = [
    {
      key: 'offer',
      icon: '📝',
      title: 'Offer & Appointment Letter',
      description:
        'Generate professional recruitment offer letters with dynamic salary CTC breakdowns, probation clauses, and corporate seal simulation.',
      iconBg: 'bg-emerald-50 border-emerald-100',
      iconColor: 'text-emerald-500',
      accent: 'hover:border-emerald-500 hover:shadow-emerald-100 text-emerald-500'
    },
    {
      key: 'relieving',
      icon: '🎓',
      title: 'Relieving & Experience Certificate',
      description:
        'Issue professional relieving orders and experience letters verifying dynamic tenures, conduct summaries, and clearance validation.',
      iconBg: 'bg-blue-50 border-blue-100',
      iconColor: 'text-blue-500',
      accent: 'hover:border-blue-500 hover:shadow-blue-100 text-blue-500'
    },
    {
      key: 'payslip',
      icon: '💵',
      title: 'Salary Pay Slip (Payslip)',
      description:
        'Generate detailed corporate salary pay slips with structured earnings, statutory deductions, bank accounts, and numerical word conversion.',
      iconBg: 'bg-amber-50 border-amber-100',
      iconColor: 'text-amber-500',
      accent: 'hover:border-amber-500 hover:shadow-amber-100 text-amber-500'
    },
    {
      key: 'termination',
      icon: '⚠️',
      title: 'Termination & Separation Letter',
      description:
        'Generate professional termination and employee separation letters with notice period details, policy references, exit formalities, and HR authorization.',
      iconBg: 'bg-red-50 border-red-100',
      iconColor: 'text-red-500',
      accent: 'hover:border-red-500 hover:shadow-red-100 text-red-500'
    }
  ]

  const docMeta = {
    offer: {
      title: "Offer & Appointment Letter",
      desc: "Design, customize, and print high-fidelity candidate offer letters."
    },
    relieving: {
      title: "Relieving & Experience Certificate",
      desc: "Design, customize, and print high-fidelity candidate relieving and experience letters."
    },
    payslip: {
      title: "Salary Pay Slip",
      desc: "Design, customize, and print high-fidelity corporate payslips."
    },
    termination: {
      title: "Termination & Separation Letter",
      desc: "Design, customize, and print high-fidelity candidate termination and separation letters."
    }
  }

  const currentMeta = docMeta[activeView] || docMeta.offer

  return (
    <div className="pb-8 animate-[fadeIn_0.35s_ease-out] relative">
      {/* Alerts handled by global toast system */}

      {activeView === 'hub' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 h-[calc(100vh-140px)] min-h-[480px]">
          {documentCards.map((card) => (
            <div
              key={card.key}
              onClick={() => setActiveView(card.key)}
              className={`
                group cursor-pointer rounded-3xl border border-gray-200 bg-white p-7
                shadow-sm transition-all duration-300 ease-in-out
                hover:-translate-y-2 hover:shadow-2xl h-full
                ${card.accent}
              `}
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div
                    className={`
                      mb-6 flex h-14 w-14 items-center justify-center
                      rounded-2xl border text-2xl
                      ${card.iconBg} ${card.iconColor}
                    `}
                  >
                    {card.icon}
                  </div>

                  <h3 className="mb-2 text-lg font-extrabold text-gray-900">
                    {card.title}
                  </h3>

                  <p className="text-sm leading-6 text-gray-500">
                    {card.description}
                  </p>
                </div>

                <div
                  className={`
                    mt-6 flex items-center gap-2 text-sm font-bold
                    ${card.iconColor}
                  `}
                >
                  Configure Document
                  <ChevronRight size={15} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView !== 'hub' && (
        <div className="space-y-6 pt-4">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0 no-print">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('hub')}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600 rounded-xl bg-white transition-all shadow-sm active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Hub
              </button>
              <div>
                <h2 className="text-xl sm:text-[22px] font-bold text-slate-800">{currentMeta.title}</h2>
                <p className="text-slate-500 mt-1 text-sm">{currentMeta.desc}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCustomizer(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              Customize Letterhead
            </button>
          </div>

          {/* Letterhead Customizer Modal */}
          {showCustomizer && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 no-print">
              <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-blue-500/70" />
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800">Document Letterhead Customizer</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Customize headers &amp; footers for all official letters</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCustomizer(false)}
                    className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Template Selection */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Select Header &amp; Footer Template Shape</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: '1', name: 'Classic Green & Gold slant', desc: 'Diagonal slants with green & gold tones', colors: ['#166534', '#d97706'] },
                        { id: '2', name: 'Corporate Step Slash', desc: 'Slashed geometry with blue & teal tones', colors: ['#2563eb', '#06b6d4'] },
                        { id: '3', name: 'Organic Emerald & Mint Wave', desc: 'Curved flowy bezier waves with green tones', colors: ['#047857', '#34d399'] },
                        { id: '4', name: 'Tech Charcoal & Gold Hexagon', desc: 'Industrial angular cuts with tech elements', colors: ['#374151', '#f59e0b'] }
                      ].map((tpl) => {
                        const isSelected = letterheadSettings.themeId === tpl.id;
                        return (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => {
                              const tplColors = THEME_COLORS[tpl.id] || THEME_COLORS['1'];
                              setLetterheadSettings(prev => ({
                                ...prev,
                                themeId: tpl.id,
                                primaryColor: tplColors.primary,
                                secondaryColor: tplColors.secondary
                              }));
                            }}
                            className={`flex items-start p-3 rounded-xl border text-left transition-all relative w-full ${
                              isSelected
                                ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
                                : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex flex-col w-full">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[12px] font-extrabold text-slate-800">{tpl.name}</span>
                                {isSelected && <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white"><Check className="w-2.5 h-2.5" /></span>}
                              </div>
                              <div className="flex gap-1 h-3 rounded overflow-hidden mb-2">
                                <div className="flex-1" style={{ backgroundColor: tpl.colors[0] }} />
                                <div className="flex-1" style={{ backgroundColor: tpl.colors[1] }} />
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium leading-tight">{tpl.desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customize Colors */}
                  <div className="border-t border-slate-100 pt-5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Customize Template Colors (Optional)</label>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-350 shadow-sm shrink-0">
                          <input
                            type="color"
                            value={letterheadSettings.primaryColor || '#166534'}
                            onChange={(e) => setLetterheadSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Color</span>
                          <input
                            type="text"
                            maxLength="7"
                            value={letterheadSettings.primaryColor || ''}
                            onChange={(e) => setLetterheadSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="text-xs font-bold text-slate-700 font-mono focus:outline-none w-18 bg-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-350 shadow-sm shrink-0">
                          <input
                            type="color"
                            value={letterheadSettings.secondaryColor || '#d97706'}
                            onChange={(e) => setLetterheadSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secondary Color</span>
                          <input
                            type="text"
                            maxLength="7"
                            value={letterheadSettings.secondaryColor || ''}
                            onChange={(e) => setLetterheadSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="text-xs font-bold text-slate-700 font-mono focus:outline-none w-18 bg-transparent"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const themeId = letterheadSettings.themeId || '1';
                          const defaults = THEME_COLORS[themeId] || THEME_COLORS['1'];
                          setLetterheadSettings(prev => ({
                            ...prev,
                            primaryColor: defaults.primary,
                            secondaryColor: defaults.secondary
                          }));
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95 border border-blue-100"
                      >
                        Reset to Defaults
                      </button>
                    </div>
                  </div>

                  {/* Company Details Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Company Name</label>
                      <input
                        type="text"
                        value={letterheadSettings.companyName || ''}
                        onChange={(e) => setLetterheadSettings(prev => ({ ...prev, companyName: e.target.value.toUpperCase() }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-50/20 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Company Tagline</label>
                      <input
                        type="text"
                        value={letterheadSettings.companyTagline || ''}
                        onChange={(e) => setLetterheadSettings(prev => ({ ...prev, companyTagline: e.target.value.toUpperCase() }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-50/20 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contact Phone(s)</label>
                      <input
                        type="text"
                        value={letterheadSettings.phone || ''}
                        onChange={(e) => setLetterheadSettings(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-50/20 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Official Email</label>
                      <input
                        type="email"
                        value={letterheadSettings.email || ''}
                        onChange={(e) => setLetterheadSettings(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-50/20 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Corporate Website</label>
                      <input
                        type="text"
                        value={letterheadSettings.website || ''}
                        onChange={(e) => setLetterheadSettings(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-50/20 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Registered Address (Footer)</label>
                      <textarea
                        rows="2"
                        value={letterheadSettings.address || ''}
                        onChange={(e) => setLetterheadSettings(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-50/20 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-slate-150 flex items-center justify-between bg-slate-50">
                  <button
                    type="button"
                    onClick={handleResetLetterhead}
                    className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset to Profile
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border border-slate-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (handleSaveLetterhead()) {
                          setShowCustomizer(false)
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      Apply &amp; Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Render Selected Document Page */}
          <div className="relative">
            {activeView === 'offer' && (
              <OfferLetter letterheadSettings={letterheadSettings} onBack={() => setActiveView('hub')} />
            )}

            {activeView === 'relieving' && (
              <RelievingLetter letterheadSettings={letterheadSettings} onBack={() => setActiveView('hub')} />
            )}

            {activeView === 'payslip' && (
              <SalarySlip letterheadSettings={letterheadSettings} onBack={() => setActiveView('hub')} />
            )}

            {activeView === 'termination' && (
              <TerminationLetter letterheadSettings={letterheadSettings} onBack={() => setActiveView('hub')} />
            )}
          </div>

          {/* High-Fidelity Preview Modal */}
          {showPreviewModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 no-print">
              <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">High-Fidelity Letterhead Preview</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Showing Theme {letterheadSettings.themeId} design layout</p>
                  </div>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-100 p-8 flex justify-center">
                  <div style={{
                    position: 'relative',
                    width: '794px',
                    height: '1123px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #cbd5e1'
                  }}>
                    <LetterheadHeader logoSrc={brandLogoSrc} settings={letterheadSettings} />

                    <div className="p-12 space-y-6 text-slate-700" style={{ fontFamily: 'Arial, sans-serif' }}>
                      <div className="text-right text-xs text-slate-400">Date: June 19, 2026</div>
                      <div className="text-xs font-bold text-slate-500">Ref: NOEL/HR/2026/1024</div>
                      <div className="h-6 bg-slate-100 rounded w-1/4 mb-10" />

                      <h1 className="text-xl font-bold uppercase tracking-tight text-center my-6" style={{ color: letterheadSettings.primaryColor || '#166534' }}>
                        Sample Letter Title
                      </h1>

                      <p className="text-[13px] leading-relaxed">Dear Candidate,</p>
                      <p className="text-[13px] leading-relaxed text-justify">
                        This is a live preview of your custom corporate letterhead template. All generated documents will dynamically inherit the header and footer styling shown here.
                      </p>

                      <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-500">Prepared By:</p>
                          <p className="text-sm font-extrabold text-slate-800">HR Department</p>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{letterheadSettings.companyName}</p>
                        </div>
                        <div className="text-center w-24 h-24 border border-dashed border-slate-200 rounded flex items-center justify-center text-[10px] text-slate-300">
                          Seal &amp; Signature
                        </div>
                      </div>
                    </div>

                    <LetterheadFooter settings={letterheadSettings} />
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-150 flex justify-end gap-3 bg-slate-50">
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="px-4 py-2 border border-slate-250 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-colors"
                  >
                    Close Preview
                  </button>
                  <button
                    onClick={() => {
                      if (handleSaveLetterhead()) {
                        setShowPreviewModal(false)
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Apply &amp; Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../api/axiosInstance';
import { API_ROUTE } from '../../data/env';
import { useToast } from '../../context/ToastContext';
import { 
  BookOpen, Eye, Play, Search, X, Users, Tag, Info, Loader2 
} from 'lucide-react';
import DvaFlipbookModal from '../../components/DvaFlipbookModal';
import { getFullAssetUrl } from '../../utils/getFullAssetUrl';

const matchSpeciality = (speciality, query) => {
  if (!speciality) return false;
  const spec = speciality.toLowerCase().trim();
  const q = query.toLowerCase().trim();
  
  if (spec.includes(q) || q.includes(spec)) return true;
  
  // Stemming / Synonym mapping for medical specialities
  const mappings = [
    { stems: ['dermat', 'skin', 'dermatolof'], label: 'dermatology' },
    { stems: ['pediatr', 'child'], label: 'pediatrics' },
    { stems: ['cardio', 'heart'], label: 'cardiology' },
    { stems: ['gyneco', 'women', 'obgyn'], label: 'gynecology' },
    { stems: ['ortho', 'bone'], label: 'orthopedics' },
    { stems: ['ophthal', 'eye'], label: 'ophthalmology' },
    { stems: ['neuro', 'brain'], label: 'neurology' },
    { stems: ['gastro', 'stomach'], label: 'gastroenterology' },
    { stems: ['dent', 'tooth', 'teeth'], label: 'dentist' },
    { stems: ['general', 'gp', 'physician'], label: 'general medicine' }
  ];
  
  for (const map of mappings) {
    const qMatches = map.stems.some(stem => q.includes(stem));
    const specMatches = map.stems.some(stem => spec.includes(stem));
    if (qMatches && specMatches) return true;
  }
  
  return false;
};

export default function MRVisualAidPage() {
  const { showToast } = useToast();

  const [brochures, setBrochures] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selector Modal
  const [selectedBrochure, setSelectedBrochure] = useState(null);
  const [isSelectTargetOpen, setIsSelectTargetOpen] = useState(false);
  const [targetSearch, setTargetSearch] = useState('');
  const [selectedTarget, setSelectedTarget] = useState(null);
  
  // Main Page Target Selector
  const [mainTargetSearch, setMainTargetSearch] = useState('');
  const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(false);

  // Brochure Search Filter
  const [brochureSearch, setBrochureSearch] = useState('');
  const [globalPdfTexts, setGlobalPdfTexts] = useState({}); // { [brochureId]: Array of page texts }

  // Helper to dynamically load pdf.js from CDN
  const loadPdfJs = () => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF loader script'));
      document.head.appendChild(script);
    });
  };

  // Asynchronously index all PDF brochures in the background with local caching
  useEffect(() => {
    const indexAllPdfs = async () => {
      if (brochures.length === 0) return;
      
      const pdfBrochures = brochures.filter(b => !b.custom && b.pdfUrl);
      const cached = {};
      const pending = [];
      
      for (const b of pdfBrochures) {
        try {
          const cacheKey = `pdf_texts_cache_${b.id}`;
          const cachedVal = localStorage.getItem(cacheKey);
          if (cachedVal) {
            cached[b.id] = JSON.parse(cachedVal);
          } else {
            pending.push(b);
          }
        } catch (e) {
          pending.push(b);
        }
      }
      
      if (Object.keys(cached).length > 0) {
        setGlobalPdfTexts(prev => ({ ...prev, ...cached }));
      }
      
      if (pending.length === 0) return;

      try {
        const pdfjs = await loadPdfJs();
        for (const b of pending) {
          try {
            const url = getFullAssetUrl(b.pdfUrl);
            const doc = await pdfjs.getDocument(url).promise;
            const texts = [];
            
            for (let i = 1; i <= doc.numPages; i++) {
              const page = await doc.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map(item => (typeof item === 'string' ? item : item?.str || ''))
                .join(' ')
                .toLowerCase();
              texts.push(pageText);
            }
            
            try {
              localStorage.setItem(`pdf_texts_cache_${b.id}`, JSON.stringify(texts));
            } catch (e) {
              console.warn('Storage quota exceeded, text not cached locally', e);
            }
            
            setGlobalPdfTexts(prev => ({
              ...prev,
              [b.id]: texts
            }));
          } catch (err) {
            console.error(`Failed to globally index PDF brochure ${b.title}`, err);
          }
        }
      } catch (err) {
        console.error('Failed to load PDF.js for global indexing', err);
      }
    };

    indexAllPdfs();
  }, [brochures]);

  // Active Presentation Flipbook
  const [activePresentation, setActivePresentation] = useState(null); // { brochure, target }

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [brochureRes, contactRes] = await Promise.all([
        axios.get(`${API_ROUTE}/visual-aids`),
        axios.get(`${API_ROUTE}/doctor/unified-contacts`)
      ]);
      setBrochures(brochureRes.data.data || []);
      
      const dataObj = contactRes.data?.data || {};
      const doctorsList = Array.isArray(dataObj.doctors)
        ? dataObj.doctors.map(d => ({
            ...d,
            type: 'DOCTOR',
            clinicName: d.clinicName || d.address || ''
          }))
        : [];
      const chemistsList = Array.isArray(dataObj.chemists)
        ? dataObj.chemists.map(c => ({
            ...c,
            fullName: c.name || c.fullName || 'Unknown Chemist',
            speciality: 'CHEMIST',
            type: 'CHEMIST',
            clinicName: c.address || ''
          }))
        : [];
      setContacts([...doctorsList, ...chemistsList]);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch catalog lists', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleStartPresentation = (brochure) => {
    if (selectedTarget) {
      // If a target session is active, start detailing directly!
      setActivePresentation({
        brochure,
        target: selectedTarget
      });
    } else {
      setSelectedBrochure(brochure);
      setIsSelectTargetOpen(true);
      setSelectedTarget(null);
      setTargetSearch('');
    }
  };

  const launchViewer = (withTarget = true) => {
    if (withTarget && !selectedTarget) {
      showToast('Please select a target doctor or chemist to log detailing logs', 'error');
      return;
    }

    setActivePresentation({
      brochure: selectedBrochure,
      target: withTarget ? selectedTarget : null
    });
    setIsSelectTargetOpen(false);
  };

  const filteredContacts = contacts.filter(c => {
    if (!targetSearch.trim()) return true;
    const term = targetSearch.toLowerCase().trim();
    const tokens = term.split(/\s+/).filter(t => t.length > 0);
    
    const fullName = (c.fullName || '').toLowerCase();
    const speciality = (c.speciality || '').toLowerCase();
    const type = (c.type || '').toLowerCase();
    const clinicName = (c.clinicName || '').toLowerCase();

    return tokens.every(token => {
      const isSpecMatch = matchSpeciality(speciality, token);
      return (
        fullName.includes(token) ||
        isSpecMatch ||
        type.includes(token) ||
        clinicName.includes(token)
      );
    });
  });

  const filteredMainContacts = contacts.filter(c => {
    if (!mainTargetSearch.trim()) return false;
    const term = mainTargetSearch.toLowerCase().trim();
    const tokens = term.split(/\s+/).filter(t => t.length > 0);
    
    const fullName = (c.fullName || '').toLowerCase();
    const speciality = (c.speciality || '').toLowerCase();
    const type = (c.type || '').toLowerCase();
    const clinicName = (c.clinicName || '').toLowerCase();

    return tokens.every(token => {
      const isSpecMatch = matchSpeciality(speciality, token);
      return (
        fullName.includes(token) ||
        isSpecMatch ||
        type.includes(token) ||
        clinicName.includes(token)
      );
    });
  });

  const filteredBrochures = brochures.filter(b => {
    if (!brochureSearch.trim()) return true;
    const term = brochureSearch.toLowerCase().trim();
    const tokens = term.split(/\s+/).filter(t => t.length > 0);

    const title = (b.title || '').toLowerCase();
    const desc = (b.description || '').toLowerCase();

    // Check custom page keywords/titles if available
    const hasCustomMatch = b.custom && b.pages && b.pages.some(p => {
      const pageTitle = (p.title || '').toLowerCase();
      const pageDesc = (p.description || '').toLowerCase();
      const pageKws = (p.keywords || '').toLowerCase();
      return tokens.every(token => 
        pageTitle.includes(token) || 
        pageDesc.includes(token) || 
        pageKws.includes(token)
      );
    });

    // Check global PDF texts if available
    const pdfPagesTexts = globalPdfTexts[b.id] || [];
    const hasPdfMatch = !b.custom && pdfPagesTexts.some(pageText => {
      return tokens.every(token => {
        const isDermMatch = (token.includes('dermat') || token.includes('skin')) && 
          (pageText.includes('dermat') || pageText.includes('skin'));
        const isBabyMatch = (token.includes('baby') || token.includes('child') || token.includes('pediatr')) &&
          (pageText.includes('baby') || pageText.includes('child') || pageText.includes('pediatr'));
        
        return (
          pageText.includes(token) ||
          isDermMatch ||
          isBabyMatch
        );
      });
    });

    return tokens.every(token => {
      const isDermMatch = (token.includes('dermat') || token.includes('skin')) && 
        (title.includes('dermat') || desc.includes('dermat') || title.includes('skin') || desc.includes('skin'));
      const isBabyMatch = (token.includes('baby') || token.includes('child') || token.includes('pediatr')) &&
        (title.includes('baby') || desc.includes('baby') || title.includes('child') || desc.includes('child') || title.includes('pediatr') || desc.includes('pediatr'));
      
      return (
        title.includes(token) || 
        desc.includes(token) ||
        isDermMatch ||
        isBabyMatch
      );
    }) || hasCustomMatch || hasPdfMatch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product Visual Aids</h1>
        <p className="text-gray-500 text-sm">Select a catalog to detail and present pharmaceutical product cards to doctors or chemists.</p>
      </div>

      {/* Detailing Target Session Selection Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Users size={16} className="text-indigo-650" />
              Active Detailing Target
            </h3>
            <p className="text-gray-500 text-xs">
              Select the doctor or chemist you are visiting to log detailing actions directly.
            </p>
          </div>
          {selectedTarget ? (
            <div className="flex items-center gap-3 bg-indigo-50/70 border border-indigo-150 px-4 py-2 rounded-xl">
              <div className="text-xs">
                <span className="font-bold text-indigo-900">{selectedTarget.fullName}</span>
                <span className="text-indigo-650 ml-1.5 uppercase font-extrabold text-[10px] bg-indigo-100 px-1.5 py-0.5 rounded">
                  {selectedTarget.speciality || selectedTarget.type}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedTarget(null);
                  setMainTargetSearch('');
                }}
                className="p-1 text-indigo-400 hover:text-indigo-700 bg-transparent border-none cursor-pointer flex items-center"
                title="Clear detailing session"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="relative w-80 max-w-full">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Search doctor name or speciality..."
                  value={mainTargetSearch}
                  onChange={(e) => {
                    setMainTargetSearch(e.target.value);
                    setIsMainDropdownOpen(true);
                  }}
                  onFocus={() => setIsMainDropdownOpen(true)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-gray-50/50"
                />
              </div>

              {/* Main Search Dropdown */}
              {isMainDropdownOpen && mainTargetSearch.trim() && (
                <>
                  <div className="fixed inset-0 z-[40]" onClick={() => setIsMainDropdownOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-150 rounded-xl shadow-lg max-h-60 overflow-y-auto z-[50]">
                    {filteredMainContacts.length === 0 ? (
                      <div className="p-3 text-center text-xs text-gray-400">No doctors or chemists found</div>
                    ) : (
                      filteredMainContacts.map(contact => (
                        <div
                          key={`${contact.type}_${contact.id}`}
                          onClick={() => {
                            setSelectedTarget(contact);
                            setIsMainDropdownOpen(false);
                            setMainTargetSearch('');
                            showToast(`Detailing session started for ${contact.fullName}`, 'success');
                          }}
                          className="p-2.5 hover:bg-indigo-50/40 cursor-pointer flex items-center justify-between border-b border-gray-50 last:border-none text-left"
                        >
                          <div>
                            <h4 className="font-bold text-gray-800 text-xs">{contact.fullName}</h4>
                            <span className="text-[10px] text-gray-400">{contact.speciality || 'Chemist'}</span>
                          </div>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            contact.type === 'CHEMIST' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                          }`}>
                            {contact.type}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Brochure Search Input Bar */}
      <div className="relative max-w-md">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder="Search brochures by name, product, or category..."
          value={brochureSearch}
          onChange={(e) => setBrochureSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-indigo-500 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-[#4F46E5]" size={36} />
        </div>
      ) : brochures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <BookOpen className="text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-800">No Brochures Uploaded</h3>
          <p className="text-gray-500 text-sm mt-1">Please ask your manager or admin to upload visual aids for presentation.</p>
        </div>
      ) : filteredBrochures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Search className="text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-800">No Matching Catalogs Found</h3>
          <p className="text-gray-500 text-sm mt-1">Try searching for other keywords, categories, or names.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrochures.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <BookOpen size={18} />
                    </span>
                    <h3 className="font-bold text-gray-900 text-md truncate max-w-[150px]" title={b.title}>{b.title}</h3>
                  </div>
                  {b.custom ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Custom Builder
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      PDF File
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{b.description || 'Product detailing visual aid brochure.'}</p>
              </div>

              <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                <button
                  onClick={() => handleStartPresentation(b)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#C8F04A] hover:bg-[#b0d63f] text-slate-900 font-bold rounded-xl text-xs transition-colors shadow-sm border-none cursor-pointer"
                >
                  <Play size={14} /> Start Presentation
                </button>
                {!b.custom && b.pdfUrl && (
                  <a
                    href={getFullAssetUrl(b.pdfUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 border border-gray-200 text-gray-500 hover:text-gray-900 rounded-xl transition-colors hover:bg-gray-50 cursor-pointer"
                    title="Open PDF file directly"
                  >
                    <Eye size={15} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TARGET SELECTION MODAL */}
      {isSelectTargetOpen && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Select Presentation Target</h3>
                <p className="text-gray-550 text-xs mt-0.5">Tag a doctor or chemist to log detailing reports to your manager.</p>
              </div>
              <button
                onClick={() => setIsSelectTargetOpen(false)}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Target search */}
            <div className="my-4 relative shrink-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="Search doctors or chemists..."
                value={targetSearch}
                onChange={(e) => setTargetSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Contacts list */}
            <div className="flex-1 overflow-y-auto min-h-[150px] space-y-2 pr-1 border border-gray-100 rounded-xl p-2 bg-gray-50/50">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No contacts found</div>
              ) : (
                filteredContacts.map(contact => {
                  const isSelected = selectedTarget?.id === contact.id && selectedTarget?.type === contact.type;
                  return (
                    <div
                      key={`${contact.type}_${contact.id}`}
                      onClick={() => setSelectedTarget(contact)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'border-[#4F46E5] bg-indigo-50/60 shadow-sm' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-gray-100 text-gray-500">
                          <Users size={14} />
                        </span>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-xs">{contact.fullName}</h4>
                          <span className="text-[10px] text-gray-400">{contact.speciality || 'Chemist Shop'}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        contact.type === 'CHEMIST' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'bg-[#ECFDF5] text-[#047857]'
                      }`}>
                        {contact.type}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-4 shrink-0">
              <button
                type="button"
                onClick={() => launchViewer(false)}
                className="px-4 py-2 bg-transparent text-gray-500 hover:text-gray-800 text-sm font-semibold border-none cursor-pointer hover:underline"
              >
                Skip logging (Demo only)
              </button>
              <button
                type="button"
                onClick={() => launchViewer(true)}
                disabled={!selectedTarget}
                className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-40 disabled:hover:bg-[#4F46E5] text-white rounded-xl text-xs font-bold transition-all shadow-sm border-none cursor-pointer"
              >
                Launch Catalog Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED FLIPBOOK PRESENTATION VIEWER */}
      {activePresentation && (
        <DvaFlipbookModal
          brochure={activePresentation.brochure}
          target={activePresentation.target}
          onClose={() => {
            setActivePresentation(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

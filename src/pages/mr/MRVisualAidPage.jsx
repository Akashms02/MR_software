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
    setSelectedBrochure(brochure);
    setIsSelectTargetOpen(true);
    setSelectedTarget(null);
    setTargetSearch('');
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
    const term = targetSearch.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(term) ||
      (c.speciality && c.speciality.toLowerCase().includes(term)) ||
      c.type.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product Visual Aids</h1>
        <p className="text-gray-500 text-sm">Select a catalog to detail and present pharmaceutical product cards to doctors or chemists.</p>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brochures.map((b) => (
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

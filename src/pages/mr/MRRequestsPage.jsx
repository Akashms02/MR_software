import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckCircle2, AlertCircle, Clock, FileText, Loader2, RefreshCw, Search, Check, X, MapPin, Navigation } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeRequestsAction, updateTargetLocationAction } from '../../redux/actions/requestActions';
import L from 'leaflet';

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Rejected'];

const MRRequestsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector((state) => state.request);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const fetchRequests = () => {
    dispatch(fetchMeRequestsAction());
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        req.name?.toLowerCase().includes(q) ||
        req.email?.toLowerCase().includes(q) ||
        req.phone?.includes(q) ||
        req.type?.toLowerCase().includes(q);
      const matchesTab =
        activeTab === 'All' ||
        req.status?.toUpperCase() === activeTab.toUpperCase();
      return matchesSearch && matchesTab;
    });
  }, [requests, searchQuery, activeTab]);

  const counts = useMemo(() => ({
    All: requests.length,
    Pending: requests.filter(r => r.status === 'PENDING').length,
    Approved: requests.filter(r => r.status === 'APPROVED').length,
    Rejected: requests.filter(r => r.status === 'REJECTED').length,
  }), [requests]);

  const [editingRequest, setEditingRequest] = useState(null);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  
  // GPS/Geolocation states
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState('');
  
  // Map states
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Submission/Local feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  // Refs for GPS
  const watchIdRef = useRef(null);
  const watchTimerRef = useRef(null);
  const bestAccRef = useRef(null);

  // Refs for Map
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const stopGpsWatch = () => {
    if (watchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = null;
    if (watchTimerRef.current) clearTimeout(watchTimerRef.current);
    watchTimerRef.current = null;
    setIsGpsLoading(false);
  };

  useEffect(() => {
    if (editingRequest) {
      setLatInput(editingRequest.latitude ? String(editingRequest.latitude) : '13.082680');
      setLngInput(editingRequest.longitude ? String(editingRequest.longitude) : '80.270720');
      setGpsError('');
      setGpsSuccessMsg('');
      setLocalError('');
      setLocalSuccess('');
      setIsMapOpen(false);
    } else {
      stopGpsWatch();
    }
    return () => stopGpsWatch();
  }, [editingRequest]);

  // Leaflet Map Initialization & Lifecycle
  useEffect(() => {
    if (isMapOpen && mapContainerRef.current && !mapRef.current) {
      const latVal = parseFloat(latInput) || 13.082680;
      const lngVal = parseFloat(lngInput) || 80.270720;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([latVal, lngVal], 16);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      map.on('moveend', () => {
        const center = map.getCenter();
        setLatInput(center.lat.toFixed(7));
        setLngInput(center.lng.toFixed(7));
      });

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isMapOpen, editingRequest]);

  // Sync manual input coordinates to Leaflet Map centering
  useEffect(() => {
    if (mapRef.current) {
      const latVal = parseFloat(latInput);
      const lngVal = parseFloat(lngInput);
      if (!isNaN(latVal) && !isNaN(lngVal)) {
        const center = mapRef.current.getCenter();
        if (Math.abs(center.lat - latVal) > 0.0001 || Math.abs(center.lng - lngVal) > 0.0001) {
          mapRef.current.setView([latVal, lngVal], 16);
        }
      }
    }
  }, [latInput, lngInput]);

  const handleDetectGPS = () => {
    setGpsError('');
    setGpsSuccessMsg('');
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    stopGpsWatch();
    setIsGpsLoading(true);

    // Stop watch after 8 seconds
    watchTimerRef.current = setTimeout(() => {
      stopGpsWatch();
      if (!latInput || !lngInput) {
        setGpsError('GPS request timed out. Please input manually.');
      }
    }, 8000);

    bestAccRef.current = null;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position?.coords?.latitude;
        const lon = position?.coords?.longitude;
        const acc = position?.coords?.accuracy;

        if (typeof lat !== 'number' || typeof lon !== 'number') return;

        const nextAcc = typeof acc === 'number' ? Math.round(acc) : null;
        const prevAcc = typeof bestAccRef.current === 'number' ? bestAccRef.current : null;
        const shouldReplace = prevAcc === null || (nextAcc !== null && nextAcc < prevAcc);

        if (shouldReplace) {
          if (nextAcc !== null) bestAccRef.current = nextAcc;
          const latStr = lat.toFixed(7);
          const lonStr = lon.toFixed(7);
          setLatInput(latStr);
          setLngInput(lonStr);
          setGpsSuccessMsg(`Detected (Accuracy: ${nextAcc ? nextAcc + 'm' : 'N/A'})`);
          if (mapRef.current) {
            mapRef.current.setView([lat, lon], 16);
          }
        }

        if (typeof acc === 'number' && acc <= 25) {
          stopGpsWatch();
        }
      },
      (error) => {
        console.error(error);
        const code = error?.code;
        if (code === 1) setGpsError('Location permission denied. Please allow access.');
        else if (code === 2) setGpsError('Location unavailable. Enable GPS.');
        else if (code === 3) setGpsError('GPS request timed out.');
        else setGpsError('GPS detection failed.');
        stopGpsWatch();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 12000,
      }
    );
  };

  const handleSaveLocation = async () => {
    if (!latInput || !lngInput) {
      setLocalError('Latitude and Longitude are required.');
      return;
    }
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng)) {
      setLocalError('Invalid coordinates format.');
      return;
    }

    setIsSubmitting(true);
    setLocalError('');
    setLocalSuccess('');
    try {
      const targetId = editingRequest.type === 'CHEMIST'
        ? (editingRequest.chemistId || editingRequest.id)
        : (editingRequest.doctorId || editingRequest.id);
      await dispatch(updateTargetLocationAction(editingRequest.type, targetId, lat, lng));
      setLocalSuccess('Location updated successfully!');
      setTimeout(() => {
        setEditingRequest(null);
        dispatch(fetchMeRequestsAction());
      }, 1500);
    } catch (err) {
      setLocalError(err.message || 'Failed to update location.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]';
      case 'REJECTED':
        return 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]';
      default: // PENDING
        return 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]';
    }
  };

  const handleRequestOnboarding = () => {
    navigate('/mr/onboard-doctor');
  };

  return (
    <div className="animate-[fadeSlideIn_0.35s_ease-out] flex flex-col h-[calc(100vh-104px)] min-h-0 overflow-hidden">
      {/* Error State */}
      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] px-[18px] py-3 rounded-xl flex items-center gap-2 text-[#B91C1C] text-[13px] font-semibold mb-5 shrink-0">
          <AlertCircle size={16} />
          {error}
          <button onClick={fetchRequests} className="ml-auto bg-transparent border-none text-[#B91C1C] font-bold underline cursor-pointer flex items-center gap-1">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex items-center gap-4 mb-5 flex-wrap shrink-0">
        <div className="relative flex-1 min-w-[220px] max-w-[340px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, type..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-[13px] outline-none bg-white focus:border-[#C8F04A] transition-colors duration-150 font-sans"
          />
        </div>
        <div className="flex bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-1 gap-0.5">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-bold transition-all duration-150 border-none cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-white shadow-sm text-[#111827]'
                  : 'bg-transparent text-[#9CA3AF] hover:text-[#374151]'
              }`}
            >
              {tab}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                activeTab === tab ? 'bg-[#F3F4F6] text-[#374151]' : 'bg-transparent text-[#D1D5DB]'
              }`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={fetchRequests}
            className="p-2 rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] hover:border-[#C8F04A] cursor-pointer transition-all duration-150 flex items-center gap-1.5 text-[12.5px] font-semibold"
            title="Refresh"
          >
            <RefreshCw size={14} /> 
          </button>
          <button
            onClick={handleRequestOnboarding}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-none bg-[#C8F04A] text-[#111827] font-extrabold text-[12.5px] cursor-pointer shadow-[0_4px_12px_rgba(200,240,74,0.25)] hover:opacity-90 transition-opacity duration-150 outline-none"
          >
            <Plus size={14} strokeWidth={2.5} /> Request Onboarding
          </button>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="bg-white rounded-[20px] border-[1.5px] border-[#F3F4F6] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 p-[60px] gap-3">
            <Loader2 size={24} className="animate-spin text-[#111827]" />
            <span className="text-[13.5px] text-[#9CA3AF]">Loading requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-[60px] text-center text-[#9CA3AF]">
            <FileText size={40} className="mx-auto mb-3 stroke-[1.5]" />
            <p className="m-0 text-[14px] font-medium">{searchQuery || activeTab !== 'All' ? 'No requests match your filters.' : 'No onboarding requests submitted yet.'}</p>
            <button
              onClick={handleRequestOnboarding}
              className="mt-3.5 bg-[#111827] text-white border-none px-4 py-2 rounded-lg font-bold text-[12.5px] cursor-pointer hover:bg-gray-800 transition-colors duration-150"
            >
              Request Onboarding
            </button>
          </div>
        ) : (
          <div className="overflow-auto flex-1 pr-1">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b-[1.5px] border-[#F3F4F6] sticky top-0 bg-white z-10">
                  {['S.No', 'Type', 'Name', 'Email', 'Phone', 'Address', 'Role Specific Details', 'Status', 'Review Remarks', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11.5px] font-extrabold text-[#9CA3AF] uppercase tracking-wider bg-white">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req, idx) => {
                  return (
                    <tr key={req.id || idx} className="border-b border-[#FAFAFA] hover:bg-gray-50/50 transition-colors duration-150">
                      {/* S.No */}
                      <td className="px-4 py-4 text-[13px] font-semibold text-[#6B7280]">
                        {idx + 1}
                      </td>
                      {/* Type */}
                      <td className="px-4 py-4 text-[13px] font-bold text-[#1F2937]">
                        {req.type === 'CHEMIST' ? 'Chemist / Pharmacist' : 'Doctor'}
                      </td>
                      {/* Name */}
                      <td className="px-4 py-4 text-[13px] font-bold text-[#1F2937]">
                        {req.name}
                      </td>
                      {/* Email */}
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {req.email || '—'}
                      </td>
                      {/* Phone */}
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        {req.phone || '—'}
                      </td>
                      {/* Address */}
                      <td className="px-4 py-4 text-[12.5px] text-[#6B7280] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={req.address}>
                        {req.address}
                      </td>
                      {/* Role Specific Details */}
                      <td className="px-4 py-4 text-[12.5px] text-[#4B5563]">
                        {req.type === 'CHEMIST' ? (
                          <div>
                            <span className="font-semibold">Contact Person:</span> {req.chemistContactPerson || '—'}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <div><span className="font-semibold">Speciality:</span> {req.doctorSpeciality || '—'}</div>
                            <div><span className="font-semibold">Qual:</span> {req.doctorQualification || '—'}</div>
                            <div><span className="font-semibold">License:</span> {req.doctorLicenseNumber || '—'}</div>
                          </div>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${getStatusBadgeClass(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      {/* Remarks */}
                      <td className="px-4 py-4 text-[12.5px] text-[#6B7280] italic max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap" title={req.remarks || ''}>
                        {req.remarks || '—'}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-4 text-[12.5px]">
                        {req.status === 'APPROVED' && (req.type === 'DOCTOR' || req.type === 'CHEMIST') ? (
                          <button
                            onClick={() => setEditingRequest(req)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white text-gray-700 hover:text-[#7C3AED] hover:border-[#7C3AED] font-bold text-[12px] cursor-pointer transition-all duration-155"
                          >
                            <MapPin size={13} className="text-[#7C3AED]" /> Edit Location
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-[0_24px_56px_rgba(0,0,0,0.25)] animate-[modalIn_0.25s_ease-out]">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] px-5.5 py-4.5 flex justify-between items-center text-white border-b border-[#F3F4F6]">
              <div>
                <div className="text-[10px] opacity-75 font-bold tracking-wider uppercase">Update {editingRequest.type === 'CHEMIST' ? 'Chemist' : 'Doctor'} Coordinates</div>
                <div className="text-[16px] font-extrabold">{editingRequest.name}</div>
              </div>
              <button 
                onClick={() => setEditingRequest(null)}
                className="bg-white/20 border-none text-white rounded-xl p-1.5 cursor-pointer hover:bg-white/30 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5.5 flex flex-col gap-4">
              {localSuccess && (
                <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-3 rounded-xl flex items-center gap-2 text-[#047857] text-[12.5px] font-semibold">
                  <CheckCircle2 size={14} />
                  {localSuccess}
                </div>
              )}
              {localError && (
                <div className="bg-[#FEF2F2] border border-[#FECACA] p-3 rounded-xl flex items-center gap-2 text-[#B91C1C] text-[12.5px] font-semibold">
                  <AlertCircle size={14} />
                  {localError}
                </div>
              )}

              {/* Coordinates inputs - always visible & manually typable */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500">Latitude <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. 13.082680"
                    value={latInput}
                    onChange={(e) => { setLatInput(e.target.value); setLocalError(''); }}
                    disabled={isSubmitting}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] outline-none font-sans bg-[#FAFAFA] focus:border-[#7C3AED] focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-550">Longitude <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. 80.270720"
                    value={lngInput}
                    onChange={(e) => { setLngInput(e.target.value); setLocalError(''); }}
                    disabled={isSubmitting}
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] outline-none font-sans bg-[#FAFAFA] focus:border-[#7C3AED] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* GPS and Map controls */}
              <div className="flex gap-2 items-center mt-1">
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isGpsLoading || isSubmitting}
                  className={`flex-1 border-0 px-3 py-2 rounded-xl text-[11.5px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isGpsLoading 
                      ? 'bg-gray-150 text-gray-400 cursor-not-allowed' 
                      : 'bg-[#10B981] text-white hover:bg-[#0e9f6e]'
                  }`}
                >
                  {isGpsLoading ? '🛰️ Live GPS running...' : '🛰️ Use Live GPS'}
                </button>
                {isGpsLoading && (
                  <button
                    type="button"
                    onClick={stopGpsWatch}
                    className="bg-[#EF4444] text-white border-0 px-3 py-2 rounded-xl text-[11.5px] font-bold cursor-pointer hover:bg-[#dc2626]"
                  >
                    🛑 Stop
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMapOpen(!isMapOpen)}
                  disabled={isSubmitting}
                  className="bg-white text-gray-700 border border-gray-200 px-3 py-2 rounded-xl text-[11.5px] font-bold cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-1 transition-all"
                >
                  {isMapOpen ? '🗺️ Hide Map' : '🗺️ Pin on Map'}
                </button>
              </div>

              {/* Leaflet Inline Map */}
              {isMapOpen && (
                <div className="h-[200px] w-full rounded-xl border border-gray-200 box-border mt-1.5 overflow-hidden relative shadow-inner">
                  <div className="w-full h-full" ref={mapContainerRef}></div>
                  {/* Floating target crosshair pin */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none flex flex-col items-center">
                    <div className="w-7 h-8">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21C16 16.8 19 12.8 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.8 8 16.8 12 21Z" fill="#7C3AED" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
                      </svg>
                    </div>
                    <div className="w-2 h-[2px] bg-black/20 blur-[1px] rounded-full mt-0.25 -translate-y-0.75"></div>
                  </div>
                </div>
              )}

              {/* GPS state feedback messages */}
              {(gpsSuccessMsg || gpsError) && (
                <div className="text-[11px] font-bold mt-1">
                  {gpsSuccessMsg && (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Check size={12} strokeWidth={3} /> {gpsSuccessMsg}
                    </span>
                  )}
                  {gpsError && (
                    <span className="text-rose-500 flex items-center gap-1">
                      <AlertCircle size={12} /> {gpsError}
                    </span>
                  )}
                </div>
              )}

              {/* Submit / Cancel Actions */}
              <div className="grid grid-cols-2 gap-3 mt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  disabled={isSubmitting}
                  className="py-2.5 rounded-xl border border-gray-200 bg-white text-gray-650 font-bold text-[13px] cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLocation}
                  disabled={isSubmitting || !latInput || !lngInput || isGpsLoading}
                  className="py-2.5 rounded-xl border-none bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] text-white font-extrabold text-[13px] cursor-pointer shadow-[0_4px_14px_rgba(124,58,237,0.35)] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? 'Saving...' : 'Save Location'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn    { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
};

export default MRRequestsPage;

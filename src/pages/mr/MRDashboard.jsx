import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// ─── Constants ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'mr_field_attendance_db';

const HEALTHCARE_TARGETS = [
  { id: '1', name: 'Dr. Ramesh Sharma',  type: 'Doctor',   specialty: 'Cardiology',       clinic: 'City Heart Clinic' },
  { id: '2', name: 'Dr. Sunita Patel',   type: 'Doctor',   specialty: 'Pediatrics',        clinic: 'Metro General Hospital' },
  { id: '3', name: 'Dr. Vivek Verma',    type: 'Doctor',   specialty: 'Orthopedics',       clinic: 'Verma Ortho Care' },
  { id: '4', name: 'Dr. Neha Gupta',     type: 'Doctor',   specialty: 'General Physician', clinic: 'Care Clinic' },
  { id: '5', name: 'Apollo Pharmacy',    type: 'Pharmacy', specialty: 'Chemist',           clinic: 'Indiranagar Branch' },
  { id: '6', name: 'Wellness Medicos',   type: 'Pharmacy', specialty: 'Chemist',           clinic: 'Malleshwaram Hub' },
  { id: '7', name: 'City Multi-Specialty Hospital', type: 'Hospital', specialty: 'Multi-Specialty', clinic: 'Jayanagar' },
  { id: '8', name: 'Dr. Arun Mehta',    type: 'Doctor',   specialty: 'Neurology',          clinic: 'NeuroHealth Centre' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayStr  = () => new Date().toISOString().split('T')[0];
const nowTime   = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
const uid       = () => Math.random().toString(36).slice(2, 9);

function readDb()      { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } }
function saveDb(arr)   { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

function secsToHMS(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function parseTimeToDate(timeStr) {
  if (!timeStr) return null;
  const today = new Date();
  const [time, meridiem] = timeStr.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (meridiem === 'PM' && h !== 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;
  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m, 0);
}

function typeIcon(type) {
  return `[${type.toUpperCase()}]`;
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  return (
    <div 
      className={`fixed bottom-7 right-7 z-[9999] text-white rounded-2xl px-5 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center gap-2.5 max-w-[380px] animate-[toastIn_0.3s_ease-out] ${
        type === 'error' ? 'bg-[#7F1D1D]' : 'bg-[#064E3B]'
      }`}
    >
      <span className="text-[20px]">{type === 'error' ? '⚠️' : '✅'}</span>
      <span className="text-[13px] font-semibold flex-1">{msg}</span>
      <button onClick={onClose} className="bg-white/15 border-none text-white rounded-lg px-2 py-0.5 cursor-pointer">✕</button>
    </div>
  );
}

// ─── Photo Capture Modal ───────────────────────────────────────────────────────
function PhotoCaptureModal({ title, onDone, onClose }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const [mode, setMode]       = useState('choose');
  const [streamObj, setStreamObj] = useState(null);
  const [preview, setPreview] = useState(null);

  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStreamObj(s);
      setMode('camera');
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 80);
    } catch {
      alert('Camera not available. Please upload a photo instead.');
    }
  };

  const stop = () => { streamObj?.getTracks().forEach(t => t.stop()); setStreamObj(null); };

  const snap = () => {
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    setPreview(c.toDataURL('image/jpeg', 0.82));
    stop(); setMode('preview');
  };

  const handleFile = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => { setPreview(ev.target.result); setMode('preview'); };
    r.readAsDataURL(f);
  };

  const handleClose = () => { stop(); onClose(); };

  return (
    <div className="fixed inset-0 bg-black/65 z-[1100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-[440px] max-h-[90vh] flex flex-col overflow-hidden shadow-[0_24px_56px_rgba(0,0,0,0.3)] animate-[modalIn_0.25s_ease-out]">
        <div className="bg-gradient-to-br from-blue-900 to-blue-500 px-5.5 py-4.5 flex justify-between items-center shrink-0">
          <span className="text-white font-extrabold text-[15px]">{title}</span>
          <button onClick={handleClose} className="bg-white/20 border-none text-white rounded-lg px-2.5 py-1 cursor-pointer text-[16px]">✕</button>
        </div>
        <div className="p-5.5 overflow-y-auto flex-1">
          {mode === 'choose' && (
            <div className="flex flex-col gap-2.5">
              <p className="m-0 mb-1.5 text-[13px] text-gray-500">How would you like to add a photo of this place?</p>
              <button onClick={openCamera} className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-blue-500 bg-blue-50 text-blue-800 font-bold text-[14px] cursor-pointer w-full">Open Camera</button>
              <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-bold text-[14px] cursor-pointer w-full text-center justify-center">
                Upload from Device
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </label>
              <button onClick={() => onDone(null)} className="flex items-center justify-center gap-2 p-3.5 rounded-xl border-none bg-gray-100 text-gray-500 font-bold text-[14px] cursor-pointer w-full">Skip Photo</button>
            </div>
          )}
          {mode === 'camera' && (
            <div>
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl bg-black block" />
              <canvas ref={canvasRef} className="hidden" />
              <button onClick={snap} className="mt-3 w-full p-3.5 rounded-xl border-none bg-blue-500 text-white font-extrabold text-[14px] cursor-pointer">Capture</button>
              <button onClick={() => { stop(); setMode('choose'); }} className="mt-2 w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-[13px] cursor-pointer">Back</button>
            </div>
          )}
          {mode === 'preview' && (
            <div>
              <img src={preview} alt="Captured" className="w-full rounded-xl max-h-[240px] object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2.5 mt-3">
                <button onClick={() => setMode('choose')} className="flex-1 p-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer">Retake</button>
                <button onClick={() => { onDone(preview); handleClose(); }} className="flex-[2] p-3 rounded-xl border-none bg-emerald-600 text-white font-bold text-[13px] cursor-pointer">Use Photo</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Visit Check-In Modal ─────────────────────────────────────────────────────
function VisitCheckInModal({ onSubmit, onClose, gpsLoading }) {
  const [search, setSearch]       = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState('Doctor');
  const [isCustom, setIsCustom]   = useState(false);
  const [notes, setNotes]         = useState('');
  const [photo, setPhoto]         = useState(null);
  const [showPhoto, setShowPhoto] = useState(false);

  const filtered = HEALTHCARE_TARGETS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase()) ||
    t.clinic.toLowerCase().includes(search.toLowerCase())
  );

  const selectedTarget = isCustom
    ? { id: uid(), name: customName, type: customType, specialty: customType, clinic: '' }
    : HEALTHCARE_TARGETS.find(t => t.id === selectedId);

  const canSubmit = isCustom ? customName.trim().length > 0 : !!selectedId;

  return (
    <div className="fixed inset-0 bg-black/55 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden shadow-[0_24px_56px_rgba(0,0,0,0.25)] animate-[modalIn_0.25s_ease-out]">

        {/* Header */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-500 px-5.5 py-4.5 flex justify-between items-center shrink-0">
          <div>
            <div className="text-white/70 text-[11px] font-bold tracking-wider">FIELD VISIT</div>
            <div className="text-white font-extrabold text-[16px]">Visit Check-In</div>
          </div>
          <button onClick={onClose} className="bg-white/20 border-none text-white rounded-xl px-3 py-1.5 cursor-pointer text-[15px]">✕</button>
        </div>

        <div className="p-5.5 flex flex-col gap-4 overflow-y-auto flex-1">

          {/* Location + Time Strip */}
          <div className="bg-[#F0FDF4] rounded-xl px-3.5 py-3 flex gap-4 text-[12px] font-bold text-[#065F46]">
            <span>GPS Location Verified</span>
            <span>Time: {new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })}</span>
            {gpsLoading && <span className="text-blue-500">Getting location...</span>}
          </div>

          {/* Search / Select Target */}
          {!isCustom ? (
            <div>
              <label className="block text-[12px] font-bold text-gray-755 mb-1.5">Search Doctor / Hospital / Pharmacy</label>
              <input
                type="text" value={search} onChange={e => { setSearch(e.target.value); setSelectedId(''); }}
                placeholder="Type to search..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-sans text-gray-800 outline-none box-border mb-2"
                autoFocus
              />
              <div className="max-h-[180px] overflow-y-auto flex flex-col gap-1.5 border border-gray-105 rounded-xl p-2">
                {filtered.map(t => (
                  <div key={t.id} onClick={() => { setSelectedId(t.id); setSearch(t.name); }}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 border ${
                      selectedId === t.id ? 'bg-[#EFF6FF] border-[#3B82F6]' : 'bg-[#FAFAFA] border-transparent'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 uppercase">{t.type.toUpperCase()}</span>
                        <span className="text-[13px] font-bold text-gray-800">{t.name}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{t.clinic} · {t.specialty}</div>
                    </div>
                    {selectedId === t.id && <span className="text-blue-500 text-[16px]">✓</span>}
                  </div>
                ))}
                <button onClick={() => setIsCustom(true)} className="p-2 rounded-lg border border-dashed border-gray-300 bg-[#F9FAFB] text-gray-500 font-semibold text-[12px] cursor-pointer text-center">
                  + Custom Visit Target
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-2xl p-3.5 flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-[13px] text-gray-800">Custom Visit Target</span>
                <button onClick={() => setIsCustom(false)} className="bg-transparent border-none text-blue-500 text-[12px] cursor-pointer font-semibold">Back to list</button>
              </div>
              <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Doctor / Hospital / Pharmacy name..." className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-sans text-gray-800 outline-none box-border" autoFocus />
              <select value={customType} onChange={e => setCustomType(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-sans text-gray-800 outline-none box-border">
                {['Doctor','Hospital','Pharmacy','Clinic','Lab'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[12px] font-bold text-gray-755 mb-1.5">Visit Purpose / Notes <span className="text-gray-400 font-medium">(optional)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Discuss Cardace 5mg samples, follow-up on last prescription..."
              rows={2} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-sans text-gray-800 outline-none box-border resize-y" />
          </div>

          {/* Photo */}
          <div>
            <label className="block text-[12px] font-bold text-gray-755 mb-1.5">Place / Clinic Photo <span className="text-gray-400 font-medium">(optional)</span></label>
            {photo ? (
              <div className="relative">
                <img src={photo} alt="Place" className="w-full h-[110px] object-cover rounded-xl" />
                <button onClick={() => setPhoto(null)} className="absolute top-1.5 right-1.5 bg-red-500 border-none text-white rounded-full w-6.5 h-6.5 cursor-pointer font-bold">✕</button>
              </div>
            ) : (
              <button onClick={() => setShowPhoto(true)} className="w-full p-3 rounded-xl border border-dashed border-gray-300 bg-[#F8FAFC] text-gray-500 font-semibold text-[13px] cursor-pointer flex items-center justify-center gap-2">
                Capture / Upload Photo
              </button>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={() => onSubmit({ target: selectedTarget, notes, photo })}
            disabled={!canSubmit || gpsLoading}
            className={`w-full p-3.5 rounded-2xl border-none text-[15px] font-extrabold transition-all duration-200 ${
              (!canSubmit || gpsLoading) 
                ? 'bg-gray-300 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-br from-blue-900 to-blue-500 text-white cursor-pointer shadow-[0_4px_16px_rgba(59,130,246,0.35)]'
            }`}
          >
            {gpsLoading ? 'Getting Location...' : 'Confirm Check-In'}
          </button>
        </div>
      </div>

      {showPhoto && (
        <PhotoCaptureModal
          title="Clinic / Place Photo"
          onDone={img => { setPhoto(img); setShowPhoto(false); }}
          onClose={() => setShowPhoto(false)}
        />
      )}
    </div>
  );
}

// ─── Visit Check-Out Modal ─────────────────────────────────────────────────────
function VisitCheckOutModal({ visit, onSubmit, onClose, gpsLoading }) {
  const [products,  setProducts]  = useState('');
  const [samples,   setSamples]   = useState('');
  const [feedback,  setFeedback]  = useState('');

  return (
    <div className="fixed inset-0 bg-black/55 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-[480px] max-h-[90vh] flex flex-col overflow-hidden shadow-[0_24px_56px_rgba(0,0,0,0.25)] animate-[modalIn_0.25s_ease-out]">
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-600 px-5.5 py-4.5 flex justify-between items-center shrink-0">
          <div>
            <div className="text-white/70 text-[11px] font-bold">VISIT COMPLETE</div>
            <div className="text-white font-extrabold text-[16px]">Check-Out</div>
          </div>
          <button onClick={onClose} className="bg-white/20 border-none text-white rounded-xl px-3 py-1.5 cursor-pointer text-[15px]">✕</button>
        </div>
        <div className="p-5.5 flex flex-col gap-3.5 overflow-y-auto flex-1">
          {/* Visit Summary */}
          <div className="bg-[#F0FDF4] rounded-xl p-3.5 flex flex-col gap-1">
            <div className="text-[10px] font-extrabold text-[#047857] tracking-wider uppercase">{visit.type.toUpperCase()}</div>
            <div>
              <div className="font-extrabold text-[14px] text-gray-900">{visit.name}</div>
              <div className="text-[12px] text-gray-500">{visit.clinic} · Checked-in at <strong>{visit.checkInTime}</strong></div>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-755 mb-1.5">Products / Medicines Promoted</label>
            <input type="text" value={products} onChange={e => setProducts(e.target.value)}
              placeholder="e.g. Cardace 5mg, Lipvas 10mg" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-sans text-gray-800 outline-none box-border" autoFocus />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-gray-755 mb-1.5">Samples Distributed</label>
            <input type="text" value={samples} onChange={e => setSamples(e.target.value)}
              placeholder="e.g. Cardace (10 tabs), Visual Aid" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-sans text-gray-800 outline-none box-border" />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-gray-755 mb-1.5">Doctor Feedback / Call Summary</label>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
              placeholder="Doctor's response, prescription intent, follow-up needed…"
              rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-sans text-gray-800 outline-none box-border resize-y" />
          </div>

          <button onClick={() => onSubmit({ products, samples, feedback })}
            disabled={gpsLoading}
            className={`w-full p-3.5 rounded-2xl border-none text-white font-extrabold text-[14px] transition-all ${
              gpsLoading ? 'bg-gray-350 cursor-not-allowed shadow-none' : 'bg-emerald-600 cursor-pointer shadow-[0_4px_16px_rgba(5,150,105,0.3)]'
            }`}
          >
            {gpsLoading ? 'Getting Location...' : 'Confirm Check-Out'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Progress Circle Helper ────────────────────────────────────────────────────
function ProgressCircle({ pct, color, label, val }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const strokePct = ((100 - pct) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-20 h-20 -rotate-90">
          <circle cx="40" cy="40" r={r} fill="transparent" stroke="#F1F5F9" strokeWidth="6" />
          <circle cx="40" cy="40" r={r} fill="transparent" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={strokePct} strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-[350ms]" />
        </svg>
        <div className="absolute text-[13px] font-extrabold text-[#1E293B]">{val}</div>
      </div>
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">{label}</div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function MRDashboard() {
  const { user }  = useSelector(s => s.auth);
  const navigate  = useNavigate();
  const mrId      = user?.id ? String(user.id) : 'mr-01';
  const mrName    = user?.fullName || user?.name || 'Akash Kumar';

  // ── State ──────────────────────────────────────────────────────────────────
  const [db,          setDb]          = useState([]);
  const [activeDay,   setActiveDay]   = useState(null);
  const [activeVisit, setActiveVisit] = useState(null);
  const [toast,       setToast]       = useState(null);
  const [gpsLoading,  setGpsLoading]  = useState(false);

  // timer
  const [elapsed, setElapsed] = useState(0); // seconds since day start
  const timerRef = useRef(null);

  // modals
  const [modal, setModal] = useState(null); // null | 'visitIn' | 'visitOut'

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => { load(); }, []);

  const load = () => {
    const data = readDb();
    let rec = data.find(r => r.mrId === mrId && r.date === todayStr());
    
    // For testing: automatically make status "ACTIVE" (checked in) on refresh if not already active
    if (!rec || rec.status !== 'ACTIVE') {
      rec = {
        id: `${mrId}-${todayStr()}`,
        mrId,
        mrName,
        date: todayStr(),
        status: 'ACTIVE',
        startTime: rec?.startTime || '09:00 AM',
        startLocation: rec?.startLocation || { lat: 12.9716, lng: 77.5946, name: 'Office Check-in (Auto)' },
        endTime: null,
        endLocation: null,
        visits: rec?.visits || [],
      };
      const updated = [...data.filter(r => !(r.mrId === mrId && r.date === todayStr())), rec];
      saveDb(updated);
      setDb(updated);
    } else {
      setDb(data);
    }

    setActiveDay(rec);
    const av = rec.visits?.find(v => v.status === 'ACTIVE');
    setActiveVisit(av || null);
  };

  // ── Live Timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    clearInterval(timerRef.current);
    if (activeDay && activeDay.status === 'ACTIVE') {
      const start = parseTimeToDate(activeDay.startTime);
      const tick = () => {
        if (start) setElapsed(Math.floor((Date.now() - start.getTime()) / 1000));
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [activeDay]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getGps = () => new Promise(res => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      p  => { setGpsLoading(false); res({ lat: p.coords.latitude,  lng: p.coords.longitude }); },
      () => { setGpsLoading(false); res({ lat: 12.9716 + (Math.random() - 0.5) * 0.01, lng: 77.5946 + (Math.random() - 0.5) * 0.01 }); },
      { timeout: 8000 }
    );
  });

  const persist = (updatedDb) => { saveDb(updatedDb); setDb(updatedDb); };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleStartDay = async () => {
    const coords = await getGps();
    const data   = readDb();
    const rec    = {
      id: `${mrId}-${todayStr()}`,
      mrId, mrName, date: todayStr(), status: 'ACTIVE',
      startTime: nowTime(), startLocation: { ...coords, name: 'GPS Location' },
      endTime: null, endLocation: null, visits: [],
    };
    const updated = [...data.filter(r => !(r.mrId === mrId && r.date === todayStr())), rec];
    persist(updated);
    setActiveDay(rec);
    showToast(`Day started at ${rec.startTime} ✅`);
  };

  const handleEndDay = async () => {
    if (!window.confirm('End your workday? No more check-ins will be possible today.')) return;
    const coords  = await getGps();
    const data    = readDb();
    const updated = data.map(r =>
      r.mrId === mrId && r.date === todayStr()
        ? { ...r, status: 'ENDED', endTime: nowTime(), endLocation: { ...coords, name: 'GPS Location' } }
        : r
    );
    persist(updated);
    const rec = updated.find(r => r.mrId === mrId && r.date === todayStr());
    setActiveDay(rec);
    showToast('Day ended successfully 🏁');
  };

  const handleVisitCheckIn = async ({ target, notes, photo }) => {
    const coords = await getGps();
    const visit  = {
      id: uid(), name: target.name, type: target.type,
      specialty: target.specialty, clinic: target.clinic,
      checkInTime: nowTime(), checkInCoords: coords,
      checkInPhoto: photo, checkInNotes: notes,
      status: 'ACTIVE', checkOutTime: null, checkOutCoords: null,
      products: '', samples: '', feedback: '',
    };
    const data    = readDb();
    const updated = data.map(r =>
      r.mrId === mrId && r.date === todayStr()
        ? { ...r, visits: [...(r.visits || []), visit] }
        : r
    );
    persist(updated);
    const rec = updated.find(r => r.mrId === mrId && r.date === todayStr());
    setActiveDay(rec);
    setActiveVisit(visit);
    setModal(null);
    showToast(`Checked in at ${target.name} ✅`);
  };

  const handleVisitCheckOut = async ({ products, samples, feedback }) => {
    const coords  = await getGps();
    const data    = readDb();
    const updated = data.map(r => {
      if (r.mrId !== mrId || r.date !== todayStr()) return r;
      return {
        ...r,
        visits: r.visits.map(v =>
          v.id === activeVisit.id
            ? { ...v, status: 'COMPLETED', checkOutTime: nowTime(), checkOutCoords: coords, products, samples, feedback }
            : v
        )
      };
    });
    persist(updated);
    const rec = updated.find(r => r.mrId === mrId && r.date === todayStr());
    setActiveDay(rec);
    setActiveVisit(null);
    setModal(null);
    showToast(`Checked out from ${activeVisit.name} ✅`);
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const ds            = !activeDay ? 'NOT_STARTED' : activeDay.status; // 'NOT_STARTED'|'ACTIVE'|'ENDED'
  const todayVisits   = activeDay?.visits || [];
  const doneVisits    = todayVisits.filter(v => v.status === 'COMPLETED');
  const allCompleted  = db.filter(r => r.mrId === mrId).flatMap(r => r.visits?.filter(v => v.status === 'COMPLETED') || []);
  const daysWorked    = db.filter(r => r.mrId === mrId && r.status !== 'NOT_STARTED').length;

  // Filter planned upcoming calls from HEALTHCARE_TARGETS that have not been visited today
  const upcomingCalls = HEALTHCARE_TARGETS.filter(target => 
    !todayVisits.some(v => v.name === target.name)
  );
  const mockTimes = ['10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'];

  const stats = [
    { label:'Visits Today',    val: `${doneVisits.length}`, sub: activeVisit ? '1 in progress' : 'completed calls',         col:'#3B82F6' },
    { label:'Total This Week', val: String(allCompleted.length), sub: `${daysWorked} working days`,                         col:'#06B6D4' },
    { label:'Active Visit',    val: activeVisit ? activeVisit.name.split(' ').slice(0,2).join(' ') : 'None', sub: activeVisit ? `Since ${activeVisit.checkInTime}` : 'No active visit', col:'#F59E0B' },
    { label:'Hrs Worked',      val: ds === 'ACTIVE' ? secsToHMS(elapsed).slice(0,5) : ds === 'ENDED' ? (activeDay?.endTime || '—') : '—', sub: ds === 'ACTIVE' ? 'running now' : ds === 'ENDED' ? 'ended' : 'not started', col:'#10B981' },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="animate-[fadeIn_0.35s_ease-out] p-2.5">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Welcome Banner ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-500 rounded-3xl px-7.5 py-6.5 text-white mb-5.5 shadow-[0_10px_30px_rgba(59,130,246,0.18)] relative overflow-hidden">
        <div className="relative z-10">
          <span className="bg-white/18 px-3 py-1 rounded-2xl text-[11px] font-bold tracking-wider">
            MEDICAL REPRESENTATIVE PORTAL
          </span>
          <h2 className="text-[26px] font-extrabold my-3 mb-1 tracking-[-0.5px]">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {mrName.split(' ')[0]}!
          </h2>
          <p className="m-0 text-[13px] text-white/80">
            {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Stats Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5 mb-5.5">
        {stats.map((s, i) => (
          <div 
            key={i} 
            className="bg-white border border-gray-200 rounded-2xl px-5 py-4.5 flex flex-col gap-1.5 shadow-[0_2px_6px_rgba(0,0,0,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.07)]"
          >
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</div>
            <div className="text-[24px] font-extrabold text-gray-800 leading-none">{s.val}</div>
            <div className="text-[11px] font-semibold" style={{ color: s.col }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Operations & Performance Progress Row ──────────────────────── */}
      <div className="grid grid-cols-3 gap-5 mb-5.5 items-stretch">
        
        {/* Left Card: Operations Control */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex flex-col">
          {/* Header */}
          <div className="bg-slate-50 border-b border-gray-200 px-5 py-3.5 flex justify-between items-center shrink-0">
            <span className="font-extrabold text-[13px] text-gray-700 tracking-wide">Operations Control</span>
            <span className={`text-[11px] font-bold px-3 py-1 rounded-2xl ${ds === 'ACTIVE' ? 'bg-[#DCFCE7] text-[#15803D]' : ds === 'ENDED' ? 'bg-[#DBEAFE] text-[#1D4ED8]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
              {ds === 'ACTIVE' ? 'Active' : ds === 'ENDED' ? 'Day Ended' : 'Off Duty'}
            </span>
          </div>

          <div className="p-6 flex flex-col items-center gap-5 justify-center flex-1">
            
            {/* Live Timer Clock */}
            <div className="text-center">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                {ds === 'ACTIVE' ? 'Time Elapsed' : ds === 'ENDED' ? 'Workday Duration' : 'Timer Ready'}
              </div>
              <div className={`font-mono text-[38px] font-extrabold tracking-[2px] leading-none ${
                ds === 'ACTIVE' ? 'text-gray-800' : 'text-gray-400'
              }`}>
                {ds === 'ACTIVE' ? secsToHMS(elapsed) : ds === 'ENDED' ? activeDay?.endTime : '00:00:00'}
              </div>
              {ds === 'ACTIVE' && (
                <div className="text-[11px] text-gray-500 mt-1.5">Started at {activeDay?.startTime}</div>
              )}
            </div>

            {/* Action Buttons Grid - Exactly Two Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full">
              
              {/* Button 1: Workday Attendance Control (Check In / Check Out) */}
              {ds === 'NOT_STARTED' || ds === 'ENDED' ? (
                <Btn 
                  onClick={handleStartDay} 
                  disabled={gpsLoading} 
                  bg="linear-gradient(135deg,#10B981,#059669)" 
                  shadow="rgba(16,185,129,0.25)" 
                  label="Check In" 
                />
              ) : (
                <Btn 
                  onClick={handleEndDay} 
                  disabled={gpsLoading || !!activeVisit} 
                  bg="linear-gradient(135deg,#EF4444,#DC2626)" 
                  shadow="rgba(239,68,68,0.25)" 
                  label="Check Out"
                  title={activeVisit ? 'Check out of your current visit first' : ''}
                />
              )}

              {/* Button 2: Visit Control (Visit In / Visit Out) */}
              {!activeVisit ? (
                <Btn 
                  onClick={() => setModal('visitIn')} 
                  disabled={ds !== 'ACTIVE'} 
                  bg="linear-gradient(135deg,#3B82F6,#2563EB)" 
                  shadow="rgba(59,130,246,0.25)" 
                  label="Visit In" 
                />
              ) : (
                <Btn 
                  onClick={() => setModal('visitOut')} 
                  disabled={ds !== 'ACTIVE'} 
                  bg="linear-gradient(135deg,#F97316,#EA580C)" 
                  shadow="rgba(249,115,22,0.25)" 
                  label="Visit Out" 
                  pulse 
                />
              )}

            </div>

            {/* Active Visit Mini-Status */}
            {activeVisit && (
              <div className="w-full bg-[#FFF7ED] border border-[#FFEDD5] rounded-xl px-3.5 py-2.5 text-[12px] text-[#C2410C] text-center font-semibold">
                Active visit: {activeVisit.name} (since {activeVisit.checkInTime})
              </div>
            )}

          </div>
        </div>

        {/* Middle Card: Performance Progress circles (Rounded Balls) */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex flex-col">
          {/* Header */}
          <div className="bg-slate-50 border-b border-gray-200 px-5 py-3.5 flex justify-between items-center shrink-0">
            <span className="font-extrabold text-[13px] text-gray-700 tracking-wide">Performance & Attendance</span>
            <span className="text-[11px] font-bold text-emerald-600">Live Progress</span>
          </div>
          <div className="p-6 flex justify-around items-center flex-1 gap-3">
            <ProgressCircle 
              pct={Math.min(100, Math.round((daysWorked / 20) * 100))} 
              color="#3B82F6" 
              label="Present Days" 
              val={`${daysWorked}/20`} 
            />
            <ProgressCircle 
              pct={Math.min(100, Math.round((doneVisits.length / 5) * 100))} 
              color="#10B981" 
              label="Visit Target" 
              val={`${doneVisits.length}/5`} 
            />
          </div>
        </div>

        {/* Right Card: Today's Summary */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="text-[11px] font-extrabold text-white/60 tracking-wider uppercase mb-3.5">Today's Summary</div>
            <div className="flex flex-col gap-2.5">
              {[
                ['Start Time',    activeDay?.startTime || '—'],
                ['End Time',      activeDay?.endTime   || (ds === 'ACTIVE' ? 'Ongoing' : '—')],
                ['Visits Done',   `${doneVisits.length} / ${todayVisits.length}`],
                ['Active Now',    activeVisit ? activeVisit.name.split(' ').slice(0,2).join(' ') : 'None'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-[12.5px] border-b border-white/8 pb-1.5">
                  <span className="text-white/60">{k}</span>
                  <span className="font-bold">{v}</span>
                </div>
              ))}
            </div>
          </div>
          {ds === 'ACTIVE' && (
            <div className="text-[12px] text-center text-sky-400 font-bold pt-2.5 border-t border-white/10">
              Work duration: {secsToHMS(elapsed)}
            </div>
          )}
        </div>

      </div>

      {/* ── Main Content (Next Planned Calls on left, Quick Links & Holidays on right) ── */}
      <div className="grid grid-cols-[2fr_1fr] gap-5 mb-5.5 items-stretch h-[320px]">

        {/* Left Column: Next Planned Calls */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col h-full">
          <div className="flex justify-between items-center mb-4.5 border-b border-gray-100 pb-3 shrink-0">
            <div>
              <h3 className="m-0 text-[16px] font-extrabold text-gray-800">Next Planned Calls</h3>
              <p className="m-0 text-[12px] text-gray-400">Scheduled doctor and pharmacy visits remaining for today</p>
            </div>
            <button onClick={() => navigate('/mr/attendance')} className="bg-blue-50 border-none text-blue-700 font-bold text-[12px] px-3.5 py-1.5 rounded-full cursor-pointer whitespace-nowrap">
              Attendance Ledger
            </button>
          </div>

          {upcomingCalls.length === 0 ? (
            <div className="text-center p-10 px-5 text-emerald-600 bg-[#ECFDF5] rounded-xl border border-[#A7F3D0] flex-1 flex flex-col justify-center">
              <span className="text-[24px]">🎉</span>
              <div className="font-extrabold text-[14.5px] mt-1.5">All Planned Calls Completed!</div>
              <div className="text-[12px] text-[#047857] mt-1">You have visited all scheduled doctor and chemist sites for today. Good work!</div>
            </div>
          ) : (
            <div className="upcoming-calls-container flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {upcomingCalls.map((target, idx) => {
                const targetTime = mockTimes[idx % mockTimes.length];
                return (
                  <div 
                    key={target.id} 
                    className="flex gap-4 px-4.5 py-3.5 rounded-2xl items-center bg-[#FAFAFA] border border-gray-100 transition-all duration-200 hover:bg-[#F0FDF4] hover:border-[#BBF7D0]"
                  >
                    {/* Time indicator */}
                    <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-800 rounded-lg w-[70px] h-[52px] shrink-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider">Plan</span>
                      <span className="text-[11.5px] font-extrabold">{targetTime}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 uppercase">
                          {target.type}
                        </span>
                        <span className="text-[13px] font-extrabold text-gray-800">{target.name}</span>
                      </div>
                      <div className="text-[11.5px] text-gray-500 mt-0.5">
                        {target.clinic} · <span className="text-blue-500 font-semibold">{target.specialty}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Links & Holidays */}
        <div className="flex flex-col gap-3 h-full">
          
          {/* Quick Links */}
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] shrink-0">
            <h3 className="m-0 mb-2.5 text-[13.5px] font-extrabold text-gray-800">Quick Links</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label:'View Attendance', fn: () => navigate('/mr/attendance') },
                { label:'Submit Allowance',    fn: () => {} },
                { label:'Sample Inventory',          fn: () => {} },
                { label:'Target Doctors',         fn: () => {} },
              ].map((b, i) => (
                <button 
                  key={i} 
                  onClick={b.fn} 
                  className="px-2.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-[11.5px] cursor-pointer text-center transition-colors duration-150 hover:bg-gray-50 whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Holidays */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col flex-1 min-h-0">
            <div className="bg-slate-50 border-b border-gray-100 px-5 py-2.5 flex justify-between items-center shrink-0">
              <span className="font-extrabold text-[13px] text-gray-700 tracking-wide">Upcoming Holidays</span>
              <span className="text-[11px] font-bold text-blue-500">2026</span>
            </div>
            <div className="px-5 py-4 flex flex-col gap-2.5 overflow-y-auto">
              {[
                { date: 'June 29', name: 'Bakrid / Eid al-Adha', type: 'Regional' },
                { date: 'August 15', name: 'Independence Day', type: 'National' },
                { date: 'October 02', name: 'Gandhi Jayanti', type: 'National' },
              ].map((h, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between ${idx === 2 ? 'pb-0 border-none' : 'pb-2 border-b border-gray-100'}`}
                >
                  <div>
                    <div className="text-[12.5px] font-bold text-gray-800">{h.name}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{h.date}</div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${h.type === 'National' ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-[#F0FDF4] text-[#10B981]'}`}>{h.type}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>


      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {modal === 'visitIn' && (
        <VisitCheckInModal
          gpsLoading={gpsLoading}
          onSubmit={handleVisitCheckIn}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'visitOut' && activeVisit && (
        <VisitCheckOutModal
          visit={activeVisit}
          gpsLoading={gpsLoading}
          onSubmit={handleVisitCheckOut}
          onClose={() => setModal(null)}
        />
      )}

      <style>{`
        @keyframes fadeIn    { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes modalIn   { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes toastIn   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse     { 0%,100% { box-shadow:0 4px 14px rgba(124,58,237,0.25); } 50% { box-shadow:0 4px 28px rgba(124,58,237,0.55); } }
        @keyframes btnPulse  { 0%,100% { box-shadow:0 4px 14px rgba(249,115,22,0.3); } 50% { box-shadow:0 4px 28px rgba(249,115,22,0.6); } }
      `}</style>
    </div>
  );
}

// ─── Reusable Button ───────────────────────────────────────────────────────────
function Btn({ label, onClick, disabled, bg, shadow, pulse, title }) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      title={title}
      className={`px-5.5 py-3 rounded-2xl border-none font-extrabold text-[14px] transition-all duration-200 flex items-center gap-2 justify-center whitespace-nowrap ${
        disabled 
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
          : 'text-white cursor-pointer'
      } ${pulse && !disabled ? 'animate-[btnPulse_2s_infinite]' : ''}`}
      style={{ 
        background: disabled ? undefined : bg, 
        boxShadow: disabled ? 'none' : `0 4px 14px ${shadow}` 
      }}
    >
      {label}
    </button>
  );
}

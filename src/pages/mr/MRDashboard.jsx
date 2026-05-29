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
    <div style={{
      position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
      background: type === 'error' ? '#7F1D1D' : '#064E3B',
      color: '#fff', borderRadius: '14px', padding: '14px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      display: 'flex', alignItems: 'center', gap: '10px',
      maxWidth: '380px', animation: 'toastIn 0.3s ease-out',
    }}>
      <span style={{ fontSize: '20px' }}>{type === 'error' ? '⚠️' : '✅'}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '8px', padding: '2px 8px', cursor: 'pointer' }}>✕</button>
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
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:1100, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div style={{ background:'#fff', borderRadius:'20px', width:'100%', maxWidth:'440px', maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 56px rgba(0,0,0,0.3)', animation:'modalIn 0.25s ease-out' }}>
        <div style={{ background:'linear-gradient(135deg,#1E3A8A,#3B82F6)', padding:'18px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <span style={{ color:'#fff', fontWeight:800, fontSize:'15px' }}>{title}</span>
          <button onClick={handleClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', borderRadius:'8px', padding:'4px 10px', cursor:'pointer', fontSize:'16px' }}>✕</button>
        </div>
        <div style={{ padding:'22px', overflowY:'auto', flex:1 }}>
          {mode === 'choose' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <p style={{ margin:'0 0 6px', fontSize:'13px', color:'#6B7280' }}>How would you like to add a photo of this place?</p>
              <button onClick={openCamera} style={photoBtnStyle('#1D4ED8','#EFF6FF','1.5px solid #3B82F6')}>Open Camera</button>
              <label style={photoBtnStyle('#374151','#F9FAFB','1.5px solid #E5E7EB')}>
                Upload from Device
                <input type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />
              </label>
              <button onClick={() => onDone(null)} style={photoBtnStyle('#6B7280','#F3F4F6','none')}>Skip Photo</button>
            </div>
          )}
          {mode === 'camera' && (
            <div>
              <video ref={videoRef} autoPlay playsInline style={{ width:'100%', borderRadius:'12px', background:'#000', display:'block' }} />
              <canvas ref={canvasRef} style={{ display:'none' }} />
              <button onClick={snap} style={{ marginTop:'12px', width:'100%', padding:'13px', borderRadius:'12px', border:'none', background:'#3B82F6', color:'#fff', fontWeight:800, fontSize:'14px', cursor:'pointer' }}>Capture</button>
              <button onClick={() => { stop(); setMode('choose'); }} style={{ marginTop:'8px', width:'100%', padding:'10px', borderRadius:'12px', border:'1.5px solid #E5E7EB', background:'#fff', color:'#374151', fontWeight:600, fontSize:'13px', cursor:'pointer' }}>Back</button>
            </div>
          )}
          {mode === 'preview' && (
            <div>
              <img src={preview} alt="Captured" style={{ width:'100%', borderRadius:'12px', maxHeight:'240px', objectFit:'cover' }} />
              <canvas ref={canvasRef} style={{ display:'none' }} />
              <div style={{ display:'flex', gap:'10px', marginTop:'12px' }}>
                <button onClick={() => setMode('choose')} style={{ flex:1, padding:'11px', borderRadius:'12px', border:'1.5px solid #E5E7EB', background:'#fff', color:'#374151', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>Retake</button>
                <button onClick={() => { onDone(preview); handleClose(); }} style={{ flex:2, padding:'11px', borderRadius:'12px', border:'none', background:'#059669', color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>Use Photo</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
const photoBtnStyle = (color, bg, border) => ({
  display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
  padding:'13px', borderRadius:'12px', border, background:bg, color, fontWeight:700,
  fontSize:'14px', cursor:'pointer', width:'100%',
});

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
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div style={{ background:'#fff', borderRadius:'22px', width:'100%', maxWidth:'500px', maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 56px rgba(0,0,0,0.25)', animation:'modalIn 0.25s ease-out' }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#1E3A8A,#3B82F6)', padding:'18px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'11px', fontWeight:700, letterSpacing:'1px' }}>FIELD VISIT</div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:'16px' }}>Visit Check-In</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', borderRadius:'10px', padding:'6px 12px', cursor:'pointer', fontSize:'15px' }}>✕</button>
        </div>

        <div style={{ padding:'22px', display:'flex', flexDirection:'column', gap:'16px', overflowY:'auto', flex:1 }}>

          {/* Location + Time Strip */}
          <div style={{ background:'#F0FDF4', borderRadius:'12px', padding:'12px 14px', display:'flex', gap:'16px', fontSize:'12px', fontWeight:700, color:'#065F46' }}>
            <span>GPS Location Verified</span>
            <span>Time: {new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })}</span>
            {gpsLoading && <span style={{ color:'#3B82F6' }}>Getting location...</span>}
          </div>

          {/* Search / Select Target */}
          {!isCustom ? (
            <div>
              <label style={lblStyle}>Search Doctor / Hospital / Pharmacy</label>
              <input
                type="text" value={search} onChange={e => { setSearch(e.target.value); setSelectedId(''); }}
                placeholder="Type to search..."
                style={{ ...inpStyle, marginBottom:'8px' }}
                autoFocus
              />
              <div style={{ maxHeight:'180px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'5px', border:'1.5px solid #F3F4F6', borderRadius:'12px', padding:'8px' }}>
                {filtered.map(t => (
                  <div key={t.id} onClick={() => { setSelectedId(t.id); setSearch(t.name); }}
                    style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'9px', cursor:'pointer',
                      background: selectedId === t.id ? '#EFF6FF' : '#FAFAFA',
                      border: `1.5px solid ${selectedId === t.id ? '#3B82F6' : 'transparent'}`,
                      transition:'all 0.15s' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <span style={{ fontSize:'10px', fontWeight:800, padding:'2px 6px', borderRadius:'4px', background:'#E5E7EB', color:'#374151' }}>{t.type.toUpperCase()}</span>
                        <span style={{ fontSize:'13px', fontWeight:700, color:'#1F2937' }}>{t.name}</span>
                      </div>
                      <div style={{ fontSize:'11px', color:'#9CA3AF', marginTop:'2px' }}>{t.clinic} · {t.specialty}</div>
                    </div>
                    {selectedId === t.id && <span style={{ color:'#3B82F6', fontSize:'16px' }}>✓</span>}
                  </div>
                ))}
                <button onClick={() => setIsCustom(true)} style={{ padding:'9px', borderRadius:'8px', border:'1.5px dashed #D1D5DB', background:'#F9FAFB', color:'#6B7280', fontWeight:600, fontSize:'12px', cursor:'pointer', textAlign:'center' }}>
                  + Custom Visit Target
                </button>
              </div>
            </div>
          ) : (
            <div style={{ border:'1.5px solid #E5E7EB', borderRadius:'14px', padding:'14px', display:'flex', flexDirection:'column', gap:'10px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontWeight:800, fontSize:'13px', color:'#1F2937' }}>Custom Visit Target</span>
                <button onClick={() => setIsCustom(false)} style={{ background:'none', border:'none', color:'#3B82F6', fontSize:'12px', cursor:'pointer', fontWeight:600 }}>Back to list</button>
              </div>
              <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Doctor / Hospital / Pharmacy name..." style={inpStyle} autoFocus />
              <select value={customType} onChange={e => setCustomType(e.target.value)} style={inpStyle}>
                {['Doctor','Hospital','Pharmacy','Clinic','Lab'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label style={lblStyle}>Visit Purpose / Notes <span style={{ color:'#9CA3AF', fontWeight:500 }}>(optional)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Discuss Cardace 5mg samples, follow-up on last prescription..."
              rows={2} style={{ ...inpStyle, resize:'vertical' }} />
          </div>

          {/* Photo */}
          <div>
            <label style={lblStyle}>Place / Clinic Photo <span style={{ color:'#9CA3AF', fontWeight:500 }}>(optional)</span></label>
            {photo ? (
              <div style={{ position:'relative' }}>
                <img src={photo} alt="Place" style={{ width:'100%', height:'110px', objectFit:'cover', borderRadius:'12px' }} />
                <button onClick={() => setPhoto(null)} style={{ position:'absolute', top:'7px', right:'7px', background:'#EF4444', border:'none', color:'#fff', borderRadius:'50%', width:'26px', height:'26px', cursor:'pointer', fontWeight:700 }}>✕</button>
              </div>
            ) : (
              <button onClick={() => setShowPhoto(true)} style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'1.5px dashed #CBD5E1', background:'#F8FAFC', color:'#64748B', fontWeight:600, fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                Capture / Upload Photo
              </button>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={() => onSubmit({ target: selectedTarget, notes, photo })}
            disabled={!canSubmit || gpsLoading}
            style={{ width:'100%', padding:'15px', borderRadius:'14px', border:'none', fontSize:'15px', fontWeight:800, cursor: (!canSubmit || gpsLoading) ? 'not-allowed' : 'pointer',
              background: (!canSubmit || gpsLoading) ? '#D1D5DB' : 'linear-gradient(135deg,#1E3A8A,#3B82F6)',
              color: (!canSubmit || gpsLoading) ? '#9CA3AF' : '#fff',
              boxShadow: (!canSubmit || gpsLoading) ? 'none' : '0 4px 16px rgba(59,130,246,0.35)',
              transition:'all 0.2s'
            }}
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
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div style={{ background:'#fff', borderRadius:'22px', width:'100%', maxWidth:'480px', maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 56px rgba(0,0,0,0.25)', animation:'modalIn 0.25s ease-out' }}>
        <div style={{ background:'linear-gradient(135deg,#065F46,#059669)', padding:'18px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'11px', fontWeight:700 }}>VISIT COMPLETE</div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:'16px' }}>Check-Out</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', borderRadius:'10px', padding:'6px 12px', cursor:'pointer', fontSize:'15px' }}>✕</button>
        </div>
        <div style={{ padding:'22px', display:'flex', flexDirection:'column', gap:'14px', overflowY:'auto', flex:1 }}>
          {/* Visit Summary */}
          <div style={{ background:'#F0FDF4', borderRadius:'12px', padding:'14px', display:'flex', flexDirection:'column', gap:'4px' }}>
            <div style={{ fontSize:'10px', fontWeight:800, color:'#047857', letterSpacing:'0.5px' }}>{visit.type.toUpperCase()}</div>
            <div>
              <div style={{ fontWeight:800, fontSize:'14px', color:'#111827' }}>{visit.name}</div>
              <div style={{ fontSize:'12px', color:'#6B7280' }}>{visit.clinic} · Checked-in at <strong>{visit.checkInTime}</strong></div>
            </div>
          </div>

          <div>
            <label style={lblStyle}>Products / Medicines Promoted</label>
            <input type="text" value={products} onChange={e => setProducts(e.target.value)}
              placeholder="e.g. Cardace 5mg, Lipvas 10mg" style={inpStyle} autoFocus />
          </div>
          <div>
            <label style={lblStyle}>Samples Distributed</label>
            <input type="text" value={samples} onChange={e => setSamples(e.target.value)}
              placeholder="e.g. Cardace (10 tabs), Visual Aid" style={inpStyle} />
          </div>
          <div>
            <label style={lblStyle}>Doctor Feedback / Call Summary</label>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
              placeholder="Doctor's response, prescription intent, follow-up needed…"
              rows={3} style={{ ...inpStyle, resize:'vertical' }} />
          </div>

          <button onClick={() => onSubmit({ products, samples, feedback })}
            disabled={gpsLoading}
            style={{ width:'100%', padding:'14px', borderRadius:'14px', border:'none', background: gpsLoading ? '#D1D5DB' : '#059669', color:'#fff', fontWeight:800, fontSize:'14px', cursor: gpsLoading ? 'not-allowed' : 'pointer', boxShadow: gpsLoading ? 'none' : '0 4px 16px rgba(5,150,105,0.3)' }}>
            {gpsLoading ? 'Getting Location...' : 'Confirm Check-Out'}
          </button>
        </div>
      </div>
    </div>
  );
}

const lblStyle = { display:'block', fontSize:'12px', fontWeight:700, color:'#374151', marginBottom:'6px' };
const inpStyle = { width:'100%', padding:'10px 13px', borderRadius:'10px', border:'1.5px solid #E5E7EB', fontSize:'13px', fontFamily:'inherit', color:'#1F2937', outline:'none', boxSizing:'border-box' };

// ─── Progress Circle Helper ────────────────────────────────────────────────────
function ProgressCircle({ pct, color, label, val }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const strokePct = ((100 - pct) / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg style={{ transform: 'rotate(-90deg)', width: '80px', height: '80px' }}>
          <circle cx="40" cy="40" r={r} fill="transparent" stroke="#F1F5F9" strokeWidth="6" />
          <circle cx="40" cy="40" r={r} fill="transparent" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={strokePct} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.35s' }} />
        </svg>
        <div style={{ position: 'absolute', fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>{val}</div>
      </div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'center' }}>{label}</div>
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
    <div style={{ animation:'fadeIn 0.35s ease-out', padding:'10px' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Welcome Banner ──────────────────────────────────────────────── */}
      <div style={{
        background:'linear-gradient(135deg,#1E3A8A 0%,#3B82F6 100%)',
        borderRadius:'20px', padding:'26px 30px', color:'#fff',
        marginBottom:'22px', boxShadow:'0 10px 30px rgba(59,130,246,0.18)',
        position:'relative', overflow:'hidden'
      }}>
        <div style={{ position:'relative', zIndex:2 }}>
          <span style={{ background:'rgba(255,255,255,0.18)', padding:'5px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:700, letterSpacing:'1px' }}>
            MEDICAL REPRESENTATIVE PORTAL
          </span>
          <h2 style={{ fontSize:'26px', fontWeight:800, margin:'12px 0 4px', letterSpacing:'-0.5px' }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {mrName.split(' ')[0]}!
          </h2>
          <p style={{ margin:0, fontSize:'13px', color:'rgba(255,255,255,0.8)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Stats Grid ───────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:'14px', marginBottom:'22px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:'16px',
            padding:'18px 20px', display:'flex', flexDirection:'column', gap:'6px',
            boxShadow:'0 2px 6px rgba(0,0,0,0.02)', transition:'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 20px rgba(0,0,0,0.07)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';    e.currentTarget.style.boxShadow='0 2px 6px rgba(0,0,0,0.02)'; }}
          >
            <div style={{ fontSize:'11px', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.5px' }}>{s.label}</div>
            <div style={{ fontSize:'24px', fontWeight:800, color:'#1F2937', lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:'11px', fontWeight:600, color:s.col }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Operations & Performance Progress Row ──────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '22px', alignItems: 'stretch' }}>
        
        {/* Left Card: Operations Control */}
        <div style={{
          background: '#fff', 
          borderRadius: '20px', 
          border: '1.5px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E5E7EB', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontWeight: 800, fontSize: '13px', color: '#374151', letterSpacing: '0.3px' }}>Operations Control</span>
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px',
              background: ds === 'ACTIVE' ? '#DCFCE7' : ds === 'ENDED' ? '#DBEAFE' : '#F3F4F6',
              color:       ds === 'ACTIVE' ? '#15803D'  : ds === 'ENDED' ? '#1D4ED8' : '#6B7280',
            }}>
              {ds === 'ACTIVE' ? 'Active' : ds === 'ENDED' ? 'Day Ended' : 'Off Duty'}
            </span>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', justifyContent: 'center', flex: 1 }}>
            
            {/* Live Timer Clock */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                {ds === 'ACTIVE' ? 'Time Elapsed' : ds === 'ENDED' ? 'Workday Duration' : 'Timer Ready'}
              </div>
              <div style={{
                fontFamily: 'monospace', fontSize: '38px', fontWeight: 800, letterSpacing: '2px',
                color: ds === 'ACTIVE' ? '#1F2937' : '#9CA3AF',
                lineHeight: 1
              }}>
                {ds === 'ACTIVE' ? secsToHMS(elapsed) : ds === 'ENDED' ? activeDay?.endTime : '00:00:00'}
              </div>
              {ds === 'ACTIVE' && (
                <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '6px' }}>Started at {activeDay?.startTime}</div>
              )}
            </div>

            {/* Action Buttons Grid - Exactly Two Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
              
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
              <div style={{ 
                width: '100%', 
                background: '#FFF7ED', 
                border: '1.5px solid #FFEDD5', 
                borderRadius: '12px', 
                padding: '10px 14px', 
                fontSize: '12px', 
                color: '#C2410C', 
                textAlign: 'center',
                fontWeight: 600
              }}>
                Active visit: {activeVisit.name} (since {activeVisit.checkInTime})
              </div>
            )}

          </div>
        </div>

        {/* Middle Card: Performance Progress circles (Rounded Balls) */}
        <div style={{
          background: '#fff', 
          borderRadius: '20px', 
          border: '1.5px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E5E7EB', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontWeight: 800, fontSize: '13px', color: '#374151', letterSpacing: '0.3px' }}>Performance & Attendance</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981' }}>Live Progress</span>
          </div>
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flex: 1, gap: '12px' }}>
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
        <div style={{
          background: 'linear-gradient(135deg, #1E293B, #0F172A)',
          borderRadius: '20px',
          padding: '24px',
          color: '#fff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '220px'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '14px' }}>Today's Summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                ['Start Time',    activeDay?.startTime || '—'],
                ['End Time',      activeDay?.endTime   || (ds === 'ACTIVE' ? 'Ongoing' : '—')],
                ['Visits Done',   `${doneVisits.length} / ${todayVisits.length}`],
                ['Active Now',    activeVisit ? activeVisit.name.split(' ').slice(0,2).join(' ') : 'None'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{k}</span>
                  <span style={{ fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          {ds === 'ACTIVE' && (
            <div style={{ fontSize: '12px', textAlign: 'center', color: '#38BDF8', fontWeight: 700, paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              Work duration: {secsToHMS(elapsed)}
            </div>
          )}
        </div>

      </div>

      {/* ── Main Content (Next Planned Calls on left, Quick Links & Holidays on right) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '22px', alignItems: 'stretch', height: '320px' }}>

        {/* Left Column: Next Planned Calls */}
        <div style={{ background:'#fff', border:'1.5px solid #F3F4F6', borderRadius:'18px', padding:'22px', boxShadow:'0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px', flexShrink: 0 }}>
            <div>
              <h3 style={{ margin:0, fontSize:'16px', fontWeight:800, color:'#1F2937' }}>Next Planned Calls</h3>
              <p style={{ margin:'3px 0 0 0', fontSize:'12px', color:'#9CA3AF' }}>Scheduled doctor and pharmacy visits remaining for today</p>
            </div>
            <button onClick={() => navigate('/mr/attendance')} style={{ background:'#EFF6FF', border:'none', color:'#1D4ED8', fontWeight:700, fontSize:'12px', padding:'6px 14px', borderRadius:'20px', cursor:'pointer', whiteSpace:'nowrap' }}>
              Attendance Ledger
            </button>
          </div>

          {upcomingCalls.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 20px', color:'#059669', background:'#ECFDF5', borderRadius:'14px', border:'1px solid #A7F3D0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize:'24px' }}>🏆</span>
              <div style={{ fontWeight:800, fontSize:'14.5px', marginTop:'6px' }}>All Planned Calls Completed!</div>
              <div style={{ fontSize:'12px', color:'#047857', marginTop:'3px' }}>You have visited all scheduled doctor and chemist sites for today. Good work!</div>
            </div>
          ) : (
            <div className="upcoming-calls-container" style={{ display:'flex', flexDirection:'column', gap:'12px', flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px' }}>
              {upcomingCalls.map((target, idx) => {
                const targetTime = mockTimes[idx % mockTimes.length];
                return (
                  <div key={target.id} style={{
                    display:'flex', gap:'16px', padding:'14px 18px', borderRadius:'14px', alignItems:'center',
                    background: '#FAFAFA',
                    border: '1.5px solid #F3F4F6',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.borderColor = '#BBF7D0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.borderColor = '#F3F4F6'; }}
                  >
                    {/* Time indicator */}
                    <div style={{ 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                      background: '#EFF6FF', color: '#1E40AF', borderRadius: '10px', width: '70px', height: '52px', flexShrink: 0 
                    }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plan</span>
                      <span style={{ fontSize: '11.5px', fontWeight: 800 }}>{targetTime}</span>
                    </div>

                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <span style={{ fontSize:'9px', fontWeight:800, padding:'2px 6px', borderRadius: '4px', background: '#E5E7EB', color: '#374151', textTransform: 'uppercase' }}>
                          {target.type}
                        </span>
                        <span style={{ fontSize:'13px', fontWeight:800, color:'#1F2937' }}>{target.name}</span>
                      </div>
                      <div style={{ fontSize:'11.5px', color:'#6B7280', marginTop:'3px' }}>
                        {target.clinic} · <span style={{ color: '#3B82F6', fontWeight: 600 }}>{target.specialty}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Links & Holidays */}
        <div style={{ display:'flex', flexDirection:'column', gap:'12px', height: '100%' }}>
          
          {/* Quick Links */}
          <div style={{ background:'#fff', border:'1.5px solid #F3F4F6', borderRadius:'18px', padding:'14px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.02)', flexShrink: 0 }}>
            <h3 style={{ margin:'0 0 10px', fontSize:'13.5px', fontWeight:800, color:'#1F2937' }}>Quick Links</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
              {[
                { label:'View Attendance', fn: () => navigate('/mr/attendance') },
                { label:'Submit Allowance',    fn: () => {} },
                { label:'Sample Inventory',          fn: () => {} },
                { label:'Target Doctors',         fn: () => {} },
              ].map((b, i) => (
                <button key={i} onClick={b.fn} style={{ padding:'8px 10px', borderRadius:'10px', border:'1.5px solid #E5E7EB', background:'#fff', color:'#374151', fontWeight:600, fontSize:'11.5px', cursor:'pointer', textAlign:'center', transition:'background 0.15s', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}
                  onMouseEnter={e => e.currentTarget.style.background='#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Holidays */}
          <div style={{
            background: '#fff', 
            borderRadius: '18px', 
            border: '1.5px solid #E5E7EB',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0
          }}>
            <div style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E5E7EB', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontWeight: 800, fontSize: '13px', color: '#374151', letterSpacing: '0.3px' }}>Upcoming Holidays</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#3B82F6' }}>2026</span>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              {[
                { date: 'June 29', name: 'Bakrid / Eid al-Adha', type: 'Regional' },
                { date: 'August 15', name: 'Independence Day', type: 'National' },
                { date: 'October 02', name: 'Gandhi Jayanti', type: 'National' },
              ].map((h, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: idx === 2 ? 0 : '8px', borderBottom: idx === 2 ? 'none' : '1px solid #F3F4F6' }}>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1F2937' }}>{h.name}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{h.date}</div>
                  </div>
                  <span style={{
                    fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '12px',
                    background: h.type === 'National' ? '#FEF2F2' : '#F0FDF4',
                    color: h.type === 'National' ? '#EF4444' : '#10B981'
                  }}>{h.type}</span>
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
        .upcoming-calls-container::-webkit-scrollbar {
          display: none;
        }
        .upcoming-calls-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

// ─── Reusable Button ───────────────────────────────────────────────────────────
function Btn({ label, onClick, disabled, bg, shadow, pulse, title }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      style={{
        padding:'13px 22px', borderRadius:'14px', border:'none', background: disabled ? '#E5E7EB' : bg,
        color: disabled ? '#9CA3AF' : '#fff', fontWeight:800, fontSize:'14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : `0 4px 14px ${shadow}`,
        transition:'all 0.2s', display:'flex', alignItems:'center', gap:'7px',
        animation: pulse && !disabled ? 'btnPulse 2s infinite' : 'none',
        whiteSpace:'nowrap'
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.9'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      {label}
    </button>
  );
}

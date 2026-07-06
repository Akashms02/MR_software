import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DailyQuote from '../../components/DailyQuote';
import axios from '../../api/axiosInstance';
import { API_ROUTE } from '../../data/env';
import { Loader2, Gift, ExternalLink, Bell, AlertCircle, Calendar, Coffee, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getActiveNotices } from '../../redux/actions/noticeActions';
import {
  punchInAction,
  punchOutAction,
  locationCheckInAction,
  locationCheckOutAction,
  fetchMyAttendanceAction,
  fetchMyVisitsAction
} from '../../redux/actions/attendanceActions';
import {
  findTodayAttendance,
  findActiveVisit,
  isPunchActive,
  isVisitActive,
  isSameCalendarDay,
  localTodayKey,
  visitCheckInCoords,
} from '../../utils/attendanceUtils';
import { fetchMeRequestsAction, updateTargetLocationAction } from '../../redux/actions/requestActions';
import { getApprovedVisitTargets } from '../../utils/onboardingTargets';
import { fetchActiveUpcomingHolidaysAction } from '../../redux/actions/holidayActions';
import { getFullAssetUrl } from '../../utils/getFullAssetUrl';

// ─── Constants ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'mr_field_attendance_db';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayStr  = () => new Date().toISOString().split('T')[0];
const nowTime   = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
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

function LocationStatusBar({ loading, message }) {
  if (loading) {
    return (
      <div className="w-full bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2.5 flex items-center justify-center gap-2 text-[12px] font-semibold text-blue-800">
        <Loader2 size={15} className="animate-spin shrink-0" />
        Fetching your location…
      </div>
    );
  }
  if (message) {
    return (
      <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-center text-[12px] font-semibold text-emerald-800">
        {message}
      </div>
    );
  }
  return null;
}

// ─── Confirm card (replaces browser alert/confirm) ───────────────────────────
function ConfirmCard({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, tone = 'danger' }) {
  const confirmBg = tone === 'danger'
    ? 'linear-gradient(135deg,#EF4444,#DC2626)'
    : 'linear-gradient(135deg,#3B82F6,#2563EB)';

  return (
    <div
      className="fixed inset-0 bg-black/55 z-[1200] flex items-center justify-center p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="bg-white rounded-3xl w-full max-w-[400px] overflow-hidden shadow-[0_24px_56px_rgba(0,0,0,0.28)] animate-[modalIn_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-card-title"
      >
        <div className={`px-5.5 py-4.5 ${tone === 'danger' ? 'bg-gradient-to-br from-red-800 to-red-600' : 'bg-gradient-to-br from-blue-900 to-blue-500'}`}>
          <h3 id="confirm-card-title" className="m-0 text-white font-extrabold text-[17px]">{title}</h3>
        </div>
        <div className="p-5.5">
          <p className="m-0 text-[14px] text-gray-600 leading-relaxed">{message}</p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              type="button"
              onClick={onCancel}
              className="py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 font-bold text-[14px] cursor-pointer hover:bg-gray-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="py-3 rounded-2xl border-none text-white font-extrabold text-[14px] cursor-pointer shadow-[0_4px_14px_rgba(239,68,68,0.3)]"
              style={{ background: confirmBg }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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

// ─── Visit Check-In Modal (Visit In → POST /attendance/location/check-in) ─────
function VisitCheckInModal({ onSubmit, onClose, gpsLoading, gpsMessage, visitTargets = [], targetsLoading, onRequestOnboarding }) {
  const [search, setSearch]       = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [notes, setNotes]         = useState('');
  const [photo, setPhoto]         = useState(null);
  const [showPhoto, setShowPhoto] = useState(false);

  const filtered = visitTargets.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase()) ||
    t.specialty?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedTarget = visitTargets.find(t => String(t.id) === String(selectedId));

  const canSubmit = !!selectedId && !!selectedTarget;

  const [lastVisit, setLastVisit] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!selectedId || !selectedTarget) {
      setLastVisit(null);
      return;
    }
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const type = selectedTarget.type === 'Pharmacy' || selectedTarget.type === 'CHEMIST' ? 'CHEMIST' : 'DOCTOR';
        const res = await axios.get(`${API_ROUTE}/attendance/location/history`, {
          params: {
            visitType: type,
            targetId: selectedId
          }
        });
        if (res.data && res.data.success && res.data.data && res.data.data.length > 0) {
          setLastVisit(res.data.data[0]);
        } else {
          setLastVisit(null);
        }
      } catch (err) {
        console.error('Failed to fetch visit history:', err);
        setLastVisit(null);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [selectedId, selectedTarget]);

  return (
    <div className="fixed inset-0 bg-black/55 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden shadow-[0_24px_56px_rgba(0,0,0,0.25)] animate-[modalIn_0.25s_ease-out]">

        {/* Header */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-500 px-5.5 py-4.5 flex justify-between items-center shrink-0">
          <div>
            <div className="text-white/70 text-[11px] font-bold tracking-wider">FIELD VISIT</div>
            <div className="text-white font-extrabold text-[16px]">Visit In</div>
          </div>
          <button onClick={onClose} className="bg-white/20 border-none text-white rounded-xl px-3 py-1.5 cursor-pointer text-[15px]">✕</button>
        </div>

        <div className="p-5.5 flex flex-col gap-4 overflow-y-auto flex-1">

          <LocationStatusBar loading={gpsLoading} message={!gpsLoading ? gpsMessage : ''} />
          {!gpsLoading && !gpsMessage && (
            <div className="bg-[#F0FDF4] rounded-xl px-3.5 py-2.5 text-[12px] font-semibold text-[#065F46] text-center">
              Time: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
          )}

          {/* Approved onboarding targets (doctor / chemist) */}
          <div>
            <label className="block text-[12px] font-bold text-gray-755 mb-1.5">
              Approved doctors &amp; chemists
              <span className="text-gray-400 font-medium ml-1">(from onboarding requests)</span>
            </label>
            <input
              type="text" value={search} onChange={e => { setSearch(e.target.value); setSelectedId(''); }}
              placeholder="Search approved targets..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-sans text-gray-800 outline-none box-border mb-2"
              autoFocus
              disabled={targetsLoading}
            />
            <div className="max-h-[200px] overflow-y-auto flex flex-col gap-1.5 border border-gray-105 rounded-xl p-2">
              {targetsLoading ? (
                <p className="text-center text-[12px] text-gray-400 py-4 m-0">Loading approved list…</p>
              ) : filtered.length === 0 ? (
                <div className="text-center py-4 px-2">
                  <p className="m-0 text-[12px] text-gray-500 font-semibold">No approved doctors or chemists yet.</p>
                  <p className="m-0 mt-1 text-[11px] text-gray-400">Submit an onboarding request and wait for admin approval.</p>
                  {onRequestOnboarding && (
                    <button
                      type="button"
                      onClick={onRequestOnboarding}
                      className="mt-2.5 px-3 py-2 rounded-lg border-none bg-blue-600 text-white text-[12px] font-bold cursor-pointer"
                    >
                      Request onboarding
                    </button>
                  )}
                </div>
              ) : (
                filtered.map(t => (
                  <div
                    key={`${t.type}-${t.id}`}
                    onClick={() => { setSelectedId(String(t.id)); setSearch(t.name); }}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 border ${
                      String(selectedId) === String(t.id) ? 'bg-[#EFF6FF] border-[#3B82F6]' : 'bg-[#FAFAFA] border-transparent'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">Approved</span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 uppercase">{t.type}</span>
                        <span className="text-[13px] font-bold text-gray-800">{t.name}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{t.specialty}</div>
                    </div>
                    {String(selectedId) === String(t.id) && <span className="text-blue-500 text-[16px]">✓</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedId && selectedTarget && (
            <div className="bg-slate-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Visit Details</span>
              {loadingHistory ? (
                <div className="flex items-center gap-1.5 py-1 text-slate-400 text-xs font-semibold">
                  <Loader2 size={12} className="animate-spin" /> Loading last visit activity...
                </div>
              ) : lastVisit ? (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[12px] font-extrabold text-slate-700">
                    <span>{new Date(lastVisit.checkInTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="text-slate-400 text-[11px] font-bold">{lastVisit.checkInTime ? new Date(lastVisit.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}</span>
                  </div>
                  {lastVisit.productsDiscussed && (
                    <div className="text-[11.5px] text-slate-600 font-medium">
                      <span className="font-bold text-slate-750">Products:</span> {lastVisit.productsDiscussed}
                    </div>
                  )}
                  {lastVisit.samplesGiven && (
                    <div className="text-[11.5px] text-slate-600 font-medium">
                      <span className="font-bold text-slate-750">Samples:</span> {lastVisit.samplesGiven}
                    </div>
                  )}
                  {lastVisit.feedback && (
                    <div className="text-[11px] text-slate-500 italic mt-0.5 bg-white/70 px-2 py-1 rounded border border-slate-100/50">
                      "{lastVisit.feedback}"
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-xs text-slate-500 font-semibold py-1">No previous completed visits recorded.</span>
              )}
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
            {gpsLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Fetching location…
              </span>
            ) : (
              'Confirm Visit In'
            )}
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
function VisitCheckOutModal({ visit, onSubmit, onClose, gpsLoading, gpsMessage }) {
  const [products,  setProducts]  = useState('');
  const [samples,   setSamples]   = useState('');
  const [feedback,  setFeedback]  = useState('');

  return (
    <div className="fixed inset-0 bg-black/55 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-[480px] max-h-[90vh] flex flex-col overflow-hidden shadow-[0_24px_56px_rgba(0,0,0,0.25)] animate-[modalIn_0.25s_ease-out]">
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-600 px-5.5 py-4.5 flex justify-between items-center shrink-0">
          <div>
            <div className="text-white/70 text-[11px] font-bold">VISIT COMPLETE</div>
            <div className="text-white font-extrabold text-[16px]">Visit Out</div>
          </div>
          <button onClick={onClose} className="bg-white/20 border-none text-white rounded-xl px-3 py-1.5 cursor-pointer text-[15px]">✕</button>
        </div>
        <div className="p-5.5 flex flex-col gap-3.5 overflow-y-auto flex-1">
          <LocationStatusBar loading={gpsLoading} message={!gpsLoading ? gpsMessage : ''} />
          {/* Visit Summary */}
          <div className="bg-[#F0FDF4] rounded-xl p-3.5 flex flex-col gap-1">
            <div className="text-[10px] font-extrabold text-[#047857] tracking-wider uppercase">{visit.type.toUpperCase()}</div>
            <div>
              <div className="font-extrabold text-[14px] text-gray-900">{visit.name}</div>
              <div className="text-[12px] text-gray-500">
                {visit.specialty ? `${visit.specialty} · ` : ''}Visit in at <strong>{visit.checkInTime}</strong>
              </div>
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
            {gpsLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Fetching location…
              </span>
            ) : (
              'Confirm Visit Out'
            )}
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

// ─── Birthday Row Helper ───────────────────────────────────────────────────────
function BirthdayRow({ name, date, role, photoUrl }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'E';
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-none">
      {photoUrl ? (
        <img 
          src={getFullAssetUrl(photoUrl)} 
          alt={name} 
          className="w-[34px] h-[34px] rounded-full object-cover shrink-0" 
        />
      ) : (
        <div className="w-[34px] h-[34px] rounded-full shrink-0 bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1] flex items-center justify-center text-[12px] font-bold text-[#334155]">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-[#111827] truncate">{name}</div>
        <div className="text-[11px] text-[#9CA3AF] truncate">{role || 'Team Member'}</div>
      </div>
      <div className="flex flex-col items-end">
        <div className="text-xs font-bold text-[#111827]">
          {date}
        </div>
      </div>
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
  const dispatch = useDispatch();
  const { myAttendance = [], myVisits = [], loading } = useSelector(state => state.attendance || {});
  const { requests = [], loading: requestsLoading } = useSelector(state => state.request || {});
  const { activeUpcomingHolidays = [] } = useSelector(state => state.holiday || {});
  const { activeNotices = [] } = useSelector(state => state.notices || {});
  const [assignedTargets, setAssignedTargets] = useState([]);
  const [targetsLoading, setTargetsLoading] = useState(false);

  const fetchAssignedTargets = async () => {
    setTargetsLoading(true);
    try {
      const res = await axios.get(`${API_ROUTE}/doctor/my-assigned`);
      if (res.data && (res.data.success || res.data.status === true) && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map(item => {
          const isChemist = String(item.type).toUpperCase() === 'CHEMIST';
          return {
            id: item.id,
            name: item.fullName || item.name || 'Unknown',
            type: isChemist ? 'Pharmacy' : 'Doctor',
            apiType: isChemist ? 'CHEMIST' : 'DOCTOR',
            specialty: item.speciality || item.specialty || item.chemistContactPerson || (isChemist ? 'Chemist' : 'Doctor'),
            clinic: item.clinicName || item.clinic || [item.address, item.city].filter(Boolean).join(', ') || '',
            latitude: item.latitude,
            longitude: item.longitude
          };
        });
        setAssignedTargets(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch assigned targets:', err);
    } finally {
      setTargetsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTargets();
  }, [user]);

  const [toast,       setToast]       = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('');
  const [gpsAction, setGpsAction] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // timer
  const [elapsed, setElapsed] = useState(0); // seconds since day start
  const timerRef = useRef(null);

  // modals
  const [modal, setModal] = useState(null); // null | 'visitIn' | 'visitOut'
  const [punchOutConfirmOpen, setPunchOutConfirmOpen] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const todayDateKey = localTodayKey();
  const formatIsoToTime = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return '';
    }
  };

  const mapVisitFromApi = (v) => {
    const inCoords = visitCheckInCoords(v);
    return {
      id: v.id,
      name: v.targetName || v.name || 'Unknown Target',
      type: v.visitType === 'DOCTOR' ? 'Doctor' : v.visitType === 'CHEMIST' ? 'Pharmacy' : v.visitType || 'Doctor',
      specialty: v.specialty || '',
      checkInTime: formatIsoToTime(v.checkInTime),
      checkInCoords: inCoords || { lat: null, lng: null },
      checkOutTime: formatIsoToTime(v.checkOutTime),
      status: isVisitActive(v) ? 'ACTIVE' : 'COMPLETED',
      products: v.productsDiscussed || v.products || '',
      samples: v.samplesGiven || v.samples || '',
      feedback: v.feedback || '',
    };
  };

  const todayAttendance = findTodayAttendance(myAttendance, todayDateKey);

  const todayVisitsFromApi = myVisits.filter(
    (v) => v.checkInTime && isSameCalendarDay(v.checkInTime, todayDateKey)
  );

  const mappedTodayVisits = todayVisitsFromApi.map(mapVisitFromApi);

  const activeDay = todayAttendance
    ? {
        status: isPunchActive(todayAttendance) ? 'ACTIVE' : 'ENDED',
        startTime: formatIsoToTime(todayAttendance.punchInTime),
        endTime: formatIsoToTime(todayAttendance.punchOutTime),
        punchInTime: todayAttendance.punchInTime,
        startLocation: {
          lat: todayAttendance.punchInLatitude,
          lng: todayAttendance.punchInLongitude,
          name: todayAttendance.punchInRemarks || 'GPS Location',
        },
        endLocation: todayAttendance.punchOutTime
          ? {
              lat: todayAttendance.punchOutLatitude,
              lng: todayAttendance.punchOutLongitude,
              name: todayAttendance.punchOutRemarks || 'GPS Location',
            }
          : null,
        visits: mappedTodayVisits,
      }
    : null;

  const activeVisitRecord = findActiveVisit(myVisits, todayDateKey);
  const activeVisit = activeVisitRecord ? mapVisitFromApi(activeVisitRecord) : null;

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchMyAttendanceAction());
    dispatch(fetchMyVisitsAction());
    dispatch(fetchMeRequestsAction());
    dispatch(fetchActiveUpcomingHolidaysAction());
    dispatch(getActiveNotices());
  }, [dispatch]);

  // ── Live Timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    clearInterval(timerRef.current);
    if (activeDay && activeDay.status === 'ACTIVE' && activeDay.punchInTime) {
      const start = new Date(activeDay.punchInTime);
      const tick = () => {
        if (start && !isNaN(start.getTime())) {
          const diff = Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000));
          setElapsed(diff);
        }
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [activeDay?.status, activeDay?.punchInTime]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const clearGpsFeedback = (delay = 2500) => {
    setTimeout(() => {
      setGpsMessage('');
      setGpsAction(null);
    }, delay);
  };

  const getGps = (actionKey) =>
    new Promise((res) => {
      setGpsLoading(true);
      setGpsAction(actionKey);
      setGpsMessage('');
      navigator.geolocation.getCurrentPosition(
        (p) => {
          setGpsLoading(false);
          setGpsMessage('Location captured successfully');
          showToast('Location captured successfully', 'success');
          clearGpsFeedback();
          res({ lat: p.coords.latitude, lng: p.coords.longitude });
        },
        () => {
          setGpsLoading(false);
          setGpsMessage('GPS unavailable — using approximate location');
          showToast('GPS unavailable — using approximate location', 'success');
          clearGpsFeedback(3000);
          res({
            lat: 12.9716 + (Math.random() - 0.5) * 0.01,
            lng: 77.5946 + (Math.random() - 0.5) * 0.01,
          });
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    });

  const btnLabel = (defaultLabel, actionKey) => {
    if (gpsLoading && gpsAction === actionKey) {
      return (
        <span className="inline-flex items-center gap-2">
          <Loader2 size={15} className="animate-spin" />
          Fetching location…
        </span>
      );
    }
    return defaultLabel;
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleStartDay = async () => {
    const coords = await getGps('punchIn');
    try {
      const res = await dispatch(
        punchInAction({
          latitude: coords.lat,
          longitude: coords.lng,
          workType: 'FIELD_WORK',
          remarks: 'Punching in from dashboard',
        })
      );
      const time = formatIsoToTime(res?.data?.punchInTime || new Date());
      showToast(`Day started at ${time} ✅`);
      // State is updated by punchInAction; refetch can race and clear UI if API lags
    } catch (err) {
      showToast(err.message || 'Failed to punch in', 'error');
    }
  };

  const handleEndDay = () => {
    setPunchOutConfirmOpen(true);
  };

  const confirmEndDay = async () => {
    setPunchOutConfirmOpen(false);
    const coords = await getGps('punchOut');
    try {
      await dispatch(
        punchOutAction({
          latitude: coords.lat,
          longitude: coords.lng,
          remarks: 'Punching out from dashboard',
        })
      );
      showToast('Day ended successfully 🏁');
    } catch (err) {
      showToast(err.message || 'Failed to punch out', 'error');
    }
  };

  const handleVisitCheckIn = async ({ target, notes, photo }) => {
    const coords = await getGps('visitIn');
    try {
      await dispatch(
        locationCheckInAction({
          visitType: target.apiType || (target.type === 'Pharmacy' ? 'CHEMIST' : 'DOCTOR'),
          targetId: Number(target.id),
          latitude: coords.lat,
          longitude: coords.lng,
        })
      );
      
      // Auto-update target doctor/chemist location coordinates with live coordinates
      try {
        const type = target.apiType || (target.type === 'Pharmacy' ? 'CHEMIST' : 'DOCTOR');
        await dispatch(
          updateTargetLocationAction(type, Number(target.id), coords.lat, coords.lng)
        );
      } catch (locErr) {
        console.error('Failed to update target location coordinates on check-in:', locErr);
      }

      setModal(null);
      showToast(`Visit started at ${target.name} ✅`);
    } catch (err) {
      showToast(err.message || 'Failed to start visit', 'error');
    }
  };

  const handleVisitCheckOut = async ({ products, samples, feedback }) => {
    const coords = await getGps('visitOut');
    try {
      await dispatch(
        locationCheckOutAction({
          latitude: coords.lat,
          longitude: coords.lng,
          productsDiscussed: products,
          samplesGiven: samples,
          feedback: feedback,
        })
      );
      setModal(null);
      showToast(`Visit completed at ${activeVisit?.name || 'location'} ✅`);
    } catch (err) {
      showToast(err.message || 'Failed to complete visit', 'error');
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const ds            = !activeDay ? 'NOT_STARTED' : activeDay.status; // 'NOT_STARTED'|'ACTIVE'|'ENDED'
  const todayVisits   = activeDay?.visits || [];
  const doneVisits    = todayVisits.filter(v => v.status === 'COMPLETED');
  const allCompleted  = myVisits.filter(v => v.status === 'COMPLETED').map(mapVisitFromApi);
  const daysWorked    = myAttendance.length;

  // Planned calls = assigned targets not yet visited today
  const upcomingCalls = assignedTargets.filter(
    (target) => !todayVisits.some((v) => v.name === target.name)
  );
  const mockTimes = ['10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'];

  const stats = [
    { label:'Visits Today',    val: `${doneVisits.length}`, sub: activeVisit ? '1 in progress' : 'completed calls',         col:'#3B82F6' },
    { label:'Total This Week', val: String(allCompleted.length), sub: `${daysWorked} working days`,                         col:'#06B6D4' },
    { label:'Active Visit',    val: activeVisit ? activeVisit.name.split(' ').slice(0,2).join(' ') : 'None', sub: activeVisit ? `Since ${activeVisit.checkInTime}` : 'No active visit', col:'#F59E0B' },
    { label:'Hrs Worked',      val: ds === 'ACTIVE' ? secsToHMS(elapsed).slice(0,5) : ds === 'ENDED' ? (activeDay?.endTime || '—') : '—', sub: ds === 'ACTIVE' ? 'running now' : ds === 'ENDED' ? 'ended' : 'not started', col:'#10B981' },
  ];

  const formatRole = (roleStr) => {
    if (!roleStr) return 'Employee'
    return roleStr.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  }

  // Birthdays dynamic list (Show all colleagues)
  const getUpcomingMRBirthdays = () => {
    const currentMonth = new Date().getMonth()
    const allColleagues = team; // Show all colleagues

    const list = allColleagues
      .filter(emp => emp.dateOfBirth)
      .filter(emp => {
        const dob = new Date(emp.dateOfBirth)
        return dob.getMonth() === currentMonth
      })
      .map(emp => {
        const dob = new Date(emp.dateOfBirth)
        return {
          name: emp.fullName,
          date: dob.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          role: formatRole(emp.role),
          photoUrl: emp.photoUrl
        }
      })
    
    // Fallback/mocks if empty to keep it beautiful
    if (list.length === 0) {
      const monthStr = new Date().toLocaleDateString('en-US', { month: 'short' })
      const dates = [`12 ${monthStr}`, `20 ${monthStr}`, `25 ${monthStr}`]
      const defaultColleagues = allColleagues.length > 0 ? allColleagues : [
        { fullName: 'Akash M S', role: 'Medical Representative' },
        { fullName: 'Sagar M S', role: 'Area Manager' },
        { fullName: 'Harish Kumar', role: 'Regional Manager' }
      ]
      return defaultColleagues.slice(0, 3).map((emp, i) => ({
        name: emp.fullName || emp.name,
        date: dates[i % dates.length],
        role: formatRole(emp.role),
        photoUrl: emp.photoUrl
      }))
    }
    return list.slice(0, 4)
  }

  const mrBirthdayList = getUpcomingMRBirthdays();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="animate-[fadeIn_0.35s_ease-out] p-2.5">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Welcome Banner ── */}
      <div className="rounded-[20px] px-[30px] py-7 mb-5.5 text-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] flex items-center justify-between flex-wrap gap-6 relative overflow-hidden border border-white/10">
        <img 
          src="/banner.jfif" 
          alt="Welcome Banner" 
          className="absolute inset-0 w-full h-full object-cover z-0" 
        />

        <div className="flex items-center gap-5 z-[3] w-full">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8F04A] to-[#10B981] flex items-center justify-center text-[24px] font-extrabold text-[#064E3B] shadow-[0_4px_14px_rgba(200,240,74,0.4)] border-2 border-white/20 shrink-0">
            {mrName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-black text-white/90 mb-1">
              {(() => {
                const hour = new Date().getHours();
                if (hour < 12) return 'Good Morning';
                if (hour < 17) return 'Good Afternoon';
                return 'Good Evening';
              })()}
            </div>
            <h1 className="text-[26px] font-extrabold text-white m-0 tracking-tight leading-none">
              {mrName}
            </h1>
            <DailyQuote userRole="MR" variant="welcome" />
          </div>
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
          <div className="bg-slate-50 border-b border-gray-200 px-5 py-3.5 flex justify-between items-center shrink-0">
            <span className="font-extrabold text-[13px] text-gray-700 tracking-wide">Operations Control</span>
            <span className={`text-[11px] font-bold px-3 py-1 rounded-2xl ${ds === 'ACTIVE' ? 'bg-[#DCFCE7] text-[#15803D]' : ds === 'ENDED' ? 'bg-[#DBEAFE] text-[#1D4ED8]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
              {ds === 'ACTIVE' ? 'Active' : ds === 'ENDED' ? 'Day Ended' : 'Off Duty'}
            </span>
          </div>

          <div className="p-6 flex flex-col items-center gap-5 justify-center flex-1">
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

            {(gpsLoading || gpsMessage) && (
              <LocationStatusBar loading={gpsLoading} message={!gpsLoading ? gpsMessage : ''} />
            )}

            <div className="grid grid-cols-2 gap-3 w-full">
              {ds === 'NOT_STARTED' || ds === 'ENDED' ? (
                <Btn
                  onClick={handleStartDay}
                  disabled={gpsLoading}
                  bg="linear-gradient(135deg,#10B981,#059669)"
                  shadow="rgba(16,185,129,0.25)"
                  label={btnLabel('Check In', 'punchIn')}
                />
              ) : (
                <Btn
                  onClick={handleEndDay}
                  disabled={gpsLoading || !!activeVisit}
                  bg="linear-gradient(135deg,#EF4444,#DC2626)"
                  shadow="rgba(239,68,68,0.25)"
                  label={btnLabel('Check Out', 'punchOut')}
                  title={activeVisit ? 'Check out of your current visit first' : ''}
                />
              )}

              {!activeVisit ? (
                <Btn
                  onClick={() => setModal('visitIn')}
                  disabled={ds !== 'ACTIVE' || gpsLoading}
                  bg="linear-gradient(135deg,#3B82F6,#2563EB)"
                  shadow="rgba(59,130,246,0.25)"
                  label={gpsLoading && gpsAction === 'visitIn' ? btnLabel('Visit In', 'visitIn') : 'Visit In'}
                />
              ) : (
                <Btn
                  onClick={() => setModal('visitOut')}
                  disabled={ds !== 'ACTIVE' || gpsLoading}
                  bg="linear-gradient(135deg,#F97316,#EA580C)"
                  shadow="rgba(249,115,22,0.25)"
                  label="Visit Out"
                  pulse
                />
              )}
            </div>

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

        {/* Right Card: Onboarding & DCR Ledger */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="text-[11px] font-extrabold text-white/60 tracking-wider uppercase mb-3.5">Onboarding & DCR Ledger</div>
            <div className="flex flex-col gap-2.5">
              {[
                ['Total Assigned Targets', `${assignedTargets.length} assigned`],
                ['Pending Approvals', `${requests.filter(r => r.status === 'PENDING').length} onboard requests`],
                ['DCR Submissions', `${doneVisits.length} calls logged today`],
                ['Assigned Chemists', `${assignedTargets.filter(t => (t.type || '').toLowerCase() === 'chemist' || (t.type || '').toLowerCase() === 'pharmacy').length} pharmacies`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-[12.5px] border-b border-white/8 pb-1.5">
                  <span className="text-white/60">{k}</span>
                  <span className="font-bold">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[11.5px] text-center text-sky-400 font-bold pt-2.5 border-t border-white/10 cursor-pointer hover:underline" onClick={() => navigate('/mr/requests')}>
            View Onboarding Requests ➜
          </div>
        </div>

      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-[1.5fr_1.2fr_1.1fr] gap-5 mb-5.5 items-stretch">

        {/* Left Column: Next Planned Calls */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col h-[480px]">
          <div className="flex justify-between items-center mb-4.5 border-b border-gray-100 pb-3 shrink-0">
            <div>
              <h3 className="m-0 text-[16px] font-extrabold text-gray-800">Next Planned Calls</h3>
              <p className="m-0 text-[12px] text-gray-400">Scheduled doctor and pharmacy visits remaining for today</p>
            </div>
            <button onClick={() => navigate('/mr/attendance')} className="bg-blue-50 border-none text-blue-700 font-bold text-[12px] px-3.5 py-1.5 rounded-full cursor-pointer whitespace-nowrap">
              Attendance Ledger
            </button>
          </div>

          {assignedTargets.length === 0 ? (
            <div className="text-center p-10 px-5 text-blue-800 bg-[#EFF6FF] rounded-xl border border-[#BFDBFE] flex-1 flex flex-col justify-center">
              <div className="font-extrabold text-[14.5px] mt-1.5">No assigned visit targets yet</div>
              <div className="text-[12px] text-[#1D4ED8] mt-1">Please ask your administrator, ME, or MSE to assign doctor or chemist targets to you to plan field visits.</div>
              <button
                type="button"
                onClick={() => navigate('/mr/onboard-doctor')}
                className="mt-3 mx-auto px-4 py-2 rounded-xl border-none bg-blue-600 text-white text-[12px] font-bold cursor-pointer"
              >
                Request onboarding
              </button>
            </div>
          ) : upcomingCalls.length === 0 ? (
            <div className="text-center p-10 px-5 text-emerald-600 bg-[#ECFDF5] rounded-xl border border-[#A7F3D0] flex-1 flex flex-col justify-center font-sans">
              <span className="text-[24px]">🎉</span>
              <div className="font-extrabold text-[14.5px] mt-1.5">All Planned Calls Completed!</div>
              <div className="text-[12px] text-[#047857] mt-1">You have visited all approved doctor and chemist sites for today. Good work!</div>
            </div>
          ) : (
            <div className="upcoming-calls-container flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {upcomingCalls.map((target, idx) => {
                const targetTime = mockTimes[idx % mockTimes.length];
                return (
                  <div 
                    key={`${target.type}-${target.id}`} 
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
                        <span className="text-blue-500 font-semibold">{target.specialty}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Middle Column: Notice Board & Upcoming Holidays */}
        <div className="flex flex-col gap-4 h-full">
          {/* Notice Board */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col flex-1 min-h-[250px]">
            <div className="flex justify-between items-center mb-4.5 border-b border-gray-100 pb-3 shrink-0">
              <div>
                <h3 className="m-0 text-[14.5px] font-extrabold text-gray-800">Notice Board</h3>
                <p className="m-0 text-[11px] text-gray-400">Important company announcements and team updates</p>
              </div>
              <Bell size={16} className="text-blue-500 shrink-0" />
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1 max-h-[190px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {activeNotices.length > 0 ? (
                activeNotices.map((notice, i) => (
                  <div 
                    key={notice.id || i} 
                    onClick={() => setSelectedNotice(notice)}
                    className="group flex items-start gap-3 p-3 rounded-xl bg-[#FAFAFA] border border-transparent hover:bg-blue-50/40 hover:border-blue-100 transition-all duration-200 cursor-pointer"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                      notice.noticeType === 'URGENT' ? "bg-red-50 text-red-500 border-red-100" :
                      notice.noticeType === 'EVENT' ? "bg-blue-50 text-blue-500 border-blue-100" :
                      notice.noticeType === 'HOLIDAY' ? "bg-amber-50 text-amber-500 border-amber-100" :
                      "bg-blue-50 text-blue-500 border-blue-100"
                    )}>
                      {notice.noticeType === 'URGENT' ? <AlertCircle size={15} /> :
                       notice.noticeType === 'EVENT' ? <Calendar size={15} /> :
                       notice.noticeType === 'HOLIDAY' ? <Coffee size={15} /> :
                       <Bell size={15} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-[12px] font-extrabold text-gray-800 truncate group-hover:text-blue-600 transition-colors m-0 leading-tight">
                        {notice.title}
                      </h4>
                      <p className="text-[10.5px] text-gray-400 font-semibold m-0 mt-1 line-clamp-2 leading-relaxed">
                        {notice.message || notice.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 opacity-40 text-gray-400">
                  <AlertCircle size={20} className="mb-1.5" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No active notices</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Holidays */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col shrink-0 min-h-[140px] max-h-[200px]">
            <div className="bg-slate-50 border-b border-gray-100 px-5 py-2.5 flex justify-between items-center shrink-0">
              <span className="font-extrabold text-[13px] text-gray-700 tracking-wide">Upcoming Holidays</span>
              <span className="text-[11px] font-bold text-blue-500">{new Date().getFullYear()}</span>
            </div>
            <div className="px-5 py-3 flex flex-col gap-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {activeUpcomingHolidays.length === 0 ? (
                <div className="py-6 text-center text-gray-400 text-xs font-semibold">No upcoming holidays.</div>
              ) : (
                activeUpcomingHolidays.slice(0, 4).map((h, idx) => {
                  let formattedDate = h.date || '';
                  if (h.date) {
                    try {
                      const dateParts = h.date.split('-');
                      const dateObj = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
                      formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                    } catch (e) {
                      formattedDate = h.date;
                    }
                  }
                  const isNationalOrGazetted = (type) => {
                    const t = (type || '').toLowerCase();
                    return t.includes('national') || t.includes('gazetted');
                  };
                  const typeLabel = h.primaryType || 'Observance';
                  const isNat = isNationalOrGazetted(typeLabel);
                  
                  return (
                    <div 
                      key={h.id || idx} 
                      className={`flex items-center justify-between ${idx === Math.min(activeUpcomingHolidays.length, 4) - 1 ? 'pb-0 border-none' : 'pb-1.5 border-b border-gray-100'}`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="text-[12px] font-bold text-gray-800 truncate" title={h.name}>{h.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{formattedDate}</div>
                      </div>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${isNat ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-[#F0FDF4] text-[#10B981]'}`}>{typeLabel}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Links & Birthdays */}
        <div className="flex flex-col gap-4 h-full">
          {/* Quick Links */}
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] shrink-0">
            <h3 className="m-0 mb-2.5 text-[13.5px] font-extrabold text-gray-800">Quick Links</h3>
            <div className="grid grid-cols-2 gap-1.5 mb-2.5">
              {[
                { label: 'Add DCR Report', fn: () => navigate('/mr/dcr', { state: { activeTab: 'new' } }) },
                { label: 'Add Tour Plan', fn: () => navigate('/mr/tourplan', { state: { activeTab: 'new' } }) },
                { label: 'Apply Leave', fn: () => navigate('/mr/leaves', { state: { activeTab: 'new' } }) },
                { label: 'Field Attendance', fn: () => navigate('/mr/attendance') },
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
            <button
              onClick={() => navigate('/mr/onboard-doctor')}
              className="w-full py-2.5 rounded-xl border-none bg-blue-600 hover:bg-blue-700 text-white font-bold text-[12px] cursor-pointer text-center transition-all flex items-center justify-center gap-1.5"
            >
              ➕ Request Doctor Onboarding
            </button>
          </div>

          {/* Birthdays Card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative p-5 flex-1 min-h-[200px]">
            <img 
              src="/Birthday.jpg" 
              alt="Birthday Background" 
              className="absolute inset-0 w-full h-full object-cover z-0" 
            />
            <div className="absolute inset-0 bg-white/92 z-[1]" />
            
            <div className="relative z-[2] flex flex-col h-full">
              <div className="flex justify-between items-start mb-3 border-b border-gray-100/60 pb-3">
                <div>
                  <div className="text-[13px] font-extrabold text-gray-900">Birthday</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Celebrations in your team</div>
                </div>
                <Gift size={14} className="text-gray-900 mt-0.5 shrink-0" />
              </div>
              <div className="flex flex-col gap-1.5 overflow-y-auto pr-0.5 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {mrBirthdayList.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 text-xs font-semibold">No birthdays this month.</div>
                ) : (
                  mrBirthdayList.map((item, idx) => (
                    <BirthdayRow 
                      key={idx} 
                      name={item.name} 
                      date={item.date} 
                      role={item.role} 
                      photoUrl={item.photoUrl}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>


      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {punchOutConfirmOpen && (
        <ConfirmCard
          title="End workday?"
          message="You will not be able to check in again today. Please finish any open visit before checking out."
          confirmLabel="Check Out"
          cancelLabel="Cancel"
          onConfirm={confirmEndDay}
          onCancel={() => setPunchOutConfirmOpen(false)}
          tone="danger"
        />
      )}
      {modal === 'visitIn' && (
        <VisitCheckInModal
          gpsLoading={gpsLoading}
          gpsMessage={gpsMessage}
          visitTargets={upcomingCalls}
          targetsLoading={targetsLoading}
          onRequestOnboarding={() => { setModal(null); navigate('/mr/onboard-doctor'); }}
          onSubmit={handleVisitCheckIn}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'visitOut' && activeVisit && (
        <VisitCheckOutModal
          visit={activeVisit}
          gpsLoading={gpsLoading}
          gpsMessage={gpsMessage}
          onSubmit={handleVisitCheckOut}
          onClose={() => setModal(null)}
        />
      )}

      {selectedNotice && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in scale-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 flex items-start justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
                  selectedNotice.noticeType === 'URGENT' ? "bg-rose-50 text-rose-500 border-rose-100" :
                  selectedNotice.noticeType === 'EVENT' ? "bg-blue-50 text-blue-500 border-blue-100" :
                  selectedNotice.noticeType === 'HOLIDAY' ? "bg-amber-50 text-amber-500 border-amber-100" :
                  "bg-blue-50 text-blue-500 border-blue-100"
                )}>
                  {selectedNotice.noticeType === 'URGENT' ? <AlertCircle size={20} /> :
                   selectedNotice.noticeType === 'EVENT' ? <Calendar size={20} /> :
                   selectedNotice.noticeType === 'HOLIDAY' ? <Coffee size={20} /> :
                   <Bell size={20} />}
                </div>
                <div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                    selectedNotice.noticeType === 'URGENT' ? "bg-rose-50 text-rose-650 border-rose-100" :
                    selectedNotice.noticeType === 'EVENT' ? "bg-blue-50 text-blue-655 border-blue-100" :
                    selectedNotice.noticeType === 'HOLIDAY' ? "bg-amber-50 text-amber-655 border-amber-100" :
                    "bg-blue-50 text-blue-600 border-blue-100"
                  )}>
                    {selectedNotice.noticeType || 'GENERAL'}
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1.5">
                    Posted on {selectedNotice.createdAt ? new Date(selectedNotice.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {selectedNotice.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                {selectedNotice.message || selectedNotice.content}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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
  const isLoadingLabel = typeof label !== 'string';
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      title={title}
      className={`px-5.5 py-3 rounded-2xl border-none font-extrabold text-[14px] transition-all duration-200 flex items-center gap-2 justify-center whitespace-nowrap min-h-[48px] ${
        disabled && !isLoadingLabel
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
          : disabled && isLoadingLabel
            ? 'bg-gray-400 text-white cursor-wait shadow-none'
            : 'text-white cursor-pointer'
      } ${pulse && !disabled ? 'animate-[btnPulse_2s_infinite]' : ''}`}
      style={{ 
        background: disabled && !isLoadingLabel ? undefined : isLoadingLabel ? '#94A3B8' : bg, 
        boxShadow: disabled && !isLoadingLabel ? 'none' : isLoadingLabel ? 'none' : `0 4px 14px ${shadow}` 
      }}
    >
      {label}
    </button>
  );
}

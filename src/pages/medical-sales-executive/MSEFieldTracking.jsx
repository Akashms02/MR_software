import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from '../../api/axiosInstance';
import { API_ROUTE } from '../../data/env';
import { getMyTeam } from '../../redux/actions/teamActions';
import { fetchTeamAttendanceAction, fetchTeamVisitsAction } from '../../redux/actions/attendanceActions';
import { parseCoord, visitCheckInCoords, visitCheckOutCoords, isSameCalendarDay } from '../../utils/attendanceUtils';
import { 
  Users, MapPin, CheckCircle, Clock, Navigation, 
  Map, Award, Calendar, RefreshCw, BarChart2, Eye, ShieldAlert,
  ChevronRight, Camera, Search, UserCheck, Square, X, Loader2
} from 'lucide-react';

const getLatLngDistanceMeters = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const R = 6371000; // Radius of Earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ─── Visit History Modal (Admin View) ───────────────────────────────────────
function VisitHistoryModal({ target, mrName, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!target) return;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const type = target.type === 'Pharmacy' || target.type === 'CHEMIST' ? 'CHEMIST' : 'DOCTOR';
        const res = await axios.get(`${API_ROUTE}/attendance/location/history`, {
          params: {
            visitType: type,
            targetId: target.id,
            mrId: target.mrId
          }
        });
        if (res.data && (res.data.success || res.data.status === true)) {
          setHistory(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [target]);

  if (!target) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1500] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in scale-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 flex items-start justify-between border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VISIT HISTORY</div>
            <h3 className="text-base font-extrabold text-slate-900 leading-snug mt-0.5">
              {target.name}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium m-0 mt-1">
              Representative: <span className="font-bold text-slate-700">{mrName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-650 transition-colors border-none bg-transparent cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-sm font-semibold gap-2">
              <Loader2 size={24} className="animate-spin text-blue-500" />
              <span>Loading past visits history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="m-0 text-sm font-bold text-slate-500">No previous visits</p>
              <p className="m-0 text-xs mt-1">There are no other completed visits recorded by this representative for this location.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((h) => (
                <div key={h.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs border-b border-slate-100/50 pb-2">
                    <span className="font-extrabold text-slate-700">
                      📅 {new Date(h.checkInTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-slate-400 font-bold">
                      Checked in at {h.checkInTime ? new Date(h.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                    <div>
                      <strong>📥 Visit In:</strong> {h.checkInTime ? new Date(h.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                    <div>
                      <strong>📤 Visit Out:</strong> {h.checkOutTime ? new Date(h.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-slate-700">
                    {h.productsDiscussed && (
                      <div>💊 <strong>Brands:</strong> {h.productsDiscussed}</div>
                    )}
                    {h.samplesGiven && (
                      <div>🧪 <strong>Samples:</strong> {h.samplesGiven}</div>
                    )}
                    {h.feedback && (
                      <div className="bg-white/80 px-2.5 py-2 rounded border border-slate-100 text-[11px] text-slate-600 italic mt-1.5">
                        "{h.feedback}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MSEFieldTracking() {
  const dispatch = useDispatch();
  
  // Team state from Redux
  const { team = [], loading: teamLoading } = useSelector(state => state.team || {});

  // Local state
  const { teamAttendance = [], teamVisits = [], loading: attendanceLoading } = useSelector(state => state.attendance || {});
  const isLoading = teamLoading || attendanceLoading;
  
  const [selectedMrId, setSelectedMrId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [selectedDoctorKey, setSelectedDoctorKey] = useState('');

  useEffect(() => {
    setSelectedDoctorKey('');
  }, [selectedMrId, selectedDate]);

  const handleRefresh = () => {
    dispatch(getMyTeam());
    dispatch(fetchTeamAttendanceAction());
    dispatch(fetchTeamVisitsAction());
  };

  // UI Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLineRef = useRef(null);
  const markersRef = useRef([]);

  // Extract MR List from team list
  const mrList = useMemo(() => {
    return (team || []).filter((member) => {
      const role = (member.role || '').toUpperCase().trim();
      const name = (member.fullName || member.name || '').toLowerCase();
      const isMr = role === 'MR' || role === 'MEDICAL_REPRESENTATIVE';
      const isSuperAdmin = name.includes('superadmin') || name.includes('admin');
      return isMr && !isSuperAdmin;
    });
  }, [team]);

  // 1. Fetch team list on mount
  useEffect(() => {
    dispatch(getMyTeam());
  }, [dispatch]);

  // 2. Fetch team logs on mount
  useEffect(() => {
    dispatch(fetchTeamAttendanceAction());
    dispatch(fetchTeamVisitsAction());
  }, [dispatch]);

  useEffect(() => {
    if (mrList.length > 0 && !selectedMrId) {
      setSelectedMrId(String(mrList[0].id || mrList[0].employeeId || '1'));
    }
  }, [mrList, selectedMrId]);



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
    const inCoords  = visitCheckInCoords(v);
    const outCoords = visitCheckOutCoords(v);
    return {
      id: v.id,
      targetId: v.targetId,
      visitType: v.visitType,
      name: v.targetName || v.name || 'Unknown Target',
      type: v.visitType === 'DOCTOR' ? 'Doctor' : v.visitType === 'CHEMIST' ? 'Pharmacy' : v.visitType || 'Doctor',
      specialty: v.specialty || '',
      clinic: v.clinicName || v.clinic || '',
      checkInTime: formatIsoToTime(v.checkInTime),
      checkInCoords: inCoords,
      checkOutTime: formatIsoToTime(v.checkOutTime),
      checkOutCoords: outCoords,
      status: v.status === 'CHECKED_IN' ? 'ACTIVE' : 'COMPLETED',
      products: v.productsDiscussed || v.products || '',
      samples: v.samplesGiven || v.samples || '',
      feedback: v.feedback || '',
      checkInPhoto: v.checkInPhoto || v.selfie || null
    };
  };

  // Find the details of the selected MR profile
  const selectedMrProfile = useMemo(() => {
    return mrList.find(mr => String(mr.id) === selectedMrId || String(mr.employeeId) === selectedMrId) || { fullName: 'Representative' };
  }, [mrList, selectedMrId]);

  const punchRecord = useMemo(() => {
    return teamAttendance.find((a) => {
      const logMrId = String(a.mrId || a.employeeId || '');
      const targetMrId = String(selectedMrId);
      const matchesMrId = logMrId === targetMrId;
      const matchesProfileId = selectedMrProfile?.id && logMrId === String(selectedMrProfile.id);
      const matchesProfileEmployeeId = selectedMrProfile?.employeeId && logMrId === String(selectedMrProfile.employeeId);
      return (matchesMrId || matchesProfileId || matchesProfileEmployeeId) && 
             a.punchInTime && isSameCalendarDay(a.punchInTime, selectedDate);
    });
  }, [teamAttendance, selectedMrId, selectedMrProfile, selectedDate]);

  const visitsForMrAndDate = useMemo(() => {
    return teamVisits.filter((v) => {
      const logMrId = String(v.mrId || v.employeeId || '');
      const targetMrId = String(selectedMrId);
      const matchesMrId = logMrId === targetMrId;
      const matchesProfileId = selectedMrProfile?.id && logMrId === String(selectedMrProfile.id);
      const matchesProfileEmployeeId = selectedMrProfile?.employeeId && logMrId === String(selectedMrProfile.employeeId);
      return (matchesMrId || matchesProfileId || matchesProfileEmployeeId) && 
             v.checkInTime && isSameCalendarDay(v.checkInTime, selectedDate);
    });
  }, [teamVisits, selectedMrId, selectedMrProfile, selectedDate]);

  const targetRecord = useMemo(() => {
    if (!punchRecord) return null;
    const startCoords = parseCoord(punchRecord.punchInLatitude, punchRecord.punchInLongitude);
    const endCoords   = punchRecord.punchOutTime
      ? parseCoord(punchRecord.punchOutLatitude, punchRecord.punchOutLongitude)
      : null;
    return {
      id: punchRecord.id,
      mrId: selectedMrId,
      mrName: selectedMrProfile?.fullName || selectedMrProfile?.name || punchRecord.mrName || 'Representative',
      date: selectedDate,
      status: (punchRecord.punchInTime && !punchRecord.punchOutTime) ? 'ACTIVE' : (punchRecord.punchInTime && punchRecord.punchOutTime) ? 'ENDED' : 'OFFLINE',
      startTime: formatIsoToTime(punchRecord.punchInTime),
      startLocation: startCoords
        ? { ...startCoords, name: punchRecord.punchInRemarks || 'GPS Verified' }
        : null,
      endTime: formatIsoToTime(punchRecord.punchOutTime),
      endLocation: endCoords
        ? { ...endCoords, name: punchRecord.punchOutRemarks || 'GPS Verified' }
        : null,
      visits: visitsForMrAndDate.map(mapVisitFromApi),
      startSelfie: punchRecord.startSelfie || null
    };
  }, [punchRecord, visitsForMrAndDate, selectedMrId, selectedMrProfile, selectedDate]);

  const updateMapLayer = (rec) => {
    if (!mapInstanceRef.current) return;

    // 1. Remove old markers and lines
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (routeLineRef.current) {
      routeLineRef.current.remove();
    routeLineRef.current = null;
    }

    // 2. Select target record
    if (!rec) {
      mapInstanceRef.current.setView([12.9716, 77.5946], 13);
      return;
    }

    const pathCoordinates = [];

    // Custom Icon helper using L.divIcon to avoid base64 data-URL rendering issues in browsers
    const getCustomIcon = (color, width = 32, height = 32, isPulse = false) => {
      return L.divIcon({
        html: `
          <div style="position: relative; width: ${width}px; height: ${height}px; display: flex; align-items: center; justify-content: center;">
            ${isPulse ? `
              <div style="
                position: absolute;
                width: ${width + 12}px;
                height: ${height + 12}px;
                border-radius: 50%;
                background-color: ${color};
                opacity: 0.4;
                animation: pin-pulse 1.8s infinite ease-in-out;
                top: -6px;
                left: -6px;
                pointer-events: none;
              "></div>
            ` : ''}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${width}" height="${height}" style="position: relative; z-index: 10; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
              <path fill="${color}" stroke="#FFFFFF" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `,
        className: 'custom-leaflet-icon-container',
        iconSize: [width, height],
        iconAnchor: [width / 2, height],
        popupAnchor: [0, -height]
      });
    };

    // Workday punch-in (Blue color: #3B82F6)
    if (rec.startLocation?.lat != null) {
      const p = rec.startLocation;
      pathCoordinates.push([p.lat, p.lng]);
      
      const startMarker = L.marker([p.lat, p.lng], {
        icon: getCustomIcon('#3B82F6', 36, 36)
      })
      .bindPopup(`<strong>Workday punch-in</strong><br/>Time: ${rec.startTime}`)
      .addTo(mapInstanceRef.current);

      markersRef.current.push(startMarker);
    }

    // Field visits (visit-in GPS)
    if (rec.visits && rec.visits.length > 0) {
      rec.visits.forEach(v => {
        if (v.checkInCoords?.lat != null) {
          pathCoordinates.push([v.checkInCoords.lat, v.checkInCoords.lng]);

          const isCompleted = v.status === 'COMPLETED';
          
          let imageTag = '';
          if (v.checkInPhoto) {
            imageTag = `<br/><img src="${v.checkInPhoto}" style="width:120px;height:80px;object-fit:cover;border-radius:6px;margin-top:6px;border:1px solid #E5E7EB"/>`;
          }

          const popupContent = `
            <div style="font-family:'Inter',sans-serif; font-size:12px; min-width:140px; max-width: 220px;">
              <strong style="color:${isCompleted ? '#059669' : '#EA580C'}">${v.type}: ${v.name}</strong><br/>
              <strong>Visit in:</strong> ${v.checkInTime}<br/>
              ${isCompleted ? `<strong>Visit out:</strong> ${v.checkOutTime || '—'}<br/><strong>Products:</strong> ${v.products || '—'}` : '<span style="color:#EA580C;font-weight:700;">Visit still open</span>'}
              ${imageTag}
            </div>
          `;

          // Active visits use Red (#EF4444) with pulsing glow, completed visits use Green (#10B981)
          const pinMarker = L.marker([v.checkInCoords.lat, v.checkInCoords.lng], {
            icon: getCustomIcon(isCompleted ? '#10B981' : '#EF4444', 32, 32, !isCompleted)
          })
          .bindPopup(popupContent)
          .addTo(mapInstanceRef.current);

          markersRef.current.push(pinMarker);

          // Render warning marker if completed check-out is remote (distance > 300 meters)
          if (isCompleted && v.checkOutCoords?.lat != null) {
            const distance = getLatLngDistanceMeters(
              v.checkInCoords.lat,
              v.checkInCoords.lng,
              v.checkOutCoords.lat,
              v.checkOutCoords.lng
            );

            if (distance > 300) {
              pathCoordinates.push([v.checkOutCoords.lat, v.checkOutCoords.lng]);

              const remoteMarker = L.marker([v.checkOutCoords.lat, v.checkOutCoords.lng], {
                icon: getCustomIcon('#F59E0B', 30, 30) // Amber color for remote out-of-bounds warning
              })
              .bindPopup(`
                <div style="font-family:'Inter',sans-serif; font-size:12px; line-height:1.4;">
                  <strong style="color:#D97706">⚠️ Remote Visit Out</strong><br/>
                  <strong>Name:</strong> ${v.name}<br/>
                  <strong>Time:</strong> ${v.checkOutTime}<br/>
                  <strong>Distance:</strong> ${Math.round(distance)}m away from check-in
                </div>
              `)
              .addTo(mapInstanceRef.current);

              markersRef.current.push(remoteMarker);
            }
          }
        }
      });
    }

    // Workday punch-out (Indigo color: #6366F1)
    if (rec.status === 'ENDED' && rec.endLocation?.lat != null) {
      const p = rec.endLocation;
      pathCoordinates.push([p.lat, p.lng]);

      const endMarker = L.marker([p.lat, p.lng], {
        icon: getCustomIcon('#6366F1', 36, 36)
      })
      .bindPopup(`<strong>Workday punch-out</strong><br/>Time: ${rec.endTime}`)
      .addTo(mapInstanceRef.current);

      markersRef.current.push(endMarker);
    }

    // Polyline route connector
    if (pathCoordinates.length > 1) {
      routeLineRef.current = L.polyline(pathCoordinates, {
        color: '#3B82F6',
        weight: 3,
        dashArray: '8, 8',
        opacity: 0.8
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.fitBounds(L.featureGroup(markersRef.current).getBounds(), {
        padding: [40, 40]
      });
    } else if (pathCoordinates.length === 1) {
      mapInstanceRef.current.setView(pathCoordinates[0], 14);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    mapInstanceRef.current = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 13,
      zoomControl: false,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(mapInstanceRef.current);
    L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
    // Force Leaflet to re-read container size after flex layout settles
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 120);

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) updateMapLayer(targetRecord);
  }, [targetRecord]);

  const visits = targetRecord?.visits || [];
  const uniqueVisitedTargets = useMemo(() => {
    const seen = new Set();
    const targets = [];
    visits.forEach(v => {
      const key = `${v.visitType || (v.type === 'Pharmacy' || v.type === 'CHEMIST' ? 'CHEMIST' : 'DOCTOR')}-${v.targetId}`;
      if (!seen.has(key)) {
        seen.add(key);
        targets.push({
          targetId: v.targetId,
          visitType: v.visitType || (v.type === 'Pharmacy' || v.type === 'CHEMIST' ? 'CHEMIST' : 'DOCTOR'),
          name: v.name,
          type: v.type
        });
      }
    });
    return targets;
  }, [visits]);

  const openVisit = visits.find((v) => v.status === 'ACTIVE');
  const completedVisits = visits.filter(v => v.status === 'COMPLETED').length;

  const statusLabel = targetRecord
    ? (targetRecord.status === 'ACTIVE'
        ? openVisit
          ? `On duty · visit open at ${openVisit.name}`
          : 'On duty · no open visit'
        : targetRecord.status === 'ENDED'
          ? 'Workday finished'
          : 'Off duty')
    : 'No workday on this date';

  return (
    <div className="animate-[fadeSlideIn_0.35s_ease-out] flex flex-col h-[calc(100vh-104px)] min-h-0 overflow-hidden">
      
      {/* Date Filter & Actions Bar */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          {/* Left spacer / placeholder */}
        </div>
        <div className="flex items-center gap-3">
          {/* MR Dropdown Selector */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.5px]">Representative:</span>
            {teamLoading ? (
              <span className="text-[12px] text-gray-400">Loading...</span>
            ) : mrList.length === 0 ? (
              <span className="text-[12px] text-red-500 font-bold">No MRs</span>
            ) : (
              <select
                value={selectedMrId}
                onChange={(e) => setSelectedMrId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-[13px] bg-gray-50 font-bold text-gray-800 cursor-pointer outline-none font-sans"
              >
                {mrList.map(mr => (
                  <option key={mr.id} value={String(mr.id)}>
                    👨‍💼 {mr.fullName || mr.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
            <Calendar size={15} className="text-gray-500" />
            <span className="text-[12px] font-bold text-gray-600 uppercase tracking-[0.5px]">Select Date:</span>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(e.target.value);
              }}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-[13px] bg-gray-50 font-bold text-gray-800 cursor-pointer outline-none font-sans"
            />
          </div>

          {/* Doctor Dropdown Selector */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.5px]">Doctor/Pharmacy:</span>
            <select
              value={selectedDoctorKey}
              onChange={(e) => setSelectedDoctorKey(e.target.value)}
              disabled={uniqueVisitedTargets.length === 0}
              className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-[13px] bg-gray-50 font-bold text-gray-800 cursor-pointer outline-none font-sans disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {uniqueVisitedTargets.length === 0 ? 'No visits on this date' : 'Select Doctor/Pharmacy...'}
              </option>
              {uniqueVisitedTargets.map(t => (
                <option key={`${t.visitType}-${t.targetId}`} value={`${t.visitType}-${t.targetId}`}>
                  {t.visitType === 'CHEMIST' || t.type === 'Pharmacy' ? '🧪' : '🩺'} {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* View History Button */}
          <button
            onClick={() => {
              const selectedTarget = uniqueVisitedTargets.find(t => `${t.visitType}-${t.targetId}` === selectedDoctorKey);
              if (selectedTarget) {
                setHistoryTarget({
                  id: selectedTarget.targetId,
                  name: selectedTarget.name,
                  type: selectedTarget.type || (selectedTarget.visitType === 'CHEMIST' ? 'Pharmacy' : 'Doctor'),
                  mrId: selectedMrId
                });
              }
            }}
            disabled={!selectedDoctorKey}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[12.5px] rounded-xl transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
          >
            View History
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center justify-center w-[38px] h-[38px] bg-[#111827] text-white hover:bg-black font-extrabold rounded-xl transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Daily Stats Ribbon */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-4 shrink-0">
        {/* Card 1: Status */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div 
            className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center text-[18px] ${
              targetRecord?.status === 'ACTIVE' ? 'bg-[#ECFDF5]' : targetRecord?.status === 'ENDED' ? 'bg-[#EFF6FF]' : 'bg-[#FEF2F2]'
            }`}
          >
            {targetRecord?.status === 'ACTIVE' ? '🟢' : targetRecord?.status === 'ENDED' ? '🏁' : '🛑'}
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5px]">Status</div>
            <div className="text-[13.5px] font-extrabold text-gray-800">{statusLabel}</div>
          </div>
        </div>

        {/* Card 2: Start Time */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="w-[38px] h-[38px] rounded-xl bg-[#F59E0B15] flex items-center justify-center text-[#D97706]">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5px]">Punch in</div>
            <div className="text-[13.5px] font-extrabold text-gray-800">{targetRecord?.startTime || '—'}</div>
          </div>
        </div>

        {/* Card 3: End Time */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="w-[38px] h-[38px] rounded-xl bg-[#3B82F615] flex items-center justify-center text-[#2563EB]">
            <Square size={16} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5px]">Punch out</div>
            <div className="text-[13.5px] font-extrabold text-gray-800">
              {targetRecord?.status === 'ACTIVE' ? 'Active Duty' : targetRecord?.endTime || '—'}
            </div>
          </div>
        </div>

        {/* Card 4: Completed Visits */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="w-[38px] h-[38px] rounded-xl bg-[#10B98115] flex items-center justify-center text-[#059669]">
            <MapPin size={18} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5px]">Visits</div>
            <div className="text-[13.5px] font-extrabold text-gray-800">
              {completedVisits} done{openVisit ? ' · 1 open' : ''}{visits.length === 0 ? '' : ` / ${visits.length}`}
            </div>
          </div>
        </div>
      </div>

      {/* Split Layout grid */}
      <div className="grid grid-cols-[1.2fr_1fr] gap-6 flex-1 min-h-0 overflow-hidden mb-1">
        
        {/* LEFT COLUMN: Map container */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col min-h-0 h-full">
          {/* Map Title block */}
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
            <div>
              <h3 className="text-[14.5px] font-extrabold text-gray-900 m-0">Route map</h3>
              <span className="text-[11.5px] text-gray-400">Punch-in → visits → punch-out</span>
            </div>
          </div>

          {/* Actual Leaflet Container */}
          <div 
            ref={mapContainerRef} 
            className="w-full bg-[#FAFAFA] z-10 flex-1 min-h-0"
            style={{ height: '100%' }}
          />
          
          {/* Map Legend */}
          <div className="px-5 py-4 border-t border-gray-100 bg-[#FAFAFA] flex gap-5 flex-wrap text-[11.5px] font-semibold text-gray-655 shrink-0">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /> Punch In</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" /> Punch Out</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Visit Completed</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Remote Visit Out</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Visit Open (Active)</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Chronological Timeline */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col min-h-0 h-full">
          <div className="border-b border-gray-100 pb-3.5 mb-4 shrink-0">
            <h3 className="text-[15px] font-extrabold text-gray-900 m-0">Day timeline</h3>
            <span className="text-[12px] text-gray-400">Workday and field visits</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 pl-2">
            {!targetRecord ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                <Calendar size={28} className="mb-2.5 text-gray-400" />
                <div className="text-[14px] font-bold text-gray-600">No workday on this date</div>
                <div className="text-[12px] text-gray-400 mt-1 max-w-[240px]">No punch-in record logged for this representative on the selected date.</div>
              </div>
            ) : (
              <div className="relative border-l-2 border-dashed border-gray-200 ml-3 pl-6 py-2">
                
                {/* 1. START WORKDAY NODE */}
                <div className="relative mb-6">
                  <div className="absolute left-[-31px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_0_3px_rgba(59,130,246,0.15)]" />
                  
                  <div className="bg-[#F8FAFC] rounded-xl border border-gray-200 p-3 px-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1E40AF]">PUNCH IN</span>
                      <span className="text-[11px] text-gray-400 font-semibold">{targetRecord.startTime}</span>
                    </div>
                    <div className="text-[13px] font-extrabold text-gray-800">Workday started</div>
                    {targetRecord.startLocation?.lat != null && (
                      <div className="text-[11px] text-gray-500 mt-0.5">GPS recorded on map</div>
                    )}
                    {targetRecord.startSelfie && (
                      <div className="mt-2">
                        <img src={targetRecord.startSelfie} alt="Start Selfie" className="w-[60px] h-[60px] rounded-lg object-cover border border-gray-200 cursor-pointer" onClick={() => window.open(targetRecord.startSelfie, '_blank')} />
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. VISITS TIMELINE NODES */}
                {visits.length === 0 ? (
                  <div className="p-4 bg-[#FAFAFA] rounded-xl border border-dashed border-gray-200 text-gray-400 text-[12px] text-center mb-6">
                    No field visits logged on this date.
                  </div>
                ) : (
                  visits.map((v, idx) => {
                    const isCompleted = v.status === 'COMPLETED';
                    const visitDistance = isCompleted && v.checkInCoords?.lat != null && v.checkOutCoords?.lat != null
                      ? getLatLngDistanceMeters(v.checkInCoords.lat, v.checkInCoords.lng, v.checkOutCoords.lat, v.checkOutCoords.lng)
                      : 0;
                    const isRemoteCheckout = isCompleted && visitDistance > 300;

                    return (
                      <div key={v.id || idx} className="relative mb-6">
                        {/* Dot indicator */}
                        <div 
                          className={`absolute left-[-31px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                            isRemoteCheckout
                              ? 'bg-[#F59E0B] shadow-[0_0_0_3px_rgba(245,158,11,0.15)]'
                              : isCompleted
                                ? 'bg-[#10B981] shadow-[0_0_0_3px_rgba(16,185,129,0.15)]'
                                : 'bg-[#EF4444] shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
                          }`}
                        />
                        
                        {/* Single Unified Card */}
                        <div 
                          className={`rounded-xl px-[18px] py-3.5 shadow-[0_2px_6px_rgba(0,0,0,0.01)] border ${
                            isCompleted ? 'bg-[#FCFDFD] border-[#E5E7EB]' : 'bg-[#FFFEFA] border-[#FCD34D]'
                          }`}
                        >
                          {/* Visit Card Header */}
                          <div className="flex justify-between items-start border-b border-gray-100 pb-2 mb-2.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span 
                                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                                    isCompleted ? 'bg-[#ECFDF5] text-[#065F46]' : 'bg-[#FFFBEB] text-[#92400E]'
                                  }`}
                                >
                                  {v.type || 'Visit'}
                                </span>
                                {isCompleted ? (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1E40AF]">
                                    COMPLETED
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#FEF2F2] text-[#B91C1C] animate-pulse">
                                    VISIT OPEN
                                  </span>
                                )}
                              </div>
                              <h4 className="text-[14.5px] font-extrabold text-gray-800 mt-1 mb-0.5">{v.name}</h4>
                              {v.specialty && <div className="text-[11.5px] text-gray-500">{v.specialty}</div>}
                              <button
                                onClick={() => setHistoryTarget({ id: v.targetId || v.id, name: v.name, type: v.type, mrId: selectedMrId })}
                                className="mt-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-650 hover:text-slate-800 text-[10.5px] font-bold inline-flex items-center gap-1 border-none cursor-pointer transition-all active:scale-95"
                              >
                                🔍 View History
                              </button>
                            </div>
                            <span className="text-[16px]">{v.type === 'Pharmacy' ? '🧪' : '🩺'}</span>
                          </div>

                          {/* Check-In Section */}
                          <div className={isCompleted ? "mb-3" : "mb-0"}>
                            <div className="flex justify-between text-[11px] text-gray-650 font-bold mb-1 items-center font-sans">
                              <span className="flex items-center gap-1.5">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-[#10B981]' : 'bg-[#EF4444] animate-pulse'}`} />
                                📥 VISIT IN
                              </span>
                              <span>{v.checkInTime}</span>
                            </div>
                            {v.checkInPhoto && (
                              <div className="mt-2">
                                <img src={v.checkInPhoto} alt="Check-In Place" className="w-[80px] h-[60px] object-cover rounded border border-gray-200 cursor-pointer" onClick={() => window.open(v.checkInPhoto, '_blank')} />
                              </div>
                            )}
                          </div>

                          {/* Check-Out Section (displays inside the same card if completed) */}
                          {isCompleted && (
                            <div className="border-t border-dashed border-gray-250 pt-2.5 mt-2.5">
                              <div className={`flex justify-between text-[11px] font-bold mb-1.5 items-center font-sans ${isRemoteCheckout ? 'text-amber-700' : 'text-emerald-700'}`}>
                                <span className="flex items-center gap-1.5">
                                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${isRemoteCheckout ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`} />
                                  📤 VISIT OUT
                                  {isRemoteCheckout && (
                                    <span className="text-[9px] text-amber-700 font-extrabold px-1.5 py-0.5 rounded bg-amber-50 uppercase border border-amber-200 ml-2">
                                      Remote ({Math.round(visitDistance)}m)
                                    </span>
                                  )}
                                </span>
                                <span>{v.checkOutTime}</span>
                              </div>
                              <div className="flex flex-col gap-1 text-[12px] text-gray-700">
                                <div>💊 <strong>Brands Promoted:</strong> {v.products}</div>
                                <div>🧪 <strong>Samples Distributed:</strong> {v.samples || 'None'}</div>
                                <div className="bg-[#ECFDF5] px-2.5 py-1.5 rounded border border-[#D1FAE5] text-[#065F46] mt-1">
                                  📝 <strong>Feedback Summary:</strong> "{v.feedback}"
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* 3. END WORKDAY NODE */}
                {targetRecord.status === 'ENDED' ? (
                  <div className="relative mb-2">
                    <div className="absolute left-[-31px] top-1 w-3 h-3 rounded-full bg-[#6366F1] border-2 border-white shadow-[0_0_0_3px_rgba(99,102,241,0.15)]" />
                    
                    <div className="bg-[#F8FAFC] rounded-xl border border-gray-300 p-3 px-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569]">PUNCH OUT</span>
                        <span className="text-[11px] text-gray-400 font-semibold">{targetRecord.endTime}</span>
                      </div>
                      <div className="text-[13px] font-extrabold text-gray-800">Workday ended</div>
                      <div className="text-[12px] text-gray-500 mt-0.5">Punch-out at {targetRecord.endTime}</div>
                    </div>
                  </div>
                ) : (
                  <div className="relative mb-2">
                    <div className="absolute left-[-31px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-ping" />
                    <div className="absolute left-[-31px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    
                    <div className="bg-[#ECFDF5] rounded-xl border border-dashed border-[#A7F3D0] p-3 px-4 text-[#065F46]">
                      <div className="text-[12px] font-bold">🟢 Workday still active</div>
                      <div className="text-[11.5px] text-[#047857] mt-0.5">
                        {openVisit
                          ? `Finish visit at ${openVisit.name}, then punch out on the dashboard.`
                          : 'Punch out on the dashboard when workday is done.'}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

      </div>

      {historyTarget && (
        <VisitHistoryModal
          target={historyTarget}
          mrName={selectedMrProfile?.fullName || 'Representative'}
          onClose={() => setHistoryTarget(null)}
        />
      )}

      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

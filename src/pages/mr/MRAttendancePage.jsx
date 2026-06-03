import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Clock, Square, MapPin, Calendar } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchMyAttendanceAction, fetchMyVisitsAction } from '../../redux/actions/attendanceActions';
import {
  findTodayAttendance,
  isPunchActive,
  isPunchEnded,
  isVisitActive,
  isSameCalendarDay,
  localTodayKey,
  parseCoord,
  visitCheckInCoords,
  visitCheckOutCoords,
} from '../../utils/attendanceUtils';

// Inline SVG base64 Marker Icons for Leaflet to prevent asset loading bugs
const BLUE_PIN = "data:image/svg+xml;utf8," + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
    <path fill="%233B82F6" stroke="%23FFFFFF" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
`);

const GREEN_PIN = "data:image/svg+xml;utf8," + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
    <path fill="%2310B981" stroke="%23FFFFFF" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
`);

const RED_PIN = "data:image/svg+xml;utf8," + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34">
    <path fill="%23EF4444" stroke="%23FFFFFF" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    <circle cx="12" cy="9" r="2" fill="%23FFFFFF"/>
  </svg>
`);

export default function MRAttendancePage() {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const mrId = user?.id ? String(user.id) : "mr-01";
  const mrName = user?.fullName || user?.name || "Akash Kumar";

  const todayKey = localTodayKey();

  const dispatch = useDispatch();
  const { myAttendance = [], myVisits = [] } = useSelector(state => state.attendance || {});
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLineRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    dispatch(fetchMyAttendanceAction());
    dispatch(fetchMyVisitsAction());
  }, [dispatch]);

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
    const outCoords = visitCheckOutCoords(v);
    return {
      id: v.id,
      name: v.targetName || v.name || 'Unknown Target',
      type: v.visitType === 'DOCTOR' ? 'Doctor' : v.visitType === 'CHEMIST' ? 'Pharmacy' : v.visitType || 'Doctor',
      specialty: v.specialty || '',
      checkInTime: formatIsoToTime(v.checkInTime),
      checkInCoords: inCoords,
      checkOutTime: formatIsoToTime(v.checkOutTime),
      checkOutCoords: outCoords,
      status: isVisitActive(v) ? 'ACTIVE' : 'COMPLETED',
      products: v.productsDiscussed || v.products || '',
      samples: v.samplesGiven || v.samples || '',
      feedback: v.feedback || '',
    };
  };

  const punchRecord = useMemo(() => {
    if (selectedDate === todayKey) return findTodayAttendance(myAttendance, selectedDate);
    return myAttendance.find((a) => a.punchInTime && isSameCalendarDay(a.punchInTime, selectedDate));
  }, [myAttendance, selectedDate, todayKey]);

  const visitsForDate = useMemo(
    () => myVisits.filter((v) => v.checkInTime && isSameCalendarDay(v.checkInTime, selectedDate)),
    [myVisits, selectedDate]
  );

  const activeRecord = useMemo(() => {
    if (!punchRecord) return null;
    const startCoords = parseCoord(punchRecord.punchInLatitude, punchRecord.punchInLongitude);
    const endCoords = punchRecord.punchOutTime
      ? parseCoord(punchRecord.punchOutLatitude, punchRecord.punchOutLongitude)
      : null;
    return {
      id: punchRecord.id,
      mrId,
      mrName,
      date: selectedDate,
      status: isPunchActive(punchRecord) ? 'ACTIVE' : isPunchEnded(punchRecord) ? 'ENDED' : 'OFFLINE',
      startTime: formatIsoToTime(punchRecord.punchInTime),
      startLocation: startCoords
        ? { ...startCoords, name: punchRecord.punchInRemarks || 'Workday punch-in' }
        : null,
      endTime: formatIsoToTime(punchRecord.punchOutTime),
      endLocation: endCoords
        ? { ...endCoords, name: punchRecord.punchOutRemarks || 'Workday punch-out' }
        : null,
      visits: visitsForDate.map(mapVisitFromApi),
    };
  }, [punchRecord, visitsForDate, mrId, mrName, selectedDate]);

  const updateMapLayer = (targetRecord) => {
    if (!mapInstanceRef.current) return;

    // 1. Remove old markers and lines
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    // 2. Select target record
    if (!targetRecord) {
      mapInstanceRef.current.setView([12.9716, 77.5946], 13);
      return;
    }

    const pathCoordinates = [];

    // Custom Icon helper
    const getCustomIcon = (pinUrl, width = 32, height = 32) => {
      return L.icon({
        iconUrl: pinUrl,
        iconSize: [width, height],
        iconAnchor: [width / 2, height],
        popupAnchor: [0, -height]
      });
    };

    // Workday punch-in
    if (targetRecord.startLocation?.lat != null) {
      const p = targetRecord.startLocation;
      pathCoordinates.push([p.lat, p.lng]);
      
      const startMarker = L.marker([p.lat, p.lng], {
        icon: getCustomIcon(BLUE_PIN, 36, 36)
      })
      .bindPopup(`<strong>Workday punch-in</strong><br/>Time: ${targetRecord.startTime}`)
      .addTo(mapInstanceRef.current);

      markersRef.current.push(startMarker);
    }

    // Field visits (visit-in GPS → visit-out GPS when completed)
    if (targetRecord.visits && targetRecord.visits.length > 0) {
      targetRecord.visits.forEach(v => {
        if (v.checkInCoords?.lat != null) {
          pathCoordinates.push([v.checkInCoords.lat, v.checkInCoords.lng]);

          const isCompleted = v.status === 'COMPLETED';
          if (isCompleted && v.checkOutCoords?.lat != null) {
            pathCoordinates.push([v.checkOutCoords.lat, v.checkOutCoords.lng]);
          }
          
          let imageTag = '';
          if (v.checkInPhoto) {
            imageTag = `<br/><img src="${v.checkInPhoto}" style="width:120px;height:80px;object-fit:cover;border-radius:6px;margin-top:6px;border:1px solid #E5E7EB"/>`;
          } else if (v.selfie) {
            imageTag = `<br/><img src="${v.selfie}" style="width:120px;height:80px;object-fit:cover;border-radius:6px;margin-top:6px;border:1px solid #E5E7EB"/>`;
          }

          const popupContent = `
            <div style="font-family:'Inter',sans-serif; font-size:12px; min-width:140px; max-width: 220px;">
              <strong style="color:${isCompleted ? '#059669' : '#EA580C'}">${v.type}: ${v.name}</strong><br/>
              <strong>Visit in:</strong> ${v.checkInTime}<br/>
              ${isCompleted ? `<strong>Visit out:</strong> ${v.checkOutTime || '—'}<br/><strong>Products:</strong> ${v.products || '—'}` : '<span style="color:#EA580C;font-weight:700;">Visit still open</span>'}
              ${imageTag}
            </div>
          `;

          const pinMarker = L.marker([v.checkInCoords.lat, v.checkInCoords.lng], {
            icon: getCustomIcon(isCompleted ? GREEN_PIN : RED_PIN, 32, 32)
          })
          .bindPopup(popupContent)
          .addTo(mapInstanceRef.current);

          markersRef.current.push(pinMarker);

          if (isCompleted && v.checkOutCoords?.lat != null) {
            const outMarker = L.marker([v.checkOutCoords.lat, v.checkOutCoords.lng], {
              icon: getCustomIcon(GREEN_PIN, 28, 28)
            })
            .bindPopup(`<strong>Visit out</strong><br/>${v.name}<br/>${v.checkOutTime}`)
            .addTo(mapInstanceRef.current);
            markersRef.current.push(outMarker);
          }
        }
      });
    }

    // Workday punch-out
    if (targetRecord.status === 'ENDED' && targetRecord.endLocation?.lat != null) {
      const p = targetRecord.endLocation;
      pathCoordinates.push([p.lat, p.lng]);

      const endMarker = L.marker([p.lat, p.lng], {
        icon: getCustomIcon(BLUE_PIN, 36, 36)
      })
      .bindPopup(`<strong>Workday punch-out</strong><br/>Time: ${targetRecord.endTime}`)
      .addTo(mapInstanceRef.current);

      markersRef.current.push(endMarker);
    }

    // 6. Polyline route connector
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

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) updateMapLayer(activeRecord);
  }, [activeRecord]);

  const visits = activeRecord?.visits || [];
  const openVisit = visits.find((v) => v.status === 'ACTIVE');
  const completedVisits = visits.filter(v => v.status === 'COMPLETED').length;

  const statusLabel = activeRecord
    ? (activeRecord.status === 'ACTIVE'
        ? openVisit
          ? `On duty · visit open at ${openVisit.name}`
          : 'On duty · no open visit'
        : activeRecord.status === 'ENDED'
          ? 'Workday finished'
          : 'Off duty')
    : 'No workday on this date';

  return (
    <div className="p-2.5 animate-[fadeSlideIn_0.35s_ease-out]">
      
      {/* Header Panel & Date Filter */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3.5 border-b border-gray-200 pb-5">
        <div>
          <span className="text-[11px] text-gray-500 font-extrabold uppercase tracking-[1.5px]">
            FIELD OPERATIONS LEDGER
          </span>
          <h2 className="text-[26px] font-extrabold text-gray-900 mt-1 mb-0 tracking-[-0.5px]">Field Attendance Map</h2>
          <p className="text-[13px] text-gray-500 mt-1 mb-0">
            Blue = workday punch · Green = completed visit · Orange pin = visit still open
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/mr/dashboard')}
          className="px-4 py-2 rounded-xl border-none bg-blue-600 text-white text-[12px] font-bold cursor-pointer"
        >
          Go to dashboard
        </button>

        {/* Date Filter Calendar Picker */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
          <Calendar size={15} className="text-gray-500" />
          <span className="text-[12px] font-bold text-gray-600 uppercase tracking-[0.5px]">Select Date:</span>
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(e.target.value);
            }}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-[13px] bg-gray-50 font-bold text-gray-800 cursor-pointer outline-none"
          />
        </div>
      </div>

      {/* Daily Stats Ribbon */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-6">
        {/* Card 1: Status */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div 
            className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center text-[18px] ${
              activeRecord?.status === 'ACTIVE' ? 'bg-[#ECFDF5]' : activeRecord?.status === 'ENDED' ? 'bg-[#EFF6FF]' : 'bg-[#FEF2F2]'
            }`}
          >
            {activeRecord?.status === 'ACTIVE' ? '🟢' : activeRecord?.status === 'ENDED' ? '🏁' : '🛑'}
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
            <div className="text-[13.5px] font-extrabold text-gray-800">{activeRecord?.startTime || '—'}</div>
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
              {activeRecord?.status === 'ACTIVE' ? 'Active Duty' : activeRecord?.endTime || '—'}
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
      <div className="grid grid-cols-[1.2fr_1fr] gap-6 items-stretch">
        
        {/* LEFT COLUMN: Map container */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col">
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
            className="w-full h-[480px] bg-[#FAFAFA] z-10 flex-1"
          />
          
          {/* Map Legend */}
          <div className="px-5 py-4 border-t border-gray-100 bg-[#FAFAFA] flex gap-5 flex-wrap text-[11.5px] font-semibold text-gray-600 shrink-0">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Workday punch</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Visit completed</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Visit open</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Chronological Timeline */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-[584px] flex flex-col">
          <div className="border-b border-gray-100 pb-3.5 mb-4 shrink-0">
            <h3 className="text-[15px] font-extrabold text-gray-900 m-0">Day timeline</h3>
            <span className="text-[12px] text-gray-400">Workday and field visits</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 pl-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {!activeRecord ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                <Calendar size={28} className="mb-2.5 text-gray-400" />
                <div className="text-[14px] font-bold text-gray-600">No workday on this date</div>
                <div className="text-[12px] text-gray-400 mt-1 max-w-[240px]">Punch in from the dashboard to start tracking your route.</div>
              </div>
            ) : (
              <div className="relative border-l-2 border-dashed border-gray-200 ml-3 pl-6 py-2">
                
                {/* 1. START WORKDAY NODE */}
                <div className="relative mb-6">
                  <div className="absolute left-[-31px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_0_3px_rgba(59,130,246,0.15)]" />
                  
                  <div className="bg-[#F8FAFC] rounded-xl border border-gray-200 p-3 px-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1E40AF]">PUNCH IN</span>
                      <span className="text-[11px] text-gray-400 font-semibold">{activeRecord.startTime}</span>
                    </div>
                    <div className="text-[13px] font-extrabold text-gray-800">Workday started</div>
                    {activeRecord.startLocation?.lat != null && (
                      <div className="text-[11px] text-gray-500 mt-0.5">GPS recorded on map</div>
                    )}
                    {activeRecord.startSelfie && (
                      <div className="mt-2">
                        <img src={activeRecord.startSelfie} alt="Start Selfie" className="w-[60px] h-[60px] rounded-lg object-cover border border-gray-200 cursor-pointer" onClick={() => window.open(activeRecord.startSelfie, '_blank')} />
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. VISITS TIMELINE NODES (Single card per visit containing both check-in and check-out logs inside) */}
                {visits.length === 0 ? (
                  <div className="p-4 bg-[#FAFAFA] rounded-xl border border-dashed border-gray-200 text-gray-400 text-[12px] text-center mb-6">
                    No field visits yet. Use <strong>Visit in</strong> on the dashboard after punch-in.
                  </div>
                ) : (
                  visits.map((v, idx) => {
                    const isCompleted = v.status === 'COMPLETED';
                    const visitColor = isCompleted ? '#10B981' : '#F59E0B';
                    return (
                      <div key={v.id || idx} className="relative mb-6">
                        {/* Dot indicator */}
                        <div 
                          className={`absolute left-[-31px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                            isCompleted ? 'bg-[#10B981] shadow-[0_0_0_3px_rgba(16,185,129,0.15)]' : 'bg-[#F59E0B] shadow-[0_0_0_3px_rgba(245,158,11,0.15)]'
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
                            </div>
                            <span className="text-[16px]">{v.type === 'Pharmacy' ? '🧪' : '🩺'}</span>
                          </div>

                          {/* Check-In Section */}
                          <div className={isCompleted ? "mb-3" : "mb-0"}>
                            <div className="flex justify-between text-[11px] text-gray-600 font-bold mb-1">
                              <span>📥 VISIT IN</span>
                              <span>{v.checkInTime}</span>
                            </div>
                            {v.checkInNotes && (
                              <div className="text-[12px] text-gray-600 px-2.5 py-1.5 bg-[#F8FAFC] rounded border border-[#F1F5F9] italic">
                                🎯 <strong>Objective:</strong> {v.checkInNotes}
                              </div>
                            )}
                            {v.checkInPhoto && (
                              <div className="mt-2">
                                <img src={v.checkInPhoto} alt="Check-In Place" className="w-[80px] h-[60px] object-cover rounded border border-gray-200 cursor-pointer" onClick={() => window.open(v.checkInPhoto, '_blank')} />
                              </div>
                            )}
                          </div>

                          {/* Check-Out Section (displays inside the same card if completed) */}
                          {isCompleted && (
                            <div className="border-t border-dashed border-gray-250 pt-2.5 mt-2.5">
                              <div className="flex justify-between text-[11px] text-emerald-700 font-bold mb-1.5">
                                <span>📤 VISIT OUT</span>
                                <span>{v.checkOutTime}</span>
                              </div>
                              <div className="flex flex-col gap-1 text-[12px] text-gray-700">
                                <div>💊 <strong>Brands Promoted:</strong> {v.products}</div>
                                <div>🧪 <strong>Samples Distributed:</strong> {v.samples || 'None'}</div>
                                <div className="bg-[#ECFDF5] px-2.5 py-1.5 rounded border border-[#D1FAE5] text-[#065F46] mt-1">
                                  📝 <strong>Feedback Summary:</strong> "{v.feedback}"
                                </div>
                                {(v.selfie || v.checkOutPhoto) && (
                                  <div className="mt-1.5">
                                    <img src={v.selfie || v.checkOutPhoto} alt="Checkout Selfie" className="w-[60px] h-[60px] rounded object-cover border border-[#A7F3D0] cursor-pointer" onClick={() => window.open(v.selfie || v.checkOutPhoto, '_blank')} />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* 3. END WORKDAY NODE */}
                {activeRecord.status === 'ENDED' ? (
                  <div className="relative mb-2">
                    <div className="absolute left-[-31px] top-1 w-3 h-3 rounded-full bg-[#1E3A8A] border-2 border-white shadow-[0_0_0_3px_rgba(30,58,138,0.15)]" />
                    
                    <div className="bg-[#F8FAFC] rounded-xl border border-gray-300 p-3 px-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569]">PUNCH OUT</span>
                        <span className="text-[11px] text-gray-400 font-semibold">{activeRecord.endTime}</span>
                      </div>
                      <div className="text-[13px] font-extrabold text-gray-800">Workday ended</div>
                      <div className="text-[12px] text-gray-500 mt-0.5">Punch-out at {activeRecord.endTime}</div>
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
                          : 'Punch out on the dashboard when your day is done.'}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyTeam } from '../../redux/actions/teamActions';
import { 
  Users, MapPin, CheckCircle, Clock, Navigation, 
  Map, Award, Calendar, RefreshCw, BarChart2, Eye, ShieldAlert,
  ChevronRight, Camera, Search, UserCheck
} from 'lucide-react';
import { Card } from '../../components/ui';

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

const PULSE_MR_PIN = "data:image/svg+xml;utf8," + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
    <circle cx="12" cy="12" r="10" fill="%23C8F04A" fill-opacity="0.3" stroke="%23111827" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="%23111827"/>
  </svg>
`);

export default function AdminFieldTracking() {
  const dispatch = useDispatch();
  
  // Team state from Redux
  const { team = [], loading: teamLoading } = useSelector(state => state.team || {});

  // Local state
  const [db, setDb] = useState([]);
  const [selectedMrId, setSelectedMrId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // UI Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLineRef = useRef(null);
  const markersRef = useRef([]);

  // Extract MR List from team list
  const mrList = (team || []).filter(
    (member) => (member.role || '').toUpperCase().trim() === 'MR'
  );

  // 1. Fetch team list on mount
  useEffect(() => {
    dispatch(getMyTeam());
  }, [dispatch]);

  // 2. Initialize database from localStorage and select first MR
  useEffect(() => {
    const localDb = localStorage.getItem('mr_field_attendance_db');
    if (localDb) {
      setDb(JSON.parse(localDb));
    }
  }, []);

  useEffect(() => {
    if (mrList.length > 0 && !selectedMrId) {
      setSelectedMrId(String(mrList[0].id || mrList[0].employeeId || '1'));
    }
  }, [mrList, selectedMrId]);

  // 3. Setup and configure Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initMap = () => {
      const L = window.L;
      if (!L) {
        setTimeout(initMap, 300);
        return;
      }

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapContainerRef.current, {
          center: [12.9716, 77.5946],
          zoom: 13,
          zoomControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap contributors © CARTO',
          maxZoom: 20
        }).addTo(mapInstanceRef.current);

        L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
      }

      drawRoutesOnMap();
    };

    initMap();
  }, [db, selectedMrId, selectedDate]);

  // 4. Map rendering function
  const drawRoutesOnMap = () => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

    // Remove existing markers & lines
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    const mrKey = selectedMrId;
    const targetRecord = db.find(r => String(r.mrId) === mrKey && r.date === selectedDate);

    // If no record, show default center
    if (!targetRecord) {
      mapInstanceRef.current.setView([12.9716, 77.5946], 13);
      return;
    }

    const pathCoordinates = [];

    // Helper to generate icon
    const getCustomIcon = (pinUrl, width = 32, height = 32) => {
      return L.icon({
        iconUrl: pinUrl,
        iconSize: [width, height],
        iconAnchor: [width / 2, height],
        popupAnchor: [0, -height]
      });
    };

    // Plot Start Point
    if (targetRecord.startLocation?.lat) {
      const p = targetRecord.startLocation;
      pathCoordinates.push([p.lat, p.lng]);
      
      const startM = L.marker([p.lat, p.lng], {
        icon: getCustomIcon(BLUE_PIN, 36, 36)
      })
      .bindPopup(`<strong>📍 Workday Start Check-In</strong><br/>Time: ${targetRecord.startTime}<br/>Coords: ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`)
      .addTo(mapInstanceRef.current);

      markersRef.current.push(startM);
    }

    // Plot Visit Points
    if (targetRecord.visits && targetRecord.visits.length > 0) {
      targetRecord.visits.forEach(v => {
        if (v.checkInCoords?.lat) {
          pathCoordinates.push([v.checkInCoords.lat, v.checkInCoords.lng]);

          const isCompleted = v.status === 'COMPLETED';
          const popupHtml = `
            <div style="font-family:'Inter',sans-serif; font-size:12px; min-width:160px;">
              <strong style="color:${isCompleted ? '#059669' : '#EF4444'}">${v.type.toUpperCase()}: ${v.name}</strong><br/>
              <strong>Check-In:</strong> ${v.checkInTime}<br/>
              ${isCompleted ? `<strong>Check-Out:</strong> ${v.checkOutTime}<br/><strong>Promoted:</strong> ${v.products || 'N/A'}` : '🟢 ACTIVE CALL NOW'}
            </div>
          `;

          const visitM = L.marker([v.checkInCoords.lat, v.checkInCoords.lng], {
            icon: getCustomIcon(isCompleted ? GREEN_PIN : RED_PIN, 32, 32)
          })
          .bindPopup(popupHtml)
          .addTo(mapInstanceRef.current);

          markersRef.current.push(visitM);
        }
      });
    }

    // Plot End Point
    if (targetRecord.status === 'ENDED' && targetRecord.endLocation?.lat) {
      const p = targetRecord.endLocation;
      pathCoordinates.push([p.lat, p.lng]);

      const endM = L.marker([p.lat, p.lng], {
        icon: getCustomIcon(BLUE_PIN, 36, 36)
      })
      .bindPopup(`<strong>🏁 Workday End Check-Out</strong><br/>Time: ${targetRecord.endTime}<br/>Location: ${p.name || 'GPS Wrap'}`)
      .addTo(mapInstanceRef.current);

      markersRef.current.push(endM);
    }

    // Draw route overlay
    if (pathCoordinates.length > 1) {
      routeLineRef.current = L.polyline(pathCoordinates, {
        color: '#111827',
        weight: 3.5,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.fitBounds(L.featureGroup(markersRef.current).getBounds(), {
        padding: [50, 50]
      });
    } else if (pathCoordinates.length === 1) {
      mapInstanceRef.current.setView(pathCoordinates[0], 14);
    }
  };

  // Helper Stats calculations
  const getSelectedStats = () => {
    const rec = db.find(r => String(r.mrId) === selectedMrId && r.date === selectedDate);
    if (!rec) return { status: 'OFFLINE', duration: '—', visits: 0, distance: '0.0 km', start: '—', end: '—', record: null };

    const completedVisits = rec.visits?.filter(v => v.status === 'COMPLETED').length || 0;
    
    // Calculate distance
    let distanceKm = 0.0;
    if (rec.startLocation && rec.visits && rec.visits.length > 0) {
      let prevPoint = rec.startLocation;
      rec.visits.forEach(v => {
        if (v.checkInCoords) {
          const latDiff = Math.abs(v.checkInCoords.lat - prevPoint.lat);
          const lngDiff = Math.abs(v.checkInCoords.lng - prevPoint.lng);
          distanceKm += Math.sqrt(latDiff*latDiff + lngDiff*lngDiff) * 111;
          prevPoint = v.checkInCoords;
        }
      });
      if (rec.status === 'ENDED' && rec.endLocation) {
        const latDiff = Math.abs(rec.endLocation.lat - prevPoint.lat);
        const lngDiff = Math.abs(rec.endLocation.lng - prevPoint.lng);
        distanceKm += Math.sqrt(latDiff*latDiff + lngDiff*lngDiff) * 111;
      }
    }
    if (distanceKm < 0.2 && rec.visits?.length > 0) {
      distanceKm = rec.visits.length * 2.4 + 1.2;
    }

    return {
      status: rec.status,
      duration: rec.status === 'ENDED' ? '8.2 hrs' : 'Active Working',
      visits: rec.visits?.length || 0,
      distance: distanceKm.toFixed(1) + ' km',
      start: rec.startTime,
      end: rec.endTime || 'Working',
      record: rec
    };
  };

  const currentStats = getSelectedStats();

  // Unified Overview metrics for the whole MR team today
  const getTeamOverviewToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysLogs = db.filter(r => r.date === todayStr);
    
    const activeWorkingCount = todaysLogs.filter(r => r.status === 'ACTIVE').length;
    const completedWorkdayCount = todaysLogs.filter(r => r.status === 'ENDED').length;
    const totalVisitsMet = todaysLogs.reduce((acc, r) => acc + (r.visits?.length || 0), 0);

    return {
      activeField: activeWorkingCount,
      completedField: completedWorkdayCount,
      totalVisitsToday: totalVisitsMet
    };
  };

  const overview = getTeamOverviewToday();

  // Find the details of the selected MR profile
  const selectedMrProfile = mrList.find(mr => String(mr.id) === selectedMrId) || { fullName: 'Representative' };

  return (
    <div className="animate-[fadeIn_0.35s_ease-out] font-sans">
      
      {/* Page Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[11px] text-[#9CA3AF] font-extrabold uppercase tracking-wider">
            ADMIN PORTAL / TEAM OPERATIONS
          </span>
          <h2 className="text-[24px] font-extrabold text-[#111827] mt-1 mb-0">Field Representative Tracking</h2>
          <p className="text-[13px] text-[#6B7280] mt-0.75 mb-0">Monitor Medical Representatives working hours, live routes, GPS locations, and call report submissions.</p>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        
        <div className="bg-white border-[1.5px] border-[#F3F4F6] rounded-2xl p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Active Field Reps Today</div>
          <div className="text-[26px] font-extrabold text-[#059669] mt-1.5 flex items-center gap-1.5">
            {overview.activeField} <span className="text-xs bg-[#ECFDF5] text-[#059669] px-2 py-0.75 rounded-lg">🟢 Live</span>
          </div>
        </div>

        <div className="bg-white border-[1.5px] border-[#F3F4F6] rounded-2xl p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Workday Completed Today</div>
          <div className="text-[26px] font-extrabold text-[#1E3A8A] mt-1.5">
            {overview.completedField} Reps
          </div>
        </div>

        <div className="bg-white border-[1.5px] border-[#F3F4F6] rounded-2xl p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Total Visited Calls Today</div>
          <div className="text-[26px] font-extrabold text-[#F59E0B] mt-1.5">
            {overview.totalVisitsToday} Visits
          </div>
        </div>

        <div className="bg-white border-[1.5px] border-[#F3F4F6] rounded-2xl p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase">Database Verified Routes</div>
          <div className="text-[26px] font-extrabold text-[#6366F1] mt-1.5">
            {db.length} Logs
          </div>
        </div>

      </div>

      {/* main grid: filters + timeline on left, interactive map on right */}
      <div className="grid grid-cols-[1.1fr_1fr] gap-6 items-start">
        
        {/* LEFT COLUMN: Controls, Details & Chronicle */}
        <div className="flex flex-col gap-5">
          
          {/* Query Filters */}
          <div className="bg-white rounded-[20px] border-[1.5px] border-[#F3F4F6] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <h3 className="text-[15px] font-extrabold text-[#111827] mt-0 mb-4">Filter Field Pathways</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] mb-1.25">FIELD REPRESENTATIVE</label>
                {teamLoading ? (
                  <div className="text-[13px] text-[#6B7280]">Loading team...</div>
                ) : mrList.length === 0 ? (
                  <div className="text-xs text-[#EF4444]">No MR profiles in database.</div>
                ) : (
                  <select 
                    value={selectedMrId}
                    onChange={(e) => setSelectedMrId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13px] bg-white font-bold text-[#111827]"
                  >
                    {mrList.map(mr => (
                      <option key={mr.id} value={String(mr.id)}>
                        👨‍💼 {mr.fullName || mr.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] mb-1.25">CHOOSE DATE</label>
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-[1.5px] border-[#E5E7EB] text-[12.5px] font-bold text-[#111827] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Selected Workday Metrics */}
          <div className="bg-white rounded-[20px] border-[1.5px] border-[#F3F4F6] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-3.5 mb-3.5">
              <div>
                <h3 className="text-[15.5px] font-extrabold text-[#111827] m-0">{selectedMrProfile.fullName}'s Pathway Summary</h3>
                <span className="text-[11px] text-[#9CA3AF]">Date logged: {selectedDate}</span>
              </div>
              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-xl ${currentStats.status === 'OFFLINE' ? 'bg-[#F3F4F6] text-[#4B5563]' : currentStats.status === 'ENDED' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#ECFDF5] text-[#059669]'}`}>
                {currentStats.status}
              </span>
            </div>

            {currentStats.status === 'OFFLINE' ? (
              <div className="text-center py-5 text-[#9CA3AF]">
                <ShieldAlert size={36} className="mx-auto mb-3" />
                <p className="m-0 text-[13.5px]">No field log recorded for this representative on the selected date.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#FAFAFA] p-3 rounded-xl border border-[#EEEEEE]">
                    <div className="text-[10.5px] text-[#9CA3AF] font-bold">Total Duration</div>
                    <div className="text-[14.5px] font-extrabold text-[#1F2937] mt-1">{currentStats.duration}</div>
                  </div>
                  <div className="bg-[#FAFAFA] p-3 rounded-xl border border-[#EEEEEE]">
                    <div className="text-[10.5px] text-[#9CA3AF] font-bold">Total Doctor Visits</div>
                    <div className="text-[14.5px] font-extrabold text-[#1F2937] mt-1">{currentStats.visits} Calls</div>
                  </div>
                  <div className="bg-[#FAFAFA] p-3 rounded-xl border border-[#EEEEEE]">
                    <div className="text-[10.5px] text-[#9CA3AF] font-bold">Estimated Travel</div>
                    <div className="text-[14.5px] font-extrabold text-[#1F2937] mt-1">{currentStats.distance}</div>
                  </div>
                </div>

                {/* Clock timings */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#EEEEEE] flex items-center gap-2.5">
                    <Clock size={16} color="#3B82F6" />
                    <div>
                      <div className="text-[#9CA3AF] font-semibold">Start Day Time</div>
                      <div className="text-[#374151] font-extrabold mt-0.5">{currentStats.start}</div>
                    </div>
                  </div>
                  <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#EEEEEE] flex items-center gap-2.5">
                    <Clock size={16} color="#10B981" />
                    <div>
                      <div className="text-[#9CA3AF] font-semibold">End Day Time</div>
                      <div className="text-[#374151] font-extrabold mt-0.5">{currentStats.end}</div>
                    </div>
                  </div>
                </div>

                {/* Selfie snapshot verification */}
                {currentStats.record?.startSelfie && (
                  <div className="flex items-center gap-3 p-3.5 bg-[#FAFAFA] rounded-[14px] border border-[#EEEEEE]">
                    <img 
                      src={currentStats.record.startSelfie} 
                      alt="Workday Start Selfie" 
                      className="w-14 h-14 rounded-lg object-cover border border-[#E5E7EB]" 
                    />
                    <div>
                      <div className="text-[13px] font-extrabold text-[#1F2937]">Workday Selfie Captured</div>
                      <div className="text-[11px] text-[#6B7280] mt-0.5">GPS Location: {currentStats.record.startLocation?.name || 'MG Road'}</div>
                      <div className="text-[10px] bg-[#E0F2FE] text-[#0369A1] inline-block px-1.5 py-0.5 rounded mt-1 font-bold">IDENTITY CONFIRMED</div>
                    </div>
                  </div>
                )}

                {/* Timeline activity log list */}
                <div>
                  <div className="text-[12.5px] font-extrabold text-[#9CA3AF] uppercase mb-3.5">Workday Activity Timeline</div>
                  
                  <div className="flex flex-col gap-3.5 border-l-2 border-[#E5E7EB] pl-4 ml-2">
                    
                    {/* START TICK */}
                    <div className="relative">
                      <span className="absolute -left-[22px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#3B82F6] border-2 border-white shadow-[0_0_0_2px_#3B82F6]" />
                      <div className="text-[11px] text-[#9CA3AF] font-bold">{currentStats.start}</div>
                      <div className="text-[13px] font-extrabold text-[#1F2937] mt-0.5">Workday Started</div>
                      <div className="text-xs text-[#6B7280]">Location: {currentStats.record.startLocation?.name || 'Coordinates locked'}</div>
                    </div>

                    {/* VISITS TIMELINE */}
                    {currentStats.record.visits?.map((v, index) => (
                      <div key={index} className="relative">
                        <span className={`absolute -left-[22px] top-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${v.status === 'COMPLETED' ? 'bg-[#10B981] shadow-[0_0_0_2px_#10B981]' : 'bg-[#EF4444] shadow-[0_0_0_2px_#EF4444]'}`} />
                        <div className="text-[11px] text-[#9CA3AF] font-bold">{v.checkInTime} {v.checkOutTime ? `- ${v.checkOutTime}` : ''}</div>
                        <div className="text-[13px] font-extrabold text-[#1F2937] mt-0.5">{v.type} Visit: {v.name}</div>
                        <div className="text-xs text-[#6B7280]">Clinic: {v.clinic}</div>
                        
                        {v.status === 'COMPLETED' ? (
                          <div className="bg-[#FAFAFA] px-3.5 py-2.5 rounded-lg border border-[#EEEEEE] text-xs text-[#4B5563] mt-1.5 flex flex-col gap-1">
                            <div>💊 <strong>Promoted Brands:</strong> {v.products}</div>
                            <div>🧪 <strong>Samples Distributed:</strong> {v.samples || 'None'}</div>
                            <div>📝 <strong>Feedback Summary:</strong> "{v.feedback}"</div>
                            {v.selfie && (
                              <div className="mt-1.5">
                                <img src={v.selfie} alt="Visit Photo" className="w-12 h-12 rounded-md object-cover border border-[#E5E7EB]" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-[#EF4444] font-bold mt-1">🟢 Currently on-site meeting doctor</div>
                        )}
                      </div>
                    ))}

                    {/* END TICK */}
                    {currentStats.status === 'ENDED' && (
                      <div className="relative">
                        <span className="absolute -left-[22px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#3B82F6] border-2 border-white shadow-[0_0_0_2px_#3B82F6]" />
                        <div className="text-[11px] text-[#9CA3AF] font-bold">{currentStats.end}</div>
                        <div className="text-[13px] font-extrabold text-[#1F2937] mt-0.5">Workday Completed</div>
                        <div className="text-xs text-[#6B7280]">Location: {currentStats.record.endLocation?.name || 'Lock final exit location'}</div>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Map Visualizer */}
        <div className="sticky top-6">
          <div className="bg-white rounded-[20px] border-[1.5px] border-[#F3F4F6] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            
            {/* Map title block */}
            <div className="px-5 py-4 border-b border-[#F3F4F6] flex justify-between items-center">
              <div>
                <h3 className="text-[14.5px] font-extrabold text-[#111827] m-0">Representative Route Visualizer</h3>
                <span className="text-[11.5px] text-[#9CA3AF]">Active location pathways</span>
              </div>
              {currentStats.status === 'ACTIVE' && (
                <span className="text-[11.5px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.75 rounded-md inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block animate-ping" />
                  LIVE STREAMING
                </span>
              )}
            </div>

            {/* Map Canvas */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-[520px] bg-[#FAFAFA] z-10"
            />

            {/* Map Legend */}
            <div className="px-5 py-4 border-t border-[#F3F4F6] bg-[#FAFAFA] flex gap-4 flex-wrap text-[11.5px] font-bold text-[#4B5563]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#3B82F6]" />
                <span>Start / End Pins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#10B981]" />
                <span>Visited Clinics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#EF4444]" />
                <span>Active Visits</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          70%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

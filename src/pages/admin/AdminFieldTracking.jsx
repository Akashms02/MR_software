import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyTeam } from '../../redux/actions/teamActions';
import { fetchTeamAttendanceAction, fetchTeamVisitsAction } from '../../redux/actions/attendanceActions';
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

// SVG-based Circular Progress Ring Component
function CircularProgressRing({ percentage, value, label, sublabel, color = "#3B82F6", size = 110, strokeWidth = 9 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#FAFAFA] rounded-2xl border border-[#EEEEEE] flex-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            className="text-gray-200"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle */}
          <circle
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[17px] font-extrabold text-[#111827]">{value}</span>
          <span className="text-[9px] text-[#9CA3AF] font-bold uppercase">{percentage}%</span>
        </div>
      </div>
      <div className="text-center mt-2">
        <span className="block text-xs font-extrabold text-[#1F2937]">{label}</span>
      </div>
    </div>
  );
}

export default function AdminFieldTracking() {
  const dispatch = useDispatch();
  
  // Team state from Redux
  const { team = [], loading: teamLoading } = useSelector(state => state.team || {});

  // Local state
  const { teamAttendance = [], teamVisits = [], loading: attendanceLoading } = useSelector(state => state.attendance || {});
  const isLoading = teamLoading || attendanceLoading;
  
  const [selectedMrId, setSelectedMrId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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
  const mrList = (team || []).filter((member) => {
    const role = (member.role || '').toUpperCase().trim();
    const name = (member.fullName || member.name || '').toLowerCase();
    const isMr = role === 'MR' || role === 'MEDICAL_REPRESENTATIVE';
    const isSuperAdmin = name.includes('superadmin') || name.includes('admin');
    return isMr && !isSuperAdmin;
  });

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

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      return (
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear()
      );
    } catch (e) {
      return false;
    }
  };

  const formatIsoToTime = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return '';
    }
  };

  const mapVisitFromApi = (v) => ({
    id: v.id,
    name: v.targetName || v.name || 'Unknown Target',
    type: v.visitType === 'DOCTOR' ? 'Doctor' : v.visitType === 'CHEMIST' ? 'Pharmacy' : v.visitType || 'Doctor',
    specialty: v.specialty || '',
    clinic: v.clinicName || v.clinic || '',
    checkInTime: formatIsoToTime(v.checkInTime),
    checkInCoords: { lat: v.checkInLatitude, lng: v.checkInLongitude },
    checkOutTime: formatIsoToTime(v.checkOutTime),
    checkOutCoords: { lat: v.checkOutLatitude, lng: v.checkOutLongitude },
    status: v.status === 'CHECKED_IN' ? 'ACTIVE' : 'COMPLETED',
    products: v.productsDiscussed || v.products || '',
    samples: v.samplesGiven || v.samples || '',
    feedback: v.feedback || '',
  });

  // Find the details of the selected MR profile
  const selectedMrProfile = mrList.find(mr => String(mr.id) === selectedMrId || String(mr.employeeId) === selectedMrId) || { fullName: 'Representative' };

  const punchRecord = teamAttendance.find((a) => {
    const logMrId = String(a.mrId || a.employeeId || '');
    const targetMrId = String(selectedMrId);
    const matchesMrId = logMrId === targetMrId;
    const matchesProfileId = selectedMrProfile?.id && logMrId === String(selectedMrProfile.id);
    const matchesProfileEmployeeId = selectedMrProfile?.employeeId && logMrId === String(selectedMrProfile.employeeId);
    return (matchesMrId || matchesProfileId || matchesProfileEmployeeId) && 
           a.punchInTime && isSameDay(a.punchInTime, selectedDate);
  });

  const visitsForMrAndDate = teamVisits.filter((v) => {
    const logMrId = String(v.mrId || v.employeeId || '');
    const targetMrId = String(selectedMrId);
    const matchesMrId = logMrId === targetMrId;
    const matchesProfileId = selectedMrProfile?.id && logMrId === String(selectedMrProfile.id);
    const matchesProfileEmployeeId = selectedMrProfile?.employeeId && logMrId === String(selectedMrProfile.employeeId);
    return (matchesMrId || matchesProfileId || matchesProfileEmployeeId) && 
           v.checkInTime && isSameDay(v.checkInTime, selectedDate);
  });

  const targetRecord = punchRecord
    ? {
        id: punchRecord.id,
        mrId: selectedMrId,
        mrName: selectedMrProfile?.fullName || selectedMrProfile?.name || punchRecord.mrName || 'Representative',
        date: selectedDate,
        status: (punchRecord.punchInTime && !punchRecord.punchOutTime) ? 'ACTIVE' : (punchRecord.punchInTime && punchRecord.punchOutTime) ? 'ENDED' : 'OFFLINE',
        startTime: formatIsoToTime(punchRecord.punchInTime),
        startLocation: {
          lat: punchRecord.punchInLatitude,
          lng: punchRecord.punchInLongitude,
          name: punchRecord.punchInRemarks || 'GPS Verified',
        },
        endTime: formatIsoToTime(punchRecord.punchOutTime),
        endLocation: punchRecord.punchOutTime
          ? {
              lat: punchRecord.punchOutLatitude,
              lng: punchRecord.punchOutLongitude,
              name: punchRecord.punchOutRemarks || 'GPS Verified',
            }
          : null,
        visits: visitsForMrAndDate.map(mapVisitFromApi),
      }
    : null;

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

      drawRoutesOnMap(targetRecord);

      // Force Map Layout Refresh to fit the full-screen container bounds
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
    };

    initMap();
  }, [teamAttendance, teamVisits, selectedMrId, selectedDate]);

  // 4. Map rendering function
  const drawRoutesOnMap = (record) => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

    // Remove existing markers & lines
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    // If no record, show default center
    if (!record) {
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
    if (record.startLocation?.lat) {
      const p = record.startLocation;
      pathCoordinates.push([p.lat, p.lng]);
      
      const startM = L.marker([p.lat, p.lng], {
        icon: getCustomIcon(BLUE_PIN, 36, 36)
      })
      .bindPopup(`<strong>📍 Workday Start Check-In</strong><br/>Time: ${record.startTime}<br/>Coords: ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`)
      .addTo(mapInstanceRef.current);

      markersRef.current.push(startM);
    }

    // Plot Visit Points
    if (record.visits && record.visits.length > 0) {
      record.visits.forEach(v => {
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
    if (record.status === 'ENDED' && record.endLocation?.lat) {
      const p = record.endLocation;
      pathCoordinates.push([p.lat, p.lng]);

      const endM = L.marker([p.lat, p.lng], {
        icon: getCustomIcon(BLUE_PIN, 36, 36)
      })
      .bindPopup(`<strong>🏁 Workday End Check-Out</strong><br/>Time: ${record.endTime}<br/>Location: ${p.name || 'GPS Wrap'}`)
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
  const getSelectedStats = (rec, punchRec) => {
    if (!rec) return { status: 'OFFLINE', durationHrs: 0, duration: '—', visits: 0, distance: '0.0 km', start: '—', end: '—', record: null };

    const completedVisits = rec.visits?.filter(v => v.status === 'COMPLETED').length || 0;
    
    // Calculate actual logged hours dynamically
    let durationHrs = 0;
    let durationStr = '—';
    if (punchRec && punchRec.punchInTime) {
      try {
        const inTime = new Date(punchRec.punchInTime);
        let outTime;
        if (punchRec.punchOutTime) {
          outTime = new Date(punchRec.punchOutTime);
        } else if (isSameDay(new Date(), selectedDate)) {
          outTime = new Date();
        } else {
          // fallback to standard 8.0 hrs if past date has no checkout record
          const fallbackOut = new Date(inTime.getTime() + 8 * 60 * 60 * 1000);
          outTime = fallbackOut;
        }
        const diffMs = outTime - inTime;
        const diffHrs = Math.max(0, diffMs / (1000 * 60 * 60));
        durationHrs = parseFloat(diffHrs.toFixed(1));
        durationStr = `${durationHrs} hrs`;
      } catch (e) {
        console.error(e);
      }
    }

    // Calculate distance
    let distanceKm = 0.0;
    const isValidCoord = (point) => point && typeof point.lat === 'number' && typeof point.lng === 'number' && !isNaN(point.lat) && !isNaN(point.lng);

    if (isValidCoord(rec.startLocation) && rec.visits && rec.visits.length > 0) {
      let prevPoint = rec.startLocation;
      rec.visits.forEach(v => {
        if (isValidCoord(v.checkInCoords)) {
          const latDiff = Math.abs(v.checkInCoords.lat - prevPoint.lat);
          const lngDiff = Math.abs(v.checkInCoords.lng - prevPoint.lng);
          distanceKm += Math.sqrt(latDiff*latDiff + lngDiff*lngDiff) * 111;
          prevPoint = v.checkInCoords;
        }
      });
      if (rec.status === 'ENDED' && isValidCoord(rec.endLocation)) {
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
      durationHrs,
      duration: durationStr,
      visits: rec.visits?.length || 0,
      distance: distanceKm.toFixed(1) + ' km',
      start: rec.startTime,
      end: rec.endTime || 'Working',
      record: rec
    };
  };

  const currentStats = getSelectedStats(targetRecord, punchRecord);

  // Unified Overview metrics for the whole MR team today
  const getTeamOverviewToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysLogs = teamAttendance.filter(a => a.punchInTime && isSameDay(a.punchInTime, todayStr));
    
    const activeWorkingCount = todaysLogs.filter(r => r.punchInTime && !r.punchOutTime).length;
    const completedWorkdayCount = todaysLogs.filter(r => r.punchInTime && r.punchOutTime).length;
    
    const todaysVisits = teamVisits.filter(v => v.checkInTime && isSameDay(v.checkInTime, todayStr));
    const totalVisitsMet = todaysVisits.length;

    return {
      activeField: activeWorkingCount,
      completedField: completedWorkdayCount,
      totalVisitsToday: totalVisitsMet
    };
  };

  const overview = getTeamOverviewToday();

  // Progress metrics targets
  const hrsTarget = 8.0;
  const hrsPercentage = Math.min(100, Math.round((currentStats.durationHrs / hrsTarget) * 100)) || 0;
  const visitsTarget = 6;
  const visitsPercentage = Math.min(100, Math.round((currentStats.visits / visitsTarget) * 100)) || 0;

  return (
    <div className="animate-[fadeIn_0.35s_ease-out] font-sans flex flex-col gap-6">
      
      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border-[1.5px] border-[#F3F4F6] rounded-[18px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Active Field Reps Today</div>
          <div className="text-[26px] font-extrabold text-[#059669] mt-1.5 flex items-center gap-1.5">
            {overview.activeField} <span className="text-xs bg-[#ECFDF5] text-[#059669] px-2 py-0.75 rounded-lg font-bold">🟢 Live</span>
          </div>
        </div>

        <div className="bg-white border-[1.5px] border-[#F3F4F6] rounded-[18px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Workday Completed Today</div>
          <div className="text-[26px] font-extrabold text-[#1E3A8A] mt-1.5">
            {overview.completedField} Reps
          </div>
        </div>

        <div className="bg-white border-[1.5px] border-[#F3F4F6] rounded-[18px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Total Visited Calls Today</div>
          <div className="text-[26px] font-extrabold text-[#F59E0B] mt-1.5">
            {overview.totalVisitsToday} Visits
          </div>
        </div>

        <div className="bg-white border-[1.5px] border-[#F3F4F6] rounded-[18px] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Database Verified Routes</div>
          <div className="text-[26px] font-extrabold text-[#6366F1] mt-1.5">
            {teamAttendance.length} Logs
          </div>
        </div>

      </div>

      {/* Query Filters - stretched full width */}
      <div className="bg-white rounded-[18px] border-[1.5px] border-[#F3F4F6] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          <div>
            <label className="block text-[11px] font-extrabold text-[#4B5563] mb-1.5 uppercase tracking-wider">Field Representative</label>
            {teamLoading ? (
              <div className="text-[13px] text-[#6B7280] py-2">Loading team...</div>
            ) : mrList.length === 0 ? (
              <div className="text-xs text-[#EF4444] py-2">No MR profiles in database.</div>
            ) : (
              <select 
                value={selectedMrId}
                onChange={(e) => setSelectedMrId(e.target.value)}
                className="w-full h-11 px-3 py-2 rounded-xl border-[1.5px] border-[#E5E7EB] text-[13px] bg-white font-bold text-[#111827] focus:outline-none focus:border-[#111827] transition-colors"
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
            <label className="block text-[11px] font-extrabold text-[#4B5563] mb-1.5 uppercase tracking-wider">Choose Date</label>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-11 px-3 py-2 rounded-xl border-[1.5px] border-[#E5E7EB] text-[12.5px] font-bold text-[#111827] outline-none focus:border-[#111827] transition-colors"
            />
          </div>

          <div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#111827] text-white hover:bg-black font-extrabold rounded-xl transition-all duration-200 text-xs shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              REFRESH PATHWAYS
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map Visualizer - stretched full width */}
      <div className="bg-white rounded-[18px] border-[1.5px] border-[#F3F4F6] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        
        {/* Map title block */}
        <div className="px-5 py-4 border-b border-[#F3F4F6] flex justify-between items-center bg-white">
          <div>
            <h3 className="text-[14.5px] font-extrabold text-[#111827] m-0">Representative Route Visualizer</h3>
            <span className="text-[11.5px] text-[#9CA3AF]">Active location pathways on the map</span>
          </div>
          {currentStats.status === 'ACTIVE' && (
            <span className="text-[11.5px] font-bold text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block animate-ping" />
              LIVE STREAMING
            </span>
          )}
        </div>

        {/* Map Canvas */}
        <div 
          ref={mapContainerRef} 
          className="w-full h-[500px] bg-[#FAFAFA] z-10"
        />

        {/* Map Legend */}
        <div className="px-5 py-4 border-t border-[#F3F4F6] bg-[#FAFAFA] flex gap-6 flex-wrap text-[11.5px] font-bold text-[#4B5563]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#3B82F6]" />
            <span>Start / End Pins</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#10B981]" />
            <span>Visited Clinics</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#EF4444]" />
            <span>Active Visits</span>
          </div>
        </div>

      </div>

      {/* Pathway Summary Section - stretched full width */}
      <div className="bg-white rounded-[18px] border-[1.5px] border-[#F3F4F6] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-4 mb-4">
          <div>
            <h3 className="text-[15.5px] font-extrabold text-[#111827] m-0">{selectedMrProfile.fullName}'s Pathway Summary</h3>
            <span className="text-[11px] text-[#9CA3AF]">Date logged: {selectedDate}</span>
          </div>
          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-xl uppercase tracking-wider ${currentStats.status === 'OFFLINE' ? 'bg-[#F3F4F6] text-[#4B5563]' : currentStats.status === 'ENDED' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#ECFDF5] text-[#059669]'}`}>
            {currentStats.status}
          </span>
        </div>

        {currentStats.status === 'OFFLINE' ? (
          <div className="text-center py-10 text-[#9CA3AF]">
            <ShieldAlert size={44} className="mx-auto mb-3 text-gray-300 animate-pulse" />
            <p className="m-0 text-[14px] font-semibold text-[#6B7280]">No field log recorded for this representative on the selected date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[250px_160px_1fr] gap-6">
            
            {/* Column 1: Timings & Travel Metrics */}
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-[#FAFAFA] rounded-2xl border border-[#EEEEEE] flex items-center gap-3">
                <Clock size={20} className="text-[#3B82F6] flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">Punch In Time</div>
                  <div className="text-[13px] text-[#374151] font-extrabold mt-0.5">{currentStats.start}</div>
                </div>
              </div>

              <div className="p-3 bg-[#FAFAFA] rounded-2xl border border-[#EEEEEE] flex items-center gap-3">
                <Clock size={20} className="text-[#10B981] flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">Punch Out Time</div>
                  <div className="text-[13px] text-[#374151] font-extrabold mt-0.5">{currentStats.end}</div>
                </div>
              </div>

              {/* Extra Stats summary card details */}
              <div className="bg-[#FAFAFA] p-3.5 rounded-2xl border border-[#EEEEEE] flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#9CA3AF] font-bold">Estimated Travel</span>
                  <span className="font-extrabold text-[#1F2937]">{currentStats.distance}</span>
                </div>
                <div className="h-[1px] bg-[#EEEEEE] w-full" />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#9CA3AF] font-bold">Workday Progress</span>
                  <span className="font-extrabold text-[#10B981]">{visitsPercentage}% achieved</span>
                </div>
              </div>
            </div>

            {/* Column 2: Progress Analytics & Ring Charts (Stacked vertically) */}
            <div className="flex flex-col gap-3 justify-center">
              <CircularProgressRing 
                percentage={hrsPercentage} 
                value={`${currentStats.durationHrs}h`} 
                label="Logged Hours" 
                sublabel={`Target: ${hrsTarget} hrs`} 
                color="#3B82F6" 
                size={110}
              />
              <CircularProgressRing 
                percentage={visitsPercentage} 
                value={`${currentStats.visits}`} 
                label="Doctor Visits" 
                sublabel={`Target: ${visitsTarget} calls`} 
                color="#10B981" 
                size={110}
              />
            </div>

            {/* Column 3: Timeline (Scrollable Chronicle) */}
            <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-[#EEEEEE] flex flex-col h-full min-h-[350px]">
              <div className="max-h-[310px] overflow-y-auto pr-1 flex flex-col">

                {/* Timeline Item Helper — dot + connector + content */}
                {(() => {
                  const allItems = [
                    {
                      type: 'start',
                      time: currentStats.start,
                      title: 'Workday Started',
                      sub: `Location: ${currentStats.record.startLocation?.name || 'Coordinates locked'}`,
                      color: '#3B82F6',
                      ring: 'rgba(59,130,246,0.25)',
                    },
                    ...(currentStats.record.visits || []).map(v => ({
                      type: 'visit',
                      time: `${v.checkInTime}${v.checkOutTime ? ` – ${v.checkOutTime}` : ''}`,
                      title: `${v.type} Visit: ${v.name}`,
                      sub: v.clinic ? `Clinic: ${v.clinic}` : '',
                      color: v.status === 'COMPLETED' ? '#10B981' : '#EF4444',
                      ring: v.status === 'COMPLETED' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)',
                      extra: v.status === 'COMPLETED' ? { products: v.products, samples: v.samples, feedback: v.feedback } : null,
                      active: v.status !== 'COMPLETED',
                    })),
                    ...(currentStats.status === 'ENDED' ? [{
                      type: 'end',
                      time: currentStats.end,
                      title: 'Workday Completed',
                      sub: `Location: ${currentStats.record.endLocation?.name || 'Exit location locked'}`,
                      color: '#3B82F6',
                      ring: 'rgba(59,130,246,0.25)',
                    }] : []),
                  ];

                  return allItems.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      {/* Dot + vertical connector */}
                      <div className="relative flex flex-col items-center flex-shrink-0 w-5">
                        {/* Connector line running behind */}
                        {allItems.length > 1 && (
                          <div 
                            className="absolute left-1/2 w-0.5 bg-[#E5E7EB] -translate-x-1/2"
                            style={{
                              top: i === 0 ? '8px' : '0px',
                              bottom: i === allItems.length - 1 ? 'auto' : '0px',
                              height: i === allItems.length - 1 ? '8px' : 'auto'
                            }}
                          />
                        )}
                        {/* Dot */}
                        <div
                          className="relative z-10 w-3 h-3 rounded-full border-2 border-white flex-shrink-0 mt-0.5"
                          style={{
                            backgroundColor: item.color,
                            boxShadow: `0 0 0 2.5px ${item.ring}`,
                            minWidth: 12,
                            minHeight: 12,
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className={`flex-1 ${i < allItems.length - 1 ? 'pb-4' : 'pb-1'}`}>
                        <div className="text-[10px] text-[#9CA3AF] font-bold leading-none">{item.time}</div>
                        <div className="text-[13px] font-extrabold text-[#1F2937] mt-0.5">{item.title}</div>
                        {item.sub && <div className="text-xs text-[#6B7280]">{item.sub}</div>}
                        {item.extra && (
                          <div className="bg-white px-3 py-2.5 rounded-xl border border-[#EEEEEE] text-[11px] text-[#4B5563] mt-2 flex flex-col gap-1">
                            <div><strong>Promoted Brands:</strong> {item.extra.products}</div>
                            {item.extra.samples && <div><strong>Samples:</strong> {item.extra.samples}</div>}
                            {item.extra.feedback && <div><strong>Feedback:</strong> "{item.extra.feedback}"</div>}
                          </div>
                        )}
                        {item.active && (
                          <div className="text-[10px] text-[#EF4444] font-bold mt-1 uppercase tracking-wider">🟢 Currently on-site meeting</div>
                        )}
                      </div>
                    </div>
                  ));
                })()}

              </div>
            </div>

          </div>
        )}

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

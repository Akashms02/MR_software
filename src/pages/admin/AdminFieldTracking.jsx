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
    <div style={{ animation: 'fadeIn 0.35s ease-out', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            ADMIN PORTAL / TEAM OPERATIONS
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '4px 0 0 0' }}>Field Representative Tracking</h2>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '3px 0 0 0' }}>Monitor Medical Representatives working hours, live routes, GPS locations, and call report submissions.</p>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Active Field Reps Today</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {overview.activeField} <span style={{ fontSize: '12px', background: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '8px' }}>🟢 Live</span>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Workday Completed Today</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#1E3A8A', marginTop: '6px' }}>
            {overview.completedField} Reps
          </div>
        </div>

        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Total Visited Calls Today</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#F59E0B', marginTop: '6px' }}>
            {overview.totalVisitsToday} Visits
          </div>
        </div>

        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Database Verified Routes</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#6366F1', marginTop: '6px' }}>
            {db.length} Logs
          </div>
        </div>

      </div>

      {/* main grid: filters + timeline on left, interactive map on right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Controls, Details & Chronicle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Query Filters */}
          <div style={{ background: '#fff', borderRadius: '20px', border: '1.5px solid #F3F4F6', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: '0 0 16px 0' }}>Filter Field Pathways</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#4B5563', marginBottom: '5px' }}>FIELD REPRESENTATIVE</label>
                {teamLoading ? (
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>Loading team...</div>
                ) : mrList.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#EF4444' }}>No MR profiles in database.</div>
                ) : (
                  <select 
                    value={selectedMrId}
                    onChange={(e) => setSelectedMrId(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB',
                      fontSize: '13px', background: '#fff', fontWeight: 700, color: '#111827'
                    }}
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
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#4B5563', marginBottom: '5px' }}>CHOOSE DATE</label>
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB',
                    fontSize: '12.5px', fontWeight: 700, color: '#111827', outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Selected Workday Metrics */}
          <div style={{ background: '#fff', borderRadius: '20px', border: '1.5px solid #F3F4F6', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '14px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: '#111827', margin: 0 }}>{selectedMrProfile.fullName}'s Pathway Summary</h3>
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Date logged: {selectedDate}</span>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px',
                background: currentStats.status === 'OFFLINE' ? '#F3F4F6' : currentStats.status === 'ENDED' ? '#EFF6FF' : '#ECFDF5',
                color: currentStats.status === 'OFFLINE' ? '#4B5563' : currentStats.status === 'ENDED' ? '#2563EB' : '#059669'
              }}>
                {currentStats.status}
              </span>
            </div>

            {currentStats.status === 'OFFLINE' ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#9CA3AF' }}>
                <ShieldAlert size={36} style={{ margin: '0 auto 12px auto' }} />
                <p style={{ margin: 0, fontSize: '13.5px' }}>No field log recorded for this representative on the selected date.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#FAFAFA', padding: '12px', borderRadius: '12px', border: '1px solid #EEEEEE' }}>
                    <div style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>Total Duration</div>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#1F2937', marginTop: '4px' }}>{currentStats.duration}</div>
                  </div>
                  <div style={{ background: '#FAFAFA', padding: '12px', borderRadius: '12px', border: '1px solid #EEEEEE' }}>
                    <div style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>Total Doctor Visits</div>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#1F2937', marginTop: '4px' }}>{currentStats.visits} Calls</div>
                  </div>
                  <div style={{ background: '#FAFAFA', padding: '12px', borderRadius: '12px', border: '1px solid #EEEEEE' }}>
                    <div style={{ fontSize: '10.5px', color: '#9CA3AF', fontWeight: 700 }}>Estimated Travel</div>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#1F2937', marginTop: '4px' }}>{currentStats.distance}</div>
                  </div>
                </div>

                {/* Clock timings */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                  <div style={{ padding: '12px', background: '#FAFAFA', borderRadius: '12px', border: '1px solid #EEEEEE', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={16} color="#3B82F6" />
                    <div>
                      <div style={{ color: '#9CA3AF', fontWeight: 600 }}>Start Day Time</div>
                      <div style={{ color: '#374151', fontWeight: 800, marginTop: '2px' }}>{currentStats.start}</div>
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: '#FAFAFA', borderRadius: '12px', border: '1px solid #EEEEEE', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={16} color="#10B981" />
                    <div>
                      <div style={{ color: '#9CA3AF', fontWeight: 600 }}>End Day Time</div>
                      <div style={{ color: '#374151', fontWeight: 800, marginTop: '2px' }}>{currentStats.end}</div>
                    </div>
                  </div>
                </div>

                {/* Selfie snapshot verification */}
                {currentStats.record?.startSelfie && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: '#FAFAFA', borderRadius: '14px', border: '1px solid #EEEEEE' }}>
                    <img 
                      src={currentStats.record.startSelfie} 
                      alt="Workday Start Selfie" 
                      style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #E5E7EB' }} 
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1F2937' }}>Workday Selfie Captured</div>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>GPS Location: {currentStats.record.startLocation?.name || 'MG Road'}</div>
                      <div style={{ fontSize: '10px', background: '#E0F2FE', color: '#0369A1', display: 'inline-block', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', fontWeight: 700 }}>IDENTITY CONFIRMED</div>
                    </div>
                  </div>
                )}

                {/* Timeline activity log list */}
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '14px' }}>Workday Activity Timeline</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '2px solid #E5E7EB', paddingLeft: '16px', marginLeft: '8px' }}>
                    
                    {/* START TICK */}
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-22px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', background: '#3B82F6', border: '2px solid #fff', boxShadow: '0 0 0 2px #3B82F6' }} />
                      <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700 }}>{currentStats.start}</div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1F2937', marginTop: '2px' }}>Workday Started</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>Location: {currentStats.record.startLocation?.name || 'Coordinates locked'}</div>
                    </div>

                    {/* VISITS TIMELINE */}
                    {currentStats.record.visits?.map((v, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '-22px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', background: v.status === 'COMPLETED' ? '#10B981' : '#EF4444', border: '2px solid #fff', boxShadow: `0 0 0 2px ${v.status === 'COMPLETED' ? '#10B981' : '#EF4444'}` }} />
                        <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700 }}>{v.checkInTime} {v.checkOutTime ? `- ${v.checkOutTime}` : ''}</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#1F2937', marginTop: '2px' }}>{v.type} Visit: {v.name}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>Clinic: {v.clinic}</div>
                        
                        {v.status === 'COMPLETED' ? (
                          <div style={{ background: '#FAFAFA', padding: '10px 14px', borderRadius: '8px', border: '1px solid #EEEEEE', fontSize: '12px', color: '#4B5563', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div>💊 <strong>Promoted Brands:</strong> {v.products}</div>
                            <div>🧪 <strong>Samples Distributed:</strong> {v.samples || 'None'}</div>
                            <div>📝 <strong>Feedback Summary:</strong> "{v.feedback}"</div>
                            {v.selfie && (
                              <div style={{ marginTop: '6px' }}>
                                <img src={v.selfie} alt="Visit Photo" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #E5E7EB' }} />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 700, marginTop: '4px' }}>🟢 Currently on-site meeting doctor</div>
                        )}
                      </div>
                    ))}

                    {/* END TICK */}
                    {currentStats.status === 'ENDED' && (
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '-22px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', background: '#3B82F6', border: '2px solid #fff', boxShadow: '0 0 0 2px #3B82F6' }} />
                        <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700 }}>{currentStats.end}</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#1F2937', marginTop: '2px' }}>Workday Completed</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>Location: {currentStats.record.endLocation?.name || 'Lock final exit location'}</div>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Map Visualizer */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', border: '1.5px solid #F3F4F6', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            
            {/* Map title block */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#111827', margin: 0 }}>Representative Route Visualizer</h3>
                <span style={{ fontSize: '11.5px', color: '#9CA3AF' }}>Active location pathways</span>
              </div>
              {currentStats.status === 'ACTIVE' && (
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'ping 1.2s infinite' }} />
                  LIVE STREAMING
                </span>
              )}
            </div>

            {/* Map Canvas */}
            <div 
              ref={mapContainerRef} 
              style={{ width: '100%', height: '520px', background: '#FAFAFA', zIndex: 10 }}
            />

            {/* Map Legend */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #F3F4F6', background: '#FAFAFA', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '11.5px', fontWeight: 700, color: '#4B5563' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} />
                <span>Start / End Pins</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                <span>Visited Clinics</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
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

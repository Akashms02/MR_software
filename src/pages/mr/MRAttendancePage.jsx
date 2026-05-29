import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Clock, Square, MapPin, Calendar } from 'lucide-react';

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
  const { user } = useSelector(state => state.auth);
  const mrId = user?.id ? String(user.id) : "mr-01";
  const mrName = user?.fullName || user?.name || "Akash Kumar";

  const todayStr = new Date().toISOString().split('T')[0];

  // Core Working States
  const [db, setDb] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // UI Refs for Leaflet Map
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLineRef = useRef(null);
  const markersRef = useRef([]);

  // 1. Initialize Leaflet CSS dynamically to avoid setup hurdles
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  // 2. Initialize Database & Mock Data on Mount
  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = () => {
    let localDb = localStorage.getItem('mr_field_attendance_db');
    if (!localDb) {
      // Create comprehensive historical mockup data for demonstration
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const dayBefore = new Date(Date.now() - 172800000).toISOString().split('T')[0];

      const initialMock = [
        {
          id: `${mrId}-${dayBefore}`,
          mrId: mrId,
          mrName: mrName,
          date: dayBefore,
          status: 'ENDED',
          startTime: '09:12 AM',
          startLocation: { lat: 12.9716, lng: 77.5946, name: 'MG Road Office Check-in' },
          startSelfie: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          endTime: '05:30 PM',
          endLocation: { lat: 12.9830, lng: 77.6110, name: 'Commercial Street Exit' },
          visits: [
            {
              id: 'v1',
              name: 'Dr. Ramesh Sharma',
              type: 'Doctor',
              specialty: 'Cardiology',
              clinic: 'City Heart Clinic',
              checkInTime: '10:30 AM',
              checkInCoords: { lat: 12.9716, lng: 77.5946 },
              checkOutTime: '11:05 AM',
              checkOutCoords: { lat: 12.9720, lng: 77.5950 },
              status: 'COMPLETED',
              products: 'Cardace 5mg, Lipvas 10mg',
              samples: 'Cardace (10 Tabs)',
              feedback: 'Doctor agreed to increase prescription count for hypertensive patients.',
              checkInPhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150'
            },
            {
              id: 'v2',
              name: 'Apollo Pharmacy',
              type: 'Pharmacy',
              specialty: 'Chemist',
              clinic: 'Indiranagar Branch',
              checkInTime: '01:45 PM',
              checkInCoords: { lat: 12.9785, lng: 77.6408 },
              checkOutTime: '02:15 PM',
              checkOutCoords: { lat: 12.9785, lng: 77.6408 },
              status: 'COMPLETED',
              products: 'Amlong 5mg stocking',
              samples: 'Visual aid pamphlets (2 packs)',
              feedback: 'Stock checked, placed order for 50 boxes of Lipvas.',
              checkInPhoto: null
            }
          ]
        },
        {
          id: `${mrId}-${yesterday}`,
          mrId: mrId,
          mrName: mrName,
          date: yesterday,
          status: 'ENDED',
          startTime: '09:05 AM',
          startLocation: { lat: 12.9650, lng: 77.5890, name: 'Basavanagudi Start' },
          startSelfie: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          endTime: '06:00 PM',
          endLocation: { lat: 12.9780, lng: 77.5995, name: 'Richmond Town Wrap' },
          visits: [
            {
              id: 'v3',
              name: 'Dr. Vivek Verma',
              type: 'Doctor',
              specialty: 'Orthopedics',
              clinic: 'Verma Ortho Care',
              checkInTime: '11:15 AM',
              checkInCoords: { lat: 12.9650, lng: 77.5890 },
              checkOutTime: '11:55 AM',
              checkOutCoords: { lat: 12.9655, lng: 77.5895 },
              status: 'COMPLETED',
              products: 'Chymoral Forte discussions',
              samples: 'Chymoral Forte (2 Strips)',
              feedback: 'Very positive response. Doctor has been prescribing regularly.',
              checkInPhoto: null
            },
            {
              id: 'v4',
              name: 'Dr. Sunita Patel',
              type: 'Doctor',
              specialty: 'Pediatrics',
              clinic: 'Metro General Hospital',
              checkInTime: '03:10 PM',
              checkInCoords: { lat: 12.9780, lng: 77.5995 },
              checkOutTime: '03:50 PM',
              checkOutCoords: { lat: 12.9782, lng: 77.5997 },
              status: 'COMPLETED',
              products: 'Augmentin DDS Suspessions',
              samples: 'Augmentin DDS Pediatric samples (5 bottles)',
              feedback: 'Inquired about syrup stock levels in local pharmacies.',
              checkInPhoto: null
            }
          ]
        }
      ];
      localStorage.setItem('mr_field_attendance_db', JSON.stringify(initialMock));
      localDb = JSON.stringify(initialMock);
    }

    let parsed = JSON.parse(localDb);
    let todaysRecord = parsed.find(r => r.mrId === mrId && r.date === todayStr);

    // For testing: automatically make status "ACTIVE" (checked in) on refresh if not already active
    if (!todaysRecord || todaysRecord.status !== 'ACTIVE') {
      todaysRecord = {
        id: `${mrId}-${todayStr}`,
        mrId: mrId,
        mrName: mrName,
        date: todayStr,
        status: 'ACTIVE',
        startTime: todaysRecord?.startTime || '09:00 AM',
        startLocation: todaysRecord?.startLocation || { lat: 12.9716, lng: 77.5946, name: 'Office Check-in (Auto)' },
        endTime: null,
        endLocation: null,
        visits: todaysRecord?.visits || [],
      };
      parsed = [...parsed.filter(r => !(r.mrId === mrId && r.date === todayStr)), todaysRecord];
      localStorage.setItem('mr_field_attendance_db', JSON.stringify(parsed));
    }

    setDb(parsed);
  };

  // 3. Leaflet Map setup & updates
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const runMapInit = async () => {
      try {
        const L = window.L;
        if (!L) {
          setTimeout(runMapInit, 300); // Poll until Leaflet script is ready from CDN
          return;
        }

        // Initialize Map
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = L.map(mapContainerRef.current, {
            center: [12.9716, 77.5946],
            zoom: 13,
            zoomControl: false
          });

          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CARTO',
            subdomains: 'abcd',
            maxZoom: 20
          }).addTo(mapInstanceRef.current);

          L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
        }

        updateMapLayer();
      } catch (err) {
        console.error("Leaflet initiation failed", err);
      }
    };

    runMapInit();
  }, [db, selectedDate]);

  // Redraw path markers and lines on Leaflet
  const updateMapLayer = () => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

    // 1. Remove old markers and lines
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    // 2. Select target record (based on selectedDate)
    let targetRecord = db.find(r => r.mrId === mrId && r.date === selectedDate);

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

    // 3. Add Start point
    if (targetRecord.startLocation?.lat) {
      const p = targetRecord.startLocation;
      pathCoordinates.push([p.lat, p.lng]);
      
      const startMarker = L.marker([p.lat, p.lng], {
        icon: getCustomIcon(BLUE_PIN, 36, 36)
      })
      .bindPopup(`<strong>📍 Start Office Check-In</strong><br/>Time: ${targetRecord.startTime}<br/>Location: ${p.name || 'GPS Verified'}`)
      .addTo(mapInstanceRef.current);

      markersRef.current.push(startMarker);
    }

    // 4. Add Visits points
    if (targetRecord.visits && targetRecord.visits.length > 0) {
      targetRecord.visits.forEach(v => {
        if (v.checkInCoords?.lat) {
          pathCoordinates.push([v.checkInCoords.lat, v.checkInCoords.lng]);

          const isCompleted = v.status === 'COMPLETED';
          
          let imageTag = '';
          if (v.checkInPhoto) {
            imageTag = `<br/><img src="${v.checkInPhoto}" style="width:120px;height:80px;object-fit:cover;border-radius:6px;margin-top:6px;border:1px solid #E5E7EB"/>`;
          } else if (v.selfie) {
            imageTag = `<br/><img src="${v.selfie}" style="width:120px;height:80px;object-fit:cover;border-radius:6px;margin-top:6px;border:1px solid #E5E7EB"/>`;
          }

          const popupContent = `
            <div style="font-family:'Inter',sans-serif; font-size:12px; min-width:140px; max-width: 220px;">
              <strong style="color:${isCompleted ? '#059669' : '#EF4444'}">${v.type.toUpperCase()}: ${v.name}</strong><br/>
              <strong>Check-in:</strong> ${v.checkInTime}<br/>
              ${isCompleted ? `<strong>Check-out:</strong> ${v.checkOutTime || 'N/A'}<br/><strong>Products:</strong> ${v.products || 'N/A'}` : '<span style="color:#EF4444;font-weight:700;">🟢 ACTIVE VISIT NOW</span>'}
              ${imageTag}
            </div>
          `;

          const pinMarker = L.marker([v.checkInCoords.lat, v.checkInCoords.lng], {
            icon: getCustomIcon(isCompleted ? GREEN_PIN : RED_PIN, 32, 32)
          })
          .bindPopup(popupContent)
          .addTo(mapInstanceRef.current);

          markersRef.current.push(pinMarker);
        }
      });
    }

    // 5. Add End point if ended
    if (targetRecord.status === 'ENDED' && targetRecord.endLocation?.lat) {
      const p = targetRecord.endLocation;
      pathCoordinates.push([p.lat, p.lng]);

      const endMarker = L.marker([p.lat, p.lng], {
        icon: getCustomIcon(BLUE_PIN, 36, 36)
      })
      .bindPopup(`<strong>🏁 Workday Ended</strong><br/>Time: ${targetRecord.endTime}<br/>Location: ${p.name || 'GPS Verified'}`)
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

  const activeRecord = db.find(r => r.mrId === mrId && r.date === selectedDate);
  const visits = activeRecord?.visits || [];
  const completedVisits = visits.filter(v => v.status === 'COMPLETED').length;

  const statusLabel = activeRecord
    ? (activeRecord.status === 'ACTIVE' ? 'Active / Working' : activeRecord.status === 'ENDED' ? 'Workday Completed' : 'Offline / Off-Duty')
    : 'Offline / Off-Duty';

  return (
    <div style={{ animation: 'fadeSlideIn 0.35s ease-out', padding: '10px' }}>
      
      {/* Header Panel & Date Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid #E5E7EB', paddingBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            FIELD OPERATIONS LEDGER
          </span>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: '4px 0 0 0', letterSpacing: '-0.5px' }}>Field Attendance & Pathway</h2>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>Review geographic paths, check-in timelines, and call summaries for the selected date.</p>
        </div>

        {/* Date Filter Calendar Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '8px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <Calendar size={15} style={{ color: '#6B7280' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Date:</span>
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(e.target.value);
            }}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px', background: '#F9FAFB', fontWeight: 700, color: '#1F2937', cursor: 'pointer', outline: 'none' }}
          />
        </div>
      </div>

      {/* Daily Stats Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Card 1: Status */}
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: activeRecord?.status === 'ACTIVE' ? '#ECFDF5' : activeRecord?.status === 'ENDED' ? '#EFF6FF' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            {activeRecord?.status === 'ACTIVE' ? '🟢' : activeRecord?.status === 'ENDED' ? '🏁' : '🛑'}
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Workday Status</div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1F2937' }}>{statusLabel}</div>
          </div>
        </div>

        {/* Card 2: Start Time */}
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F59E0B15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <Clock size={18} />
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Start Time</div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1F2937' }}>{activeRecord?.startTime || '—'}</div>
          </div>
        </div>

        {/* Card 3: End Time */}
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#3B82F615', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
            <Square size={16} />
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>End Time</div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1F2937' }}>
              {activeRecord?.status === 'ACTIVE' ? 'Active Duty' : activeRecord?.endTime || '—'}
            </div>
          </div>
        </div>

        {/* Card 4: Completed Visits */}
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#10B98115', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <MapPin size={18} />
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed Calls</div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1F2937' }}>{completedVisits} of {visits.length} logged</div>
          </div>
        </div>
      </div>

      {/* Split Layout grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: Map container */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1.5px solid #F3F4F6', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
          {/* Map Title block */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div>
              <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#111827', margin: 0 }}>Workday Pathway Map</h3>
              <span style={{ fontSize: '11.5px', color: '#9CA3AF' }}>Chronological Travel Routing</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#3B82F6', background: '#EFF6FF', padding: '3px 8px', borderRadius: '6px' }}>
              GPS LIVE ACTIVE
            </span>
          </div>

          {/* Actual Leaflet Container */}
          <div 
            ref={mapContainerRef} 
            style={{ width: '100%', height: '480px', background: '#FAFAFA', zIndex: 10, flex: 1 }}
          />
          
          {/* Map Legend */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid #F3F4F6', background: '#FAFAFA', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '11.5px', fontWeight: 700, color: '#4B5563', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} />
              <span>Start / End Points</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span>Completed Visits</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
              <span>Active Visits</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Chronological Timeline */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1.5px solid #F3F4F6', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '584px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '14px', marginBottom: '16px', flexShrink: 0 }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: 0 }}>Chronological Activity Trail</h3>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Step-by-step route timeline</span>
          </div>

          <div className="timeline-container" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', paddingLeft: '8px' }}>
            {!activeRecord ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF', textAlign: 'center' }}>
                <Calendar size={28} style={{ marginBottom: '10px', color: '#9CA3AF' }} />
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#4B5563' }}>No Workday Logged</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px', maxWidth: '240px' }}>No field attendance records exist for this selected date.</div>
              </div>
            ) : (
              <div style={{ position: 'relative', borderLeft: '2px dashed #E5E7EB', marginLeft: '12px', paddingLeft: '24px', paddingTop: '8px', paddingBottom: '8px' }}>
                
                {/* 1. START WORKDAY NODE */}
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                  <div style={{ position: 'absolute', left: '-31px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: '#3B82F6', border: '2px solid #fff', boxShadow: '0 0 0 3px rgba(59,130,246,0.15)' }} />
                  
                  <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: '#EFF6FF', color: '#1E40AF' }}>[START WORKDAY]</span>
                      <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>{activeRecord.startTime}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#1F2937' }}>Check-In Registered</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>📍 {activeRecord.startLocation?.name || 'GPS Coordinates Verified'}</div>
                    {activeRecord.startSelfie && (
                      <div style={{ marginTop: '8px' }}>
                        <img src={activeRecord.startSelfie} alt="Start Selfie" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E5E7EB', cursor: 'pointer' }} onClick={() => window.open(activeRecord.startSelfie, '_blank')} />
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. VISITS TIMELINE NODES (Single card per visit containing both check-in and check-out logs inside) */}
                {visits.length === 0 ? (
                  <div style={{ padding: '16px', background: '#FAFAFA', borderRadius: '12px', border: '1.5px dashed #E5E7EB', color: '#9CA3AF', fontSize: '12px', textAlign: 'center', marginBottom: '24px' }}>
                    No doctor or pharmacy visits logged for this workday yet.
                  </div>
                ) : (
                  visits.map((v, idx) => {
                    const isCompleted = v.status === 'COMPLETED';
                    const visitColor = isCompleted ? '#10B981' : '#F59E0B';
                    return (
                      <div key={v.id || idx} style={{ position: 'relative', marginBottom: '24px' }}>
                        {/* Dot indicator */}
                        <div style={{ position: 'absolute', left: '-31px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: visitColor, border: '2px solid #fff', boxShadow: `0 0 0 3px ${isCompleted ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}` }} />
                        
                        {/* Single Unified Card */}
                        <div style={{ background: isCompleted ? '#FCFDFD' : '#FFFEFA', borderRadius: '12px', border: `1.5px solid ${isCompleted ? '#E5E7EB' : '#FCD34D'}`, padding: '14px 18px', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }}>
                          {/* Visit Card Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px', marginBottom: '10px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: isCompleted ? '#ECFDF5' : '#FFFBEB', color: isCompleted ? '#065F46' : '#92400E', textTransform: 'uppercase' }}>
                                  {v.type || 'Visit'}
                                </span>
                                {isCompleted ? (
                                  <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: '#EFF6FF', color: '#1E40AF' }}>
                                    COMPLETED
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: '#FEF2F2', color: '#B91C1C', animation: 'pulse 2s infinite' }}>
                                    IN PROGRESS
                                  </span>
                                )}
                              </div>
                              <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#1F2937', margin: '4px 0 2px 0' }}>{v.name}</h4>
                              <div style={{ fontSize: '11.5px', color: '#6B7280' }}>🏥 {v.clinic || 'Doctor Clinic'}</div>
                            </div>
                            <span style={{ fontSize: '16px' }}>{v.type === 'Pharmacy' ? '🧪' : '🩺'}</span>
                          </div>

                          {/* Check-In Section */}
                          <div style={{ marginBottom: isCompleted ? '12px' : '0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#4B5563', fontWeight: 700, marginBottom: '4px' }}>
                              <span>📥 CHECK-IN LOG</span>
                              <span>{v.checkInTime}</span>
                            </div>
                            {v.checkInNotes && (
                              <div style={{ fontSize: '12px', color: '#4B5563', padding: '6px 10px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #F1F5F9', fontStyle: 'italic' }}>
                                🎯 <strong>Objective:</strong> {v.checkInNotes}
                              </div>
                            )}
                            {v.checkInPhoto && (
                              <div style={{ marginTop: '8px' }}>
                                <img src={v.checkInPhoto} alt="Check-In Place" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E5E7EB', cursor: 'pointer' }} onClick={() => window.open(v.checkInPhoto, '_blank')} />
                              </div>
                            )}
                          </div>

                          {/* Check-Out Section (displays inside the same card if completed) */}
                          {isCompleted && (
                            <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '10px', marginTop: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#047857', fontWeight: 700, marginBottom: '6px' }}>
                                <span>📤 CHECK-OUT LOG</span>
                                <span>{v.checkOutTime}</span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#374151' }}>
                                <div>💊 <strong>Brands Promoted:</strong> {v.products}</div>
                                <div>🧪 <strong>Samples Distributed:</strong> {v.samples || 'None'}</div>
                                <div style={{ background: '#ECFDF5', padding: '6px 10px', borderRadius: '6px', border: '1px solid #D1FAE5', color: '#065F46', marginTop: '4px' }}>
                                  📝 <strong>Feedback Summary:</strong> "{v.feedback}"
                                </div>
                                {(v.selfie || v.checkOutPhoto) && (
                                  <div style={{ marginTop: '6px' }}>
                                    <img src={v.selfie || v.checkOutPhoto} alt="Checkout Selfie" style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #A7F3D0', cursor: 'pointer' }} onClick={() => window.open(v.selfie || v.checkOutPhoto, '_blank')} />
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
                  <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <div style={{ position: 'absolute', left: '-31px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: '#1E3A8A', border: '2px solid #fff', boxShadow: '0 0 0 3px rgba(30,58,138,0.15)' }} />
                    
                    <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #CBD5E1', padding: '12px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: '#F1F5F9', color: '#475569' }}>[END WORKDAY]</span>
                        <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>{activeRecord.endTime}</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1F2937' }}>Workday Operations Closed</div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>🏁 Ended at: {activeRecord.endLocation?.name || 'GPS Coordinates Verified'}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <div style={{ position: 'absolute', left: '-31px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: '#10B981', border: '2px solid #fff', animation: 'ping 1.5s infinite' }} />
                    <div style={{ position: 'absolute', left: '-31px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: '#10B981', border: '2px solid #fff' }} />
                    
                    <div style={{ background: '#ECFDF5', borderRadius: '12px', border: '1.5px dashed #A7F3D0', padding: '12px 16px', color: '#065F46' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800 }}>🟢 WORKDAY ACTIVE</div>
                      <div style={{ fontSize: '11.5px', color: '#047857', marginTop: '2px' }}>Representative is currently on field duty. End of day report pending.</div>
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
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          70%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .timeline-container::-webkit-scrollbar {
          display: none;
        }
        .timeline-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

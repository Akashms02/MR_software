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
    <div className="p-2.5 animate-[fadeSlideIn_0.35s_ease-out]">
      
      {/* Header Panel & Date Filter */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3.5 border-b border-gray-200 pb-5">
        <div>
          <span className="text-[11px] text-gray-500 font-extrabold uppercase tracking-[1.5px]">
            FIELD OPERATIONS LEDGER
          </span>
          <h2 className="text-[26px] font-extrabold text-gray-900 mt-1 mb-0 tracking-[-0.5px]">Field Attendance & Pathway</h2>
          <p className="text-[13px] text-gray-500 mt-1 mb-0">Review geographic paths, check-in timelines, and call summaries for the selected date.</p>
        </div>

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
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5px]">Workday Status</div>
            <div className="text-[13.5px] font-extrabold text-gray-800">{statusLabel}</div>
          </div>
        </div>

        {/* Card 2: Start Time */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="w-[38px] h-[38px] rounded-xl bg-[#F59E0B15] flex items-center justify-center text-[#D97706]">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5px]">Start Time</div>
            <div className="text-[13.5px] font-extrabold text-gray-800">{activeRecord?.startTime || '—'}</div>
          </div>
        </div>

        {/* Card 3: End Time */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="w-[38px] h-[38px] rounded-xl bg-[#3B82F615] flex items-center justify-center text-[#2563EB]">
            <Square size={16} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5px]">End Time</div>
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
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5px]">Completed Calls</div>
            <div className="text-[13.5px] font-extrabold text-gray-800">{completedVisits} of {visits.length} logged</div>
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
              <h3 className="text-[14.5px] font-extrabold text-gray-900 m-0">Workday Pathway Map</h3>
              <span className="text-[11.5px] text-gray-400">Chronological Travel Routing</span>
            </div>
            <span className="text-[11px] font-extrabold text-[#3B82F6] bg-[#EFF6FF] px-2 py-0.5 rounded">
              GPS LIVE ACTIVE
            </span>
          </div>

          {/* Actual Leaflet Container */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-[480px] bg-[#FAFAFA] z-10 flex-1"
          />
          
          {/* Map Legend */}
          <div className="px-5 py-4 border-t border-gray-100 bg-[#FAFAFA] flex gap-4 flex-wrap text-[11.5px] font-bold text-gray-600 shrink-0">
            <div className="flex items-center gap-6">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <span>Start / End Points</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Completed Visits</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span>Active Visits</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Chronological Timeline */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-[584px] flex flex-col">
          <div className="border-b border-gray-100 pb-3.5 mb-4 shrink-0">
            <h3 className="text-[15px] font-extrabold text-gray-900 m-0">Chronological Activity Trail</h3>
            <span className="text-[12px] text-gray-400">Step-by-step route timeline</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 pl-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {!activeRecord ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                <Calendar size={28} className="mb-2.5 text-gray-400" />
                <div className="text-[14px] font-bold text-gray-600">No Workday Logged</div>
                <div className="text-[12px] text-gray-400 mt-1 max-w-[240px]">No field attendance records exist for this selected date.</div>
              </div>
            ) : (
              <div className="relative border-l-2 border-dashed border-gray-200 ml-3 pl-6 py-2">
                
                {/* 1. START WORKDAY NODE */}
                <div className="relative mb-6">
                  <div className="absolute left-[-31px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_0_3px_rgba(59,130,246,0.15)]" />
                  
                  <div className="bg-[#F8FAFC] rounded-xl border border-gray-200 p-3 px-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1E40AF]">[START WORKDAY]</span>
                      <span className="text-[11px] text-gray-400 font-semibold">{activeRecord.startTime}</span>
                    </div>
                    <div className="text-[13px] font-extrabold text-gray-800">Check-In Registered</div>
                    <div className="text-[12px] text-gray-500 mt-0.5">📍 {activeRecord.startLocation?.name || 'GPS Coordinates Verified'}</div>
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
                    No doctor or pharmacy visits logged for this workday yet.
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
                                    IN PROGRESS
                                  </span>
                                )}
                              </div>
                              <h4 className="text-[14.5px] font-extrabold text-gray-800 mt-1 mb-0.5">{v.name}</h4>
                              <div className="text-[11.5px] text-gray-500">🏥 {v.clinic || 'Doctor Clinic'}</div>
                            </div>
                            <span className="text-[16px]">{v.type === 'Pharmacy' ? '🧪' : '🩺'}</span>
                          </div>

                          {/* Check-In Section */}
                          <div className={isCompleted ? "mb-3" : "mb-0"}>
                            <div className="flex justify-between text-[11px] text-gray-600 font-bold mb-1">
                              <span>📥 CHECK-IN LOG</span>
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
                                <span>📤 CHECK-OUT LOG</span>
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
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569]">[END WORKDAY]</span>
                        <span className="text-[11px] text-gray-400 font-semibold">{activeRecord.endTime}</span>
                      </div>
                      <div className="text-[13px] font-extrabold text-gray-800">Workday Operations Closed</div>
                      <div className="text-[12px] text-gray-500 mt-0.5">🏁 Ended at: {activeRecord.endLocation?.name || 'GPS Coordinates Verified'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="relative mb-2">
                    <div className="absolute left-[-31px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-ping" />
                    <div className="absolute left-[-31px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    
                    <div className="bg-[#ECFDF5] rounded-xl border border-dashed border-[#A7F3D0] p-3 px-4 text-[#065F46]">
                      <div className="text-[12px] font-bold">🟢 WORKDAY ACTIVE</div>
                      <div className="text-[11.5px] text-[#047857] mt-0.5">Representative is currently on field duty. End of day report pending.</div>
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

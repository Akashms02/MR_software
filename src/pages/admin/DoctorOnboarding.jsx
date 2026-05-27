import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { onboardMember, clearSuccess, clearErrors } from '../../redux/actions/teamActions';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, User, Mail, Phone, MapPin, Calendar, Users, Heart, Navigation } from 'lucide-react';
import L from 'leaflet';

// Free OSM geocoding helpers
const extractCityPincode = (addressObj) => {
  if (!addressObj) return { city: '', pincode: '' };
  const cityVal = addressObj.city || addressObj.town || addressObj.village || addressObj.suburb || addressObj.municipality || addressObj.county || addressObj.state_district || addressObj.state || '';
  const pinVal = addressObj.postcode || '';
  return { city: cityVal, pincode: pinVal };
};

const reverseGeocodeFree = async (lat, lon) => {
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const osmRes = await fetch(osmUrl, { headers: { Accept: 'application/json' } });
    if (osmRes.ok) {
      const osmData = await osmRes.json();
      return osmData || null;
    }
  } catch (e) {
    return null;
  }
  return null;
};

const geocodeAddressFree = async (q) => {
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=1`;
    const res = await fetch(osmUrl);
    const data = await res.json();
    if (data && data.length > 0) {
      return data[0];
    }
  } catch (e) {}
  return null;
};

const DoctorOnboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isMedicalManager = location.pathname.includes('/medical-manager');

  // Redux state selectors
  const { success: reduxSuccess, error: reduxError } = useSelector((state) => state.team);

  // Role details (can onboard DOCTOR or PHARMACIST)
  const [role, setRole] = useState('DOCTOR');

  // Basic Account details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [latitude, setLatitude] = useState('13.082680');
  const [longitude, setLongitude] = useState('80.270720');

  // Personal details
  const [personalFirstName, setPersonalFirstName] = useState('');
  const [personalMiddleName, setPersonalMiddleName] = useState('');
  const [personalSurname, setPersonalSurname] = useState('');
  const [personalDateOfBirth, setPersonalDateOfBirth] = useState('');
  const [personalGender, setPersonalGender] = useState('Female');
  const [personalBloodGroup, setPersonalBloodGroup] = useState('O+');
  const [personalMaritalStatus, setPersonalMaritalStatus] = useState('Single');
  const [personalFatherName, setPersonalFatherName] = useState('');
  const [personalMotherName, setPersonalMotherName] = useState('');
  const [personalCurrentAddress, setPersonalCurrentAddress] = useState('');
  const [personalPermanentAddress, setPersonalPermanentAddress] = useState('');
  const [personalSameAsCurrentAddress, setPersonalSameAsCurrentAddress] = useState(true);
  const [personalLatitude, setPersonalLatitude] = useState('13.082680');
  const [personalLongitude, setPersonalLongitude] = useState('80.270720');

  // Geocoding helper states (auto-filled)
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Map toggle states
  const [isClinicMapOpen, setIsClinicMapOpen] = useState(false);
  const [isHomeMapOpen, setIsHomeMapOpen] = useState(false);

  // Clinic Map references
  const clinicMapContainerRef = useRef(null);
  const clinicMapRef = useRef(null);

  // Home Map references
  const homeMapContainerRef = useRef(null);
  const homeMapRef = useRef(null);

  // Geocoding loaders
  const [isClinicGeocoding, setIsClinicGeocoding] = useState(false);
  const [clinicGeocodeStatus, setClinicGeocodeStatus] = useState('');
  const [isHomeGeocoding, setIsHomeGeocoding] = useState(false);
  const [homeGeocodeStatus, setHomeGeocodeStatus] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSuccess, setLocalSuccess] = useState(null);
  const [localError, setLocalError] = useState(null);

  // GPS watching states matching ShiftManagement.jsx
  const [isWatchingClinic, setIsWatchingClinic] = useState(false);
  const [isWatchingHome, setIsWatchingHome] = useState(false);
  const [clinicGeoError, setClinicGeoError] = useState('');
  const [homeGeoError, setHomeGeoError] = useState('');

  const clinicWatchIdRef = useRef(null);
  const clinicWatchTimerRef = useRef(null);
  const bestClinicAccRef = useRef(null);

  const homeWatchIdRef = useRef(null);
  const homeWatchTimerRef = useRef(null);
  const bestHomeAccRef = useRef(null);

  const handleCancel = () => {
    navigate(isMedicalManager ? '/medical-manager/dashboard' : '/admin/myteam');
  };

  // --- Clinic Map Initialization & Lifecycle ---
  useEffect(() => {
    if (isClinicMapOpen && clinicMapContainerRef.current && !clinicMapRef.current) {
      const latVal = parseFloat(latitude) || 13.082680;
      const lngVal = parseFloat(longitude) || 80.270720;

      const map = L.map(clinicMapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([latVal, lngVal], 16);
      clinicMapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      // Handle map drag/panning ended
      map.on('moveend', () => {
        const center = map.getCenter();
        updateClinicLocation(center.lat, center.lng, true);
      });

      // Force render layout update
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (clinicMapRef.current) {
        clinicMapRef.current.remove();
        clinicMapRef.current = null;
      }
    };
  }, [isClinicMapOpen]);

  // Sync Clinic coordinates state back to map centering
  useEffect(() => {
    if (clinicMapRef.current) {
      const latVal = parseFloat(latitude) || 13.082680;
      const lngVal = parseFloat(longitude) || 80.270720;
      const center = clinicMapRef.current.getCenter();
      if (Math.abs(center.lat - latVal) > 0.0001 || Math.abs(center.lng - lngVal) > 0.0001) {
        clinicMapRef.current.setView([latVal, lngVal], 16);
      }
    }
  }, [latitude, longitude]);

  // --- Home Map Initialization & Lifecycle ---
  useEffect(() => {
    if (isHomeMapOpen && homeMapContainerRef.current && !homeMapRef.current) {
      const latVal = parseFloat(personalLatitude) || 13.082680;
      const lngVal = parseFloat(personalLongitude) || 80.270720;

      const map = L.map(homeMapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([latVal, lngVal], 16);
      homeMapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      // Handle map drag/panning ended
      map.on('moveend', () => {
        const center = map.getCenter();
        updateHomeLocation(center.lat, center.lng, true);
      });

      // Force render layout update
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (homeMapRef.current) {
        homeMapRef.current.remove();
        homeMapRef.current = null;
      }
    };
  }, [isHomeMapOpen]);

  // Sync Home coordinates state back to map centering
  useEffect(() => {
    if (homeMapRef.current) {
      const latVal = parseFloat(personalLatitude) || 13.082680;
      const lngVal = parseFloat(personalLongitude) || 80.270720;
      const center = homeMapRef.current.getCenter();
      if (Math.abs(center.lat - latVal) > 0.0001 || Math.abs(center.lng - lngVal) > 0.0001) {
        homeMapRef.current.setView([latVal, lngVal], 16);
      }
    }
  }, [personalLatitude, personalLongitude]);

  // --- Geolocation State Sync hooks & Redux Redirection listeners ---
  useEffect(() => {
    dispatch(clearSuccess());
    dispatch(clearErrors());
    return () => {
      dispatch(clearSuccess());
      dispatch(clearErrors());
      stopClinicWatch();
      stopHomeWatch();
    };
  }, [dispatch]);

  useEffect(() => {
    if (reduxSuccess) {
      setLocalSuccess(`${role === 'DOCTOR' ? 'Doctor' : 'Pharmacist'} onboarded successfully! Redirecting...`);
      setLocalError(null);
      setIsSubmitting(false);
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
        navigate(isMedicalManager ? '/medical-manager/dashboard' : '/admin/myteam');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [reduxSuccess, navigate, isMedicalManager, role, dispatch]);

  useEffect(() => {
    if (reduxError) {
      setLocalError(reduxError);
      setLocalSuccess(null);
      setIsSubmitting(false);
    }
  }, [reduxError]);

  const stopClinicWatch = () => {
    if (clinicWatchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(clinicWatchIdRef.current);
    }
    clinicWatchIdRef.current = null;
    if (clinicWatchTimerRef.current) clearTimeout(clinicWatchTimerRef.current);
    clinicWatchTimerRef.current = null;
    setIsWatchingClinic(false);
  };

  const stopHomeWatch = () => {
    if (homeWatchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(homeWatchIdRef.current);
    }
    homeWatchIdRef.current = null;
    if (homeWatchTimerRef.current) clearTimeout(homeWatchTimerRef.current);
    homeWatchTimerRef.current = null;
    setIsWatchingHome(false);
  };

  // --- Location Sync Helpers ---
  const updateClinicLocation = async (lat, lng, forceAddress = true) => {
    const latStr = lat.toFixed(7);
    const lngStr = lng.toFixed(7);
    setLatitude(latStr);
    setLongitude(lngStr);

    if (personalSameAsCurrentAddress) {
      setPersonalLatitude(latStr);
      setPersonalLongitude(lngStr);
    }

    setClinicGeocodeStatus(`📍 Clinic coordinates: ${latStr}, ${lngStr}`);

    if (forceAddress) {
      setIsClinicGeocoding(true);
      try {
        const data = await reverseGeocodeFree(lat, lng);
        if (data && data.display_name) {
          const address = data.display_name;
          setPersonalCurrentAddress(address);
          if (personalSameAsCurrentAddress) {
            setPersonalPermanentAddress(address);
          }
          if (data.address) {
            const { city: cVal, pincode: pVal } = extractCityPincode(data.address);
            if (cVal) setCity(cVal);
            if (pVal) setPincode(pVal);
          }
        }
      } catch (err) {
        console.error("Reverse geocoding error:", err);
      } finally {
        setIsClinicGeocoding(false);
      }
    }
  };

  const updateHomeLocation = async (lat, lng, forceAddress = true) => {
    const latStr = lat.toFixed(7);
    const lngStr = lng.toFixed(7);
    setPersonalLatitude(latStr);
    setPersonalLongitude(lngStr);

    setHomeGeocodeStatus(`📍 Home coordinates: ${latStr}, ${lngStr}`);

    if (forceAddress) {
      setIsHomeGeocoding(true);
      try {
        const data = await reverseGeocodeFree(lat, lng);
        if (data && data.display_name) {
          const address = data.display_name;
          setPersonalPermanentAddress(address);
        }
      } catch (err) {
        console.error("Reverse geocoding error:", err);
      } finally {
        setIsHomeGeocoding(false);
      }
    }
  };

  // Live Address onChange Parser (client-side regex autofill)
  const handleAddressChange = (val) => {
    setPersonalCurrentAddress(val);
    setLocalError(null);

    // Auto-extract 6-digit Indian pincode
    const pinMatch = val.match(/\b\d{6}\b/);
    if (pinMatch) {
      setPincode(pinMatch[0]);
    }

    // Auto-extract city from a pre-defined set of cities
    const cities = ['chennai', 'bengaluru', 'bangalore', 'mumbai', 'delhi', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow', 'coimbatore', 'madurai', 'trichy', 'salem', 'vellore', 'tirunelveli', 'thoothukudi', 'nagpur', 'thane', 'visakhapatnam', 'patna', 'indore', 'bhopal', 'kochi', 'trivandrum'];
    const lowerVal = val.toLowerCase();
    for (const c of cities) {
      if (lowerVal.includes(c)) {
        const displayCity = c === 'bangalore' ? 'Bengaluru' : c.charAt(0).toUpperCase() + c.slice(1);
        setCity(displayCity);
        break;
      }
    }
  };

  // Forward Geocoding: Clinic Address -> Coordinates
  const handleGeocodeClinicAddress = async (q) => {
    if (!q || !q.trim()) return;

    setIsClinicGeocoding(true);
    setClinicGeocodeStatus('Locating clinic address...');
    try {
      const data = await geocodeAddressFree(q);
      if (data) {
        const lat = parseFloat(data.lat);
        const lon = parseFloat(data.lon);
        const latStr = lat.toFixed(7);
        const lonStr = lon.toFixed(7);

        setLatitude(latStr);
        setLongitude(lonStr);
        if (personalSameAsCurrentAddress) {
          setPersonalLatitude(latStr);
          setPersonalLongitude(lonStr);
        }

        if (data.address) {
          const { city: cVal, pincode: pVal } = extractCityPincode(data.address);
          if (cVal) setCity(cVal);
          if (pVal) setPincode(pVal);
        }

        setClinicGeocodeStatus(`📍 Clinic coordinates: ${latStr}, ${lonStr}`);
      } else {
        setClinicGeocodeStatus('⚠️ Clinic address could not be resolved.');
      }
    } catch (err) {
      console.error(err);
      setClinicGeocodeStatus('⚠️ Error resolving coordinates.');
    } finally {
      setIsClinicGeocoding(false);
    }
  };

  // Forward Geocoding: Home Address -> Coordinates
  const handleGeocodeHomeAddress = async (q) => {
    if (!q || !q.trim()) return;

    setIsHomeGeocoding(true);
    setHomeGeocodeStatus('Locating home address...');
    try {
      const data = await geocodeAddressFree(q);
      if (data) {
        const lat = parseFloat(data.lat);
        const lon = parseFloat(data.lon);
        const latStr = lat.toFixed(7);
        const lonStr = lon.toFixed(7);

        setPersonalLatitude(latStr);
        setPersonalLongitude(lonStr);

        setHomeGeocodeStatus(`📍 Home coordinates: ${latStr}, ${lonStr}`);
      } else {
        setHomeGeocodeStatus('⚠️ Home address could not be resolved.');
      }
    } catch (err) {
      console.error(err);
      setHomeGeocodeStatus('⚠️ Error resolving coordinates.');
    } finally {
      setIsHomeGeocoding(false);
    }
  };

  // High-accuracy GPS watcher for Clinic (matching ShiftManagement.jsx)
  const handleClinicGPSDetect = () => {
    setClinicGeoError('');
    setLocalError(null);

    if (!('geolocation' in navigator)) {
      setClinicGeoError('Geolocation is not supported by your browser.');
      return;
    }

    stopClinicWatch();
    setIsWatchingClinic(true);
    setClinicGeocodeStatus('Detecting GPS location...');

    // Stop watch after 8 seconds
    clinicWatchTimerRef.current = setTimeout(() => {
      stopClinicWatch();
    }, 8000);

    bestClinicAccRef.current = null;

    clinicWatchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position?.coords?.latitude;
        const lon = position?.coords?.longitude;
        const acc = position?.coords?.accuracy;

        if (typeof lat !== 'number' || typeof lon !== 'number') return;

        const nextAcc = typeof acc === 'number' ? Math.round(acc) : null;
        const prevAcc = typeof bestClinicAccRef.current === 'number' ? bestClinicAccRef.current : null;
        const shouldReplace = prevAcc === null || (nextAcc !== null && nextAcc < prevAcc);

        if (shouldReplace) {
          if (nextAcc !== null) bestClinicAccRef.current = nextAcc;
          
          await updateClinicLocation(lat, lon, true);
          
          if (clinicMapRef.current) {
            clinicMapRef.current.setView([lat, lon], 16);
          }
        }

        if (typeof acc === 'number' && acc <= 25) {
          stopClinicWatch();
        }
      },
      (error) => {
        console.error(error);
        const code = error?.code;
        if (code === 1) setClinicGeoError('Location permission denied. Please allow location access.');
        else if (code === 2) setClinicGeoError('Location unavailable. Please enable GPS.');
        else if (code === 3) setClinicGeoError('Location request timed out.');
        else setClinicGeoError('GPS detection failed.');
        
        setClinicGeocodeStatus('⚠️ GPS detection failed.');
        stopClinicWatch();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 12000,
      }
    );
  };

  // High-accuracy GPS watcher for Home (matching ShiftManagement.jsx)
  const handleHomeGPSDetect = () => {
    setHomeGeoError('');
    setLocalError(null);

    if (!('geolocation' in navigator)) {
      setHomeGeoError('Geolocation is not supported by your browser.');
      return;
    }

    stopHomeWatch();
    setIsWatchingHome(true);
    setHomeGeocodeStatus('Detecting GPS location...');

    // Stop watch after 8 seconds
    homeWatchTimerRef.current = setTimeout(() => {
      stopHomeWatch();
    }, 8000);

    bestHomeAccRef.current = null;

    homeWatchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position?.coords?.latitude;
        const lon = position?.coords?.longitude;
        const acc = position?.coords?.accuracy;

        if (typeof lat !== 'number' || typeof lon !== 'number') return;

        const nextAcc = typeof acc === 'number' ? Math.round(acc) : null;
        const prevAcc = typeof bestHomeAccRef.current === 'number' ? bestHomeAccRef.current : null;
        const shouldReplace = prevAcc === null || (nextAcc !== null && nextAcc < prevAcc);

        if (shouldReplace) {
          if (nextAcc !== null) bestHomeAccRef.current = nextAcc;
          
          await updateHomeLocation(lat, lon, true);
          
          if (homeMapRef.current) {
            homeMapRef.current.setView([lat, lon], 16);
          }
        }

        if (typeof acc === 'number' && acc <= 25) {
          stopHomeWatch();
        }
      },
      (error) => {
        console.error(error);
        const code = error?.code;
        if (code === 1) setHomeGeoError('Location permission denied.');
        else if (code === 2) setHomeGeoError('Location unavailable.');
        else if (code === 3) setHomeGeoError('Location request timed out.');
        else setHomeGeoError('GPS detection failed.');
        
        setHomeGeocodeStatus('⚠️ GPS detection failed.');
        stopHomeWatch();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 12000,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);

    // Final checks before sending coordinates
    if (personalCurrentAddress.trim() && latitude === '13.082680' && longitude === '80.270720') {
      await handleGeocodeClinicAddress(personalCurrentAddress);
    }
    if (!personalSameAsCurrentAddress && personalPermanentAddress.trim() && personalLatitude === '13.082680' && personalLongitude === '80.270720') {
      await handleGeocodeHomeAddress(personalPermanentAddress);
    }

    // Validations
    if (!fullName.trim()) return setLocalError('Full Name is required.');
    if (!email.trim()) return setLocalError('Email is required.');
    if (!phone.trim()) return setLocalError('Phone number is required.');
    if (!personalFirstName.trim()) return setLocalError('First Name is required.');
    if (!personalSurname.trim()) return setLocalError('Surname is required.');
    if (!personalDateOfBirth) return setLocalError('Date of Birth is required.');
    if (!personalFatherName.trim()) return setLocalError("Father's Name is required.");
    if (!personalMotherName.trim()) return setLocalError("Mother's Name is required.");
    if (!personalCurrentAddress.trim()) return setLocalError('Current Address is required.');
    if (!personalSameAsCurrentAddress && !personalPermanentAddress.trim()) {
      return setLocalError('Permanent Address is required.');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: role,
        reportingToId: null,
        employeeId: null,
        latitude: parseFloat(latitude) || 13.082680,
        longitude: parseFloat(longitude) || 80.270720,
        personal: {
          firstName: personalFirstName.trim(),
          middleName: personalMiddleName.trim(),
          surname: personalSurname.trim(),
          dateOfBirth: personalDateOfBirth,
          gender: personalGender,
          bloodGroup: personalBloodGroup,
          maritalStatus: personalMaritalStatus,
          fatherName: personalFatherName.trim(),
          motherName: personalMotherName.trim(),
          currentAddress: personalCurrentAddress.trim(),
          permanentAddress: personalSameAsCurrentAddress ? personalCurrentAddress.trim() : personalPermanentAddress.trim(),
          sameAsCurrentAddress: personalSameAsCurrentAddress,
          latitude: parseFloat(personalLatitude) || 13.082680,
          longitude: parseFloat(personalLongitude) || 80.270720
        }
      };

      await dispatch(onboardMember(payload));
    } catch (err) {
      setLocalError(err.message || 'Onboarding request failed.');
      setIsSubmitting(false);
    }
  };

  const containerStyle = {
    maxWidth: '850px',
    margin: '0 auto',
    paddingBottom: '40px'
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '20px',
    border: '1.5px solid #F3F4F6',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.02)',
    padding: '36px',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px'
  };

  const sectionHeadingStyle = {
    fontSize: '15px',
    fontWeight: 800,
    color: '#111827',
    borderBottom: '1px solid #F3F4F6',
    paddingBottom: '8px',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '18px'
  };

  const gridThreeStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '18px'
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 700,
    color: '#4B5563',
  };

  const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px 10px 38px',
    borderRadius: '10px',
    border: '1.5px solid #E5E7EB',
    fontSize: '13.5px',
    color: '#1F2937',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#FAFAFA',
    transition: 'all 0.2s',
  };

  const selectStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #E5E7EB',
    fontSize: '13.5px',
    color: '#1F2937',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#FAFAFA',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const textareaStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #E5E7EB',
    fontSize: '13.5px',
    color: '#1F2937',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#FAFAFA',
    minHeight: '80px',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'all 0.2s',
  };

  const mapContainerStyle = {
    height: '280px',
    width: '100%',
    borderRadius: '10px',
    border: '1.5px solid #E5E7EB',
    boxSizing: 'border-box',
    marginTop: '10px',
    overflow: 'hidden',
    position: 'relative'
  };

  const mapButtonRowStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: '6px'
  };

  const iconStyle = {
    position: 'absolute',
    left: '12px',
    color: '#9CA3AF',
  };

  return (
    <div style={containerStyle} className="fade-slide-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <button
          onClick={handleCancel}
          style={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#374151',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span style={{ fontSize: '11px', color: '#7C3AED', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            REGISTRATION PORTAL
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '4px 0 0 0' }}>
            Onboard New {role === 'DOCTOR' ? 'Doctor' : 'Pharmacist'}
          </h2>
        </div>
      </div>

      {/* Main Card Form */}
      <div style={cardStyle}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
            {role === 'DOCTOR' ? 'Doctor' : 'Pharmacist'} Profile & Interactive Geolocation
          </h3>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Fill in the information below. Drag map pin to center coordinates, search by address, or capture live device GPS.
          </p>
        </div>

        {/* Notifications */}
        {localSuccess && (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontSize: '13.5px', fontWeight: 600 }}>
            <CheckCircle2 size={16} />
            {localSuccess}
          </div>
        )}
        {localError && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#B91C1C', fontSize: '13.5px', fontWeight: 600 }}>
            <AlertCircle size={16} />
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Section 1: Account Info */}
          <div>
            <div style={sectionHeadingStyle}>
              <Users size={16} color="#7C3AED" />
              Account & Contacts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <div style={gridThreeStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Onboarding Role <span style={{ color: '#EF4444' }}>*</span></label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isSubmitting}
                    style={selectStyle}
                  >
                    <option value="DOCTOR">Doctor</option>
                    <option value="PHARMACIST">Pharmacist</option>
                  </select>
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>{role === 'DOCTOR' ? 'Doctor' : 'Pharmacist'} Full Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={inputWrapperStyle}>
                    <User size={15} style={iconStyle} />
                    <input
                      type="text"
                      placeholder={role === 'DOCTOR' ? 'Dr. Sarah Connor' : 'Jane Doe'}
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setLocalError(null); }}
                      required
                      disabled={isSubmitting}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Email Address <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={inputWrapperStyle}>
                    <Mail size={15} style={iconStyle} />
                    <input
                      type="email"
                      placeholder="dr.sarah@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setLocalError(null); }}
                      required
                      disabled={isSubmitting}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              <div style={gridStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Contact Number <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={inputWrapperStyle}>
                    <Phone size={15} style={iconStyle} />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543000"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setLocalError(null); }}
                      required
                      disabled={isSubmitting}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Clinic Location & Address */}
          <div>
            <div style={sectionHeadingStyle}>
              <MapPin size={16} color="#7C3AED" />
              Location 1: Clinic / Hospital Details
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Clinic Address <span style={{ color: '#EF4444' }}>*</span></label>
                <textarea
                  placeholder="Type clinic/hospital address... (Geocodes coordinates on blur)"
                  value={personalCurrentAddress}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onBlur={() => handleGeocodeClinicAddress(personalCurrentAddress)}
                  required
                  disabled={isSubmitting}
                  style={textareaStyle}
                />
                
                {/* Actions row for Clinic Map */}
                <div style={mapButtonRowStyle}>
                  <button
                    type="button"
                    onClick={handleClinicGPSDetect}
                    disabled={isWatchingClinic || isSubmitting}
                    style={{
                      background: isWatchingClinic ? '#E5E7EB' : '#10B981',
                      color: isWatchingClinic ? '#9CA3AF' : 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: isWatchingClinic ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isWatchingClinic ? '🛰️ Live GPS running...' : '🛰️ Use Live GPS'}
                  </button>
                  {isWatchingClinic && (
                    <button
                      type="button"
                      onClick={stopClinicWatch}
                      style={{
                        background: '#EF4444',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🛑 Stop
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsClinicMapOpen(!isClinicMapOpen)}
                    style={{
                      background: '#fff',
                      color: '#4B5563',
                      border: '1.5px solid #E5E7EB',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isClinicMapOpen ? '🗺️ Hide Map' : '🗺️ Pin on Map'}
                  </button>
                </div>

                {/* Inline Clinic Leaflet Map */}
                {isClinicMapOpen && (
                  <div style={mapContainerStyle}>
                    <div style={{ width: '100%', height: '100%' }} ref={clinicMapContainerRef}></div>

                    {/* Central floating pin overlay */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -100%)',
                      zIndex: 1000,
                      pointerEvents: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <div style={{ width: '32px', height: '36px' }}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 21C16 16.8 19 12.8 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.8 8 16.8 12 21Z" fill="#7C3AED" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
                        </svg>
                      </div>
                      <div style={{ width: '10px', height: '3px', background: 'rgba(0,0,0,0.2)', filter: 'blur(1.5px)', borderRadius: '50%', marginTop: '1px', transform: 'translateY(-4px)' }}></div>
                    </div>
                  </div>
                )}

                {clinicGeoError && (
                  <span style={{ fontSize: '11.5px', color: '#EF4444', fontWeight: 600, marginTop: '4px' }}>
                    ⚠️ {clinicGeoError}
                  </span>
                )}

                {clinicGeocodeStatus && (
                  <span style={{ fontSize: '11.5px', color: '#7C3AED', fontWeight: 600, marginTop: '4px' }}>
                    {clinicGeocodeStatus}
                  </span>
                )}
              </div>

              <div style={gridStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>City</label>
                  <input
                    type="text"
                    placeholder="City (auto-filled)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={isSubmitting}
                    style={{ ...inputStyle, paddingLeft: '14px' }}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Pincode</label>
                  <input
                    type="text"
                    placeholder="Pincode (auto-filled)"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    disabled={isSubmitting}
                    style={{ ...inputStyle, paddingLeft: '14px' }}
                  />
                </div>
              </div>

              <div style={gridStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Clinic Latitude</label>
                  <div style={inputWrapperStyle}>
                    <MapPin size={15} style={iconStyle} />
                    <input
                      type="text"
                      value={latitude}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLatitude(val);
                        if (personalSameAsCurrentAddress) {
                          setPersonalLatitude(val);
                        }
                      }}
                      required
                      disabled={isSubmitting}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Clinic Longitude</label>
                  <div style={inputWrapperStyle}>
                    <MapPin size={15} style={iconStyle} />
                    <input
                      type="text"
                      value={longitude}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLongitude(val);
                        if (personalSameAsCurrentAddress) {
                          setPersonalLongitude(val);
                        }
                      }}
                      required
                      disabled={isSubmitting}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                <input
                  type="checkbox"
                  id="sameAsCurrentAddress"
                  checked={personalSameAsCurrentAddress}
                  onChange={(e) => setPersonalSameAsCurrentAddress(e.target.checked)}
                  disabled={isSubmitting}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="sameAsCurrentAddress" style={{ fontSize: '13px', fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>
                  Doctor Home Address is same as Clinic Address
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Doctor Home Location & Address */}
          {!personalSameAsCurrentAddress && (
            <div>
              <div style={sectionHeadingStyle}>
                <Heart size={16} color="#7C3AED" />
                Location 2: Doctor Home Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Doctor Home Address <span style={{ color: '#EF4444' }}>*</span></label>
                  <textarea
                    placeholder="Type doctor's permanent home address... (Geocodes coordinates on blur)"
                    value={personalPermanentAddress}
                    onChange={(e) => {
                      setPersonalPermanentAddress(e.target.value);
                      setLocalError(null);
                    }}
                    onBlur={() => handleGeocodeHomeAddress(personalPermanentAddress)}
                    required
                    disabled={isSubmitting}
                    style={textareaStyle}
                  />

                  {/* Actions row for Home Map */}
                  <div style={mapButtonRowStyle}>
                    <button
                      type="button"
                      onClick={handleHomeGPSDetect}
                      disabled={isWatchingHome || isSubmitting}
                      style={{
                        background: isWatchingHome ? '#E5E7EB' : '#10B981',
                        color: isWatchingHome ? '#9CA3AF' : 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: isWatchingHome ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isWatchingHome ? '🛰️ Live GPS running...' : '🛰️ Use Live GPS'}
                    </button>
                    {isWatchingHome && (
                      <button
                        type="button"
                        onClick={stopHomeWatch}
                        style={{
                          background: '#EF4444',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        🛑 Stop
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsHomeMapOpen(!isHomeMapOpen)}
                      style={{
                        background: '#fff',
                        color: '#4B5563',
                        border: '1.5px solid #E5E7EB',
                        padding: '5px 12px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isHomeMapOpen ? '🗺️ Hide Map' : '🗺️ Pin on Map'}
                    </button>
                  </div>

                  {/* Inline Home Leaflet Map */}
                  {isHomeMapOpen && (
                    <div style={mapContainerStyle}>
                      <div style={{ width: '100%', height: '100%' }} ref={homeMapContainerRef}></div>

                      {/* Central floating pin overlay */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -100%)',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <div style={{ width: '32px', height: '36px' }}>
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21C16 16.8 19 12.8 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.8 8 16.8 12 21Z" fill="#7C3AED" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
                          </svg>
                        </div>
                        <div style={{ width: '10px', height: '3px', background: 'rgba(0,0,0,0.2)', filter: 'blur(1.5px)', borderRadius: '50%', marginTop: '1px', transform: 'translateY(-4px)' }}></div>
                      </div>
                    </div>
                  )}

                  {homeGeoError && (
                    <span style={{ fontSize: '11.5px', color: '#EF4444', fontWeight: 600, marginTop: '4px' }}>
                      ⚠️ {homeGeoError}
                    </span>
                  )}

                  {homeGeocodeStatus && (
                    <span style={{ fontSize: '11.5px', color: '#7C3AED', fontWeight: 600, marginTop: '4px' }}>
                      {homeGeocodeStatus}
                    </span>
                  )}
                </div>

                <div style={gridStyle}>
                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Home Latitude</label>
                    <div style={inputWrapperStyle}>
                      <MapPin size={15} style={iconStyle} />
                      <input
                        type="text"
                        value={personalLatitude}
                        onChange={(e) => setPersonalLatitude(e.target.value)}
                        required
                        disabled={isSubmitting}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={inputGroupStyle}>
                    <label style={labelStyle}>Home Longitude</label>
                    <div style={inputWrapperStyle}>
                      <MapPin size={15} style={iconStyle} />
                      <input
                        type="text"
                        value={personalLongitude}
                        onChange={(e) => setPersonalLongitude(e.target.value)}
                        required
                        disabled={isSubmitting}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Personal Profile Details */}
          <div>
            <div style={sectionHeadingStyle}>
              <User size={16} color="#7C3AED" />
              Doctor Personal Details
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <div style={gridThreeStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>First Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="Sarah"
                    value={personalFirstName}
                    onChange={(e) => setPersonalFirstName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    style={{ ...inputStyle, paddingLeft: '14px' }}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Middle Name</label>
                  <input
                    type="text"
                    placeholder="Middle Name"
                    value={personalMiddleName}
                    onChange={(e) => setPersonalMiddleName(e.target.value)}
                    disabled={isSubmitting}
                    style={{ ...inputStyle, paddingLeft: '14px' }}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Surname <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="Connor"
                    value={personalSurname}
                    onChange={(e) => setPersonalSurname(e.target.value)}
                    required
                    disabled={isSubmitting}
                    style={{ ...inputStyle, paddingLeft: '14px' }}
                  />
                </div>
              </div>

              <div style={gridThreeStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Date of Birth <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={inputWrapperStyle}>
                    <Calendar size={15} style={iconStyle} />
                    <input
                      type="date"
                      value={personalDateOfBirth}
                      onChange={(e) => setPersonalDateOfBirth(e.target.value)}
                      required
                      disabled={isSubmitting}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Gender</label>
                  <select
                    value={personalGender}
                    onChange={(e) => setPersonalGender(e.target.value)}
                    disabled={isSubmitting}
                    style={selectStyle}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Blood Group</label>
                  <select
                    value={personalBloodGroup}
                    onChange={(e) => setPersonalBloodGroup(e.target.value)}
                    disabled={isSubmitting}
                    style={selectStyle}
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div style={gridThreeStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Marital Status</label>
                  <select
                    value={personalMaritalStatus}
                    onChange={(e) => setPersonalMaritalStatus(e.target.value)}
                    disabled={isSubmitting}
                    style={selectStyle}
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Father's Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="John Connor Sr."
                    value={personalFatherName}
                    onChange={(e) => setPersonalFatherName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    style={{ ...inputStyle, paddingLeft: '14px' }}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Mother's Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="Jane Connor"
                    value={personalMotherName}
                    onChange={(e) => setPersonalMotherName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    style={{ ...inputStyle, paddingLeft: '14px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid #F3F4F6', paddingTop: '24px' }}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              style={{
                padding: '11px 22px',
                borderRadius: '12px',
                border: '1.5px solid #E5E7EB',
                background: '#fff',
                color: '#374151',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#F9FAFB'; }}
              onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#fff'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 24px',
                borderRadius: '12px',
                border: 'none',
                background: '#7C3AED',
                color: '#fff',
                fontWeight: 800,
                fontSize: '13.5px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.2)',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.opacity = '1'; }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Onboarding...
                </>
              ) : (
                `Onboard ${role === 'DOCTOR' ? 'Doctor' : 'Pharmacist'}`
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .fade-slide-in {
          animation: fadeSlideIn 0.35s ease-out;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DoctorOnboarding;

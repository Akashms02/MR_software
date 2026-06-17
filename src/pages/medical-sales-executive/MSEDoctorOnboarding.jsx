import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { onboardMember, clearSuccess, clearErrors } from '../../redux/actions/teamActions';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, User, Mail, Phone, MapPin, Calendar, Users, Heart, FileSpreadsheet } from 'lucide-react';
import L from 'leaflet';
import * as XLSX from 'xlsx';

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

const MSEDoctorOnboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    navigate('/medical-sales-executive/dashboard');
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonData || jsonData.length < 2) {
          setLocalError('The uploaded Excel sheet is empty or lacks data rows.');
          return;
        }

        // Parse header and row
        const headers = jsonData[0].map(h => String(h || '').trim().toLowerCase());
        const row = jsonData[1];

        const getVal = (possibleHeaders) => {
          const idx = headers.findIndex(h => possibleHeaders.some(ph => h.includes(ph)));
          if (idx !== -1) {
            const val = row[idx];
            return val !== undefined && val !== null ? String(val).trim() : '';
          }
          return '';
        };

        // Extracted fields
        const rRole = getVal(['role', 'type', 'category']);
        const rFullName = getVal(['full name', 'fullname', 'name']);
        const rEmail = getVal(['email', 'mail']);
        const rPhone = getVal(['phone', 'contact', 'mobile', 'telephone']);
        const rCurrentAddress = getVal(['clinic address', 'current address', 'address', 'location', 'place']);
        const rPermanentAddress = getVal(['home address', 'permanent address', 'homeaddress']);
        
        // Personal info
        const rFirstName = getVal(['first name', 'firstname', 'personal first name']);
        const rMiddleName = getVal(['middle name', 'middlename']);
        const rSurname = getVal(['surname', 'last name', 'lastname']);
        const rDOB = getVal(['dob', 'date of birth', 'birth date', 'birthdate']);
        const rGender = getVal(['gender', 'sex']);
        const rBloodGroup = getVal(['blood group', 'bloodgroup', 'blood']);
        const rMaritalStatus = getVal(['marital status', 'maritalstatus', 'marital']);
        const rFatherName = getVal(['father name', 'fathername', 'father']);
        const rMotherName = getVal(['mother name', 'mothername', 'mother']);

        // Coordinates
        const rLat = getVal(['clinic latitude', 'latitude', 'lat']);
        const rLng = getVal(['clinic longitude', 'longitude', 'lng', 'lon']);
        const rHomeLat = getVal(['home latitude', 'personal latitude', 'homelat']);
        const rHomeLng = getVal(['home longitude', 'personal longitude', 'homelng']);

        const rCity = getVal(['city', 'town', 'district']);
        const rPincode = getVal(['pincode', 'pincode', 'zip', 'postal']);

        // Set states if found
        if (rRole) {
          const upperRole = rRole.toUpperCase();
          if (upperRole.includes('DOC')) setRole('DOCTOR');
          else if (upperRole.includes('PHARM') || upperRole.includes('CHEM')) setRole('PHARMACIST');
        }
        if (rFullName) setFullName(rFullName);
        if (rEmail) setEmail(rEmail);
        if (rPhone) setPhone(rPhone);
        if (rCurrentAddress) setPersonalCurrentAddress(rCurrentAddress);
        
        if (rPermanentAddress) {
          setPersonalPermanentAddress(rPermanentAddress);
          setPersonalSameAsCurrentAddress(false);
        } else {
          setPersonalSameAsCurrentAddress(true);
        }

        if (rFirstName) setPersonalFirstName(rFirstName);
        if (rMiddleName) setPersonalMiddleName(rMiddleName);
        if (rSurname) setPersonalSurname(rSurname);
        
        // Format DOB to YYYY-MM-DD if excel serial date or string
        if (rDOB) {
          const serial = Number(rDOB);
          if (!isNaN(serial) && serial > 20000) {
            const dateObj = new Date((serial - 25569) * 86400 * 1000);
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
            const d = String(dateObj.getDate()).padStart(2, '0');
            setPersonalDateOfBirth(`${y}-${m}-${d}`);
          } else {
            try {
              const parsedDate = new Date(rDOB);
              if (!isNaN(parsedDate.getTime())) {
                const y = parsedDate.getFullYear();
                const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
                const d = String(parsedDate.getDate()).padStart(2, '0');
                setPersonalDateOfBirth(`${y}-${m}-${d}`);
              } else {
                setPersonalDateOfBirth(rDOB);
              }
            } catch (e) {
              setPersonalDateOfBirth(rDOB);
            }
          }
        }

        if (rGender) {
          const g = rGender.toLowerCase();
          if (g.startsWith('f')) setPersonalGender('Female');
          else if (g.startsWith('m')) setPersonalGender('Male');
          else setPersonalGender('Other');
        }

        if (rBloodGroup) {
          const bg = rBloodGroup.toUpperCase().replace(/\s+/g, '');
          const validBgList = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
          if (validBgList.includes(bg)) {
            setPersonalBloodGroup(bg);
          }
        }

        if (rMaritalStatus) {
          const m = rMaritalStatus.toLowerCase();
          if (m.startsWith('sing')) setPersonalMaritalStatus('Single');
          else if (m.startsWith('marr')) setPersonalMaritalStatus('Married');
          else if (m.startsWith('div')) setPersonalMaritalStatus('Divorced');
          else if (m.startsWith('wid')) setPersonalMaritalStatus('Widowed');
        }

        if (rFatherName) setPersonalFatherName(rFatherName);
        if (rMotherName) setPersonalMotherName(rMotherName);
        
        if (rLat) setLatitude(rLat);
        if (rLng) setLongitude(rLng);
        if (rHomeLat) setPersonalLatitude(rHomeLat);
        if (rHomeLng) setPersonalLongitude(rHomeLng);
        
        if (rCity) setCity(rCity);
        if (rPincode) setPincode(rPincode);

        setLocalSuccess('Excel sheet details imported and filled into the form successfully! Feel free to review and manually modify any values.');
        setLocalError(null);
      } catch (err) {
        console.error('Failed to parse Excel file:', err);
        setLocalError('Failed to parse Excel file. Please ensure it is a valid format.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
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
        handleCancel();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [reduxSuccess, role, dispatch]);

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

  return (
    <div className="max-w-[850px] mx-auto pb-10 fade-slide-in">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-6">
        <button
          onClick={handleCancel}
          className="bg-white border border-[#E5E7EB] rounded-xl p-2.5 cursor-pointer flex items-center justify-center text-[#374151] transition-colors duration-200 hover:bg-[#F9FAFB]"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-[11px] text-[#7C3AED] font-extrabold uppercase tracking-[1px]">
            REGISTRATION PORTAL
          </span>
          <h2 className="text-[24px] font-extrabold text-[#111827] mt-1 mb-0">
            Onboard New {role === 'DOCTOR' ? 'Doctor' : 'Pharmacist'}
          </h2>
        </div>
      </div>

      {/* Main Card Form */}
      <div className="bg-white rounded-[20px] border-[1.5px] border-[#F3F4F6] shadow-[0_10px_25px_rgba(0,0,0,0.02)] p-9 flex flex-col gap-7">
        <div>
          <h3 className="text-[18px] font-extrabold text-[#111827] m-0">
            {role === 'DOCTOR' ? 'Doctor' : 'Pharmacist'} Profile & Interactive Geolocation
          </h3>
          <p className="text-[13px] text-[#6B7280] mt-1 mb-0">
            Fill in the information below. Drag map pin to center coordinates, search by address, or capture live device GPS.
          </p>
        </div>

        {/* Excel Import Section */}
        <div className="bg-gradient-to-br from-[#7C3AED]/5 to-[#7C3AED]/10 border border-dashed border-[#7C3AED]/35 rounded-[15px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/12 flex items-center justify-center text-[#7C3AED]">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h4 className="text-[13.5px] font-extrabold text-[#111827] m-0">Import Details via Excel</h4>
              <p className="text-[11.5px] text-[#6B7280] m-0 mt-0.5">Upload a sheet to auto-fill the profile form fields below.</p>
            </div>
          </div>
          <label className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border-none bg-[#7C3AED] hover:opacity-90 text-white font-extrabold text-[12px] cursor-pointer shadow-md transition-all">
            Upload Excel File
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleExcelUpload} 
              className="hidden" 
            />
          </label>
        </div>

        {/* Notifications */}
        {localSuccess && (
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-3.5 rounded-xl flex items-center gap-2 text-[#047857] text-[13.5px] font-semibold">
            <CheckCircle2 size={16} />
            {localSuccess}
          </div>
        )}
        {localError && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] p-3.5 rounded-xl flex items-center gap-2 text-[#B91C1C] text-[13.5px] font-semibold">
            <AlertCircle size={16} />
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          {/* Section 1: Account Info */}
          <div>
            <div className="text-[15px] font-extrabold text-[#111827] border-b border-[#F3F4F6] pb-2 mb-1 flex items-center gap-2">
              <Users size={16} color="#7C3AED" />
              Account & Contacts
            </div>
            <div className="flex flex-col gap-4 mt-3">
              <div className="grid grid-cols-3 gap-4.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">Onboarding Role <span className="text-[#EF4444]">*</span></label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] cursor-pointer transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                  >
                    <option value="DOCTOR">Doctor</option>
                    <option value="PHARMACIST">Pharmacist</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">{role === 'DOCTOR' ? 'Doctor' : 'Pharmacist'} Full Name <span className="text-[#EF4444]">*</span></label>
                  <div className="relative flex items-center">
                    <User size={15} className="absolute left-3.5 text-[#9CA3AF]" />
                    <input
                      type="text"
                      placeholder={role === 'DOCTOR' ? 'Dr. Sarah Connor' : 'Jane Doe'}
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setLocalError(null); }}
                      required
                      disabled={isSubmitting}
                      className="w-full pl-9.5 pr-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">Email Address <span className="text-[#EF4444]">*</span></label>
                  <div className="relative flex items-center">
                    <Mail size={15} className="absolute left-3.5 text-[#9CA3AF]" />
                    <input
                      type="email"
                      placeholder="dr.sarah@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setLocalError(null); }}
                      required
                      disabled={isSubmitting}
                      className="w-full pl-9.5 pr-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">Contact Number <span className="text-[#EF4444]">*</span></label>
                  <div className="relative flex items-center">
                    <Phone size={15} className="absolute left-3.5 text-[#9CA3AF]" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543000"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setLocalError(null); }}
                      required
                      disabled={isSubmitting}
                      className="w-full pl-9.5 pr-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Clinic Location & Address */}
          <div>
            <div className="text-[15px] font-extrabold text-[#111827] border-b border-[#F3F4F6] pb-2 mb-1 flex items-center gap-2">
              <MapPin size={16} color="#7C3AED" />
              Location 1: Clinic / Hospital Details
            </div>
            <div className="flex flex-col gap-4 mt-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#4B5563]">Clinic Address <span className="text-[#EF4444]">*</span></label>
                <textarea
                  placeholder="Type clinic/hospital address... (Geocodes coordinates on blur)"
                  value={personalCurrentAddress}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onBlur={() => handleGeocodeClinicAddress(personalCurrentAddress)}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] min-h-[80px] font-sans resize-y transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                />
                
                {/* Actions row for Clinic Map */}
                <div className="flex gap-2 items-center mt-1.5">
                  <button
                    type="button"
                    onClick={handleClinicGPSDetect}
                    disabled={isWatchingClinic || isSubmitting}
                    className={`border-0 px-3 py-1.5 rounded-lg text-[11.5px] font-bold transition-colors duration-150 ${isWatchingClinic ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed' : 'bg-[#10B981] text-white cursor-pointer hover:bg-[#0e9f6e]'}`}
                  >
                    {isWatchingClinic ? '🛰️ Live GPS running...' : '🛰️ Use Live GPS'}
                  </button>
                  {isWatchingClinic && (
                    <button
                      type="button"
                      onClick={stopClinicWatch}
                      className="bg-[#EF4444] text-white border-0 px-3 py-1.5 rounded-lg text-[11.5px] font-bold cursor-pointer hover:bg-[#dc2626]"
                    >
                      🛑 Stop
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsClinicMapOpen(!isClinicMapOpen)}
                    className="bg-white text-[#4B5563] border border-[#E5E7EB] px-3 py-1.25 rounded-lg text-[11.5px] font-bold cursor-pointer hover:bg-gray-50"
                  >
                    {isClinicMapOpen ? '🗺️ Hide Map' : '🗺️ Pin on Map'}
                  </button>
                </div>

                {/* Inline Clinic Leaflet Map */}
                {isClinicMapOpen && (
                  <div className="h-[280px] w-full rounded-lg border-[1.5px] border-[#E5E7EB] box-border mt-2.5 overflow-hidden relative">
                    <div className="w-full h-full" ref={clinicMapContainerRef}></div>

                    {/* Central floating pin overlay */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none flex flex-col items-center">
                      <div className="w-8 h-9">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 21C16 16.8 19 12.8 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.8 8 16.8 12 21Z" fill="#7C3AED" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
                        </svg>
                      </div>
                      <div className="w-2.5 h-[3px] bg-black/20 blur-[1.5px] rounded-full mt-0.25 -translate-y-1"></div>
                    </div>
                  </div>
                )}

                {clinicGeoError && (
                  <span className="text-[11.5px] text-[#EF4444] font-semibold mt-1">
                    ⚠️ {clinicGeoError}
                  </span>
                )}

                {clinicGeocodeStatus && (
                  <span className="text-[11.5px] text-[#7C3AED] font-semibold mt-1">
                    {clinicGeocodeStatus}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">City</label>
                  <input
                    type="text"
                    placeholder="City (auto-filled)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">Pincode</label>
                  <input
                    type="text"
                    placeholder="Pincode (auto-filled)"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">Clinic Latitude</label>
                  <div className="relative flex items-center">
                    <MapPin size={15} className="absolute left-3.5 text-[#9CA3AF]" />
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
                      className="w-full pl-9.5 pr-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">Clinic Longitude</label>
                  <div className="relative flex items-center">
                    <MapPin size={15} className="absolute left-3.5 text-[#9CA3AF]" />
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
                      className="w-full pl-9.5 pr-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 my-1">
                <input
                  type="checkbox"
                  id="sameAsCurrentAddress"
                  checked={personalSameAsCurrentAddress}
                  onChange={(e) => setPersonalSameAsCurrentAddress(e.target.checked)}
                  disabled={isSubmitting}
                  className="cursor-pointer"
                />
                <label htmlFor="sameAsCurrentAddress" className="text-xs font-bold text-[#4B5563] cursor-pointer">
                  Doctor Home Address is same as Clinic Address
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Doctor Home Location & Address */}
          {!personalSameAsCurrentAddress && (
            <div>
              <div className="text-[15px] font-extrabold text-[#111827] border-b border-[#F3F4F6] pb-2 mb-1 flex items-center gap-2">
                <Heart size={16} color="#7C3AED" />
                Location 2: Doctor Home Details
              </div>
              <div className="flex flex-col gap-4 mt-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">Doctor Home Address <span className="text-[#EF4444]">*</span></label>
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
                    className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] min-h-[80px] font-sans resize-y transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                  />

                  {/* Actions row for Home Map */}
                  <div className="flex gap-2 items-center mt-1.5">
                    <button
                      type="button"
                      onClick={handleHomeGPSDetect}
                      disabled={isWatchingHome || isSubmitting}
                      className={`border-0 px-3 py-1.5 rounded-lg text-[11.5px] font-bold transition-colors duration-150 ${isWatchingHome ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed' : 'bg-[#10B981] text-white cursor-pointer hover:bg-[#0e9f6e]'}`}
                    >
                      {isWatchingHome ? '🛰️ Live GPS running...' : '🛰️ Use Live GPS'}
                    </button>
                    {isWatchingHome && (
                      <button
                        type="button"
                        onClick={stopHomeWatch}
                        className="bg-[#EF4444] text-white border-0 px-3 py-1.5 rounded-lg text-[11.5px] font-bold cursor-pointer hover:bg-[#dc2626]"
                      >
                        🛑 Stop
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsHomeMapOpen(!isHomeMapOpen)}
                      className="bg-white text-[#4B5563] border border-[#E5E7EB] px-3 py-1.25 rounded-lg text-[11.5px] font-bold cursor-pointer hover:bg-gray-50"
                    >
                      {isHomeMapOpen ? '🗺️ Hide Map' : '🗺️ Pin on Map'}
                    </button>
                  </div>

                  {/* Inline Home Leaflet Map */}
                  {isHomeMapOpen && (
                    <div className="h-[280px] w-full rounded-lg border-[1.5px] border-[#E5E7EB] box-border mt-2.5 overflow-hidden relative">
                      <div className="w-full h-full" ref={homeMapContainerRef}></div>

                      {/* Central floating pin overlay */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none flex flex-col items-center">
                        <div className="w-8 h-9">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21C16 16.8 19 12.8 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.8 8 16.8 12 21Z" fill="#7C3AED" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
                          </svg>
                        </div>
                        <div className="w-2.5 h-[3px] bg-black/20 blur-[1.5px] rounded-full mt-0.25 -translate-y-1"></div>
                      </div>
                    </div>
                  )}

                  {homeGeoError && (
                    <span className="text-[11.5px] text-[#EF4444] font-semibold mt-1">
                      ⚠️ {homeGeoError}
                    </span>
                  )}

                  {homeGeocodeStatus && (
                    <span className="text-[11.5px] text-[#7C3AED] font-semibold mt-1">
                      {homeGeocodeStatus}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#4B5563]">Home Latitude</label>
                    <div className="relative flex items-center">
                      <MapPin size={15} className="absolute left-3.5 text-[#9CA3AF]" />
                      <input
                        type="text"
                        value={personalLatitude}
                        onChange={(e) => setPersonalLatitude(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full pl-9.5 pr-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#4B5563]">Home Longitude</label>
                    <div className="relative flex items-center">
                      <MapPin size={15} className="absolute left-3.5 text-[#9CA3AF]" />
                      <input
                        type="text"
                        value={personalLongitude}
                        onChange={(e) => setPersonalLongitude(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full pl-9.5 pr-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Personal Profile Details */}
          <div>
            <div className="text-[15px] font-extrabold text-[#111827] border-b border-[#F3F4F6] pb-2 mb-1 flex items-center gap-2">
              <User size={16} color="#7C3AED" />
              Doctor Personal Details
            </div>
            <div className="flex flex-col gap-4 mt-3">
              <div className="grid grid-cols-3 gap-4.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">First Name <span className="text-[#EF4444]">*</span></label>
                  <input
                    type="text"
                    placeholder="Sarah"
                    value={personalFirstName}
                    onChange={(e) => setPersonalFirstName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">Middle Name</label>
                  <input
                    type="text"
                    placeholder="Middle Name"
                    value={personalMiddleName}
                    onChange={(e) => setPersonalMiddleName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">Surname <span className="text-[#EF4444]">*</span></label>
                  <input
                    type="text"
                    placeholder="Connor"
                    value={personalSurname}
                    onChange={(e) => setPersonalSurname(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">Date of Birth <span className="text-[#EF4444]">*</span></label>
                  <div className="relative flex items-center">
                    <Calendar size={15} className="absolute left-3.5 text-[#9CA3AF]" />
                    <input
                      type="date"
                      value={personalDateOfBirth}
                      onChange={(e) => setPersonalDateOfBirth(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full pl-9.5 pr-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">Gender</label>
                  <select
                    value={personalGender}
                    onChange={(e) => setPersonalGender(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] cursor-pointer transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">Blood Group</label>
                  <select
                    value={personalBloodGroup}
                    onChange={(e) => setPersonalBloodGroup(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] cursor-pointer transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
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

              <div className="grid grid-cols-3 gap-4.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">Marital Status</label>
                  <select
                    value={personalMaritalStatus}
                    onChange={(e) => setPersonalMaritalStatus(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] cursor-pointer transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">Father's Name <span className="text-[#EF4444]">*</span></label>
                  <input
                    type="text"
                    placeholder="John Connor Sr."
                    value={personalFatherName}
                    onChange={(e) => setPersonalFatherName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#4B5563]">Mother's Name <span className="text-[#EF4444]">*</span></label>
                  <input
                    type="text"
                    placeholder="Jane Connor"
                    value={personalMotherName}
                    onChange={(e) => setPersonalMotherName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E7EB] text-[13.5px] text-[#1F2937] outline-none box-border bg-[#FAFAFA] transition-all duration-200 focus:border-[#7C3AED] focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end mt-3 border-t border-[#F3F4F6] pt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-[22px] py-[11px] rounded-xl border-[1.5px] border-[#E5E7EB] bg-white text-[#374151] font-bold text-[13.5px] cursor-pointer transition-colors duration-200 hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-[11px] rounded-xl border-0 bg-[#7C3AED] text-white font-extrabold text-[13.5px] cursor-pointer shadow-[0_4px_14px_rgba(124,58,237,0.2)] transition-opacity duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Onboarding...
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
      `}</style>
    </div>
  );
};

export default MSEDoctorOnboarding;

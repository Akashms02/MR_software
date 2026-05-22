import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  saveOnboardingStep,
  fetchOnboardingStatus,
  fetchReportingManagers,
} from '../../redux/actions/teamActions';
import {
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
} from 'lucide-react';

const STEP_LABELS = [
  'Basic Setup',
  'Personal Info',
  'Employment',
  'Experience',
  'Bank Details',
  'Statutory',
  'Verification',
];

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '12px',
  border: '1.5px solid #E5E7EB',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#FAFAFA',
  transition: 'border-color 0.2s',
};
const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: '#374151',
  marginBottom: '8px',
};
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };

const FileDropzone = ({ label, file, onChange, required = false }) => (
  <div>
    <label style={labelStyle}>
      {label}
      {required && <span style={{ color: '#EF4444' }}> *</span>}
    </label>
    <div
      style={{
        border: `2px dashed ${file ? '#6366F1' : '#E5E7EB'}`,
        padding: '18px 16px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        background: file ? '#EEF2FF' : '#FAFAFA',
        position: 'relative',
        transition: 'all 0.2s',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: file ? '#6366F1' : '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Upload size={16} color={file ? '#fff' : '#9CA3AF'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: file ? '#4338CA' : '#374151',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {file ? file.name : `Choose ${label}`}
        </div>
        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
          PDF, JPG, PNG · Max 5MB
        </div>
      </div>
      <input
        type="file"
        onChange={(e) => onChange(e.target.files[0])}
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
      />
    </div>
  </div>
);

const OnboardingWizard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.team);

  const [activeStep, setActiveStep] = useState(1);
  const [employeeId, setEmployeeId] = useState('');
  // Track which step we resumed at (steps before this are already on the backend)
  const [resumedFromStep, setResumedFromStep] = useState(1);
  // True when the session was loaded via the status API (not a fresh start)
  const [isResumed, setIsResumed] = useState(false);
  const [resumeId, setResumeId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('employeeId')?.toUpperCase() || '';
  });
  const [resumeLoading, setResumeLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const [reportingManagers, setReportingManagers] = useState([]);

  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'MR',
    reportingToId: '',
    // Step 2
    firstName: '',
    middleName: '',
    surname: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'A+',
    maritalStatus: 'Single',
    fatherName: '',
    motherName: '',
    currentAddress: '',
    permanentAddress: '',
    sameAsCurrentAddress: false,
    // Step 3
    department: '',
    designation: '',
    dateOfJoining: '',
    workLocation: '',
    employmentType: 'Full-time',
    salaryDetails: '',
    isFresher: false,
    // Step 4
    companyName: '',
    prevDesignation: '',
    prevDepartment: '',
    totalExperience: '',
    expFromDate: '',
    expToDate: '',
    // Step 5
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    // Step 6
    panNumber: '',
    aadharNumber: '',
    uanNumber: '',
    pfNumber: '',
    esiNumber: '',
    // Step 7
    emergencyContactName: '',
    relationship: '',
    emergencyContactNumber: '',
    alternateContactNumber: '',
  });

  const [experienceLetter, setExperienceLetter] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [aadharDoc, setAadharDoc] = useState(null);
  const [panDoc, setPanDoc] = useState(null);
  const [resumeDoc, setResumeDoc] = useState(null);

  // Called on blur of the Employee ID field (like EmployeeOnboarding reference)
  const handleIdCheck = async (overrideId) => {
    const checkId = (overrideId || resumeId).trim();
    if (!checkId) return;
    setResumeLoading(true);
    setFormError(null);
    try {
      const res = await dispatch(fetchOnboardingStatus(checkId));
      const data = res.data;

      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        password: '',
        role: data.role || 'MR',
        reportingToId: data.reportingToId || '',

        firstName: data.personal?.firstName || '',
        middleName: data.personal?.middleName || '',
        surname: data.personal?.surname || '',
        dateOfBirth: data.personal?.dateOfBirth || '',
        gender: data.personal?.gender || 'Male',
        bloodGroup: data.personal?.bloodGroup || 'A+',
        maritalStatus: data.personal?.maritalStatus || 'Single',
        fatherName: data.personal?.fatherName || '',
        motherName: data.personal?.motherName || '',
        currentAddress: data.personal?.currentAddress || '',
        permanentAddress: data.personal?.permanentAddress || '',
        sameAsCurrentAddress: data.personal?.sameAsCurrentAddress || false,

        department: data.employment?.department || '',
        designation: data.employment?.designation || '',
        dateOfJoining: data.employment?.dateOfJoining || '',
        workLocation: data.employment?.workLocation || '',
        employmentType: data.employment?.employmentType || 'Full-time',
        salaryDetails: data.employment?.salaryDetails || '',
        isFresher: data.employment?.isFresher || false,

        companyName: data.employment?.companyName || '',
        prevDesignation: data.employment?.prevDesignation || '',
        prevDepartment: data.employment?.prevDepartment || '',
        totalExperience: data.employment?.totalExperience || '',
        expFromDate: data.employment?.expFromDate || '',
        expToDate: data.employment?.expToDate || '',

        bankName: data.bank?.bankName || '',
        accountNumber: data.bank?.accountNumber || '',
        ifscCode: data.bank?.ifscCode || '',
        branchName: data.bank?.branchName || '',

        panNumber: data.statutory?.panNumber || '',
        aadharNumber: data.statutory?.aadharNumber || '',
        uanNumber: data.statutory?.uanNumber || '',
        pfNumber: data.statutory?.pfNumber || '',
        esiNumber: data.statutory?.esiNumber || '',

        emergencyContactName: data.emergency?.emergencyContactName || '',
        relationship: data.emergency?.relationship || '',
        emergencyContactNumber: data.emergency?.emergencyContactNumber || '',
        alternateContactNumber: data.emergency?.alternateContactNumber || '',
      });

      setEmployeeId(data.employeeId);
      // Mark this as a resumed session — step 1 account already exists on backend
      setIsResumed(true);
      setResumedFromStep(data.onboardingStep);
      setActiveStep(data.onboardingStep);
      setFormSuccess(
        `✅ Loaded onboarding for ${data.fullName}. Resuming at Step ${data.onboardingStep}.`
      );
      setTimeout(() => setFormSuccess(null), 4000);
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          err.message ||
          'Employee not found. Leave empty to start a fresh onboarding.'
      );
      setTimeout(() => setFormError(null), 4000);
    } finally {
      setResumeLoading(false);
    }
  };

  // Auto-load if employeeId is in the URL query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('employeeId');
    if (id) {
      setTimeout(() => {
        handleIdCheck(id);
      }, 0);
    }
  }, []); // eslint-disable-line

  // Fetch reporting managers list for Step 1
  useEffect(() => {
    const loadReportingManagers = async () => {
      try {
        const res = await dispatch(fetchReportingManagers());
        const managerList = res?.data || res || [];
        if (Array.isArray(managerList)) {
          setReportingManagers(managerList);
        }
      } catch (err) {
        console.error('Failed to load reporting managers:', err);
      }
    };

    loadReportingManagers();
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    if (name === 'sameAsCurrentAddress' && checked) {
      setFormData((prev) => ({
        ...prev,
        sameAsCurrentAddress: true,
        permanentAddress: prev.currentAddress,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: val }));
    }
  };

  /**
   * Returns true if this step was already submitted to the backend in a previous
   * session and should be skipped (no API call, just advance the UI).
   *
   * Rules:
   *  - Step 1 is ALWAYS skipped on resume — the employee account already exists,
   *    calling it again causes "email already used" errors.
   *  - Any step below resumedFromStep is also already saved on the backend.
   */
  const isStepAlreadyDone = (step) => {
    if (step === 1 && employeeId) return true; // Step 1 is always completed if we have an employeeId
    if (!isResumed) return false;              // fresh session — nothing pre-done
    return step < resumedFromStep;             // earlier steps are saved on backend
  };

  const handleStepSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // If user filled in a Resume ID in Step 1, verify we checked/loaded it first.
    // This prevents submitting Step 1 (creating a new user) when they intended to resume.
    if (activeStep === 1 && resumeId.trim()) {
      const cleanResumeId = resumeId.trim().toUpperCase();
      if (employeeId !== cleanResumeId) {
        await handleIdCheck(cleanResumeId);
        return;
      }
    }

    // ── Skip API for steps already completed on the backend ──────────
    if (isStepAlreadyDone(activeStep)) {
      if (activeStep < 7) {
        setActiveStep((prev) => prev + 1);
      } else {
        navigate('/admin/myteam');
      }
      return;
    }

    try {
      let payload;
      let isMultipart = false;

      if (activeStep === 1) {
        payload = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          ...(formData.password ? { password: formData.password } : {}),
          ...(formData.reportingToId
            ? { reportingToId: parseInt(formData.reportingToId) }
            : {}),
        };
      } else if (activeStep === 2) {
        payload = {
          firstName: formData.firstName,
          middleName: formData.middleName,
          surname: formData.surname,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          maritalStatus: formData.maritalStatus,
          fatherName: formData.fatherName,
          motherName: formData.motherName,
          currentAddress: formData.currentAddress,
          permanentAddress: formData.permanentAddress,
          sameAsCurrentAddress: formData.sameAsCurrentAddress,
        };
      } else if (activeStep === 3) {
        payload = {
          department: formData.department,
          designation: formData.designation,
          dateOfJoining: formData.dateOfJoining,
          workLocation: formData.workLocation,
          employmentType: formData.employmentType,
          salaryDetails: formData.salaryDetails
            ? parseFloat(formData.salaryDetails)
            : null,
          isFresher: formData.isFresher,
        };
      } else if (activeStep === 4) {
        isMultipart = true;
        const form = new FormData();
        form.append('companyName', formData.companyName || '');
        form.append('prevDesignation', formData.prevDesignation || '');
        form.append('prevDepartment', formData.prevDepartment || '');
        form.append('totalExperience', formData.totalExperience || '');
        form.append('expFromDate', formData.expFromDate || '');
        form.append('expToDate', formData.expToDate || '');
        if (experienceLetter) form.append('experienceLetter', experienceLetter);
        payload = form;
      } else if (activeStep === 5) {
        payload = {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          branchName: formData.branchName,
        };
      } else if (activeStep === 6) {
        payload = {
          panNumber: formData.panNumber,
          aadharNumber: formData.aadharNumber,
          uanNumber: formData.uanNumber,
          pfNumber: formData.pfNumber,
          esiNumber: formData.esiNumber,
        };
      } else if (activeStep === 7) {
        isMultipart = true;
        const form = new FormData();
        form.append('emergencyContactName', formData.emergencyContactName || '');
        form.append('relationship', formData.relationship || '');
        form.append(
          'emergencyContactNumber',
          formData.emergencyContactNumber || ''
        );
        form.append(
          'alternateContactNumber',
          formData.alternateContactNumber || ''
        );
        if (profilePhoto) form.append('profilePhoto', profilePhoto);
        if (aadharDoc) form.append('aadharDoc', aadharDoc);
        if (panDoc) form.append('panDoc', panDoc);
        if (resumeDoc) form.append('resumeDoc', resumeDoc);
        payload = form;
      }

      const response = await dispatch(
        saveOnboardingStep(activeStep, employeeId, payload, isMultipart)
      );

      if (activeStep === 1 && response?.data?.employeeId) {
        setEmployeeId(response.data.employeeId);
      }

      if (activeStep < 7) {
        setFormSuccess(`Step ${activeStep} saved!`);
        setIsResumed(true);
        setResumedFromStep((prev) => Math.max(prev, activeStep + 1));
        setTimeout(() => {
          setFormSuccess(null);
          setActiveStep((prev) => prev + 1);
        }, 800);
      } else {
        setFormSuccess('🎉 Onboarding complete! Redirecting...');
        setTimeout(() => navigate('/admin/myteam'), 2000);
      }
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          err.message ||
          'An error occurred. Please try again.'
      );
    }
  };

  return (
    <div style={{ animation: 'fadeSlideIn 0.35s ease-out' }}>
      {/* ── Header ───────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '28px',
        }}
      >
        <button
          onClick={() => navigate('/admin/myteam')}
          style={{
            background: '#F3F4F6',
            border: 'none',
            borderRadius: '12px',
            padding: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#E5E7EB')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#F3F4F6')}
        >
          <ChevronLeft size={20} color="#374151" />
        </button>
        <div style={{ flex: 1 }}>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#111827',
              margin: 0,
            }}
          >
            Employee Onboarding
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '3px 0 0 0' }}>
            Follow the 7-step wizard to complete employee registration.
          </p>
        </div>
        {employeeId && (
          <span
            style={{
              background: '#ECFDF5',
              color: '#047857',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              border: '1px solid #D1FAE5',
            }}
          >
            EMP ID: {employeeId}
          </span>
        )}
      </div>

      {/* ── Step Progress Bar ─────────────────────────────────────── */}
      <div
        style={{
          background: '#fff',
          borderRadius: '18px',
          padding: '18px 24px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
        }}
      >
        {STEP_LABELS.map((name, i) => {
          const n = i + 1;
          const done = n < activeStep;
          const active = n === activeStep;
          // Steps below resumedFromStep were completed on the backend before this session
          const preCompleted = n < resumedFromStep;
          return (
            <React.Fragment key={n}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: done
                      ? preCompleted ? '#6366F1' : '#10B981'
                      : active ? '#111827' : '#F3F4F6',
                    color: done || active ? '#fff' : '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '13px',
                    transition: 'all 0.3s',
                  }}
                  title={preCompleted && done ? 'Already submitted' : ''}
                >
                  {done ? '✓' : n}
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: active ? 800 : 600,
                    color: active ? '#111827' : done ? (preCompleted ? '#6366F1' : '#10B981') : '#9CA3AF',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {name}
                  {preCompleted && done && (
                    <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.7 }}>✦</span>
                  )}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: done ? (preCompleted ? '#6366F1' : '#10B981') : '#F3F4F6',
                    minWidth: '16px',
                    transition: 'background 0.3s',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Main Card ─────────────────────────────────────────────── */}
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          padding: '36px 40px',
        }}
      >
        {/* Alerts */}
        {formError && (
          <div
            style={{
              background: '#FEF2F2',
              border: '1.5px solid #FECACA',
              padding: '14px 18px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#B91C1C',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '24px',
              animation: 'fadeSlideIn 0.2s ease-out',
            }}
          >
            <AlertCircle size={18} />
            {formError}
          </div>
        )}
        {formSuccess && (
          <div
            style={{
              background: '#ECFDF5',
              border: '1.5px solid #A7F3D0',
              padding: '14px 18px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#047857',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '24px',
              animation: 'fadeSlideIn 0.2s ease-out',
            }}
          >
            <CheckCircle2 size={18} />
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleStepSubmit}>
          {/* ═══ STEP 1: Basic Setup ══════════════════════════════════ */}
          {activeStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <h4
                  style={{
                    margin: '0 0 4px 0',
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#111827',
                  }}
                >
                  Step 1: Account Setup & Credentials
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
                  Fill in basic login credentials. Enter an Employee ID to resume
                  an existing onboarding.
                </p>
              </div>

              {/* Employee ID field — same pattern as EmployeeOnboarding reference */}
              <div style={gridStyle}>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: '8px',
                    }}
                  >
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                      Employee ID
                    </label>
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                      Enter to resume • leave empty for new
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={resumeId}
                      onChange={(e) =>
                        setResumeId(e.target.value.toUpperCase())
                      }
                      onBlur={() => handleIdCheck()}
                      placeholder="e.g. EMP-2026-0001"
                      style={{
                        ...inputStyle,
                        paddingRight: resumeLoading ? '42px' : '16px',
                      }}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = '#6366F1')
                      }
                      onBlurCapture={(e) =>
                        (e.currentTarget.style.borderColor = '#E5E7EB')
                      }
                    />
                    {resumeLoading && (
                      <Loader2
                        size={16}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#6B7280',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>
                    Full Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Rajesh Kumar"
                    style={inputStyle}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = '#6366F1')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = '#E5E7EB')
                    }
                  />
                </div>
              </div>

              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>
                    Email Address <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="rajesh@example.com"
                    style={inputStyle}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = '#6366F1')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = '#E5E7EB')
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Phone Number <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="9876543210"
                    style={inputStyle}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = '#6366F1')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = '#E5E7EB')
                    }
                  />
                </div>
              </div>

              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Role Type</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, background: '#fff' }}
                  >
                    <option value="MR">Medical Representative (MR)</option>
                    <option value="HR">HR Manager</option>
                    <option value="REGIONAL_MANAGER">Regional Manager</option>
                    <option value="AREA_MANAGER">Area Manager</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="PHARMACIST">Pharmacist</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                    <option value="PATIENT">Patient</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>
                    Reporting Manager{' '}
                    <span style={{ fontSize: '11px', fontWeight: 400, color: '#9CA3AF' }}>
                      (Optional)
                    </span>
                  </label>
                  <select
                    name="reportingToId"
                    value={formData.reportingToId}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, background: '#fff' }}
                  >
                    <option value="">Select Reporting Manager</option>
                    {reportingManagers.map((mgr) => (
                      <option key={mgr.id} value={mgr.id}>
                        {mgr.fullName || mgr.name || `ID: ${mgr.id}`} {mgr.role ? `(${mgr.role.replace(/_/g, ' ')})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ maxWidth: '50%' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '8px',
                  }}
                >
                  <label style={{ ...labelStyle, marginBottom: 0 }}>
                    Security Password
                  </label>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                    Leave empty to auto-generate
                  </span>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = '#6366F1')
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = '#E5E7EB')
                  }
                />
              </div>
            </div>
          )}

          {/* ═══ STEP 2: Personal Info ════════════════════════════════ */}
          {activeStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                Step 2: Personal Profile & Demographics
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                {[
                  ['firstName', 'First Name', true],
                  ['middleName', 'Middle Name', false],
                  ['surname', 'Surname', true],
                ].map(([field, label, req]) => (
                  <div key={field}>
                    <label style={labelStyle}>
                      {label}
                      {req && <span style={{ color: '#EF4444' }}> *</span>}
                    </label>
                    <input
                      name={field}
                      value={formData[field]}
                      onChange={handleInputChange}
                      required={req}
                      placeholder={label}
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>
                    Date of Birth <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Gender <span style={{ color: '#EF4444' }}>*</span></label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, background: '#fff' }}
                  >
                    {['Male', 'Female', 'Other'].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, background: '#fff' }}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Marital Status</label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, background: '#fff' }}
                  >
                    {['Single', 'Married', 'Divorced', 'Widowed'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Father's Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    required
                    placeholder="Father's Full Name"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Mother's Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    required
                    placeholder="Mother's Full Name"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Current Address <span style={{ color: '#EF4444' }}>*</span></label>
                <textarea
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="Flat, Building, Street, Area, City, PIN"
                  style={{ ...inputStyle, height: '80px', resize: 'none' }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#374151',
                    cursor: 'pointer',
                    marginBottom: '8px',
                  }}
                >
                  <input
                    type="checkbox"
                    name="sameAsCurrentAddress"
                    id="sameAddr"
                    checked={formData.sameAsCurrentAddress}
                    onChange={handleInputChange}
                    style={{ width: '16px', height: '16px' }}
                  />
                  Permanent address is same as current address
                </label>
                {!formData.sameAsCurrentAddress && (
                  <textarea
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleInputChange}
                    required
                    placeholder="Flat, Building, Street, Area, City, PIN"
                    style={{ ...inputStyle, height: '80px', resize: 'none' }}
                  />
                )}
              </div>
            </div>
          )}

          {/* ═══ STEP 3: Employment ══════════════════════════════════ */}
          {activeStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                Step 3: Professional & Employment Details
              </h4>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Department <span style={{ color: '#EF4444' }}>*</span></label>
                  <input name="department" value={formData.department} onChange={handleInputChange} required placeholder="e.g. Sales, Operations" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
                <div>
                  <label style={labelStyle}>Designation <span style={{ color: '#EF4444' }}>*</span></label>
                  <input name="designation" value={formData.designation} onChange={handleInputChange} required placeholder="e.g. Senior MR" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
              </div>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Date of Joining <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleInputChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Work Location <span style={{ color: '#EF4444' }}>*</span></label>
                  <input name="workLocation" value={formData.workLocation} onChange={handleInputChange} required placeholder="e.g. Bangalore HQ" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
              </div>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Employment Type</label>
                  <select name="employmentType" value={formData.employmentType} onChange={handleInputChange} style={{ ...inputStyle, background: '#fff' }}>
                    {['Full-time', 'Part-time', 'Contract', 'Internship'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Annual CTC <span style={{ fontSize: '11px', fontWeight: 400, color: '#9CA3AF' }}>(Optional)</span></label>
                  <input type="number" name="salaryDetails" value={formData.salaryDetails} onChange={handleInputChange} placeholder="e.g. 500000" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" name="isFresher" id="isFresher" checked={formData.isFresher} onChange={handleInputChange} style={{ width: '16px', height: '16px' }} />
                Candidate is a fresher (Step 4 – Experience – is optional)
              </label>
            </div>
          )}

          {/* ═══ STEP 4: Experience ══════════════════════════════════ */}
          {activeStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111827' }}>Step 4: Past Work Experience</h4>
                {formData.isFresher && (
                  <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}>Fresher – Optional</span>
                )}
              </div>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Previous Company{!formData.isFresher && <span style={{ color: '#EF4444' }}> *</span>}</label>
                  <input name="companyName" value={formData.companyName} onChange={handleInputChange} required={!formData.isFresher} placeholder="e.g. Novartis India" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
                <div>
                  <label style={labelStyle}>Previous Designation{!formData.isFresher && <span style={{ color: '#EF4444' }}> *</span>}</label>
                  <input name="prevDesignation" value={formData.prevDesignation} onChange={handleInputChange} required={!formData.isFresher} placeholder="e.g. MR" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Department <span style={{ fontSize: '11px', fontWeight: 400, color: '#9CA3AF' }}>(Optional)</span></label>
                  <input name="prevDepartment" value={formData.prevDepartment} onChange={handleInputChange} placeholder="e.g. Sales" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
                <div>
                  <label style={labelStyle}>From Date</label>
                  <input type="date" name="expFromDate" value={formData.expFromDate} onChange={handleInputChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>To Date</label>
                  <input type="date" name="expToDate" value={formData.expToDate} onChange={handleInputChange} style={inputStyle} />
                </div>
              </div>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Total Experience</label>
                  <input name="totalExperience" value={formData.totalExperience} onChange={handleInputChange} placeholder="e.g. 2 Years 4 Months" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
                <FileDropzone label="Experience Letter" file={experienceLetter} onChange={setExperienceLetter} />
              </div>
            </div>
          )}

          {/* ═══ STEP 5: Bank Details ════════════════════════════════ */}
          {activeStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111827' }}>Step 5: Salary Bank Account Details</h4>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Bank Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <input name="bankName" value={formData.bankName} onChange={handleInputChange} required placeholder="e.g. HDFC Bank" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
                <div>
                  <label style={labelStyle}>Account Number <span style={{ color: '#EF4444' }}>*</span></label>
                  <input name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} required placeholder="e.g. 50100249240212" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
              </div>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>IFSC Code <span style={{ color: '#EF4444' }}>*</span></label>
                  <input name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} required placeholder="e.g. HDFC0000124" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
                <div>
                  <label style={labelStyle}>Branch Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <input name="branchName" value={formData.branchName} onChange={handleInputChange} required placeholder="e.g. Koramangala Branch" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 6: Statutory ══════════════════════════════════ */}
          {activeStep === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111827' }}>Step 6: Statutory Details & Legal IDs</h4>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>PAN Number <span style={{ color: '#EF4444' }}>*</span></label>
                  <input name="panNumber" value={formData.panNumber} onChange={handleInputChange} required placeholder="e.g. ABCDE1234F" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
                <div>
                  <label style={labelStyle}>Aadhaar Number <span style={{ color: '#EF4444' }}>*</span></label>
                  <input name="aadharNumber" value={formData.aadharNumber} onChange={handleInputChange} required placeholder="e.g. 1234 5678 9012" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                {[
                  ['uanNumber', 'UAN Number', 'e.g. 100912482402'],
                  ['pfNumber', 'EPF Account No.', 'e.g. MH/BAN/0012345'],
                  ['esiNumber', 'ESIC Number', 'e.g. 31000123450001001'],
                ].map(([field, label, ph]) => (
                  <div key={field}>
                    <label style={labelStyle}>{label} <span style={{ fontSize: '11px', fontWeight: 400, color: '#9CA3AF' }}>(Optional)</span></label>
                    <input name={field} value={formData[field]} onChange={handleInputChange} placeholder={ph} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ STEP 7: Verification & Emergency ══════════════════ */}
          {activeStep === 7 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111827' }}>Step 7: Verification Documents & Emergency Contact</h4>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Emergency Contact Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <input name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} required placeholder="Full Name of Contact Person" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
                <div>
                  <label style={labelStyle}>Relationship <span style={{ color: '#EF4444' }}>*</span></label>
                  <input name="relationship" value={formData.relationship} onChange={handleInputChange} required placeholder="e.g. Father, Spouse" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
              </div>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Contact Number <span style={{ color: '#EF4444' }}>*</span></label>
                  <input name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleInputChange} required placeholder="Primary Phone" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
                <div>
                  <label style={labelStyle}>Alternate Number <span style={{ fontSize: '11px', fontWeight: 400, color: '#9CA3AF' }}>(Optional)</span></label>
                  <input name="alternateContactNumber" value={formData.alternateContactNumber} onChange={handleInputChange} placeholder="Secondary Phone" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')} />
                </div>
              </div>
              <div style={gridStyle}>
                <FileDropzone label="Profile Photo (Passport size)" file={profilePhoto} onChange={setProfilePhoto} required />
                <FileDropzone label="Aadhaar Card Document" file={aadharDoc} onChange={setAadharDoc} />
              </div>
              <div style={gridStyle}>
                <FileDropzone label="PAN Card Document" file={panDoc} onChange={setPanDoc} />
                <FileDropzone label="Resume / CV" file={resumeDoc} onChange={setResumeDoc} />
              </div>
            </div>
          )}

          {/* ── Navigation Footer ─────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '40px',
              paddingTop: '24px',
              borderTop: '1.5px solid #F3F4F6',
            }}
          >
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep((p) => p - 1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 22px',
                  borderRadius: '12px',
                  border: '1.5px solid #E5E7EB',
                  background: '#fff',
                  color: '#374151',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}
            <button
              type="submit"
              disabled={loading || resumeLoading || !!formSuccess}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                borderRadius: '12px',
                border: 'none',
                background: isStepAlreadyDone(activeStep) ? '#6366F1' : '#111827',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                cursor: (loading || resumeLoading || !!formSuccess) ? 'not-allowed' : 'pointer',
                opacity: (loading || resumeLoading || !!formSuccess) ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: isStepAlreadyDone(activeStep)
                  ? '0 4px 12px rgba(99,102,241,0.3)'
                  : '0 4px 12px rgba(17,24,39,0.2)',
              }}
              onMouseEnter={(e) => {
                if (!loading && !resumeLoading && !formSuccess)
                  e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
              ) : null}
              {activeStep === 7
                ? 'Complete Onboarding'
                : isStepAlreadyDone(activeStep)
                ? 'Next'
                : 'Save & Continue'}
              {!loading && activeStep < 7 && <ArrowRight size={16} />}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default OnboardingWizard;

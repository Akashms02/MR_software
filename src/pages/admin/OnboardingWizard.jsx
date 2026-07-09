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
import { useToast } from '../../context/ToastContext';

const STEP_LABELS = [
  'Basic Setup',
  'Personal Info',
  'Employment',
  'Experience',
  'Bank Details',
  'Statutory',
  'Verification',
];

// Sub-component for input fields to keep JSX dry and use premium Tailwind classes
const FormField = ({
  label,
  name,
  value,
  onChange,
  required = false,
  type = 'text',
  placeholder = '',
  options = null,
}) => {
  const inputClass = "w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-200 text-sm outline-none bg-white transition-[border-color] duration-200 focus:border-indigo-500";
  const selectClass = "w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-200 text-sm outline-none bg-white transition-[border-color] duration-200 focus:border-indigo-500 cursor-pointer";

  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={selectClass}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
};

const FileDropzone = ({ label, file, onChange, required = false }) => (
  <div>
    <label className="block text-xs font-bold text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    <div
      className={`border-2 border-dashed p-4 rounded-xl flex items-center gap-3 cursor-pointer relative transition-all duration-200 ${
        file ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-[#FAFAFA]'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          file ? 'bg-indigo-600' : 'bg-gray-100'
        }`}
      >
        <Upload size={16} className={file ? 'text-white' : 'text-gray-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`text-[13px] font-bold truncate ${
            file ? 'text-indigo-700' : 'text-gray-700'
          }`}
        >
          {file ? file.name : `Choose ${label}`}
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">
          PDF, JPG, PNG · Max 5MB
        </div>
      </div>
      <input
        type="file"
        onChange={(e) => onChange(e.target.files[0])}
        className="absolute inset-0 opacity-0 cursor-pointer"
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
  const { showToast } = useToast();
  const [formError, _setFormError] = useState(null);
  const [formSuccess, _setFormSuccess] = useState(null);

  const setFormError = (msg) => {
    _setFormError(msg);
    if (msg) showToast(msg, 'error');
  };
  const setFormSuccess = (msg) => {
    _setFormSuccess(msg);
    if (msg) showToast(msg, 'success');
  };

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
    let val = type === 'checkbox' ? checked : value;

    if (name === 'phone' || name === 'emergencyContactNumber' || name === 'alternateContactNumber') {
      val = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'aadharNumber' || name === 'uanNumber') {
      val = value.replace(/\D/g, '').slice(0, 12);
    } else if (name === 'esiNumber') {
      val = value.replace(/\D/g, '').slice(0, 17);
    } else if (name === 'accountNumber') {
      val = value.replace(/\D/g, '').slice(0, 18);
    } else if (name === 'panNumber') {
      val = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    } else if (name === 'ifscCode') {
      val = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
    }

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

    // ── Validation Checks ───────────────────────────────────────────
    if (activeStep === 1) {
      // Full Name
      if (!formData.fullName.trim()) return setFormError("Full Name is required.");
      if (formData.fullName.trim().length < 2) return setFormError("Full Name must be at least 2 characters.");
      if (/\d/.test(formData.fullName.trim())) return setFormError("Full Name must not contain numbers.");

      // Email
      if (!formData.email.trim()) return setFormError("Email address is required.");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) return setFormError("Please enter a valid email address.");

      // Phone
      if (!formData.phone.trim()) return setFormError("Phone number is required.");
      if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
        return setFormError("Phone number must start with 6, 7, 8, or 9 and be exactly 10 digits.");
      }
    } else if (activeStep === 2) {
      // First Name
      if (!formData.firstName.trim()) return setFormError("First Name is required.");
      if (formData.firstName.trim().length < 2) return setFormError("First Name must be at least 2 characters.");
      if (/\d/.test(formData.firstName.trim())) return setFormError("First Name must not contain numbers.");

      // Surname
      if (!formData.surname.trim()) return setFormError("Surname is required.");
      if (formData.surname.trim().length < 2) return setFormError("Surname must be at least 2 characters.");
      if (/\d/.test(formData.surname.trim())) return setFormError("Surname must not contain numbers.");

      // Date of Birth
      if (!formData.dateOfBirth) return setFormError("Date of Birth is required.");
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (dob >= today) return setFormError("Date of Birth cannot be in the future.");
      const age = (today - dob) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) return setFormError("Employee must be at least 18 years old.");
      if (age > 65) return setFormError("Employee age exceeds standard working limit (65 years).");

      // Father's Name
      if (!formData.fatherName.trim()) return setFormError("Father's Name is required.");
      if (formData.fatherName.trim().length < 2) return setFormError("Father's Name must be at least 2 characters.");
      if (/\d/.test(formData.fatherName.trim())) return setFormError("Father's Name must not contain numbers.");

      // Mother's Name
      if (!formData.motherName.trim()) return setFormError("Mother's Name is required.");
      if (formData.motherName.trim().length < 2) return setFormError("Mother's Name must be at least 2 characters.");
      if (/\d/.test(formData.motherName.trim())) return setFormError("Mother's Name must not contain numbers.");

      // Addresses
      if (!formData.currentAddress.trim()) return setFormError("Current Address is required.");
      if (formData.currentAddress.trim().length < 10) return setFormError("Current Address must be at least 10 characters.");
      if (!formData.sameAsCurrentAddress) {
        if (!formData.permanentAddress.trim()) return setFormError("Permanent Address is required.");
        if (formData.permanentAddress.trim().length < 10) return setFormError("Permanent Address must be at least 10 characters.");
      }
    } else if (activeStep === 5) {
      if (!formData.bankName.trim()) return setFormError("Bank Name is required.");
      if (formData.bankName.trim().length < 2) return setFormError("Bank Name must be at least 2 characters.");
      if (!formData.branchName.trim()) return setFormError("Branch Name is required.");
      if (formData.branchName.trim().length < 2) return setFormError("Branch Name must be at least 2 characters.");

      if (!formData.accountNumber.trim()) return setFormError("Account Number is required.");
      if (formData.accountNumber.length < 9 || formData.accountNumber.length > 18) {
        return setFormError("Bank Account Number must be between 9 and 18 digits.");
      }

      if (!formData.ifscCode.trim()) return setFormError("IFSC Code is required.");
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(formData.ifscCode.trim())) {
        return setFormError("Invalid IFSC code format (e.g. SBIN0001234).");
      }
    } else if (activeStep === 6) {
      if (formData.panNumber) {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(formData.panNumber.trim())) {
          return setFormError("Invalid PAN format (e.g. ABCDE1234F).");
        }
      }
      if (formData.aadharNumber && formData.aadharNumber.length !== 12) {
        return setFormError("Aadhaar Number must be exactly 12 digits.");
      }
      if (formData.uanNumber && formData.uanNumber.length !== 12) {
        return setFormError("UAN Number must be exactly 12 digits.");
      }
      if (formData.esiNumber && formData.esiNumber.length !== 17) {
        return setFormError("ESIC Number must be exactly 17 digits.");
      }
    } else if (activeStep === 7) {
      if (!formData.emergencyContactName.trim()) return setFormError("Emergency Contact Name is required.");
      if (formData.emergencyContactName.trim().length < 2) return setFormError("Emergency Contact Name must be at least 2 characters.");
      if (/\d/.test(formData.emergencyContactName.trim())) return setFormError("Emergency Contact Name must not contain numbers.");

      if (!formData.relationship.trim()) return setFormError("Relationship is required.");

      if (!formData.emergencyContactNumber.trim()) return setFormError("Emergency contact number is required.");
      if (!/^[6-9]\d{9}$/.test(formData.emergencyContactNumber.trim())) {
        return setFormError("Emergency contact number must start with 6, 7, 8, or 9 and be exactly 10 digits.");
      }
      if (formData.alternateContactNumber && !/^[6-9]\d{9}$/.test(formData.alternateContactNumber.trim())) {
        return setFormError("Alternate contact number must start with 6, 7, 8, or 9 and be exactly 10 digits.");
      }
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
    <div className="animate-[fadeSlideIn_0.35s_ease-out]">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3.5 mb-7">
        <button
          onClick={() => navigate('/admin/myteam')}
          className="bg-gray-100 border-none rounded-xl p-2.5 cursor-pointer flex items-center transition-colors duration-200 hover:bg-gray-200"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-gray-900 m-0">
            Employee Onboarding
          </h2>
          <p className="text-[13px] text-gray-500 mt-0.5 mb-0 mx-0">
            Follow the 7-step wizard to complete employee registration.
          </p>
        </div>
        {employeeId && (
          <span className="bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-lg text-xs font-bold border border-emerald-100">
            EMP ID: {employeeId}
          </span>
        )}
      </div>

      {/* ── Step Progress Bar ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl px-6 py-4.5 mb-5 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        {STEP_LABELS.map((name, i) => {
          const n = i + 1;
          const done = n < activeStep;
          const active = n === activeStep;
          // Steps below resumedFromStep were completed on the backend before this session
          const preCompleted = n < resumedFromStep;
          return (
            <React.Fragment key={n}>
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-[13px] transition-all duration-300 ${
                    done
                      ? preCompleted
                        ? 'bg-indigo-500 text-white'
                        : 'bg-emerald-500 text-white'
                      : active
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  title={preCompleted && done ? 'Already submitted' : ''}
                >
                  {done ? '✓' : n}
                </div>
                <span
                  className={`text-xs white-space-nowrap ${
                    active
                      ? 'font-extrabold text-gray-900'
                      : done
                      ? preCompleted
                        ? 'font-semibold text-indigo-500'
                        : 'font-semibold text-emerald-500'
                      : 'font-semibold text-gray-400'
                  }`}
                >
                  {name}
                  {preCompleted && done && (
                    <span className="text-[10px] ml-1 opacity-70">✦</span>
                  )}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={`flex-1 h-[2px] min-w-4 transition-colors duration-300 ${
                    done
                      ? preCompleted
                        ? 'bg-indigo-500'
                        : 'bg-emerald-500'
                      : 'bg-gray-100'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Main Card ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] px-10 py-9">
        {/* Alerts handled by global toast system */}

        <form onSubmit={handleStepSubmit}>
          {/* ═══ STEP 1: Basic Setup ══════════════════════════════════ */}
          {activeStep === 1 && (
            <div className="flex flex-col gap-7">
              <div>
                <h4 className="text-lg font-extrabold text-gray-900 mt-0 mb-1 mx-0">
                  Step 1: Account Setup & Credentials
                </h4>
                <p className="text-[13px] text-gray-500 m-0">
                  Fill in basic login credentials. Enter an Employee ID to resume
                  an existing onboarding.
                </p>
              </div>

              {/* Employee ID field — same pattern as EmployeeOnboarding reference */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-bold text-gray-700">
                      Employee ID
                    </label>
                    <span className="text-[11px] text-gray-400">
                      Enter to resume • leave empty for new
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={resumeId}
                      onChange={(e) =>
                        setResumeId(e.target.value.toUpperCase())
                      }
                      onBlur={() => handleIdCheck()}
                      placeholder="e.g. EMP-2026-0001"
                      className="w-full pl-4 pr-10 py-3 rounded-xl border-[1.5px] border-gray-200 text-sm outline-none bg-white transition-[border-color] duration-200 focus:border-indigo-500"
                    />
                    {resumeLoading && (
                      <Loader2
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 animate-spin"
                      />
                    )}
                  </div>
                </div>

                <FormField
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <FormField
                  label="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  type="email"
                  placeholder="rajesh@example.com"
                />
                <FormField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="9876543210"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <FormField
                  label="Role Type"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  options={[
                    { value: 'MR', label: 'Medical Representative (MR)' },
                    { value: 'MEDICAL_EXECUTIVE', label: 'Medical Executive' },
                    { value: 'MEDICAL_SALES_EXECUTIVE', label: 'Medical Sales Executive' },
                    { value: 'HR', label: 'HR Manager' },
                    { value: 'REGIONAL_MANAGER', label: 'Regional Manager' },
                    { value: 'AREA_MANAGER', label: 'Area Manager' },
                    { value: 'MEDICAL_MANAGER', label: 'Medical Manager' },
                    { value: 'DOCTOR', label: 'Doctor' },
                    { value: 'PHARMACIST', label: 'Pharmacist' },
                    { value: 'DISTRIBUTOR', label: 'Distributor' },
                    { value: 'PATIENT', label: 'Patient' },
                  ]}
                />
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Reporting Manager <span className="text-[11px] font-normal text-gray-400">(Optional)</span>
                  </label>
                  <select
                    name="reportingToId"
                    value={formData.reportingToId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-200 text-sm outline-none bg-white transition-[border-color] duration-200 focus:border-indigo-500 cursor-pointer"
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

              <div className="max-w-[50%]">
                <div className="flex justify-between items-baseline mb-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Security Password
                  </label>
                  <span className="text-[11px] text-gray-400">
                    Leave empty to auto-generate
                  </span>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-200 text-sm outline-none bg-white transition-[border-color] duration-200 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* ═══ STEP 2: Personal Info ════════════════════════════════ */}
          {activeStep === 2 && (
            <div className="flex flex-col gap-6">
              <h4 className="text-lg font-extrabold text-gray-900 mt-0 mb-1 mx-0">
                Step 2: Personal Profile & Demographics
              </h4>

              <div className="grid grid-cols-3 gap-4">
                {[
                  ['firstName', 'First Name', true],
                  ['middleName', 'Middle Name', false],
                  ['surname', 'Surname', true],
                ].map(([field, label, req]) => (
                  <FormField
                    key={field}
                    label={label}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    required={req}
                    placeholder={label}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  label="Date of Birth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  type="date"
                />
                <FormField
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
                <FormField
                  label="Blood Group"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  options={[
                    { value: 'A+', label: 'A+' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B+', label: 'B+' },
                    { value: 'B-', label: 'B-' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'AB-', label: 'AB-' },
                    { value: 'O+', label: 'O+' },
                    { value: 'O-', label: 'O-' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  label="Marital Status"
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  options={[
                    { value: 'Single', label: 'Single' },
                    { value: 'Married', label: 'Married' },
                    { value: 'Divorced', label: 'Divorced' },
                    { value: 'Widowed', label: 'Widowed' },
                  ]}
                />
                <FormField
                  label="Father's Name"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  required
                  placeholder="Father's Full Name"
                />
                <FormField
                  label="Mother's Name"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  required
                  placeholder="Mother's Full Name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Current Address <span className="text-red-500"> *</span>
                </label>
                <textarea
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="Flat, Building, Street, Area, City, PIN"
                  className="w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-200 text-sm outline-none box-border bg-white transition-[border-color] duration-200 h-20 resize-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[13px] font-bold text-gray-700 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="sameAsCurrentAddress"
                    id="sameAddr"
                    checked={formData.sameAsCurrentAddress}
                    onChange={handleInputChange}
                    className="w-4 h-4"
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
                    className="w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-200 text-sm outline-none box-border bg-white transition-[border-color] duration-200 h-20 resize-none focus:border-indigo-500"
                  />
                )}
              </div>
            </div>
          )}

          {/* ═══ STEP 3: Employment ══════════════════════════════════ */}
          {activeStep === 3 && (
            <div className="flex flex-col gap-6">
              <h4 className="text-lg font-extrabold text-gray-900 mt-0 mb-1 mx-0">
                Step 3: Professional & Employment Details
              </h4>
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Sales, Operations"
                />
                <FormField
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Senior MR"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  label="Date of Joining"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleInputChange}
                  required
                  type="date"
                />
                <FormField
                  label="Work Location"
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Bangalore HQ"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  label="Employment Type"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  options={[
                    { value: 'Full-time', label: 'Full-time' },
                    { value: 'Part-time', label: 'Part-time' },
                    { value: 'Contract', label: 'Contract' },
                    { value: 'Internship', label: 'Internship' },
                  ]}
                />
                <FormField
                  label="Annual CTC"
                  name="salaryDetails"
                  value={formData.salaryDetails}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="e.g. 500000"
                />
              </div>
              <label className="flex items-center gap-2 text-[13px] font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFresher"
                  id="isFresher"
                  checked={formData.isFresher}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                Candidate is a fresher (Step 4 – Experience – is optional)
              </label>
            </div>
          )}

          {/* ═══ STEP 4: Experience ══════════════════════════════════ */}
          {activeStep === 4 && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-extrabold text-gray-900 m-0">Step 4: Past Work Experience</h4>
                {formData.isFresher && (
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[11px] font-bold">Fresher – Optional</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  label="Previous Company"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required={!formData.isFresher}
                  placeholder="e.g. Novartis India"
                />
                <FormField
                  label="Previous Designation"
                  name="prevDesignation"
                  value={formData.prevDesignation}
                  onChange={handleInputChange}
                  required={!formData.isFresher}
                  placeholder="e.g. MR"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  label="Department"
                  name="prevDepartment"
                  value={formData.prevDepartment}
                  onChange={handleInputChange}
                  placeholder="e.g. Sales"
                />
                <FormField
                  label="From Date"
                  name="expFromDate"
                  value={formData.expFromDate}
                  onChange={handleInputChange}
                  type="date"
                />
                <FormField
                  label="To Date"
                  name="expToDate"
                  value={formData.expToDate}
                  onChange={handleInputChange}
                  type="date"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  label="Total Experience"
                  name="totalExperience"
                  value={formData.totalExperience}
                  onChange={handleInputChange}
                  placeholder="e.g. 2 Years 4 Months"
                />
                <FileDropzone label="Experience Letter" file={experienceLetter} onChange={setExperienceLetter} />
              </div>
            </div>
          )}

          {/* ═══ STEP 5: Bank Details ════════════════════════════════ */}
          {activeStep === 5 && (
            <div className="flex flex-col gap-6">
              <h4 className="text-lg font-extrabold text-gray-900 mt-0 mb-1 mx-0">Step 5: Salary Bank Account Details</h4>
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  label="Bank Name"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. HDFC Bank"
                />
                <FormField
                  label="Account Number"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 50100249240212"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  label="IFSC Code"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. HDFC0000124"
                />
                <FormField
                  label="Branch Name"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Koramangala Branch"
                />
              </div>
            </div>
          )}

          {/* ═══ STEP 6: Statutory ══════════════════════════════════ */}
          {activeStep === 6 && (
            <div className="flex flex-col gap-6">
              <h4 className="text-lg font-extrabold text-gray-900 mt-0 mb-1 mx-0">Step 6: Statutory Details & Legal IDs</h4>
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  label="PAN Number"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. ABCDE1234F"
                />
                <FormField
                  label="Aadhaar Number"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 1234 5678 9012"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  ['uanNumber', 'UAN Number', 'e.g. 100912482402'],
                  ['pfNumber', 'EPF Account No.', 'e.g. MH/BAN/0012345'],
                  ['esiNumber', 'ESIC Number', 'e.g. 31000123450001001'],
                ].map(([field, label, ph]) => (
                  <FormField
                    key={field}
                    label={label}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    placeholder={ph}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ═══ STEP 7: Verification & Emergency ══════════════════ */}
          {activeStep === 7 && (
            <div className="flex flex-col gap-6">
              <h4 className="text-lg font-extrabold text-gray-900 mt-0 mb-1 mx-0">Step 7: Verification Documents & Emergency Contact</h4>
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  label="Emergency Contact Name"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  required
                  placeholder="Full Name of Contact Person"
                />
                <FormField
                  label="Relationship"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Father, Spouse"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  label="Contact Number"
                  name="emergencyContactNumber"
                  value={formData.emergencyContactNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Primary Phone"
                />
                <FormField
                  label="Alternate Number (Optional)"
                  name="alternateContactNumber"
                  value={formData.alternateContactNumber}
                  onChange={handleInputChange}
                  placeholder="Secondary Phone"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <FileDropzone label="Profile Photo (Passport size)" file={profilePhoto} onChange={setProfilePhoto} required />
                <FileDropzone label="Aadhaar Card Document" file={aadharDoc} onChange={setAadharDoc} />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <FileDropzone label="PAN Card Document" file={panDoc} onChange={setPanDoc} />
                <FileDropzone label="Resume / CV" file={resumeDoc} onChange={setResumeDoc} />
              </div>
            </div>
          )}

          {/* ── Navigation Footer ─────────────────────────────────── */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t-[1.5px] border-gray-100">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep((p) => p - 1)}
                className="flex items-center gap-1.5 px-5.5 py-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-sm cursor-pointer transition-all duration-200 hover:bg-gray-50"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}
            <button
              type="submit"
              disabled={loading || resumeLoading || !!formSuccess}
              className={`flex items-center gap-2 px-7 py-3 rounded-xl border-none text-white font-bold text-sm transition-all duration-200 ${
                isStepAlreadyDone(activeStep)
                  ? 'bg-indigo-500 shadow-[0_4px_12px_rgba(99,102,241,0.3)]'
                  : 'bg-gray-900 shadow-[0_4px_12px_rgba(17,24,39,0.2)]'
              } ${
                (loading || resumeLoading || !!formSuccess)
                  ? 'opacity-70 cursor-not-allowed'
                  : 'cursor-pointer hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
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

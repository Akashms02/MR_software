import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOnboardingStatus,
  fetchReportingManagers,
  updateOnboardingDetails,
} from '../../redux/actions/teamActions';
import {
  X,
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
  'Emergency Info',
  'Documents',
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

const getDocumentUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  const apiRoute = import.meta.env.VITE_REACT_APP_API_ROUTE || 'https://api-mr-software.gmaxepay.in/api/v1';
  const baseUrl = apiRoute.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

const isImageFile = (fileOrPath) => {
  if (!fileOrPath) return false;
  if (typeof fileOrPath === 'string') {
    const cleanPath = fileOrPath.split('?')[0].toLowerCase();
    return cleanPath.endsWith('.png') || cleanPath.endsWith('.jpg') || cleanPath.endsWith('.jpeg') || cleanPath.endsWith('.webp') || cleanPath.endsWith('.gif');
  }
  if (fileOrPath instanceof File) {
    return fileOrPath.type.startsWith('image/');
  }
  return false;
};


const FileDropzone = ({ label, file, onChange, required = false, existingFileUrl = null, disabled = false }) => {
  const resolvedUrl = getDocumentUrl(existingFileUrl);
  const displayUrl = file ? URL.createObjectURL(file) : resolvedUrl;
  const isImg = file ? isImageFile(file) : isImageFile(resolvedUrl);

  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: '#EF4444' }}> *</span>}
      </label>
      <div
        style={{
          border: `2px dashed ${file ? '#6366F1' : existingFileUrl ? '#10B981' : '#E5E7EB'}`,
          padding: '16px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          cursor: disabled ? 'default' : 'pointer',
          background: file ? '#EEF2FF' : existingFileUrl ? '#F0FDF4' : '#FAFAFA',
          position: 'relative',
          transition: 'all 0.2s',
        }}
      >
        {/* Preview Thumbnail or Icon */}
        {displayUrl && isImg ? (
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1.5px solid #E5E7EB',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <img
              src={displayUrl}
              alt={label}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '8px',
              background: file ? '#E0E7FF' : existingFileUrl ? '#DCFCE7' : '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1.5px solid #E5E7EB',
            }}
          >
            <Upload size={20} color={file ? '#4F46E5' : existingFileUrl ? '#15803D' : '#9CA3AF'} />
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: file ? '#4338CA' : existingFileUrl ? '#166534' : '#374151',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {file ? file.name : existingFileUrl ? `Current ${label}` : `No file uploaded`}
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
            {existingFileUrl && !file && (
              <>
                <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>
                  ✓ Uploaded
                </span>
                <span style={{ fontSize: '11px', color: '#D1D5DB' }}>•</span>
                <a
                  href={resolvedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: '11px',
                    color: '#2563EB',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  View File
                </a>
              </>
            )}
            {file && (
              <>
                <span style={{ fontSize: '11px', color: '#4F46E5', fontWeight: 700 }}>
                  Ready to upload
                </span>
              </>
            )}
            {!disabled && (
              <>
                {(existingFileUrl || file) ? (
                  <>
                    <span style={{ fontSize: '11px', color: '#D1D5DB' }}>•</span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Click to replace</span>
                  </>
                ) : (
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Click to browse</span>
                )}
              </>
            )}
          </div>
        </div>

        {!disabled && (
          <input
            type="file"
            onChange={(e) => {
              const selectedFile = e.target.files[0];
              if (selectedFile) onChange(selectedFile);
            }}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
          />
        )}
      </div>
    </div>
  );
};

const EditEmployeeModal = ({ isOpen, onClose, employeeId }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.team);

  const [activeTab, setActiveTab] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [reportingManagers, setReportingManagers] = useState([]);
  
  // Track existing document paths from API
  const [existingDocs, setExistingDocs] = useState({
    experienceLetter: null,
    profilePhoto: null,
    aadharDoc: null,
    panDoc: null,
    resumeDoc: null,
  });

  const [activeDocKey, setActiveDocKey] = useState('profilePhoto');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'MR',
    reportingToId: '',
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
    department: '',
    designation: '',
    dateOfJoining: '',
    workLocation: '',
    employmentType: 'Full-time',
    salaryDetails: '',
    isFresher: false,
    companyName: '',
    prevDesignation: '',
    prevDepartment: '',
    totalExperience: '',
    expFromDate: '',
    expToDate: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    panNumber: '',
    aadharNumber: '',
    uanNumber: '',
    pfNumber: '',
    esiNumber: '',
    emergencyContactName: '',
    relationship: '',
    emergencyContactNumber: '',
    alternateContactNumber: '',
  });

  // Backup state to revert changes on cancel
  const [originalData, setOriginalData] = useState({});

  // Files state
  const [experienceLetter, setExperienceLetter] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [aadharDoc, setAadharDoc] = useState(null);
  const [panDoc, setPanDoc] = useState(null);
  const [resumeDoc, setResumeDoc] = useState(null);

  // Fetch reporting managers list
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
    if (isOpen) {
      loadReportingManagers();
    }
  }, [dispatch, isOpen]);

  // Load employee details when modal opens or employeeId changes
  useEffect(() => {
    const loadEmployeeDetails = async () => {
      if (!isOpen || !employeeId) return;
      setInitialLoading(true);
      setFormError(null);
      setFormSuccess(null);
      setActiveTab(1);
      setIsEditing(false);
      
      // Reset files
      setExperienceLetter(null);
      setProfilePhoto(null);
      setAadharDoc(null);
      setPanDoc(null);
      setResumeDoc(null);

      try {
        const res = await dispatch(fetchOnboardingStatus(employeeId));
        const data = res.data;

        const initialFormValues = {
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          password: '',
          role: data.role || 'MR',
          reportingToId: data.reportingToId || '',

          firstName: data.personal?.firstName || '',
          middleName: data.personal?.middleName || '',
          surname: data.personal?.surname || '',
          dateOfBirth: data.personal?.dateOfBirth ? data.personal.dateOfBirth.split('T')[0] : '',
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
          dateOfJoining: data.employment?.dateOfJoining ? data.employment.dateOfJoining.split('T')[0] : '',
          workLocation: data.employment?.workLocation || '',
          employmentType: data.employment?.employmentType || 'Full-time',
          salaryDetails: data.employment?.salaryDetails || '',
          isFresher: data.employment?.isFresher || false,

          companyName: data.employment?.companyName || '',
          prevDesignation: data.employment?.prevDesignation || '',
          prevDepartment: data.employment?.prevDepartment || '',
          totalExperience: data.employment?.totalExperience || '',
          expFromDate: data.employment?.expFromDate ? data.employment.expFromDate.split('T')[0] : '',
          expToDate: data.employment?.expToDate ? data.employment.expToDate.split('T')[0] : '',

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
        };

        setFormData(initialFormValues);
        setOriginalData(initialFormValues);

        // Track if files are present
        setExistingDocs({
          experienceLetter: data.employment?.experienceLetterUrl || null,
          profilePhoto: data.documents?.profilePhotoPath || null,
          aadharDoc: data.documents?.aadharDocPath || null,
          panDoc: data.documents?.panDocPath || null,
          resumeDoc: data.documents?.resumePath || null,
        });

      } catch (err) {
        setFormError(
          err?.response?.data?.message ||
            err.message ||
            'Failed to load employee details.'
        );
      } finally {
        setInitialLoading(false);
      }
    };

    loadEmployeeDetails();
  }, [dispatch, isOpen, employeeId]);

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

  const handleSectionSave = async (e) => {
    if (e) e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    try {
      let payload;
      let isMultipart = false;

      if (activeTab === 1) {
        payload = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          ...(formData.password ? { password: formData.password } : {}),
          reportingToId: formData.reportingToId ? parseInt(formData.reportingToId) : null,
        };
      } else if (activeTab === 2) {
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
      } else if (activeTab === 3) {
        payload = {
          department: formData.department,
          designation: formData.designation,
          dateOfJoining: formData.dateOfJoining,
          workLocation: formData.workLocation,
          employmentType: formData.employmentType,
          salaryDetails: formData.salaryDetails ? parseFloat(formData.salaryDetails) : null,
          isFresher: formData.isFresher,
        };
      } else if (activeTab === 4) {
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
      } else if (activeTab === 5) {
        payload = {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          branchName: formData.branchName,
        };
      } else if (activeTab === 6) {
        payload = {
          panNumber: formData.panNumber,
          aadharNumber: formData.aadharNumber,
          uanNumber: formData.uanNumber,
          pfNumber: formData.pfNumber,
          esiNumber: formData.esiNumber,
        };
      } else if (activeTab === 7) {
        payload = {
          emergencyContactName: formData.emergencyContactName,
          relationship: formData.relationship,
          emergencyContactNumber: formData.emergencyContactNumber,
          alternateContactNumber: formData.alternateContactNumber,
        };
      } else if (activeTab === 8) {
        const hasNewFiles = profilePhoto || aadharDoc || panDoc || resumeDoc || experienceLetter;
        if (!hasNewFiles) {
          setFormSuccess('Documents updated successfully!');
          setTimeout(() => {
            setFormSuccess(null);
            setIsEditing(false);
          }, 1000);
          return;
        }

        isMultipart = true;
        const form = new FormData();
        if (profilePhoto) form.append('profilePhoto', profilePhoto);
        if (aadharDoc) form.append('aadharDoc', aadharDoc);
        if (panDoc) form.append('panDoc', panDoc);
        if (resumeDoc) form.append('resumeDoc', resumeDoc);
        if (experienceLetter) form.append('experienceLetter', experienceLetter);
        payload = form;
      }

      await dispatch(updateOnboardingDetails(employeeId, payload, isMultipart));

      setFormSuccess(`Section details updated successfully!`);
      setOriginalData(formData);
      
      // Update local existing doc state if new file is uploaded
      if (activeTab === 4 && experienceLetter) {
        setExistingDocs(prev => ({ ...prev, experienceLetter: URL.createObjectURL(experienceLetter) }));
        setExperienceLetter(null);
      }
      if (activeTab === 8) {
        if (profilePhoto) {
          setExistingDocs(prev => ({ ...prev, profilePhoto: URL.createObjectURL(profilePhoto) }));
          setProfilePhoto(null);
        }
        if (aadharDoc) {
          setExistingDocs(prev => ({ ...prev, aadharDoc: URL.createObjectURL(aadharDoc) }));
          setAadharDoc(null);
        }
        if (panDoc) {
          setExistingDocs(prev => ({ ...prev, panDoc: URL.createObjectURL(panDoc) }));
          setPanDoc(null);
        }
        if (resumeDoc) {
          setExistingDocs(prev => ({ ...prev, resumeDoc: URL.createObjectURL(resumeDoc) }));
          setResumeDoc(null);
        }
        if (experienceLetter) {
          setExistingDocs(prev => ({ ...prev, experienceLetter: URL.createObjectURL(experienceLetter) }));
          setExperienceLetter(null);
        }
      }

      setTimeout(() => {
        setFormSuccess(null);
        setIsEditing(false);
      }, 1000);
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          err.message ||
          'Failed to update details. Please try again.'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '1080px',
          height: '90vh',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px 32px',
            borderBottom: '1.5px solid #F3F4F6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 850, color: '#111827', margin: 0 }}>
              Employee Profile Card
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
              Employee ID: <span style={{ fontWeight: 700, color: '#4F46E5' }}>{employeeId}</span>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #E5E7EB',
                  background: '#fff',
                  color: '#374151',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                ✏️ Edit {activeTab === 8 ? 'Documents' : 'Section'}
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: '#F3F4F6',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4B5563',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E5E7EB';
                e.currentTarget.style.color = '#111827';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F3F4F6';
                e.currentTarget.style.color = '#4B5563';
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {initialLoading ? (
          <div style={{ padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', flex: 1, justifyContent: 'center' }}>
            <Loader2 size={36} color="#6366F1" style={{ animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>Fetching details...</p>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
            {/* Left Sidebar: Tabs Navigation */}
            <div
              style={{
                width: '240px',
                borderRight: '1.5px solid #F3F4F6',
                background: '#F9FAFB',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '24px 16px',
                boxSizing: 'border-box',
                overflowY: 'auto',
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', paddingLeft: '8px' }}>
                Profile Sections
              </div>
              {STEP_LABELS.map((name, i) => {
                const tabIndex = i + 1;
                const isActive = tabIndex === activeTab;
                return (
                  <button
                    key={tabIndex}
                    type="button"
                    onClick={() => {
                      setFormError(null);
                      setFormSuccess(null);
                      setIsEditing(false);
                      // Revert any changes if user switches tabs without saving
                      setFormData(originalData);
                      setExperienceLetter(null);
                      setProfilePhoto(null);
                      setAadharDoc(null);
                      setPanDoc(null);
                      setResumeDoc(null);
                      setActiveTab(tabIndex);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: isActive ? '#EEF2FF' : 'transparent',
                      color: isActive ? '#4F46E5' : '#4B5563',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = '#E5E7EB';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{name}</span>
                    {isActive && (
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#4F46E5',
                        }}
                      />
                    )}
                  </button>
                );
              })}
              
              <div style={{ flex: 1 }} />
              
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #E5E7EB',
                  background: '#fff',
                  color: '#374151',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                  outline: 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                Close Profile
              </button>
            </div>

            {/* Right Pane: Scrollable Form / Details View */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                background: '#fff',
                overflow: 'hidden',
              }}
            >
              <form
                onSubmit={handleSectionSave}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  margin: 0,
                }}
              >
                {/* Right Pane Header */}
                <div
                  style={{
                    padding: '24px 32px',
                    borderBottom: '1.5px solid #F3F4F6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 850, color: '#111827', margin: 0 }}>
                      {STEP_LABELS[activeTab - 1]}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
                      {isEditing ? 'Modify the details below and save your changes.' : 'View details of the selected section.'}
                    </p>
                  </div>
                </div>

                {/* Right Pane Scrollable Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px', boxSizing: 'border-box' }}>
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

                  {/* Render content based on activeTab */}
                  
                  {/* TAB 1: Basic Setup */}
                  {activeTab === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div style={gridStyle}>
                        <div>
                          <label style={labelStyle}>Full Name <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. Rajesh Kumar"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Email Address <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="rajesh@example.com"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div style={gridStyle}>
                        <div>
                          <label style={labelStyle}>Phone Number <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            placeholder="9876543210"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Role Type</label>
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'pointer' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          >
                            <option value="MR">Medical Representative (MR)</option>
                            <option value="MEDICAL_EXECUTIVE">Medical Executive</option>
                            <option value="MEDICAL_SALES_EXECUTIVE">Medical Sales Executive</option>
                            <option value="HR">HR Manager</option>
                            <option value="REGIONAL_MANAGER">Regional Manager</option>
                            <option value="AREA_MANAGER">Area Manager</option>
                            <option value="DOCTOR">Doctor</option>
                            <option value="PHARMACIST">Pharmacist</option>
                            <option value="DISTRIBUTOR">Distributor</option>
                            <option value="PATIENT">Patient</option>
                          </select>
                        </div>
                      </div>
                      <div style={gridStyle}>
                        <div>
                          <label style={labelStyle}>Reporting Manager <span style={{ fontSize: '11px', fontWeight: 400, color: '#9CA3AF' }}>(Optional)</span></label>
                          <select
                            name="reportingToId"
                            value={formData.reportingToId}
                            onChange={handleInputChange}
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'pointer' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          >
                            <option value="">Select Reporting Manager</option>
                            {reportingManagers.map((mgr) => (
                              <option key={mgr.id} value={mgr.id}>
                                {mgr.fullName || mgr.name || `ID: ${mgr.id}`} {mgr.role ? `(${mgr.role.replace(/_/g, ' ')})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Security Password <span style={{ fontSize: '11px', fontWeight: 400, color: '#9CA3AF' }}>(Leave empty to keep current)</span></label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Personal Info */}
                  {activeTab === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                              style={{
                                ...inputStyle,
                                background: isEditing ? '#fff' : '#F9FAFB',
                                cursor: isEditing ? 'text' : 'not-allowed',
                              }}
                              disabled={!isEditing}
                            />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={labelStyle}>Date of Birth <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            required
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Gender <span style={{ color: '#EF4444' }}>*</span></label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'pointer' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          >
                            {['Male', 'Female', 'Other'].map((g) => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Blood Group</label>
                          <select
                            name="bloodGroup"
                            value={formData.bloodGroup}
                            onChange={handleInputChange}
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'pointer' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          >
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
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
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'pointer' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          >
                            {['Single', 'Married', 'Divorced', 'Widowed'].map((s) => <option key={s} value={s}>{s}</option>)}
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
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
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
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
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
                          style={{
                            ...inputStyle,
                            height: '80px',
                            resize: 'none',
                            background: isEditing ? '#fff' : '#F9FAFB',
                            cursor: isEditing ? 'text' : 'not-allowed',
                          }}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#374151', cursor: isEditing ? 'pointer' : 'not-allowed', marginBottom: '8px' }}>
                          <input
                            type="checkbox"
                            name="sameAsCurrentAddress"
                            checked={formData.sameAsCurrentAddress}
                            onChange={handleInputChange}
                            style={{ width: '16px', height: '16px' }}
                            disabled={!isEditing}
                          />
                          Permanent address is same as current address
                        </label>
                        {(!formData.sameAsCurrentAddress || !isEditing) && (
                          <textarea
                            name="permanentAddress"
                            value={formData.sameAsCurrentAddress ? formData.currentAddress : formData.permanentAddress}
                            onChange={handleInputChange}
                            required
                            placeholder="Flat, Building, Street, Area, City, PIN"
                            style={{
                              ...inputStyle,
                              height: '80px',
                              resize: 'none',
                              background: (isEditing && !formData.sameAsCurrentAddress) ? '#fff' : '#F9FAFB',
                              cursor: (isEditing && !formData.sameAsCurrentAddress) ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing || formData.sameAsCurrentAddress}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Employment */}
                  {activeTab === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div style={gridStyle}>
                        <div>
                          <label style={labelStyle}>Department <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. Sales, Operations"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Designation <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            name="designation"
                            value={formData.designation}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. Senior MR"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div style={gridStyle}>
                        <div>
                          <label style={labelStyle}>Date of Joining <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            type="date"
                            name="dateOfJoining"
                            value={formData.dateOfJoining}
                            onChange={handleInputChange}
                            required
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Work Location <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            name="workLocation"
                            value={formData.workLocation}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. Bangalore HQ"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div style={gridStyle}>
                        <div>
                          <label style={labelStyle}>Employment Type</label>
                          <select
                            name="employmentType"
                            value={formData.employmentType}
                            onChange={handleInputChange}
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'pointer' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          >
                            {['Full-time', 'Part-time', 'Contract', 'Internship'].map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Annual CTC <span style={{ fontSize: '11px', fontWeight: 400, color: '#9CA3AF' }}>(Optional)</span></label>
                          <input
                            type="number"
                            name="salaryDetails"
                            value={formData.salaryDetails}
                            onChange={handleInputChange}
                            placeholder="e.g. 500000"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#374151', cursor: isEditing ? 'pointer' : 'not-allowed' }}>
                        <input
                          type="checkbox"
                          name="isFresher"
                          checked={formData.isFresher}
                          onChange={handleInputChange}
                          style={{ width: '16px', height: '16px' }}
                          disabled={!isEditing}
                        />
                        Candidate is a fresher (Step 4 – Experience – is optional)
                      </label>
                    </div>
                  )}

                  {/* TAB 4: Experience */}
                  {activeTab === 4 && (
                    formData.isFresher ? (
                      <div style={{ padding: '24px', background: '#F9FAFB', borderRadius: '12px', border: '1.5px dashed #E5E7EB', color: '#6B7280', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
                        Candidate is marked as a Fresher. No past work experience is recorded.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={gridStyle}>
                          <div>
                            <label style={labelStyle}>Previous Company <span style={{ color: '#EF4444' }}>*</span></label>
                            <input
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleInputChange}
                              required={!formData.isFresher}
                              placeholder="e.g. Novartis India"
                              style={{
                                ...inputStyle,
                                background: isEditing ? '#fff' : '#F9FAFB',
                                cursor: isEditing ? 'text' : 'not-allowed',
                              }}
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Previous Designation <span style={{ color: '#EF4444' }}>*</span></label>
                            <input
                              name="prevDesignation"
                              value={formData.prevDesignation}
                              onChange={handleInputChange}
                              required={!formData.isFresher}
                              placeholder="e.g. MR"
                              style={{
                                ...inputStyle,
                                background: isEditing ? '#fff' : '#F9FAFB',
                                cursor: isEditing ? 'text' : 'not-allowed',
                              }}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                          <div>
                            <label style={labelStyle}>Department <span style={{ fontSize: '11px', fontWeight: 400, color: '#9CA3AF' }}>(Optional)</span></label>
                            <input
                              name="prevDepartment"
                              value={formData.prevDepartment}
                              onChange={handleInputChange}
                              placeholder="e.g. Sales"
                              style={{
                                ...inputStyle,
                                background: isEditing ? '#fff' : '#F9FAFB',
                                cursor: isEditing ? 'text' : 'not-allowed',
                              }}
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>From Date</label>
                            <input
                              type="date"
                              name="expFromDate"
                              value={formData.expFromDate}
                              onChange={handleInputChange}
                              style={{
                                ...inputStyle,
                                background: isEditing ? '#fff' : '#F9FAFB',
                                cursor: isEditing ? 'text' : 'not-allowed',
                              }}
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>To Date</label>
                            <input
                              type="date"
                              name="expToDate"
                              value={formData.expToDate}
                              onChange={handleInputChange}
                              style={{
                                ...inputStyle,
                                background: isEditing ? '#fff' : '#F9FAFB',
                                cursor: isEditing ? 'text' : 'not-allowed',
                              }}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        <div style={gridStyle}>
                          <div>
                            <label style={labelStyle}>Total Experience</label>
                            <input
                              name="totalExperience"
                              value={formData.totalExperience}
                              onChange={handleInputChange}
                              placeholder="e.g. 2 Years 4 Months"
                              style={{
                                ...inputStyle,
                                background: isEditing ? '#fff' : '#F9FAFB',
                                cursor: isEditing ? 'text' : 'not-allowed',
                              }}
                              disabled={!isEditing}
                            />
                          </div>
                          <FileDropzone
                            label="Experience Letter"
                            file={experienceLetter}
                            onChange={setExperienceLetter}
                            existingFileUrl={existingDocs.experienceLetter}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    )
                  )}

                  {/* TAB 5: Bank Details */}
                  {activeTab === 5 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div style={gridStyle}>
                        <div>
                          <label style={labelStyle}>Bank Name <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. HDFC Bank"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Account Number <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. 50100249240212"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div style={gridStyle}>
                        <div>
                          <label style={labelStyle}>IFSC Code <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            name="ifscCode"
                            value={formData.ifscCode}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. HDFC0000124"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Branch Name <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            name="branchName"
                            value={formData.branchName}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. Koramangala Branch"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 6: Statutory */}
                  {activeTab === 6 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div style={gridStyle}>
                        <div>
                          <label style={labelStyle}>PAN Number <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            name="panNumber"
                            value={formData.panNumber}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. ABCDE1234F"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Aadhaar Number <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            name="aadharNumber"
                            value={formData.aadharNumber}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. 1234 5678 9012"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
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
                            <input
                              name={field}
                              value={formData[field]}
                              onChange={handleInputChange}
                              placeholder={ph}
                              style={{
                                ...inputStyle,
                                background: isEditing ? '#fff' : '#F9FAFB',
                                cursor: isEditing ? 'text' : 'not-allowed',
                              }}
                              disabled={!isEditing}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 7: Emergency Info */}
                  {activeTab === 7 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div style={gridStyle}>
                        <div>
                          <label style={labelStyle}>Emergency Contact Name <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            name="emergencyContactName"
                            value={formData.emergencyContactName}
                            onChange={handleInputChange}
                            required
                            placeholder="Full Name of Contact Person"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Relationship <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            name="relationship"
                            value={formData.relationship}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. Father, Spouse"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div style={gridStyle}>
                        <div>
                          <label style={labelStyle}>Contact Number <span style={{ color: '#EF4444' }}>*</span></label>
                          <input
                            name="emergencyContactNumber"
                            value={formData.emergencyContactNumber}
                            onChange={handleInputChange}
                            required
                            placeholder="Primary Phone"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Alternate Number <span style={{ fontSize: '11px', fontWeight: 400, color: '#9CA3AF' }}>(Optional)</span></label>
                          <input
                            name="alternateContactNumber"
                            value={formData.alternateContactNumber}
                            onChange={handleInputChange}
                            placeholder="Secondary Phone"
                            style={{
                              ...inputStyle,
                              background: isEditing ? '#fff' : '#F9FAFB',
                              cursor: isEditing ? 'text' : 'not-allowed',
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 8: Documents */}
                  {activeTab === 8 && (() => {
                    const documentTypes = [
                      { key: 'profilePhoto', label: 'Profile Photo', fileState: profilePhoto, setFileState: setProfilePhoto, existingUrl: existingDocs.profilePhoto, accept: 'image/*' },
                      { key: 'aadharDoc', label: 'Aadhaar Card', fileState: aadharDoc, setFileState: setAadharDoc, existingUrl: existingDocs.aadharDoc, accept: 'image/*,application/pdf' },
                      { key: 'panDoc', label: 'PAN Card', fileState: panDoc, setFileState: setPanDoc, existingUrl: existingDocs.panDoc, accept: 'image/*,application/pdf' },
                      { key: 'resumeDoc', label: 'Resume / CV', fileState: resumeDoc, setFileState: setResumeDoc, existingUrl: existingDocs.resumeDoc, accept: 'image/*,application/pdf' },
                      { key: 'experienceLetter', label: 'Experience Letter', fileState: experienceLetter, setFileState: setExperienceLetter, existingUrl: existingDocs.experienceLetter, accept: 'image/*,application/pdf' },
                    ];

                    const activeDoc = documentTypes.find(d => d.key === activeDocKey) || documentTypes[0];
                    const displayUrl = activeDoc.fileState ? URL.createObjectURL(activeDoc.fileState) : getDocumentUrl(activeDoc.existingUrl);
                    const isImg = activeDoc.fileState ? isImageFile(activeDoc.fileState) : isImageFile(getDocumentUrl(activeDoc.existingUrl));

                    return (
                      <div style={{ display: 'flex', gap: '24px', height: '420px', boxSizing: 'border-box' }}>
                        {/* Left Panel: Document selection list */}
                        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '6px', flexShrink: 0 }}>
                          <div style={{ fontSize: '11px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                            Documents Directory
                          </div>
                          {documentTypes.map((doc) => {
                            const isActive = doc.key === activeDocKey;
                            const hasFile = doc.fileState || doc.existingUrl;
                            const isDraft = !!doc.fileState;
                            const isUploaded = !!doc.existingUrl && !doc.fileState;

                            return (
                              <div
                                key={doc.key}
                                onClick={() => setActiveDocKey(doc.key)}
                                style={{
                                  padding: '12px 14px',
                                  borderRadius: '12px',
                                  border: `1.5px solid ${isActive ? '#6366F1' : '#E5E7EB'}`,
                                  background: isActive ? '#EEF2FF' : '#fff',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px',
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isActive) e.currentTarget.style.borderColor = '#9CA3AF';
                                }}
                                onMouseLeave={(e) => {
                                  if (!isActive) e.currentTarget.style.borderColor = '#E5E7EB';
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '13px', fontWeight: 700, color: isActive ? '#4338CA' : '#374151' }}>
                                    {doc.label}
                                  </span>
                                  {isDraft && (
                                    <span style={{ fontSize: '9px', background: '#EEF2FF', color: '#4F46E5', padding: '2px 6px', borderRadius: '9999px', fontWeight: 800, border: '1px solid #C7D2FE' }}>
                                      Draft
                                    </span>
                                  )}
                                  {isUploaded && (
                                    <span style={{ fontSize: '9px', background: '#ECFDF5', color: '#10B981', padding: '2px 6px', borderRadius: '9999px', fontWeight: 800, border: '1px solid #A7F3D0' }}>
                                      Uploaded
                                    </span>
                                  )}
                                  {!hasFile && (
                                    <span style={{ fontSize: '9px', background: '#FFF7ED', color: '#EA580C', padding: '2px 6px', borderRadius: '9999px', fontWeight: 800, border: '1px solid #FFEDD5' }}>
                                      Missing
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                                  <span style={{ fontSize: '11px', color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                                    {doc.fileState ? doc.fileState.name : doc.existingUrl ? 'Stored document' : 'No file chosen'}
                                  </span>
                                  
                                  {isEditing && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          document.getElementById(`file-upload-${doc.key}`).click();
                                        }}
                                        style={{
                                          fontSize: '11px',
                                          fontWeight: 700,
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '4px 8px',
                                          background: isActive ? '#6366F1' : '#F3F4F6',
                                          color: isActive ? '#fff' : '#4B5563',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s',
                                        }}
                                      >
                                        {hasFile ? 'Replace' : 'Upload'}
                                      </button>
                                      <input
                                        id={`file-upload-${doc.key}`}
                                        type="file"
                                        accept={doc.accept}
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          if (file) doc.setFileState(file);
                                        }}
                                        style={{ display: 'none' }}
                                      />
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Right Panel: Large Document Preview Window */}
                        <div
                          style={{
                            flex: 1,
                            border: '1.5px solid #E5E7EB',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            background: '#F9FAFB',
                          }}
                        >
                          {/* Preview Topbar */}
                          <div
                            style={{
                              padding: '12px 16px',
                              borderBottom: '1.5px solid #E5E7EB',
                              background: '#fff',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <span style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>
                                {activeDoc.label}
                              </span>
                              <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '8px' }}>
                                {activeDoc.fileState ? 'Draft File' : activeDoc.existingUrl ? 'Stored on Server' : 'Empty'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {displayUrl && (
                                <a
                                  href={displayUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#2563EB',
                                    background: '#EFF6FF',
                                    border: '1.5px solid #BFDBFE',
                                    borderRadius: '8px',
                                    padding: '5px 12px',
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                  }}
                                >
                                  View Fullscreen
                                </a>
                              )}
                              {isEditing && activeDoc.fileState && (
                                <button
                                  type="button"
                                  onClick={() => activeDoc.setFileState(null)}
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#DC2626',
                                    background: '#FEF2F2',
                                    border: '1.5px solid #FEE2E2',
                                    borderRadius: '8px',
                                    padding: '5px 12px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Clear Draft
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Preview Viewer Box */}
                          <div
                            style={{
                              flex: 1,
                              padding: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                            }}
                          >
                            {displayUrl ? (
                              isImg ? (
                                <div
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    background: '#fff',
                                    borderRadius: '10px',
                                    border: '1.5px solid #E5E7EB',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxSizing: 'border-box',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                  }}
                                >
                                  <img
                                    src={displayUrl}
                                    alt={activeDoc.label}
                                    style={{
                                      maxWidth: '100%',
                                      maxHeight: '100%',
                                      objectFit: 'contain',
                                      borderRadius: '6px',
                                    }}
                                  />
                                </div>
                              ) : (
                                <div
                                  style={{
                                    textAlign: 'center',
                                    background: '#fff',
                                    padding: '32px 24px',
                                    borderRadius: '16px',
                                    border: '1.5px solid #E5E7EB',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                    maxWidth: '300px',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '60px',
                                      height: '60px',
                                      borderRadius: '50%',
                                      background: '#EEF2FF',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      margin: '0 auto 16px auto',
                                      color: '#4F46E5',
                                    }}
                                  >
                                    <Upload size={28} />
                                  </div>
                                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
                                    Document File (PDF)
                                  </h4>
                                  <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 18px 0', lineHeight: '1.5' }}>
                                    Direct preview of PDFs is not supported inline. Click the button below to view the file.
                                  </p>
                                  <a
                                    href={displayUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'block',
                                      padding: '10px 0',
                                      background: '#4F46E5',
                                      color: '#fff',
                                      borderRadius: '8px',
                                      fontWeight: 700,
                                      fontSize: '12px',
                                      textDecoration: 'none',
                                      textAlign: 'center',
                                      transition: 'opacity 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                  >
                                    Open Document
                                  </a>
                                </div>
                              )
                            ) : (
                              <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
                                <Upload size={40} style={{ marginBottom: '10px', color: '#9CA3AF' }} />
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#4B5563' }}>No File Chosen</div>
                                <div style={{ fontSize: '11px', marginTop: '2px' }}>
                                  {isEditing ? `Click the upload button on the left to add a ${activeDoc.label}.` : `This document has not been uploaded yet.`}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Section Actions (Save & Cancel buttons for edit mode) */}
                  {isEditing && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        marginTop: '32px',
                        paddingTop: '24px',
                        borderTop: '1.5px solid #F3F4F6',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(originalData);
                          setExperienceLetter(null);
                          setProfilePhoto(null);
                          setAadharDoc(null);
                          setPanDoc(null);
                          setResumeDoc(null);
                          setIsEditing(false);
                          setFormError(null);
                        }}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '10px',
                          border: '1.5px solid #E5E7EB',
                          background: '#fff',
                          color: '#4B5563',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          outline: 'none',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 24px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#4F46E5',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.7 : 1,
                          transition: 'all 0.2s',
                          boxShadow: '0 4px 12px rgba(79,70,229,0.2)',
                          outline: 'none',
                        }}
                      >
                        {loading && (
                          <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                        )}
                        Save Changes
                      </button>
                    </div>
                  )}

                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default EditEmployeeModal;

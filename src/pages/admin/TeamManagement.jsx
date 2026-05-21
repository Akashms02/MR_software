import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getMyTeam, 
  clearErrors, 
  clearSuccess, 
  saveOnboardingStep, 
  fetchOnboardingStatus 
} from '../../redux/actions/teamActions';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  Shield, 
  User, 
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Upload,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Lock,
  FileText,
  Image,
  Award
} from 'lucide-react';

const TeamManagement = () => {
  const dispatch = useDispatch();
  const { team, loading, error, success, message } = useSelector((state) => state.team);
  
  const [showModal, setShowModal] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [employeeId, setEmployeeId] = useState(''); // Holds generated or resumed employeeId
  const [resumeSearchId, setResumeSearchId] = useState(''); // Search input for resuming
  const [resumeLoading, setResumeLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // 7-Step Wizard Form State
  const [formData, setFormData] = useState({
    // Step 1: Credentials
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'MR',
    reportingToId: '',

    // Step 2: Personal
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

    // Step 3: Employment
    department: '',
    designation: '',
    dateOfJoining: '',
    workLocation: '',
    employmentType: 'Full-time',
    salaryDetails: '',
    isFresher: false,

    // Step 4: Experience
    companyName: '',
    prevDesignation: '',
    prevDepartment: '',
    totalExperience: '',
    expFromDate: '',
    expToDate: '',

    // Step 5: Bank
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',

    // Step 6: Statutory
    panNumber: '',
    aadharNumber: '',
    uanNumber: '',
    pfNumber: '',
    esiNumber: '',

    // Step 7: Emergency
    emergencyContactName: '',
    relationship: '',
    emergencyContactNumber: '',
    alternateContactNumber: ''
  });

  // Files state
  const [experienceLetter, setExperienceLetter] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [aadharDoc, setAadharDoc] = useState(null);
  const [panDoc, setPanDoc] = useState(null);
  const [resumeDoc, setResumeDoc] = useState(null);

  useEffect(() => {
    dispatch(getMyTeam());
  }, [dispatch]);

  // Handle Input Changes
  const handleInputChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    if (name === 'sameAsCurrentAddress' && checked) {
      setFormData(prev => ({
        ...prev,
        sameAsCurrentAddress: true,
        permanentAddress: prev.currentAddress
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: val
      }));
    }
  };

  // Resume Onboarding by Employee ID
  const handleResumeOnboarding = async (e) => {
    e.preventDefault();
    if (!resumeSearchId.trim()) return;
    
    setResumeLoading(true);
    setFormError(null);
    try {
      const res = await dispatch(fetchOnboardingStatus(resumeSearchId.trim()));
      const data = res.data;
      
      // Map all backend fields to local React state
      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        password: '', // Password is not retrieved
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
        alternateContactNumber: data.emergency?.alternateContactNumber || ''
      });

      setEmployeeId(data.employeeId);
      setActiveStep(data.onboardingStep);
      setShowModal(true);
      setFormSuccess(`Loaded onboarding details for ${data.fullName}! Resuming at Step ${data.onboardingStep}.`);
      setTimeout(() => setFormSuccess(null), 3000);
    } catch (err) {
      setFormError(err.message || 'Failed to resume onboarding. Ensure the Employee ID is correct.');
    } finally {
      setResumeLoading(false);
    }
  };

  // Submit Step handler
  const handleStepSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    try {
      let payload;
      let isMultipart = false;

      if (activeStep === 1) {
        payload = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password: formData.password || undefined,
          reportingToId: formData.reportingToId ? parseInt(formData.reportingToId) : null
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
          sameAsCurrentAddress: formData.sameAsCurrentAddress
        };
      } else if (activeStep === 3) {
        payload = {
          department: formData.department,
          designation: formData.designation,
          dateOfJoining: formData.dateOfJoining,
          workLocation: formData.workLocation,
          employmentType: formData.employmentType,
          salaryDetails: formData.salaryDetails ? parseFloat(formData.salaryDetails) : null,
          isFresher: formData.isFresher
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
        if (experienceLetter) {
          form.append('experienceLetter', experienceLetter);
        }
        payload = form;
      } else if (activeStep === 5) {
        payload = {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          branchName: formData.branchName
        };
      } else if (activeStep === 6) {
        payload = {
          panNumber: formData.panNumber,
          aadharNumber: formData.aadharNumber,
          uanNumber: formData.uanNumber,
          pfNumber: formData.pfNumber,
          esiNumber: formData.esiNumber
        };
      } else if (activeStep === 7) {
        isMultipart = true;
        const form = new FormData();
        form.append('emergencyContactName', formData.emergencyContactName || '');
        form.append('relationship', formData.relationship || '');
        form.append('emergencyContactNumber', formData.emergencyContactNumber || '');
        form.append('alternateContactNumber', formData.alternateContactNumber || '');
        if (profilePhoto) form.append('profilePhoto', profilePhoto);
        if (aadharDoc) form.append('aadharDoc', aadharDoc);
        if (panDoc) form.append('panDoc', panDoc);
        if (resumeDoc) form.append('resumeDoc', resumeDoc);
        payload = form;
      }

      const response = await dispatch(saveOnboardingStep(activeStep, employeeId, payload, isMultipart));

      if (activeStep === 1) {
        setEmployeeId(response.data.employeeId);
      }

      setFormSuccess(`Step ${activeStep} details saved successfully!`);
      setTimeout(() => setFormSuccess(null), 1500);

      if (activeStep < 7) {
        setActiveStep(prev => prev + 1);
      } else {
        // Last step completed
        setFormSuccess('Onboarding process fully completed! Base employee record is active.');
        setTimeout(() => {
          setShowModal(false);
          setActiveStep(1);
          setEmployeeId('');
          // Reset form
          setFormData({
            fullName: '', email: '', phone: '', password: '', role: 'MR', reportingToId: '',
            firstName: '', middleName: '', surname: '', dateOfBirth: '', gender: 'Male', bloodGroup: 'A+', maritalStatus: 'Single', fatherName: '', motherName: '', currentAddress: '', permanentAddress: '', sameAsCurrentAddress: false,
            department: '', designation: '', dateOfJoining: '', workLocation: '', employmentType: 'Full-time', salaryDetails: '', isFresher: false,
            companyName: '', prevDesignation: '', prevDepartment: '', totalExperience: '', expFromDate: '', expToDate: '',
            bankName: '', accountNumber: '', ifscCode: '', branchName: '',
            panNumber: '', aadharNumber: '', uanNumber: '', pfNumber: '', esiNumber: '',
            emergencyContactName: '', relationship: '', emergencyContactNumber: '', alternateContactNumber: ''
          });
          setExperienceLetter(null);
          setProfilePhoto(null);
          setAadharDoc(null);
          setPanDoc(null);
          setResumeDoc(null);
        }, 2000);
      }
    } catch (err) {
      setFormError(err.message || 'An error occurred while saving the details.');
    }
  };

  const stepsHeaderList = [
    'Basic Setup',
    'Personal Info',
    'Employment',
    'Experience',
    'Bank details',
    'Statutory details',
    'Verification & Emergency'
  ];

  return (
    <div className="animate-fade-in p-2">
      {/* Search and Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Resume Onboarding Search */}
        <form onSubmit={handleResumeOnboarding} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              placeholder="Resume using Employee ID (e.g. EMP-2026-0001)" 
              value={resumeSearchId}
              onChange={e => setResumeSearchId(e.target.value)}
              style={{
                padding: '12px 12px 12px 38px',
                borderRadius: '12px',
                border: '1.5px solid #E5E7EB',
                width: '320px',
                fontSize: '13px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#111827'}
              onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
            />
          </div>
          <button 
            type="submit"
            disabled={resumeLoading}
            style={{
              background: '#F3F4F6',
              color: '#374151',
              padding: '12px 18px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: resumeLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {resumeLoading ? <Loader2 className="animate-spin" size={14} /> : null}
            Resume Onboarding
          </button>
        </form>

        <button 
          onClick={() => {
            setEmployeeId('');
            setActiveStep(1);
            setShowModal(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#111827',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={18} strokeWidth={3} />
          Onboard New Member
        </button>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Team', value: team.length, color: '#6366F1' },
          { label: 'MR Count', value: team.filter(m => m.role === 'MR').length, color: '#10B981' },
          { label: 'Managers', value: team.filter(m => m.role?.includes('MANAGER')).length, color: '#F59E0B' },
          { label: 'Medical Staff', value: team.filter(m => ['DOCTOR', 'PHARMACIST'].includes(m.role)).length, color: '#EF4444' }
        ].map((stat, i) => (
          <div key={i} style={{ 
            background: '#fff', 
            padding: '16px 20px', 
            borderRadius: '16px', 
            border: '1px solid #F3F4F6',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '4px' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #F3F4F6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              placeholder="Search team members..." 
              style={{
                padding: '10px 12px 10px 40px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                width: '300px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          <button style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Filter & Sort</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F9FAFB' }}>
              <tr>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase' }}>Member</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase' }}>Contact</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" color="#6366F1" size={24} style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '12px', color: '#6B7280', fontSize: '14px' }}>Loading your team...</p>
                  </td>
                </tr>
              ) : team.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>No team members found. Start by onboarding your first member!</td>
                </tr>
              ) : team.map((member) => (
                <tr key={member.id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '12px', 
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '14px'
                      }}>
                        {member.fullName?.charAt(0) || <User size={18} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#111827', fontSize: '14px' }}>{member.fullName}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>ID: {member.id?.toString().slice(-8) || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4B5563' }}>
                        <Mail size={14} color="#9CA3AF" /> {member.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4B5563' }}>
                        <Phone size={14} color="#9CA3AF" /> {member.phone}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ 
                       display: 'inline-flex', alignItems: 'center', gap: '6px', 
                       background: '#ECFDF5', color: '#059669', 
                       padding: '4px 10px', borderRadius: '8px', 
                       fontSize: '12px', fontWeight: 700 
                    }}>
                      <Briefcase size={12} /> {member.role?.replace('_', ' ')}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>Active</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7-Step Onboarding Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(17, 24, 39, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div 
            className="animate-slide-up"
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: '850px',
              height: '90vh',
              borderRadius: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div style={{ 
              padding: '20px 28px', 
              borderBottom: '1px solid #F3F4F6', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'linear-gradient(to right, #F9FAFB, #fff)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>Onboard Team Member</h3>
                  {employeeId ? (
                    <span style={{ background: '#ECFDF5', color: '#047857', padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700 }}>
                      ID: {employeeId}
                    </span>
                  ) : null}
                </div>
                <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', margin: 0 }}>Follow the 7-step wizard to register employees with full profiles.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer' }}
              >
                <X size={18} color="#6B7280" />
              </button>
            </div>

            {/* Steps Progress Indicator */}
            <div style={{ 
              background: '#F9FAFB', 
              padding: '16px 28px', 
              borderBottom: '1px solid #F3F4F6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              overflowX: 'auto'
            }}>
              {stepsHeaderList.map((stepName, index) => {
                const stepNum = index + 1;
                const isCompleted = stepNum < activeStep;
                const isActive = stepNum === activeStep;
                
                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isCompleted ? '#10B981' : isActive ? '#111827' : '#E5E7EB',
                      color: isCompleted || isActive ? '#fff' : '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '12px'
                    }}>
                      {isCompleted ? '✓' : stepNum}
                    </div>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: isActive ? 800 : 600, 
                      color: isActive ? '#111827' : isCompleted ? '#10B981' : '#9CA3AF'
                    }}>
                      {stepName}
                    </span>
                    {index < 6 ? <span style={{ color: '#E5E7EB', fontWeight: 600 }}>/</span> : null}
                  </div>
                );
              })}
            </div>

            {/* Modal Body / Scrolling Forms */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
              
              {/* Alert Status Banners */}
              {formError && (
                <div style={{ background: '#FEF2F2', border: '1.5px solid #FEE2E2', padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: '#B91C1C', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
                  <AlertCircle size={18} /> {formError}
                </div>
              )}
              {formSuccess && (
                <div style={{ background: '#ECFDF5', border: '1.5px solid #D1FAE5', padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: '#047857', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
                  <CheckCircle2 size={18} /> {formSuccess}
                </div>
              )}

              <form onSubmit={handleStepSubmit}>
                
                {/* STEP 1: Basic setup */}
                {activeStep === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#111827' }}>Step 1: Account Setup & Credentials</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Full Name</label>
                        <input 
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. Rajesh Kumar"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Role Type</label>
                        <select 
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none', background: '#fff' }}
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
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Email Address</label>
                        <input 
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="rajesh@mrmedical.com"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Phone Number</label>
                        <input 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="9876543210"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>Security Password</label>
                          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Leave empty to auto-generate & email</span>
                        </div>
                        <input 
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Reporting Manager User ID (Optional)</label>
                        <input 
                          name="reportingToId"
                          value={formData.reportingToId}
                          onChange={handleInputChange}
                          placeholder="e.g. 5"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Personal details */}
                {activeStep === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#111827' }}>Step 2: Personal Profiles & Demographics</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>First Name</label>
                        <input 
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          placeholder="First Name"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Middle Name (Optional)</label>
                        <input 
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleInputChange}
                          placeholder="Middle Name"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Surname</label>
                        <input 
                          name="surname"
                          value={formData.surname}
                          onChange={handleInputChange}
                          required
                          placeholder="Last Name"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Date of Birth</label>
                        <input 
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          required
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Gender</label>
                        <select 
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none', background: '#fff' }}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Blood Group</label>
                        <select 
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleInputChange}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none', background: '#fff' }}
                        >
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Marital Status</label>
                        <select 
                          name="maritalStatus"
                          value={formData.maritalStatus}
                          onChange={handleInputChange}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none', background: '#fff' }}
                        >
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Father's Name</label>
                        <input 
                          name="fatherName"
                          value={formData.fatherName}
                          onChange={handleInputChange}
                          required
                          placeholder="Father's Full Name"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Mother's Name</label>
                        <input 
                          name="motherName"
                          value={formData.motherName}
                          onChange={handleInputChange}
                          required
                          placeholder="Mother's Full Name"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Current Address</label>
                      <textarea 
                        name="currentAddress"
                        value={formData.currentAddress}
                        onChange={handleInputChange}
                        required
                        placeholder="Flat, building, street, area details"
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none', height: '80px', resize: 'none' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <input 
                          type="checkbox"
                          name="sameAsCurrentAddress"
                          id="sameAsCurrentAddress"
                          checked={formData.sameAsCurrentAddress}
                          onChange={handleInputChange}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <label htmlFor="sameAsCurrentAddress" style={{ fontSize: '12px', fontWeight: 700, color: '#374151', cursor: 'pointer' }}>Permanent address is the same as current address</label>
                      </div>
                      {!formData.sameAsCurrentAddress && (
                        <textarea 
                          name="permanentAddress"
                          value={formData.permanentAddress}
                          onChange={handleInputChange}
                          required
                          placeholder="Flat, building, street, area details"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none', height: '80px', resize: 'none' }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: Employment details */}
                {activeStep === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#111827' }}>Step 3: Professional & Employment Details</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Department</label>
                        <input 
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. Sales, Operations, HR"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Designation</label>
                        <input 
                          name="designation"
                          value={formData.designation}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. MR Lead, Sales Associate"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Date of Joining</label>
                        <input 
                          type="date"
                          name="dateOfJoining"
                          value={formData.dateOfJoining}
                          onChange={handleInputChange}
                          required
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Work Location</label>
                        <input 
                          name="workLocation"
                          value={formData.workLocation}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. Bangalore Corporate Office"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Employment Type</label>
                        <select 
                          name="employmentType"
                          value={formData.employmentType}
                          onChange={handleInputChange}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none', background: '#fff' }}
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Salary Package (CTC per Annum)</label>
                        <input 
                          type="number"
                          name="salaryDetails"
                          value={formData.salaryDetails}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. 500000"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="checkbox"
                          name="isFresher"
                          id="isFresher"
                          checked={formData.isFresher}
                          onChange={handleInputChange}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <label htmlFor="isFresher" style={{ fontSize: '12px', fontWeight: 700, color: '#374151', cursor: 'pointer' }}>Candidate is a fresher (will skip Step 4 details)</label>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Experience Details */}
                {activeStep === 4 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#111827' }}>Step 4: Past Work Experience</h4>
                      {formData.isFresher && (
                        <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}>
                          Fresher (Optional step)
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Previous Company Name</label>
                        <input 
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          required={!formData.isFresher}
                          placeholder="e.g. Novartis Corp"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Previous Designation</label>
                        <input 
                          name="prevDesignation"
                          value={formData.prevDesignation}
                          onChange={handleInputChange}
                          required={!formData.isFresher}
                          placeholder="e.g. Senior Medical Representative"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Previous Department</label>
                        <input 
                          name="prevDepartment"
                          value={formData.prevDepartment}
                          onChange={handleInputChange}
                          required={!formData.isFresher}
                          placeholder="e.g. Cardiopulmonary Sales"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Experience from Date</label>
                        <input 
                          type="date"
                          name="expFromDate"
                          value={formData.expFromDate}
                          onChange={handleInputChange}
                          required={!formData.isFresher}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Experience to Date</label>
                        <input 
                          type="date"
                          name="expToDate"
                          value={formData.expToDate}
                          onChange={handleInputChange}
                          required={!formData.isFresher}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Total Experience Duration</label>
                        <input 
                          name="totalExperience"
                          value={formData.totalExperience}
                          onChange={handleInputChange}
                          required={!formData.isFresher}
                          placeholder="e.g. 2 Years, 4 Months"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>

                      {/* File Upload Experience Letter */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Experience Letter (PDF/Image)</label>
                        <div style={{
                          border: '2px dashed #E5E7EB',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          background: '#F9FAFB'
                        }}>
                          <Upload size={18} color="#6B7280" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                              {experienceLetter ? experienceLetter.name : 'Choose Experience Document'}
                            </div>
                            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Max size 5MB • PDF, JPG, PNG</div>
                          </div>
                          <input 
                            type="file"
                            onChange={e => setExperienceLetter(e.target.files[0])}
                            style={{ position: 'absolute', opacity: 0, width: '100px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Bank details */}
                {activeStep === 5 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#111827' }}>Step 5: Salary Bank Account Details</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Bank Name</label>
                        <input 
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. HDFC Bank, ICICI Bank"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Account Number</label>
                        <input 
                          name="accountNumber"
                          value={formData.accountNumber}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. 50100249240212"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>IFSC Code</label>
                        <input 
                          name="ifscCode"
                          value={formData.ifscCode}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. HDFC0000124"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Branch Name</label>
                        <input 
                          name="branchName"
                          value={formData.branchName}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. Koramangala Branch"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: Statutory details */}
                {activeStep === 6 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#111827' }}>Step 6: Statutory Details & Legal IDs</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>PAN Card Number</label>
                        <input 
                          name="panNumber"
                          value={formData.panNumber}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. ABCDE1234F"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Aadhaar Card Number</label>
                        <input 
                          name="aadharNumber"
                          value={formData.aadharNumber}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. 1234 5678 9012"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>PF UAN Number (Optional)</label>
                        <input 
                          name="uanNumber"
                          value={formData.uanNumber}
                          onChange={handleInputChange}
                          placeholder="e.g. 100912482402"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>EPF Account Number (Optional)</label>
                        <input 
                          name="pfNumber"
                          value={formData.pfNumber}
                          onChange={handleInputChange}
                          placeholder="e.g. MH/BAN/0012345/000/0000124"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>ESIC Number (Optional)</label>
                        <input 
                          name="esiNumber"
                          value={formData.esiNumber}
                          onChange={handleInputChange}
                          placeholder="e.g. 31000123450001001"
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 7: Verification & emergency details */}
                {activeStep === 7 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#111827' }}>Step 7: Verification Credentials & Emergency Contact</h4>
                    
                    {/* Emergency Contact */}
                    <div style={{ borderBottom: '1px solid #F3F4F6', pb: '16px', mb: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Emergency Contact Person</label>
                          <input 
                            name="emergencyContactName"
                            value={formData.emergencyContactName}
                            onChange={handleInputChange}
                            required
                            placeholder="Full Name of Contact"
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Relationship</label>
                          <input 
                            name="relationship"
                            value={formData.relationship}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g. Father, Spouse, Friend"
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Contact Number</label>
                          <input 
                            name="emergencyContactNumber"
                            value={formData.emergencyContactNumber}
                            onChange={handleInputChange}
                            required
                            placeholder="Primary Phone Number"
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Alternate Contact Number (Optional)</label>
                          <input 
                            name="alternateContactNumber"
                            value={formData.alternateContactNumber}
                            onChange={handleInputChange}
                            placeholder="Secondary Phone Number"
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Files Uploads grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      
                      {/* Photo */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Profile Photo (Passport size)</label>
                        <div style={{
                          border: '2px dashed #E5E7EB',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          background: '#F9FAFB'
                        }}>
                          <Image size={18} color="#6B7280" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                              {profilePhoto ? profilePhoto.name : 'Upload Passport Photo'}
                            </div>
                            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Max size 3MB • JPG, PNG</div>
                          </div>
                          <input 
                            type="file"
                            onChange={e => setProfilePhoto(e.target.files[0])}
                            style={{ position: 'absolute', opacity: 0, width: '100px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>

                      {/* Aadhaar card doc */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Aadhaar Card Document</label>
                        <div style={{
                          border: '2px dashed #E5E7EB',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          background: '#F9FAFB'
                        }}>
                          <FileText size={18} color="#6B7280" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                              {aadharDoc ? aadharDoc.name : 'Upload Aadhaar Document'}
                            </div>
                            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Max size 5MB • PDF, JPG, PNG</div>
                          </div>
                          <input 
                            type="file"
                            onChange={e => setAadharDoc(e.target.files[0])}
                            style={{ position: 'absolute', opacity: 0, width: '100px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>

                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      
                      {/* PAN Card doc */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>PAN Card Document</label>
                        <div style={{
                          border: '2px dashed #E5E7EB',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          background: '#F9FAFB'
                        }}>
                          <FileText size={18} color="#6B7280" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                              {panDoc ? panDoc.name : 'Upload PAN Document'}
                            </div>
                            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Max size 5MB • PDF, JPG, PNG</div>
                          </div>
                          <input 
                            type="file"
                            onChange={e => setPanDoc(e.target.files[0])}
                            style={{ position: 'absolute', opacity: 0, width: '100px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>

                      {/* Resume doc */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Resume Document</label>
                        <div style={{
                          border: '2px dashed #E5E7EB',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          background: '#F9FAFB'
                        }}>
                          <FileText size={18} color="#6B7280" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                              {resumeDoc ? resumeDoc.name : 'Upload Resume / CV'}
                            </div>
                            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Max size 5MB • PDF, DOCX</div>
                          </div>
                          <input 
                            type="file"
                            onChange={e => setResumeDoc(e.target.files[0])}
                            style={{ position: 'absolute', opacity: 0, width: '100px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* Modal Footer Controls */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginTop: '40px',
                  paddingTop: '20px',
                  borderTop: '1px solid #F3F4F6'
                }}>
                  {activeStep > 1 ? (
                    <button 
                      type="button"
                      onClick={() => setActiveStep(prev => prev - 1)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        border: '1.5px solid #E5E7EB',
                        background: '#fff',
                        color: '#374151',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      background: '#111827',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>
                        {activeStep === 7 ? 'Complete Onboarding' : 'Save & Continue'}
                        {activeStep < 7 && <ArrowRight size={16} />}
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.4s ease-out forwards;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TeamManagement;

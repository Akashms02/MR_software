import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOnboardingStatus,
  fetchReportingManagers,
  updateOnboardingDetails,
  fetchRoleTypes,
  fetchDepartments,
} from '../../redux/actions/teamActions';
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const DESIGNATION_OPTIONS = [
  { value: 'Medical Representative (MR)', label: 'Medical Representative (MR)' },
  { value: 'Area Sales Manager (ASM)', label: 'Area Sales Manager (ASM)' },
  { value: 'Regional Sales Manager (RSM)', label: 'Regional Sales Manager (RSM)' },
  { value: 'Zonal Business Manager (ZBM)', label: 'Zonal Business Manager (ZBM)' },
  { value: 'Other', label: 'Other / Custom Designation...' }
];

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

const formatDateForInput = (dateVal) => {
  if (!dateVal) return '';
  if (Array.isArray(dateVal)) {
    const [year, month, day] = dateVal;
    const yyyy = String(year);
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  if (typeof dateVal === 'string') {
    return dateVal.split('T')[0];
  }
  if (dateVal instanceof Date) {
    return dateVal.toISOString().split('T')[0];
  }
  return String(dateVal);
};

// Sub-component for input fields to keep JSX dry and use premium Tailwind classes
const FormField = ({
  label,
  name,
  value,
  onChange,
  isEditing,
  required = false,
  type = 'text',
  placeholder = '',
  options = null,
}) => {
  const inputClass = `w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-200 text-sm outline-none bg-[#FAFAFA] transition-[border-color] duration-200 ${isEditing ? 'bg-white cursor-text focus:border-indigo-500' : 'bg-gray-50 cursor-not-allowed'
    }`;

  const selectClass = `w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-200 text-sm outline-none bg-[#FAFAFA] transition-[border-color] duration-200 ${isEditing ? 'bg-white cursor-pointer focus:border-indigo-500' : 'bg-gray-50 cursor-not-allowed'
    }`;

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
          disabled={!isEditing}
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
          disabled={!isEditing}
          className={inputClass}
        />
      )}
    </div>
  );
};

const FileDropzone = ({ label, file, onChange, required = false, existingFileUrl = null, disabled = false }) => {
  const resolvedUrl = getDocumentUrl(existingFileUrl);
  const displayUrl = file ? URL.createObjectURL(file) : resolvedUrl;
  const isImg = file ? isImageFile(file) : isImageFile(resolvedUrl);

  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div
        className={`border-2 border-dashed p-4 rounded-xl flex items-center gap-4 relative transition-all duration-200 ${disabled ? 'cursor-default' : 'cursor-pointer'
          } ${file
            ? 'border-indigo-500 bg-indigo-50'
            : existingFileUrl
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 bg-[#FAFAFA]'
          }`}
      >
        {/* Preview Thumbnail or Icon */}
        {displayUrl && isImg ? (
          <div className="w-[54px] h-[54px] rounded-lg overflow-hidden border-[1.5px] border-gray-200 bg-white flex items-center justify-center shrink-0">
            <img
              src={displayUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`w-[54px] h-[54px] rounded-lg flex items-center justify-center shrink-0 border-[1.5px] border-gray-200 ${file ? 'bg-indigo-100' : existingFileUrl ? 'bg-emerald-100' : 'bg-gray-100'
              }`}
          >
            <Upload size={20} className={file ? 'text-indigo-600' : existingFileUrl ? 'text-emerald-700' : 'text-gray-400'} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div
            className={`text-[13px] font-bold truncate ${file ? 'text-indigo-700' : existingFileUrl ? 'text-emerald-800' : 'text-gray-700'
              }`}
          >
            {file ? file.name : existingFileUrl ? `Current ${label}` : `No file uploaded`}
          </div>

          <div className="flex gap-2 items-center mt-1">
            {existingFileUrl && !file && (
              <>
                <span className="text-[11px] text-emerald-600 font-bold">
                  ✓ Uploaded
                </span>
                <span className="text-[11px] text-gray-300">•</span>
                <a
                  href={resolvedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-blue-600 font-bold underline cursor-pointer"
                >
                  View File
                </a>
              </>
            )}
            {file && (
              <>
                <span className="text-[11px] text-indigo-600 font-bold">
                  Ready to upload
                </span>
              </>
            )}
            {!disabled && (
              <>
                {(existingFileUrl || file) ? (
                  <>
                    <span className="text-[11px] text-gray-300">•</span>
                    <span className="text-[11px] text-gray-400">Click to replace</span>
                  </>
                ) : (
                  <span className="text-[11px] text-gray-400">Click to browse</span>
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
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        )}
      </div>
    </div>
  );
};

const EditEmployeeModal = ({ isOpen, onClose, employeeId }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.team);
  const { user } = useSelector((state) => state.auth || {});

  // Only Admin and ZBM are allowed to view or edit Employee Profile Cards
  const canManageEmployeeProfile = React.useMemo(() => {
    if (!user || !user.role) return false;
    const norm = (user.role || '').toUpperCase().replace(/_/g, ' ').replace(/-/g, ' ').replace('ROLE', '').trim();
    const isSuperAdminOrAdmin = norm.includes('ADMIN');
    const isZBM = norm === 'ZBM' || norm.includes('ZONE') || norm.includes('ZONAL');
    return isSuperAdminOrAdmin || isZBM;
  }, [user]);

  const [activeTab, setActiveTab] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
  const [roleOptions, setRoleOptions] = useState([
    { value: 'ZONE_MANAGER', label: 'Zonal Business Manager (ZBM)' },
    { value: 'AREA_MANAGER', label: 'Area Business Manager (ABM)' },
    { value: 'REGIONAL_MANAGER', label: 'Regional Business Manager (RBM)' },
    { value: 'MR', label: 'Medical Representative (MR)' },
  ]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await dispatch(fetchRoleTypes());
        if (response && response.data) {
          const allRoles = response.data;
          const allowedKeys = ['ZONE_MANAGER', 'AREA_MANAGER', 'REGIONAL_MANAGER', 'MR'];
          const filtered = allRoles
            .filter(role => allowedKeys.includes(role))
            .map(role => {
              if (role === 'ZONE_MANAGER') return { value: 'ZONE_MANAGER', label: 'Zonal Business Manager (ZBM)' };
              if (role === 'AREA_MANAGER') return { value: 'AREA_MANAGER', label: 'Area Business Manager (ABM)' };
              if (role === 'REGIONAL_MANAGER') return { value: 'REGIONAL_MANAGER', label: 'Regional Business Manager (RBM)' };
              return { value: 'MR', label: 'Medical Representative (MR)' };
            });
          if (filtered.length > 0) {
            setRoleOptions(filtered);
          }
        }
      } catch (err) {
        console.error("Failed to fetch roles via Redux:", err);
      }
    };
    if (isOpen) {
      fetchRoles();
    }
  }, [dispatch, isOpen]);

  const [departmentsList, setDepartmentsList] = useState([
    { value: 'Sales & Marketing', label: 'Sales & Marketing' },
    { value: 'Medical Affairs', label: 'Medical Affairs' },
    { value: 'Clinical Research', label: 'Clinical Research' },
    { value: 'Regulatory', label: 'Regulatory' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'QA/QC', label: 'QA/QC' },
    { value: 'HR', label: 'HR' },
    { value: 'Finance', label: 'Finance' },
    { value: 'IT', label: 'IT' },
  ]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await dispatch(fetchDepartments());
        if (response && response.data) {
          const list = response.data;
          if (Array.isArray(list) && list.length > 0) {
            setDepartmentsList(list.map(dept => ({ value: dept, label: dept })));
          }
        }
      } catch (err) {
        console.error("Failed to fetch departments via Redux:", err);
      }
    };
    if (isOpen) {
      loadDepartments();
    }
  }, [dispatch, isOpen]);

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
  const [isCustomDesignation, setIsCustomDesignation] = useState(false);
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
        
        // Robust data extraction supporting various API response wrappers
        const rawRes = res?.data?.data || res?.data || res || {};
        const data = rawRes.data || rawRes.profile || rawRes.employee || rawRes;

        const emp = data.employment || data.profile?.employment || data;
        const pers = data.personal || data.profile?.personal || data;
        const bnk = data.bank || data.profile?.bank || data;
        const stat = data.statutory || data.profile?.statutory || data;
        const emerg = data.emergency || data.profile?.emergency || data;

        const desig = emp?.designation || data.designation || '';
        const isCustom = desig && !['Medical Representative (MR)', 'Area Sales Manager (ASM)', 'Regional Sales Manager (RSM)', 'Zonal Business Manager (ZBM)'].includes(desig);
        setIsCustomDesignation(!!isCustom);

        const deptVal = emp?.department || data.department || '';
        if (deptVal && !departmentsList.some(d => d.value === deptVal)) {
          setDepartmentsList(prev => [...prev, { value: deptVal, label: deptVal }]);
        }

        const initialFormValues = {
          fullName: data.fullName || (pers.firstName ? `${pers.firstName} ${pers.middleName || ''} ${pers.surname || ''}`.trim() : ''),
          email: data.email || '',
          phone: data.phone || '',
          password: '',
          role: data.role || 'MR',
          reportingToId: data.reportingToId || '',

          firstName: pers.firstName || data.firstName || '',
          middleName: pers.middleName || data.middleName || '',
          surname: pers.surname || data.surname || '',
          dateOfBirth: formatDateForInput(pers.dateOfBirth || data.dateOfBirth),
          gender: pers.gender || data.gender || 'Male',
          bloodGroup: pers.bloodGroup || data.bloodGroup || 'A+',
          maritalStatus: pers.maritalStatus || data.maritalStatus || 'Single',
          fatherName: pers.fatherName || data.fatherName || '',
          motherName: pers.motherName || data.motherName || '',
          currentAddress: pers.currentAddress || data.currentAddress || '',
          permanentAddress: pers.permanentAddress || data.permanentAddress || '',
          sameAsCurrentAddress: pers.sameAsCurrentAddress || data.sameAsCurrentAddress || false,

          department: deptVal,
          designation: desig,
          dateOfJoining: formatDateForInput(emp.dateOfJoining || data.dateOfJoining),
          workLocation: emp.workLocation || data.workLocation || '',
          employmentType: emp.employmentType || data.employmentType || 'Full-time',
          salaryDetails: emp.salaryDetails !== undefined && emp.salaryDetails !== null ? emp.salaryDetails : (data.salaryDetails || ''),
          isFresher: emp.isFresher ?? data.isFresher ?? false,

          companyName: emp.companyName || data.companyName || '',
          prevDesignation: emp.prevDesignation || data.prevDesignation || '',
          prevDepartment: emp.prevDepartment || data.prevDepartment || '',
          totalExperience: emp.totalExperience || data.totalExperience || '',
          expFromDate: formatDateForInput(emp.expFromDate || data.expFromDate),
          expToDate: formatDateForInput(emp.expToDate || data.expToDate),

          bankName: bnk.bankName || data.bankName || '',
          accountNumber: bnk.accountNumber || data.accountNumber || '',
          ifscCode: bnk.ifscCode || data.ifscCode || '',
          branchName: bnk.branchName || data.branchName || '',

          panNumber: stat.panNumber || data.panNumber || '',
          aadharNumber: stat.aadharNumber || data.aadharNumber || '',
          uanNumber: stat.uanNumber || data.uanNumber || '',
          pfNumber: stat.pfNumber || data.pfNumber || '',
          esiNumber: stat.esiNumber || data.esiNumber || '',

          emergencyContactName: emerg.emergencyContactName || data.emergencyContactName || '',
          relationship: emerg.relationship || data.relationship || '',
          emergencyContactNumber: emerg.emergencyContactNumber || data.emergencyContactNumber || '',
          alternateContactNumber: emerg.alternateContactNumber || data.alternateContactNumber || '',
        };

        setFormData(initialFormValues);
        setOriginalData(initialFormValues);

        // Track if files are present (with fallbacks for various API response shapes)
        const rawDocs = data.documents || data.profile?.documents || data;
        const rawEmp = emp;

        setExistingDocs({
          experienceLetter: rawEmp?.experienceLetterUrl || data.experienceLetterUrl || data.experienceLetterPath || null,
          profilePhoto: rawDocs?.profilePhotoPath || rawDocs?.profilePhotoUrl || data.profilePhotoPath || data.profilePhotoUrl || null,
          aadharDoc: rawDocs?.aadharDocPath || rawDocs?.aadharDocUrl || data.aadharDocPath || data.aadharDocUrl || null,
          panDoc: rawDocs?.panDocPath || rawDocs?.panDocUrl || data.panDocPath || data.panDocUrl || null,
          resumeDoc: rawDocs?.resumePath || rawDocs?.resumeUrl || rawDocs?.resumeDocPath || data.resumePath || data.resumeUrl || null,
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
    } else if (name === 'emergencyContactName' || name === 'relationship') {
      val = value.replace(/[^a-zA-Z\s]/g, '');
    }

    if (name === 'role') {
      let dept = '';
      let desig = '';
      let isCustom = false;
      if (val === 'MR') {
        dept = 'Sales & Marketing';
        desig = 'Medical Representative (MR)';
      } else if (val === 'AREA_MANAGER') {
        dept = 'Sales & Marketing';
        desig = 'Area Sales Manager (ASM)';
      } else if (val === 'REGIONAL_MANAGER') {
        dept = 'Sales & Marketing';
        desig = 'Regional Sales Manager (RSM)';
      } else if (val === 'ZONE_MANAGER') {
        dept = 'Sales & Marketing';
        desig = 'Zonal Business Manager (ZBM)';
      }

      setFormData((prev) => ({
        ...prev,
        role: val,
        department: dept || prev.department,
        designation: desig || prev.designation,
      }));
    } else if (name === 'sameAsCurrentAddress' && checked) {
      setFormData((prev) => ({
        ...prev,
        sameAsCurrentAddress: true,
        permanentAddress: prev.currentAddress,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handleDesignationSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'Other') {
      setIsCustomDesignation(true);
      setFormData(prev => ({ ...prev, designation: '' }));
    } else {
      setIsCustomDesignation(false);
      setFormData(prev => ({ ...prev, designation: val }));
    }
  };

  const handleSectionSave = async (e) => {
    if (e) e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // ── Validation Checks ───────────────────────────────────────────
    if (activeTab === 1) {
      if (formData.phone && formData.phone.length !== 10) {
        setFormError("Phone number must be exactly 10 digits.");
        return;
      }
    } else if (activeTab === 5) {
      if (formData.ifscCode && formData.ifscCode.length !== 11) {
        setFormError("IFSC Code must be exactly 11 characters.");
        return;
      }
      if (formData.accountNumber && (formData.accountNumber.length < 9 || formData.accountNumber.length > 18)) {
        setFormError("Bank Account Number must be between 9 and 18 digits.");
        return;
      }
    } else if (activeTab === 6) {
      if (formData.panNumber && formData.panNumber.length !== 10) {
        setFormError("PAN Number must be exactly 10 characters.");
        return;
      }
      if (formData.aadharNumber && formData.aadharNumber.length !== 12) {
        setFormError("Aadhaar Number must be exactly 12 digits.");
        return;
      }
      if (formData.uanNumber && formData.uanNumber.length !== 12) {
        setFormError("UAN Number must be exactly 12 digits.");
        return;
      }
      if (formData.esiNumber && formData.esiNumber.length !== 17) {
        setFormError("ESIC Number must be exactly 17 digits.");
        return;
      }
    } else if (activeTab === 7) {
      if (!formData.emergencyContactName || !formData.emergencyContactName.trim()) {
        setFormError("Emergency Contact Name is required.");
        return;
      }
      if (formData.emergencyContactName.trim().length < 2) {
        setFormError("Emergency Contact Name must be at least 2 characters.");
        return;
      }
      if (/\d/.test(formData.emergencyContactName.trim())) {
        setFormError("Emergency Contact Name must not contain numbers.");
        return;
      }

      if (!formData.relationship || !formData.relationship.trim()) {
        setFormError("Relationship is required.");
        return;
      }
      if (formData.relationship.trim().length < 2) {
        setFormError("Relationship must be at least 2 characters.");
        return;
      }
      if (/\d/.test(formData.relationship.trim())) {
        setFormError("Relationship must not contain numbers.");
        return;
      }

      if (!formData.emergencyContactNumber || !formData.emergencyContactNumber.trim()) {
        setFormError("Emergency contact number is required.");
        return;
      }
      if (!/^[6-9]\d{9}$/.test(formData.emergencyContactNumber.trim())) {
        setFormError("Emergency contact number must start with 6, 7, 8, or 9 and be exactly 10 digits.");
        return;
      }
      if (formData.alternateContactNumber && !/^[6-9]\d{9}$/.test(formData.alternateContactNumber.trim())) {
        setFormError("Alternate contact number must start with 6, 7, 8, or 9 and be exactly 10 digits.");
        return;
      }
    }

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

  if (!isOpen || !canManageEmployeeProfile) return null;

  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-md flex items-center justify-center z-[1000] p-5 animate-[fadeIn_0.25s_ease-out]">
      <div className="bg-white rounded-[24px] w-full max-w-[1080px] h-[90vh] max-h-[90vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-[scaleIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">

        {/* Modal Header */}
        <div className="px-8 py-6 border-b-[1.5px] border-gray-100 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-[850] text-gray-900 m-0">
              Employee Profile Card
            </h3>
            <p className="text-[13px] text-gray-500 mt-1 mb-0 mx-0">
              Employee ID: <span className="font-bold text-indigo-600">{employeeId}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer transition-all duration-200 outline-none hover:bg-gray-50"
              >
                ✏️ Edit {activeTab === 8 ? 'Documents' : 'Section'}
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-gray-100 border-none rounded-full w-9 h-9 flex items-center justify-center cursor-pointer text-gray-500 transition-all duration-200 hover:bg-gray-200 hover:text-gray-900"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {initialLoading ? (
          <div className="p-20 flex flex-col items-center gap-4 flex-1 justify-center">
            <Loader2 size={36} color="#6366F1" className="animate-spin" />
            <p className="text-gray-400 text-sm m-0">Fetching details...</p>
          </div>
        ) : (
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Left Sidebar: Tabs Navigation */}
            <div className="w-[240px] border-r-[1.5px] border-gray-100 bg-gray-50 flex flex-col gap-1.5 p-6 box-border overflow-y-auto shrink-0">
              <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.5px] mb-2 pl-2">
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
                    className={`w-full text-left px-4 py-3 rounded-xl border-none text-[13px] cursor-pointer transition-all duration-200 flex items-center justify-between outline-none box-border ${isActive ? 'bg-indigo-50 text-indigo-600 font-extrabold' : 'bg-transparent text-gray-600 font-semibold hover:bg-gray-200'
                      }`}
                  >
                    <span>{name}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    )}
                  </button>
                );
              })}

              <div className="flex-1" />

              <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer transition-all duration-200 text-center outline-none hover:bg-gray-50"
              >
                Close Profile
              </button>
            </div>

            {/* Right Pane: Scrollable Form / Details View */}
            <div className="flex-1 flex flex-col min-h-0 bg-white overflow-hidden">
              <form onSubmit={handleSectionSave} className="flex-1 flex flex-col min-h-0 m-0">
                {/* Right Pane Header */}
                <div className="px-8 py-6 border-b-[1.5px] border-gray-100 flex justify-between items-center shrink-0">
                  <div>
                    <h4 className="text-lg font-[850] text-gray-900 m-0">
                      {STEP_LABELS[activeTab - 1]}
                    </h4>
                    <p className="text-[13px] text-gray-500 mt-1 mb-0 mx-0">
                      {isEditing ? 'Modify the details below and save your changes.' : 'View details of the selected section.'}
                    </p>
                  </div>
                </div>

                {/* Right Pane Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 box-border">
                  {/* Alerts handled by global toast system */}

                  {/* Render content based on activeTab */}

                  {/* TAB 1: Basic Setup */}
                  {activeTab === 1 && (
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-2 gap-5">
                        <FormField
                          label="Full Name"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                          required
                          placeholder="e.g. Rajesh Kumar"
                        />
                        <FormField
                          label="Email Address"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                          required
                          type="email"
                          placeholder="rajesh@example.com"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <FormField
                          label="Phone Number"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                          required
                          placeholder="9876543210"
                        />
                        <FormField
                          label="Role Type"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                          options={roleOptions}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2">
                            Reporting Manager <span className="text-[11px] font-normal text-gray-400">(Optional)</span>
                          </label>
                          <select
                            name="reportingToId"
                            value={formData.reportingToId}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-200 text-sm outline-none bg-[#FAFAFA] transition-[border-color] duration-200 ${isEditing ? 'bg-white cursor-pointer focus:border-indigo-500' : 'bg-gray-50 cursor-not-allowed'
                              }`}
                          >
                            <option value="">Select Reporting Manager</option>
                            {reportingManagers.map((mgr) => (
                              <option key={mgr.id} value={mgr.id}>
                                {mgr.fullName || mgr.name || `ID: ${mgr.id}`} {mgr.role ? `(${mgr.role.replace(/_/g, ' ')})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        <FormField
                          label="Security Password (Leave empty to keep current)"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Personal Info */}
                  {activeTab === 2 && (
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          label="First Name"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                          required
                          placeholder="First Name"
                        />
                        <FormField
                          label="Middle Name"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                          placeholder="Middle Name"
                        />
                        <FormField
                          label="Surname"
                          name="surname"
                          value={formData.surname}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                          required
                          placeholder="Surname"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          label="Date of Birth"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                          required
                          type="date"
                        />
                        <FormField
                          label="Gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          isEditing={isEditing}
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
                          isEditing={isEditing}
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
                          isEditing={isEditing}
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
                          isEditing={isEditing}
                          required
                          placeholder="Father's Full Name"
                        />
                        <FormField
                          label="Mother's Name"
                          name="motherName"
                          value={formData.motherName}
                          onChange={handleInputChange}
                          isEditing={isEditing}
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
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-200 text-sm outline-none box-border transition-[border-color] duration-200 h-20 resize-none ${isEditing ? 'bg-white cursor-text focus:border-indigo-500' : 'bg-gray-50 cursor-not-allowed'
                            }`}
                        />
                      </div>
                      <div>
                        <label className={`flex items-center gap-2 text-[13px] font-bold text-gray-700 mb-2 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                          <input
                            type="checkbox"
                            name="sameAsCurrentAddress"
                            checked={formData.sameAsCurrentAddress}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-4 h-4"
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
                            disabled={!isEditing || formData.sameAsCurrentAddress}
                            className={`w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-200 text-sm outline-none box-border transition-[border-color] duration-200 h-20 resize-none ${(isEditing && !formData.sameAsCurrentAddress) ? 'bg-white cursor-text focus:border-indigo-500' : 'bg-gray-50 cursor-not-allowed'
                              }`}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Employment */}
                  {activeTab === 3 && (
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-2 gap-5">
                        <FormField
                          label="Department"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                          required
                          options={departmentsList}
                        />
                        <div>
                          {isCustomDesignation ? (
                            <div>
                              <FormField
                                label="Designation"
                                name="designation"
                                value={formData.designation}
                                onChange={handleInputChange}
                                isEditing={isEditing}
                                required
                                placeholder="e.g. Vice President (VP)"
                              />
                            </div>
                          ) : (
                            <FormField
                              label="Designation"
                              name="designationSelect"
                              value={
                                ['Medical Representative (MR)', 'Area Sales Manager (ASM)', 'Regional Sales Manager (RSM)', 'Zonal Business Manager (ZBM)', ''].includes(formData.designation)
                                  ? formData.designation
                                  : 'Other'
                              }
                              onChange={handleDesignationSelectChange}
                              required
                              options={DESIGNATION_OPTIONS}
                              isEditing={isEditing}
                            />
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <FormField
                          label="Date of Joining"
                          name="dateOfJoining"
                          value={formData.dateOfJoining}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                          required
                          type="date"
                        />
                        <FormField
                          label="Work Location"
                          name="workLocation"
                          value={formData.workLocation}
                          onChange={handleInputChange}
                          isEditing={isEditing}
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
                          isEditing={isEditing}
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
                          isEditing={isEditing}
                          type="number"
                          placeholder="e.g. 500000"
                        />
                      </div>
                      <label className={`flex items-center gap-2 text-[13px] font-bold text-gray-700 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                        <input
                          type="checkbox"
                          name="isFresher"
                          checked={formData.isFresher}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-4 h-4"
                        />
                        Candidate is a fresher (Step 4 – Experience – is optional)
                      </label>
                    </div>
                  )}

                  {/* TAB 4: Experience */}
                  {activeTab === 4 && (
                    formData.isFresher ? (
                      <div className="p-6 bg-gray-50 rounded-xl border-[1.5px] border-dashed border-gray-200 text-gray-500 text-[13px] font-semibold text-center">
                        Candidate is marked as a Fresher. No past work experience is recorded.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-5">
                          <FormField
                            label="Previous Company"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            isEditing={isEditing}
                            required={!formData.isFresher}
                            placeholder="e.g. Novartis India"
                          />
                          <FormField
                            label="Previous Designation"
                            name="prevDesignation"
                            value={formData.prevDesignation}
                            onChange={handleInputChange}
                            isEditing={isEditing}
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
                            isEditing={isEditing}
                            placeholder="e.g. Sales"
                          />
                          <FormField
                            label="From Date"
                            name="expFromDate"
                            value={formData.expFromDate}
                            onChange={handleInputChange}
                            isEditing={isEditing}
                            type="date"
                          />
                          <FormField
                            label="To Date"
                            name="expToDate"
                            value={formData.expToDate}
                            onChange={handleInputChange}
                            isEditing={isEditing}
                            type="date"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                          <FormField
                            label="Total Experience"
                            name="totalExperience"
                            value={formData.totalExperience}
                            onChange={handleInputChange}
                            isEditing={isEditing}
                            placeholder="e.g. 2 Years 4 Months"
                          />
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
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-2 gap-5">
                        <FormField
                          label="Bank Name"
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                          required
                          placeholder="e.g. HDFC Bank"
                        />
                        <FormField
                          label="Account Number"
                          name="accountNumber"
                          value={formData.accountNumber}
                          onChange={handleInputChange}
                          isEditing={isEditing}
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
                          isEditing={isEditing}
                          required
                          placeholder="e.g. HDFC0000124"
                        />
                        <FormField
                          label="Branch Name"
                          name="branchName"
                          value={formData.branchName}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                          required
                          placeholder="e.g. Koramangala Branch"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 6: Statutory */}
                  {activeTab === 6 && (
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-2 gap-5">
                        <FormField
                          label="PAN Number"
                          name="panNumber"
                          value={formData.panNumber}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                          required
                          placeholder="e.g. ABCDE1234F"
                        />
                        <FormField
                          label="Aadhaar Number"
                          name="aadharNumber"
                          value={formData.aadharNumber}
                          onChange={handleInputChange}
                          isEditing={isEditing}
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
                            isEditing={isEditing}
                            placeholder={ph}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 7: Emergency Info */}
                  {activeTab === 7 && (
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-2 gap-5">
                        <FormField
                          label="Emergency Contact Name"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                          required
                          placeholder="Full Name of Contact Person"
                        />
                        <FormField
                          label="Relationship"
                          name="relationship"
                          value={formData.relationship}
                          onChange={handleInputChange}
                          isEditing={isEditing}
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
                          isEditing={isEditing}
                          required
                          placeholder="Primary Phone"
                        />
                        <FormField
                          label="Alternate Number (Optional)"
                          name="alternateContactNumber"
                          value={formData.alternateContactNumber}
                          onChange={handleInputChange}
                          isEditing={isEditing}
                          placeholder="Secondary Phone"
                        />
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
                      <div className="flex gap-6 h-[420px] box-border">
                        {/* Left Panel: Document selection list */}
                        <div className="w-[300px] flex flex-col gap-3 overflow-y-auto pr-1.5 shrink-0">
                          <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.5px] mb-1">
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
                                className={`p-3 rounded-xl border-[1.5px] cursor-pointer flex flex-col gap-1.5 transition-all duration-200 ${isActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-400'
                                  }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className={`text-[13px] font-bold ${isActive ? 'text-indigo-700' : 'text-gray-700'}`}>
                                    {doc.label}
                                  </span>
                                  {isDraft && (
                                    <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full font-extrabold border border-indigo-200">
                                      Draft
                                    </span>
                                  )}
                                  {isUploaded && (
                                    <span className="text-[9px] bg-emerald-50 text-emerald-500 px-1.5 py-0.5 rounded-full font-extrabold border border-emerald-200">
                                      Uploaded
                                    </span>
                                  )}
                                  {!hasFile && (
                                    <span className="text-[9px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-full font-extrabold border border-orange-200">
                                      Missing
                                    </span>
                                  )}
                                </div>
                                <div className="flex justify-between items-center mt-0.5">
                                  <span className="text-[11px] text-gray-400 truncate max-w-[140px]">
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
                                        className={`text-[11px] font-bold border-none rounded px-2 py-1 cursor-pointer transition-all duration-200 ${isActive ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                                          }`}
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
                                        className="hidden"
                                      />
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Right Panel: Large Document Preview Window */}
                        <div className="flex-1 border-[1.5px] border-gray-200 rounded-2xl flex flex-col overflow-hidden bg-gray-50">
                          {/* Preview Topbar */}
                          <div className="px-4 py-3 border-b-[1.5px] border-gray-200 bg-white flex justify-between items-center">
                            <div>
                              <span className="text-sm font-extrabold text-gray-900">
                                {activeDoc.label}
                              </span>
                              <span className="text-[11px] text-gray-400 ml-2">
                                {activeDoc.fileState ? 'Draft File' : activeDoc.existingUrl ? 'Stored on Server' : 'Empty'}
                              </span>
                            </div>
                            <div className="flex gap-2 items-center">
                              {displayUrl && (
                                <a
                                  href={displayUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-bold text-blue-600 bg-blue-50 border-[1.5px] border-blue-200 rounded-lg px-3 py-1 text-center no-underline cursor-pointer"
                                >
                                  View Fullscreen
                                </a>
                              )}
                              {isEditing && activeDoc.fileState && (
                                <button
                                  type="button"
                                  onClick={() => activeDoc.setFileState(null)}
                                  className="text-[11px] font-bold text-red-600 bg-red-50 border-[1.5px] border-red-200 rounded-lg px-3 py-1 cursor-pointer"
                                >
                                  Clear Draft
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Preview Viewer Box */}
                          <div className="flex-1 p-5 flex items-center justify-center overflow-hidden">
                            {displayUrl ? (
                              isImg ? (
                                <div className="w-full h-full bg-white rounded-lg border-[1.5px] border-gray-200 p-3 flex items-center justify-center box-border shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
                                  <img
                                    src={displayUrl}
                                    alt={activeDoc.label}
                                    className="max-w-full max-h-full object-contain rounded"
                                  />
                                </div>
                              ) : (
                                <div className="text-center bg-white px-6 py-8 rounded-2xl border-[1.5px] border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.03)] max-w-[300px]">
                                  <div className="w-[60px] h-[60px] rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                    <Upload size={28} />
                                  </div>
                                  <h4 className="text-sm font-extrabold text-gray-900 mt-0 mb-1.5 mx-0">
                                    Document File (PDF)
                                  </h4>
                                  <p className="text-[11px] text-gray-500 mt-0 mb-4.5 mx-0 leading-normal">
                                    Direct preview of PDFs is not supported inline. Click the button below to view the file.
                                  </p>
                                  <a
                                    href={displayUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-xs no-underline text-center transition-opacity duration-200 hover:opacity-90"
                                  >
                                    Open Document
                                  </a>
                                </div>
                              )
                            ) : (
                              <div className="text-center text-gray-400">
                                <Upload size={40} className="mb-2.5 text-gray-400" />
                                <div className="text-[13px] font-bold text-gray-600">No File Chosen</div>
                                <div className="text-[11px] mt-0.5">
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
                    <div className="flex gap-3 mt-8 pt-6 border-t-[1.5px] border-gray-100">
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
                        className="px-5 py-2.5 rounded-lg border-[1.5px] border-gray-200 bg-white text-gray-500 font-bold text-[13px] cursor-pointer transition-all duration-200 outline-none hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`flex items-center gap-1.5 px-6 py-2.5 rounded-lg border-none bg-indigo-600 text-white font-bold text-[13px] transition-all duration-200 shadow-[0_4px_12px_rgba(79,70,229,0.2)] outline-none hover:bg-indigo-700 ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                      >
                        {loading && (
                          <Loader2 size={14} className="animate-spin" />
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

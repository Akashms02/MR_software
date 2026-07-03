import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProfile, updateAdminSettings } from "../../redux/actions/authActions";
import { API_ROUTE } from "../../data/env";
import {
  User,
  Mail,
  Phone,
  Shield,
  Check,
  AlertCircle,
  Upload,
  MapPin,
  Building,
  Image as ImageIcon,
  Calendar,
  Code,
  Loader2,
  Trash2,
  Compass,
  FileCheck,
  Lock
} from "lucide-react";

import { getFullAssetUrl } from "../../utils/getFullAssetUrl";

// Tailwind CSS styled interactive uploader supporting drag-and-drop, direct file uploads, base64 previews
const FileUploader = ({ label, value, onChange, onClear, id }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB.");
      return;
    }
    onChange(file);
  };

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-[280px]">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      
      {value ? (
        <div className="relative rounded-2xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-between transition-all duration-200 hover:border-gray-300">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 p-1 flex items-center justify-center overflow-hidden">
              <img src={value} alt={label} className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">
                Configured
              </span>
              <p className="text-xs font-bold text-gray-700 mt-1 max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
                {value.startsWith("data:") ? "Local File Selected" : "Server Asset Image"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 border-none cursor-pointer flex items-center justify-center transition-colors duration-200"
            title="Remove Image"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[120px] ${
            dragActive
              ? "border-[#C8F04A] bg-[#C8F04A]/5 shadow-sm" 
              : "border-gray-200 bg-gray-50 hover:border-[#C8F04A] hover:bg-[#C8F04A]/5 hover:shadow-sm"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) processFile(e.target.files[0]);
            }}
            className="hidden"
            id={id}
          />
          <Upload 
            size={24} 
            className={`transition-transform duration-200 ${
              dragActive 
                ? "text-[#8BB800] -translate-y-1" 
                : "text-gray-400 group-hover:text-[#8BB800] group-hover:-translate-y-1"
            }`}
          />
          <p className="text-sm font-semibold text-gray-700 m-0">Drag & drop or click to upload</p>
          <p className="text-xs text-gray-400 m-0">PNG, JPG, SVG up to 2MB</p>
        </div>
      )}
    </div>
  );
};

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // General Text Form Fields State
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    adminReferenceCode: "",
  });

  // Logo & Stamp File & Preview States
  const [logoFile, setLogoFile] = useState(null);
  const [stampFile, setStampFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [stampPreview, setStampPreview] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Fetch user profile on mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Synchronize form when user state loads or refreshes
  useEffect(() => {
    if (user) {
      setFormState({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        adminReferenceCode: user.adminReferenceCode || "",
      });
      setLogoPreview(getFullAssetUrl(user.logoUrl) || "");
      setStampPreview(getFullAssetUrl(user.companyStampUrl) || "");
      setLogoFile(null);
      setStampFile(null);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "phone") {
      val = value.replace(/\D/g, "").slice(0, 10);
    }
    setFormState((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleLogoChange = (file) => {
    if (!file) {
      setLogoFile(null);
      setLogoPreview("");
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleStampChange = (file) => {
    if (!file) {
      setStampFile(null);
      setStampPreview("");
      return;
    }
    setStampFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setStampPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    if (formState.phone && formState.phone.length !== 10) {
      setSaveStatus({
        type: "error",
        message: "Phone number must be exactly 10 digits.",
      });
      setIsSaving(false);
      return;
    }

    // Build FormData payload to support MultiPartFile uploads expected by Spring Boot
    const formDataPayload = new FormData();
    formDataPayload.append("fullName", formState.fullName.trim());
    formDataPayload.append("email", formState.email.trim());
    formDataPayload.append("phone", formState.phone.trim());
    formDataPayload.append("companyCode", formState.adminReferenceCode.trim().toUpperCase());
    formDataPayload.append("address", formState.address.trim());

    if (logoFile) {
      formDataPayload.append("logo", logoFile);
    }
    if (stampFile) {
      formDataPayload.append("stamp", stampFile);
    }

    try {
      const res = await dispatch(updateAdminSettings(formDataPayload));
      if (res) {
        // Fetch new profile to sync across global headers and context
        await dispatch(fetchProfile());
        setSaveStatus({
          type: "success",
          message: "Profile and corporate branding assets updated successfully!",
        });
      } else {
        setSaveStatus({
          type: "error",
          message: "Failed to update corporate profile. Please verify your details.",
        });
      }
    } catch (err) {
      setSaveStatus({
        type: "error",
        message: err.response?.data?.message || err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to format date
  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return isoString;
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-[#C8F04A]" size={36} />
        <p className="text-gray-500 font-semibold text-sm">Loading system settings...</p>
      </div>
    );
  }

  // Check if form has actual modifications (is dirty)
  const hasChanges =
    formState.phone.trim() !== (user.phone || "").trim() ||
    formState.address.trim() !== (user.address || "").trim() ||
    logoFile !== null ||
    stampFile !== null;

  return (
    <div className="flex flex-col gap-6 pb-10 font-sans box-border w-full animate-fade">

      {/* Main Content Layout - Flex wrapper for robust responsive spacing */}
      <div className="flex flex-col lg:flex-row gap-6 w-full box-border">
        
        {/* LEFT COLUMN: System Attributes & Live branding previews */}
        <div className="w-full lg:w-[380px] flex flex-col gap-6 shrink-0 box-border">
          
          {/* Identity Card */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm flex flex-col gap-5 box-border">
            <h3 className="text-base font-extrabold text-gray-900 m-0 flex items-center gap-2">
              <Compass size={18} className="text-indigo-600" /> Identity & Status
            </h3>
            
            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="relative">
                {logoPreview ? (
                  <div className="w-18 h-18 rounded-2xl bg-white border border-gray-200 p-1 flex items-center justify-center overflow-hidden shadow-md">
                    <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-18 h-18 rounded-2xl bg-gray-900 text-white font-extrabold text-3xl flex items-center justify-center shadow-md">
                    {user.fullName?.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-emerald-500 border-[3px] border-white" title="Active" />
              </div>
              <h4 className="text-[15px] font-extrabold text-gray-900 mt-3 mb-0.5">{user.fullName}</h4>
              <p className="text-xs text-gray-500 font-medium m-0">{user.email}</p>
              
              <div className="mt-3 inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                <Shield size={11} /> {user.role}
              </div>
            </div>

            {/* Read-only system metadata attributes as requested */}
            <div className="flex flex-col gap-3">
              <div className="text-[10.5px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 m-0">
                Available Attributes
              </div>
              
              {[
                { label: "Admin ID", value: `#${user.id}`, icon: <Code size={14} className="text-gray-400" /> },
                { label: "Reference Code", value: user.adminReferenceCode || "GMPY", icon: <Building size={14} className="text-gray-400" />, highlight: true },
                { label: "Phone Contact", value: user.phone || "N/A", icon: <Phone size={14} className="text-gray-400" /> },
                { label: "Account State", value: user.enabled ? "Active / Enabled" : "Disabled", icon: <FileCheck size={14} className="text-gray-400" />, badge: user.enabled ? "success" : "danger" },
                { label: "Creation Date", value: formatDate(user.createdAt), icon: <Calendar size={14} className="text-gray-400" /> },
                { label: "Reporting Structure", value: user.reportingToName || "Root Admin", icon: <User size={14} className="text-gray-400" /> }
              ].map((attr, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-[12.5px]">
                  <div className="flex items-center gap-2">
                    {attr.icon}
                    <span className="text-gray-500 font-medium">{attr.label}</span>
                  </div>
                  {attr.badge ? (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      attr.badge === "success" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {attr.value}
                    </span>
                  ) : attr.highlight ? (
                    <span className="text-xs font-bold text-gray-950 bg-[#C8F04A]/30 px-2 py-0.5 rounded-md border border-[#C8F04A]/50">
                      {attr.value}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-gray-800 text-right">{attr.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Branding Live Preview Mockups */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm flex flex-col gap-5 box-border">
            <h3 className="text-base font-extrabold text-gray-900 m-0 flex items-center gap-2">
              <ImageIcon size={18} className="text-indigo-600" /> Branding Live Preview
            </h3>
            
            <div className="flex flex-col gap-4">
              {/* Logo Preview */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-bold text-gray-500 mb-2.5 m-0">Live Corporate Logo</p>
                <div className="h-20 rounded-xl bg-white border border-gray-200 flex items-center justify-center p-3">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon size={20} className="mx-auto mb-1 opacity-50" />
                      <span className="text-[11.5px] font-medium block">No Logo configured</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stamp Preview */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-bold text-gray-500 mb-2.5 m-0">Live Signature/Company Stamp</p>
                <div className="h-24 rounded-xl bg-white border border-gray-200 flex items-center justify-center p-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />
                  {stampPreview ? (
                    <img src={stampPreview} alt="Stamp" className="max-h-full max-w-full object-contain mix-blend-multiply relative z-10" />
                  ) : (
                    <div className="text-center text-slate-400 relative z-10">
                      <ImageIcon size={20} className="mx-auto mb-1 opacity-50" />
                      <span className="text-[11.5px] font-medium block">No Stamp configured</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Profile & Branding Settings Form */}
        <div className="flex-1 flex flex-col gap-6 box-border">
          <form onSubmit={handleSave} className="flex flex-col gap-6 m-0 w-full box-border">
            
            {/* Status Feedback Notification */}
            {saveStatus && (
              <div className={`p-4 rounded-2xl border flex items-start gap-3 box-border animate-fade ${
                saveStatus.type === "success" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}>
                {saveStatus.type === "success" ? <Check size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
                <div>
                  <h4 className="m-0 text-sm font-extrabold">{saveStatus.type === "success" ? "Changes Applied Successfully" : "Validation Error"}</h4>
                  <p className="m-0 mt-0.5 text-xs font-semibold opacity-90">{saveStatus.message}</p>
                </div>
              </div>
            )}

            {/* General Profile Info Section */}
            <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm flex flex-col gap-5 box-border">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-gray-900 m-0">General Information</h3>
                  <p className="text-xs text-gray-500 m-0 mt-0.5">Update your core administrative profile credentials.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 box-border">
                
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">FULL NAME</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    <input
                      type="text"
                      name="fullName"
                      value={formState.fullName}
                      disabled={true}
                      placeholder="e.g. Gmaxepay Superadmin"
                      className="w-full pl-10 pr-10 py-3 text-sm font-semibold rounded-xl border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed outline-none transition-all box-border"
                    />
                    <Lock size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">EMAIL ADDRESS</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      value={formState.email}
                      disabled={true}
                      placeholder="e.g. admin@mrmedical.com"
                      className="w-full pl-10 pr-10 py-3 text-sm font-semibold rounded-xl border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed outline-none transition-all box-border"
                    />
                    <Lock size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">PHONE NUMBER</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="tel"
                      name="phone"
                      value={formState.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-10 pr-4 py-3 text-sm font-semibold rounded-xl border border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-50/50 focus:bg-white focus:border-[#C8F04A] focus:ring-[3.5px] focus:ring-[#C8F04A]/15 outline-none transition-all duration-180 box-border"
                    />
                  </div>
                </div>

                {/* Reference Code */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ADMIN REFERENCE CODE</label>
                  <div className="relative">
                    <Code size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    <input
                      type="text"
                      name="adminReferenceCode"
                      value={formState.adminReferenceCode}
                      disabled={true}
                      placeholder="GMPY"
                      className="w-full pl-10 pr-10 py-3 text-sm font-semibold rounded-xl border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed outline-none transition-all box-border font-mono font-bold"
                    />
                    <Lock size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">CORPORATE ADDRESS</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-4 text-gray-400 pointer-events-none" />
                    <textarea
                      name="address"
                      value={formState.address}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter company head office or corporate address here..."
                      className="w-full pl-10 pr-4 py-3 text-sm font-semibold rounded-xl border border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-50/50 focus:bg-white focus:border-[#C8F04A] focus:ring-[3.5px] focus:ring-[#C8F04A]/15 outline-none transition-all duration-180 box-border resize-none"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block leading-normal">
                    This corporate address is used in dynamic document headings, salary payslips, and experience letters generated by the hub.
                  </span>
                </div>

              </div>
            </div>

            {/* Corporate Branding Assets Section */}
            <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm flex flex-col gap-5 box-border">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-gray-900 m-0">Corporate Branding Assets</h3>
                  <p className="text-xs text-gray-500 m-0 mt-0.5">Configure corporate stamp and logos for PDF compiling.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-5 box-border">
                {/* Company Logo Uploader */}
                <FileUploader
                  label="Company Logo"
                  value={logoPreview}
                  id="logo-upload"
                  onChange={handleLogoChange}
                  onClear={() => handleLogoChange(null)}
                />

                {/* Stamp Uploader */}
                <FileUploader
                  label="Signature / Company Stamp"
                  value={stampPreview}
                  id="stamp-upload"
                  onChange={handleStampChange}
                  onClear={() => handleStampChange(null)}
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-end items-center gap-3 mt-2 box-border">
              {hasChanges && (
                <button
                  type="button"
                  onClick={() => {
                    if (user) {
                      setFormState({
                        fullName: user.fullName || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        address: user.address || "",
                        adminReferenceCode: user.adminReferenceCode || "",
                      });
                      setLogoPreview(getFullAssetUrl(user.logoUrl) || "");
                      setStampPreview(getFullAssetUrl(user.companyStampUrl) || "");
                      setLogoFile(null);
                      setStampFile(null);
                      setSaveStatus(null);
                    }
                  }}
                  disabled={isSaving}
                  className="px-6 py-3 border border-gray-200 text-gray-600 bg-transparent font-bold text-sm rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 cursor-pointer disabled:opacity-50"
                >
                  Reset Changes
                </button>
              )}

              <button
                type="submit"
                disabled={isSaving || !hasChanges}
                className={`px-8 py-3 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 border-none ${
                  (!hasChanges || isSaving) 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" 
                    : "bg-[#C8F04A] text-gray-900 shadow-md shadow-[#C8F04A]/10 hover:shadow-[#C8F04A]/25 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} strokeWidth={3} /> Save & Apply Settings
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;
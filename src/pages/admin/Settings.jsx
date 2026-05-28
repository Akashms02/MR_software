import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProfile, updateAdminSettings } from "../../redux/actions/authActions";
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
  FileCheck
} from "lucide-react";

// Inline styled interactive uploader supporting drag-and-drop, direct file uploads, base64 visual previews
const FileUploader = ({ label, value, onChange, onClear, id }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
      <label style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", uppercase: "true", letterSpacing: "0.5px" }}>
        {label.toUpperCase()}
      </label>
      
      {value ? (
        <div style={{
          position: "relative",
          borderRadius: "16px",
          border: "1.5px solid #E5E7EB",
          background: "#F9FAFB",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "all 0.2s ease"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "12px",
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden"
            }}>
              <img src={value} alt={label} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
            <div>
              <span style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#059669",
                background: "#ECFDF5",
                padding: "2px 8px",
                borderRadius: "999px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Configured
              </span>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginTop: "4px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {value.startsWith("data:") ? "Local File Selected" : "Server Asset Image"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            style={{
              padding: "8px",
              borderRadius: "8px",
              background: "#FFF1F2",
              border: "none",
              color: "#F43F5E",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#FFE4E6";
              e.currentTarget.style.color = "#E11D48";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#FFF1F2";
              e.currentTarget.style.color = "#F43F5E";
            }}
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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            border: dragActive || isHovered ? "2px dashed #C8F04A" : "2px dashed #E5E7EB",
            borderRadius: "16px",
            padding: "24px",
            textAlign: "center",
            cursor: "pointer",
            background: dragActive || isHovered ? "rgba(200, 240, 74, 0.04)" : "#F9FAFB",
            transition: "all 0.2s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            minHeight: "120px"
          }}
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
          <Upload size={24} color={dragActive || isHovered ? "#8BB800" : "#9CA3AF"} style={{ transition: "transform 0.2s ease", transform: isHovered ? "translateY(-3px)" : "translateY(0)" }} />
          <p style={{ fontSize: "13px", fontWeight: 700, color: "#374151", margin: 0 }}>Drag & drop or click to upload</p>
          <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>PNG, JPG, SVG up to 2MB</p>
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
  const [focusField, setFocusField] = useState(null);

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
      setLogoPreview(user.logoUrl || "");
      setStampPreview(user.companyStampUrl || "");
      setLogoFile(null);
      setStampFile(null);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "12px" }}>
        <Loader2 className="animate-spin" color="#C8F04A" size={36} />
        <p style={{ color: "#6B7280", fontWeight: 600, fontSize: "14px" }}>Loading system settings...</p>
      </div>
    );
  }

  // Base style for all cards to keep consistency with the App design
  const cardStyle = {
    background: "#FFFFFF",
    borderRadius: "24px",
    border: "1.5px solid #E5E7EB",
    padding: "28px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    boxSizing: "border-box"
  };

  const inputContainerStyle = (fieldName) => ({
    width: "100%",
    padding: "12px 16px 12px 40px",
    borderRadius: "12px",
    border: "1.5px solid",
    borderColor: focusField === fieldName ? "#C8F04A" : "#E5E7EB",
    background: focusField === fieldName ? "#FFFFFF" : "#F9FAFB",
    boxShadow: focusField === fieldName ? "0 0 0 3.5px rgba(200, 240, 74, 0.15)" : "none",
    fontSize: "14px",
    fontWeight: 500,
    color: "#1F2937",
    outline: "none",
    transition: "all 0.18s ease",
    boxSizing: "border-box"
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "40px", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Top Banner / Welcome Header */}
      <div style={{
        position: "relative",
        borderRadius: "24px",
        background: "#111827",
        color: "#FFFFFF",
        padding: "32px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "24px"
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(200, 240, 74, 0.08) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative", zIndex: 10, maxWidth: "680px" }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            background: "rgba(200, 240, 74, 0.15)",
            color: "#C8F04A",
            alignSelf: "flex-start"
          }}>
            <Shield size={12} /> System Console
          </span>
          <h1 style={{ fontSize: "28px", fontWeight: 850, color: "#FFFFFF", margin: 0, letterSpacing: "-0.5px" }}>Corporate Settings</h1>
          <p style={{ fontSize: "13.5px", color: "#9CA3AF", margin: 0, lineHeight: 1.6 }}>
            Configure company identification credentials, branding assets, custom logos, stamp metrics, and view available metadata attributes.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative", zIndex: 10 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0, fontWeight: 500 }}>Logged in as</p>
            <p style={{ fontSize: "13.5px", fontWeight: 700, color: "#FFFFFF", margin: "2px 0 0 0" }}>{user.fullName}</p>
          </div>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #C8F04A 0%, #B4A0FA 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#111827",
            fontWeight: 800,
            fontSize: "18px"
          }}>
            {user.fullName?.charAt(0)}
          </div>
        </div>
      </div>

      {/* Main Content Layout - Flex wrapper for robust responsive spacing */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", boxSizing: "border-box" }}>
        
        {/* LEFT COLUMN: System Attributes & Live branding previews */}
        <div style={{ flex: "1 1 360px", display: "flex", flexDirection: "column", gap: "24px", boxSizing: "border-box" }}>
          
          {/* Identity Card */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <Compass size={18} color="#4F46E5" /> Identity & Status
            </h3>
            
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "20px",
              borderRadius: "16px",
              background: "#F9FAFB",
              border: "1px solid #F3F4F6",
            }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "20px",
                  background: "#111827",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.06)"
                }}>
                  {user.fullName?.charAt(0)}
                </div>
                <div style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "#10B981",
                  border: "3px solid #FFFFFF"
                }} title="Active" />
              </div>
              <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#111827", margin: "12px 0 2px 0" }}>{user.fullName}</h4>
              <p style={{ fontSize: "12px", color: "#6B7280", margin: 0, fontWeight: 500 }}>{user.email}</p>
              
              <div style={{
                marginTop: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: "#EEF2FF",
                color: "#4F46E5",
                padding: "4px 12px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                <Shield size={11} /> {user.role}
              </div>
            </div>

            {/* Read-only system metadata attributes as requested */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{
                fontSize: "10.5px",
                fontWeight: 800,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                borderBottom: "1px solid #F3F4F6",
                paddingBottom: "8px",
                margin: 0
              }}>
                Available Attributes
              </div>
              
              {[
                { label: "Admin ID", value: `#${user.id}`, icon: <Code size={14} color="#9CA3AF" /> },
                { label: "Reference Code", value: user.adminReferenceCode || "GMPY", icon: <Building size={14} color="#9CA3AF" />, highlight: true },
                { label: "Phone Contact", value: user.phone || "N/A", icon: <Phone size={14} color="#9CA3AF" /> },
                { label: "Account State", value: user.enabled ? "Active / Enabled" : "Disabled", icon: <FileCheck size={14} color="#9CA3AF" />, badge: user.enabled ? "success" : "danger" },
                { label: "Creation Date", value: formatDate(user.createdAt), icon: <Calendar size={14} color="#9CA3AF" /> },
                { label: "Reporting Structure", value: user.reportingToName || "Root Admin", icon: <User size={14} color="#9CA3AF" /> }
              ].map((attr, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #F9FAFB",
                  fontSize: "12.5px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {attr.icon}
                    <span style={{ color: "#6B7280", fontWeight: 500 }}>{attr.label}</span>
                  </div>
                  {attr.badge ? (
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "999px",
                      background: attr.badge === "success" ? "#ECFDF5" : "#FEF2F2",
                      color: attr.badge === "success" ? "#047857" : "#B91C1C",
                      border: attr.badge === "success" ? "1px solid #A7F3D0" : "1px solid #FCA5A5"
                    }}>
                      {attr.value}
                    </span>
                  ) : attr.highlight ? (
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#1A1A1A",
                      background: "rgba(200, 240, 74, 0.25)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      border: "1px solid rgba(200, 240, 74, 0.4)"
                    }}>
                      {attr.value}
                    </span>
                  ) : (
                    <span style={{ fontWeight: 700, color: "#374151", textAlign: "right" }}>{attr.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Branding Live Preview Mockups */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <ImageIcon size={18} color="#4F46E5" /> Branding Live Preview
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Logo Preview */}
              <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "16px" }}>
                <p style={{ fontSize: "11.5px", fontWeight: 700, color: "#4B5563", margin: "0 0 10px 0" }}>Live Corporate Logo</p>
                <div style={{
                  height: "80px",
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px"
                }}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                  ) : (
                    <div style={{ textAlign: "center", color: "#9CA3AF" }}>
                      <ImageIcon size={20} style={{ margin: "0 auto 4px auto", opacity: 0.5 }} />
                      <span style={{ fontSize: "11.5px", fontWeight: 500, display: "block" }}>No Logo configured</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stamp Preview */}
              <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "16px" }}>
                <p style={{ fontSize: "11.5px", fontWeight: 700, color: "#4B5563", margin: "0 0 10px 0" }}>Live Signature/Company Stamp</p>
                <div style={{
                  height: "90px",
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "radial-gradient(#E5E7EB 1px, transparent 1px)",
                    backgroundSize: "12px 12px",
                    opacity: 0.4,
                    pointerEvents: "none"
                  }} />
                  {stampPreview ? (
                    <img src={stampPreview} alt="Stamp" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", mixBlendMode: "multiply" }} />
                  ) : (
                    <div style={{ textAlign: "center", color: "#9CA3AF", position: "relative", zIndex: 10 }}>
                      <ImageIcon size={20} style={{ margin: "0 auto 4px auto", opacity: 0.5 }} />
                      <span style={{ fontSize: "11.5px", fontWeight: 500, display: "block" }}>No Stamp configured</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Profile & Branding Settings Form */}
        <div style={{ flex: "2 1 640px", display: "flex", flexDirection: "column", gap: "24px", boxSizing: "border-box" }}>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px", margin: 0 }}>
            
            {/* Status Feedback Notification */}
            {saveStatus && (
              <div style={{
                padding: "16px",
                borderRadius: "16px",
                border: "1.5px solid",
                borderColor: saveStatus.type === "success" ? "#A7F3D0" : "#FCA5A5",
                background: saveStatus.type === "success" ? "#ECFDF5" : "#FEF2F2",
                color: saveStatus.type === "success" ? "#065F46" : "#991B1B",
                display: "flex",
                alignItems: "start",
                gap: "12px",
                boxSizing: "border-box"
              }}>
                {saveStatus.type === "success" ? <Check size={18} style={{ marginTop: "2px", flexShrink: 0 }} /> : <AlertCircle size={18} style={{ marginTop: "2px", flexShrink: 0 }} />}
                <div>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 800 }}>{saveStatus.type === "success" ? "Changes Applied Successfully" : "Validation Error"}</h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", fontWeight: 500, opacity: 0.9 }}>{saveStatus.message}</p>
                </div>
              </div>
            )}

            {/* General Profile Info Section */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #F3F4F6", paddingBottom: "16px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#EEF2FF",
                  color: "#4F46E5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <User size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 850, color: "#111827", margin: 0 }}>General Information</h3>
                  <p style={{ fontSize: "12px", color: "#6B7280", margin: "2px 0 0 0" }}>Update your core administrative profile credentials.</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", boxSizing: "border-box" }}>
                
                {/* Full Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#4B5563", uppercase: "true", letterSpacing: "0.5px" }}>FULL NAME</label>
                  <div style={{ position: "relative" }}>
                    <User size={15} color="#9CA3AF" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input
                      type="text"
                      name="fullName"
                      value={formState.fullName}
                      onChange={handleInputChange}
                      onFocus={() => setFocusField("fullName")}
                      onBlur={() => setFocusField(null)}
                      required
                      placeholder="e.g. Gmaxepay Superadmin"
                      style={inputContainerStyle("fullName")}
                    />
                  </div>
                </div>

                {/* Email */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#4B5563", uppercase: "true", letterSpacing: "0.5px" }}>EMAIL ADDRESS</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={15} color="#9CA3AF" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input
                      type="email"
                      name="email"
                      value={formState.email}
                      onChange={handleInputChange}
                      onFocus={() => setFocusField("email")}
                      onBlur={() => setFocusField(null)}
                      required
                      placeholder="e.g. admin@mrmedical.com"
                      style={inputContainerStyle("email")}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#4B5563", uppercase: "true", letterSpacing: "0.5px" }}>PHONE NUMBER</label>
                  <div style={{ position: "relative" }}>
                    <Phone size={15} color="#9CA3AF" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input
                      type="tel"
                      name="phone"
                      value={formState.phone}
                      onChange={handleInputChange}
                      onFocus={() => setFocusField("phone")}
                      onBlur={() => setFocusField(null)}
                      placeholder="e.g. 9876543210"
                      style={inputContainerStyle("phone")}
                    />
                  </div>
                </div>

                {/* Reference Code */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#4B5563", uppercase: "true", letterSpacing: "0.5px" }}>ADMIN REFERENCE CODE</label>
                  <div style={{ position: "relative" }}>
                    <Code size={15} color="#9CA3AF" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input
                      type="text"
                      name="adminReferenceCode"
                      value={formState.adminReferenceCode}
                      onChange={handleInputChange}
                      onFocus={() => setFocusField("adminReferenceCode")}
                      onBlur={() => setFocusField(null)}
                      placeholder="GMPY"
                      style={{
                        ...inputContainerStyle("adminReferenceCode"),
                        fontFamily: "monospace",
                        fontWeight: 700
                      }}
                    />
                  </div>
                </div>

                {/* Address field mapping for Spring Boot update */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#4B5563", uppercase: "true", letterSpacing: "0.5px" }}>CORPORATE ADDRESS</label>
                  <div style={{ position: "relative" }}>
                    <MapPin size={15} color="#9CA3AF" style={{ position: "absolute", left: "14px", top: "16px", pointerEvents: "none" }} />
                    <textarea
                      name="address"
                      value={formState.address}
                      onChange={handleInputChange}
                      onFocus={() => setFocusField("address")}
                      onBlur={() => setFocusField(null)}
                      rows={3}
                      placeholder="Enter company head office or corporate address here..."
                      style={{
                        width: "100%",
                        padding: "12px 16px 12px 40px",
                        borderRadius: "12px",
                        border: "1.5px solid",
                        borderColor: focusField === "address" ? "#C8F04A" : "#E5E7EB",
                        background: focusField === "address" ? "#FFFFFF" : "#F9FAFB",
                        boxShadow: focusField === "address" ? "0 0 0 3.5px rgba(200, 240, 74, 0.15)" : "none",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#1F2937",
                        outline: "none",
                        transition: "all 0.18s ease",
                        resize: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
                    This corporate address is used in dynamic document headings, salary payslips, and experience letters generated by the hub.
                  </span>
                </div>

              </div>
            </div>

            {/* Corporate Branding Assets Section */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #F3F4F6", paddingBottom: "16px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#EEF2FF",
                  color: "#4F46E5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 850, color: "#111827", margin: 0 }}>Corporate Branding Assets</h3>
                  <p style={{ fontSize: "12px", color: "#6B7280", margin: "2px 0 0 0" }}>Configure corporate stamp and logos for PDF compiling.</p>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", boxSizing: "border-box" }}>
                {/* Logo Uploader */}
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
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px", marginTop: "8px", boxSizing: "border-box" }}>
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
                    setLogoPreview(user.logoUrl || "");
                    setStampPreview(user.companyStampUrl || "");
                    setLogoFile(null);
                    setStampFile(null);
                    setSaveStatus(null);
                  }
                }}
                disabled={isSaving}
                style={{
                  padding: "12px 24px",
                  background: "transparent",
                  color: "#4B5563",
                  fontWeight: 700,
                  fontSize: "14px",
                  borderRadius: "12px",
                  border: "1.5px solid #E5E7EB",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  transition: "all 0.18s ease",
                }}
                onMouseEnter={e => {
                  if (!isSaving) {
                    e.currentTarget.style.background = "#F9FAFB";
                    e.currentTarget.style.borderColor = "#9CA3AF";
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
              >
                Reset Changes
              </button>

              <button
                type="submit"
                disabled={isSaving}
                style={{
                  padding: "12px 28px",
                  background: "#C8F04A",
                  color: "#111827",
                  fontWeight: 800,
                  fontSize: "14px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(200, 240, 74, 0.25)",
                  transition: "all 0.18s ease",
                }}
                onMouseEnter={e => {
                  if (!isSaving) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(200, 240, 74, 0.35)";
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(200, 240, 74, 0.25)";
                }}
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
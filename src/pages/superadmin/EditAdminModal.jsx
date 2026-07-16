import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  KeyRound, 
  Check, 
  Ban 
} from 'lucide-react';

const EditAdminModal = ({
  show,
  onClose,
  selectedAdmin,
  onSubmit,
  loading,
  error,
  success
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "ADMIN",
    adminReferenceCode: "",
    enabled: true
  });

  useEffect(() => {
    if (selectedAdmin) {
      setFormData({
        fullName: selectedAdmin.fullName || "",
        email: selectedAdmin.email || "",
        phone: selectedAdmin.phone || "",
        role: selectedAdmin.role || "ADMIN",
        adminReferenceCode: selectedAdmin.adminReferenceCode || "",
        enabled: selectedAdmin.enabled !== false
      });
    }
  }, [selectedAdmin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "phone") {
      val = value.replace(/\D/g, "").slice(0, 10);
    }
    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Get Initials for Avatar Preview
  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 flex items-start justify-center z-[1000] p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-white w-full max-w-[460px] my-auto rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-100 flex flex-col relative"
          >
            {/* Top Premium Gradient Banner & Profile Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 text-white relative overflow-hidden flex items-center gap-4 shrink-0">
              {/* Decorative Mesh Blob */}
              <div className="absolute top-[-50px] right-[-50px] w-[180px] h-[180px] rounded-full bg-lime-400/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-[-60px] left-[-20px] w-[150px] h-[150px] rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

              {/* Initials Avatar Preview */}
              <motion.div 
                layout
                className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#C8F04A] to-[#A7D800] text-slate-900 font-extrabold text-lg flex items-center justify-center shadow-lg border border-white/20 shrink-0 select-none"
              >
                {getInitials(formData.fullName)}
              </motion.div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold tracking-tight m-0 text-white truncate">
                  {formData.fullName || "Edit Administrator"}
                </h3>
                <p className="text-[11px] text-slate-300 font-medium mt-0.5 truncate">
                  {formData.email || "Modify administrator details"}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                type="button"
                className="bg-white/10 border-none rounded-lg p-1.5 cursor-pointer hover:bg-white/20 transition-all text-white/80 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3.5 bg-slate-50/30">
              {/* Status Messages */}
              {error && (
                <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
                  <AlertCircle size={14} className="shrink-0" /> 
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Input Fields */}
              <div className="flex flex-col gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-0.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. John Doe"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Email and Phone Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-0.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="admin@example.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-0.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="9876543210"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Reference Code and System Role */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-0.5">
                      Reference Code
                    </label>
                    <div className="relative">
                      <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="adminReferenceCode"
                        value={formData.adminReferenceCode}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. GMPM"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-0.5">
                      System Role
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-150 bg-slate-100/70 text-slate-500 select-none">
                      <Shield size={14} className="text-slate-400 shrink-0" />
                      <span className="text-xs font-bold tracking-wide">Administrator</span>
                    </div>
                  </div>
                </div>

                {/* Account Status Pill Selector */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-0.5">
                    Account Status
                  </label>
                  <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, enabled: true })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        formData.enabled
                          ? "bg-white text-emerald-700 shadow-sm border border-slate-100"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, enabled: false })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        !formData.enabled
                          ? "bg-white text-rose-700 shadow-sm border border-slate-100"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Suspended
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center gap-3 mt-1.5 border-t border-slate-100 pt-3.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-50 active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[1.5] py-2.5 rounded-xl border-none bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-slate-950/10"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={12} />
                  ) : (
                    "Save Updates"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default EditAdminModal;

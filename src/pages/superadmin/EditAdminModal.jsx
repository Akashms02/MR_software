import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

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

  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-[4px] flex items-start justify-center z-[1000] p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-[500px] my-auto rounded-[24px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] overflow-hidden animate-[slideUp_0.4s_ease-out_forwards]">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 m-0">
              Edit Administrator
            </h3>
            <p className="text-[13px] text-gray-500 mt-1">
              Modify details for {selectedAdmin?.fullName || "Administrator"}.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="bg-gray-100 border-none rounded-lg p-2 cursor-pointer hover:bg-gray-200 transition-colors duration-150"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col gap-5">
            {/* Status Messages */}
            {error && (
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-2.5 text-rose-700 text-sm font-semibold">
                <AlertCircle size={18} /> {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2.5 text-emerald-700 text-sm font-semibold">
                <CheckCircle2 size={18} /> {success}
              </div>
            )}

            {/* Input Fields */}
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500 transition-colors duration-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="9876543210"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500 transition-colors duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Admin Reference Code
                </label>
                <input
                  name="adminReferenceCode"
                  value={formData.adminReferenceCode}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. GMPM"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  System Role
                </label>
                <select
                  name="role"
                  value="ADMIN"
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none bg-gray-100 cursor-not-allowed text-gray-500"
                >
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2">
                Account Status
              </label>
              <select
                name="enabled"
                value={formData.enabled ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.value === "true" })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:border-indigo-500 transition-colors duration-200"
              >
                <option value="true">Active (Access Enabled)</option>
                <option value="false">Inactive (Access Suspended)</option>
              </select>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 mt-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-sm cursor-pointer hover:bg-gray-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[1.5] py-3.5 rounded-xl border-none bg-gray-900 text-white font-bold text-sm cursor-pointer hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Update Account"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditAdminModal;

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, CheckCircle2, Loader2, Shield } from 'lucide-react';

const ModuleAccessModal = ({
  show,
  onClose,
  selectedAdmin,
  onSubmit,
  loading,
  error,
  success
}) => {
  const AVAILABLE_MODULES = [
    { id: 'requests',     label: 'Onboarding Requests' },
    { id: 'employees',    label: 'Employees' },
    { id: 'reports',      label: 'Reports & Analytics' },
    { id: 'sales',        label: 'Distributor Sales' },
    { id: 'tourplans',    label: 'Tour Plans' },
    { id: 'fieldtracking', label: 'Field Tracking' },
    { id: 'leaves',       label: 'Leave Approvals' },
    { id: 'holidays',     label: 'Holidays' },
    { id: 'myteam',       label: 'My Team' },
    { id: 'dcr-approvals', label: 'DCR Approvals' },
    { id: 'hrdocuments',  label: 'HR Documents' },
    { id: 'notices',      label: 'Notice Board' },
  ];

  const [allowedModules, setAllowedModules] = useState("all");

  useEffect(() => {
    if (selectedAdmin) {
      setAllowedModules(selectedAdmin.allowedModules || "all");
    }
  }, [selectedAdmin]);

  const isModuleChecked = (moduleVal) => {
    if (!allowedModules || allowedModules === "all") return true;
    return allowedModules.split(",").map(s => s.trim().toLowerCase()).includes(moduleVal.toLowerCase());
  };

  const handleToggleModule = (moduleVal) => {
    let currentList = [];
    if (!allowedModules || allowedModules === "all") {
      currentList = AVAILABLE_MODULES.map(m => m.id);
    } else {
      currentList = allowedModules.split(",").map(s => s.trim().toLowerCase());
    }

    let newList = [];
    if (currentList.includes(moduleVal.toLowerCase())) {
      newList = currentList.filter(id => id !== moduleVal.toLowerCase());
    } else {
      newList = [...currentList, moduleVal.toLowerCase()];
    }

    if (newList.length === AVAILABLE_MODULES.length) {
      setAllowedModules("all");
    } else {
      setAllowedModules(newList.join(","));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(allowedModules);
  };

  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-[4px] flex items-start justify-center z-[1000] p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-[450px] my-auto rounded-[24px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] overflow-hidden animate-[slideUp_0.4s_ease-out_forwards]">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Shield size={16} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 m-0">
                Module Permissions
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage access for {selectedAdmin?.fullName || "Company"}.
              </p>
            </div>
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

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
              <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Allowed Modules</span>
              <div className="flex flex-col gap-2.5 max-h-[250px] overflow-y-auto pr-1">
                {AVAILABLE_MODULES.map((m) => {
                  const checked = isModuleChecked(m.id);
                  return (
                    <label key={m.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-gray-100 hover:border-indigo-100 cursor-pointer select-none transition-all">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleModule(m.id)}
                        className="rounded text-indigo-650 focus:ring-indigo-500 w-4 h-4 cursor-pointer accent-indigo-600"
                      />
                      <span className="text-[13px] font-bold text-gray-700">{m.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 mt-1">
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
                  "Save Permissions"
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

export default ModuleAccessModal;

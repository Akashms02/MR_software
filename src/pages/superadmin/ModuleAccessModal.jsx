import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Shield, 
  ShieldCheck, 
  Check 
} from 'lucide-react';

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
            {/* Top Premium Gradient Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 text-white relative overflow-hidden flex items-center gap-4">
              {/* Decorative Mesh Blobs */}
              <div className="absolute top-[-50px] right-[-50px] w-[180px] h-[180px] rounded-full bg-[#C8F04A]/10 blur-3xl pointer-events-none" />
              
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#C8F04A] border border-white/15 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold tracking-tight m-0 text-white truncate">
                  Module Permissions
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                  Configure access control for {selectedAdmin?.fullName || "Administrator"}
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
              {/* Notifications */}
              {error && (
                <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-2xl flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Module List Grid Container */}
              <div className="bg-slate-50/55 p-3 rounded-2xl border border-slate-100">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-0.5">
                  Select Allowed Features
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_MODULES.map((m) => {
                    const checked = isModuleChecked(m.id);
                    return (
                      <motion.label 
                        key={m.id} 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer select-none transition-all ${
                          checked 
                            ? "bg-white border-slate-800 shadow-sm" 
                            : "bg-white/40 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleModule(m.id)}
                            className="sr-only"
                          />
                          {/* Custom Checkbox Design */}
                          <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center shrink-0 ${
                            checked 
                              ? "bg-slate-900 border-slate-900 text-white" 
                              : "border-slate-355 bg-white"
                          }`}>
                            {checked && <Check size={10} strokeWidth={3} />}
                          </div>
                        </div>
                        <span className={`text-xs font-bold truncate transition-all ${
                          checked ? "text-slate-900" : "text-slate-500"
                        }`}>
                          {m.label}
                        </span>
                      </motion.label>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center gap-3 mt-1 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm cursor-pointer hover:bg-slate-50 active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[1.5] py-3.5 rounded-2xl border-none bg-slate-900 text-white font-bold text-sm cursor-pointer hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-950/10"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    "Save Permissions"
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

export default ModuleAccessModal;

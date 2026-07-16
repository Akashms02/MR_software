import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAdmins,
  registerAdmin,
  clearErrors,
  clearSuccess,
} from "../../redux/actions/adminActions";
import {
  Plus,
  Search,
  Mail,
  Phone,
  Shield,
  User,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Edit,
  KeyRound,
  ShieldCheck,
  Check,
} from "lucide-react";
import { updateCompanyAccess, editCompanyData } from "../../redux/actions/companyAction";
import EditAdminModal from "./EditAdminModal";
import ModuleAccessModal from "./ModuleAccessModal";
import Pagination from "../../components/common/Pagination";
import { useToast } from "../../context/ToastContext";

const AdminManagement = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { admins = [], loading, error, success } = useSelector(
    (state) => state.admin || {}
  );
  const companyState = useSelector((state) => state.company || {});
  const [showModal, setShowModal] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  const filteredAdmins = (admins || []).filter(
    (admin) =>
      !searchQuery ||
      admin.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.adminReferenceCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const isModuleChecked = (moduleVal, allowedModulesStr) => {
    if (!allowedModulesStr || allowedModulesStr === "all") return true;
    return allowedModulesStr.split(",").map(s => s.trim().toLowerCase()).includes(moduleVal.toLowerCase());
  };

  const handleToggleModule = (moduleVal, allowedModulesStr, onChangeFn) => {
    let currentList = [];
    if (!allowedModulesStr || allowedModulesStr === "all") {
      currentList = AVAILABLE_MODULES.map(m => m.id);
    } else {
      currentList = allowedModulesStr.split(",").map(s => s.trim().toLowerCase());
    }

    let newList = [];
    if (currentList.includes(moduleVal.toLowerCase())) {
      newList = currentList.filter(id => id !== moduleVal.toLowerCase());
    } else {
      newList = [...currentList, moduleVal.toLowerCase()];
    }

    if (newList.length === AVAILABLE_MODULES.length) {
      onChangeFn("all");
    } else {
      onChangeFn(newList.join(","));
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "ADMIN",
    companyCode: "",
    allowedModules: "all",
  });

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Access Modal State
  const [showAccessModal, setShowAccessModal] = useState(false);

  useEffect(() => {
    dispatch(getAdmins());
  }, [dispatch]);

  // Sync / clear Redux errors/success immediately as we handle reporting via Toast
  useEffect(() => {
    if (success) {
      dispatch(clearSuccess());
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(clearErrors());
    }
  }, [error, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "phone") {
      val = value.replace(/\D/g, "").slice(0, 10);
    }
    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showToast("Registering administrator...", "loading");
    const res = await dispatch(registerAdmin(formData));
    if (res && (res.status === 'SUCCESS' || res.status === 200 || res.status === 201)) {
      showToast(res.message || "Administrator registered successfully!", "success");
      setShowModal(false);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        role: "ADMIN",
        companyCode: "",
        allowedModules: "all",
      });
    } else {
      showToast(res?.message || "Failed to register administrator.", "error");
    }
  };

  const handleOpenEditModal = (admin) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const handleOpenAccessModal = (admin) => {
    setSelectedAdmin(admin);
    setShowAccessModal(true);
  };

  const handleAccessSubmit = async (allowedModulesStr) => {
    if (selectedAdmin) {
      const payload = {
        fullName: selectedAdmin.fullName,
        email: selectedAdmin.email,
        phone: selectedAdmin.phone,
        companyCode: selectedAdmin.adminReferenceCode,
        allowedModules: allowedModulesStr,
      };
      showToast("Updating module permissions...", "loading");
      try {
        const res = await dispatch(editCompanyData(selectedAdmin.id, payload));
        if (res) {
          showToast(res.message || "Module permissions updated successfully.", "success");
          setShowAccessModal(false);
          setSelectedAdmin(null);
          dispatch(getAdmins());
        } else {
          showToast("Failed to update module permissions.", "error");
        }
      } catch (err) {
        console.error("Error updating module access:", err);
        showToast(err.message || "Error updating module permissions.", "error");
      }
    }
  };

  const handleEditSubmit = async (modalFormData) => {
    if (selectedAdmin) {
      const payload = {
        fullName: modalFormData.fullName,
        email: modalFormData.email,
        phone: modalFormData.phone,
        companyCode: modalFormData.adminReferenceCode,
      };
      showToast("Updating administrator details...", "loading");
      try {
        const wasEnabled = selectedAdmin.enabled !== false;
        if (modalFormData.enabled !== wasEnabled) {
          await dispatch(updateCompanyAccess(selectedAdmin.id, modalFormData.enabled));
        }

        const res = await dispatch(editCompanyData(selectedAdmin.id, payload));
        if (res) {
          showToast(res.message || "Administrator details updated successfully.", "success");
          setShowEditModal(false);
          setSelectedAdmin(null);
          dispatch(getAdmins());
        } else {
          showToast("Failed to update administrator details.", "error");
        }
      } catch (err) {
        console.error("Error updating company details:", err);
        showToast(err.message || "Error updating administrator details.", "error");
      }
    }
  };

  const handleToggleAdminStatus = async (adminId, currentStatus) => {
    setUpdatingStatusId(adminId);
    const newStatus = !currentStatus;
    showToast(`${newStatus ? 'Enabling' : 'Disabling'} administrator account...`, "loading");
    try {
      const res = await dispatch(updateCompanyAccess(adminId, newStatus));
      if (res) {
        showToast(res.message || `Administrator account successfully ${newStatus ? 'enabled' : 'disabled'}.`, "success");
        dispatch(getAdmins());
      } else {
        showToast(`Failed to update administrator status.`, "error");
      }
    } catch (err) {
      console.error("Error updating admin status:", err);
      showToast(err.message || "Error updating administrator status.", "error");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getStatusIcon = (admin) => {
    if (updatingStatusId === admin.id) {
      return <Loader2 size={16} className="animate-spin" />;
    }
    return admin.enabled ? (
      <ToggleRight size={16} />
    ) : (
      <ToggleLeft size={16} />
    );
  };


  return (
    <div className="animate-[fadeIn_0.4s_ease-out_forwards] p-2">
      {/* Action Bar */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl font-bold text-sm border-none cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          <Plus size={18} strokeWidth={3} />
          Register New Admin
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-[calc(100vh-190px)]">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4 shrink-0">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              placeholder="Search by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3.5 py-2.5 rounded-lg border border-gray-200 w-[300px] text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <button className="bg-transparent border-none text-gray-500 text-sm font-semibold cursor-pointer hover:text-gray-700 transition-colors duration-150">
            Filter & Sort
          </button>
        </div>

        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-[0_1px_0_rgba(229,231,235,1)]">
              <tr>
                {["Administrator", "Contact Info", "Role", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-4 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && admins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-[#6366F1]"
                      size={24}
                    />
                    <p className="mt-3 text-gray-500 text-sm">
                      Fetching administrator list...
                    </p>
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500">
                    No administrators found.
                  </td>
                </tr>
              ) : (
                filteredAdmins.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((admin) => {
                  const isEnabled = admin.enabled !== false;
                  return (
                    <tr
                      key={admin.id}
                      className="border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50/50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {admin.fullName?.charAt(0) || <User size={18} />}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">
                              {admin.fullName}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              ID: {admin.id?.toString().slice(-8) || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                            <Mail size={14} className="text-gray-400" /> {admin.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                            <Phone size={14} className="text-gray-400" /> {admin.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-1.5 bg-[#EEF2FF] text-[#4F46E5] px-2.5 py-1 rounded-md text-xs font-bold border border-[#E0E7FF]">
                          <Shield size={12} /> {admin.role}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${isEnabled ? "bg-emerald-500" : "bg-rose-500"}`} />
                          <span className={`text-[13px] font-semibold ${isEnabled ? "text-emerald-600" : "text-rose-600"}`}>
                            {isEnabled ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => handleToggleAdminStatus(admin.id, isEnabled)}
                            disabled={updatingStatusId === admin.id}
                            className={`flex items-center gap-1.5 border-none px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                              isEnabled 
                                ? "bg-rose-50 text-rose-700 hover:bg-rose-100" 
                                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            }`}
                          >
                            {getStatusIcon(admin)}
                            {isEnabled ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(admin)}
                            className="flex items-center gap-1.5 bg-gray-100 border-none text-gray-700 px-3.5 py-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-150 hover:bg-gray-200 hover:-translate-y-0.5 hover:shadow-sm"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleOpenAccessModal(admin)}
                            className="flex items-center gap-1.5 bg-indigo-50 border-none text-indigo-700 px-3.5 py-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-150 hover:bg-indigo-100 hover:-translate-y-0.5 hover:shadow-sm"
                          >
                            <Shield size={14} className="text-indigo-600" />
                            Modules
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 pb-4 bg-white">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredAdmins.length / pageSize)}
            totalElements={filteredAdmins.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            isLoading={loading}
            activeBtnClass="bg-[#C8F04A] text-gray-900"
          />
        </div>
      </div>

      {/* Register Modal */}
      <AnimatePresence>
        {showModal && createPortal(
          <div className="fixed inset-0 flex items-start justify-center z-[1000] p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
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
                {/* Decorative Mesh Blob */}
                <div className="absolute top-[-50px] right-[-50px] w-[180px] h-[180px] rounded-full bg-lime-400/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-60px] left-[-20px] w-[150px] h-[150px] rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

                {/* Avatar Preview */}
                <motion.div 
                  layout
                  className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#C8F04A] to-[#A7D800] text-slate-900 font-extrabold text-lg flex items-center justify-center shadow-lg border border-white/20 shrink-0 select-none"
                >
                  {formData.fullName ? formData.fullName.trim().split(/\s+/).slice(0, 2).map(n => n[0]).join("").toUpperCase() : "+"}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-extrabold tracking-tight m-0 text-white truncate">
                    Register Administrator
                  </h3>
                  <p className="text-[11px] text-slate-300 font-medium mt-0.5 truncate">
                    Create a new administrator account with system access.
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowModal(false)}
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

                  {/* Email & Phone Grid */}
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

                  {/* Company Code & System Role */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-0.5">
                        Company Code
                      </label>
                      <div className="relative">
                        <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          name="companyCode"
                          value={formData.companyCode}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. APEX"
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

                  {/* Module Access Control */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-0.5">
                      Module Access Control
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-100/60 p-2.5 rounded-xl border border-slate-200">
                      {AVAILABLE_MODULES.map((m) => {
                        const checked = isModuleChecked(m.id, formData.allowedModules);
                        return (
                          <label 
                            key={m.id} 
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer select-none transition-all ${
                              checked 
                                ? "bg-white border-slate-800 shadow-sm" 
                                : "bg-white/40 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleModule(m.id, formData.allowedModules, (val) => setFormData({ ...formData, allowedModules: val }))}
                              className="sr-only"
                            />
                            {/* Custom Checkbox Design */}
                            <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center shrink-0 ${
                              checked 
                                ? "bg-slate-900 border-slate-900 text-white" 
                                : "border-slate-350 bg-white"
                            }`}>
                              {checked && <Check size={10} strokeWidth={3} />}
                            </div>
                            <span className={`text-xs font-bold truncate transition-all ${checked ? "text-slate-900" : "text-slate-500"}`}>
                              {m.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 mt-1.5 border-t border-slate-100 pt-3.5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
                      "Create Account"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>


      {/* Edit Modal */}
      <EditAdminModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAdmin(null);
        }}
        selectedAdmin={selectedAdmin}
        onSubmit={handleEditSubmit}
        loading={loading || companyState.loading}
        error={companyState.error || error}
        success={companyState.success || success}
      />

      {/* Module Access Modal */}
      <ModuleAccessModal
        show={showAccessModal}
        onClose={() => {
          setShowAccessModal(false);
          setSelectedAdmin(null);
        }}
        selectedAdmin={selectedAdmin}
        onSubmit={handleAccessSubmit}
        loading={loading || companyState.loading}
        error={companyState.error || error}
        success={companyState.success || success}
      />

      {/* Animations */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminManagement;

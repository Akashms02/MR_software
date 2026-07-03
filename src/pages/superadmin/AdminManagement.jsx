import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
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
} from "lucide-react";
import { updateCompanyAccess, editCompanyData } from "../../redux/actions/companyAction";
import EditAdminModal from "./EditAdminModal";
import ModuleAccessModal from "./ModuleAccessModal";
import Pagination from "../../components/common/Pagination";

const AdminManagement = () => {
  const dispatch = useDispatch();
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

  // Handle success/error clearing
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          role: "ADMIN",
          companyCode: "",
          allowedModules: "all",
        });
        setShowModal(false);
        setShowEditModal(false);
        setShowAccessModal(false);
        setSelectedAdmin(null);

        dispatch(clearSuccess());
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearErrors());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(registerAdmin(formData));
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
      try {
        const res = await dispatch(editCompanyData(selectedAdmin.id, payload));
        if (res) {
          setShowAccessModal(false);
          setSelectedAdmin(null);
          dispatch(getAdmins());
        }
      } catch (err) {
        console.error("Error updating module access:", err);
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
      try {
        const wasEnabled = selectedAdmin.enabled !== false;
        if (modalFormData.enabled !== wasEnabled) {
          await dispatch(updateCompanyAccess(selectedAdmin.id, modalFormData.enabled));
        }

        const res = await dispatch(editCompanyData(selectedAdmin.id, payload));
        if (res) {
          setShowEditModal(false);
          setSelectedAdmin(null);
          dispatch(getAdmins());
        }
      } catch (err) {
        console.error("Error updating company details:", err);
      }
    }
  };

  const handleToggleAdminStatus = async (adminId, currentStatus) => {
    setUpdatingStatusId(adminId);
    try {
      const newStatus = !currentStatus;
      await dispatch(updateCompanyAccess(adminId, newStatus));
      dispatch(getAdmins());
    } catch (err) {
      console.error("Error updating admin status:", err);
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
      {showModal && createPortal(
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-[4px] flex items-start justify-center z-[1000] p-5 overflow-y-auto">
          <div className="bg-white w-full max-w-[500px] my-auto rounded-[24px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] overflow-hidden animate-[slideUp_0.4s_ease-out_forwards]">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 m-0">
                  Register Administrator
                </h3>
                <p className="text-[13px] text-gray-500 mt-1">
                  Create a new administrator account with system access.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
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

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">
                    Company Code
                  </label>
                  <input
                    name="companyCode"
                    value={formData.companyCode}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. APEX"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500 transition-colors duration-200"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                    A unique reference code for the company (e.g. APEX).
                  </p>
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

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">
                    Module Access Control
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 bg-gray-50 p-4 rounded-xl border border-gray-150 max-h-[170px] overflow-y-auto">
                    {AVAILABLE_MODULES.map((m) => {
                      const checked = isModuleChecked(m.id, formData.allowedModules);
                      return (
                        <label key={m.id} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white cursor-pointer select-none transition-all">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleModule(m.id, formData.allowedModules, (val) => setFormData({ ...formData, allowedModules: val }))}
                            className="rounded text-indigo-650 focus:ring-indigo-500 w-4 h-4 cursor-pointer accent-indigo-600"
                          />
                          <span className="text-[12.5px] font-bold text-gray-700 ml-1.5">{m.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 mt-2.5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
                      "Create Account"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

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

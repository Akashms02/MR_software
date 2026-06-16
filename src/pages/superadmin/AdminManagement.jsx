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

const AdminManagement = () => {
  const dispatch = useDispatch();
  const { admins = [], loading, error, success } = useSelector(
    (state) => state.admin || {}
  );
  const companyState = useSelector((state) => state.company || {});
  const [showModal, setShowModal] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "ADMIN",
    companyCode: "",
  });

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "ADMIN",
    adminReferenceCode: "",
    enabled: true,
  });

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
        });
        setShowModal(false);

        setEditFormData({
          fullName: "",
          email: "",
          phone: "",
          role: "ADMIN",
          adminReferenceCode: "",
          enabled: true,
        });
        setShowEditModal(false);
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
    setEditFormData({
      fullName: admin.fullName || "",
      email: admin.email || "",
      phone: admin.phone || "",
      role: admin.role || "ADMIN",
      adminReferenceCode: admin.adminReferenceCode || "",
      enabled: admin.enabled !== false,
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (selectedAdmin) {
      const payload = {
        fullName: editFormData.fullName,
        email: editFormData.email,
        phone: editFormData.phone,
        companyCode: editFormData.adminReferenceCode,
      };
      try {
        // Check if the enabled status has changed and update it
        const wasEnabled = selectedAdmin.enabled !== false;
        if (editFormData.enabled !== wasEnabled) {
          await dispatch(updateCompanyAccess(selectedAdmin.id, editFormData.enabled));
        }

        const res = await dispatch(editCompanyData(selectedAdmin.id, payload));
        if (res) {
          setShowEditModal(false);
          setSelectedAdmin(null);
          setEditFormData({
            fullName: "",
            email: "",
            phone: "",
            role: "ADMIN",
            adminReferenceCode: "",
            enabled: true,
          });
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

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Admins", value: admins.length },
          {
            label: "Active Sessions",
            value: admins.filter(a => a.enabled !== false).length,
          },
          { label: "System Access", value: "100%" },
          { label: "Pending Invitations", value: "0" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white px-5 py-4 rounded-2xl border border-gray-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
          >
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-[0.5px]">
              {stat.label}
            </div>
            <div className="text-2xl font-extrabold text-gray-900 mt-1">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-[calc(100vh-270px)]">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4 shrink-0">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              placeholder="Search by name, email..."
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
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500">
                    No administrators found.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => {
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
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-[4px] flex items-center justify-center z-[1000] p-5">
          <div className="bg-white w-full max-w-[500px] rounded-[24px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] overflow-hidden animate-[slideUp_0.4s_ease-out_forwards]">
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
      {showEditModal && createPortal(
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-[4px] flex items-center justify-center z-[1000] p-5">
          <div className="bg-white w-full max-w-[500px] rounded-[24px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] overflow-hidden animate-[slideUp_0.4s_ease-out_forwards]">
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
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAdmin(null);
                }}
                className="bg-gray-100 border-none rounded-lg p-2 cursor-pointer hover:bg-gray-200 transition-colors duration-150"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="flex flex-col gap-5">
                {/* Status Messages */}
                {(companyState.error || error) && (
                  <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-2.5 text-rose-700 text-sm font-semibold">
                    <AlertCircle size={18} /> {companyState.error || error}
                  </div>
                )}
                {(companyState.success || success) && (
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2.5 text-emerald-700 text-sm font-semibold">
                    <CheckCircle2 size={18} /> {companyState.message || success}
                  </div>
                )}

                {/* Input Fields */}
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    value={editFormData.fullName}
                    onChange={handleEditInputChange}
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
                      value={editFormData.email}
                      onChange={handleEditInputChange}
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
                      value={editFormData.phone}
                      onChange={handleEditInputChange}
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
                      value={editFormData.adminReferenceCode}
                      onChange={handleEditInputChange}
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
                    value={editFormData.enabled ? "true" : "false"}
                    onChange={(e) => setEditFormData({ ...editFormData, enabled: e.target.value === "true" })}
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
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedAdmin(null);
                    }}
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
      )}

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

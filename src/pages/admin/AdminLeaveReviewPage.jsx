import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, Check, X, Calendar, AlertCircle, CheckCircle2, MessageSquare, Eye, Users, Plus, Edit2, Trash2 } from 'lucide-react';
import {
  fetchAdminLeaveTableAction,
  reviewLeaveAction,
  fetchLeaveTypesAction,
  createLeaveTypeAction,
  updateLeaveTypeAction,
  deleteLeaveTypeAction,
  clearLeaveErrorsAction,
  clearLeaveSuccessAction
} from '../../redux/actions/leaveActions';
import DeleteModal from '../../components/common/DeleteModal';
import Pagination from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';

const STANDARD_LEAVES = {
  'CL': "Casual Leave",
  'SL': "Sick Leave",
  'EL': "Earned Leave",
  'ML': "Maternity Leave",
  'PL': "Paternity Leave",
  'UL': "Unpaid Leave",
  'EM': "Emergency Leave",
  'CO': "Compensatory Off"
};

const AdminLeaveReviewPage = () => {
  const dispatch = useDispatch();
  const { adminLeavesTable = [], leaveTypes = [], loading, error, success } = useSelector((state) => state.leave);

  const [reviewingId, setReviewingId] = useState(null);
  const [remarksMap, setRemarksMap] = useState({});
  const { showToast } = useToast();
  const [localSuccess, _setLocalSuccess] = useState(null);
  const [localError, _setLocalError] = useState(null);
  const [modalError, _setModalError] = useState(null);

  const setLocalSuccess = (msg) => {
    _setLocalSuccess(msg);
    if (msg) showToast(msg, 'success');
  };
  const setLocalError = (msg) => {
    _setLocalError(msg);
    if (msg) showToast(msg, 'error');
  };
  const setModalError = (msg) => {
    _setModalError(msg);
    if (msg) showToast(msg, 'error');
  };

  // Inspector Modal State
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectLeave, setInspectLeave] = useState(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingType, setDeletingType] = useState(null);

  // Filter state for Team Leave Applications
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED'
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'policies'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Reset page when filter or tab changes
  useEffect(() => {
    setCurrentPage(0);
  }, [filterStatus, activeTab]);

  // Configure Leave modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingTypeObj, setEditingTypeObj] = useState(null); // stores the leave type object being edited
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    applicableGender: 'ALL',
    carryForward: false,
    maxAllowedDays: ''
  });

  // Fetch initial data (Admin fetches organization-wide leaves)
  useEffect(() => {
    dispatch(fetchAdminLeaveTableAction());
    dispatch(fetchLeaveTypesAction());
  }, [dispatch]);

  // Synchronize Redux notification states
  useEffect(() => {
    if (success) {
      setLocalSuccess(success);
      const t = setTimeout(() => {
        dispatch(clearLeaveSuccessAction());
        setLocalSuccess(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      if (addModalOpen) {
        return;
      }
      setLocalError(error);
      const t = setTimeout(() => {
        dispatch(clearLeaveErrorsAction());
        setLocalError(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [error, addModalOpen, dispatch]);

  const handleReview = async (leaveId, status) => {
    const remarks = remarksMap[leaveId] || (status === 'APPROVED' ? 'Approved. Enjoy your time off!' : 'Rejected. Due to team availability.');
    setReviewingId(leaveId);
    try {
      await dispatch(reviewLeaveAction(leaveId, status, remarks));
      // Refresh the admin leaves list
      dispatch(fetchAdminLeaveTableAction());
      setInspectModalOpen(false);
      // Clear local remarks input
      setRemarksMap(prev => {
        const copy = { ...prev };
        delete copy[leaveId];
        return copy;
      });
    } catch (err) {
      // Handled by store errors hook
    } finally {
      setReviewingId(null);
    }
  };

  const handleEditAllocation = (alloc) => {
    setEditingTypeObj(alloc);
    setModalError(null);
    setFormData({
      code: alloc.code || '',
      name: alloc.name || '',
      description: alloc.description || '',
      applicableGender: alloc.applicableGender || 'ALL',
      carryForward: alloc.carryForward || false,
      maxAllowedDays: (alloc.maxAllowedDays ?? alloc.limit ?? alloc.days ?? '').toString()
    });
    setAddModalOpen(true);
  };

  const handleDeleteAllocation = (alloc, e) => {
    e.stopPropagation();
    setDeletingType(alloc);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingType) return;
    try {
      await dispatch(deleteLeaveTypeAction(deletingType.id));
      dispatch(fetchLeaveTypesAction());
    } catch (err) {
      // Handled by Redux
    } finally {
      setDeleteModalOpen(false);
      setDeletingType(null);
    }
  };

  const handleSaveAllocation = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.maxAllowedDays || isNaN(formData.maxAllowedDays) || parseFloat(formData.maxAllowedDays) < 0) {
      setModalError('Please enter a valid number of days.');
      return;
    }

    if (!formData.code) {
      setModalError('Please specify a valid code.');
      return;
    }

    if (!formData.name) {
      setModalError('Please specify the leave type name.');
      return;
    }

    const payload = {
      code: formData.code,
      name: formData.name,
      description: formData.description,
      applicableGender: formData.applicableGender,
      carryForward: formData.carryForward,
      maxAllowedDays: parseFloat(formData.maxAllowedDays)
    };

    try {
      if (editingTypeObj) {
        await dispatch(updateLeaveTypeAction(editingTypeObj.id, payload));
      } else {
        await dispatch(createLeaveTypeAction(payload));
      }
      dispatch(fetchLeaveTypesAction());

      // Only close and clear state on success
      setAddModalOpen(false);
      setEditingTypeObj(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        applicableGender: 'ALL',
        carryForward: false,
        maxAllowedDays: ''
      });
    } catch (err) {
      setModalError(err.message || 'Failed to save leave policy.');
      dispatch(clearLeaveErrorsAction()); // Prevent page-level global error toast from showing
    }
  };

  const calculateDays = (start, end, from, to) => {
    const s = start || from;
    const e = end || to;
    if (!s || !e) return 0;
    const diffTime = Math.abs(new Date(e) - new Date(s));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const pendingLeavesList = adminLeavesTable.filter(l => l.status === 'PENDING');
  const pendingCount = pendingLeavesList.length;

  const handleInspect = (leave) => {
    setInspectLeave(leave);
    setInspectModalOpen(true);
  };

  const formatLeaveType = (type) => {
    const t = (type && typeof type === 'object')
      ? (type.name || type.code || '')
      : (type || '');
    return t
      ?.replace('_', ' ')
      ?.toLowerCase()
      ?.replace(/\b\w/g, (char) => char.toUpperCase()) || 'Leave';
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]';
      case 'REJECTED':
        return 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]';
      default: // PENDING
        return 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]';
    }
  };

  // Filtered admin leaves list
  const filteredLeaves = adminLeavesTable.filter(leave => {
    if (filterStatus === 'ALL') return true;
    return leave.status === filterStatus;
  });

  return (
    <div className="animate-[fadeIn_0.4s_ease-out] p-1 flex flex-col gap-6 h-[calc(100vh-104px)] min-h-0 overflow-hidden">
      {/* Alerts handled by global toast system */}

      {/* Tab controls */}
      <div className="flex gap-2.5 mb-4 shrink-0">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-[22px] py-2.5 rounded-xl border-none cursor-pointer text-[13.5px] font-bold transition-all duration-200 outline-none ${activeTab === 'requests'
              ? 'bg-[#C8F04A] text-[#111827] shadow-[0_4px_12px_rgba(200,240,74,0.25)] border-none'
              : 'bg-white text-[#111827] border border-gray-200 hover:bg-gray-50'
            }`}
        >
          Leave Approvals
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-[22px] py-2.5 rounded-xl border-none cursor-pointer text-[13.5px] font-bold transition-all duration-200 outline-none ${activeTab === 'policies'
              ? 'bg-[#C8F04A] text-[#111827] shadow-[0_4px_12px_rgba(200,240,74,0.25)] border-none'
              : 'bg-white text-[#111827] border border-gray-200 hover:bg-gray-50'
            }`}
        >
          Leave Policies & Types
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Section 1: Types of Leave Table */}
        {activeTab === 'policies' && (
          <div className="bg-white border-[1.5px] border-[#F3F4F6] rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex justify-between items-center mb-5 border-b border-[#F3F4F6] pb-4 shrink-0">
              <div>
                <h3 className="m-0 text-[16px] font-extrabold text-[#1F2937]">Types of Leave & Policies</h3>
                <p className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-wider mt-0.5">Configure leave classifications & limits</p>
              </div>
              <button
                onClick={() => {
                  setEditingTypeObj(null);
                  setModalError(null);
                  setFormData({
                    code: '',
                    name: '',
                    description: '',
                    applicableGender: 'ALL',
                    carryForward: false,
                    maxAllowedDays: ''
                  });
                  setAddModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-none bg-[#C8F04A] text-[#111827] font-extrabold text-[12.5px] cursor-pointer shadow-[0_4px_12px_rgba(200,240,74,0.2)] hover:opacity-90 transition-opacity duration-150 outline-none"
              >
                <Plus size={14} strokeWidth={2.5} /> Add Leave Type
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-[1.5px] border-[#F3F4F6] bg-gray-50/50 sticky top-0 z-10">
                    {['Leave Type', 'Code', 'Description', 'Gender', 'Days/Year', 'Carry Forward', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-[0.5px] bg-white">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaveTypes.map((alloc, i) => {
                    return (
                      <tr key={alloc.id || i} className="border-b border-[#FAFAFA] transition-colors duration-150 hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-[13.5px] font-bold text-[#1F2937]">
                          {alloc.name}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wide border border-gray-200">
                            {alloc.code}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12.5px] text-gray-500 font-medium">
                          {alloc.description || 'No policy description provided.'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${alloc.applicableGender === 'MALE' ? 'bg-blue-50 text-blue-600' :
                              alloc.applicableGender === 'FEMALE' ? 'bg-pink-50 text-pink-600' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                            {alloc.applicableGender || 'ALL'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-800 font-bold">
                          {alloc.maxAllowedDays ?? alloc.limit ?? alloc.days ?? 0} Days
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${alloc.carryForward ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                            {alloc.carryForward ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-1.5 justify-start">
                            <button
                              type="button"
                              title="Edit Policy"
                              className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-150 text-[#4B5563] cursor-pointer transition-colors"
                              onClick={() => handleEditAllocation(alloc)}
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              type="button"
                              title="Delete Policy"
                              className="p-1.5 rounded-lg bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-500 cursor-pointer transition-colors"
                              onClick={(e) => handleDeleteAllocation(alloc, e)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!loading && leaveTypes.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-400 font-semibold text-xs uppercase tracking-wider">
                        No Leave categories defined. Use "Add Leave Type" to create.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 2: Requested Leaves Table */}
        {activeTab === 'requests' && (
          <div className="bg-white border-[1.5px] border-[#F3F4F6] rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Card Header with Filters on the Right */}
            <div className="flex justify-between items-center mb-5 border-b border-[#F3F4F6] pb-4 shrink-0">
              <div>
                <h3 className="m-0 text-[16px] font-extrabold text-[#1F2937]">Requested Leaves & Approvals</h3>
                <p className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-wider mt-0.5">Review and take action on employee requests</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-bold mr-1">Filter:</span>
                <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200/50">
                  {[
                    { value: 'ALL', label: 'All' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'APPROVED', label: 'Approved' },
                    { value: 'REJECTED', label: 'Rejected' }
                  ].map((tab) => {
                    const isActive = filterStatus === tab.value;
                    return (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setFilterStatus(tab.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border-none ${isActive
                            ? 'bg-[#111827] text-white shadow-sm'
                            : 'text-gray-500 hover:text-[#111827] bg-transparent'
                          }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
                <span className="text-[12.5px] font-bold text-[#D97706] bg-[#FFFBEB] px-3 py-1.5 rounded-xl ml-2 shrink-0">
                  Pending: {pendingCount}
                </span>
              </div>
            </div>

            {loading && adminLeavesTable.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-2.5">
                <Loader2 size={24} className="animate-spin text-[#111827]" style={{ animationDuration: '0.8s' }} />
                <span className="text-[13px] text-[#9CA3AF]">Loading requested leaves...</span>
              </div>
            ) : filteredLeaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center text-[#9CA3AF]">
                <CheckCircle2 size={36} className="mx-auto mb-2.5 text-[#10B981]" />
                <p className="m-0 text-[13.5px] font-semibold text-[#4B5563]">No leave requests found matching the filter.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b-[1.5px] border-[#F3F4F6] sticky top-0 bg-white z-[10]">
                        {['Staff Member', 'Leave Category', 'Duration', 'Dates', 'Status', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-[0.5px] bg-white sticky top-0">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeaves.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((leave) => {
                        const reporterInitial = leave.employeeName ? leave.employeeName.charAt(0).toUpperCase() : 'E';
                        const daysCount = calculateDays(leave.startDate, leave.endDate, leave.fromDate, leave.toDate);
                        return (
                          <tr key={leave.leaveId || leave.id} className="border-b border-[#FAFAFA] transition-colors duration-150 hover:bg-slate-50/50">
                            {/* Staff member name */}
                            <td className="p-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white text-[12.5px] font-bold flex items-center justify-center">
                                  {reporterInitial}
                                </div>
                                <div>
                                  <div className="text-[13.5px] font-extrabold text-[#1F2937]">{leave.employeeName || 'Field staff'}</div>
                                  <div className="text-[11px] text-[#9CA3AF]">{leave.employeeRole || 'Medical Representative'}</div>
                                </div>
                              </div>
                            </td>

                            {/* Leave Type */}
                            <td className="p-4 text-[13.5px] font-bold text-[#1F2937]">
                              {formatLeaveType(leave.leaveName || leave.leaveCode || leave.leaveTypeName || leave.leaveTypeCode || leave.leaveType)}
                            </td>

                            {/* Duration */}
                            <td className="p-4 text-[13px] text-[#1F2937] font-bold">
                              {daysCount} Day{daysCount !== 1 ? 's' : ''}
                            </td>

                            {/* Dates */}
                            <td className="p-4 text-[13.5px] text-[#4B5563] font-semibold">
                              {leave.startDate || leave.fromDate} to {leave.endDate || leave.toDate}
                            </td>

                            {/* Status */}
                            <td className="p-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-[20px] text-[11px] font-extrabold ${getStatusBadgeClass(leave.status)}`}>
                                {leave.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="p-4">
                              <button
                                onClick={() => handleInspect(leave)}
                                className="flex items-center gap-1 bg-[#111827] text-white border-0 px-3.5 py-2 rounded-lg cursor-pointer font-bold text-xs transition-colors duration-150 hover:bg-[#374151]"
                              >
                                <Eye size={12} /> Inspect Request
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredLeaves.length / pageSize)}
                  totalElements={filteredLeaves.length}
                  pageSize={pageSize}
                  onPageChange={(page) => setCurrentPage(page)}
                  isLoading={loading}
                  activeBtnClass="bg-[#111827] text-white"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configure Leave Type Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[6px] flex items-center justify-center z-[1100] p-5 animate-[fadeIn_0.2s]">
          <div className="bg-white rounded-[20px] w-full max-w-[420px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-[scaleIn_0.2s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden">
            <div className="px-6 py-5 border-b-[1.5px] border-[#F3F4F6] flex justify-between items-center">
              <h3 className="text-[17px] font-extrabold text-[#111827] m-0">
                {editingTypeObj ? 'Update Leave Policy' : 'Configure Leave Policy'}
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="bg-transparent border-none text-[#9CA3AF] cursor-pointer hover:text-[#111827] font-extrabold text-sm outline-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAllocation}>
              <div className="p-6 flex flex-col gap-4">
                {modalError && (
                  <div className="bg-[#FEF2F2] border border-[#FECACA] px-4 py-2.5 rounded-xl flex items-center gap-2 text-[#B91C1C] text-[12.5px] font-semibold mb-1">
                    <AlertCircle size={14} />
                    {modalError}
                  </div>
                )}
                <div className="grid grid-cols-[1fr_2fr] gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Code
                    </label>
                    <select
                      required
                      value={formData.code}
                      onChange={(e) => {
                        const val = e.target.value;
                        const autoName = STANDARD_LEAVES[val] || '';
                        setFormData({ ...formData, code: val, name: autoName });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] bg-white outline-none font-sans"
                    >
                      <option value="">Code</option>
                      {Object.keys(STANDARD_LEAVES).map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Leave Type Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Paid Leave"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] outline-none font-sans box-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Gender Eligibility
                    </label>
                    <select
                      value={formData.applicableGender}
                      onChange={(e) => setFormData({ ...formData, applicableGender: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] bg-white outline-none font-sans"
                    >
                      <option value="ALL">ALL</option>
                      <option value="MALE">MALE ONLY</option>
                      <option value="FEMALE">FEMALE ONLY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Number of Days
                    </label>
                    <input
                      required
                      type="number"
                      placeholder="e.g. 15"
                      value={formData.maxAllowedDays}
                      onChange={(e) => setFormData({ ...formData, maxAllowedDays: e.target.value })}
                      min="0"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] outline-none font-sans box-border"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the leave policy..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] resize-none outline-none font-sans box-border"
                  />
                </div>

                <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:border-gray-200 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.carryForward}
                    onChange={(e) => setFormData({ ...formData, carryForward: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-700">Carry Forward (Balance rolls over)</span>
                </label>
              </div>

              <div className="px-6 py-5 border-t-[1.5px] border-[#F3F4F6] flex justify-end gap-2.5 bg-[#FAFAFA]">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-[#374151] font-bold text-[13px] cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl border-none bg-[#111827] text-white font-extrabold text-[13px] cursor-pointer shadow-[0_4px_12px_rgba(17,24,39,0.15)] hover:bg-gray-800 transition-colors"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect & Review Modal */}
      {inspectModalOpen && inspectLeave && (() => {
        const targetLeaveId = inspectLeave.leaveId || inspectLeave.id;
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-[6px] flex items-center justify-center z-[1100] p-5 animate-[fadeIn_0.2s]">
            <div className="bg-white rounded-[20px] w-full max-w-[580px] max-h-[85vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-[scaleIn_0.2s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b-[1.5px] border-[#F3F4F6] flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-[17px] font-extrabold text-[#111827] m-0">
                    Review Leave Request
                  </h3>
                  <span className="text-xs text-[#9CA3AF]">
                    Requested by: {inspectLeave.employeeName} ({inspectLeave.employeeRole})
                  </span>
                </div>
                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-[20px] ${getStatusBadgeClass(inspectLeave.status)}`}>
                  {inspectLeave.status}
                </span>
              </div>

              {/* Modal Scroll Content */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                {/* Leave Info Card */}
                <div className="border-[1.5px] border-[#F3F4F6] p-5 rounded-xl bg-[#FAFAFA]">
                  <div className="flex justify-between items-center mb-3.5">
                    <span className="text-sm font-bold text-[#1F2937] flex items-center gap-1.5">
                      📅 {inspectLeave.startDate || inspectLeave.fromDate} to {inspectLeave.endDate || inspectLeave.toDate}
                    </span>
                    <span className="text-[10.5px] font-extrabold px-2 py-[3px] rounded-md bg-[#1E293B] text-[#C8F04A]">
                      {formatLeaveType(inspectLeave.leaveName || inspectLeave.leaveCode || inspectLeave.leaveTypeName || inspectLeave.leaveTypeCode || inspectLeave.leaveType).toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-[1fr_2fr] gap-4 border-t border-[#F3F4F6] pt-3 mt-1.5">
                    <div>
                      <div className="text-[10px] font-bold text-[#9CA3AF] uppercase">Duration</div>
                      <div className="text-[13px] text-[#1F2937] font-bold mt-0.5">
                        {calculateDays(inspectLeave.startDate, inspectLeave.endDate, inspectLeave.fromDate, inspectLeave.toDate)} Day{calculateDays(inspectLeave.startDate, inspectLeave.endDate, inspectLeave.fromDate, inspectLeave.toDate) !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#9CA3AF] uppercase">Application Reason</div>
                      <div className="text-[12.5px] text-[#4B5563] mt-0.5 leading-normal">
                        {inspectLeave.reason}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Already reviewed message */}
                {inspectLeave.status !== 'PENDING' && (
                  <div className="bg-[#FFFBEB] border border-[#FDE68A] p-3.5 rounded-xl">
                    <div className="text-[11px] font-extrabold text-[#B45309] uppercase tracking-[0.5px]">Manager Feedback Remarks</div>
                    <div className="text-[13px] text-[#78350F] mt-1 italic">"{inspectLeave.managerRemarks || inspectLeave.remarks || 'No feedback left.'}"</div>
                  </div>
                )}
              </div>

              {/* Modal Review input + Footer */}
              <div className="px-6 py-5 border-t-[1.5px] border-[#F3F4F6] flex flex-col gap-4 shrink-0 bg-[#FAFAFA]">
                {/* Remarks input */}
                {inspectLeave.status === 'PENDING' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#374151]">Approval/Rejection Comments</label>
                    <input
                      type="text"
                      placeholder="Enter review remarks here..."
                      value={remarksMap[targetLeaveId] || ''}
                      onChange={(e) => setRemarksMap(prev => ({ ...prev, [targetLeaveId]: e.target.value }))}
                      className="px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] text-[13px] outline-none bg-white w-full box-border focus:border-[#C8F04A]"
                    />
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex justify-end gap-2.5 w-full">
                  <button
                    onClick={() => setInspectModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#374151] font-bold text-[13px] cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  {inspectLeave.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleReview(targetLeaveId, 'REJECTED')}
                        disabled={reviewingId !== null}
                        className="flex items-center gap-1 bg-[#EF4444] text-white border-0 px-5 py-2.5 rounded-xl cursor-pointer font-bold text-[13px] hover:bg-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <X size={14} /> Reject Request
                      </button>
                      <button
                        onClick={() => handleReview(targetLeaveId, 'APPROVED')}
                        disabled={reviewingId !== null}
                        className="flex items-center gap-1 bg-[#10B981] text-white border-0 px-5 py-2.5 rounded-xl cursor-pointer font-extrabold text-[13px] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Check size={14} /> Approve Request
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingType(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Leave Policy"
        itemName={deletingType?.name}
        loading={loading}
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default AdminLeaveReviewPage;

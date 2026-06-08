import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, Check, X, Calendar, AlertCircle, CheckCircle2, MessageSquare, Eye, Users, Plus, Edit2, Trash2 } from 'lucide-react';
import {
  fetchTeamLeavesAction,
  reviewLeaveAction,
  clearLeaveErrorsAction,
  clearLeaveSuccessAction
} from '../../redux/actions/leaveActions';

const AdminLeaveReviewPage = () => {
  const dispatch = useDispatch();
  const { teamLeaves, loading, error, success } = useSelector((state) => state.leave);

  const [reviewingId, setReviewingId] = useState(null);
  const [remarksMap, setRemarksMap] = useState({});
  const [localSuccess, setLocalSuccess] = useState(null);
  const [localError, setLocalError] = useState(null);

  // Inspector Modal State
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectLeave, setInspectLeave] = useState(null);

  // Filter state for Team Leave Applications
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED'

  // Configure Leave modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('CASUAL');
  const [customTypeName, setCustomTypeName] = useState('');
  const [allocatedDays, setAllocatedDays] = useState('');

  // Default leave type allocations
  const defaultAllocations = [
    { type: 'Casual Leave', days: 12, code: 'CL', color: '#D97706', bg: '#FFFBEB', icon: '🏖️' },
    { type: 'Sick Leave', days: 10, code: 'SL', color: '#EF4444', bg: '#FEF2F2', icon: '🤒' },
    { type: 'Privilege Leave', days: 18, code: 'PL', color: '#10B981', bg: '#ECFDF5', icon: '🌟' },
    { type: 'Maternity Leave', days: 90, code: 'ML', color: '#6366F1', bg: '#EEF2FF', icon: '👶' },
  ];

  // Load leave allocations from localStorage or use defaults
  const [allocations, setAllocations] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_leave_allocations');
      return stored ? JSON.parse(stored) : defaultAllocations;
    } catch (e) {
      return defaultAllocations;
    }
  });

  useEffect(() => {
    dispatch(fetchTeamLeavesAction());
  }, [dispatch]);

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
      setLocalError(error);
      const t = setTimeout(() => {
        dispatch(clearLeaveErrorsAction());
        setLocalError(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  const handleReview = async (leaveId, status) => {
    const remarks = remarksMap[leaveId] || (status === 'APPROVED' ? 'Approved. Enjoy your time off!' : 'Rejected. Due to team availability.');
    setReviewingId(leaveId);
    try {
      await dispatch(reviewLeaveAction(leaveId, status, remarks));
      // Refresh the team leaves list
      dispatch(fetchTeamLeavesAction());
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
    const typeUpper = alloc.type.toUpperCase();
    if (typeUpper.includes('CASUAL')) {
      setSelectedType('CASUAL');
      setCustomTypeName('');
    } else if (typeUpper.includes('SICK')) {
      setSelectedType('SICK');
      setCustomTypeName('');
    } else if (typeUpper.includes('PRIVILEGE')) {
      setSelectedType('PRIVILEGE');
      setCustomTypeName('');
    } else if (typeUpper.includes('MATERNITY')) {
      setSelectedType('MATERNITY');
      setCustomTypeName('');
    } else {
      setSelectedType('OTHER');
      setCustomTypeName(alloc.type);
    }
    setAllocatedDays(alloc.days.toString());
    setAddModalOpen(true);
  };

  const handleDeleteAllocation = (typeToDelete, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the leave type "${typeToDelete}"?`)) {
      setAllocations(prev => {
        const updated = prev.filter(a => a.type.toLowerCase() !== typeToDelete.toLowerCase());
        localStorage.setItem('admin_leave_allocations', JSON.stringify(updated));
        return updated;
      });
      setLocalSuccess(`Successfully deleted leave type "${typeToDelete}".`);
      setTimeout(() => setLocalSuccess(null), 4000);
    }
  };

  const getLeaveTypeName = (type, customName) => {
    switch (type) {
      case 'CASUAL': return 'Casual Leave';
      case 'SICK': return 'Sick Leave';
      case 'PRIVILEGE': return 'Privilege Leave';
      case 'MATERNITY': return 'Maternity Leave';
      case 'OTHER': return customName.trim();
      default: return formatLeaveType(type);
    }
  };

  const handleSaveAllocation = (e) => {
    e.preventDefault();
    if (!allocatedDays || isNaN(allocatedDays) || parseInt(allocatedDays) < 0) {
      setLocalError('Please enter a valid number of days.');
      setTimeout(() => setLocalError(null), 4000);
      return;
    }

    const typeName = getLeaveTypeName(selectedType, customTypeName);
    if (!typeName) {
      setLocalError('Please specify the leave type name.');
      setTimeout(() => setLocalError(null), 4000);
      return;
    }

    setAllocations(prev => {
      const existsIndex = prev.findIndex(a => a.type.toLowerCase() === typeName.toLowerCase());
      let updated;
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = { ...updated[existsIndex], days: parseInt(allocatedDays) };
      } else {
        const colors = [
          { color: '#D97706', bg: '#FFFBEB', icon: '🏖️' },
          { color: '#EF4444', bg: '#FEF2F2', icon: '🤒' },
          { color: '#10B981', bg: '#ECFDF5', icon: '🌟' },
          { color: '#6366F1', bg: '#EEF2FF', icon: '👶' },
          { color: '#06B6D4', bg: '#ECFEFF', icon: '📅' }
        ];
        const randomStyle = colors[prev.length % colors.length];
        updated = [...prev, {
          type: typeName,
          days: parseInt(allocatedDays),
          code: typeName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
          ...randomStyle
        }];
      }
      localStorage.setItem('admin_leave_allocations', JSON.stringify(updated));
      return updated;
    });

    setLocalSuccess(`Successfully allocated ${allocatedDays} days to ${typeName}.`);
    setTimeout(() => setLocalSuccess(null), 4000);
    setAddModalOpen(false);
    setSelectedType('CASUAL');
    setCustomTypeName('');
    setAllocatedDays('');
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const pendingLeavesList = teamLeaves.filter(l => l.status === 'PENDING');
  const pendingCount = pendingLeavesList.length;

  const handleInspect = (leave) => {
    setInspectLeave(leave);
    setInspectModalOpen(true);
  };

  const formatLeaveType = (type) => {
    return type
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

  // Filtered team leaves list
  const filteredLeaves = teamLeaves.filter(leave => {
    if (filterStatus === 'ALL') return true;
    return leave.status === filterStatus;
  });

  return (
    <div className="animate-[fadeIn_0.4s_ease-out] p-1">
      {/* Page Header actions (portal label and duplicate headings removed) */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            setSelectedType('CASUAL');
            setCustomTypeName('');
            setAllocatedDays('');
            setAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border-none bg-[#111827] text-white font-extrabold text-[13px] cursor-pointer shadow-[0_4px_12px_rgba(17,24,39,0.2)] hover:bg-gray-800 transition-colors duration-150 outline-none"
        >
          <Plus size={14} strokeWidth={2.5} /> Add/Edit Leave Type
        </button>
      </div>

      {/* Notifications */}
      {localSuccess && (
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] px-[18px] py-3 rounded-xl flex items-center gap-2 text-[#047857] text-[13px] font-semibold mb-5">
          <CheckCircle2 size={16} />
          {localSuccess}
        </div>
      )}
      {localError && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] px-[18px] py-3 rounded-xl flex items-center gap-2 text-[#B91C1C] text-[13px] font-semibold mb-5">
          <AlertCircle size={16} />
          {localError}
        </div>
      )}

      {/* Leave Type Cards (renders all allocations dynamically, interactive edit/delete) */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 mb-[28px]">
        {allocations.map((alloc, i) => {
          const defaultTypes = ['casual leave', 'sick leave', 'privilege leave', 'maternity leave'];
          const isDefault = defaultTypes.includes(alloc.type.toLowerCase());
          return (
            <div
              key={i}
              onClick={() => handleEditAllocation(alloc)}
              className="bg-white border-[1.5px] border-[#F3F4F6] rounded-2xl p-5 flex items-center gap-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] cursor-pointer group relative"
            >
              {/* Quick Actions (Edit/Delete) */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                  type="button"
                  title="Edit Policy"
                  className="p-1 rounded-md bg-gray-50 border border-gray-100 hover:bg-gray-100 text-[#4B5563] cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditAllocation(alloc);
                  }}
                >
                  <Edit2 size={11} />
                </button>
                {!isDefault && (
                  <button
                    type="button"
                    title="Delete Policy"
                    className="p-1 rounded-md bg-red-50 border border-red-100 hover:bg-red-100 text-red-500 cursor-pointer"
                    onClick={(e) => handleDeleteAllocation(alloc.type, e)}
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>

              <div
                className="w-12 h-12 rounded-xl text-2xl flex items-center justify-center shrink-0"
                style={{ background: alloc.bg }}
              >
                {alloc.icon || '📋'}
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.5px]">
                  {alloc.type}
                </div>
                <div className="text-[20px] font-extrabold text-[#1F2937] my-0.5">
                  {alloc.days} Days
                </div>
                <div
                  className="text-[11px] font-semibold"
                  style={{ color: alloc.color }}
                >
                  Allocated balance
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border-[1.5px] border-[#F3F4F6] rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col h-[calc(100vh-290px)] min-h-[350px]">
          {/* Card Header with Filters on the Right */}
          <div className="flex justify-between items-center mb-5 border-b border-[#F3F4F6] pb-4">
            <h3 className="m-0 text-[16px] font-extrabold text-[#1F2937]">Team Leave Applications</h3>
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border-none ${
                        isActive
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

          {loading && teamLeaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2.5">
              <Loader2 size={24} className="animate-spin text-[#111827]" style={{ animationDuration: '0.8s' }} />
              <span className="text-[13px] text-[#9CA3AF]">Loading team leaves...</span>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center text-[#9CA3AF]">
              <CheckCircle2 size={36} className="mx-auto mb-2.5 text-[#10B981]" />
              <p className="m-0 text-[13.5px] font-semibold text-[#4B5563]">No leave requests found matching the filter.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-[1.5px] border-[#F3F4F6] sticky top-0 bg-white z-[10]">
                    {['Staff Member', 'Leave Category', 'Duration', 'Dates', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-[0.5px] bg-white">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => {
                    const reporterInitial = leave.employeeName ? leave.employeeName.charAt(0).toUpperCase() : 'E';
                    const daysCount = calculateDays(leave.startDate, leave.endDate);
                    return (
                      <tr key={leave.id} className="border-b border-[#FAFAFA] transition-colors duration-150 hover:bg-slate-50/50">
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
                          {formatLeaveType(leave.leaveType)}
                        </td>

                        {/* Duration */}
                        <td className="p-4 text-[13px] text-[#1F2937] font-bold">
                          {daysCount} Day{daysCount !== 1 ? 's' : ''}
                        </td>

                        {/* Dates */}
                        <td className="p-4 text-[13.5px] text-[#4B5563] font-semibold">
                          {leave.startDate} to {leave.endDate}
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
          )}
        </div>
      </div>

      {/* Configure Leave Type Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[6px] flex items-center justify-center z-[1100] p-5 animate-[fadeIn_0.2s]">
          <div className="bg-white rounded-[20px] w-full max-w-[420px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-[scaleIn_0.2s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden">
            <div className="px-6 py-5 border-b-[1.5px] border-[#F3F4F6] flex justify-between items-center">
              <h3 className="text-[17px] font-extrabold text-[#111827] m-0">
                Configure Leave Policy
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
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Leave Category
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] bg-white outline-none font-sans"
                  >
                    <option value="CASUAL">Casual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="PRIVILEGE">Privilege Leave</option>
                    <option value="MATERNITY">Maternity Leave</option>
                    <option value="OTHER">Other (Custom Type)</option>
                  </select>
                </div>

                {selectedType === 'OTHER' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Custom Leave Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Paternity Leave"
                      value={customTypeName}
                      onChange={(e) => setCustomTypeName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] outline-none font-sans box-border"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Number of Days
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 15"
                    value={allocatedDays}
                    onChange={(e) => setAllocatedDays(e.target.value)}
                    required
                    min="0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] outline-none font-sans box-border"
                  />
                </div>
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
      {inspectModalOpen && inspectLeave && (
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
                    📅 {inspectLeave.startDate} to {inspectLeave.endDate}
                  </span>
                  <span className="text-[10.5px] font-extrabold px-2 py-[3px] rounded-md bg-[#1E293B] text-[#C8F04A]">
                    {formatLeaveType(inspectLeave.leaveType).toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_2fr] gap-4 border-t border-[#F3F4F6] pt-3 mt-1.5">
                  <div>
                    <div className="text-[10px] font-bold text-[#9CA3AF] uppercase">Duration</div>
                    <div className="text-[13px] text-[#1F2937] font-bold mt-0.5">
                      {calculateDays(inspectLeave.startDate, inspectLeave.endDate)} Day{calculateDays(inspectLeave.startDate, inspectLeave.endDate) !== 1 ? 's' : ''}
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
                    value={remarksMap[inspectLeave.id] || ''}
                    onChange={(e) => setRemarksMap(prev => ({ ...prev, [inspectLeave.id]: e.target.value }))}
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
                      onClick={() => handleReview(inspectLeave.id, 'REJECTED')}
                      disabled={reviewingId !== null}
                      className="flex items-center gap-1 bg-[#EF4444] text-white border-0 px-5 py-2.5 rounded-xl cursor-pointer font-bold text-[13px] hover:bg-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <X size={14} /> Reject Request
                    </button>
                    <button
                      onClick={() => handleReview(inspectLeave.id, 'APPROVED')}
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
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default AdminLeaveReviewPage;

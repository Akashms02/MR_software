import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, Check, X, Calendar, AlertCircle, CheckCircle2, MessageSquare, Eye, Users, Plus, Send } from 'lucide-react';
import {
  fetchTeamLeavesAction,
  reviewLeaveAction,
  fetchMyLeavesAction,
  applyLeaveAction,
  clearLeaveErrorsAction,
  clearLeaveSuccessAction
} from '../../redux/actions/leaveActions';

const MSELeaveReviewPage = () => {
  const dispatch = useDispatch();
  const { teamLeaves, leaves, loading, error, success } = useSelector((state) => state.leave);

  const [activeTab, setActiveTab] = useState('team'); // 'team', 'history', or 'apply'
  const [reviewingId, setReviewingId] = useState(null);
  const [remarksMap, setRemarksMap] = useState({});
  const [localSuccess, setLocalSuccess] = useState(null);
  const [localError, setLocalError] = useState(null);

  // Inspector Modal State for Team Leaves
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectLeave, setInspectLeave] = useState(null);

  // Form State for Apply Leave
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [reason, setReason] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchTeamLeavesAction());
    dispatch(fetchMyLeavesAction());
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

  const triggerLocalNotification = (type, msg) => {
    if (type === 'success') {
      setLocalSuccess(msg);
      setTimeout(() => setLocalSuccess(null), 4000);
    } else {
      setLocalError(msg);
      setTimeout(() => setLocalError(null), 4000);
    }
  };

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

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);

    // Form validations
    if (!startDate || !endDate || !leaveType || !reason.trim()) {
      triggerLocalNotification('error', 'All fields are required.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      triggerLocalNotification('error', 'End Date cannot be before Start Date.');
      return;
    }

    setFormLoading(true);
    try {
      await dispatch(applyLeaveAction({
        startDate,
        endDate,
        leaveType,
        reason: reason.trim()
      }));
      
      // Reset form on success
      setStartDate('');
      setEndDate('');
      setLeaveType('CASUAL');
      setReason('');
      setActiveTab('history'); // Switch to history tab on success
    } catch (err) {
      // Errors handled by redux error binding
    } finally {
      setFormLoading(false);
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const pendingLeavesList = teamLeaves.filter(l => l.status === 'PENDING');
  const pendingCount = pendingLeavesList.length;
  const approvedCount = teamLeaves.filter(l => l.status === 'APPROVED').length;
  const totalCount = teamLeaves.length;

  const stats = [
    { label: 'Pending Approvals', value: `${pendingCount}`, sub: pendingCount > 0 ? 'Review required' : 'All caught up!', color: '#0D9488', bg: '#E6FFFA', icon: '📋' },
    { label: 'Approved Leaves', value: `${approvedCount}`, sub: 'This month', color: '#10B981', bg: '#ECFDF5', icon: '✅' },
    { label: 'Active Team Size', value: '4 Field Staff', sub: 'Under management', color: '#6366F1', bg: '#EEF2FF', icon: '👥' },
    { label: 'Total Leaves Managed', value: `${totalCount}`, sub: 'All-time history', color: '#06B6D4', bg: '#ECFEFF', icon: '📅' },
  ];

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

  return (
    <div className="animate-[fadeIn_0.4s_ease-out] p-[10px]">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#115E59] to-[#0D9488] rounded-[20px] p-[30px] text-white mb-[28px] shadow-[0_10px_25px_rgba(13,148,136,0.15)] relative overflow-hidden">
        <div className="relative z-[2]">
          <span className="bg-white/15 text-[#C8F04A] px-3 py-1.5 rounded-[20px] text-[11px] font-extrabold tracking-[1px]">
            PORTAL: MEDICAL SALES EXECUTIVE
          </span>
          <h2 className="text-[28px] font-extrabold mt-3.5 mb-1.5 tracking-[-0.5px]">
            Leave Management & Approvals
          </h2>
          <p className="m-0 text-sm text-white/80 max-w-[500px]">
            Apply for personal time off, view your leave request history, and review leave applications requested by medical representatives.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 text-[180px] opacity-[0.08] select-none pointer-events-none">
          📅
        </div>
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

      {/* Tab controls */}
      <div className="flex gap-2.5 mb-6">
        <button
          onClick={() => setActiveTab('team')}
          className={`px-[22px] py-2.5 rounded-xl border-none cursor-pointer text-[13.5px] font-bold transition-all duration-200 outline-none ${
            activeTab === 'team' 
              ? 'bg-[#C8F04A] text-[#111827] shadow-[0_4px_12px_rgba(200,240,74,0.25)] border-none' 
              : 'bg-white text-[#111827] border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Team Leave Requests
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-[22px] py-2.5 rounded-xl border-none cursor-pointer text-[13.5px] font-bold transition-all duration-200 outline-none ${
            activeTab === 'history' 
              ? 'bg-[#C8F04A] text-[#111827] shadow-[0_4px_12px_rgba(200,240,74,0.25)] border-none' 
              : 'bg-white text-[#111827] border border-gray-200 hover:bg-gray-50'
          }`}
        >
          My Leave History
        </button>
        <button
          onClick={() => setActiveTab('apply')}
          className={`flex items-center gap-1.5 px-[22px] py-2.5 rounded-xl border-none cursor-pointer text-[13.5px] font-bold transition-all duration-200 outline-none ${
            activeTab === 'apply' 
              ? 'bg-[#C8F04A] text-[#111827] shadow-[0_4px_12px_rgba(200,240,74,0.25)] border-none' 
              : 'bg-white text-[#111827] border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Plus size={15} strokeWidth={2.5} /> Apply for Leave
        </button>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Tab 1: Team Approvals */}
        {activeTab === 'team' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 mb-[4px]">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="bg-white border-[1.5px] border-[#F3F4F6] rounded-2xl p-5 flex items-center gap-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] cursor-pointer"
                >
                  <div
                    className="w-12 h-12 rounded-xl text-2xl flex items-center justify-center shrink-0"
                    style={{ background: s.bg }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.5px]">
                      {s.label}
                    </div>
                    <div className="text-[20px] font-extrabold text-[#1F2937] my-0.5">
                      {s.value}
                    </div>
                    <div
                      className="text-[11px] font-semibold"
                      style={{ color: s.color }}
                    >
                      {s.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border-[1.5px] border-[#F3F4F6] rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-5 border-b border-[#F3F4F6] pb-4">
                <h3 className="m-0 text-[16px] font-extrabold text-[#1F2937]">Team Leave Applications</h3>
                <span className="text-[12.5px] font-bold text-[#D97706] bg-[#FFFBEB] px-3 py-1 rounded-[20px]">
                  Pending: {pendingCount} requests
                </span>
              </div>

              {loading && teamLeaves.length === 0 ? (
                <div className="flex flex-col items-center py-[60px] gap-2.5">
                  <Loader2 size={24} className="animate-spin text-[#111827]" style={{ animationDuration: '0.8s' }} />
                  <span className="text-[13px] text-[#9CA3AF]">Loading team leaves...</span>
                </div>
              ) : teamLeaves.length === 0 ? (
                <div className="py-[60px] text-center text-[#9CA3AF] bg-[#FAFAFA] rounded-xl border border-dashed border-[#E5E7EB]">
                  <CheckCircle2 size={36} className="mx-auto mb-2.5 text-[#10B981]" />
                  <p className="m-0 text-[13.5px] font-semibold text-[#4B5563]">All caught up! No leave requests pending approval.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b-[1.5px] border-[#F3F4F6]">
                        {['Staff Member', 'Leave Category', 'Duration', 'Dates', 'Status', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-[0.5px]">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {teamLeaves.map((leave) => {
                        const reporterInitial = leave.employeeName ? leave.employeeName.charAt(0).toUpperCase() : 'E';
                        const daysCount = calculateDays(leave.startDate, leave.endDate);
                        return (
                          <tr key={leave.id} className="border-b border-[#FAFAFA] transition-colors duration-150 hover:bg-slate-50/50">
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
                            <td className="p-4 text-[13.5px] font-bold text-[#1F2937]">
                              {formatLeaveType(leave.leaveType)}
                            </td>
                            <td className="p-4 text-[13px] text-[#1F2937] font-bold">
                              {daysCount} Day{daysCount !== 1 ? 's' : ''}
                            </td>
                            <td className="p-4 text-[13.5px] text-[#4B5563] font-semibold">
                              {leave.startDate} to {leave.endDate}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-[20px] text-[11px] font-extrabold ${getStatusBadgeClass(leave.status)}`}>
                                {leave.status}
                              </span>
                            </td>
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
          </>
        )}

        {/* Tab 2: My Leave History */}
        {activeTab === 'history' && (
          <div className="bg-white border-[1.5px] border-[#F3F4F6] rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-5 border-b border-[#F3F4F6] pb-4">
              <h3 className="m-0 text-[16px] font-extrabold text-[#1F2937]">My Leave History</h3>
            </div>

            {loading && leaves.length === 0 ? (
              <div className="flex flex-col items-center py-[60px] gap-2.5">
                <Loader2 size={24} className="animate-spin text-[#111827]" style={{ animationDuration: '0.8s' }} />
                <span className="text-[13px] text-[#9CA3AF]">Loading my leaves...</span>
              </div>
            ) : leaves.length === 0 ? (
              <div className="py-[60px] text-center text-[#9CA3AF]">
                <Calendar size={40} className="mx-auto mb-3 stroke-[1.5]" />
                <p className="m-0 text-[14px] font-medium">No leave applications logged yet.</p>
                <button
                  onClick={() => setActiveTab('apply')}
                  className="mt-3.5 bg-[#111827] text-white border-none px-4 py-2 rounded-lg font-bold text-[12.5px] cursor-pointer hover:bg-gray-800 transition-colors duration-150"
                >
                  Apply for Leave
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b-[1.5px] border-[#F3F4F6]">
                      {['Leave Type', 'Start Date', 'End Date', 'Duration', 'Reason', 'Status', 'Manager Feedback'].map((h) => (
                        <th key={h} className="px-4 py-3 text-[11.5px] font-extrabold text-[#9CA3AF] uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => {
                      const days = calculateDays(leave.startDate, leave.endDate);
                      return (
                        <tr key={leave.id} className="border-b border-[#FAFAFA] hover:bg-gray-50/50 transition-colors duration-150">
                          <td className="px-4 py-4 text-[13.5px] font-bold text-[#1F2937]">
                            {formatLeaveType(leave.leaveType)}
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563] font-semibold">
                            {leave.startDate}
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563] font-semibold">
                            {leave.endDate}
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#1F2937] font-bold">
                            {days} Day{days !== 1 ? 's' : ''}
                          </td>
                          <td className="px-4 py-4 text-[13px] text-[#4B5563] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={leave.reason}>
                            {leave.reason}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${getStatusBadgeClass(leave.status)}`}>
                              {leave.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[12.5px] text-[#6B7280] italic max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={leave.managerRemarks || leave.remarks || ''}>
                            {leave.managerRemarks || leave.remarks || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Apply Leave Form */}
        {activeTab === 'apply' && (
          <div className="bg-white border-[1.5px] border-[#F3F4F6] rounded-[18px] p-7 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <form onSubmit={handleApplyLeave} className="flex flex-col gap-6">
              <div className="border-b border-[#F3F4F6] pb-5">
                <h4 className="text-[16px] font-extrabold text-[#111827] m-0">Request Time Off</h4>
                <p className="text-[12px] text-[#6B7280] mt-[2px] mb-0">Submit a leave request for processing. Once sent, your manager will be notified.</p>
              </div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
                {/* Start Date */}
                <div>
                  <label className="block text-[12px] font-bold text-[#374151] mb-1.5">
                    Start Date <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] outline-none box-border font-sans"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-[12px] font-bold text-[#374151] mb-1.5">
                    End Date <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] outline-none box-border font-sans"
                  />
                </div>

                {/* Leave Type */}
                <div>
                  <label className="block text-[12px] font-bold text-[#374151] mb-1.5">
                    Leave Category <span className="text-[#EF4444]">*</span>
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] bg-white outline-none box-border font-sans"
                  >
                    <option value="CASUAL">Casual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="PRIVILEGE">Privilege Leave</option>
                    <option value="MATERNITY">Maternity Leave</option>
                  </select>
                </div>
              </div>

              {/* Reason */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[12px] font-bold text-[#374151]">
                  Reason for Leave <span className="text-[#EF4444]">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain the purpose of your leave request here..."
                  required
                  className="w-full h-[100px] px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] resize-none outline-none box-border font-sans"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end border-t border-[#F3F4F6] pt-5 mt-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('team')}
                  className="px-[22px] py-2.5 rounded-xl border border-gray-200 bg-white text-[#374151] font-bold text-[13px] cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-1.5 px-[22px] py-2.5 rounded-xl border-none bg-[#C8F04A] text-[#111827] font-extrabold text-[13px] cursor-pointer shadow-[0_4px_12px_rgba(200,240,74,0.2)] hover:opacity-90 transition-opacity duration-150"
                >
                  {formLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={13} /> Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

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
                  className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#374151] font-bold text-[13px] cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                >
                  Close
                </button>
                {inspectLeave.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleReview(inspectLeave.id, 'REJECTED')}
                      disabled={reviewingId !== null}
                      className="flex items-center gap-1 bg-[#EF4444] text-white border-0 px-5 py-2.5 rounded-xl cursor-pointer font-bold text-[13px] hover:bg-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      <X size={14} /> Reject Request
                    </button>
                    <button
                      onClick={() => handleReview(inspectLeave.id, 'APPROVED')}
                      disabled={reviewingId !== null}
                      className="flex items-center gap-1 bg-[#10B981] text-white border-0 px-5 py-2.5 rounded-xl cursor-pointer font-extrabold text-[13px] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
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

export default MSELeaveReviewPage;

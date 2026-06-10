import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Calendar, Plus, CheckCircle2, AlertCircle, Clock, FileText, Send, Loader2, Award, ShieldAlert, HeartHandshake } from 'lucide-react';
import {
  fetchMyLeavesAction,
  applyLeaveAction,
  fetchMyBalancesAction,
  fetchLeaveTypesAction,
  clearLeaveErrorsAction,
  clearLeaveSuccessAction
} from '../../redux/actions/leaveActions';

const MRLeavePage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { leaves, myBalances, leaveTypes, loading, error, success } = useSelector((state) => state.leave);

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'list'); // 'list' or 'new'
  
  // Local notification triggers
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('2');
  const [reason, setReason] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Synchronize Redux Success Notifications
  useEffect(() => {
    if (success) {
      setSuccessMsg(success);
      const timer = setTimeout(() => {
        dispatch(clearLeaveSuccessAction());
        setSuccessMsg(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Synchronize Redux Error Notifications
  useEffect(() => {
    if (error) {
      setErrorMsg(error);
      const timer = setTimeout(() => {
        dispatch(clearLeaveErrorsAction());
        setErrorMsg(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Fetch initial data on mount
  useEffect(() => {
    dispatch(fetchMyLeavesAction());
    dispatch(fetchMyBalancesAction());
    dispatch(fetchLeaveTypesAction());
  }, [dispatch]);

  // Set default leave type when categories load
  useEffect(() => {
    if (leaveTypes && leaveTypes.length > 0) {
      const exists = leaveTypes.some(t => t.id.toString() === leaveType.toString());
      if (!exists) {
        setLeaveType(leaveTypes[0].id.toString());
      }
    }
  }, [leaveTypes, leaveType]);

  const triggerLocalNotification = (type, msg) => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

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
        leaveTypeId: parseInt(leaveType),
        fromDate: startDate,
        toDate: endDate,
        reason: reason.trim(),
        leaveSession: 'FULL_DAY'
      }));
      
      // Reset form on success
      setStartDate('');
      setEndDate('');
      if (leaveTypes && leaveTypes.length > 0) {
        setLeaveType(leaveTypes[0].id.toString());
      }
      setReason('');
      setActiveTab('list');
      // Re-fetch history and balances
      dispatch(fetchMyLeavesAction());
      dispatch(fetchMyBalancesAction());
    } catch (err) {
      // Errors handled by redux error binding
    } finally {
      setFormLoading(false);
    }
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

  const formatLeaveType = (type) => {
    const t = (type && typeof type === 'object')
      ? (type.name || type.code || '')
      : (type || '');
    return t
      ?.replace('_', ' ')
      ?.toLowerCase()
      ?.replace(/\b\w/g, (char) => char.toUpperCase()) || 'Leave';
  };

  const calculateDays = (start, end, from, to) => {
    const s = start || from;
    const e = end || to;
    if (!s || !e) return 0;
    const diffTime = Math.abs(new Date(e) - new Date(s));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Helper for balance cards styling
  const getBalanceStyle = (code) => {
    const uc = code?.toUpperCase();
    if (uc === 'CL' || uc === 'CASUAL') return { border: 'border-amber-100', text: 'text-amber-600', bg: 'bg-amber-50', icon: '🏖️' };
    if (uc === 'SL' || uc === 'SICK') return { border: 'border-rose-100', text: 'text-rose-600', bg: 'bg-rose-50', icon: '🤒' };
    if (uc === 'PL' || uc === 'PRIVILEGE' || uc === 'PATERNITY') return { border: 'border-emerald-100', text: 'text-emerald-600', bg: 'bg-emerald-50', icon: '🌟' };
    if (uc === 'ML' || uc === 'MATERNITY') return { border: 'border-indigo-100', text: 'text-indigo-600', bg: 'bg-indigo-50', icon: '👶' };
    if (uc === 'EL' || uc === 'EARNED') return { border: 'border-blue-100', text: 'text-blue-600', bg: 'bg-blue-50', icon: '📋' };
    if (uc === 'CO' || uc === 'COMPENSATORY') return { border: 'border-purple-100', text: 'text-purple-600', bg: 'bg-purple-50', icon: '⏰' };
    return { border: 'border-blue-100', text: 'text-blue-600', bg: 'bg-blue-50', icon: '📋' };
  };

  return (
    <div className="animate-[fadeSlideIn_0.35s_ease-out] flex flex-col h-[calc(100vh-104px)] min-h-0 overflow-hidden">
      {/* Notifications */}
      {successMsg && (
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] px-[18px] py-3 rounded-xl flex items-center gap-2 text-[#047857] text-[13px] font-semibold mb-3 shrink-0">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] px-[18px] py-3 rounded-xl flex items-center gap-2 text-[#B91C1C] text-[13px] font-semibold mb-3 shrink-0">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Tab controls */}
      <div className="flex gap-2.5 mb-4 shrink-0">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-[22px] py-2.5 rounded-xl border-none cursor-pointer text-[13.5px] font-bold transition-all duration-200 outline-none ${
            activeTab === 'list' 
              ? 'bg-[#C8F04A] text-[#111827] shadow-[0_4px_12px_rgba(200,240,74,0.25)] border-none' 
              : 'bg-white text-[#111827] border border-gray-200 hover:bg-gray-50'
          }`}
        >
          My Leave History
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`flex items-center gap-1.5 px-[22px] py-2.5 rounded-xl border-none cursor-pointer text-[13.5px] font-bold transition-all duration-200 outline-none ${
            activeTab === 'new' 
              ? 'bg-[#C8F04A] text-[#111827] shadow-[0_4px_12px_rgba(200,240,74,0.25)] border-none' 
              : 'bg-white text-[#111827] border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Plus size={15} strokeWidth={2.5} /> Apply for Leave
        </button>
      </div>

      {/* Leave Balance Cards Row */}
      {myBalances && myBalances.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 mb-4 shrink-0">
          {myBalances.map((bal, idx) => {
            const code = bal.leaveCode || bal.leaveType?.code || bal.leaveTypeCode || bal.leaveType || '';
            const name = bal.leaveName || bal.leaveType?.name || bal.leaveTypeName || bal.leaveType || 'Leave';
            const used = bal.usedDays ?? bal.used ?? 0;
            const limit = bal.allocatedDays ?? bal.limit ?? bal.totalDays ?? 12;
            const remaining = bal.remainingDays ?? (limit - used);
            const style = getBalanceStyle(code || name);
            const percentUsed = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;

            return (
              <div key={bal.id || idx} className={`bg-white border ${style.border} rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{name}</span>
                    <h3 className="text-xl font-bold text-gray-800 tracking-tight mt-1">{remaining} <span className="text-xs font-semibold text-gray-400">Days Left</span></h3>
                  </div>
                  <span className={`w-8 h-8 rounded-xl ${style.bg} flex items-center justify-center text-lg`}>
                    {style.icon}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-tight">
                    <span>Used: {used} / {limit} D</span>
                    <span>{percentUsed}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-1.5 rounded-full ${percentUsed > 80 ? 'bg-rose-500' : 'bg-[#C8F04A]'}`} style={{ width: `${percentUsed}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Content wrapper */}
      <div className="bg-white rounded-[20px] border-[1.5px] border-[#F3F4F6] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
        
        {/* Tab 1: Leaves list */}
        {activeTab === 'list' && (
          loading && leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-3">
              <Loader2 size={24} className="animate-spin text-[#111827]" />
              <span className="text-[13.5px] text-[#9CA3AF]">Loading leave requests...</span>
            </div>
          ) : leaves.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-[#9CA3AF]">
              <Calendar size={40} className="mx-auto mb-3 stroke-[1.5]" />
              <p className="m-0 text-[14px] font-medium">No leave applications logged yet.</p>
              <button
                onClick={() => setActiveTab('new')}
                className="mt-3.5 bg-[#111827] text-white border-none px-4 py-2 rounded-lg font-bold text-[12.5px] cursor-pointer hover:bg-gray-800 transition-colors duration-150"
              >
                Apply for Leave
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="overflow-y-auto flex-1 pr-1">
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
                    return (
                      <tr key={leave.leaveId || leave.id} className="border-b border-[#FAFAFA] hover:bg-gray-50/50 transition-colors duration-150">
                        {/* Type */}
                        <td className="px-4 py-4 text-[13.5px] font-bold text-[#1F2937]">
                          {formatLeaveType(leave.leaveName || leave.leaveCode || leave.leaveTypeName || leave.leaveTypeCode || leave.leaveType)}
                        </td>
                        {/* Start Date */}
                        <td className="px-4 py-4 text-[13px] text-[#4B5563] font-semibold">
                          {leave.startDate || leave.fromDate}
                        </td>
                        {/* End Date */}
                        <td className="px-4 py-4 text-[13px] text-[#4B5563] font-semibold">
                          {leave.endDate || leave.toDate}
                        </td>
                        {/* Duration */}
                        <td className="px-4 py-4 text-[13px] text-[#1F2937] font-bold">
                          {calculateDays(leave.startDate, leave.endDate, leave.fromDate, leave.toDate)} Day{calculateDays(leave.startDate, leave.endDate, leave.fromDate, leave.toDate) !== 1 ? 's' : ''}
                        </td>
                        {/* Reason */}
                        <td className="px-4 py-4 text-[13px] text-[#4B5563] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={leave.reason}>
                          {leave.reason}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${getStatusBadgeClass(leave.status)}`}>
                            {leave.status}
                          </span>
                        </td>
                        {/* Feedback */}
                        <td className="px-4 py-4 text-[12.5px] text-[#6B7280] italic max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={leave.managerRemarks || leave.remarks || ''}>
                          {leave.managerRemarks || leave.remarks || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          )
        )}

        {/* Tab 2: Apply Leave Form */}
        {activeTab === 'new' && (
          <form onSubmit={handleApplyLeave} className="flex flex-col gap-4 flex-1 pr-1">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-[12px] font-bold text-[#374151] mb-1">
                  Start Date <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[13.5px] outline-none box-border font-sans"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-[12px] font-bold text-[#374151] mb-1">
                  End Date <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[13.5px] outline-none box-border font-sans"
                />
              </div>

              {/* Leave Type */}
              <div>
                <label className="block text-[12px] font-bold text-[#374151] mb-1">
                  Leave Category <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[13.5px] bg-white outline-none box-border font-sans"
                >
                  {leaveTypes && leaveTypes.length > 0 ? (
                    leaveTypes.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="2">Casual Leave</option>
                      <option value="3">Sick Leave</option>
                      <option value="4">Earned Leave</option>
                      <option value="5">Paternity Leave</option>
                      <option value="1">Compensatory Off</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Reason */}
            <div className="flex flex-col gap-1">
              <label className="block text-[12px] font-bold text-[#374151]">
                Reason for Leave <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the purpose of your leave request here..."
                required
                className="w-full h-[70px] px-3 py-2 rounded-xl border border-gray-200 text-[13.5px] resize-none outline-none box-border font-sans"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-end border-t border-[#F3F4F6] pt-3 mt-auto">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-[22px] py-2 rounded-xl border border-gray-200 bg-white text-[#374151] font-bold text-[13px] cursor-pointer hover:bg-gray-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="flex items-center gap-1.5 px-[22px] py-2 rounded-xl border-none bg-[#C8F04A] text-[#111827] font-extrabold text-[13px] cursor-pointer shadow-[0_4px_12px_rgba(200,240,74,0.2)] hover:opacity-90 transition-opacity duration-150"
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
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default MRLeavePage;

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Plus, CheckCircle2, AlertCircle, Clock, FileText, Send, Loader2 } from 'lucide-react';
import {
  fetchMyLeavesAction,
  applyLeaveAction,
  clearLeaveErrorsAction,
  clearLeaveSuccessAction
} from '../../redux/actions/leaveActions';

const MRLeavePage = () => {
  const dispatch = useDispatch();
  const { leaves, loading, error, success } = useSelector((state) => state.leave);

  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
  
  // Local notification triggers
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('CASUAL');
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

  // Fetch MR's leaves on mount
  useEffect(() => {
    dispatch(fetchMyLeavesAction());
  }, [dispatch]);

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
      setActiveTab('list');
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
    return type
      ?.replace('_', ' ')
      ?.toLowerCase()
      ?.replace(/\b\w/g, (char) => char.toUpperCase()) || 'Leave';
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="animate-[fadeSlideIn_0.35s_ease-out]">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-7">
        <div>
          <span className="text-[11px] text-[#9CA3AF] font-extrabold uppercase tracking-wider">
            PORTAL: MEDICAL REPRESENTATIVE
          </span>
          <h2 className="text-[24px] font-extrabold text-[#111827] mt-1 mb-0">Leave Management</h2>
          <p className="text-[13px] text-[#6B7280] mt-[3px] mb-0">Request leaves and view approval history from your reporting manager.</p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] px-[18px] py-3 rounded-xl flex items-center gap-2 text-[#047857] text-[13px] font-semibold mb-5">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] px-[18px] py-3 rounded-xl flex items-center gap-2 text-[#B91C1C] text-[13px] font-semibold mb-5">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Tab controls */}
      <div className="flex gap-2.5 mb-6">
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

      {/* Content wrapper */}
      <div className="bg-white rounded-[20px] border-[1.5px] border-[#F3F4F6] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-7">
        
        {/* Tab 1: Leaves list */}
        {activeTab === 'list' && (
          loading && leaves.length === 0 ? (
            <div className="flex flex-col items-center p-[60px] gap-3">
              <Loader2 size={24} className="animate-spin text-[#111827]" />
              <span className="text-[13.5px] text-[#9CA3AF]">Loading leave requests...</span>
            </div>
          ) : leaves.length === 0 ? (
            <div className="p-[60px] text-center text-[#9CA3AF]">
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
                    return (
                      <tr key={leave.id} className="border-b border-[#FAFAFA] hover:bg-gray-50/50 transition-colors duration-150">
                        {/* Type */}
                        <td className="px-4 py-4 text-[13.5px] font-bold text-[#1F2937]">
                          {formatLeaveType(leave.leaveType)}
                        </td>
                        {/* Start Date */}
                        <td className="px-4 py-4 text-[13px] text-[#4B5563] font-semibold">
                          {leave.startDate}
                        </td>
                        {/* End Date */}
                        <td className="px-4 py-4 text-[13px] text-[#4B5563] font-semibold">
                          {leave.endDate}
                        </td>
                        {/* Duration */}
                        <td className="px-4 py-4 text-[13px] text-[#1F2937] font-bold">
                          {calculateDays(leave.startDate, leave.endDate)} Day{calculateDays(leave.startDate, leave.endDate) !== 1 ? 's' : ''}
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
          )
        )}

        {/* Tab 2: Apply Leave Form */}
        {activeTab === 'new' && (
          <form onSubmit={handleApplyLeave} className="flex flex-col gap-6">
            <div className="border-b border-[#F3F4F6] pb-5">
              <h4 className="text-[16px] font-extrabold text-[#111827] margin-0">Request Time Off</h4>
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
                onClick={() => setActiveTab('list')}
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

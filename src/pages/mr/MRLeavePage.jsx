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

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'APPROVED':
        return { bg: '#ECFDF5', text: '#059669', border: '1px solid #A7F3D0' };
      case 'REJECTED':
        return { bg: '#FEF2F2', text: '#DC2626', border: '1px solid #FCA5A5' };
      default: // PENDING
        return { bg: '#FFFBEB', text: '#D97706', border: '1px solid #FDE68A' };
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
    <div style={{ animation: 'fadeSlideIn 0.35s ease-out' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            PORTAL: MEDICAL REPRESENTATIVE
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '4px 0 0 0' }}>Leave Management</h2>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '3px 0 0 0' }}>Request leaves and view approval history from your reporting manager.</p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '12px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#B91C1C', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Tab controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('list')}
          style={{
            padding: '10px 22px', borderRadius: '12px', cursor: 'pointer',
            background: activeTab === 'list' ? '#C8F04A' : '#fff',
            color: '#111827', fontWeight: 700, fontSize: '13.5px',
            boxShadow: activeTab === 'list' ? '0 4px 12px rgba(200, 240, 74, 0.25)' : 'none',
            border: activeTab === 'list' ? 'none' : '1px solid #E5E7EB',
            transition: 'all 0.2s', outline: 'none'
          }}
        >
          My Leave History
        </button>
        <button
          onClick={() => setActiveTab('new')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 22px', borderRadius: '12px', cursor: 'pointer',
            background: activeTab === 'new' ? '#C8F04A' : '#fff',
            color: '#111827', fontWeight: 700, fontSize: '13.5px',
            boxShadow: activeTab === 'new' ? '0 4px 12px rgba(200, 240, 74, 0.25)' : 'none',
            border: activeTab === 'new' ? 'none' : '1px solid #E5E7EB',
            transition: 'all 0.2s', outline: 'none'
          }}
        >
          <Plus size={15} strokeWidth={2.5} /> Apply for Leave
        </button>
      </div>

      {/* Content wrapper */}
      <div style={{ background: '#fff', borderRadius: '20px', border: '1.5px solid #F3F4F6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '28px' }}>
        
        {/* Tab 1: Leaves list */}
        {activeTab === 'list' && (
          loading && leaves.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', gap: '12px' }}>
              <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', color: '#111827' }} />
              <span style={{ fontSize: '13.5px', color: '#9CA3AF' }}>Loading leave requests...</span>
            </div>
          ) : leaves.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#9CA3AF' }}>
              <Calendar size={40} style={{ margin: '0 auto 12px auto', strokeWidth: 1.5 }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No leave applications logged yet.</p>
              <button
                onClick={() => setActiveTab('new')}
                style={{ marginTop: '14px', background: '#111827', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
              >
                Apply for Leave
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #F3F4F6' }}>
                    {['Leave Type', 'Start Date', 'End Date', 'Duration', 'Reason', 'Status', 'Manager Feedback'].map((h) => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => {
                    const statusStyle = getStatusBadgeStyle(leave.status);
                    return (
                      <tr key={leave.id} style={{ borderBottom: '1px solid #FAFAFA', transition: 'background 0.15s' }}>
                        {/* Type */}
                        <td style={{ padding: '16px 16px', fontSize: '13.5px', fontWeight: 700, color: '#1F2937' }}>
                          {formatLeaveType(leave.leaveType)}
                        </td>
                        {/* Start Date */}
                        <td style={{ padding: '16px 16px', fontSize: '13px', color: '#4B5563', fontWeight: 600 }}>
                          {leave.startDate}
                        </td>
                        {/* End Date */}
                        <td style={{ padding: '16px 16px', fontSize: '13px', color: '#4B5563', fontWeight: 600 }}>
                          {leave.endDate}
                        </td>
                        {/* Duration */}
                        <td style={{ padding: '16px 16px', fontSize: '13px', color: '#1F2937', fontWeight: 700 }}>
                          {calculateDays(leave.startDate, leave.endDate)} Day{calculateDays(leave.startDate, leave.endDate) !== 1 ? 's' : ''}
                        </td>
                        {/* Reason */}
                        <td style={{ padding: '16px 16px', fontSize: '13px', color: '#4B5563', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={leave.reason}>
                          {leave.reason}
                        </td>
                        {/* Status */}
                        <td style={{ padding: '16px 16px' }}>
                          <span style={{
                            display: 'inline-flex', padding: '4px 10px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: 800, ...statusStyle
                          }}>
                            {leave.status}
                          </span>
                        </td>
                        {/* Feedback */}
                        <td style={{ padding: '16px 16px', fontSize: '12.5px', color: '#6B7280', fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={leave.managerRemarks || leave.remarks || ''}>
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
          <form onSubmit={handleApplyLeave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>Request Time Off</h4>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0 0' }}>Submit a leave request for processing. Once sent, your manager will be notified.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {/* Start Date */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Start Date <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* End Date */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  End Date <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Leave Type */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Leave Category <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13.5px', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="PRIVILEGE">Privilege Leave</option>
                  <option value="MATERNITY">Maternity Leave</option>
                </select>
              </div>
            </div>

            {/* Reason */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                Reason for Leave <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the purpose of your leave request here..."
                required
                style={{ width: '100%', height: '100px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13.5px', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #F3F4F6', paddingTop: '20px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                style={{
                  padding: '11px 22px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff',
                  color: '#374151', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '11px 22px', borderRadius: '12px', border: 'none', background: '#C8F04A',
                  color: '#111827', fontWeight: 800, fontSize: '13px', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(200, 240, 74, 0.2)', transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {formLoading ? (
                  <>
                    <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting...
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

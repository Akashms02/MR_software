import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, Check, X, Calendar, AlertCircle, CheckCircle2, MessageSquare, Eye, Users } from 'lucide-react';
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
    { label: 'Pending Approvals', value: `${pendingCount}`, sub: pendingCount > 0 ? 'Review required' : 'All caught up!', color: pendingCount > 0 ? '#D97706' : '#10B981', bg: pendingCount > 0 ? '#FFFBEB' : '#ECFDF5', icon: '📋' },
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

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', padding: '10px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        borderRadius: '20px',
        padding: '30px',
        color: '#fff',
        marginBottom: '28px',
        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', color: '#C8F04A', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
            PORTAL: SYSTEM ADMIN
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '14px 0 6px 0', letterSpacing: '-0.5px' }}>
            Leave Approvals & Administration
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', maxWidth: '500px' }}>
            Process and review leave applications requested by medical representatives and executives under your line management.
          </p>
        </div>
        <div style={{
          position: 'absolute', right: '-40px', bottom: '-40px', fontSize: '180px', opacity: 0.08, userSelect: 'none', pointerEvents: 'none'
        }}>
          📅
        </div>
      </div>

      {/* Notifications */}
      {localSuccess && (
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '12px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
          <CheckCircle2 size={16} />
          {localSuccess}
        </div>
      )}
      {localError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#B91C1C', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
          <AlertCircle size={16} />
          {localError}
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '16px', padding: '20px',
            display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
            transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)';
          }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px', background: s.bg, fontSize: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', margin: '2px 0' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: s.color }}>
                {s.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #F3F4F6', paddingBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>Team Leave Applications</h3>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#D97706', background: '#FFFBEB', padding: '4px 12px', borderRadius: '20px' }}>
              Pending: {pendingCount} requests
            </span>
          </div>

          {loading && teamLeaves.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', gap: '10px' }}>
              <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', color: '#111827' }} />
              <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Loading team leaves...</span>
            </div>
          ) : teamLeaves.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#9CA3AF', background: '#FAFAFA', borderRadius: '12px', border: '1px dashed #E5E7EB' }}>
              <CheckCircle2 size={36} style={{ margin: '0 auto 10px auto', color: '#10B981' }} />
              <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: '#4B5563' }}>All caught up! No leave requests pending approval.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #F3F4F6' }}>
                    {['Staff Member', 'Leave Category', 'Duration', 'Dates', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teamLeaves.map((leave) => {
                    const reporterInitial = leave.employeeName ? leave.employeeName.charAt(0).toUpperCase() : 'E';
                    const daysCount = calculateDays(leave.startDate, leave.endDate);
                    const badgeStyle = getStatusBadgeStyle(leave.status);
                    return (
                      <tr key={leave.id} style={{ borderBottom: '1px solid #FAFAFA', transition: 'background 0.15s' }}>
                        {/* Staff member name */}
                        <td style={{ padding: '16px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                              color: '#fff', fontSize: '12.5px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {reporterInitial}
                            </div>
                            <div>
                              <div style={{ fontSize: '13.5px', fontWeight: 750, color: '#1F2937' }}>{leave.employeeName || 'Field staff'}</div>
                              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{leave.employeeRole || 'Medical Representative'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Leave Type */}
                        <td style={{ padding: '16px 16px', fontSize: '13.5px', fontWeight: 700, color: '#1F2937' }}>
                          {formatLeaveType(leave.leaveType)}
                        </td>

                        {/* Duration */}
                        <td style={{ padding: '16px 16px', fontSize: '13px', color: '#1F2937', fontWeight: 700 }}>
                          {daysCount} Day{daysCount !== 1 ? 's' : ''}
                        </td>

                        {/* Dates */}
                        <td style={{ padding: '16px 16px', fontSize: '13.5px', color: '#4B5563', fontWeight: 600 }}>
                          {leave.startDate} to {leave.endDate}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px 16px' }}>
                          <span style={{
                            display: 'inline-flex', padding: '4px 10px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: 800, ...badgeStyle
                          }}>
                            {leave.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 16px' }}>
                          <button
                            onClick={() => handleInspect(leave)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '4px', background: '#111827', color: '#fff',
                              border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                              fontWeight: 700, fontSize: '12px', transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#374151'}
                            onMouseLeave={e => e.currentTarget.style.background = '#111827'}
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

      {/* Inspect & Review Modal */}
      {inspectModalOpen && inspectLeave && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px',
          animation: 'fadeIn 0.2s'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '580px', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            animation: 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1.5px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Review Leave Request
                </h3>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  Requested by: {inspectLeave.employeeName} ({inspectLeave.employeeRole})
                </span>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px',
                ...getStatusBadgeStyle(inspectLeave.status)
              }}>{inspectLeave.status}</span>
            </div>

            {/* Modal Scroll Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Leave Info Card */}
              <div style={{ border: '1.5px solid #F3F4F6', padding: '20px', borderRadius: '12px', background: '#FAFAFA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📅 {inspectLeave.startDate} to {inspectLeave.endDate}
                  </span>
                  <span style={{
                    fontSize: '10.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px',
                    background: '#1E293B', color: '#C8F04A'
                  }}>
                    {formatLeaveType(inspectLeave.leaveType).toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', borderTop: '1px solid #F3F4F6', paddingTop: '12px', marginTop: '6px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Duration</div>
                    <div style={{ fontSize: '13px', color: '#1F2937', fontWeight: 700, marginTop: '2px' }}>
                      {calculateDays(inspectLeave.startDate, inspectLeave.endDate)} Day{calculateDays(inspectLeave.startDate, inspectLeave.endDate) !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Application Reason</div>
                    <div style={{ fontSize: '12.5px', color: '#4B5563', marginTop: '2px', lineHeight: 1.4 }}>
                      {inspectLeave.reason}
                    </div>
                  </div>
                </div>
              </div>

              {/* Already reviewed message */}
              {inspectLeave.status !== 'PENDING' && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Manager Feedback Remarks</div>
                  <div style={{ fontSize: '13px', color: '#78350F', marginTop: '4px', fontStyle: 'italic' }}>"{inspectLeave.managerRemarks || inspectLeave.remarks || 'No feedback left.'}"</div>
                </div>
              )}
            </div>

            {/* Modal Review input + Footer */}
            <div style={{ padding: '20px 24px', borderTop: '1.5px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0, background: '#FAFAFA' }}>
              
              {/* Remarks input */}
              {inspectLeave.status === 'PENDING' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 750, color: '#374151' }}>Approval/Rejection Comments</label>
                  <input
                    type="text"
                    placeholder="Enter review remarks here..."
                    value={remarksMap[inspectLeave.id] || ''}
                    onChange={(e) => setRemarksMap(prev => ({ ...prev, [inspectLeave.id]: e.target.value }))}
                    style={{
                      padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box', width: '100%'
                    }}
                  />
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
                <button
                  onClick={() => setInspectModalOpen(false)}
                  style={{
                    padding: '10px 20px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff',
                    color: '#374151', fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                {inspectLeave.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleReview(inspectLeave.id, 'REJECTED')}
                      disabled={reviewingId !== null}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px', background: '#EF4444', color: '#fff',
                        border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
                        fontWeight: 700, fontSize: '13px'
                      }}
                    >
                      <X size={14} /> Reject Request
                    </button>
                    <button
                      onClick={() => handleReview(inspectLeave.id, 'APPROVED')}
                      disabled={reviewingId !== null}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px', background: '#10B981', color: '#fff',
                        border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
                        fontWeight: 800, fontSize: '13px'
                      }}
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

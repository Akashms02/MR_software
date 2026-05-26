import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from '../../api/axiosInstance';
import { API_ROUTE } from '../../data/env';
import { Loader2, Check, X, FileText, AlertCircle, CheckCircle2, MessageSquare, Eye, Calendar, MapPin, Users } from 'lucide-react';
import {
  fetchTeamTourPlansAction,
  reviewTourPlanAction,
  clearTourPlanErrorsAction,
  clearTourPlanSuccessAction
} from '../../redux/actions/tourPlanActions';

const AdminTourPlanReviewPage = () => {
  const dispatch = useDispatch();
  const { teamTourPlans, loading, error, success } = useSelector((state) => state.tourPlan);

  const [reviewingId, setReviewingId] = useState(null);
  const [remarksMap, setRemarksMap] = useState({});
  const [localSuccess, setLocalSuccess] = useState(null);
  const [localError, setLocalError] = useState(null);

  // Inspector Modal State
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectPlan, setInspectPlan] = useState(null);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    dispatch(fetchTeamTourPlansAction());
    const loadDoctors = async () => {
      try {
        const res = await axios.get(`${API_ROUTE}/doctor`);
        if (res.data && res.data.data) {
          setDoctors(res.data.data);
        }
      } catch (err) {
        console.warn('Could not load doctors database, using fallbacks.');
      }
    };
    loadDoctors();
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setLocalSuccess(success);
      const t = setTimeout(() => setLocalSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      const t = setTimeout(() => setLocalError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleReview = async (planId, status) => {
    const remarks = remarksMap[planId] || (status === 'APPROVED' ? 'Approved. Coverage details look perfect.' : 'Rejected');
    setReviewingId(planId);
    try {
      await dispatch(reviewTourPlanAction(planId, status, remarks));
      // Refresh the list
      dispatch(fetchTeamTourPlansAction());
      setInspectModalOpen(false);
      // Clear input
      setRemarksMap(prev => {
        const copy = { ...prev };
        delete copy[planId];
        return copy;
      });
    } catch (err) {
      // Handled by store
    } finally {
      setReviewingId(null);
    }
  };

  const pendingPlanList = teamTourPlans.filter(p => p.status === 'SUBMITTED');
  const pendingCount = pendingPlanList.length;
  const totalCount = teamTourPlans.length;
  const approvedCount = teamTourPlans.filter(p => p.status === 'APPROVED').length;

  const stats = [
    { label: 'Pending Review', value: `${pendingCount}`, sub: pendingCount > 0 ? 'Action required' : 'All caught up!', color: pendingCount > 0 ? '#D97706' : '#10B981', bg: pendingCount > 0 ? '#FFFBEB' : '#ECFDF5', icon: '📋' },
    { label: 'Approved Plans', value: `${approvedCount}`, sub: 'For target months', color: '#10B981', bg: '#ECFDF5', icon: '✅' },
    { label: 'Total Reps Under Management', value: '8 Field Staff', sub: 'MRs, MEs & MSEs', color: '#6366F1', bg: '#EEF2FF', icon: '👥' },
    { label: 'Active Territories', value: '14 Regions', sub: 'Target Coverage', color: '#06B6D4', bg: '#ECFEFF', icon: '🗺️' },
  ];

  const formatMonthLabel = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-');
      const d = new Date(parts[0], parts[1] - 1, 1);
      return d.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const doctorListOptions = doctors.length > 0 ? doctors : [
    { id: 1, fullName: 'Dr. Ramesh Sharma', speciality: 'CARDIOLOGY', clinicName: 'City Heart Clinic' },
    { id: 2, fullName: 'Dr. Sunita Patel', speciality: 'PEDIATRICS', clinicName: 'Metro General Hospital' },
    { id: 3, fullName: 'Dr. Vivek Verma', speciality: 'ORTHOPEDICS', clinicName: 'Verma Ortho Care' },
    { id: 4, fullName: 'Dr. Neha Gupta', speciality: 'GENERAL PHYSICIAN', clinicName: 'Care Clinic' },
  ];

  const handleInspect = (plan) => {
    setInspectPlan(plan);
    setInspectModalOpen(true);
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
            Tour Plan Administration
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', maxWidth: '500px' }}>
            Review, approve or reject monthly tour programs submitted by medical representatives and executives.
          </p>
        </div>
        <div style={{
          position: 'absolute', right: '-40px', bottom: '-40px', fontSize: '180px', opacity: 0.08, userSelect: 'none', pointerEvents: 'none'
        }}>
          🗺️
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
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>Submitted Tour Plans Awaiting Approval</h3>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#10B981', background: '#ECFDF5', padding: '4px 12px', borderRadius: '20px' }}>
              Pending: {pendingCount} plans
            </span>
          </div>

          {loading && teamTourPlans.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', gap: '10px' }}>
              <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', color: '#111827' }} />
              <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Loading team tour plans...</span>
            </div>
          ) : teamTourPlans.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#9CA3AF', background: '#FAFAFA', borderRadius: '12px', border: '1px dashed #E5E7EB' }}>
              <CheckCircle2 size={36} style={{ margin: '0 auto 10px auto', color: '#10B981' }} />
              <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: '#4B5563' }}>All caught up! No tour plans pending approval.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #F3F4F6' }}>
                    {['Staff Member', 'Target Month', 'Scheduled Days', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teamTourPlans.map((plan) => {
                    const reporterInitial = plan.employeeName ? plan.employeeName.charAt(0).toUpperCase() : 'E';
                    return (
                      <tr key={plan.id} style={{ borderBottom: '1px solid #FAFAFA', transition: 'background 0.15s' }}>
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
                              <div style={{ fontSize: '13.5px', fontWeight: 750, color: '#1F2937' }}>{plan.employeeName || 'Field Employee'}</div>
                              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{plan.employeeRole || 'Medical Representative'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Month */}
                        <td style={{ padding: '16px 16px', fontSize: '13.5px', fontWeight: 700, color: '#1F2937' }}>
                          {formatMonthLabel(plan.targetMonth)}
                        </td>

                        {/* Scheduled Days */}
                        <td style={{ padding: '16px 16px', fontSize: '13px', color: '#4B5563', fontWeight: 600 }}>
                          {plan.planDays?.length || 0} Day{plan.planDays?.length !== 1 ? 's' : ''} scheduled
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px 16px' }}>
                          <span style={{
                            display: 'inline-flex', padding: '4px 10px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: 800,
                            background: plan.status === 'APPROVED' ? '#ECFDF5' : plan.status === 'REJECTED' ? '#FEF2F2' : '#FFFBEB',
                            color: plan.status === 'APPROVED' ? '#059669' : plan.status === 'REJECTED' ? '#DC2626' : '#D97706',
                            border: plan.status === 'APPROVED' ? '1px solid #A7F3D0' : plan.status === 'REJECTED' ? '1px solid #FCA5A5' : '1px solid #FDE68A'
                          }}>
                            {plan.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 16px' }}>
                          <button
                            onClick={() => handleInspect(plan)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '4px', background: '#111827', color: '#fff',
                              border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                              fontWeight: 700, fontSize: '12px', transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#374151'}
                            onMouseLeave={e => e.currentTarget.style.background = '#111827'}
                          >
                            <Eye size={12} /> Inspect Plan
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
      {inspectModalOpen && inspectPlan && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px',
          animation: 'fadeIn 0.2s'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '700px', maxHeight: '88vh',
            display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            animation: 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1.5px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Review Tour Plan: {inspectPlan.employeeName || 'Staff Member'}
                </h3>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  Target Month: {formatMonthLabel(inspectPlan.targetMonth)} • Plan Status: {inspectPlan.status}
                </span>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px',
                background: inspectPlan.status === 'APPROVED' ? '#ECFDF5' : inspectPlan.status === 'REJECTED' ? '#FEF2F2' : '#FFFBEB',
                color: inspectPlan.status === 'APPROVED' ? '#059669' : inspectPlan.status === 'REJECTED' ? '#DC2626' : '#D97706',
              }}>{inspectPlan.status}</span>
            </div>

            {/* Modal Scroll Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Daily schedule listing */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Planned Itinerary Days ({inspectPlan.planDays?.length || 0})
                </div>

                {inspectPlan.planDays?.map((day, dIdx) => (
                  <div key={dIdx} style={{ border: '1.5px solid #F3F4F6', padding: '16px', borderRadius: '12px', background: '#FAFAFA' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#1F2937' }}>
                        📅 {day.plannedDate}
                      </span>
                      <span style={{
                        fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px',
                        background: '#1E293B', color: '#C8F04A'
                      }}>
                        {day.activityType.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '16px', borderTop: '1px solid #F3F4F6', paddingTop: '8px', marginTop: '6px' }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Target Territory</div>
                        <div style={{ fontSize: '12.5px', color: '#374151', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={11} color="#9CA3AF" />
                          {day.targetTerritory || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Objectives & remarks</div>
                        <div style={{ fontSize: '12px', color: '#4B5563', marginTop: '2px', fontStyle: day.remarks ? 'normal' : 'italic' }}>
                          {day.remarks || 'No objectives stated.'}
                        </div>
                      </div>
                    </div>

                    {day.activityType === 'FIELD_WORK' && day.plannedDoctorIds && day.plannedDoctorIds.length > 0 && (
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '8px', marginTop: '8px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '4px' }}>Doctors Scheduled ({day.plannedDoctorIds.length})</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {day.plannedDoctorIds.map((docId) => {
                            const doc = doctorListOptions.find(d => d.id === docId) || { fullName: `Dr. ID: ${docId}`, speciality: '' };
                            return (
                              <span key={docId} style={{
                                display: 'inline-flex', padding: '3px 8px', borderRadius: '6px',
                                background: '#E0E7FF', color: '#4F46E5', fontSize: '10.5px', fontWeight: 700
                              }}>
                                👨‍⚕️ {doc.fullName} {doc.speciality && `(${doc.speciality})`}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Review input + Footer */}
            <div style={{ padding: '20px 24px', borderTop: '1.5px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0, background: '#FAFAFA' }}>
              
              {/* Remarks input */}
              {inspectPlan.status === 'SUBMITTED' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 750, color: '#374151' }}>Review Feedback Remarks</label>
                  <input
                    type="text"
                    placeholder="Enter approval/rejection remarks here..."
                    value={remarksMap[inspectPlan.id] || ''}
                    onChange={(e) => setRemarksMap(prev => ({ ...prev, [inspectPlan.id]: e.target.value }))}
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
                {inspectPlan.status === 'SUBMITTED' && (
                  <>
                    <button
                      onClick={() => handleReview(inspectPlan.id, 'REJECTED')}
                      disabled={reviewingId !== null}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px', background: '#EF4444', color: '#fff',
                        border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
                        fontWeight: 700, fontSize: '13px'
                      }}
                    >
                      <X size={14} /> Reject Plan
                    </button>
                    <button
                      onClick={() => handleReview(inspectPlan.id, 'APPROVED')}
                      disabled={reviewingId !== null}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px', background: '#10B981', color: '#fff',
                        border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
                        fontWeight: 800, fontSize: '13px'
                      }}
                    >
                      <Check size={14} /> Approve Plan
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

export default AdminTourPlanReviewPage;

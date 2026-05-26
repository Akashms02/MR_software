import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from '../../api/axiosInstance';
import { API_ROUTE } from '../../data/env';
import { Calendar, MapPin, Plus, Trash2, CheckCircle2, AlertCircle, Eye, Send, Loader2, ClipboardList, Clock } from 'lucide-react';
import {
  fetchMyTourPlansAction,
  saveTourPlanDraftAction,
  submitTourPlanAction,
  fetchTourPlanDetailsAction,
  clearTourPlanErrorsAction,
  clearTourPlanSuccessAction,
} from '../../redux/actions/tourPlanActions';

const MSETourPlanPage = () => {
  const dispatch = useDispatch();
  const { tourPlans, loading, error, success, currentTourPlan } = useSelector((state) => state.tourPlan);

  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
  const [doctors, setDoctors] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Form State
  const [targetMonth, setTargetMonth] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().slice(0, 7); // YYYY-MM
  });
  const [planDays, setPlanDays] = useState([
    { plannedDate: '', targetTerritory: '', plannedDoctorIds: [], activityType: 'FIELD_WORK', remarks: '' }
  ]);

  // MSE theme: Teal
  const theme = {
    label: 'MEDICAL SALES EXECUTIVE',
    primary: '#0D9488',
    hoverOpacity: '0.9',
    activeBg: '#E6FFFA',
    activeText: '#0D9488',
    shadow: '0 4px 12px rgba(13, 148, 216, 0.25)',
    textOnPrimary: '#ffffff'
  };

  useEffect(() => {
    if (success) {
      setSuccessMsg(success);
      const timer = setTimeout(() => {
        dispatch(clearTourPlanSuccessAction());
        setSuccessMsg(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      setErrorMsg(error);
      const timer = setTimeout(() => {
        dispatch(clearTourPlanErrorsAction());
        setErrorMsg(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    dispatch(fetchMyTourPlansAction());
    const loadDoctors = async () => {
      try {
        const res = await axios.get(`${API_ROUTE}/doctor`);
        if (res.data && res.data.data) {
          setDoctors(res.data.data);
        }
      } catch (err) {
        console.warn('Could not load doctors database.');
      }
    };
    loadDoctors();
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

  const addDayField = () => {
    let nextDateStr = '';
    if (planDays.length > 0) {
      const lastDate = planDays[planDays.length - 1].plannedDate;
      if (lastDate) {
        const d = new Date(lastDate);
        d.setDate(d.getDate() + 1);
        nextDateStr = d.toISOString().split('T')[0];
      }
    }
    setPlanDays([
      ...planDays,
      { plannedDate: nextDateStr, targetTerritory: '', plannedDoctorIds: [], activityType: 'FIELD_WORK', remarks: '' }
    ]);
  };

  const removeDayField = (idx) => {
    if (planDays.length === 1) {
      triggerLocalNotification('error', 'A tour plan must contain at least one planned day.');
      return;
    }
    setPlanDays(planDays.filter((_, i) => i !== idx));
  };

  const handleDayChange = (idx, field, value) => {
    const updated = [...planDays];
    updated[idx][field] = value;
    setPlanDays(updated);
  };

  const handleDoctorCheckboxChange = (dayIdx, docId, checked) => {
    const updated = [...planDays];
    const currentDocIds = [...updated[dayIdx].plannedDoctorIds];
    if (checked) {
      if (!currentDocIds.includes(docId)) {
        currentDocIds.push(docId);
      }
    } else {
      const pos = currentDocIds.indexOf(docId);
      if (pos > -1) {
        currentDocIds.splice(pos, 1);
      }
    }
    updated[dayIdx].plannedDoctorIds = currentDocIds;
    setPlanDays(updated);
  };

  const handleSaveDraft = async (e, andSubmit = false) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const invalidDate = planDays.some(d => !d.plannedDate);
    const invalidTerritory = planDays.some(d => d.activityType === 'FIELD_WORK' && !d.targetTerritory);
    
    if (invalidDate) {
      triggerLocalNotification('error', 'Please select a planned date for all days.');
      return;
    }
    if (invalidTerritory) {
      triggerLocalNotification('error', 'Please specify a target territory for field work days.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        targetMonth: `${targetMonth}-01`,
        planDays: planDays.map(d => ({
          plannedDate: d.plannedDate,
          targetTerritory: d.targetTerritory || 'N/A',
          plannedDoctorIds: d.plannedDoctorIds.map(id => parseInt(id)),
          activityType: d.activityType,
          remarks: d.remarks || ''
        }))
      };

      const res = await dispatch(saveTourPlanDraftAction(payload));
      const createdPlan = res?.data || res;

      if (createdPlan && createdPlan.id) {
        const planId = createdPlan.id;
        if (andSubmit) {
          await dispatch(submitTourPlanAction(planId));
        }
        dispatch(fetchMyTourPlansAction());
        setPlanDays([{ plannedDate: '', targetTerritory: '', plannedDoctorIds: [], activityType: 'FIELD_WORK', remarks: '' }]);
        setActiveTab('list');
      }
    } catch (err) {
      // Caught in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitExistingDraft = async (planId) => {
    setActionLoading(true);
    try {
      await dispatch(submitTourPlanAction(planId));
      dispatch(fetchMyTourPlansAction());
    } catch (err) {
      // Handled by store
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewPlanDetails = async (planId) => {
    try {
      await dispatch(fetchTourPlanDetailsAction(planId));
      setDetailModalOpen(true);
    } catch (err) {
      triggerLocalNotification('error', 'Failed to retrieve tour plan details.');
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'APPROVED':
        return { bg: '#ECFDF5', text: '#059669', border: '1px solid #A7F3D0' };
      case 'REJECTED':
        return { bg: '#FEF2F2', text: '#DC2626', border: '1px solid #FCA5A5' };
      case 'SUBMITTED':
        return { bg: '#FFFBEB', text: '#D97706', border: '1px solid #FDE68A' };
      default: // DRAFT
        return { bg: '#F3F4F6', text: '#4B5563', border: '1px solid #D1D5DB' };
    }
  };

  const doctorListOptions = doctors.length > 0 ? doctors : [
    { id: 1, fullName: 'Dr. Ramesh Sharma', speciality: 'CARDIOLOGY', clinicName: 'City Heart Clinic' },
    { id: 2, fullName: 'Dr. Sunita Patel', speciality: 'PEDIATRICS', clinicName: 'Metro General Hospital' },
    { id: 3, fullName: 'Dr. Vivek Verma', speciality: 'ORTHOPEDICS', clinicName: 'Verma Ortho Care' },
    { id: 4, fullName: 'Dr. Neha Gupta', speciality: 'GENERAL PHYSICIAN', clinicName: 'Care Clinic' },
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

  return (
    <div style={{ animation: 'fadeSlideIn 0.35s ease-out' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            PORTAL: {theme.label}
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '4px 0 0 0' }}>Tour Plan Management</h2>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '3px 0 0 0' }}>Draft and schedule your monthly field activities and doctor calls.</p>
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
            padding: '10px 22px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            background: activeTab === 'list' ? theme.primary : '#fff',
            color: activeTab === 'list' ? theme.textOnPrimary : '#111827',
            fontWeight: 700, fontSize: '13.5px',
            boxShadow: activeTab === 'list' ? theme.shadow : 'none',
            border: activeTab === 'list' ? 'none' : '1px solid #E5E7EB',
            transition: 'all 0.2s', outline: 'none'
          }}
        >
          My Tour Plans
        </button>
        <button
          onClick={() => setActiveTab('new')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 22px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            background: activeTab === 'new' ? theme.primary : '#fff',
            color: activeTab === 'new' ? theme.textOnPrimary : '#111827',
            fontWeight: 700, fontSize: '13.5px',
            boxShadow: activeTab === 'new' ? theme.shadow : 'none',
            border: activeTab === 'new' ? 'none' : '1px solid #E5E7EB',
            transition: 'all 0.2s', outline: 'none'
          }}
        >
          <Plus size={15} strokeWidth={2.5} /> Set Monthly Plan
        </button>
      </div>

      {/* Content wrapper */}
      <div style={{ background: '#fff', borderRadius: '20px', border: '1.5px solid #F3F4F6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '28px' }}>
        
        {/* Tab 1: Tour Plans List */}
        {activeTab === 'list' && (
          loading && tourPlans.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', gap: '12px' }}>
              <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', color: '#111827' }} />
              <span style={{ fontSize: '13.5px', color: '#9CA3AF' }}>Loading tour plans...</span>
            </div>
          ) : tourPlans.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#9CA3AF' }}>
              <ClipboardList size={40} style={{ margin: '0 auto 12px auto', strokeWidth: 1.5 }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No monthly tour plans created yet.</p>
              <button
                onClick={() => setActiveTab('new')}
                style={{
                  marginTop: '14px', border: 'none', padding: '8px 16px', borderRadius: '10px',
                  fontWeight: 700, fontSize: '12.5px', cursor: 'pointer',
                  background: theme.primary, color: theme.textOnPrimary, boxShadow: theme.shadow
                }}
              >
                Schedule First Tour Plan
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #F3F4F6' }}>
                    {['Target Month', 'Total Days', 'Status', 'Manager Remarks', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tourPlans.map((plan) => {
                    const statusStyle = getStatusBadgeStyle(plan.status);
                    return (
                      <tr key={plan.id} style={{ borderBottom: '1px solid #FAFAFA', transition: 'background 0.15s' }}>
                        {/* Month */}
                        <td style={{ padding: '16px 16px', fontSize: '13.5px', fontWeight: 700, color: '#1F2937' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} color="#9CA3AF" />
                            {formatMonthLabel(plan.targetMonth)}
                          </span>
                        </td>
                        {/* Total Days */}
                        <td style={{ padding: '16px 16px', fontSize: '13.5px', color: '#4B5563', fontWeight: 600 }}>
                          {plan.planDays?.length || 0} Day{plan.planDays?.length !== 1 ? 's' : ''} scheduled
                        </td>
                        {/* Status */}
                        <td style={{ padding: '16px 16px' }}>
                          <span style={{
                            display: 'inline-flex', padding: '4px 10px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: 800, ...statusStyle
                          }}>
                            {plan.status}
                          </span>
                        </td>
                        {/* Remarks */}
                        <td style={{ padding: '16px 16px', fontSize: '13px', color: '#6B7280', fontStyle: 'italic', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {plan.remarks || '—'}
                        </td>
                        {/* Actions */}
                        <td style={{ padding: '16px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => handleViewPlanDetails(plan.id)}
                              title="View Details"
                              style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                background: '#F3F4F6', border: 'none', padding: '6px 12px', borderRadius: '8px',
                                cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#374151',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
                              onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}
                            >
                              <Eye size={12} /> Details
                            </button>
                            {plan.status === 'DRAFT' && (
                              <button
                                onClick={() => handleSubmitExistingDraft(plan.id)}
                                disabled={actionLoading}
                                title="Submit tour plan for review"
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '4px',
                                  border: 'none', padding: '6px 12px', borderRadius: '8px',
                                  cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                                  background: theme.primary, color: theme.textOnPrimary,
                                  transition: 'opacity 0.15s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = theme.hoverOpacity}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                              >
                                <Send size={11} /> Submit
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Tab 2: Create New Tour Plan */}
        {activeTab === 'new' && (
          <form onSubmit={(e) => handleSaveDraft(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #F3F4F6', paddingBottom: '20px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>Create Monthly Tour Schedule</h4>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0 0' }}>Plan daily work routes, hospital call visits and seminars in advance.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Target Month:</label>
                <input
                  type="month"
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(e.target.value)}
                  required
                  style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
            </div>

            {/* Plan Days Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {planDays.map((day, idx) => (
                <div key={idx} style={{
                  padding: '24px', border: '1px solid #E5E7EB', borderRadius: '16px', background: '#FAFAFA',
                  position: 'relative', animation: 'fadeIn 0.25s'
                }}>
                  {/* Remove card button */}
                  <button
                    type="button"
                    onClick={() => removeDayField(idx)}
                    style={{
                      position: 'absolute', right: '16px', top: '16px', background: 'transparent', border: 'none',
                      cursor: 'pointer', color: '#9CA3AF', padding: '6px', borderRadius: '8px', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEE2E2'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Trash2 size={15} />
                  </button>

                  <div style={{
                    fontSize: '12px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', display: 'inline-block', marginBottom: '16px',
                    background: '#111827', color: '#C8F04A'
                  }}>
                    PLAN DAY #{idx + 1}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                    {/* Planned Date */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                        Planned Date <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="date"
                        value={day.plannedDate}
                        onChange={(e) => handleDayChange(idx, 'plannedDate', e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* Activity Type */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                        Activity Type <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <select
                        value={day.activityType}
                        onChange={(e) => handleDayChange(idx, 'activityType', e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13.5px', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                      >
                        <option value="FIELD_WORK">Field Work (Doctor Visits)</option>
                        <option value="MEETING">Team Meeting</option>
                        <option value="SEMINAR">Seminar / Conference</option>
                        <option value="OFFICE_WORK">Office / Admin Work</option>
                        <option value="TRAVEL">Transit / Travel</option>
                        <option value="LEAVE">Leave Day</option>
                      </select>
                    </div>

                    {/* Target Territory */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                        Target Territory {day.activityType === 'FIELD_WORK' && <span style={{ color: '#EF4444' }}>*</span>}
                      </label>
                      <input
                        type="text"
                        value={day.targetTerritory}
                        onChange={(e) => handleDayChange(idx, 'targetTerritory', e.target.value)}
                        placeholder="e.g. Chennai South, Ward 4"
                        required={day.activityType === 'FIELD_WORK'}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  {/* Planned Doctor Selections */}
                  {day.activityType === 'FIELD_WORK' && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                        Select Target Healthcare Professionals to Call
                      </label>
                      <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px',
                        maxHeight: '130px', overflowY: 'auto', background: '#fff', border: '1.5px solid #E5E7EB',
                        padding: '12px', borderRadius: '10px'
                      }}>
                        {doctorListOptions.map((doc) => {
                          const isChecked = day.plannedDoctorIds.includes(doc.id);
                          return (
                            <label key={doc.id} style={{
                              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px',
                              color: '#4B5563', cursor: 'pointer', padding: '4px 6px', borderRadius: '6px',
                              background: isChecked ? '#F9FAFB' : 'transparent', transition: 'background 0.15s'
                            }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleDoctorCheckboxChange(idx, doc.id, e.target.checked)}
                                style={{ width: '14px', height: '14px', accentColor: '#111827' }}
                              />
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <span style={{ fontWeight: 650, color: '#1F2937' }}>{doc.fullName}</span>
                                <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '4px' }}>({doc.speciality || 'GEN'})</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Day Remarks */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>Daily Objectives / Remarks</label>
                    <input
                      type="text"
                      value={day.remarks}
                      onChange={(e) => handleDayChange(idx, 'remarks', e.target.value)}
                      placeholder="e.g. Introduce cardiological visual aids, collect feedback on MR-Cardio"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add day button */}
            <button
              type="button"
              onClick={addDayField}
              style={{
                alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px',
                background: '#111827', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px',
                fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', transition: 'transform 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={14} /> Add Another Day Plan
            </button>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #F3F4F6', paddingTop: '20px', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={actionLoading}
                style={{
                  padding: '11px 22px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff',
                  color: '#374151', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                {actionLoading ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="button"
                onClick={(e) => handleSaveDraft(null, true)}
                disabled={actionLoading}
                style={{
                  padding: '11px 22px', borderRadius: '12px', border: 'none',
                  background: theme.primary, color: theme.textOnPrimary, fontWeight: 850, fontSize: '13px',
                  cursor: 'pointer', boxShadow: theme.shadow, transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = theme.hoverOpacity}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {actionLoading ? 'Submitting...' : 'Save & Submit Plan'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tour Plan Details Modal */}
      {detailModalOpen && currentTourPlan && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px',
          animation: 'fadeIn 0.2s'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '680px', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            animation: 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1.5px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', margin: 0 }}>Tour Plan Details</h3>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Plan ID: {currentTourPlan.id} • Month: {formatMonthLabel(currentTourPlan.targetMonth)}</span>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px',
                ...getStatusBadgeStyle(currentTourPlan.status)
              }}>{currentTourPlan.status}</span>
            </div>

            {/* Modal Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Manager remarks if reviewed */}
              {currentTourPlan.remarks && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Manager Feedback Remarks</div>
                  <div style={{ fontSize: '13px', color: '#78350F', marginTop: '4px', fontStyle: 'italic' }}>"{currentTourPlan.remarks}"</div>
                </div>
              )}

              {/* Day Schedules list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Planned Days ({currentTourPlan.planDays?.length || 0})</div>
                {currentTourPlan.planDays?.map((day, idx) => (
                  <div key={idx} style={{ border: '1.5px solid #F3F4F6', padding: '16px', borderRadius: '12px', background: '#FAFAFA' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        📅 {day.plannedDate}
                      </span>
                      <span style={{
                        fontSize: '10.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px',
                        background: '#111827', color: '#C8F04A'
                      }}>
                        {day.activityType.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '8px', borderTop: '1px solid #F3F4F6', paddingTop: '8px' }}>
                      <div>
                        <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Target Territory</div>
                        <div style={{ fontSize: '13px', color: '#374151', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} color="#9CA3AF" />
                          {day.targetTerritory || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Daily Objectives</div>
                        <div style={{ fontSize: '12.5px', color: '#4B5563', marginTop: '2px', fontStyle: day.remarks ? 'normal' : 'italic' }}>
                          {day.remarks || 'No remarks provided.'}
                        </div>
                      </div>
                    </div>

                    {day.activityType === 'FIELD_WORK' && day.plannedDoctorIds && day.plannedDoctorIds.length > 0 && (
                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '8px', marginTop: '8px' }}>
                        <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '4px' }}>Target Doctors ({day.plannedDoctorIds.length})</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {day.plannedDoctorIds.map((docId) => {
                            const doc = doctorListOptions.find(d => d.id === docId) || { fullName: `Dr. ID: ${docId}`, speciality: '' };
                            return (
                              <span key={docId} style={{
                                display: 'inline-flex', padding: '3px 8px', borderRadius: '6px',
                                background: '#E0E7FF', color: '#4F46E5', fontSize: '11px', fontWeight: 700
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

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1.5px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button
                onClick={() => setDetailModalOpen(false)}
                style={{
                  background: '#111827', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '12px',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer', outline: 'none'
                }}
              >
                Close Plan
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default MSETourPlanPage;

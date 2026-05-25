import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from '../../api/axiosInstance';
import { API_ROUTE } from '../../data/env';
import { ClipboardList, Plus, Trash2, CheckCircle2, AlertCircle, Calendar, Clock, MapPin, Eye, Send, Loader2 } from 'lucide-react';
import {
  fetchMyDcrsAction,
  saveDcrDraftAction,
  submitDcrAction,
  fetchDcrDetailsAction,
  clearDcrErrorsAction,
  clearDcrSuccessAction,
} from '../../redux/actions/dcrActions';

const MRDcrPage = () => {
  const dispatch = useDispatch();
  const { dcrs, loading: dcrLoading, error: dcrError, success: dcrSuccess, currentDcr } = useSelector((state) => state.dcr);

  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'
  const [doctors, setDoctors] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Local notification triggers
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // View modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Form State for logging new DCR
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [visits, setVisits] = useState([
    { doctorId: '', visitTime: '10:00', productsDiscussed: '', samplesGiven: '', feedback: '', isGpsVerified: true }
  ]);

  // Synchronize Redux Success Notifications
  useEffect(() => {
    if (dcrSuccess) {
      setSuccessMsg(dcrSuccess);
      const timer = setTimeout(() => {
        dispatch(clearDcrSuccessAction());
        setSuccessMsg(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [dcrSuccess, dispatch]);

  // Synchronize Redux Error Notifications
  useEffect(() => {
    if (dcrError) {
      setErrorMsg(dcrError);
      const timer = setTimeout(() => {
        dispatch(clearDcrErrorsAction());
        setErrorMsg(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [dcrError, dispatch]);

  // Fetch all MR's logged DCRs on mount
  useEffect(() => {
    dispatch(fetchMyDcrsAction());
    
    // Fetch doctors list
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${API_ROUTE}/doctor`);
        if (res.data && res.data.data) {
          setDoctors(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load doctors database, using fallback options.');
      }
    };
    fetchDoctors();
  }, [dispatch]);

  // Set local timeout helper to clear notices (for local validation errors)
  const triggerLocalNotification = (type, msg) => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // Form: Add visit card
  const addVisitField = () => {
    setVisits([
      ...visits,
      { doctorId: '', visitTime: '12:00', productsDiscussed: '', samplesGiven: '', feedback: '', isGpsVerified: true }
    ]);
  };

  // Form: Remove visit card
  const removeVisitField = (idx) => {
    if (visits.length === 1) {
      triggerLocalNotification('error', 'A DCR report must contain at least one doctor visit.');
      return;
    }
    setVisits(visits.filter((_, i) => i !== idx));
  };

  // Form: Field change handler
  const handleVisitChange = (idx, field, value) => {
    const updated = [...visits];
    updated[idx][field] = value;
    setVisits(updated);
  };

  // Form: Submit Draft
  const handleSaveDraft = async (e, andSubmit = false) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate fields
    const invalid = visits.some(v => !v.doctorId);
    if (invalid) {
      triggerLocalNotification('error', 'Please select a doctor for all listed visits.');
      return;
    }

    setActionLoading(true);
    try {
      const draftPayload = {
        reportDate,
        visits: visits.map(v => ({
          doctorId: parseInt(v.doctorId),
          visitTime: v.visitTime + ':00', // Format to HH:MM:SS
          productsDiscussed: v.productsDiscussed,
          samplesGiven: v.samplesGiven,
          feedback: v.feedback,
          isGpsVerified: v.isGpsVerified
        }))
      };

      // 1. Dispatch save action
      const res = await dispatch(saveDcrDraftAction(draftPayload));
      const createdDcr = res?.data || res;
      
      if (createdDcr && createdDcr.id) {
        const dcrId = createdDcr.id;

        // 2. If submit option chosen, dispatch submit action
        if (andSubmit) {
          await dispatch(submitDcrAction(dcrId));
          dispatch(fetchMyDcrsAction());
        } else {
          dispatch(fetchMyDcrsAction());
        }

        // Reset form
        setReportDate(new Date().toISOString().split('T')[0]);
        setVisits([{ doctorId: '', visitTime: '10:00', productsDiscussed: '', samplesGiven: '', feedback: '', isGpsVerified: true }]);
        setActiveTab('list');
      }
    } catch (err) {
      // Handled by dcrError reducer selector
    } finally {
      setActionLoading(false);
    }
  };

  // List: Submit existing draft
  const handleSubmitDcr = async (dcrId) => {
    setActionLoading(true);
    try {
      await dispatch(submitDcrAction(dcrId));
      dispatch(fetchMyDcrsAction());
    } catch (err) {
      // Handled by dcrError reducer selector
    } finally {
      setActionLoading(false);
    }
  };

  // List: Open detailed view modal
  const handleViewDcrDetails = async (dcrId) => {
    try {
      await dispatch(fetchDcrDetailsAction(dcrId));
      setDetailModalOpen(true);
    } catch (err) {
      triggerLocalNotification('error', 'Failed to retrieve DCR details.');
    }
  };

  // Helper: Status badge color styles
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

  // Fallback doctors list if API is empty
  const doctorListOptions = doctors.length > 0 ? doctors : [
    { id: 1, fullName: 'Dr. Ramesh Sharma', speciality: 'CARDIOLOGY', clinicName: 'City Heart Clinic' },
    { id: 2, fullName: 'Dr. Sunita Patel', speciality: 'PEDIATRICS', clinicName: 'Metro General Hospital' },
    { id: 3, fullName: 'Dr. Vivek Verma', speciality: 'ORTHOPEDICS', clinicName: 'Verma Ortho Care' },
    { id: 4, fullName: 'Dr. Neha Gupta', speciality: 'GENERAL PHYSICIAN', clinicName: 'Care Clinic' },
  ];

  return (
    <div style={{ animation: 'fadeSlideIn 0.35s ease-out' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            PORTAL: MEDICAL REPRESENTATIVE
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '4px 0 0 0' }}>Daily Call Reports (DCR)</h2>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '3px 0 0 0' }}>Log and track call visits submitted to your reporting manager.</p>
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
            background: activeTab === 'list' ? '#C8F04A' : '#fff',
            color: '#111827', fontWeight: 700, fontSize: '13.5px',
            boxShadow: activeTab === 'list' ? '0 4px 12px rgba(200, 240, 74, 0.25)' : 'none',
            border: activeTab === 'list' ? 'none' : '1px solid #E5E7EB',
            transition: 'all 0.2s', outline: 'none'
          }}
        >
          My DCR Logs
        </button>
        <button
          onClick={() => setActiveTab('new')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 22px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            background: activeTab === 'new' ? '#C8F04A' : '#fff',
            color: '#111827', fontWeight: 700, fontSize: '13.5px',
            boxShadow: activeTab === 'new' ? '0 4px 12px rgba(200, 240, 74, 0.25)' : 'none',
            border: activeTab === 'new' ? 'none' : '1px solid #E5E7EB',
            transition: 'all 0.2s', outline: 'none'
          }}
        >
          <Plus size={15} strokeWidth={2.5} /> Log New DCR Draft
        </button>
      </div>

      {/* Content wrapper */}
      <div style={{ background: '#fff', borderRadius: '20px', border: '1.5px solid #F3F4F6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '28px' }}>
        
        {/* Tab 1: Logs list */}
        {activeTab === 'list' && (
          dcrLoading && dcrs.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', gap: '12px' }}>
              <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', color: '#111827' }} />
              <span style={{ fontSize: '13.5px', color: '#9CA3AF' }}>Loading call reports...</span>
            </div>
          ) : dcrs.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#9CA3AF' }}>
              <ClipboardList size={40} style={{ margin: '0 auto 12px auto', strokeWidth: 1.5 }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No Daily Call Reports logged yet.</p>
              <button
                onClick={() => setActiveTab('new')}
                style={{ marginTop: '14px', background: '#111827', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
              >
                Log Your First Call
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #F3F4F6' }}>
                    {['Report Date', 'Total Visits', 'Status', 'Manager Remarks', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dcrs.map((dcr) => {
                    const statusStyle = getStatusBadgeStyle(dcr.status);
                    return (
                      <tr key={dcr.id} style={{ borderBottom: '1px solid #FAFAFA', transition: 'background 0.15s' }}>
                        {/* Date */}
                        <td style={{ padding: '16px 16px', fontSize: '13.5px', fontWeight: 700, color: '#1F2937' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} color="#9CA3AF" />
                            {dcr.reportDate}
                          </span>
                        </td>
                        {/* Visit count */}
                        <td style={{ padding: '16px 16px', fontSize: '13.5px', color: '#4B5563', fontWeight: 600 }}>
                          {dcr.visits?.length || 0} Doctor{dcr.visits?.length !== 1 ? 's' : ''} visited
                        </td>
                        {/* Status */}
                        <td style={{ padding: '16px 16px' }}>
                          <span style={{
                            display: 'inline-flex', padding: '4px 10px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: 800, ...statusStyle
                          }}>
                            {dcr.status}
                          </span>
                        </td>
                        {/* Remarks */}
                        <td style={{ padding: '16px 16px', fontSize: '13px', color: '#6B7280', fontStyle: 'italic', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {dcr.remarks || '—'}
                        </td>
                        {/* Actions */}
                        <td style={{ padding: '16px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => handleViewDcrDetails(dcr.id)}
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
                              <Eye size={12} /> View
                            </button>
                            {dcr.status === 'DRAFT' && (
                              <button
                                onClick={() => handleSubmitDcr(dcr.id)}
                                disabled={actionLoading}
                                title="Submit report to manager"
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '4px',
                                  background: '#C8F04A', border: 'none', padding: '6px 12px', borderRadius: '8px',
                                  cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#111827',
                                  transition: 'opacity 0.15s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
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

        {/* Tab 2: New DCR Draft */}
        {activeTab === 'new' && (
          <form onSubmit={(e) => handleSaveDraft(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #F3F4F6', paddingBottom: '20px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>Create Daily Call Log</h4>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0 0' }}>Record visited healthcare professionals and samples distributed today.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Report Date:</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  required
                  style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13.5px', outline: 'none' }}
                />
              </div>
            </div>

            {/* Visits list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {visits.map((visit, idx) => (
                <div key={idx} style={{
                  padding: '24px', border: '1px solid #E5E7EB', borderRadius: '16px', background: '#FAFAFA',
                  position: 'relative', animation: 'fadeIn 0.25s'
                }}>
                  {/* Remove visit button */}
                  <button
                    type="button"
                    onClick={() => removeVisitField(idx)}
                    style={{
                      position: 'absolute', right: '16px', top: '16px', background: 'transparent', border: 'none',
                      cursor: 'pointer', color: '#9CA3AF', padding: '6px', borderRadius: '8px', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEE2E2'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Trash2 size={15} />
                  </button>

                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#C8F04A', background: '#111827', padding: '3px 8px', borderRadius: '6px', display: 'inline-block', marginBottom: '16px' }}>
                    CALL VISIT #{idx + 1}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                    {/* Doctor selection */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                        Select Doctor <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <select
                        value={visit.doctorId}
                        onChange={(e) => handleVisitChange(idx, 'doctorId', e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13.5px', background: '#fff', outline: 'none' }}
                      >
                        <option value="">Choose healthcare professional...</option>
                        {doctorListOptions.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.fullName} ({doc.speciality || 'GENERAL'}) - {doc.clinicName || doc.hospitalName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Visit time */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                        Visit Call Time <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="time"
                          value={visit.visitTime}
                          onChange={(e) => handleVisitChange(idx, 'visitTime', e.target.value)}
                          required
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13.5px', outline: 'none' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                    {/* Products discussed */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>Products Promoted</label>
                      <input
                        type="text"
                        value={visit.productsDiscussed}
                        onChange={(e) => handleVisitChange(idx, 'productsDiscussed', e.target.value)}
                        placeholder="e.g. Cardace 5mg, Lipvas 10mg"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13.5px', outline: 'none' }}
                      />
                    </div>
                    {/* Samples given */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>Samples / Literature Distributed</label>
                      <input
                        type="text"
                        value={visit.samplesGiven}
                        onChange={(e) => handleVisitChange(idx, 'samplesGiven', e.target.value)}
                        placeholder="e.g. Cardace (10 Tabs), Visual Aid brochures"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13.5px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* Feedback */}
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151' }}>Doctor Feedback / Notes</label>
                    <textarea
                      value={visit.feedback}
                      onChange={(e) => handleVisitChange(idx, 'feedback', e.target.value)}
                      placeholder="Enter detailed feedback or follow-up notes..."
                      style={{ width: '100%', height: '70px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13.5px', resize: 'none', outline: 'none' }}
                    />
                  </div>

                  {/* GPS checkbox */}
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={visit.isGpsVerified}
                        onChange={(e) => handleVisitChange(idx, 'isGpsVerified', e.target.checked)}
                        style={{ width: '15px', height: '15px', accentColor: '#111827' }}
                      />
                      GPS Verified Visit Coordinates (Automatic check)
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Add visit button */}
            <button
              type="button"
              onClick={addVisitField}
              style={{
                alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px',
                background: '#111827', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px',
                fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', transition: 'transform 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={14} /> Add Another Visit Log
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
                onClick={() => handleSaveDraft(null, true)}
                disabled={actionLoading}
                style={{
                  padding: '11px 22px', borderRadius: '12px', border: 'none', background: '#C8F04A',
                  color: '#111827', fontWeight: 800, fontSize: '13px', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(200, 240, 74, 0.2)', transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {actionLoading ? 'Submitting...' : 'Save & Submit report'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* DCR Details Modal */}
      {detailModalOpen && currentDcr && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px',
          animation: 'fadeIn 0.2s'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '640px', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            animation: 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1.5px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', margin: 0 }}>DCR Call Log Details</h3>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Report ID: {currentDcr.id} • Date: {currentDcr.reportDate}</span>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px',
                ...getStatusBadgeStyle(currentDcr.status)
              }}>{currentDcr.status}</span>
            </div>

            {/* Modal Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Manager remarks if reviewed */}
              {currentDcr.remarks && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Manager Feedback Remarks</div>
                  <div style={{ fontSize: '13px', color: '#78350F', marginTop: '4px', fontStyle: 'italic' }}>"{currentDcr.remarks}"</div>
                </div>
              )}

              {/* Visits list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Visit Logs ({currentDcr.visits?.length || 0})</div>
                {currentDcr.visits?.map((visit, index) => {
                  const doc = doctorListOptions.find(d => d.id === visit.doctorId) || { fullName: `Doctor ID: ${visit.doctorId}`, speciality: '', clinicName: '' };
                  return (
                    <div key={index} style={{ border: '1.5px solid #F3F4F6', padding: '16px', borderRadius: '12px', background: '#FAFAFA' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>{doc.fullName}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
                          <Clock size={12} color="#9CA3AF" />
                          {visit.visitTime ? visit.visitTime.slice(0, 5) : '—'}
                        </span>
                      </div>
                      
                      {doc.speciality && (
                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px' }}>
                          Specialty: <span style={{ color: '#4B5563', fontWeight: 600 }}>{doc.speciality}</span> • Clinic: <span style={{ color: '#4B5563', fontWeight: 600 }}>{doc.clinicName || 'N/A'}</span>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px', borderTop: '1px solid #F3F4F6', paddingTop: '8px' }}>
                        <div>
                          <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Promoted Products</div>
                          <div style={{ fontSize: '12.5px', color: '#374151', fontWeight: 500, marginTop: '2px' }}>{visit.productsDiscussed || '—'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Distributed Samples</div>
                          <div style={{ fontSize: '12.5px', color: '#374151', fontWeight: 500, marginTop: '2px' }}>{visit.samplesGiven || '—'}</div>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '8px' }}>
                        <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Feedback Details</div>
                        <div style={{ fontSize: '12.5px', color: '#4B5563', marginTop: '2px', fontStyle: visit.feedback ? 'normal' : 'italic' }}>
                          {visit.feedback || 'No feedback details logged.'}
                        </div>
                      </div>

                      {visit.isGpsVerified && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ECFDF5', color: '#047857', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 750, marginTop: '10px' }}>
                          <MapPin size={10} /> GPS COORDINATES RECORDED
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1.5px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                }}
                style={{
                  background: '#111827', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '12px',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer', outline: 'none'
                }}
              >
                Close Report
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

export default MRDcrPage;

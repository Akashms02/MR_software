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
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]';
      case 'REJECTED':
        return 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]';
      case 'SUBMITTED':
        return 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]';
      default: // DRAFT
        return 'bg-[#F3F4F6] text-[#4B5563] border border-[#D1D5DB]';
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
    <div className="animate-[fadeSlideIn_0.35s_ease-out]">
      {/* Header section */}
      <div className="flex justify-between items-center mb-7">
        <div>
          <span className="text-[11px] text-[#9CA3AF] font-extrabold uppercase tracking-wider">
            PORTAL: MEDICAL REPRESENTATIVE
          </span>
          <h2 className="text-[24px] font-extrabold text-[#111827] mt-1 mb-0">Daily Call Reports (DCR)</h2>
          <p className="text-[13px] text-[#6B7280] mt-[3px] mb-0">Log and track call visits submitted to your reporting manager.</p>
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
          My DCR Logs
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`flex items-center gap-1.5 px-[22px] py-2.5 rounded-xl border-none cursor-pointer text-[13.5px] font-bold transition-all duration-200 outline-none ${
            activeTab === 'new' 
              ? 'bg-[#C8F04A] text-[#111827] shadow-[0_4px_12px_rgba(200,240,74,0.25)] border-none' 
              : 'bg-white text-[#111827] border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Plus size={15} strokeWidth={2.5} /> Log New DCR Draft
        </button>
      </div>

      {/* Content wrapper */}
      <div className="bg-white rounded-[20px] border-[1.5px] border-[#F3F4F6] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-7">
        
        {/* Tab 1: Logs list */}
        {activeTab === 'list' && (
          dcrLoading && dcrs.length === 0 ? (
            <div className="flex flex-col items-center p-[60px] gap-3">
              <Loader2 size={24} className="animate-spin text-[#111827]" />
              <span className="text-[13.5px] text-[#9CA3AF]">Loading call reports...</span>
            </div>
          ) : dcrs.length === 0 ? (
            <div className="p-[60px] text-center text-[#9CA3AF]">
              <ClipboardList size={40} className="mx-auto mb-3 stroke-[1.5]" />
              <p className="m-0 text-[14px] font-medium">No Daily Call Reports logged yet.</p>
              <button
                onClick={() => setActiveTab('new')}
                className="mt-3.5 bg-[#111827] text-white border-none px-4 py-2 rounded-lg font-bold text-[12.5px] cursor-pointer hover:bg-gray-800 transition-colors duration-150"
              >
                Log Your First Call
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-[1.5px] border-[#F3F4F6]">
                    {['Report Date', 'Total Visits', 'Status', 'Manager Remarks', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[11.5px] font-extrabold text-[#9CA3AF] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dcrs.map((dcr) => {
                    return (
                      <tr key={dcr.id} className="border-b border-[#FAFAFA] hover:bg-gray-50/50 transition-colors duration-150">
                        {/* Date */}
                        <td className="px-4 py-4 text-[13.5px] font-bold text-[#1F2937]">
                          <span className="flex items-center gap-2">
                            <Calendar size={14} className="text-[#9CA3AF]" />
                            {dcr.reportDate}
                          </span>
                        </td>
                        {/* Visit count */}
                        <td className="px-4 py-4 text-[13.5px] text-[#4B5563] font-semibold">
                          {dcr.visits?.length || 0} Doctor{dcr.visits?.length !== 1 ? 's' : ''} visited
                        </td>
                        {/* Status */}
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-extrabold ${getStatusBadgeClass(dcr.status)}`}>
                            {dcr.status}
                          </span>
                        </td>
                        {/* Remarks */}
                        <td className="px-4 py-4 text-[13px] text-[#6B7280] italic max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {dcr.remarks || '—'}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => handleViewDcrDetails(dcr.id)}
                              title="View Details"
                              className="flex items-center gap-1 bg-[#F3F4F6] border-none px-3 py-1.5 rounded-lg cursor-pointer text-[12px] font-bold text-[#374151] hover:bg-[#E5E7EB] transition-colors duration-150"
                            >
                              <Eye size={12} /> View
                            </button>
                            {dcr.status === 'DRAFT' && (
                              <button
                                onClick={() => handleSubmitDcr(dcr.id)}
                                disabled={actionLoading}
                                title="Submit report to manager"
                                className="flex items-center gap-1 bg-[#C8F04A] border-none px-3 py-1.5 rounded-lg cursor-pointer text-[12px] font-bold text-[#111827] hover:opacity-90 transition-opacity duration-150"
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
          <form onSubmit={(e) => handleSaveDraft(e, false)} className="flex flex-col gap-6">
            <div className="flex justify-between items-start flex-wrap gap-4 border-b border-[#F3F4F6] pb-5">
              <div>
                <h4 className="text-[16px] font-extrabold text-[#111827] margin-0">Create Daily Call Log</h4>
                <p className="text-[12px] text-[#6B7280] mt-[2px] mb-0">Record visited healthcare professionals and samples distributed today.</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[13px] font-bold text-[#374151]">Report Date:</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  required
                  className="px-3 py-2 rounded-xl border border-gray-200 text-[13.5px] outline-none font-sans"
                />
              </div>
            </div>

            {/* Visits list */}
            <div className="flex flex-col gap-5">
              {visits.map((visit, idx) => (
                <div key={idx} className="p-6 border border-gray-200 rounded-2xl bg-[#FAFAFA] relative animate-[fadeIn_0.25s]">
                  {/* Remove visit button */}
                  <button
                    type="button"
                    onClick={() => removeVisitField(idx)}
                    className="absolute right-4 top-4 bg-transparent border-none cursor-pointer text-[#9CA3AF] p-1.5 rounded-lg hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-all duration-200"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="text-[12px] font-extrabold text-[#C8F04A] bg-[#111827] px-2 py-1 rounded-md inline-block mb-4">
                    CALL VISIT #{idx + 1}
                  </div>

                  <div className="grid grid-cols-2 gap-5 mb-4">
                    {/* Doctor selection */}
                    <div>
                      <label className="block text-[12px] font-bold text-[#374151] mb-1.5">
                        Select Doctor <span className="text-[#EF4444]">*</span>
                      </label>
                      <select
                        value={visit.doctorId}
                        onChange={(e) => handleVisitChange(idx, 'doctorId', e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] bg-white outline-none font-sans"
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
                      <label className="block text-[12px] font-bold text-[#374151] mb-1.5">
                        Visit Call Time <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="time"
                        value={visit.visitTime}
                        onChange={(e) => handleVisitChange(idx, 'visitTime', e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] outline-none font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5 mb-4">
                    {/* Products discussed */}
                    <div>
                      <label className="block text-[12px] font-bold text-[#374151] mb-1.5">Products Promoted</label>
                      <input
                        type="text"
                        value={visit.productsDiscussed}
                        onChange={(e) => handleVisitChange(idx, 'productsDiscussed', e.target.value)}
                        placeholder="e.g. Cardace 5mg, Lipvas 10mg"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] outline-none font-sans"
                      />
                    </div>
                    {/* Samples given */}
                    <div>
                      <label className="block text-[12px] font-bold text-[#374151] mb-1.5">Samples / Literature Distributed</label>
                      <input
                        type="text"
                        value={visit.samplesGiven}
                        onChange={(e) => handleVisitChange(idx, 'samplesGiven', e.target.value)}
                        placeholder="e.g. Cardace (10 Tabs), Visual Aid brochures"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] outline-none font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {/* Feedback */}
                    <label className="block text-[12px] font-bold text-[#374151]">Doctor Feedback / Notes</label>
                    <textarea
                      value={visit.feedback}
                      onChange={(e) => handleVisitChange(idx, 'feedback', e.target.value)}
                      placeholder="Enter detailed feedback or follow-up notes..."
                      className="w-full h-[70px] px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] resize-none outline-none font-sans"
                    />
                  </div>

                  {/* GPS checkbox */}
                  <div className="mt-3">
                    <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4B5563] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visit.isGpsVerified}
                        onChange={(e) => handleVisitChange(idx, 'isGpsVerified', e.target.checked)}
                        className="w-4 h-4 accent-gray-900"
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
              className="self-start flex items-center gap-1.5 bg-[#111827] text-white border-none px-4.5 py-2.5 rounded-xl font-bold text-[12.5px] cursor-pointer transition-transform hover:-translate-y-[1px]"
            >
              <Plus size={14} /> Add Another Visit Log
            </button>

            {/* Action buttons */}
            <div className="flex gap-3 justify-end border-t border-[#F3F4F6] pt-5 mt-2.5">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-[22px] py-2.5 rounded-xl border border-gray-200 bg-white text-[#374151] font-bold text-[13px] cursor-pointer hover:bg-gray-50 transition-colors duration-150"
              >
                {actionLoading ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveDraft(null, true)}
                disabled={actionLoading}
                className="px-[22px] py-2.5 rounded-xl border-none bg-[#C8F04A] text-[#111827] font-extrabold text-[13px] cursor-pointer shadow-[0_4px_12px_rgba(200,240,74,0.2)] hover:opacity-90 transition-opacity duration-150"
              >
                {actionLoading ? 'Submitting...' : 'Save & Submit report'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* DCR Details Modal */}
      {detailModalOpen && currentDcr && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-[6px] flex items-center justify-center z-[1100] p-5 animate-[fadeIn_0.2s]">
          <div className="bg-white rounded-3xl w-full max-w-[640px] max-h-[85vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-[scaleIn_0.2s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b-[1.5px] border-[#F3F4F6] flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-[17px] font-extrabold text-[#111827] margin-0">DCR Call Log Details</h3>
                <span className="text-[12px] text-[#9CA3AF]">Report ID: {currentDcr.id} • Date: {currentDcr.reportDate}</span>
              </div>
              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${getStatusBadgeClass(currentDcr.status)}`}>
                {currentDcr.status}
              </span>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              {/* Manager remarks if reviewed */}
              {currentDcr.remarks && (
                <div className="bg-[#FFFBEB] border border-[#FDE68A] p-3.5 rounded-xl">
                  <div className="text-[11px] font-extrabold text-[#B45309] uppercase tracking-wider">Manager Feedback Remarks</div>
                  <div className="text-[13px] text-[#78350F] mt-1 italic">"{currentDcr.remarks}"</div>
                </div>
              )}

              {/* Visits list */}
              <div className="flex flex-col gap-3.5">
                <div className="text-[12px] font-extrabold text-[#9CA3AF] uppercase tracking-wider">Visit Logs ({currentDcr.visits?.length || 0})</div>
                {currentDcr.visits?.map((visit, index) => {
                  const doc = doctorListOptions.find(d => d.id === visit.doctorId) || { fullName: `Doctor ID: ${visit.doctorId}`, speciality: '', clinicName: '' };
                  return (
                    <div key={index} className="border-[1.5px] border-[#F3F4F6] p-4 rounded-xl bg-[#FAFAFA]">
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="text-[14px] font-bold text-[#1F2937]">{doc.fullName}</span>
                        <span className="flex items-center gap-1 text-[12px] text-[#6B7280] font-semibold">
                          <Clock size={12} className="text-[#9CA3AF]" />
                          {visit.visitTime ? visit.visitTime.slice(0, 5) : '—'}
                        </span>
                      </div>
                      
                      {doc.speciality && (
                        <div className="text-[11px] text-[#9CA3AF] mb-2">
                          Specialty: <span className="text-[#4B5563] font-semibold">{doc.speciality}</span> • Clinic: <span className="text-[#4B5563] font-semibold">{doc.clinicName || 'N/A'}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 mb-2.5 border-t border-[#F3F4F6] pt-2">
                        <div>
                          <div className="text-[10.5px] font-bold text-[#9CA3AF] uppercase">Promoted Products</div>
                          <div className="text-[12.5px] text-[#374151] font-medium mt-0.5">{visit.productsDiscussed || '—'}</div>
                        </div>
                        <div>
                          <div className="text-[10.5px] font-bold text-[#9CA3AF] uppercase">Distributed Samples</div>
                          <div className="text-[12.5px] text-[#374151] font-medium mt-0.5">{visit.samplesGiven || '—'}</div>
                        </div>
                      </div>

                      <div className="border-t border-[#F3F4F6] pt-2">
                        <div className="text-[10.5px] font-bold text-[#9CA3AF] uppercase">Feedback Details</div>
                        <div className={`text-[12.5px] text-[#4B5563] mt-0.5 ${visit.feedback ? '' : 'italic'}`}>
                          {visit.feedback || 'No feedback details logged.'}
                        </div>
                      </div>

                      {visit.isGpsVerified && (
                        <div className="inline-flex items-center gap-1 bg-[#ECFDF5] text-[#047857] px-2 py-1 rounded text-[10.5px] font-extrabold mt-2.5">
                          <MapPin size={10} /> GPS COORDINATES RECORDED
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t-[1.5px] border-[#F3F4F6] flex justify-end shrink-0">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="bg-[#111827] text-white border-none px-[22px] py-2.5 rounded-xl font-bold text-[13px] cursor-pointer outline-none hover:bg-gray-800 transition-colors duration-155"
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

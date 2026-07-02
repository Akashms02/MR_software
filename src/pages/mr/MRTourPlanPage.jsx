import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
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
import Pagination from '../../components/common/Pagination';

const MRTourPlanPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { tourPlans, loading, error, success, currentTourPlan } = useSelector((state) => state.tourPlan);

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'list'); // 'list' or 'new'
  const [doctors, setDoctors] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Reset page when switching tabs
  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab]);
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
    { plannedDate: '', targetTerritory: '', activityType: 'FIELD_WORK' }
  ]);

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
      { plannedDate: nextDateStr, targetTerritory: '', activityType: 'FIELD_WORK' }
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
          activityType: d.activityType
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
        setPlanDays([{ plannedDate: '', targetTerritory: '', activityType: 'FIELD_WORK' }]);
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
          My Tour Plans
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`flex items-center gap-1.5 px-[22px] py-2.5 rounded-xl border-none cursor-pointer text-[13.5px] font-bold transition-all duration-200 outline-none ${
            activeTab === 'new' 
              ? 'bg-[#C8F04A] text-[#111827] shadow-[0_4px_12px_rgba(200,240,74,0.25)] border-none' 
              : 'bg-white text-[#111827] border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Plus size={15} strokeWidth={2.5} /> Set Monthly Plan
        </button>
      </div>

      {/* Content wrapper */}
      <div className="bg-white rounded-[20px] border-[1.5px] border-[#F3F4F6] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
        
        {/* Tab 1: Tour Plans List */}
        {activeTab === 'list' && (
          loading && tourPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-3">
              <Loader2 size={24} className="animate-spin text-[#111827]" />
              <span className="text-[13.5px] text-[#9CA3AF]">Loading tour plans...</span>
            </div>
          ) : tourPlans.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-[#9CA3AF]">
              <ClipboardList size={40} className="mx-auto mb-3 stroke-[1.5]" />
              <p className="m-0 text-[14px] font-medium">No monthly tour plans created yet.</p>
              <button
                onClick={() => setActiveTab('new')}
                className="mt-3.5 bg-[#C8F04A] text-[#111827] border-none px-4 py-2.5 rounded-lg font-bold text-[12.5px] cursor-pointer shadow-[0_4px_12px_rgba(200,240,74,0.25)] hover:opacity-90 transition-all duration-200"
              >
                Schedule First Tour Plan
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b-[1.5px] border-[#F3F4F6] sticky top-0 bg-white z-[10]">
                      {['Target Month', 'Total Days', 'Status', 'Manager Remarks', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-[11.5px] font-extrabold text-[#9CA3AF] uppercase tracking-wider bg-white sticky top-0">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tourPlans.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((plan) => {
                      return (
                        <tr key={plan.id} className="border-b border-[#FAFAFA] hover:bg-gray-50/50 transition-colors duration-150">
                          {/* Month */}
                          <td className="px-4 py-4 text-[13.5px] font-bold text-[#1F2937]">
                            <span className="flex items-center gap-2">
                              <Calendar size={14} className="text-[#9CA3AF]" />
                              {formatMonthLabel(plan.targetMonth)}
                            </span>
                          </td>
                          {/* Total Days */}
                          <td className="px-4 py-4 text-[13.5px] text-[#4B5563] font-semibold">
                            {plan.planDays?.length || 0} Day{plan.planDays?.length !== 1 ? 's' : ''} scheduled
                          </td>
                          {/* Status */}
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${getStatusBadgeClass(plan.status)}`}>
                              {plan.status}
                            </span>
                          </td>
                          {/* Remarks */}
                          <td className="px-4 py-4 text-[13px] text-[#6B7280] italic max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap">
                            {plan.remarks || '—'}
                          </td>
                          {/* Actions */}
                          <td className="px-4 py-4">
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={() => handleViewPlanDetails(plan.id)}
                                title="View Details"
                                className="flex items-center gap-1 bg-[#F3F4F6] border-none px-3 py-1.5 rounded-lg cursor-pointer text-[12px] font-bold text-[#374151] hover:bg-[#E5E7EB] transition-colors duration-150"
                              >
                                <Eye size={12} /> Details
                              </button>
                              {plan.status === 'DRAFT' && (
                                <button
                                  onClick={() => handleSubmitExistingDraft(plan.id)}
                                  disabled={actionLoading}
                                  title="Submit tour plan for review"
                                  className="flex items-center gap-1 border-none px-3 py-1.5 rounded-lg cursor-pointer text-[12px] font-bold bg-[#C8F04A] text-[#111827] hover:opacity-90 transition-opacity duration-150"
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

              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(tourPlans.length / pageSize)}
                totalElements={tourPlans.length}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
                isLoading={loading}
                activeBtnClass="bg-[#C8F04A] text-[#111827]"
              />
            </div>
          )
        )}

        {/* Tab 2: Create New Tour Plan */}
        {activeTab === 'new' && (
          <form onSubmit={(e) => handleSaveDraft(e, false)} className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-start flex-wrap gap-4 border-b border-[#F3F4F6] pb-4 mb-4 shrink-0">
              <div>
                <h4 className="text-[16px] font-extrabold text-[#111827] margin-0">Create Monthly Tour Schedule</h4>
                <p className="text-[12px] text-[#6B7280] mt-[2px] mb-0">Plan daily work routes, hospital call visits and seminars in advance.</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[13px] font-bold text-[#374151]">Target Month:</label>
                <input
                  type="month"
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(e.target.value)}
                  required
                  className="px-3 py-2 rounded-xl border border-gray-200 text-[13.5px] outline-none font-sans"
                />
              </div>
            </div>

            {/* Plan Days Cards */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 mb-4">
              {planDays.map((day, idx) => (
                <div key={idx} className="p-6 border border-gray-200 rounded-2xl bg-[#FAFAFA] relative animate-[fadeIn_0.25s]">
                  {/* Remove card button */}
                  <button
                    type="button"
                    onClick={() => removeDayField(idx)}
                    className="absolute right-4 top-4 bg-transparent border-none cursor-pointer text-[#9CA3AF] p-1.5 rounded-lg hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-all duration-200"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="text-[12px] font-extrabold bg-[#111827] text-[#C8F04A] px-2 py-1 rounded-md inline-block mb-4">
                    PLAN DAY #{idx + 1}
                  </div>

                  <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-5 mb-4">
                    {/* Planned Date */}
                    <div>
                      <label className="block text-[12px] font-bold text-[#374151] mb-1.5">
                        Planned Date <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="date"
                        value={day.plannedDate}
                        onChange={(e) => handleDayChange(idx, 'plannedDate', e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] outline-none box-border font-sans"
                      />
                    </div>

                    {/* Activity Type */}
                    <div>
                      <label className="block text-[12px] font-bold text-[#374151] mb-1.5">
                        Activity Type <span className="text-[#EF4444]">*</span>
                      </label>
                      <select
                        value={day.activityType}
                        onChange={(e) => handleDayChange(idx, 'activityType', e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] bg-white outline-none box-border font-sans"
                      >
                        <option value="FIELD_WORK">Field Work</option>
                        <option value="OFFICE_WORK">Office Work</option>
                        <option value="MEETING">Meeting</option>
                        <option value="SEMINAR">Seminar</option>
                        <option value="TRAVEL">Travel</option>
                        <option value="CONFERENCE">Conference</option>
                        <option value="HOLIDAY">Holiday</option>
                        <option value="LEAVE">Leave</option>
                        <option value="TRAINING">Training</option>
                      </select>
                    </div>

                    {/* Target Territory */}
                    <div>
                      <label className="block text-[12px] font-bold text-[#374151] mb-1.5">
                        Target Territory {day.activityType === 'FIELD_WORK' && <span className="text-[#EF4444]">*</span>}
                      </label>
                      <input
                        type="text"
                        value={day.targetTerritory}
                        onChange={(e) => handleDayChange(idx, 'targetTerritory', e.target.value)}
                        placeholder="e.g. Chennai South, Ward 4"
                        required={day.activityType === 'FIELD_WORK'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] outline-none box-border font-sans"
                      />
                    </div>
                  </div>




                </div>
              ))}
            </div>

            {/* Bottom Actions Row */}
            <div className="flex justify-between items-center border-t border-[#F3F4F6] pt-4 mt-auto shrink-0">
              <button
                type="button"
                onClick={addDayField}
                className="flex items-center gap-1.5 bg-[#111827] text-white border-none px-4.5 py-2.5 rounded-xl font-bold text-[12.5px] cursor-pointer transition-transform hover:-translate-y-[1px]"
              >
                <Plus size={14} /> Add Another Day Plan
              </button>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-[22px] py-2.5 rounded-xl border border-gray-200 bg-white text-[#374151] font-bold text-[13px] cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                >
                  {actionLoading ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveDraft(null, true)}
                  disabled={actionLoading}
                  className="px-[22px] py-2.5 rounded-xl border-none bg-[#C8F04A] text-[#111827] font-extrabold text-[13px] cursor-pointer shadow-[0_4px_12px_rgba(200,240,74,0.25)] hover:opacity-90 transition-opacity duration-150"
                >
                  {actionLoading ? 'Submitting...' : 'Save & Submit Plan'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Tour Plan Details Modal */}
      {detailModalOpen && currentTourPlan && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-[6px] flex items-center justify-center z-[1100] p-5 animate-[fadeIn_0.2s]">
          <div className="bg-white rounded-3xl w-full max-w-[680px] max-h-[85vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-[scaleIn_0.2s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b-[1.5px] border-[#F3F4F6] flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-[17px] font-extrabold text-[#111827] margin-0">Tour Plan Details</h3>
                <span className="text-[12px] text-[#9CA3AF]">Plan ID: {currentTourPlan.id} • Month: {formatMonthLabel(currentTourPlan.targetMonth)}</span>
              </div>
              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${getStatusBadgeClass(currentTourPlan.status)}`}>
                {currentTourPlan.status}
              </span>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              {/* Manager remarks if reviewed */}
              {currentTourPlan.remarks && (
                <div className="bg-[#FFFBEB] border border-[#FDE68A] p-3.5 rounded-xl">
                  <div className="text-[11px] font-extrabold text-[#B45309] uppercase tracking-wider">Manager Feedback Remarks</div>
                  <div className="text-[13px] text-[#78350F] mt-1 italic">"{currentTourPlan.remarks}"</div>
                </div>
              )}

              {/* Day Schedules list */}
              <div className="flex flex-col gap-3.5">
                <div className="text-[12px] font-extrabold text-[#9CA3AF] uppercase tracking-wider">Planned Days ({currentTourPlan.planDays?.length || 0})</div>
                {currentTourPlan.planDays?.map((day, idx) => (
                  <div key={idx} className="border-[1.5px] border-[#F3F4F6] p-4 rounded-xl bg-[#FAFAFA]">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[14px] font-bold text-[#1F2937] flex items-center gap-1.5">
                        📅 {day.plannedDate}
                      </span>
                      <span className="text-[10.5px] font-extrabold px-2 py-1 rounded bg-[#111827] text-[#C8F04A]">
                        {day.activityType.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mb-2 border-t border-[#F3F4F6] pt-2">
                      <div>
                        <div className="text-[10.5px] font-bold text-[#9CA3AF] uppercase">Target Territory</div>
                        <div className="text-[13px] color-[#374151] font-semibold mt-0.5 flex items-center gap-1">
                          <MapPin size={12} className="text-[#9CA3AF]" />
                          {day.targetTerritory || 'N/A'}
                        </div>
                      </div>
                    </div>


                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t-[1.5px] border-[#F3F4F6] flex justify-end shrink-0">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="bg-[#111827] text-white border-none px-[22px] py-2.5 rounded-xl font-bold text-[13px] cursor-pointer outline-none"
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

export default MRTourPlanPage;

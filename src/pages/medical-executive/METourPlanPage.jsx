import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from '../../api/axiosInstance';
import { API_ROUTE } from '../../data/env';
import { Calendar, MapPin, Plus, Trash2, CheckCircle2, AlertCircle, Eye, Send, Loader2, ClipboardList } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
  fetchMyTourPlansAction,
  saveTourPlanDraftAction,
  submitTourPlanAction,
  fetchTourPlanDetailsAction,
  clearTourPlanErrorsAction,
  clearTourPlanSuccessAction,
} from '../../redux/actions/tourPlanActions';
import Pagination from '../../components/common/Pagination';

const METourPlanPage = () => {
  const dispatch = useDispatch();
  const { tourPlans, loading, error, success, currentTourPlan } = useSelector((state) => state.tourPlan);

  const [activeTab, setActiveTab] = useState('list');
  const [doctors, setDoctors] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Reset page when switching tabs
  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab]);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();
  const [errorMsg, _setErrorMsg] = useState(null);
  const [successMsg, _setSuccessMsg] = useState(null);

  const setSuccessMsg = (msg) => {
    _setSuccessMsg(msg);
    if (msg) showToast(msg, 'success');
  };
  const setErrorMsg = (msg) => {
    _setErrorMsg(msg);
    if (msg) showToast(msg, 'error');
  };
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [targetMonth, setTargetMonth] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().slice(0, 7);
  });
  const [planDays, setPlanDays] = useState([
    { plannedDate: '', targetTerritory: '', activityType: 'FIELD_WORK' }
  ]);

  // ME theme: Indigo
  const primaryColor = '#4F46E5';
  const primaryShadow = '0 4px 12px rgba(79, 70, 229, 0.25)';

  useEffect(() => {
    if (success) {
      setSuccessMsg(success);
      const timer = setTimeout(() => { dispatch(clearTourPlanSuccessAction()); setSuccessMsg(null); }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      setErrorMsg(error);
      const timer = setTimeout(() => { dispatch(clearTourPlanErrorsAction()); setErrorMsg(null); }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    dispatch(fetchMyTourPlansAction());
  }, [dispatch]);

  const triggerLocalNotification = (type, msg) => {
    if (type === 'success') { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 4000); }
    else { setErrorMsg(msg); setTimeout(() => setErrorMsg(null), 4000); }
  };

  const addDayField = () => {
    let nextDateStr = '';
    if (planDays.length > 0) {
      const lastDate = planDays[planDays.length - 1].plannedDate;
      if (lastDate) { const d = new Date(lastDate); d.setDate(d.getDate() + 1); nextDateStr = d.toISOString().split('T')[0]; }
    }
    setPlanDays([...planDays, { plannedDate: nextDateStr, targetTerritory: '', activityType: 'FIELD_WORK' }]);
  };

  const removeDayField = (idx) => {
    if (planDays.length === 1) { triggerLocalNotification('error', 'A tour plan must contain at least one planned day.'); return; }
    setPlanDays(planDays.filter((_, i) => i !== idx));
  };

  const handleDayChange = (idx, field, value) => {
    const updated = [...planDays]; updated[idx][field] = value; setPlanDays(updated);
  };



  const handleSaveDraft = async (e, andSubmit = false) => {
    if (e) e.preventDefault();
    setErrorMsg(null); setSuccessMsg(null);
    if (planDays.some(d => !d.plannedDate)) { triggerLocalNotification('error', 'Please select a planned date for all days.'); return; }

    const monthPrefix = targetMonth;
    const invalidMonth = planDays.some(d => !d.plannedDate.startsWith(monthPrefix));
    if (invalidMonth) {
      triggerLocalNotification('error', `All planned dates must belong to the selected target month: ${formatMonthLabel(targetMonth)}.`);
      return;
    }

    const dates = planDays.map(d => d.plannedDate);
    const hasDuplicateDates = new Set(dates).size !== dates.length;
    if (hasDuplicateDates) {
      triggerLocalNotification('error', 'Duplicate dates are not allowed. Each planned date must be unique.');
      return;
    }

    if (planDays.some(d => d.activityType === 'FIELD_WORK' && !d.targetTerritory)) { 
      triggerLocalNotification('error', 'Please specify a target territory for field work days.'); 
      return; 
    }

    const invalidTerritory = planDays.some(d => d.activityType === 'FIELD_WORK' && d.targetTerritory.trim().length < 3);
    if (invalidTerritory) {
      triggerLocalNotification('error', 'Target territory must be at least 3 characters long for field work.');
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
        if (andSubmit) await dispatch(submitTourPlanAction(createdPlan.id));
        dispatch(fetchMyTourPlansAction());
        setPlanDays([{ plannedDate: '', targetTerritory: '', activityType: 'FIELD_WORK' }]);
        setActiveTab('list');
      }
    } catch (err) { /* Caught in store */ } finally { setActionLoading(false); }
  };

  const handleSubmitExistingDraft = async (planId) => {
    setActionLoading(true);
    try { await dispatch(submitTourPlanAction(planId)); dispatch(fetchMyTourPlansAction()); }
    catch (err) { /* Handled by store */ } finally { setActionLoading(false); }
  };

  const handleViewPlanDetails = async (planId) => {
    try { await dispatch(fetchTourPlanDetailsAction(planId)); setDetailModalOpen(true); }
    catch (err) { triggerLocalNotification('error', 'Failed to retrieve tour plan details.'); }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'APPROVED': return { bg: '#ECFDF5', text: '#059669', border: '1px solid #A7F3D0' };
      case 'REJECTED': return { bg: '#FEF2F2', text: '#DC2626', border: '1px solid #FCA5A5' };
      case 'SUBMITTED': return { bg: '#FFFBEB', text: '#D97706', border: '1px solid #FDE68A' };
      default: return { bg: '#F3F4F6', text: '#4B5563', border: '1px solid #D1D5DB' };
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
    try { const parts = dateStr.split('-'); const d = new Date(parts[0], parts[1] - 1, 1); return d.toLocaleDateString('default', { month: 'long', year: 'numeric' }); }
    catch (e) { return dateStr; }
  };

  return (
    <div className="animate-[fadeSlideIn_0.35s_ease-out] flex flex-col h-[calc(100vh-104px)] min-h-0 overflow-hidden">


      {/* Alerts handled by global toast system */}

      {/* Tab controls */}
      <div className="flex gap-2.5 mb-4 shrink-0">
        <button
          onClick={() => setActiveTab('list')}
          className="py-2.5 px-[22px] rounded-xl cursor-pointer font-bold text-[13.5px] transition-all duration-200 outline-none"
          style={{
            background: activeTab === 'list' ? primaryColor : '#fff',
            color: activeTab === 'list' ? '#fff' : '#111827',
            boxShadow: activeTab === 'list' ? primaryShadow : 'none',
            border: activeTab === 'list' ? 'none' : '1px solid #E5E7EB',
          }}
        >
          My Tour Plans
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className="flex items-center gap-1.5 py-2.5 px-[22px] rounded-xl cursor-pointer font-bold text-[13.5px] transition-all duration-200 outline-none"
          style={{
            background: activeTab === 'new' ? primaryColor : '#fff',
            color: activeTab === 'new' ? '#fff' : '#111827',
            boxShadow: activeTab === 'new' ? primaryShadow : 'none',
            border: activeTab === 'new' ? 'none' : '1px solid #E5E7EB',
          }}
        >
          <Plus size={15} strokeWidth={2.5} /> Set Monthly Plan
        </button>
      </div>

      {/* Content wrapper */}
      <div className="bg-white rounded-[20px] border border-gray-100 p-6 flex-1 flex flex-col min-h-0 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">

        {/* Tab 1: Tour Plans List */}
        {activeTab === 'list' && (
          loading && tourPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-3">
              <Loader2 size={24} className="animate-spin text-gray-800" />
              <span className="text-[13.5px] text-gray-400">Loading tour plans...</span>
            </div>
          ) : tourPlans.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
              <ClipboardList size={40} className="mx-auto mb-3" strokeWidth={1.5} />
              <p className="m-0 text-sm font-medium">No monthly tour plans created yet.</p>
              <button
                onClick={() => setActiveTab('new')}
                className="mt-3.5 border-none py-2 px-4 rounded-[10px] font-bold text-[12.5px] cursor-pointer text-white"
                style={{ background: primaryColor, boxShadow: primaryShadow }}
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
                        <th key={h} className="py-3 px-4 text-[11.5px] font-extrabold text-gray-400 uppercase tracking-wide bg-white sticky top-0">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tourPlans.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((plan) => {
                      const statusStyle = getStatusBadgeStyle(plan.status);
                      return (
                        <tr key={plan.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors duration-150">
                          <td className="py-4 px-4 text-[13.5px] font-bold text-gray-800">
                            <span className="flex items-center gap-2">
                              <Calendar size={14} color="#9CA3AF" />
                              {formatMonthLabel(plan.targetMonth)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-[13.5px] text-gray-600 font-semibold">
                            {plan.planDays?.length || 0} Day{plan.planDays?.length !== 1 ? 's' : ''} scheduled
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex py-1 px-2.5 rounded-full text-[11px] font-extrabold" style={{ background: statusStyle.bg, color: statusStyle.text, border: statusStyle.border }}>
                              {plan.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-[13px] text-gray-500 italic max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap">
                            {plan.remarks || '—'}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={() => handleViewPlanDetails(plan.id)}
                                className="flex items-center gap-1 bg-gray-100 border-none py-1.5 px-3 rounded-lg cursor-pointer text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors duration-150"
                              >
                                <Eye size={12} /> Details
                              </button>
                              {plan.status === 'DRAFT' && (
                                <button
                                  onClick={() => handleSubmitExistingDraft(plan.id)}
                                  disabled={actionLoading}
                                  className="flex items-center gap-1 border-none py-1.5 px-3 rounded-lg cursor-pointer text-xs font-bold text-white transition-opacity hover:opacity-90"
                                  style={{ background: primaryColor }}
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
                activeBtnClass="bg-[#4F46E5] text-white"
              />
            </div>
          )
        )}

        {/* Tab 2: Create New Tour Plan */}
        {activeTab === 'new' && (
          <form onSubmit={(e) => handleSaveDraft(e, false)} className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-end items-center gap-2 border-b border-gray-100 pb-4 mb-4 shrink-0">
              <label className="text-[13px] font-bold text-gray-700">Target Month:</label>
              <input
                type="month"
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                required
                className="py-2 px-3 rounded-[10px] border border-gray-200 text-[13.5px] outline-none"
              />
            </div>

            {/* Plan Days Cards */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5 mb-4">
              {planDays.map((day, idx) => (
                <div key={idx} className="p-6 border border-gray-200 rounded-2xl bg-gray-50 relative animate-[fadeIn_0.25s]">
                  <button
                    type="button"
                    onClick={() => removeDayField(idx)}
                    className="absolute right-4 top-4 bg-transparent border-none cursor-pointer text-gray-400 p-1.5 rounded-lg transition-all hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="text-xs font-extrabold py-0.5 px-2 rounded-md inline-block mb-4 bg-gray-900 text-[#C8F04A]">
                    PLAN DAY #{idx + 1}
                  </div>

                  <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-5 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Planned Date <span className="text-red-500">*</span></label>
                      <input type="date" value={day.plannedDate} onChange={(e) => handleDayChange(idx, 'plannedDate', e.target.value)} required className="w-full py-2.5 px-3.5 rounded-[10px] border border-gray-200 text-[13.5px] outline-none box-border" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Activity Type <span className="text-red-500">*</span></label>
                      <select value={day.activityType} onChange={(e) => handleDayChange(idx, 'activityType', e.target.value)} required className="w-full py-2.5 px-3.5 rounded-[10px] border border-gray-200 text-[13.5px] bg-white outline-none box-border">
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
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Target Territory {day.activityType === 'FIELD_WORK' && <span className="text-red-500">*</span>}</label>
                      <input type="text" value={day.targetTerritory} onChange={(e) => handleDayChange(idx, 'targetTerritory', e.target.value)} placeholder="e.g. Chennai South, Ward 4" required={day.activityType === 'FIELD_WORK'} className="w-full py-2.5 px-3.5 rounded-[10px] border border-gray-200 text-[13.5px] outline-none box-border" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto shrink-0">
              <button
                type="button"
                onClick={addDayField}
                className="flex items-center gap-1.5 bg-gray-900 text-white border-none py-2.5 px-[18px] rounded-xl font-bold text-[12.5px] cursor-pointer transition-transform hover:-translate-y-px"
              >
                <Plus size={14} /> Add Another Day Plan
              </button>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="py-[11px] px-[22px] rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {actionLoading ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveDraft(null, true)}
                  disabled={actionLoading}
                  className="py-[11px] px-[22px] rounded-xl border-none text-white font-bold text-[13px] cursor-pointer transition-opacity hover:opacity-90"
                  style={{ background: primaryColor, boxShadow: primaryShadow }}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[6px] flex items-center justify-center z-[1100] p-5 animate-[fadeIn_0.2s]">
          <div className="bg-white rounded-[20px] w-full max-w-[680px] max-h-[85vh] flex flex-col overflow-hidden animate-[scaleIn_0.2s_cubic-bezier(0.34,1.56,0.64,1)]" style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
            <div className="py-5 px-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-[17px] font-extrabold text-gray-900 m-0">Tour Plan Details</h3>
                <span className="text-xs text-gray-400">Plan ID: {currentTourPlan.id} • Month: {formatMonthLabel(currentTourPlan.targetMonth)}</span>
              </div>
              <span className="text-[11px] font-extrabold py-1 px-2.5 rounded-full" style={{ background: getStatusBadgeStyle(currentTourPlan.status).bg, color: getStatusBadgeStyle(currentTourPlan.status).text, border: getStatusBadgeStyle(currentTourPlan.status).border }}>
                {currentTourPlan.status}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              {currentTourPlan.remarks && (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl">
                  <div className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wide">Manager Feedback Remarks</div>
                  <div className="text-[13px] text-amber-900 mt-1 italic">"{currentTourPlan.remarks}"</div>
                </div>
              )}
              <div className="flex flex-col gap-3.5">
                <div className="text-xs font-extrabold text-gray-400 uppercase tracking-wide">Planned Days ({currentTourPlan.planDays?.length || 0})</div>
                {currentTourPlan.planDays?.map((day, idx) => (
                  <div key={idx} className="border border-gray-100 p-4 rounded-xl bg-gray-50">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">📅 {day.plannedDate}</span>
                      <span className="text-[10.5px] font-extrabold py-0.5 px-2 rounded-md bg-gray-900 text-[#C8F04A]">
                        {day.activityType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="border-t border-gray-100 pt-2">
                      <div>
                        <div className="text-[10.5px] font-bold text-gray-400 uppercase">Target Territory</div>
                        <div className="text-[13px] text-gray-700 font-semibold mt-0.5 flex items-center gap-1"><MapPin size={12} color="#9CA3AF" />{day.targetTerritory || 'N/A'}</div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            <div className="py-4 px-6 border-t border-gray-100 flex justify-end shrink-0">
              <button onClick={() => setDetailModalOpen(false)} className="bg-gray-900 text-white border-none py-2.5 px-[22px] rounded-xl font-bold text-[13px] cursor-pointer outline-none">
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

export default METourPlanPage;

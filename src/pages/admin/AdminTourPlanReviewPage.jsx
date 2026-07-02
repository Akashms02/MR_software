import React, { useEffect, useState, useMemo } from 'react';
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
import Pagination from '../../components/common/Pagination';

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
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Reset page when filter status changes
  useEffect(() => {
    setCurrentPage(0);
  }, [filterStatus]);

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

  const uniqueEmployees = new Set(teamTourPlans.map(p => p.mrId || p.employeeId || p.mrName || p.employeeName).filter(Boolean));
  const repsCount = uniqueEmployees.size;

  const uniqueTerritories = new Set(
    teamTourPlans.flatMap(p => p.planDays || []).map(d => d.targetTerritory?.trim()).filter(Boolean)
  );
  const activeTerritoriesCount = uniqueTerritories.size;

  const stats = [
    { label: 'Pending Review', value: `${pendingCount}`, sub: pendingCount > 0 ? 'Review required' : 'All caught up!', color: '#D97706', bg: '#FFFBEB', icon: '📋' },
    { label: 'Approved Plans', value: `${approvedCount}`, sub: `${approvedCount} of ${totalCount} plans approved`, color: '#10B981', bg: '#ECFDF5', icon: '✅' },
    { label: 'Reps Under Management', value: `${repsCount} Field Staff`, sub: `${repsCount} active field reps`, color: '#6366F1', bg: '#EEF2FF', icon: '👥' },
    { label: 'Active Territories', value: `${activeTerritoriesCount} Regions`, sub: `Across ${activeTerritoriesCount} regions`, color: '#06B6D4', bg: '#ECFEFF', icon: '🗺️' },
  ];

  const filteredPlans = teamTourPlans.filter(plan => {
    if (filterStatus === 'ALL') return true;
    return plan.status === filterStatus;
  });

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

  const doctorListOptions = doctors;

  const handleInspect = (plan) => {
    setInspectPlan(plan);
    setInspectModalOpen(true);
  };

  return (
    <div className="animate-[fadeIn_0.4s_ease-out] p-1">
      {/* Notifications */}
      {localSuccess && (
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] px-[18px] py-3 rounded-xl flex items-center gap-2 text-[#047857] text-[13px] font-semibold mb-5">
          <CheckCircle2 size={16} />
          {localSuccess}
        </div>
      )}
      {localError && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] px-[18px] py-3 rounded-xl flex items-center gap-2 text-[#B91C1C] text-[13px] font-semibold mb-5">
          <AlertCircle size={16} />
          {localError}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 mb-[28px]">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white border-[1.5px] border-[#F3F4F6] rounded-2xl p-5 flex items-center gap-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] cursor-pointer"
          >
            <div
              className="w-12 h-12 rounded-xl text-2xl flex items-center justify-center shrink-0"
              style={{ background: s.bg }}
            >
              {s.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.5px] truncate">
                {s.label}
              </div>
              <div className="text-[20px] font-extrabold text-[#1F2937] leading-none my-1.5">
                {s.value}
              </div>
              <div
                className="text-[11px] font-semibold truncate"
                style={{ color: s.color }}
              >
                {s.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border-[1.5px] border-[#F3F4F6] rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col h-[calc(100vh-220px)] min-h-[350px]">
          <div className="flex justify-between items-center mb-5 border-b border-[#F3F4F6] pb-4">
            <h3 className="m-0 text-[16px] font-extrabold text-[#1F2937]">Submitted Tour Plans</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-bold mr-1">Filter:</span>
              <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200/50">
                {[
                  { value: 'ALL', label: 'All' },
                  { value: 'SUBMITTED', label: 'Pending' },
                  { value: 'APPROVED', label: 'Approved' },
                  { value: 'REJECTED', label: 'Rejected' }
                ].map((tab) => {
                  const isActive = filterStatus === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setFilterStatus(tab.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border-none ${
                        isActive
                          ? 'bg-[#111827] text-white shadow-sm'
                          : 'text-gray-500 hover:text-[#111827] bg-transparent'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <span className="text-[12.5px] font-bold text-[#D97706] bg-[#FFFBEB] px-3 py-1.5 rounded-xl ml-2 shrink-0">
                Pending: {pendingCount}
              </span>
            </div>
          </div>
 
          {loading && teamTourPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2.5">
              <Loader2 size={24} className="animate-spin text-[#111827]" style={{ animationDuration: '0.8s' }} />
              <span className="text-[13px] text-[#9CA3AF]">Loading team tour plans...</span>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center text-[#9CA3AF]">
              <CheckCircle2 size={36} className="mx-auto mb-2.5 text-[#10B981]" />
              <p className="m-0 text-[13.5px] font-semibold text-[#4B5563]">No tour plans found matching the filter.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b-[1.5px] border-[#F3F4F6] sticky top-0 bg-white z-[10]">
                      {['Staff Member', 'Target Month', 'Scheduled Days', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-[0.5px] bg-white sticky top-0">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlans.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((plan) => {
                      const displayName = plan.mrName || plan.employeeName || 'Field Employee';
                      const displayInitial = displayName.charAt(0).toUpperCase();
                      return (
                        <tr key={plan.id} className="border-b border-[#FAFAFA] transition-colors duration-150 hover:bg-slate-50/50">
                          {/* Staff member name */}
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white text-[12.5px] font-bold flex items-center justify-center">
                                {displayInitial}
                              </div>
                              <div>
                                <div className="text-[13.5px] font-bold text-[#1F2937]">{displayName}</div>
                                <div className="text-[11px] text-[#9CA3AF]">{plan.employeeRole || 'Medical Representative'}</div>
                              </div>
                            </div>
                          </td>

                          {/* Month */}
                          <td className="p-4 text-[13.5px] font-bold text-[#1F2937]">
                            {formatMonthLabel(plan.targetMonth)}
                          </td>

                          {/* Scheduled Days */}
                          <td className="p-4 text-[13px] text-[#4B5563] font-semibold">
                            {plan.planDays?.length || 0} Day{plan.planDays?.length !== 1 ? 's' : ''} scheduled
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-[20px] text-[11px] font-extrabold border ${plan.status === 'APPROVED' ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : plan.status === 'REJECTED' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]' : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'}`}>
                              {plan.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4">
                            <button
                              onClick={() => handleInspect(plan)}
                              className="flex items-center gap-1 bg-[#111827] text-white border-0 px-3.5 py-2 rounded-lg cursor-pointer font-bold text-xs transition-colors duration-150 hover:bg-[#374151]"
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

              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredPlans.length / pageSize)}
                totalElements={filteredPlans.length}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
                isLoading={loading}
                activeBtnClass="bg-[#111827] text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Inspect & Review Modal */}
      {inspectModalOpen && inspectPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[6px] flex items-center justify-center z-[1100] p-5 animate-[fadeIn_0.2s]">
          <div className="bg-white rounded-[20px] w-full max-w-[700px] max-h-[88vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-[scaleIn_0.2s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b-[1.5px] border-[#F3F4F6] flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-[17px] font-extrabold text-[#111827] m-0">
                  Review Tour Plan: {inspectPlan.mrName || inspectPlan.employeeName || 'Staff Member'}
                </h3>
                <span className="text-xs text-[#9CA3AF]">
                  Target Month: {formatMonthLabel(inspectPlan.targetMonth)} • Plan Status: {inspectPlan.status}
                </span>
              </div>
              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-[20px] ${inspectPlan.status === 'APPROVED' ? 'bg-[#ECFDF5] text-[#059669]' : inspectPlan.status === 'REJECTED' ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#FFFBEB] text-[#D97706]'}`}>{inspectPlan.status}</span>
            </div>

            {/* Modal Scroll Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              {inspectPlan.managerRemarks && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-250/60 flex flex-col gap-1 shrink-0">
                  <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Review Remarks / Comments</div>
                  <div className="text-[13px] text-[#374151] font-semibold italic">
                    "{inspectPlan.managerRemarks}"
                  </div>
                  {inspectPlan.approvedByName && (
                    <div className="text-[10.5px] text-[#9CA3AF] mt-0.5 font-medium">
                      Reviewed by: <span className="font-bold text-[#4B5563]">{inspectPlan.approvedByName}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Daily schedule listing */}
              <div className="flex flex-col gap-3.5">
                <div className="text-[11.5px] font-extrabold text-[#9CA3AF] uppercase tracking-[0.5px]">
                  Planned Itinerary Days ({inspectPlan.planDays?.length || 0})
                </div>

                {inspectPlan.planDays?.map((day, dIdx) => (
                  <div key={dIdx} className="border-[1.5px] border-[#F3F4F6] p-4 rounded-xl bg-[#FAFAFA]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[13.5px] font-bold text-[#1F2937]">
                        📅 {day.plannedDate}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-[3px] rounded-md bg-[#1E293B] text-[#C8F04A]">
                        {day.activityType.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-[1.2fr_2fr] gap-4 border-t border-[#F3F4F6] pt-2 mt-1.5">
                      <div>
                        <div className="text-[10px] font-bold text-[#9CA3AF] uppercase">Target Territory</div>
                        <div className="text-[12.5px] text-[#374151] font-semibold mt-0.5 flex items-center gap-1">
                          <MapPin size={11} className="text-[#9CA3AF]" />
                          {day.targetTerritory || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-[#9CA3AF] uppercase">Objectives & remarks</div>
                        <div className={`text-[12px] text-[#4B5563] mt-0.5 ${day.remarks ? 'not-italic' : 'italic'}`}>
                          {day.remarks || 'No objectives stated.'}
                        </div>
                      </div>
                    </div>

                    {day.activityType === 'FIELD_WORK' && ((day.plannedDoctorIds && day.plannedDoctorIds.length > 0) || (day.plannedDoctors && day.plannedDoctors.length > 0)) && (
                      <div className="border-t border-[#F3F4F6] pt-2 mt-2">
                        <div className="text-[10px] font-bold text-[#9CA3AF] uppercase mb-1">
                          Doctors Scheduled ({(day.plannedDoctorIds?.length || 0) + (day.plannedDoctors?.length || 0)})
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {day.plannedDoctorIds?.map((docId) => {
                            const doc = doctorListOptions.find(d => d.id === docId) || { fullName: `Dr. ID: ${docId}`, speciality: '' };
                            return (
                              <span key={docId} className="inline-flex px-2 py-[3px] rounded-md bg-[#E0E7FF] text-[#4F46E5] text-[10.5px] font-bold">
                                👨‍⚕️ {doc.fullName} {doc.speciality && `(${doc.speciality})`}
                              </span>
                            );
                          })}
                          {day.plannedDoctors?.map((doc, idx) => {
                            const docName = typeof doc === 'object' ? (doc.fullName || doc.name) : doc;
                            const docSpec = typeof doc === 'object' ? doc.speciality : '';
                            return (
                              <span key={idx} className="inline-flex px-2 py-[3px] rounded-md bg-[#E0E7FF] text-[#4F46E5] text-[10.5px] font-bold">
                                👨‍⚕️ {docName} {docSpec && `(${docSpec})`}
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
            <div className="px-6 py-5 border-t-[1.5px] border-[#F3F4F6] flex flex-col gap-4 shrink-0 bg-[#FAFAFA]">
              
              {/* Remarks input */}
              {inspectPlan.status === 'SUBMITTED' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#374151]">Review Feedback Remarks</label>
                  <input
                    type="text"
                    placeholder="Enter approval/rejection remarks here..."
                    value={remarksMap[inspectPlan.id] || ''}
                    onChange={(e) => setRemarksMap(prev => ({ ...prev, [inspectPlan.id]: e.target.value }))}
                    className="px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] text-[13px] outline-none bg-white w-full box-border focus:border-[#C8F04A]"
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-2.5 w-full">
                <button
                  onClick={() => setInspectModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#374151] font-bold text-[13px] cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                >
                  Close
                </button>
                {inspectPlan.status === 'SUBMITTED' && (
                  <>
                    <button
                      onClick={() => handleReview(inspectPlan.id, 'REJECTED')}
                      disabled={reviewingId !== null}
                      className="flex items-center gap-1 bg-[#EF4444] text-white border-0 px-5 py-2.5 rounded-xl cursor-pointer font-bold text-[13px] hover:bg-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      <X size={14} /> Reject Plan
                    </button>
                    <button
                      onClick={() => handleReview(inspectPlan.id, 'APPROVED')}
                      disabled={reviewingId !== null}
                      className="flex items-center gap-1 bg-[#10B981] text-white border-0 px-5 py-2.5 rounded-xl cursor-pointer font-extrabold text-[13px] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
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

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTeamDcrsAction, 
  reviewDcrAction, 
  clearDcrErrorsAction, 
  clearDcrSuccessAction 
} from '../../redux/actions/dcrActions';
import { Loader2, Check, X, Calendar, AlertCircle, CheckCircle2, MessageSquare, Eye, Users, FileText, CheckSquare } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';

const DcrReviewPage = () => {
  const dispatch = useDispatch();
  const { teamDcrs = [], loading, error, success } = useSelector((state) => state.dcr || {});
  
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Reset page when switching tabs/searching
  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab, searchTerm]);

  const [reviewingId, setReviewingId] = useState(null);
  const [remarksMap, setRemarksMap] = useState({});
  const [localSuccess, _setLocalSuccess] = useState(null);
  const [localError, _setLocalError] = useState(null);

  const setLocalSuccess = (msg) => {
    _setLocalSuccess(msg);
    if (msg) showToast(msg, 'success');
  };
  const setLocalError = (msg) => {
    _setLocalError(msg);
    if (msg) showToast(msg, 'error');
  };

  // Inspector Modal State
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectDcr, setInspectDcr] = useState(null);

  useEffect(() => {
    dispatch(fetchTeamDcrsAction());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setLocalSuccess(success);
      const t = setTimeout(() => {
        dispatch(clearDcrSuccessAction());
        setLocalSuccess(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      const t = setTimeout(() => {
        dispatch(clearDcrErrorsAction());
        setLocalError(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  const triggerLocalNotification = (type, msg) => {
    if (type === 'success') {
      setLocalSuccess(msg);
      setTimeout(() => setLocalSuccess(null), 4000);
    } else {
      setLocalError(msg);
      setTimeout(() => setLocalError(null), 4000);
    }
  };

  const handleReview = async (dcrId, status) => {
    const remarks = remarksMap[dcrId] || '';
    if (status === 'REJECTED' && !remarks.trim()) {
      triggerNotice('error', 'Feedback/Remarks is mandatory when rejecting a DCR report.');
      return;
    }
    const finalRemarks = remarks || (status === 'APPROVED' ? 'Approved' : 'Rejected');
    setReviewingId(dcrId);
    try {
      await dispatch(reviewDcrAction(dcrId, status, finalRemarks));
      dispatch(fetchTeamDcrsAction());
      setInspectModalOpen(false);
      setRemarksMap(prev => {
        const copy = { ...prev };
        delete copy[dcrId];
        return copy;
      });
    } catch (err) {
      // Handled by store errors hook
    } finally {
      setReviewingId(null);
    }
  };

  const handleApproveAll = async () => {
    const pendings = teamDcrs.filter(d => d.status === 'SUBMITTED');
    if (pendings.length === 0) return;
    setReviewingId('all');
    try {
      for (const d of pendings) {
        await dispatch(reviewDcrAction(d.id, 'APPROVED', 'Approved all pending DCRs'));
      }
      dispatch(fetchTeamDcrsAction());
      triggerLocalNotification('success', 'Approved all pending DCRs successfully!');
    } catch (err) {
      // Handled
    } finally {
      setReviewingId(null);
    }
  };

  const handleInspect = (dcr) => {
    setInspectDcr(dcr);
    setInspectModalOpen(true);
  };

  // Filter DCRs based on Active Tab and Search Term
  const filteredDcrs = useMemo(() => {
    return teamDcrs.filter((dcr) => {
      const name = (dcr.mrName || '').toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase());
      
      if (activeTab === 'pending') {
        return matchesSearch && (dcr.status === 'SUBMITTED' || dcr.status === 'DRAFT');
      } else {
        return matchesSearch && (dcr.status === 'APPROVED' || dcr.status === 'REJECTED');
      }
    });
  }, [teamDcrs, activeTab, searchTerm]);

  // Statistics calculation
  const pendingCount = teamDcrs.filter(d => d.status === 'SUBMITTED' || d.status === 'DRAFT').length;
  const approvedCount = teamDcrs.filter(d => d.status === 'APPROVED').length;
  const rejectedCount = teamDcrs.filter(d => d.status === 'REJECTED').length;
  const totalCount = pendingCount + approvedCount + rejectedCount;

  const stats = [
    { label: 'Pending Reviews', value: `${pendingCount}`, sub: pendingCount > 0 ? 'Action required' : 'All caught up!', color: '#D97706', bg: '#FFFBEB', icon: '📋' },
    { label: 'Approved DCRs', value: `${approvedCount}`, sub: 'Completed reviews', color: '#10B981', bg: '#ECFDF5', icon: '✅' },
    { label: 'Rejected DCRs', value: `${rejectedCount}`, sub: 'Requires corrections', color: '#EF4444', bg: '#FEF2F2', icon: '❌' },
    { label: 'Total Records', value: `${totalCount}`, sub: 'All-time history', color: '#6366F1', bg: '#EEF2FF', icon: '📝' },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]';
      case 'REJECTED':
        return 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]';
      default: // SUBMITTED
        return 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]';
    }
  };

  return (
    <div className="animate-[fadeIn_0.4s_ease-out] p-[10px] flex flex-col h-[calc(100vh-104px)] min-h-0 overflow-hidden">
      
      {/* Alerts handled by global toast system */}

      {/* Header filter & search controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 shrink-0">
        <div className="flex gap-2.5">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-[22px] py-2.5 rounded-xl border-none cursor-pointer text-[13.5px] font-bold transition-all duration-200 outline-none ${
              activeTab === 'pending' 
                ? 'bg-[#C8F04A] text-[#111827] shadow-[0_4px_12px_rgba(200,240,74,0.25)]' 
                : 'bg-white text-[#111827] border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Pending DCRs ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-[22px] py-2.5 rounded-xl border-none cursor-pointer text-[13.5px] font-bold transition-all duration-200 outline-none ${
              activeTab === 'history' 
                ? 'bg-[#C8F04A] text-[#111827] shadow-[0_4px_12px_rgba(200,240,74,0.25)]' 
                : 'bg-white text-[#111827] border border-gray-200 hover:bg-gray-50'
            }`}
          >
            DCR Review History
          </button>
        </div>

        <div className="flex gap-3 items-center">
          <input 
            type="text" 
            placeholder="Search by MR Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 text-[13.5px] bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-400 w-[220px]"
          />
          {activeTab === 'pending' && pendingCount > 0 && (
            <button
              onClick={handleApproveAll}
              disabled={reviewingId === 'all'}
              className="flex items-center gap-1.5 bg-emerald-600 text-white border-0 px-[18px] py-2.5 rounded-xl cursor-pointer font-bold text-[13px] hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-200"
            >
              {reviewingId === 'all' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckSquare size={14} />
              )}
              Approve All Pending
            </button>
          )}
        </div>
      </div>

      {/* Main content grid */}
      <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-hidden mb-1">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 mb-[4px] shrink-0">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.01)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.04)]"
            >
              <div
                className="w-12 h-12 rounded-xl text-2xl flex items-center justify-center shrink-0"
                style={{ background: s.bg }}
              >
                {s.icon}
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.5px]">
                  {s.label}
                </div>
                <div className="text-[20px] font-extrabold text-[#1F2937] my-0.5">
                  {s.value}
                </div>
                <div className="text-[11px] text-[#9CA3AF] font-bold">
                  {s.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-[18px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex justify-between items-center mb-5 border-b border-[#F3F4F6] pb-4 shrink-0">
            <h3 className="m-0 text-[16px] font-extrabold text-[#1F2937]">
              {activeTab === 'pending' ? 'Pending DCR verifications' : 'Reviewed DCR history'}
            </h3>
            <span className="text-[12.5px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">
              Found: {filteredDcrs.length} record(s)
            </span>
          </div>

          {loading && teamDcrs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2.5">
              <Loader2 size={24} className="animate-spin text-[#111827]" />
              <span className="text-[13px] text-[#9CA3AF]">Loading DCRs...</span>
            </div>
          ) : filteredDcrs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-[#9CA3AF]">
              <CheckCircle2 size={36} className="mx-auto mb-2.5 text-[#10B981]" />
              <p className="m-0 text-[13.5px] font-semibold text-[#4B5563]">No DCR records match the criteria.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b-[1.5px] border-[#F3F4F6] sticky top-0 bg-white z-[10]">
                      {['Staff Member', 'Report Date', 'Doctor Calls', 'Chemist Calls', 'Status', 'Review Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-[0.5px] bg-white sticky top-0">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDcrs.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((dcr) => {
                      const reporterInitial = dcr.mrName ? dcr.mrName.charAt(0).toUpperCase() : 'E';
                      const docCount = dcr.visits?.length || 0;
                      const chemCount = dcr.chemistVisits?.length || 0;
                      
                      return (
                        <tr key={dcr.id} className="border-b border-[#FAFAFA] transition-colors duration-150 hover:bg-slate-50/50">
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white text-[12.5px] font-bold flex items-center justify-center">
                                {reporterInitial}
                              </div>
                              <div>
                                <div className="text-[13.5px] font-extrabold text-[#1F2937]">{dcr.mrName || 'Field staff'}</div>
                                <div className="text-[11px] text-[#9CA3AF]">Representative</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-[13.5px] font-bold text-[#1F2937]">
                            {dcr.reportDate}
                          </td>
                          <td className="p-4 text-[13.5px] font-semibold text-gray-700">
                            <span className="bg-[#EFF6FF] text-[#1E40AF] px-2.5 py-1 rounded-lg text-xs font-bold">
                              {docCount} Visited
                            </span>
                          </td>
                          <td className="p-4 text-[13.5px] font-semibold text-gray-700">
                            <span className="bg-[#F5F3FF] text-[#5B21B6] px-2.5 py-1 rounded-lg text-xs font-bold">
                              {chemCount} Visited
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-[20px] text-[11px] font-extrabold ${getStatusBadgeClass(dcr.status)}`}>
                              {dcr.status}
                            </span>
                          </td>
                          <td className="p-4 flex items-center gap-2.5">
                            <button
                              onClick={() => handleInspect(dcr)}
                              className="flex items-center gap-1.5 bg-[#111827] text-white border-0 px-3.5 py-2 rounded-xl cursor-pointer font-bold text-xs hover:bg-[#374151]"
                            >
                              <Eye size={12} /> Inspect DCR
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
                totalPages={Math.ceil(filteredDcrs.length / pageSize)}
                totalElements={filteredDcrs.length}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
                isLoading={loading}
                activeBtnClass="bg-[#C8F04A] text-[#111827]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Inspector Modal */}
      {inspectModalOpen && inspectDcr && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-3xl w-full max-w-[650px] shadow-2xl flex flex-col h-[85vh] max-h-[750px] overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
              <div>
                <h3 className="m-0 text-[17px] font-extrabold text-[#1F2937]">Inspect DCR: {inspectDcr.mrName}</h3>
                <span className="text-[11.5px] font-bold text-[#9CA3AF] block mt-0.5">Submitted Log Date: {inspectDcr.reportDate}</span>
              </div>
              <button 
                onClick={() => setInspectModalOpen(false)}
                className="w-8 h-8 rounded-full border border-gray-250 bg-white flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <X size={14} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Doctor Visits Section */}
              <div>
                <h4 className="text-[13px] font-extrabold text-[#1F2937] uppercase tracking-[0.5px] border-b border-gray-100 pb-2 mb-3">
                  🩺 Doctor Calls ({inspectDcr.visits?.length || 0})
                </h4>
                {(!inspectDcr.visits || inspectDcr.visits.length === 0) ? (
                  <span className="text-xs font-semibold text-gray-400 italic">No doctor visits logged for this day.</span>
                ) : (
                  <div className="space-y-3.5">
                    {inspectDcr.visits.map((vis) => (
                      <div key={vis.id} className="border border-gray-100 rounded-xl p-3.5 bg-slate-50/50 shadow-sm relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[13.5px] font-extrabold text-[#1F2937]">{vis.doctorName}</span>
                            <span className="text-[11px] font-semibold text-gray-400 block">{vis.speciality}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded">{vis.visitTime || 'N/A'}</span>
                            {vis.isGpsVerified ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded block mt-1">✓ GPS Verified</span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded block mt-1">⚠ No GPS match</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2.5 grid grid-cols-2 gap-3 text-xs border-t border-gray-100 pt-2.5">
                          <div>
                            <span className="font-bold text-[#9CA3AF] block uppercase text-[10px]">Products Discussed</span>
                            <span className="font-semibold text-gray-700">{vis.productsDiscussed || 'None'}</span>
                          </div>
                          <div>
                            <span className="font-bold text-[#9CA3AF] block uppercase text-[10px]">Samples Given</span>
                            <span className="font-semibold text-gray-700">{vis.samplesGiven || 'None'}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs">
                          <span className="font-bold text-[#9CA3AF] block uppercase text-[10px]">Doctor Feedback</span>
                          <span className="font-medium text-gray-600 italic">"{vis.feedback || 'No feedback logged.'}"</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chemist Visits Section */}
              <div>
                <h4 className="text-[13px] font-extrabold text-[#1F2937] uppercase tracking-[0.5px] border-b border-gray-100 pb-2 mb-3">
                  🏪 Chemist Calls ({inspectDcr.chemistVisits?.length || 0})
                </h4>
                {(!inspectDcr.chemistVisits || inspectDcr.chemistVisits.length === 0) ? (
                  <span className="text-xs font-semibold text-gray-400 italic">No chemist visits logged for this day.</span>
                ) : (
                  <div className="space-y-3.5">
                    {inspectDcr.chemistVisits.map((vis) => (
                      <div key={vis.id} className="border border-gray-100 rounded-xl p-3.5 bg-slate-50/50 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[13.5px] font-extrabold text-[#1F2937]">{vis.chemistName}</span>
                            <span className="text-[11px] font-semibold text-gray-400 block">{vis.address}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded">{vis.visitTime || 'N/A'}</span>
                            {vis.isGpsVerified ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded block mt-1">✓ GPS Verified</span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded block mt-1">⚠ No GPS match</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2.5 text-xs border-t border-gray-100 pt-2.5">
                          <span className="font-bold text-[#9CA3AF] block uppercase text-[10px]">Products Discussed</span>
                          <span className="font-semibold text-gray-700">{vis.productsDiscussed || 'None'}</span>
                        </div>
                        <div className="mt-2 text-xs">
                          <span className="font-bold text-[#9CA3AF] block uppercase text-[10px]">Chemist Feedback / Order</span>
                          <span className="font-medium text-gray-600 italic">"{vis.feedback || 'No feedback logged.'}"</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/40 shrink-0 flex flex-col gap-3">
              {inspectDcr.status === 'SUBMITTED' ? (
                <>
                  <div className="flex items-center gap-3">
                    <MessageSquare size={16} className="text-gray-400 shrink-0" />
                    <input 
                      type="text"
                      placeholder="Add review remarks (optional)..."
                      value={remarksMap[inspectDcr.id] || ''}
                      onChange={(e) => setRemarksMap({ ...remarksMap, [inspectDcr.id]: e.target.value })}
                      className="flex-1 px-4 py-2 text-[13px] border border-gray-250 rounded-xl outline-none focus:border-gray-400 bg-white"
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-1.5">
                    <button
                      onClick={() => handleReview(inspectDcr.id, 'REJECTED')}
                      disabled={reviewingId !== null}
                      className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs border-0 px-[18px] py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all shadow-sm shadow-rose-200"
                    >
                      {reviewingId === inspectDcr.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <X size={13} strokeWidth={2.5} />
                      )}
                      Reject DCR
                    </button>
                    <button
                      onClick={() => handleReview(inspectDcr.id, 'APPROVED')}
                      disabled={reviewingId !== null}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs border-0 px-[18px] py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all shadow-sm shadow-emerald-250"
                    >
                      {reviewingId === inspectDcr.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Check size={13} strokeWidth={2.5} />
                      )}
                      Approve DCR
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center text-xs text-gray-500 font-semibold px-1">
                  <span>Reviewed by: {inspectDcr.approvedByName || 'Supervisor'}</span>
                  <span>Remarks: "{inspectDcr.managerRemarks || 'No remarks provided.'}"</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DcrReviewPage;

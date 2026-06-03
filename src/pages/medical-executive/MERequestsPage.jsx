import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, X, AlertCircle, FileText, Loader2, RefreshCw, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPendingRequestsAction,
  reviewOnboardingRequestAction,
  requestStatusFromTab,
} from '../../redux/actions/requestActions';

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Rejected'];

const MERequestsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector((state) => state.request);
  const [success, setSuccess] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [tabCounts, setTabCounts] = useState({
    All: 0,
    Pending: 0,
    Approved: 0,
    Rejected: 0,
  });

  // Review Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewStatus, setReviewStatus] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchRequests = (tab = activeTab) => {
    dispatch(fetchPendingRequestsAction(requestStatusFromTab(tab)));
  };

  useEffect(() => {
    fetchRequests(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!requests.length && activeTab !== 'All') {
      setTabCounts((c) => ({ ...c, [activeTab]: 0 }));
      return;
    }
    if (activeTab === 'All') {
      setTabCounts({
        All: requests.length,
        Pending: requests.filter((r) => r.status === 'PENDING').length,
        Approved: requests.filter((r) => r.status === 'APPROVED').length,
        Rejected: requests.filter((r) => r.status === 'REJECTED').length,
      });
    } else {
      setTabCounts((c) => ({ ...c, [activeTab]: requests.length }));
    }
  }, [requests, activeTab]);

  const filteredRequests = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return requests;
    return requests.filter(
      (req) =>
        req.name?.toLowerCase().includes(q) ||
        req.email?.toLowerCase().includes(q) ||
        req.phone?.includes(q) ||
        req.type?.toLowerCase().includes(q) ||
        (typeof req.submittedBy === 'string'
          ? req.submittedBy.toLowerCase().includes(q)
          : req.submittedBy?.fullName?.toLowerCase().includes(q))
    );
  }, [requests, searchQuery]);

  const counts = tabCounts;

  const handleOpenReview = (request, status) => {
    setSelectedRequest(request);
    setReviewStatus(status);
    setRemarks('');
  };

  const handleCloseReview = () => {
    setSelectedRequest(null);
    setReviewStatus(null);
    setRemarks('');
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest) return;
    setReviewLoading(true);
    setSuccess(null);
    try {
      await dispatch(reviewOnboardingRequestAction(selectedRequest, reviewStatus, remarks));
      setSuccess(`Request for "${selectedRequest.name}" has been ${reviewStatus.toLowerCase()} successfully!`);
      handleCloseReview();
      fetchRequests(activeTab);
      setTimeout(() => setSuccess(null), 4500);
    } catch (err) {
      // Error is handled by Redux requestReducer state.error
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"><Check size={10} strokeWidth={3} /> Approved</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]"><X size={10} strokeWidth={3} /> Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="animate-[fadeSlideIn_0.35s_ease-out] p-1">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-7">
        <div>
          <span className="text-[11px] text-[#1D4ED8] font-extrabold uppercase tracking-wider">
            PORTAL: MEDICAL EXECUTIVE
          </span>
          <h2 className="text-[24px] font-extrabold text-[#111827] mt-1 mb-0">Onboarding Approval Requests</h2>
          <p className="text-[13px] text-[#6B7280] mt-[3px] mb-0">
            Review, approve, or reject Doctor &amp; Chemist onboarding requests submitted by Medical Representatives.
          </p>
        </div>
        <button
          onClick={() => navigate('/medical-executive/onboard-doctor')}
          className="flex items-center gap-1.5 px-[22px] py-2.5 rounded-xl border-none bg-[#1D4ED8] text-white font-bold text-[13.5px] cursor-pointer shadow-[0_4px_12px_rgba(29,78,216,0.25)] hover:bg-[#1e40af] transition-all duration-150 outline-none"
        >
          <Plus size={15} strokeWidth={2.5} /> Onboard Doctor / Pharmacist
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] px-[18px] py-3 rounded-xl flex items-center gap-2 text-[#047857] text-[13px] font-semibold mb-5">
          <Check size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] px-[18px] py-3 rounded-xl flex items-center gap-2 text-[#B91C1C] text-[13px] font-semibold mb-5">
          <AlertCircle size={16} /> {error}
          <button onClick={() => fetchRequests(activeTab)} className="ml-auto bg-transparent border-none text-[#B91C1C] font-bold underline cursor-pointer flex items-center gap-1">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-[340px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, type, MR..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-[13px] outline-none bg-white focus:border-[#1D4ED8] transition-colors duration-150 font-sans"
          />
        </div>
        <div className="flex bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-1 gap-0.5">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-bold transition-all duration-150 border-none cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-white shadow-sm text-[#111827]'
                  : 'bg-transparent text-[#9CA3AF] hover:text-[#374151]'
              }`}
            >
              {tab}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                activeTab === tab ? 'bg-[#F3F4F6] text-[#374151]' : 'bg-transparent text-[#D1D5DB]'
              }`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => fetchRequests(activeTab)}
          className="ml-auto p-2 rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] hover:border-[#1D4ED8] cursor-pointer transition-all duration-150 flex items-center gap-1.5 text-[12.5px] font-semibold"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-[20px] border-[1.5px] border-[#F3F4F6] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-7">
        {loading ? (
          <div className="flex flex-col items-center p-[60px] gap-3">
            <Loader2 size={24} className="animate-spin text-[#1D4ED8]" />
            <span className="text-[13.5px] text-[#9CA3AF]">Loading requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-[60px] text-center text-[#9CA3AF]">
            <FileText size={40} className="mx-auto mb-3 stroke-[1.5]" />
            <p className="m-0 text-[14px] font-medium">
              {searchQuery || activeTab !== 'All' ? 'No requests match your filters.' : 'No onboarding requests found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b-[1.5px] border-[#F3F4F6]">
                  {['S.No', 'MR Name', 'Type', 'Name', 'Email / Phone', 'Address', 'Details', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-[11.5px] font-extrabold text-[#9CA3AF] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req, idx) => (
                  <tr key={req.id || idx} className="border-b border-[#FAFAFA] hover:bg-gray-50/50 transition-colors duration-150">
                    <td className="px-4 py-4 text-[13px] font-semibold text-[#6B7280]">{idx + 1}</td>
                    <td className="px-4 py-4 text-[13px] font-bold text-[#4B5563]">
                      {req.submittedBy?.fullName || req.submittedBy || '—'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase ${req.type === 'CHEMIST' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#F5F3FF] text-[#7C3AED]'}`}>
                        {req.type === 'CHEMIST' ? 'Chemist' : 'Doctor'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[13px] font-bold text-[#1F2937]">{req.name}</td>
                    <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-[#111827]">{req.email || '—'}</span>
                        <span className="text-xs text-[#6B7280]">{req.phone || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[12.5px] text-[#6B7280] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap" title={req.address}>
                      {req.address}
                    </td>
                    <td className="px-4 py-4 text-[12.5px] text-[#4B5563]">
                      {req.type === 'CHEMIST' ? (
                        <div><span className="font-semibold text-xs text-[#6B7280]">Contact: </span>{req.chemistContactPerson || '—'}</div>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <div><span className="font-semibold text-xs text-[#6B7280]">Spec: </span>{req.doctorSpeciality || '—'}</div>
                          <div><span className="font-semibold text-xs text-[#6B7280]">Qual: </span>{req.doctorQualification || '—'}</div>
                          <div><span className="font-semibold text-xs text-[#6B7280]">Lic: </span>{req.doctorLicenseNumber || '—'}</div>
                        </div>
                      )}
                    </td>
                    {/* Status / Action — single merged column */}
                    <td className="px-4 py-4">
                      {req.status === 'PENDING' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenReview(req, 'APPROVED')}
                            className="bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] p-2 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150 hover:scale-105"
                            title="Approve"
                          >
                            <Check size={16} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => handleOpenReview(req, 'REJECTED')}
                            className="bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] p-2 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150 hover:scale-105"
                            title="Reject"
                          >
                            <X size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : req.status === 'APPROVED' ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-7 h-7 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center flex-shrink-0">
                              <Check size={14} strokeWidth={3} className="text-[#059669]" />
                            </div>
                            <span className="text-[12.5px] font-extrabold text-[#059669]">Approved</span>
                          </div>
                          {req.remarks && (
                            <div className="text-[11px] text-[#6B7280] italic ml-[34px] max-w-[130px] truncate" title={req.remarks}>"{req.remarks}"</div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-7 h-7 rounded-full bg-[#FEF2F2] border border-[#FCA5A5] flex items-center justify-center flex-shrink-0">
                              <X size={14} strokeWidth={3} className="text-[#DC2626]" />
                            </div>
                            <span className="text-[12.5px] font-extrabold text-[#DC2626]">Rejected</span>
                          </div>
                          {req.remarks && (
                            <div className="text-[11px] text-[#6B7280] italic ml-[34px] max-w-[130px] truncate" title={req.remarks}>"{req.remarks}"</div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-[480px] w-full p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out] flex flex-col gap-5">
            <div>
              <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase mb-2 ${reviewStatus === 'APPROVED' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEF2F2] text-[#DC2626]'}`}>
                Review: {reviewStatus}
              </span>
              <h3 className="text-[17px] font-extrabold text-[#111827] m-0">
                {reviewStatus === 'APPROVED' ? 'Approve' : 'Reject'} Onboarding Request
              </h3>
              <p className="text-[13px] text-[#6B7280] mt-1 mb-0">
                Submit review for <span className="font-semibold text-[#111827]">{selectedRequest.name}</span>.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#374151]">Review Remarks / Comments</label>
              <textarea
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder={reviewStatus === 'APPROVED' ? 'e.g. Approved and added to doctor list.' : 'e.g. Rejecting due to missing license verification.'}
                className="w-full h-[90px] px-3.5 py-2.5 rounded-xl border border-gray-200 text-[13.5px] outline-none box-border resize-none font-sans"
              />
            </div>
            <div className="flex gap-2.5 justify-end">
              <button onClick={handleCloseReview} disabled={reviewLoading}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-[#374151] font-bold text-[13px] cursor-pointer hover:bg-gray-50 transition-colors duration-150">
                Cancel
              </button>
              <button onClick={handleSubmitReview} disabled={reviewLoading}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border-none text-white font-extrabold text-[13px] cursor-pointer transition-opacity duration-150 ${reviewStatus === 'APPROVED' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}>
                {reviewLoading ? <><Loader2 size={13} className="animate-spin" /> Submitting...</> : 'Submit Decision'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default MERequestsPage;

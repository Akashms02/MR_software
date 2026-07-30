import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, X, AlertCircle, FileText, Loader2, RefreshCw, Search, Edit2, MapPin } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPendingRequestsAction,
  reviewOnboardingRequestAction,
  requestStatusFromTab,
} from '../../redux/actions/requestActions';
import axios from '../../api/axiosInstance';
import { API_ROUTE } from '../../data/env';
import Pagination from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Rejected'];

const AdminRequestsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { requests, loading, error, pagination } = useSelector((state) => state.request);
  const [success, _setSuccess] = useState(null);

  // Per-Doctor Configurable GPS Threshold (Meters) State (Default 200m, Max 200m per doctor)
  const [perDoctorThresholds, setPerDoctorThresholds] = useState({});
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [modalDoctorThreshold, setModalDoctorThreshold] = useState('200');

  const getDoctorThreshold = (reqId) => {
    if (!reqId) return 200;
    if (perDoctorThresholds[reqId] !== undefined) return perDoctorThresholds[reqId];
    const saved = localStorage.getItem(`doctor_gps_threshold_${reqId}`);
    return saved ? Math.min(200, Math.max(1, Number(saved))) : 200;
  };

  const handleSetDoctorThreshold = (reqId, val) => {
    const cleanVal = val.replace(/\D/g, '');
    let num = cleanVal === '' ? 200 : parseInt(cleanVal, 10);
    if (num > 200) num = 200;
    if (num <= 0) num = 1;
    setPerDoctorThresholds((prev) => ({
      ...prev,
      [reqId]: num,
    }));
    localStorage.setItem(`doctor_gps_threshold_${reqId}`, String(num));
  };

  const setSuccess = (msg) => {
    _setSuccess(msg);
    if (msg) showToast(msg, 'success');
  };

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error]);

  const fetchGpsThreshold = async () => {
    try {
      const res = await axios.get(`${API_ROUTE}/admin/settings/gps-threshold`);
      const val = res.data?.data?.gpsThresholdMeters ?? res.data?.gpsThresholdMeters ?? 200;
      const numVal = Math.min(200, Math.max(1, Number(val) || 200));
      setGpsThreshold(numVal);
      setThresholdInput(String(numVal));
    } catch (err) {
      console.error('Failed to fetch GPS threshold', err);
    }
  };

  useEffect(() => {
    fetchGpsThreshold();
  }, []);

  const handleThresholdChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '') {
      setThresholdInput('');
      return;
    }
    let num = parseInt(val, 10);
    if (num > 200) num = 200;
    setThresholdInput(String(num));
  };

  const handleSaveThreshold = async (e) => {
    if (e) e.preventDefault();
    let num = parseInt(thresholdInput, 10);
    if (isNaN(num) || num <= 0) num = 200;
    if (num > 200) num = 200;

    setSavingThreshold(true);
    try {
      await axios.put(`${API_ROUTE}/admin/settings/gps-threshold`, {
        gpsThresholdMeters: num,
      });
      setGpsThreshold(num);
      setThresholdInput(String(num));
      setIsEditingThreshold(false);
      showToast(`GPS Radius threshold updated to ${num} meters ✅`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update GPS threshold', 'error');
    } finally {
      setSavingThreshold(false);
    }
  };

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
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

  const searchTimerRef = useRef(null);

  const extractTotalCount = (data) => {
    if (!data) return 0;
    if (typeof data.totalElements === 'number') return data.totalElements;
    if (typeof data.total === 'number') return data.total;
    if (data.paginator && typeof data.paginator.itemCount === 'number') return data.paginator.itemCount;
    if (Array.isArray(data)) return data.length;
    if (Array.isArray(data.content)) return data.content.length;
    return 0;
  };

  const fetchRequests = (tab = activeTab, page = currentPage, search = searchQuery) => {
    dispatch(fetchPendingRequestsAction(requestStatusFromTab(tab), page, pageSize, search));
  };

  const initializeTabCounts = async () => {
    try {
      const statuses = ['All', 'Pending', 'Approved', 'Rejected'];
      const requestsPromises = statuses.map(async (tab) => {
        const statusVal = requestStatusFromTab(tab);
        const response = await axios.post(`${API_ROUTE}/requests/pending`, {
          status: statusVal,
          page: 0,
          size: 1,
        });
        const data = response.data?.data ?? response.data;
        return { tab, count: extractTotalCount(data) };
      });
      const results = await Promise.all(requestsPromises);
      const newCounts = {};
      results.forEach(({ tab, count }) => {
        newCounts[tab] = count;
      });
      setTabCounts(newCounts);
    } catch (err) {
      console.error('Failed to initialize tab counts', err);
    }
  };

  useEffect(() => {
    initializeTabCounts();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
    fetchRequests(activeTab, 0, searchQuery);
  }, [activeTab]);

  // Debounced server-side search: fires 400ms after user stops typing
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setCurrentPage(0);
      fetchRequests(activeTab, 0, searchQuery);
    }, 400);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery]);

  useEffect(() => {
    if (pagination && pagination.totalElements !== undefined) {
      setTabCounts((c) => ({
        ...c,
        [activeTab]: pagination.totalElements,
      }));
    }
  }, [pagination, activeTab]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchRequests(activeTab, page, searchQuery);
  };

  const counts = tabCounts;

  const filteredRequests = useMemo(() => {
    const list = Array.isArray(requests) ? requests : [];
    return list.filter((req) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        req.name?.toLowerCase().includes(q) ||
        req.email?.toLowerCase().includes(q) ||
        req.phone?.includes(q) ||
        req.type?.toLowerCase().includes(q) ||
        req.submittedBy?.toLowerCase().includes(q) ||
        req.address?.toLowerCase().includes(q);

      const reqStatus = (req.status || '').toUpperCase();
      const targetStatus = requestStatusFromTab(activeTab);
      const matchesTab =
        targetStatus === 'ALL' || reqStatus === targetStatus;

      return matchesSearch && matchesTab;
    });
  }, [requests, searchQuery, activeTab]);

  const handleOpenReview = (request, status) => {
    setSelectedRequest(request);
    setReviewStatus(status);
    setRemarks('');
    const currentVal = getDoctorThreshold(request.id);
    setModalDoctorThreshold(String(currentVal));
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
      const num = Math.min(200, Math.max(1, Number(modalDoctorThreshold) || 200));
      handleSetDoctorThreshold(selectedRequest.id, String(num));

      await dispatch(reviewOnboardingRequestAction(selectedRequest, reviewStatus, remarks));
      setSuccess(`Request for "${selectedRequest.name}" has been ${reviewStatus.toLowerCase()} successfully with ${num}m GPS radius threshold!`);
      handleCloseReview();
      fetchRequests(activeTab, currentPage);
      initializeTabCounts();
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
      case 'PENDING':
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#FFFBEB] text-[#D97706] border border-[#FCD34D]"><Loader2 size={10} className="animate-spin text-[#D97706]" /> Pending</span>;
    }
  };

  const isManager = window.location.pathname.startsWith('/manager');
  const assignDoctorPath = isManager ? '/manager/myteam/assign-doctor' : '/admin/myteam/assign-doctor';
  const onboardDoctorPath = isManager ? '/manager/myteam/onboard-doctor' : '/admin/myteam/onboard-doctor';

  return (
    <div className="animate-[fadeSlideIn_0.35s_ease-out] p-1">
      {/* Page Header actions (portal label and duplicate headings removed) */}
      <div className="flex justify-end mb-7 gap-3.5">
        <button
          onClick={() => navigate(assignDoctorPath)}
          className="flex items-center gap-1.5 px-[22px] py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#374151] font-extrabold text-[13.5px] cursor-pointer shadow-sm hover:bg-[#F9FAFB] transition-all duration-150 outline-none"
        >
          <Plus size={15} strokeWidth={2.5} /> Assign to MR
        </button>
        <button
          onClick={() => navigate(onboardDoctorPath)}
          className="flex items-center gap-1.5 px-[22px] py-2.5 rounded-xl border-none bg-[#C8F04A] text-[#111827] font-extrabold text-[13.5px] cursor-pointer shadow-[0_4px_12px_rgba(200,240,74,0.25)] hover:bg-[#b8e040] transition-all duration-150 outline-none"
        >
          <Plus size={15} strokeWidth={2.5} /> Onboard Doctor / Pharmacist
        </button>
      </div>

      {/* Alerts handled by global toast system */}

      {/* Content wrapper */}
      <div className="bg-white rounded-[18px] border-[1.5px] border-[#F3F4F6] shadow-[0_4px_12px_rgba(0,0,0,0.02)] pt-6 px-6 pb-2.5 flex flex-col h-[calc(100vh-150px)] min-h-[400px]">
        {/* Card Header with Filters (Admin/ZBM) */}
        <div className="flex flex-wrap justify-between items-center mb-5 border-b border-[#F3F4F6] pb-4 gap-3">
          <div className="flex items-center gap-3">
            <h3 className="m-0 text-[16px] font-extrabold text-[#1F2937]">Onboarding Requests</h3>
            
            {/* Per-Doctor GPS Radius Notice Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-[11.5px] font-bold text-[#374151]">
              <MapPin size={12} className="text-[#059669]" />
              <span>Per-Doctor GPS Radius</span>
              <span className="text-[10.5px] font-extrabold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded border border-[#A7F3D0]">Max 200m</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-60">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8.5 pr-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[12px] outline-none bg-[#F9FAFB] focus:bg-white focus:border-[#C8F04A] transition-colors duration-150 font-sans"
              />
            </div>
            {/* Status Tabs */}
            <div className="flex bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-0.5 gap-0.5">
              {STATUS_TABS.map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all duration-150 border-none cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab
                      ? 'bg-white shadow-xs text-[#111827]'
                      : 'bg-transparent text-[#9CA3AF] hover:text-[#374151]'
                  }`}
                >
                  {tab}
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === tab ? 'bg-[#F3F4F6] text-[#374151]' : 'bg-transparent text-[#D1D5DB]'
                  }`}>
                    {counts[tab]}
                  </span>
                </button>
              ))}
            </div>
            {/* Refresh Button */}
            <button
              onClick={() => { fetchRequests(activeTab, currentPage); initializeTabCounts(); }}
              className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] hover:border-[#C8F04A] cursor-pointer transition-all duration-150 flex items-center justify-center shrink-0"
              title="Refresh"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <Loader2 size={24} className="animate-spin text-[#065F46]" />
            <span className="text-[13.5px] text-[#9CA3AF]">Loading requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center text-[#9CA3AF]">
            <FileText size={40} className="mx-auto mb-3 stroke-[1.5]" />
            <p className="m-0 text-[14px] font-medium">
              {searchQuery || activeTab !== 'All' ? 'No requests match your filters.' : 'No onboarding requests found.'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-[1.5px] border-[#F3F4F6] sticky top-0 bg-white z-[10]">
                    {['S.No', 'MR Name', 'Type', 'Name', 'Email / Phone', 'Address', 'Details', 'GPS Radius (m)', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-[11.5px] font-extrabold text-[#9CA3AF] uppercase tracking-wider whitespace-nowrap bg-white">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req, idx) => (
                    <tr key={req.id || idx} className="border-b border-[#FAFAFA] hover:bg-gray-50/50 transition-colors duration-150">
                      {/* S.No */}
                      <td className="px-4 py-4 text-[13px] font-semibold text-[#6B7280]">{currentPage * pageSize + idx + 1}</td>
                      {/* MR Name */}
                      <td className="px-4 py-4 text-[13px] font-bold text-[#4B5563]">
                        {req.submittedBy?.fullName || req.submittedBy || '—'}
                      </td>
                      {/* Type */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase ${req.type === 'CHEMIST' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#F5F3FF] text-[#7C3AED]'}`}>
                          {req.type === 'CHEMIST' ? 'Chemist' : 'Doctor'}
                        </span>
                      </td>
                      {/* Name */}
                      <td className="px-4 py-4 text-[13px] font-bold text-[#1F2937]">{req.name}</td>
                      {/* Email/Phone */}
                      <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-[#111827]">{req.email || '—'}</span>
                          <span className="text-xs text-[#6B7280]">{req.phone || '—'}</span>
                        </div>
                      </td>
                      {/* Address */}
                      <td className="px-4 py-4 text-[12.5px] text-[#6B7280] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap" title={req.address}>
                        {req.address}
                      </td>
                      {/* Details */}
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
                      {/* GPS Radius Column (Per Doctor Configurable, Max 200m) */}
                      <td className="px-4 py-4 text-[12.5px]">
                        {editingDoctorId === req.id ? (
                          <div className="flex items-center gap-1 bg-[#F9FAFB] border border-[#C8F04A] p-1 rounded-lg">
                            <input
                              type="text"
                              value={getDoctorThreshold(req.id)}
                              onChange={(e) => handleSetDoctorThreshold(req.id, e.target.value)}
                              maxLength={3}
                              className="w-12 px-1 py-0.5 text-xs font-extrabold border border-[#D1D5DB] rounded text-center outline-none bg-white focus:border-[#059669]"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => setEditingDoctorId(null)}
                              className="p-1 rounded bg-[#10B981] text-white border-none cursor-pointer flex items-center justify-center"
                              title="Done"
                            >
                              <Check size={11} strokeWidth={3} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingDoctorId(req.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-white text-[11.5px] font-bold text-[#374151] cursor-pointer transition-all shadow-2xs hover:border-[#C8F04A]"
                            title="Click to edit GPS radius meters for this doctor (Max 200m)"
                          >
                            <MapPin size={11} className="text-[#059669]" />
                            <span className="font-extrabold text-[#059669]">{getDoctorThreshold(req.id)} m</span>
                            <Edit2 size={10} className="text-[#9CA3AF]" />
                          </button>
                        )}
                      </td>
                      {/* Status Column */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <div>{getStatusBadge(req.status)}</div>
                          {req.remarks && (
                            <div className="text-[11px] text-[#6B7280] italic ml-1 max-w-[130px] truncate" title={req.remarks}>"{req.remarks}"</div>
                          )}
                        </div>
                      </td>
                      {/* Actions Column */}
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
                        ) : (
                          <span className="text-[#9CA3AF] font-bold">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={pagination?.totalPages || 0}
              totalElements={pagination?.totalElements || 0}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              isLoading={loading}
              activeBtnClass="bg-[#C8F04A] text-[#111827]"
            />
          </>
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
                Submit review for <span className="font-semibold text-[#111827]">{selectedRequest.name}</span>. You can optionally add review remarks.
              </p>
            </div>

            {/* Per-Doctor GPS Radius Geofence Input (Admin & ZBM Editable, Max 200m) */}
            <div className="flex flex-col gap-1.5 bg-[#F9FAFB] border border-[#E5E7EB] p-3.5 rounded-xl">
              <label className="text-xs font-extrabold text-[#111827] flex items-center gap-1.5">
                <MapPin size={14} className="text-[#059669]" />
                GPS Verification Radius for {selectedRequest.name} (Meters, Max 200m)
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={modalDoctorThreshold}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val === '') {
                      setModalDoctorThreshold('');
                      return;
                    }
                    let num = parseInt(val, 10);
                    if (num > 200) num = 200;
                    setModalDoctorThreshold(String(num));
                  }}
                  placeholder="200"
                  maxLength={3}
                  className="w-20 px-3 py-1.5 text-sm font-extrabold border border-gray-300 rounded-lg outline-none bg-white text-center focus:border-[#059669]"
                />
                <span className="text-xs font-bold text-[#4B5563]">meters</span>
              </div>
              <span className="text-[11px] text-[#6B7280]">
                MR visit check-ins for this doctor within <strong>{modalDoctorThreshold || '200'}m</strong> radius will be verified.
              </span>
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

export default AdminRequestsPage;

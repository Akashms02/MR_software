import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckCircle2, AlertCircle, Clock, FileText, Loader2, RefreshCw, Search, Check, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeRequestsAction } from '../../redux/actions/requestActions';
import Pagination from '../../components/common/Pagination';

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Rejected'];

const MRRequestsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { requests, loading, error, pagination } = useSelector((state) => state.request);
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const isSearchActive = searchQuery || activeTab !== 'All';

  // Trigger data fetch when page or search changes
  useEffect(() => {
    if (isSearchActive) {
      dispatch(fetchMeRequestsAction(0, 100000));
    } else {
      dispatch(fetchMeRequestsAction(currentPage, pageSize));
    }
  }, [dispatch, currentPage, pageSize, isSearchActive]);

  // Reset page when search query or tab changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, activeTab]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        req.name?.toLowerCase().includes(q) ||
        req.email?.toLowerCase().includes(q) ||
        req.phone?.includes(q) ||
        req.type?.toLowerCase().includes(q);
      const matchesTab =
        activeTab === 'All' ||
        req.status?.toUpperCase() === activeTab.toUpperCase();
      return matchesSearch && matchesTab;
    });
  }, [requests, searchQuery, activeTab]);

  const counts = useMemo(() => {
    const isFull = requests.length > pageSize;
    return {
      All: isFull ? requests.length : (pagination?.totalElements || requests.length),
      Pending: requests.filter(r => r.status === 'PENDING').length,
      Approved: requests.filter(r => r.status === 'APPROVED').length,
      Rejected: requests.filter(r => r.status === 'REJECTED').length,
    };
  }, [requests, pagination]);

  // If search is active or requests already contains full list, do local slicing
  const useLocalPagination = isSearchActive || (requests && requests.length > pageSize);

  const displayedRequests = useMemo(() => {
    if (useLocalPagination) {
      return filteredRequests.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
    }
    return filteredRequests;
  }, [filteredRequests, currentPage, pageSize, useLocalPagination]);

  const totalElements = useLocalPagination ? filteredRequests.length : (pagination?.totalElements || 0);
  const totalPages = useLocalPagination ? Math.ceil(totalElements / pageSize) : (pagination?.totalPages || 0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (!useLocalPagination) {
      dispatch(fetchMeRequestsAction(page, pageSize));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]';
      case 'REJECTED':
        return 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]';
      default: // PENDING
        return 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]';
    }
  };

  const handleRequestOnboarding = () => {
    navigate('/mr/onboard-doctor');
  };

  return (
    <div className="animate-[fadeSlideIn_0.35s_ease-out] flex flex-col h-[calc(100vh-104px)] min-h-0 overflow-hidden">
      {/* Error State */}
      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] px-[18px] py-3 rounded-xl flex items-center gap-2 text-[#B91C1C] text-[13px] font-semibold mb-5 shrink-0">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => fetchRequests(currentPage)} className="ml-auto bg-transparent border-none text-[#B91C1C] font-bold underline cursor-pointer flex items-center gap-1">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex items-center gap-4 mb-5 flex-wrap shrink-0">
        <div className="relative flex-1 min-w-[220px] max-w-[340px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, type..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-[13px] outline-none bg-white focus:border-[#C8F04A] transition-colors duration-150 font-sans"
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
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => fetchRequests(currentPage)}
            className="p-2 rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] hover:border-[#C8F04A] cursor-pointer transition-all duration-150 flex items-center gap-1.5 text-[12.5px] font-semibold"
            title="Refresh"
          >
            <RefreshCw size={14} /> 
          </button>
          <button
            onClick={handleRequestOnboarding}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-none bg-[#C8F04A] text-[#111827] font-extrabold text-[12.5px] cursor-pointer shadow-[0_4px_12px_rgba(200,240,74,0.25)] hover:opacity-90 transition-opacity duration-150 outline-none"
          >
            <Plus size={14} strokeWidth={2.5} /> Request Onboarding
          </button>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="bg-white rounded-[20px] border-[1.5px] border-[#F3F4F6] shadow-[0_4px_20px_rgba(0,0,0,0.03)] pt-6 px-6 pb-2.5 flex-1 flex flex-col min-h-0 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 p-[60px] gap-3">
            <Loader2 size={24} className="animate-spin text-[#111827]" />
            <span className="text-[13.5px] text-[#9CA3AF]">Loading requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-[60px] text-center text-[#9CA3AF]">
            <FileText size={40} className="mx-auto mb-3 stroke-[1.5]" />
            <p className="m-0 text-[14px] font-medium">{searchQuery || activeTab !== 'All' ? 'No requests match your filters.' : 'No onboarding requests submitted yet.'}</p>
            <button
              onClick={handleRequestOnboarding}
              className="mt-3.5 bg-[#111827] text-white border-none px-4 py-2 rounded-lg font-bold text-[12.5px] cursor-pointer hover:bg-gray-800 transition-colors duration-150"
            >
              Request Onboarding
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-auto flex-1 pr-1">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-[1.5px] border-[#F3F4F6] sticky top-0 bg-white z-10">
                    {['S.No', 'Type', 'Name', 'Email', 'Phone', 'Address', 'Role Specific Details', 'Status', 'Review Remarks'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[11.5px] font-extrabold text-[#9CA3AF] uppercase tracking-wider bg-white">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedRequests.map((req, idx) => {
                    return (
                      <tr key={req.id || idx} className="border-b border-[#FAFAFA] hover:bg-gray-50/50 transition-colors duration-150">
                        {/* S.No */}
                        <td className="px-4 py-4 text-[13px] font-semibold text-[#6B7280]">
                          {currentPage * pageSize + idx + 1}
                        </td>
                        {/* Type */}
                        <td className="px-4 py-4 text-[13px] font-bold text-[#1F2937]">
                          {req.type === 'CHEMIST' ? 'Chemist / Pharmacist' : 'Doctor'}
                        </td>
                        {/* Name */}
                        <td className="px-4 py-4 text-[13px] font-bold text-[#1F2937]">
                          {req.name}
                        </td>
                        {/* Email */}
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {req.email || '—'}
                        </td>
                        {/* Phone */}
                        <td className="px-4 py-4 text-[13px] text-[#4B5563]">
                          {req.phone || '—'}
                        </td>
                        {/* Address */}
                        <td className="px-4 py-4 text-[12.5px] text-[#6B7280] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={req.address}>
                          {req.address}
                        </td>
                        {/* Role Specific Details */}
                        <td className="px-4 py-4 text-[12.5px] text-[#4B5563]">
                          {req.type === 'CHEMIST' ? (
                            <div>
                              <span className="font-semibold">Contact Person:</span> {req.chemistContactPerson || '—'}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              <div><span className="font-semibold">Speciality:</span> {req.doctorSpeciality || '—'}</div>
                              <div><span className="font-semibold">Qual:</span> {req.doctorQualification || '—'}</div>
                              <div><span className="font-semibold">License:</span> {req.doctorLicenseNumber || '—'}</div>
                            </div>
                          )}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${getStatusBadgeClass(req.status)}`}>
                            {req.status}
                          </span>
                        </td>
                        {/* Remarks */}
                        <td className="px-4 py-4 text-[12.5px] text-[#6B7280] italic max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap" title={req.remarks || ''}>
                          {req.remarks || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              isLoading={loading}
              activeBtnClass="bg-[#C8F04A] text-[#111827]"
            />
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn    { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
};

export default MRRequestsPage;

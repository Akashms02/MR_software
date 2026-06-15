import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import { API_ROUTE } from '../../data/env';
import { Card, TableWrap, Th, Td, PrimaryBtn, OutlineBtn } from '../../components/ui';
import { getFullAssetUrl } from '../../utils/getFullAssetUrl';
import { Loader2, Calendar, FileSpreadsheet, Eye, Download, AlertCircle, RefreshCw, X, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

// Date Helpers
const getTodayDateString = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const getFirstOfMonthString = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${month}-01`;
};

const getDistributorName = (d) => {
  if (!d) return '';
  if (typeof d.name === 'object' && d.name !== null) {
    return d.name.fullName || d.name.username || '';
  }
  return d.name || d.distributorName || d.fullName || '';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD to DD-MM-YYYY
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return '—';
  }
};

export default function AdminSalesPage() {
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributorId, setSelectedDistributorId] = useState('');
  const [startDate, setStartDate] = useState(getFirstOfMonthString());
  const [endDate, setEndDate] = useState(getTodayDateString());
  
  const [salesRecords, setSalesRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [distributorsLoading, setDistributorsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Group Preview Modal state
  const [previewGroup, setPreviewGroup] = useState(null);

  // Fetch distributors on mount
  useEffect(() => {
    const fetchDistributors = async () => {
      setDistributorsLoading(true);
      try {
        const response = await axios.get(`${API_ROUTE}/mr/distributors`);
        const data = response.data?.data || response.data || [];
        setDistributors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch distributors:', err);
      } finally {
        setDistributorsLoading(false);
      }
    };
    fetchDistributors();
  }, []);

  const handleFetchRecords = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const params = {
        startDate,
        endDate,
      };
      
      if (selectedDistributorId) {
        const dist = distributors.find(d => String(d.id || d._id) === String(selectedDistributorId));
        if (dist) {
          params.distributorId = dist.distributorId || dist.id || dist._id;
          const nameStr = getDistributorName(dist);
          if (nameStr) {
            params.distributorName = nameStr;
          }
        }
      }

      const response = await axios.get(`${API_ROUTE}/mr/distributors/sales`, { params });
      const data = response.data?.data || response.data || [];
      setSalesRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch sales records:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to retrieve sales logs.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch records initially & when filters change
  useEffect(() => {
    if (distributors.length >= 0) {
      handleFetchRecords();
    }
  }, [selectedDistributorId, startDate, endDate, distributors]);

  // Get grouped uploads by distributor and salesDate
  const getGroupedUploads = () => {
    const groups = [];
    salesRecords.forEach(record => {
      const distId = record.distributor?.id || record.distributor?.distributorId || 'unknown-dist';
      const distName = getDistributorName(record.distributor) || '—';
      const uploader = record.uploadedBy?.fullName || record.uploadedBy?.email || '—';
      const salesDate = record.salesDate || '';
      
      const groupKey = `${distId}-${salesDate}`;
      let group = groups.find(g => g.key === groupKey);
      if (!group) {
        group = {
          key: groupKey,
          distributorName: distName,
          createdAt: record.createdAt,
          salesDate: salesDate,
          uploader: uploader,
          records: []
        };
        groups.push(group);
      }
      group.records.push(record);
    });
    return groups;
  };

  const handleOpenGroupPreview = (group) => {
    setPreviewGroup(group);
  };

  const handleClosePreview = () => {
    setPreviewGroup(null);
  };

  const handleResetFilters = () => {
    setSelectedDistributorId('');
    setStartDate(getFirstOfMonthString());
    setEndDate(getTodayDateString());
  };

  return (
    <div className="animate-[fadeIn_0.35s_ease-out] font-sans flex flex-col gap-6">
      
      {/* Search and Filters Panel */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-gray-500" />
          <h3 className="text-[12px] font-extrabold text-[#9CA3AF] uppercase tracking-[0.5px] m-0">
            Filter Distributor Sales Sheet uploads
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          {/* Distributor Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-wide">
              Distributor
            </label>
            {distributorsLoading ? (
              <div className="h-[38px] px-3.5 bg-gray-50 border border-gray-100 rounded-lg flex items-center gap-2 text-xs text-gray-400 font-semibold">
                <Loader2 size={12} className="animate-spin" />
                Loading...
              </div>
            ) : (
              <select
                value={selectedDistributorId}
                onChange={(e) => setSelectedDistributorId(e.target.value)}
                className="w-full h-[38px] px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[13px] font-sans outline-none text-[#1F2937] bg-white font-semibold hover:border-gray-300"
              >
                <option value="">All Distributors</option>
                {distributors.map((d) => (
                  <option key={d.id || d._id} value={d.id || d._id}>
                    {getDistributorName(d)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-wide">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-[38px] px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[12.5px] font-sans outline-none text-[#1F2937] hover:border-gray-300"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-wide">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-[38px] px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[12.5px] font-sans outline-none text-[#1F2937] hover:border-gray-300"
            />
          </div>

          {/* Filter Trigger Actions */}
          <div className="flex gap-2.5">
            <PrimaryBtn
              onClick={handleFetchRecords}
              className="flex-1 justify-center h-[38px] text-xs py-0"
            >
              Apply Filter
            </PrimaryBtn>
            <OutlineBtn
              onClick={handleResetFilters}
              className="flex-1 justify-center h-[38px] text-xs py-0"
            >
              Reset
            </OutlineBtn>
          </div>
        </div>
      </Card>

      {/* Uploads Data Log */}
      <div className="relative flex flex-col min-h-[400px]">
        {/* Loading Spinner overlay */}
        {loading && (
          <div className="bg-white/75 backdrop-blur-[1px] absolute inset-0 flex items-center justify-center z-10 rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="animate-spin text-[#10B981]" size={28} />
              <span className="text-[13px] font-bold text-[#1E2937]">Retrieving sales upload history...</span>
            </div>
          </div>
        )}

        {/* Error notification banner */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2.5 px-4 py-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-[#B91C1C] text-[13px] font-medium shrink-0">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Records list table */}
        {getGroupedUploads().length === 0 ? (
          <Card className="px-6 py-12 text-center bg-white border border-dashed border-[#E5E7EB] flex-1 flex flex-col justify-center items-center">
            <FileSpreadsheet size={40} className="text-gray-300 mb-3" />
            <h4 className="text-[14.5px] font-extrabold text-[#374151] m-0 mb-1">No Sales Records Found</h4>
            <p className="text-[12px] text-[#6B7280] m-0 max-w-[380px]">
              No sales records have been logged by MRs for the selected date range or distributor.
            </p>
          </Card>
        ) : (
          <TableWrap>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th>Sales Date</Th>
                  <Th>Distributor Name</Th>
                  <Th>Uploaded By</Th>
                  <Th>Upload Timestamp</Th>
                  <Th>Items Count</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {getGroupedUploads().map((group) => {
                  return (
                    <tr key={group.key} className="hover:bg-gray-50/40 transition-colors">
                      <Td className="font-semibold text-gray-900">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{formatDate(group.salesDate)}</span>
                        </div>
                      </Td>
                      <Td className="font-bold text-[#1F2937]">{group.distributorName}</Td>
                      <Td className="font-semibold">{group.uploader}</Td>
                      <Td className="text-gray-500 text-[12.5px] font-medium">
                        {formatDateTime(group.createdAt)}
                      </Td>
                      <Td className="font-medium text-gray-600">
                        <span className="bg-[#EFF6FF] text-[#1D4ED8] text-xs font-bold px-2.5 py-1 rounded-full">
                          {group.records.length} Items
                        </span>
                      </Td>
                      <Td>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleOpenGroupPreview(group)}
                            className="h-8 px-3 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 border border-gray-200 text-gray-500 font-bold text-[12px] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          >
                            <Eye size={13} />
                            View Excel Data
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </div>

      {/* Spreadsheet Modal Preview */}
      {previewGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-[800px] max-h-[85vh] flex flex-col overflow-hidden shadow-[0_24px_56px_rgba(0,0,0,0.22)] animate-[scaleIn_0.22s_ease-out]">
            
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-4.5 flex justify-between items-center shrink-0">
              <div className="min-w-0">
                <span className="text-white/60 text-[10px] font-extrabold uppercase tracking-wider block">Excel Data View</span>
                <span className="text-white font-extrabold text-[15px] truncate block mt-0.5">
                  {previewGroup.distributorName} - Sales Sheet ({formatDate(previewGroup.salesDate)})
                </span>
              </div>
              <button
                onClick={handleClosePreview}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border-none text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Content area */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col min-h-0 bg-gray-50/50">
              <div className="border border-gray-150 rounded-xl overflow-auto bg-white flex-1 max-h-[450px]">
                <table className="w-full border-collapse text-left text-[12px] font-sans">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 sticky top-0">
                      <th className="px-4 py-3 text-[10.5px] font-extrabold text-gray-400 uppercase tracking-wider border-r border-gray-150/40">Sales Date</th>
                      <th className="px-4 py-3 text-[10.5px] font-extrabold text-gray-400 uppercase tracking-wider border-r border-gray-150/40">Product Name</th>
                      <th className="px-4 py-3 text-[10.5px] font-extrabold text-gray-400 uppercase tracking-wider border-r border-gray-150/40">Quantity</th>
                      <th className="px-4 py-3 text-[10.5px] font-extrabold text-gray-400 uppercase tracking-wider border-r border-gray-150/40">Unit Price</th>
                      <th className="px-4 py-3 text-[10.5px] font-extrabold text-gray-400 uppercase tracking-wider last:border-none">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewGroup.records.map((r, idx) => {
                      return (
                        <tr key={r.id || idx} className="border-b border-gray-100 hover:bg-gray-50/30 transition-colors">
                          <td className="px-4 py-2.5 text-gray-600 border-r border-gray-50 font-medium">{formatDate(r.salesDate)}</td>
                          <td className="px-4 py-2.5 text-gray-700 border-r border-gray-50 font-semibold">{r.productName || '—'}</td>
                          <td className="px-4 py-2.5 text-gray-650 border-r border-gray-50 font-medium">{r.quantity || 0}</td>
                          <td className="px-4 py-2.5 text-gray-650 border-r border-gray-50 font-medium">₹{(r.unitPrice || 0).toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-[#047857] font-bold">₹{(r.totalAmount || 0).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
              <span className="text-[11px] text-gray-400 font-semibold">
                Uploaded By: {previewGroup.uploader} · {previewGroup.records.length} Total Records
              </span>
              <div className="flex gap-2">
                <OutlineBtn onClick={handleClosePreview} className="py-2 px-4 text-xs font-bold font-sans">
                  Close
                </OutlineBtn>
              </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, TableWrap, Th, Td, PrimaryBtn, OutlineBtn } from '../../components/ui';
import { Loader2, Calendar, FileSpreadsheet, Eye, Download, AlertCircle, RefreshCw, X, Filter } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { distributerActivityReport, getDistributorsList } from '../../redux/actions/reportActions';
import Pagination from '../../components/common/Pagination';

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

export default function DistributerReport() {
  const dispatch = useDispatch();
  
  const [selectedDistributorId, setSelectedDistributorId] = useState('');
  const [startDate, setStartDate] = useState(getFirstOfMonthString());
  const [endDate, setEndDate] = useState(getTodayDateString());

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedDistributorId, startDate, endDate]);
  
  // Select state from redux reports store
  const { loading, error, distributesReport, distributorsList } = useSelector(state => state.reports || {});
  const [errorMsg, setErrorMsg] = useState(null);

  // Group Preview Modal state
  const [previewGroup, setPreviewGroup] = useState(null);

  const distributors = Array.isArray(distributorsList) ? distributorsList : [];

  // Fetch distributors on mount via Redux action
  useEffect(() => {
    dispatch(getDistributorsList());
  }, [dispatch]);

  const handleFetchRecords = () => {
    setErrorMsg(null);
    
    const params = {
      startDate: startDate || '2000-01-01',
      endDate: endDate || '2099-12-31',
      size: 100000
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

    dispatch(distributerActivityReport(params));
  };

  // Fetch records initially & when distributor or date range changes
  useEffect(() => {
    if (distributors.length >= 0) {
      handleFetchRecords();
    }
  }, [selectedDistributorId, startDate, endDate, distributors.length, dispatch]);

  // Get grouped uploads by distributor and uploadDate (createdAt portion)
  const getGroupedUploads = () => {
    const groups = [];
    const salesRecords = Array.isArray(distributesReport) ? distributesReport : [];
    
    salesRecords.forEach(record => {
      const distName = record.distributorName || getDistributorName(record.distributor) || '—';
      const distId = record.distributor?.id || record.distributor?.distributorId || record.distributorName || 'unknown-dist';
      
      let uploader = '—';
      if (record.mrName) {
        uploader = record.mrName;
      } else if (record.uploadedBy && record.uploadedBy.fullName) {
        uploader = record.uploadedBy.fullName;
      } else if (record.mrEmail) {
        uploader = record.mrEmail;
      } else if (record.uploadedBy && record.uploadedBy.email) {
        uploader = record.uploadedBy.email;
      }

      const uploadDate = record.createdAt ? record.createdAt.split('T')[0] : '';
      
      const recTime = record.createdAt ? new Date(record.createdAt).getTime() : 0;
      let group = groups.find(g => {
        if (g.distributorId !== distId || g.uploader !== uploader) return false;
        const groupTime = g.createdAt ? new Date(g.createdAt).getTime() : 0;
        return Math.abs(recTime - groupTime) < 5000;
      });

      if (!group) {
        group = {
          key: `${distId}-${record.createdAt}`,
          distributorId: distId,
          distributorName: distName,
          createdAt: record.createdAt || null,
          uploadDate: uploadDate,
          uploader: uploader,
          records: []
        };
        groups.push(group);
      }
      group.records.push(record);
    });

    // Sort grouped uploads by upload date descending
    return groups.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  };

  const handleOpenGroupPreview = (group) => {
    setPreviewGroup(group);
  };

  const handleClosePreview = () => {
    setPreviewGroup(null);
  };

  const handleExportGroupToExcel = (group) => {
    try {
      const rows = group.records.map((r) => ({
        'Sales Date': formatDate(r.salesDate),
        'Product Name': r.productName || '—',
        'Quantity': r.quantity || 0,
        'Unit Price': r.unitPrice || 0,
        'Total Amount': r.totalAmount || 0,
        'MR Name': r.mrName || '—',
        'MR Email': r.mrEmail || '—',
      }));

      // Create worksheet with top lines
      const worksheet = XLSX.utils.aoa_to_sheet([
        ['Distributor Name:', group.distributorName],
        ['Created Date:', formatDateTime(group.createdAt)],
        [] // empty row for spacing
      ]);

      // Add the JSON table starting at A4
      XLSX.utils.sheet_add_json(worksheet, rows, { origin: 'A4' });

      // Set column widths to prevent truncation and improve spacing
      worksheet['!cols'] = [
        { wch: 15 }, // Sales Date
        { wch: 25 }, // Product Name
        { wch: 12 }, // Quantity
        { wch: 15 }, // Unit Price
        { wch: 18 }, // Total Amount
        { wch: 20 }, // MR Name
        { wch: 25 }, // MR Email
      ];

      // Define styles matching the visual Excel preview
      const headerStyle = {
        fill: { fgColor: { rgb: "107C41" } }, // Excel Green
        font: { color: { rgb: "FFFFFF" }, bold: true, name: "Calibri", sz: 11 },
        alignment: { vertical: "center", horizontal: "center" },
        border: {
          top: { style: "thin", color: { rgb: "0E6C38" } },
          bottom: { style: "thin", color: { rgb: "0E6C38" } },
          left: { style: "thin", color: { rgb: "0E6C38" } },
          right: { style: "thin", color: { rgb: "0E6C38" } },
        }
      };

      const borderStyle = {
        top: { style: "thin", color: { rgb: "D1D5DB" } },
        bottom: { style: "thin", color: { rgb: "D1D5DB" } },
        left: { style: "thin", color: { rgb: "D1D5DB" } },
        right: { style: "thin", color: { rgb: "D1D5DB" } },
      };

      // Apply styles to all cell keys in the worksheet
      for (const cellRef in worksheet) {
        if (cellRef[0] === '!') continue; // Skip metadata keys like !cols

        const colLetter = cellRef.replace(/[0-9]/g, '');
        const rowNum = parseInt(cellRef.replace(/[^0-9]/g, ''), 10);

        if (rowNum === 4) {
          // Style header row
          worksheet[cellRef].s = { ...headerStyle };
          // Left-align product name and MR info headers, right-align numeric headers
          if (colLetter === 'B' || colLetter === 'F' || colLetter === 'G') {
            worksheet[cellRef].s.alignment = { vertical: "center", horizontal: "left" };
          } else if (colLetter === 'C' || colLetter === 'D' || colLetter === 'E') {
            worksheet[cellRef].s.alignment = { vertical: "center", horizontal: "right" };
          }
        } else if (rowNum > 4) {
          // Style data rows
          worksheet[cellRef].s = {
            border: borderStyle,
            alignment: { vertical: "center", horizontal: "left" }
          };

          // Column specific alignments
          if (colLetter === 'A') {
            worksheet[cellRef].s.alignment.horizontal = "center";
          } else if (colLetter === 'C' || colLetter === 'D' || colLetter === 'E') {
            worksheet[cellRef].s.alignment.horizontal = "right";
          }

          // Optional Zebra striping (very light grey color for even rows)
          if (rowNum % 2 === 0) {
            worksheet[cellRef].s.fill = { fgColor: { rgb: "F9FAFB" } };
          }
        } else {
          // Style top info rows (rows 1 and 2)
          worksheet[cellRef].s = {
            font: { bold: colLetter === 'A', name: "Calibri", sz: 11 },
            alignment: { vertical: "center", horizontal: "left" }
          };
        }
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Data');

      const safeDistName = group.distributorName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${safeDistName}_sales_${group.uploadDate}.xlsx`;

      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error('Failed to export to Excel:', err);
    }
  };

  const handleResetFilters = () => {
    setSelectedDistributorId('');
    setStartDate(getFirstOfMonthString());
    setEndDate(getTodayDateString());
  };

  const currentLogs = getGroupedUploads();
  const renderError = error || errorMsg;

  return (
    <div className="animate-[fadeSlideIn_0.35s_ease-out] flex flex-col h-[calc(100vh-104px)] min-h-0 overflow-hidden p-1">
      
      {/* Unified Main Card containing Filters and Table */}
      <div className="bg-white rounded-[20px] border-[1.5px] border-[#F3F4F6] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
        
        {/* Filters Header Section */}
        <div className="flex flex-col gap-4 border-b border-[#F3F4F6] pb-5 mb-5 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="m-0 text-[16px] font-extrabold text-[#1F2937]">Distributor Sales Reports</h3>
            <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[11px] uppercase tracking-wide">
              <Filter size={13} />
              <span>Filters</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            {/* Distributor Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-wide">
                Distributor
              </label>
              {loading && distributors.length === 0 ? (
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

            {/* Reset Action */}
            <div className="flex">
              <OutlineBtn
                onClick={handleResetFilters}
                className="w-full justify-center h-[38px] text-xs py-0 font-bold border-gray-200 hover:bg-gray-50 text-gray-700"
              >
                Reset Filters
              </OutlineBtn>
            </div>
          </div>
        </div>

        {/* Data Log and Table Area */}
        <div className="relative flex-1 flex flex-col min-h-0">
          {/* Loading Spinner overlay */}
          {loading && (
            <div className="bg-white/75 backdrop-blur-[1px] absolute inset-0 flex items-center justify-center z-10 rounded-2xl">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="animate-spin text-gray-700" size={28} />
                <span className="text-[13px] font-bold text-[#1E2937]">Retrieving sales upload history...</span>
              </div>
            </div>
          )}

          {/* Error notification banner */}
          {renderError && (
            <div className="mb-4 flex items-center gap-2.5 px-4 py-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-[#B91C1C] text-[13px] font-medium shrink-0">
              <AlertCircle size={16} />
              <span>{renderError}</span>
            </div>
          )}

          {/* Records list table */}
          {currentLogs.length === 0 ? (
            <div className="px-6 py-12 text-center bg-white border border-dashed border-[#E5E7EB] rounded-2xl flex-1 flex flex-col justify-center items-center">
              <FileSpreadsheet size={40} className="text-gray-300 mb-3" />
              <h4 className="text-[14.5px] font-extrabold text-[#374151] m-0 mb-1">No Sales Records Found</h4>
              <p className="text-[12px] text-[#6B7280] m-0 max-w-[380px]">
                No sales records have been logged for the selected date range or distributor.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Scrollable table area */}
              <div className="flex-1 overflow-auto min-h-0 rounded-xl border border-[#F3F4F6]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="sticky top-0 bg-white z-[10] border-b border-[#F3F4F6]">
                      <Th className="sticky top-0 bg-white">Upload Date</Th>
                      <Th className="sticky top-0 bg-white">Distributor Name</Th>
                      <Th className="sticky top-0 bg-white">Uploaded By</Th>
                      <Th className="sticky top-0 bg-white">Upload Timestamp</Th>
                      <Th className="sticky top-0 bg-white">Items Count</Th>
                      <Th className="text-right sticky top-0 bg-white">View</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLogs.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((group) => {
                      return (
                        <tr key={group.key} className="hover:bg-gray-50/40 transition-colors border-b border-[#FAFAFA]">
                          <Td className="font-semibold text-gray-900">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-gray-400" />
                              <span>{formatDate(group.uploadDate)}</span>
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
                          <Td className="text-right">
                            <button
                              onClick={() => handleOpenGroupPreview(group)}
                              className="h-8 px-3.5 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 border border-gray-200 text-gray-500 font-bold text-[12px] flex items-center gap-1 cursor-pointer transition-all active:scale-95 ml-auto"
                            >
                              <Eye size={13} />
                              View
                            </button>
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination pinned at bottom */}
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(currentLogs.length / pageSize)}
                totalElements={currentLogs.length}
                pageSize={pageSize}
                onPageChange={(page) => setCurrentPage(page)}
                isLoading={loading}
                activeBtnClass="bg-[#C8F04A] text-[#111827]"
              />
            </div>
          )}
        </div>
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
                  {previewGroup.distributorName} - Sales Sheet ({formatDate(previewGroup.uploadDate)})
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
              <div className="border border-gray-250 rounded-xl overflow-auto bg-white flex-1 max-h-[450px]">
                <table className="w-full border-collapse text-[12px] font-sans border border-gray-200">
                  <thead>
                    <tr className="bg-[#107C41] text-white border-b border-gray-300 sticky top-0 z-10">
                      <th className="w-[15%] min-w-[120px] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-center border-r border-[#0e6c38] text-white">Sales Date</th>
                      <th className="w-[43%] min-w-[220px] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-left border-r border-[#0e6c38] text-white">Product Name</th>
                      <th className="w-[12%] min-w-[90px] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-right border-r border-[#0e6c38] text-white">Quantity</th>
                      <th className="w-[15%] min-w-[120px] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-right border-r border-[#0e6c38] text-white">Unit Price</th>
                      <th className="w-[15%] min-w-[130px] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-right text-white">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewGroup.records.map((r, idx) => {
                      return (
                        <tr key={r.id || idx} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors odd:bg-white even:bg-gray-50/30">
                          <td className="px-4 py-2.5 text-center text-gray-600 border-r border-gray-200 font-medium">{formatDate(r.salesDate)}</td>
                          <td className="px-4 py-2.5 text-left text-gray-800 border-r border-gray-200 font-semibold">{r.productName || '—'}</td>
                          <td className="px-4 py-2.5 text-right text-gray-700 border-r border-gray-200 font-medium">{r.quantity || 0}</td>
                          <td className="px-4 py-2.5 text-right text-gray-700 border-r border-gray-200 font-medium">₹{(r.unitPrice || 0).toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-right text-[#047857] font-bold">₹{(r.totalAmount || 0).toFixed(2)}</td>
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
                <PrimaryBtn onClick={() => handleExportGroupToExcel(previewGroup)} className="py-2 px-4 text-xs font-bold font-sans flex items-center gap-1">
                  <Download size={13} />
                  Export Excel
                </PrimaryBtn>
              </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
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
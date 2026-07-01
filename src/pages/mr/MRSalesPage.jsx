import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axiosInstance';
import { API_ROUTE } from '../../data/env';
import { Loader2, FileSpreadsheet, Calendar, Upload, AlertCircle, CheckCircle2, ChevronRight, HelpCircle, X, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';

const MRSalesPage = () => {
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributorId, setSelectedDistributorId] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Fetch Distributors list on mount
  useEffect(() => {
    const fetchDistributors = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const response = await axios.get(`${API_ROUTE}/mr/distributors`);
        const rawData = response.data?.data || response.data;
        const list = Array.isArray(rawData) 
          ? rawData 
          : (rawData && Array.isArray(rawData.content) ? rawData.content : []);
        setDistributors(list);
      } catch (err) {
        console.error('Failed to fetch distributors:', err);
        setErrorMsg('Failed to load distributors. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDistributors();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getDistributorName = (d) => {
    if (!d) return '';
    if (typeof d.name === 'object' && d.name !== null) {
      return d.name.fullName || d.name.username || '';
    }
    return d.name || d.distributorName || d.fullName || '';
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(true);

    const exactMatch = distributors.find(
      (d) => String(getDistributorName(d)).toLowerCase() === value.toLowerCase().trim()
    );
    if (exactMatch) {
      setSelectedDistributorId(exactMatch.id || exactMatch._id);
    } else {
      setSelectedDistributorId('');
    }
  };

  const handleSelectDistributor = (distributor) => {
    setSelectedDistributorId(distributor.id || distributor._id);
    setInputValue(getDistributorName(distributor));
    setIsOpen(false);
  };

  const handleAddCustomDistributor = () => {
    setSelectedDistributorId('');
    setIsOpen(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(extension)) {
      setErrorMsg('Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV file.');
      setFile(null);
      setPreviewData([]);
      return;
    }

    setFile(selectedFile);
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Parse spreadsheet as an array of arrays
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          setErrorMsg('The selected spreadsheet seems to be empty.');
          setPreviewData([]);
          return;
        }

        setPreviewData(jsonData);
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to parse the Excel file. It may be corrupted.');
        setPreviewData([]);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewData([]);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalDistributorName = inputValue.trim();
    if (!finalDistributorName) {
      setErrorMsg('Please select or type a distributor.');
      return;
    }
    if (!file) {
      setErrorMsg('Please upload a sales Excel sheet.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('distributorName', finalDistributorName);
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_ROUTE}/mr/distributors/sales/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMsg('Sales spreadsheet uploaded successfully!');
      // Reset form
      setSelectedDistributorId('');
      setInputValue('');
      setFile(null);
      setPreviewData([]);
    } catch (err) {
      console.error('Upload failed:', err);
      const errDetail = err.response?.data?.message || err.message || 'Server error occurred during upload.';
      setErrorMsg(`Upload failed: ${errDetail}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Preview formatting helpers
  const maxPreviewRows = 15;
  const hasMoreRows = previewData.length > maxPreviewRows;
  const previewRows = previewData.slice(0, maxPreviewRows);

  // Find max columns to render properly structured rows
  const maxCols = previewRows.reduce((max, row) => Math.max(max, row.length), 0);

  return (
    <div className="animate-[fadeSlideIn_0.35s_ease-out] flex flex-col gap-6 min-h-0">
      
      {/* Toast Notifications */}
      {successMsg && (
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] px-5 py-3.5 rounded-2xl flex items-center gap-2.5 text-[#047857] text-[13.5px] font-bold shadow-sm shrink-0">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] px-5 py-3.5 rounded-2xl flex items-center gap-2.5 text-[#B91C1C] text-[13.5px] font-bold shadow-sm shrink-0">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload and Form Config Card */}
      <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-5">
            {/* Distributor Dropdown */}
            <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
              <label className="block text-[12px] font-bold text-gray-750 uppercase tracking-wider">
                Distributor <span className="text-rose-500">*</span>
              </label>
              {loading ? (
                <div className="h-[42px] px-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2 text-[13px] text-gray-400 font-semibold">
                  <Loader2 size={14} className="animate-spin" />
                  Loading distributors...
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search or type new distributor"
                    className="w-full h-[42px] pl-3.5 pr-12 rounded-xl border border-gray-200 text-[13.5px] font-sans text-gray-800 outline-none bg-white font-medium hover:border-gray-300 focus:border-[#C8F04A] transition-all"
                    required
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    {inputValue && (
                      <button
                        type="button"
                        onClick={() => {
                          setInputValue('');
                          setSelectedDistributorId('');
                          setIsOpen(true);
                        }}
                        className="text-gray-400 hover:text-gray-650 transition-colors p-1"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsOpen(!isOpen)}
                      className="text-gray-400 hover:text-gray-650 transition-colors p-1"
                    >
                      <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] py-1">
                      {distributors.filter(d => 
                        String(getDistributorName(d)).toLowerCase().includes(inputValue.toLowerCase())
                      ).length > 0 ? (
                        distributors.filter(d => 
                          String(getDistributorName(d)).toLowerCase().includes(inputValue.toLowerCase())
                        ).map((d) => (
                          <button
                            key={d.id || d._id}
                            type="button"
                            onClick={() => handleSelectDistributor(d)}
                            className={`w-full text-left px-3.5 py-2.5 text-[13px] hover:bg-gray-50 text-gray-755 font-medium cursor-pointer transition-colors flex justify-between items-center ${
                              String(d.id || d._id) === String(selectedDistributorId) ? 'bg-gray-50 text-gray-900 font-semibold' : ''
                            }`}
                          >
                            <span>{getDistributorName(d)}</span>
                            {String(d.id || d._id) === String(selectedDistributorId) && (
                              <span className="text-[11px] text-emerald-600 font-bold bg-[#E6F4EA] px-2 py-0.5 rounded">Selected</span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-3.5 py-2.5 text-[12.5px] text-gray-400 font-medium italic">
                          No matching distributor found.
                        </div>
                      )}

                      {inputValue.trim() && !distributors.some(d => 
                        String(getDistributorName(d)).toLowerCase() === inputValue.toLowerCase().trim()
                      ) && (
                        <button
                          type="button"
                          onClick={handleAddCustomDistributor}
                          className="w-full text-left px-3.5 py-2.5 text-[13px] border-t border-gray-50 text-[#4F46E5] hover:bg-[#4F46E5]/5 font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <span>+ Use "{inputValue.trim()}" as new distributor</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Excel File Upload Drag & Drop */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-[12px] font-bold text-gray-755 uppercase tracking-wider">
              Upload Excel Spreadsheet <span className="text-rose-500">*</span>
            </label>
            
            {!file ? (
              <label className="border-2 border-dashed border-gray-200 rounded-2xl p-8 bg-gray-50/50 hover:bg-gray-50 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all duration-200">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-gray-600 transition-colors">
                  <Upload size={20} />
                </div>
                <div className="text-center">
                  <span className="text-[13.5px] font-bold text-gray-800 block">Click to upload spreadsheet</span>
                  <span className="text-[11.5px] text-gray-400 mt-1 block">Supports .xlsx, .xls, .csv files</span>
                </div>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="p-4 rounded-2xl border border-emerald-100 bg-[#F0FDF4] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[13px] font-bold text-gray-800 truncate block">
                      {file.name}
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB · Spreadsheet Loaded
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-100 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end border-t border-gray-100 pt-5 mt-2">
            <button
              type="submit"
              disabled={submitting || !inputValue.trim() || !file}
              className={`flex items-center gap-2 py-3 px-6 rounded-xl border-none text-[13.5px] font-extrabold transition-all duration-150 outline-none ${
                submitting || !inputValue.trim() || !file
                  ? 'bg-gray-150 text-gray-400 cursor-not-allowed'
                  : 'bg-[#C8F04A] text-gray-900 shadow-[0_4px_12px_rgba(200,240,74,0.25)] hover:opacity-90 active:scale-98 cursor-pointer'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Uploading Spreadsheet...
                </>
              ) : (
                'Submit Sales Data'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Spreadsheet Live Preview Section */}
      {previewData.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50 shrink-0">
            <div>
              <h3 className="text-[15px] font-extrabold text-gray-900 m-0">Spreadsheet Live Preview</h3>
              <p className="text-[11px] text-gray-400 m-0 mt-0.5">
                Loaded {previewData.length} rows from file. Showing first {Math.min(previewData.length, maxPreviewRows)} rows.
              </p>
            </div>
            <span className="bg-[#EFF6FF] text-[#1D4ED8] text-[10.5px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Preview Mode
            </span>
          </div>

          <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[350px] border border-gray-100 rounded-xl">
            <table className="w-full border-collapse text-left text-[12.5px] font-sans">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 sticky top-0">
                  {Array.from({ length: maxCols }).map((_, colIdx) => (
                    <th
                      key={colIdx}
                      className="px-4 py-3 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider border-r border-gray-100/30 last:border-none"
                    >
                      {colIdx === 0 ? 'Row 1 (Header)' : `Col ${colIdx + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={`border-b border-gray-50 hover:bg-gray-50/40 transition-colors ${
                      rowIdx === 0 ? 'bg-gray-50/20 font-semibold' : ''
                    }`}
                  >
                    {Array.from({ length: maxCols }).map((_, colIdx) => {
                      const cellValue = row[colIdx];
                      return (
                        <td
                          key={colIdx}
                          className="px-4 py-2.5 text-gray-700 border-r border-gray-50 last:border-none font-medium truncate max-w-[160px]"
                          title={cellValue !== undefined ? String(cellValue) : ''}
                        >
                          {cellValue !== undefined ? String(cellValue) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMoreRows && (
            <div className="mt-3 text-center text-[11.5px] font-semibold text-gray-400 italic bg-gray-50/40 py-2.5 rounded-xl border border-gray-50/80 shrink-0">
              ... and {previewData.length - maxPreviewRows} more rows are loaded and will be uploaded.
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default MRSalesPage;
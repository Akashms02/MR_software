import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchPayslipAction,
  fetchLatestPayslipAction,
  fetchRelievingLetterAction,
  fetchTerminationLetterAction
} from '../../redux/actions/documentActions';
import { Calendar, Download, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getFullAssetUrl } from '../../utils/getFullAssetUrl';
import useProtectedUrl from '../../hooks/useProtectedUrl';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function MSEDocument() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [selectedDocType, setSelectedDocType] = useState('payslip'); // 'payslip', 'relieving', 'termination'
  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info'); 

  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    if (type !== 'loading') {
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const [payslipData, setPayslipData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const empName = user?.fullName || user?.name || 'Medical Sales Executive';

  const fetchPayslip = async (monthInput) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [year, monthNum] = monthInput.split('-');
      const monthName = MONTH_NAMES[parseInt(monthNum) - 1];
      const data = await dispatch(fetchPayslipAction(monthName, year));
      setPayslipData(data);
      if (data) {
        const urlVal = data.payslipUrl || data.documentUrl || data.document_url || data.url || data.path || '';
        setPdfUrl(urlVal);
      } else {
        setPdfUrl('');
      }
    } catch (err) {
      console.error("Error fetching payslip:", err);
      setPayslipData(null);
      setPdfUrl('');
      setErrorMsg(err.message || "Failed to load payslip for this period.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestPayslip = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await dispatch(fetchLatestPayslipAction());
      if (data) {
        setPayslipData(data);
        const monthIndex = MONTH_NAMES.indexOf(data.month);
        if (monthIndex !== -1 && data.year) {
          const monthStr = String(monthIndex + 1).padStart(2, '0');
          setSelectedMonth(`${data.year}-${monthStr}`);
        }
        const urlVal = data.payslipUrl || data.documentUrl || data.document_url || data.url || data.path || '';
        setPdfUrl(urlVal);
      } else {
        fetchPayslip(selectedMonth);
      }
    } catch (err) {
      console.error("Error fetching latest payslip:", err);
      fetchPayslip(selectedMonth);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelievingLetter = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const blob = await dispatch(fetchRelievingLetterAction());
      if (blob && blob.size > 0 && blob.type !== 'application/json') {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
        if (blob && blob.type === 'application/json') {
          try {
            const text = await blob.text();
            const json = JSON.parse(text);
            setErrorMsg(json.message || "No relieving letter has been issued yet. Please contact HR.");
          } catch {
            setErrorMsg("No relieving letter has been issued yet. Please contact HR.");
          }
        } else {
          setErrorMsg("No relieving letter has been issued yet. Please contact HR.");
        }
      }
    } catch (err) {
      console.error("Error fetching relieving letter:", err);
      setPreviewUrl(null);
      setErrorMsg("No relieving letter has been issued yet. Please contact HR.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTerminationLetter = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const blob = await dispatch(fetchTerminationLetterAction());
      if (blob && blob.size > 0 && blob.type !== 'application/json') {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
        if (blob && blob.type === 'application/json') {
          try {
            const text = await blob.text();
            const json = JSON.parse(text);
            setErrorMsg(json.message || "No termination letter has been issued yet. Please contact HR.");
          } catch {
            setErrorMsg("No termination letter has been issued yet. Please contact HR.");
          }
        } else {
          setErrorMsg("No termination letter has been issued yet. Please contact HR.");
        }
      }
    } catch (err) {
      console.error("Error fetching termination letter:", err);
      setPreviewUrl(null);
      setErrorMsg("No termination letter has been issued yet. Please contact HR.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPdfUrl('');
    setErrorMsg(null);
    if (selectedDocType === 'payslip') {
      fetchLatestPayslip();
    } else if (selectedDocType === 'relieving') {
      fetchRelievingLetter();
    } else if (selectedDocType === 'termination') {
      fetchTerminationLetter();
    }
  }, [selectedDocType]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleMonthChange = (e) => {
    const val = e.target.value;
    setSelectedMonth(val);
    fetchPayslip(val);
  };

  const getCleanPath = (path) => {
    if (!path) return '';
    let clean = path;
    if (clean.includes('gmaxepay.com')) {
      try {
        const urlObj = new URL(clean);
        clean = urlObj.pathname;
      } catch {
        // ignore
      }
    }
    clean = clean.replace(/^\/?api\/v1\/files\//i, '');
    clean = clean.replace(/^\//, '');
    return clean;
  };

  const getFormattedMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const cleanedPdfPath = getCleanPath(pdfUrl);
  const { url: blobUrl } = useProtectedUrl(cleanedPdfPath);
  const pdfPath = selectedDocType === 'payslip' ? blobUrl : previewUrl;

  const handleDownload = () => {
    const downloadPath = pdfPath || (selectedDocType === 'payslip' ? getFullAssetUrl(pdfUrl) : null);
    if (!downloadPath) {
      showToast('Document not available to download.', 'error');
      return;
    }
    setDownloading(true);
    showToast('Downloading your document...', 'loading');
    try {
      const formattedMonth = getFormattedMonth(selectedMonth).replace(/\s+/g, '_').toLowerCase();
      const filename = selectedDocType === 'payslip'
        ? `payslip_mse_${empName.replace(/\s+/g, '_').toLowerCase()}_${formattedMonth}.pdf`
        : `${selectedDocType}_letter_mse_${empName.replace(/\s+/g, '_').toLowerCase()}.pdf`;

      const link = document.createElement('a');
      link.href = downloadPath;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Document downloaded successfully!', 'success');
    } catch (err) {
      console.error('Download failed:', err);
      showToast('Failed to download document.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="animate-[fadeSlideIn_0.35s_ease-out] flex flex-col h-[calc(100vh-104px)] min-h-0 overflow-hidden">
      {/* Top Controls Row */}
      <div className="flex justify-between items-center mb-4 shrink-0 flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Doc Type Selector */}
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-extrabold text-gray-500 uppercase tracking-[1px] flex items-center gap-1.5">
              <FileText size={14} className="text-gray-400" /> Document Type:
            </span>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-gray-255 text-[13px] bg-white outline-none font-bold text-[#111827] focus:border-[#0D9488] transition-colors duration-150 cursor-pointer"
            >
              <option value="payslip">Payslip</option>
              <option value="relieving">Relieving Letter</option>
              <option value="termination">Termination Letter</option>
            </select>
          </div>

          {/* Month Select (Only for Payslips) */}
          {selectedDocType === 'payslip' && (
            <div className="flex items-center gap-3 animate-[fadeSlideIn_0.2s_ease-out]">
              <span className="text-[12px] font-extrabold text-gray-500 uppercase tracking-[1px] flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" /> Select Month:
              </span>
              <input
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="px-3.5 py-2 rounded-xl border border-gray-255 text-[13px] bg-white outline-none font-bold text-[#111827] focus:border-[#0D9488] transition-colors duration-150 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloading || loading || !!errorMsg || !pdfPath}
          className="flex items-center gap-1.5 px-[18px] py-2 rounded-xl border-none bg-[#0D9488] text-white font-extrabold text-[12.5px] cursor-pointer shadow-[0_4px_12px_rgba(13,148,136,0.2)] hover:opacity-90 transition-opacity duration-150 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download size={14} strokeWidth={2.5} /> {downloading ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>

      {/* Preview Container Card */}
      <div className="bg-[#F8FAFC] rounded-[20px] border border-[#E5E7EB] p-6 flex-1 flex justify-center items-start overflow-y-auto min-h-0">
        {loading ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0D9488] rounded-full animate-spin mb-3"></div>
            <p className="text-[14px] font-bold text-gray-900 m-0">Loading Document...</p>
          </div>
        ) : errorMsg ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 text-gray-400 animate-[fadeSlideIn_0.25s_ease-out]">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-3">
              <FileText size={24} className="text-amber-500" />
            </div>
            <p className="text-[14px] font-bold text-gray-955 m-0">{errorMsg}</p>
            <p className="text-[12px] text-gray-400 m-0 mt-1">Please select a different document or contact HR.</p>
          </div>
        ) : pdfPath ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-4 max-w-[800px] w-full flex flex-col items-center animate-[fadeSlideIn_0.25s_ease-out]">
            <iframe
              src={`${pdfPath}#toolbar=0&navpanes=0`}
              style={{ width: '100%', height: '700px', display: 'block', border: 'none' }}
              title="Document PDF Preview"
            />
          </div>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 text-gray-400 animate-[fadeSlideIn_0.25s_ease-out]">
            <p className="text-slate-400 font-bold">Selected document is not available.</p>
          </div>
        )}
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl bg-[#111827] border border-[#1F2937] px-5 py-3.5 text-white shadow-2xl animate-[slideUp_0.3s_ease-out]">
          {toastType === 'loading' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
          {toastType === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toastType === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span className="text-[13px] font-extrabold tracking-wide">{toastMessage}</span>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

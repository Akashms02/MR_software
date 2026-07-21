import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../api/axiosInstance';
import { API_ROUTE } from '../../data/env';
import { useToast } from '../../context/ToastContext';
import { 
  Plus, Trash2, FileText, Image, Search, ChevronLeft, 
  Upload, Tag, List, Calendar, User, Info, Loader2, Eye
} from 'lucide-react';

export default function AdminVisualAidPage() {
  const { user } = useSelector(state => state.auth);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('catalogs'); // 'catalogs' | 'logs'
  const [brochures, setBrochures] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom builder state
  const [builderBrochure, setBuilderBrochure] = useState(null); // When not null, show the builder screen

  // Upload/Create Brochure Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState('pdf'); // 'pdf' | 'custom'
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Add custom page state
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageTitle, setPageTitle] = useState('');
  const [pageDesc, setPageDesc] = useState('');
  const [pageKeywords, setPageKeywords] = useState('');
  const [pageFile, setPageFile] = useState(null);

  // Logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logSearch, setLogSearch] = useState('');

  useEffect(() => {
    fetchBrochures();
  }, []);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const fetchBrochures = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_ROUTE}/visual-aids`);
      setBrochures(res.data.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch brochures', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await axios.get(`${API_ROUTE}/visual-aids/presentations`);
      setLogs(res.data.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch presentation logs', 'error');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleCreateBrochure = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    setSubmitting(true);
    showToast('Creating brochure...', 'loading');

    try {
      if (createMode === 'pdf') {
        if (!selectedFile) {
          showToast('Please select a PDF file', 'error');
          setSubmitting(false);
          return;
        }
        const formData = new FormData();
        formData.append('title', newTitle);
        formData.append('description', newDesc);
        formData.append('file', selectedFile);

        const res = await axios.post(`${API_ROUTE}/visual-aids/pdf`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('PDF brochure uploaded successfully!', 'success');
      } else {
        const res = await axios.post(`${API_ROUTE}/visual-aids/custom`, {
          title: newTitle,
          description: newDesc
        });
        showToast('Custom brochure created! Now add pages.', 'success');
        setBuilderBrochure(res.data.data); // Switch to builder
      }

      setIsCreateModalOpen(false);
      resetCreateForm();
      fetchBrochures();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create brochure', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPage = async (e) => {
    e.preventDefault();
    if (!pageFile) {
      showToast('Please select a page image', 'error');
      return;
    }

    setSubmitting(true);
    showToast('Uploading page image...', 'loading');

    try {
      const formData = new FormData();
      formData.append('pageNumber', pageNumber);
      formData.append('title', pageTitle);
      formData.append('description', pageDesc);
      formData.append('keywords', pageKeywords);
      formData.append('file', pageFile);

      await axios.post(`${API_ROUTE}/visual-aids/${builderBrochure.id}/pages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showToast('Page added successfully!', 'success');
      setIsAddPageOpen(false);
      resetPageForm();
      
      // Reload brochure details to refresh page list
      const detailsRes = await axios.get(`${API_ROUTE}/visual-aids/${builderBrochure.id}`);
      setBuilderBrochure(detailsRes.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add page', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBrochure = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brochure?')) return;
    showToast('Deleting brochure...', 'loading');
    try {
      await axios.delete(`${API_ROUTE}/visual-aids/${id}`);
      showToast('Brochure deleted successfully', 'success');
      fetchBrochures();
      if (builderBrochure?.id === id) {
        setBuilderBrochure(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete brochure', 'error');
    }
  };

  const resetCreateForm = () => {
    setNewTitle('');
    setNewDesc('');
    setSelectedFile(null);
  };

  const resetPageForm = () => {
    setPageTitle('');
    setPageDesc('');
    setPageKeywords('');
    setPageFile(null);
    setPageNumber(prev => prev + 1);
  };

  const openBuilder = async (brochure) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_ROUTE}/visual-aids/${brochure.id}`);
      setBuilderBrochure(res.data.data);
      setPageNumber((res.data.data.pages?.length || 0) + 1);
    } catch (err) {
      showToast('Failed to load brochure pages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const term = logSearch.toLowerCase();
    return (
      (log.mrName || '').toLowerCase().includes(term) ||
      (log.clientName || '').toLowerCase().includes(term) ||
      (log.visualAidTitle || '').toLowerCase().includes(term) ||
      (log.presentedProducts || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Visual Aids Manager</h1>
          <p className="text-gray-500 text-sm">Upload and manage visual aid brochures presented by representatives to doctors and chemists.</p>
        </div>
        {!builderBrochure && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4F46E5] text-white rounded-xl hover:bg-[#4338CA] transition-colors font-semibold shadow-sm"
          >
            <Plus size={18} />
            Add Brochure Catalog
          </button>
        )}
      </div>

      {/* Builder Screen or Main Tabs */}
      {builderBrochure ? (
        // CUSTOM BUILDER PAGE VIEWER
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <button
              onClick={() => { setBuilderBrochure(null); fetchBrochures(); }}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium border-none bg-transparent cursor-pointer"
            >
              <ChevronLeft size={20} />
              Back to Catalog list
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAddPageOpen(true)}
                className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
              >
                <Plus size={16} />
                Add Page Image
              </button>
              <button
                onClick={() => handleDeleteBrochure(builderBrochure.id)}
                className="flex items-center justify-center p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                title="Delete Brochure"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">{builderBrochure.title}</h2>
            <p className="text-gray-500 text-sm max-w-3xl">{builderBrochure.description || 'No description provided.'}</p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Image size={12} />
              Custom Brochure (Image Builder)
            </div>
          </div>

          {/* List of Custom Pages */}
          <div>
            <h3 className="text-md font-bold text-gray-800 mb-4">Pages Slider Preview ({builderBrochure.pages?.length || 0} pages)</h3>
            {builderBrochure.pages?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <Image className="text-gray-300 mb-3" size={40} />
                <p className="text-gray-500 font-medium text-sm">No page slides added yet.</p>
                <button
                  onClick={() => setIsAddPageOpen(true)}
                  className="mt-3 text-sm text-[#4F46E5] font-semibold hover:underline bg-transparent border-none cursor-pointer"
                >
                  Click here to upload your first page image
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {builderBrochure.pages.map((page) => (
                  <div key={page.id} className="group relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm flex flex-col">
                    <div className="aspect-[4/3] w-full bg-white relative overflow-hidden flex items-center justify-center border-b border-gray-200">
                      <img 
                        src={page.imageUrl} 
                        alt={page.title || `Page ${page.pageNumber}`} 
                        className="object-contain max-h-full max-w-full transition-transform duration-300 group-hover:scale-105" 
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold bg-black/60 text-white rounded-md">
                        Page {page.pageNumber}
                      </span>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm truncate">{page.title || `Slide ${page.pageNumber}`}</h4>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{page.description || 'No description.'}</p>
                      </div>
                      {page.keywords && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {page.keywords.split(',').map((kw, i) => (
                            <span key={i} className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-200/80 text-gray-600 rounded">
                              {kw.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // MAIN CATALOGS LIST & LOGS TABS
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('catalogs')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-none bg-transparent cursor-pointer relative -mb-[1px] ${activeTab === 'catalogs' ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <List size={16} />
              Brochure Catalogs
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-none bg-transparent cursor-pointer relative -mb-[1px] ${activeTab === 'logs' ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <Calendar size={16} />
              Presentation Logs
            </button>
          </div>

          {activeTab === 'catalogs' ? (
            // TAB 1: CATALOG CARD GRID
            loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-[#4F46E5]" size={36} />
              </div>
            ) : brochures.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <FileText className="text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-bold text-gray-800">No Brochures Available</h3>
                <p className="text-gray-500 text-sm mt-1 max-w-sm text-center">Add product brochures for medical representatives to detail during field visits.</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-[#4F46E5] text-white rounded-xl text-sm font-semibold hover:bg-[#4338CA] transition-colors"
                >
                  Upload Your First Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brochures.map((b) => (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 text-md truncate pr-2" title={b.title}>{b.title}</h3>
                          <p className="text-gray-500 text-xs mt-1">Uploaded {new Date(b.createdAt).toLocaleDateString()}</p>
                        </div>
                        {b.custom ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <Image size={11} /> Custom
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <FileText size={11} /> PDF
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-3">{b.description || 'No description provided.'}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      {b.custom ? (
                        <button
                          onClick={() => openBuilder(b)}
                          className="flex items-center gap-1 text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] bg-transparent border-none cursor-pointer"
                        >
                          <Image size={14} /> Edit Pages ({b.pages?.length || 0})
                        </button>
                      ) : (
                        <a
                          href={b.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 no-underline"
                        >
                          <Eye size={14} /> View File
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteBrochure(b.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                        title="Delete brochure"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // TAB 2: PRESENTATION LOGS VIEW
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1">
                  <Calendar size={16} /> Detailing Logs ({filteredLogs.length})
                </h3>
                <div className="relative w-full sm:w-72">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search representative, doctor, products..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4F46E5] transition-colors"
                  />
                </div>
              </div>

              {logsLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="animate-spin text-[#4F46E5]" size={36} />
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-20 text-gray-500 font-medium text-sm">
                  No presentation logs found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                        <th className="p-4">Representative</th>
                        <th className="p-4">Target (Doctor/Chemist)</th>
                        <th className="p-4">Brochure Catalog</th>
                        <th className="p-4">Presented Products</th>
                        <th className="p-4">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-semibold text-gray-900 flex items-center gap-1.5">
                            <User size={15} className="text-gray-400" />
                            {log.mrName}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-gray-900">{log.clientName}</div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                              {log.clientType}
                            </span>
                          </td>
                          <td className="p-4 font-medium text-indigo-600 flex items-center gap-1">
                            <FileText size={14} />
                            {log.visualAidTitle}
                          </td>
                          <td className="p-4">
                            {log.presentedProducts ? (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {log.presentedProducts.split(',').map((p, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[11px] font-medium border border-indigo-100">
                                    {p.trim()}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">None logged</span>
                            )}
                          </td>
                          <td className="p-4 text-gray-500 text-xs">
                            {new Date(log.presentedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CREATE BROCHURE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Brochure Catalog</h3>
              <button
                onClick={() => { setIsCreateModalOpen(false); resetCreateForm(); }}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBrochure} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Brochure Type</label>
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setCreateMode('pdf')}
                    className={`py-2 text-sm font-bold rounded-lg transition-all border-none cursor-pointer ${createMode === 'pdf' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800'}`}
                  >
                    Upload PDF Catalog
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateMode('custom')}
                    className={`py-2 text-sm font-bold rounded-lg transition-all border-none cursor-pointer ${createMode === 'custom' ? 'bg-white text-emerald-600 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800'}`}
                  >
                    Custom Page Builder
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Catalog Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Products Visual Aid v2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what products this catalog covers."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4F46E5] resize-none"
                />
              </div>

              {createMode === 'pdf' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Upload PDF File</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-[#4F46E5] transition-colors relative bg-gray-50/50">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto text-gray-400" size={32} />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-transparent rounded-md font-semibold text-[#4F46E5] hover:text-[#4338CA] outline-none">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            accept="application/pdf"
                            className="sr-only"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 50MB</p>
                    </div>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 text-xs font-semibold text-[#4F46E5] bg-indigo-50 border border-indigo-100 rounded-lg p-2 flex items-center gap-1.5">
                      <FileText size={14} /> {selectedFile.name}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => { setIsCreateModalOpen(false); resetCreateForm(); }}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#4F46E5] text-white rounded-xl text-sm font-semibold hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {submitting && <Loader2 className="animate-spin" size={14} />}
                  Create Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PAGE MODAL (FOR CUSTOM BUILDER) */}
      {isAddPageOpen && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Page to Catalog (Slide #{pageNumber})</h3>
              <button
                onClick={() => { setIsAddPageOpen(false); resetPageForm(); }}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPage} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Page Image (JPEG/PNG)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-[#4F46E5] transition-colors relative bg-gray-50/50">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto text-gray-400" size={32} />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-transparent rounded-md font-semibold text-[#4F46E5] hover:text-[#4338CA] outline-none">
                        <span>Upload page image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => setPageFile(e.target.files[0])}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
                  </div>
                </div>
                {pageFile && (
                  <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-2 flex items-center gap-1.5">
                    <Image size={14} /> {pageFile.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Page Heading / Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. CEFITAZ Syrup"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Page Description / Clinical Info</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Broad spectrum antibiotic for pediatric infections."
                  value={pageDesc}
                  onChange={(e) => setPageDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4F46E5] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Search Tags / Keywords</label>
                <input
                  type="text"
                  placeholder="e.g. cefitaz, antibiotic, syrup, pediatric (comma separated)"
                  value={pageKeywords}
                  onChange={(e) => setPageKeywords(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#4F46E5]"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Adding search terms helps representatives find this specific page when searching on-field.</span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => { setIsAddPageOpen(false); resetPageForm(); }}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {submitting && <Loader2 className="animate-spin" size={14} />}
                  Add Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

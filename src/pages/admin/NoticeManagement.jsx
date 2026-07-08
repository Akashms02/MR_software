import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, Search, Filter, Edit2, Trash2, 
  AlertCircle, Loader2, X, Bell
} from 'lucide-react';
import { 
  getAdminNotices, 
  createNotice, 
  updateNotice, 
  deleteNotice, 
  toggleActiveNotice,
  clearNoticeSuccess,
  clearNoticeErrors 
} from '../../redux/actions/noticeActions';
import { cn } from '../../utils/cn';
import DeleteModal from '../../components/common/DeleteModal';
import { useToast } from '../../context/ToastContext';

const NoticeManagement = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { adminNotices = [], loading, error, success } = useSelector((state) => state.notices || {});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    active: true,
    id: null
  });

  // Delete Modal State
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    isOpen: false,
    item: null
  });

  useEffect(() => {
    dispatch(getAdminNotices());
  }, [dispatch]);

  useEffect(() => {
    if (success && isModalOpen) {
      setIsModalOpen(false);
      resetForm();
    }
  }, [success]);

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      active: true,
      id: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!formData.id;
    showToast(isEdit ? "Updating notice..." : "Posting notice...", "loading");
    try {
      let res;
      if (isEdit) {
        res = await dispatch(updateNotice(formData.id, formData));
      } else {
        res = await dispatch(createNotice(formData));
      }
      showToast(res?.message || (isEdit ? "Notice updated successfully" : "Notice posted successfully"), "success");
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to save notice", "error");
    }
  };

  const handleEdit = (notice) => {
    dispatch(clearNoticeSuccess());
    dispatch(clearNoticeErrors());
    setFormData({
      id: notice.id,
      title: notice.title,
      message: notice.message || notice.content || '',
      active: notice.active
    });
    setIsModalOpen(true);
  };

  const handleDelete = (item) => {
    setDeleteModalConfig({
      isOpen: true,
      item: item
    });
  };

  const confirmDelete = async () => {
    if (deleteModalConfig.item) {
      showToast("Deleting notice...", "loading");
      try {
        const res = await dispatch(deleteNotice(deleteModalConfig.item.id));
        showToast(res?.message || "Notice deleted successfully", "success");
        setDeleteModalConfig({ isOpen: false, item: null });
      } catch (err) {
        console.error(err);
        showToast(err.message || "Failed to delete notice", "error");
      }
    }
  };

  const handleToggleActive = async (e, notice) => {
    e.stopPropagation();
    showToast("Toggling notice active state...", "loading");
    try {
      const res = await dispatch(toggleActiveNotice(notice.id));
      showToast(res?.message || "Notice status toggled successfully", "success");
    } catch (err) {
      console.error("Failed to toggle status", err);
      showToast(err.message || "Failed to toggle status", "error");
    }
  };

  const filteredNotices = adminNotices.filter(notice => {
    const matchesSearch = (notice.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (notice.message || notice.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') matchesStatus = notice.active;
    if (statusFilter === 'INACTIVE') matchesStatus = !notice.active;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in duration-500 max-w-[1600px] mx-auto overflow-hidden">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent mb-6 shrink-0">
        <div>
          <h1 className="text-xl sm:text-[22px] font-bold text-slate-800 tracking-tight">Notice Board</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 font-sans">Manage announcements & team updates</p>
        </div>
        <button 
          onClick={() => { dispatch(clearNoticeSuccess()); resetForm(); setIsModalOpen(true); }}
          className="bg-[#C8F04A] hover:bg-opacity-90 text-[#111827] px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 group cursor-pointer border-none"
        >
          <Plus size={16} /> Post New Notice
        </button>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden mb-4">
        
        {/* Card Header & Search */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-white shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-emerald-500" />
            <h2 className="text-[14px] font-bold text-slate-800 tracking-tight uppercase leading-none">List of Notices</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 h-[38px]">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-600 focus:outline-none cursor-pointer uppercase tracking-wider border-none"
              >
                <option value="ALL">All Notices</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            </div>

            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search notices..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium h-[38px]"
              />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-50/85 backdrop-blur-md border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Notice Title</th>
                <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Message</th>
                <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Status</th>
                <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && adminNotices.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <Loader2 className="animate-spin text-emerald-600" size={32} />
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Loading announcements...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-40">
                      <AlertCircle size={40} className="text-slate-300" />
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No notices found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredNotices.map((notice) => (
                  <tr 
                    key={notice.id} 
                    className="hover:bg-slate-50/60 transition-colors bg-white group"
                  >
                    <td className="px-6 py-4 font-bold text-[13px] text-slate-800">
                      {notice.title}
                    </td>
                    <td className="px-6 py-4 text-[12px] text-slate-500 max-w-[400px] truncate">
                      {notice.message || notice.content}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={(e) => handleToggleActive(e, notice)}
                          className={cn(
                            "relative w-9 h-5 rounded-full transition-all duration-300 cursor-pointer border-none",
                            notice.active ? 'bg-emerald-500' : 'bg-slate-200'
                          )}
                        >
                          <div className={cn(
                            "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300",
                            notice.active ? "right-0.5 left-auto" : "left-0.5"
                          )} />
                        </button>
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider w-12", notice.active ? 'text-emerald-600' : 'text-slate-400')}>
                          {notice.active ? 'Active' : 'Off'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleEdit(notice)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(notice)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all border-none bg-transparent cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 notice-modal">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-250 relative z-10">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{formData.id ? 'Edit Notice' : 'Post New Notice'}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Fill in details to publish notice</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors border-none bg-transparent cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Notice Title</label>
                  <input 
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter notice title..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-950 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="Enter notice details..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[120px] text-slate-955 font-medium"
                  />
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-4.5 rounded-2xl border border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                    className={cn(
                      "relative w-9 h-5 rounded-full transition-all duration-300 cursor-pointer border-none shrink-0",
                      formData.active ? 'bg-emerald-500' : 'bg-slate-200'
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300",
                      formData.active ? "right-0.5 left-auto" : "left-0.5"
                    )} />
                  </button>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}>Active Status</label>
                    <span className="text-[10px] text-slate-400 font-medium">Toggle whether this notice is visible on dashboards</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer bg-transparent">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-[2] py-3 bg-[#C8F04A] hover:bg-opacity-90 text-[#111827] font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    {loading && <Loader2 className="animate-spin" size={16} />}
                    {formData.id ? 'Save Changes' : 'Post Notice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal 
        isOpen={deleteModalConfig.isOpen}
        onClose={() => setDeleteModalConfig({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        itemName={deleteModalConfig.item?.title}
        title="Delete Notice"
        loading={loading}
      />

      {/* Floating Sync Indicator */}
      {loading && adminNotices.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4">
          <Loader2 className="animate-spin" size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Syncing</span>
        </div>
      )}
    </div>
  );
};

export default NoticeManagement;

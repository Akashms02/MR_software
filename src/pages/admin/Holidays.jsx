import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Calendar,
    RefreshCw,
    Globe,
    Clock,
    Layers,
    Pencil,
    Trash2,
    Flag,
    Lock,
    Scroll,
    Star,
    ShieldCheck,
    Search,
    Plus,
    UploadCloud,
    X
} from 'lucide-react';
import {
    fetchHolidaysAction,
    fetchUpcomingHolidaysAction,
    syncHolidaysAction,
    createHolidayAction,
    updateHolidayAction,
    deleteHolidayAction,
    toggleHolidayVisibilityAction,
    clearHolidayErrorsAction,
    clearHolidaySuccessAction
} from '../../redux/actions/holidayActions';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import DeleteModal from '../../components/common/DeleteModal';
import ProtectedImage from '../../components/common/ProtectedImage';
import { useToast } from '../../context/ToastContext';

const cn = (...inputs) => twMerge(clsx(inputs));

// Icon Helper
const getHolidayIcon = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('national')) return Flag;
    if (t.includes('gazetted')) return Scroll;
    if (t.includes('restricted')) return Lock;
    return Star;
};

const HolidayDataTable = ({
    title,
    holidays = [],
    loading,
    icon: Icon,
    color = 'blue',
    showVisibility = true,
    isVisibilityToggle = true,
    showActions = true,
    onToggleVisibility,
    onEdit,
    onDelete
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-full animate-[fadeSlideIn_0.35s_ease-out]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl bg-opacity-10", {
                        'bg-blue-50 text-blue-600': color === 'blue',
                        'bg-amber-50 text-amber-600': color === 'amber',
                    })}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-[14px] font-bold text-gray-800 tracking-tight uppercase leading-tight">{title}</h2>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{holidays.length} Observances</p>
                    </div>
                </div>
            </div>

            <div className="overflow-y-auto flex-1 relative min-h-0">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-20 bg-gray-50/90 backdrop-blur-md">
                        <tr className="border-b border-gray-100">
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Holiday</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                            {showVisibility && <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>}
                            {showActions && <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {holidays.map((holiday, idx) => {
                            const RowIcon = getHolidayIcon(holiday.primaryType);
                            const isVisible = holiday.visible !== false;
                            return (
                                <tr key={holiday.id || idx} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50 flex items-center justify-center">
                                                {holiday.imageUrl ? (
                                                    <ProtectedImage
                                                        src={holiday.imageUrl}
                                                        alt={holiday.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                                        <RowIcon className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">{holiday.name}</h4>
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{holiday.primaryType}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-[12.5px] font-bold text-gray-600">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            {holiday.date ? new Date(holiday.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                        </div>
                                    </td>
                                    {showVisibility && (
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex justify-center">
                                                {isVisibilityToggle ? (
                                                    <button
                                                        onClick={() => onToggleVisibility?.(holiday.id)}
                                                        disabled={loading}
                                                        className={cn(
                                                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none scale-90",
                                                            isVisible ? "bg-[#C8F04A]" : "bg-gray-200"
                                                        )}
                                                    >
                                                        <span
                                                            className={cn(
                                                                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                                                isVisible ? "translate-x-4 bg-gray-900" : "translate-x-0 bg-white"
                                                            )}
                                                        />
                                                    </button>
                                                ) : (
                                                    <span className={cn(
                                                        "text-[9px] font-extrabold px-2 py-1 rounded-lg uppercase tracking-wider border shadow-sm",
                                                        isVisible
                                                            ? "text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]"
                                                            : "text-gray-400 bg-gray-50 border-gray-200"
                                                    )}>
                                                        {isVisible ? 'Active' : 'Inactive'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                    {showActions && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                <button
                                                    onClick={() => onEdit?.(holiday)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-all active:scale-95 shadow-sm"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete?.(holiday)}
                                                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-all active:scale-95 shadow-sm"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}

                        {!loading && holidays.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center opacity-40">
                                        <Search className="w-10 h-10 text-gray-300 mb-3" />
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No holidays found</p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {loading && holidays.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-16 text-center">
                                    <div className="flex items-center justify-center gap-2 text-gray-500 font-bold text-[11px] uppercase tracking-wider animate-pulse">
                                        <RefreshCw className="w-4 h-4 animate-spin text-gray-600" />
                                        Syncing Database...
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Form Modal Component
const HolidayModal = ({ isOpen, onClose, onSubmit, holiday = null, mode = 'ADD' }) => {
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        country: 'India',
        primaryType: 'National Holiday',
        customType: '',
        description: '',
        imageUrl: ''
    });

    const [isCustom, setIsCustom] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');

    useEffect(() => {
        if (holiday && mode === 'EDIT') {
            const standardTypes = ['National Holiday', 'Restricted Holiday', 'Gazetted Holiday'];
            const isOther = holiday.primaryType && !standardTypes.includes(holiday.primaryType);

            setFormData({
                name: holiday.name || '',
                date: holiday.date || '',
                country: holiday.country || 'India',
                primaryType: isOther ? 'Others' : (holiday.primaryType || 'National Holiday'),
                customType: isOther ? holiday.primaryType : '',
                description: holiday.description || '',
                imageUrl: holiday.imageUrl || ''
            });
            setIsCustom(isOther);
            setPhoto(null);
            setPhotoPreview(holiday.imageUrl || '');
        } else {
            setFormData({
                name: '',
                date: '',
                country: 'India',
                primaryType: 'National Holiday',
                customType: '',
                description: '',
                imageUrl: ''
            });
            setIsCustom(false);
            setPhoto(null);
            setPhotoPreview('');
        }
    }, [holiday, mode, isOpen]);

    if (!isOpen) return null;

    const handleTypeChange = (val) => {
        setIsCustom(val === 'Others');
        setFormData({ ...formData, primaryType: val });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleRemovePhoto = () => {
        setPhoto(null);
        setPhotoPreview('');
        setFormData(prev => ({ ...prev, imageUrl: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            primaryType: isCustom ? formData.customType : formData.primaryType
        };
        // Remove the helper customType field before sending
        delete dataToSubmit.customType;
        onSubmit(dataToSubmit, photo);
    };

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 px-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h3 className="text-[15px] font-extrabold text-gray-900 uppercase tracking-tight">
                            {mode === 'EDIT' ? 'Modify Holiday' : 'Create Holiday'}
                        </h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                            {mode === 'EDIT' ? 'Update details for ' + holiday?.name : 'Add a new observance to the calendar'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider ml-1">Holiday Name</label>
                        <input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                            placeholder="e.g. Independence Day"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider ml-1">Date</label>
                            <input
                                required
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider ml-1">Category</label>
                            <select
                                value={formData.primaryType}
                                onChange={(e) => handleTypeChange(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-blue-400 focus:bg-white transition-all appearance-none shadow-sm cursor-pointer"
                            >
                                <option>National Holiday</option>
                                <option>Restricted Holiday</option>
                                <option>Gazetted Holiday</option>
                                <option>Others</option>
                            </select>
                        </div>
                    </div>

                    {isCustom && (
                        <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] font-extrabold text-blue-500 uppercase tracking-wider ml-1">Custom Type Name</label>
                            <input
                                required
                                value={formData.customType}
                                onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                                className="w-full px-4 py-3 bg-blue-50/50 border border-blue-200 border-dashed rounded-xl text-xs font-bold text-blue-600 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                                placeholder="e.g. Company Foundation Day"
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider ml-1">Holiday Photo</label>
                        {photoPreview ? (
                            <div className="relative group w-full h-32 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                                <ProtectedImage
                                    src={photoPreview}
                                    alt="Holiday Preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemovePhoto}
                                    className="absolute top-2 right-2 p-1.5 bg-gray-900/60 hover:bg-slate-900/80 rounded-lg text-white transition-all active:scale-95 shadow-sm"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all group p-4">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <UploadCloud className="w-8 h-8 text-gray-300 group-hover:text-blue-500 transition-colors mb-2" />
                                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">Upload Image File</p>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">PNG, JPG or WEBP up to 5MB</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider ml-1">Description</label>
                        <textarea
                            rows="2"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none shadow-sm"
                            placeholder="Briefly describe the holiday..."
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-500 uppercase tracking-wider hover:bg-gray-50 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-3 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                        >
                            {mode === 'EDIT' ? 'Update Holiday' : 'Create Holiday'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Holidays = () => {
    const dispatch = useDispatch();
    const { showToast } = useToast();
    const { holidays, upcomingHolidays, loading, success, error } = useSelector((state) => state.holiday);
    const [syncing, setSyncing] = useState(false);

    // Modal States
    const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: 'ADD', holiday: null });
    const [deleteModalConfig, setDeleteModalConfig] = useState({ isOpen: false, item: null });

    const fetchAllData = async () => {
        try {
            await Promise.all([
                dispatch(fetchHolidaysAction()),
                dispatch(fetchUpcomingHolidaysAction())
            ]);
        } catch (error) {
            console.error("Failed to fetch holidays:", error);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [dispatch]);

    const handleSync = async () => {
        setSyncing(true);
        showToast("Syncing holidays with calendar API...", "loading");
        try {
            const res = await dispatch(syncHolidaysAction());
            showToast(res?.message, "success");
            await fetchAllData();
        } catch (error) {
            console.error("Sync failed:", error);
            showToast(error.message, "error");
        } finally {
            setTimeout(() => setSyncing(false), 1000);
        }
    };

    const handleToggleVisibility = async (id) => {
        showToast("Updating holiday visibility...", "loading");
        try {
            const res = await dispatch(toggleHolidayVisibilityAction(id));
            showToast(res?.message, "success");
            await fetchAllData();
        } catch (error) {
            console.error("Failed to toggle visibility:", error);
            showToast(error.message, "error");
        }
    };

    const confirmDelete = async () => {
        if (!deleteModalConfig.item) return;
        showToast("Deleting holiday...", "loading");
        try {
            const res = await dispatch(deleteHolidayAction(deleteModalConfig.item.id));
            showToast(res?.message, "success");
            setDeleteModalConfig({ isOpen: false, item: null });
            await fetchAllData();
        } catch (error) {
            console.error("Deletion failed:", error);
            showToast(error.message, "error");
        }
    };

    const openDeleteModal = (holiday) => {
        setDeleteModalConfig({ isOpen: true, item: holiday });
    };

    const handleModalSubmit = async (formData, photo) => {
        const isEdit = modalConfig.mode === 'EDIT';
        showToast(`${isEdit ? 'Updating' : 'Creating'} holiday...`, "loading");
        try {
            let res;
            if (isEdit) {
                res = await dispatch(updateHolidayAction(modalConfig.holiday.id, formData, photo));
            } else {
                res = await dispatch(createHolidayAction(formData, photo));
            }
            showToast(res?.message, "success");
            setModalConfig({ ...modalConfig, isOpen: false });
            await fetchAllData();
        } catch (error) {
            console.error("Operation failed:", error);
            showToast(error.message, "error");
        }
    };

    const openEditModal = (holiday) => {
        setModalConfig({ isOpen: true, mode: 'EDIT', holiday });
    };

    const openAddModal = () => {
        setModalConfig({ isOpen: true, mode: 'ADD', holiday: null });
    };

    const StatsCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
        <div className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden group transition-all flex-1">
            <div className={cn("absolute top-0 right-0 w-20 h-20 -mr-8 -mt-8 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-20", colorClass)} />
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{value}</h3>
                    <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase italic">{subtitle}</p>
                </div>
                <div className={cn("p-2.5 rounded-xl transition-colors shadow-sm", colorClass)}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] animate-[fadeSlideIn_0.35s_ease-out] max-w-[1600px] mx-auto overflow-hidden">
            {/* Modals */}
            <HolidayModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onSubmit={handleModalSubmit}
                holiday={modalConfig.holiday}
                mode={modalConfig.mode}
            />

            <DeleteModal 
                isOpen={deleteModalConfig.isOpen}
                onClose={() => setDeleteModalConfig({ isOpen: false, item: null })}
                onConfirm={confirmDelete}
                itemName={deleteModalConfig.item?.name}
                title="Delete Holiday"
                loading={loading}
            />

            {/* Header Section */}
            <div className="flex justify-end bg-transparent mb-5 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 p-1.5 rounded-xl shadow-sm">
                        <button
                            onClick={handleSync}
                            disabled={syncing || loading}
                            className="flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50 px-2 py-1 gap-1.5 font-bold text-xs"
                            title="Sync holidays from API"
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", syncing && "animate-spin")} />
                            <span>Sync API</span>
                        </button>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="bg-[#C8F04A] hover:bg-opacity-90 text-[#111827] px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Create Holiday
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0 space-y-4 pb-0 overflow-hidden">
                {/* Stats Row */}
                <div className="flex flex-col sm:flex-row gap-4 w-full shrink-0">
                    <StatsCard 
                        title="Master Records" 
                        value={loading && holidays.length === 0 ? '...' : holidays.length} 
                        icon={Globe} 
                        subtitle="Global Repository"
                        colorClass="bg-blue-600" 
                    />
                    <StatsCard 
                        title="Upcoming" 
                        value={loading && upcomingHolidays.length === 0 ? '...' : upcomingHolidays.length} 
                        icon={Clock} 
                        subtitle="Next 30 Days"
                        colorClass="bg-amber-600" 
                    />
                    <StatsCard 
                        title="System Health" 
                        value="Stable" 
                        icon={ShieldCheck} 
                        subtitle="Live Sync Active"
                        colorClass="bg-emerald-600" 
                    />
                </div>

                {/* Main Layout Grid */}
                <div className="grid grid-cols-12 gap-4 items-start flex-1 min-h-0 overflow-hidden">
                    {/* Upcoming Holidays Column */}
                    <div className="col-span-12 lg:col-span-5 h-full min-h-0 flex flex-col">
                        <HolidayDataTable
                            title="Upcoming Events"
                            holidays={upcomingHolidays}
                            loading={loading}
                            icon={Clock}
                            color="amber"
                            showVisibility={true}
                            isVisibilityToggle={false}
                            showActions={false}
                        />
                    </div>

                    {/* Master Calendar Column */}
                    <div className="col-span-12 lg:col-span-7 h-full min-h-0 flex flex-col">
                        <HolidayDataTable
                            title="Master Calendar"
                            holidays={holidays}
                            loading={loading}
                            icon={Layers}
                            color="blue"
                            onToggleVisibility={handleToggleVisibility}
                            onEdit={openEditModal}
                            onDelete={openDeleteModal}
                        />
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Holidays;

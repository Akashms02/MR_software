import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMyTeam, deleteMemberAction } from '../../redux/actions/teamActions';
import {
  Plus,
  Search,
  Mail,
  Phone,
  User,
  Loader2,
  Briefcase,
  Eye,
  Trash2,
  CheckCircle2,
  Building,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import EditEmployeeModal from './EditEmployeeModal';
import Pagination from '../../components/common/Pagination';
import { getDisplayRole } from '../../utils/roleHelpers';

const ROLE_COLORS = {
  MR: { bgClass: 'bg-emerald-50 border-emerald-100', textClass: 'text-emerald-700', badgeIconColor: '#059669', gradient: 'from-emerald-500 to-teal-600' },
  HR: { bgClass: 'bg-blue-50 border-blue-100', textClass: 'text-blue-700', badgeIconColor: '#2563EB', gradient: 'from-blue-500 to-indigo-600' },
  REGIONAL_MANAGER: { bgClass: 'bg-purple-50 border-purple-100', textClass: 'text-purple-700', badgeIconColor: '#9333EA', gradient: 'from-purple-500 to-fuchsia-600' },
  AREA_MANAGER: { bgClass: 'bg-orange-50 border-orange-100', textClass: 'text-orange-700', badgeIconColor: '#EA580C', gradient: 'from-orange-500 to-amber-600' },
  ZONE_MANAGER: { bgClass: 'bg-indigo-50 border-indigo-100', textClass: 'text-indigo-700', badgeIconColor: '#4F46E5', gradient: 'from-indigo-500 to-violet-600' },
  VICE_PRESIDENT: { bgClass: 'bg-rose-50 border-rose-100', textClass: 'text-rose-700', badgeIconColor: '#E11D48', gradient: 'from-rose-500 to-pink-600' },
  MEDICAL_MANAGER: { bgClass: 'bg-violet-50 border-violet-100', textClass: 'text-violet-700', badgeIconColor: '#7C3AED', gradient: 'from-violet-500 to-purple-600' },
  DOCTOR: { bgClass: 'bg-red-50 border-red-100', textClass: 'text-red-700', badgeIconColor: '#DC2626', gradient: 'from-red-500 to-rose-600' },
  PHARMACIST: { bgClass: 'bg-yellow-50 border-yellow-100', textClass: 'text-yellow-700', badgeIconColor: '#CA8A04', gradient: 'from-yellow-400 to-amber-500' },
  DISTRIBUTOR: { bgClass: 'bg-green-50 border-green-100', textClass: 'text-green-700', badgeIconColor: '#16A34A', gradient: 'from-green-500 to-emerald-600' },
  PATIENT: { bgClass: 'bg-sky-50 border-sky-100', textClass: 'text-sky-700', badgeIconColor: '#0284C7', gradient: 'from-sky-400 to-blue-500' },
  MEDICAL_EXECUTIVE: { bgClass: 'bg-indigo-50 border-indigo-100', textClass: 'text-indigo-700', badgeIconColor: '#4F46E5', gradient: 'from-indigo-500 to-blue-600' },
  MEDICAL_SALES_EXECUTIVE: { bgClass: 'bg-teal-50 border-teal-100', textClass: 'text-teal-700', badgeIconColor: '#0D9488', gradient: 'from-teal-500 to-cyan-600' },
};

const TeamManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { team, loading } = useSelector((state) => state.team);
  const { user } = useSelector((state) => state.auth || {});

  // Only Admin and ZBM are allowed to view or edit Employee Profile Cards
  const canManageEmployeeProfile = React.useMemo(() => {
    if (!user || !user.role) return false;
    const norm = (user.role || '').toUpperCase().replace(/_/g, ' ').replace(/-/g, ' ').replace('ROLE', '').trim();
    const isSuperAdminOrAdmin = norm.includes('ADMIN');
    const isZBM = norm === 'ZBM' || norm.includes('ZONE') || norm.includes('ZONAL');
    return isSuperAdminOrAdmin || isZBM;
  }, [user]);

  const [searchQuery, setSearchQuery] = useState('');
  const [resumeId, setResumeId] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 6; // Set to 6 per page for dynamic card layout fit

  // Detect role path prefix for onboarding redirection
  const isManager = window.location.pathname.includes('/manager');
  const onboardPath = isManager ? '/manager/myteam/onboard' : '/admin/myteam/onboard';

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  // Edit / Delete states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEditClick = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (employeeId, name) => {
    setDeleteConfirmId(employeeId);
    setDeleteConfirmName(name);
  };

  const confirmDelete = async () => {
    const targetId = deleteConfirmId;
    const targetName = deleteConfirmName;
    setDeleteConfirmId(null);
    setDeleteConfirmName(null);
    try {
      const res = await dispatch(deleteMemberAction(targetId));
      if (res && res.status === 'SUCCESS') {
        setSuccessMessage(`Employee ${targetName} was successfully deleted.`);
        setTimeout(() => {
          setSuccessMessage('');
        }, 4000);
      } else {
        setErrorMessage(res?.message || 'Failed to delete employee.');
        setTimeout(() => {
          setErrorMessage('');
        }, 4000);
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred during deletion.');
      setTimeout(() => {
        setErrorMessage('');
      }, 4000);
    }
  };

  useEffect(() => {
    dispatch(getMyTeam(0, 100000));
  }, [dispatch]);

  const filteredTeam = (team || []).filter(
    (m) =>
      !searchQuery ||
      m.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResumeSubmit = (e) => {
    e.preventDefault();
    if (resumeId.trim()) {
      navigate(`${onboardPath}?employeeId=${resumeId.trim()}`);
    }
  };

  const stats = [
    { label: 'Total Members', value: team?.length || 0, textClass: 'text-indigo-600', bg: 'bg-indigo-50' },
    {
      label: 'Med. Reps',
      value: team?.filter((m) => {
        const r = (m.role || '').toUpperCase().trim();
        return r === 'MR' || r === 'MEDICAL_REPRESENTATIVE' || r === 'ME' || r === 'MEDICAL_EXECUTIVE' || r === 'MSE' || r === 'MEDICAL_SALES_EXECUTIVE';
      }).length || 0,
      textClass: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      label: 'Managers',
      value: team?.filter((m) => {
        const r = (m.role || '').toUpperCase().trim();
        return r.includes('MANAGER') || r === 'ABM' || r === 'RBM' || r === 'ZBM' || r === 'ASM' || r === 'RSM' || r === 'ZSM' || r === 'VP';
      }).length || 0,
      textClass: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      label: 'Medical Staff',
      value: team?.filter((m) => ['DOCTOR', 'PHARMACIST'].includes(m.role)).length || 0,
      textClass: 'text-rose-600',
      bg: 'bg-rose-50'
    },
  ];

  return (
    <div className="p-2 animate-in fade-in duration-300">
      {/* Card Grid Container */}
      <div className="bg-white rounded-3xl p-6 flex flex-col min-h-[500px]">
        {/* Search Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                placeholder="Search by name, email or role…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3.5 py-2.5 rounded-xl border-[1.5px] border-gray-200 w-full text-[13px] outline-none transition-[border-color] duration-200 focus:border-teal-500 bg-white"
              />
            </div>
          </div>
          <button
            onClick={() => navigate(onboardPath)}
            className="flex items-center gap-2 bg-[#0F766E] text-white px-5.5 py-2.5 rounded-xl border-none font-bold text-sm cursor-pointer shadow-lg hover:bg-[#0D9488] transition-all duration-200 hover:-translate-y-0.5"
          >
            <Plus size={18} strokeWidth={3} />
            Onboard New Member
          </button>
        </div>

        {/* Dynamic Card Area */}
        <div className="flex-1">
          {loading ? (
            <div className="h-[300px] flex flex-col items-center justify-center gap-3">
              <Loader2 size={36} className="text-teal-600 animate-spin" />
              <p className="text-gray-400 text-sm font-semibold">Loading team members...</p>
            </div>
          ) : filteredTeam.length === 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <User className="text-gray-300" size={24} />
              </div>
              <p className="text-sm font-bold text-gray-800 m-0">No matching team members</p>
              <p className="text-xs text-gray-400 m-0 mt-1">
                {searchQuery ? 'Adjust your search parameters.' : 'Click Onboard New Member to register someone.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeam.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((member) => {
                const roleConfig = ROLE_COLORS[member.role] || {
                  bgClass: 'bg-slate-50 border-slate-100',
                  textClass: 'text-slate-700',
                  badgeIconColor: '#6B7280',
                  gradient: 'from-slate-500 to-zinc-600'
                };
                
                const initials = member.fullName
                  ?.split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'MR';

                const displayRoleName = getDisplayRole(member.role);

                return (
                  <div
                    key={member.id}
                    className="bg-white border border-gray-150 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group hover:-translate-y-0.5"
                  >
                    {/* Top gradient cover */}
                    <div className={`h-2.5 bg-gradient-to-r ${roleConfig.gradient}`} />

                    {/* Body Content */}
                    <div className="p-5 flex-1 flex flex-col gap-4">
                      {/* Member Info */}
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-sm`}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-gray-900 text-[14.5px] m-0 truncate group-hover:text-teal-700 transition-colors">
                            {member.fullName}
                          </h3>
                          <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                            ID: {member.employeeId || `UID-${String(member.id).slice(-6)}`}
                          </div>
                        </div>
                      </div>

                      {/* Role Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold w-fit ${roleConfig.bgClass} ${roleConfig.textClass}`}>
                        <Briefcase size={11} />
                        {displayRoleName}
                      </span>

                      {/* Contact list */}
                      <div className="flex flex-col gap-2 py-1 text-xs text-gray-500 border-t border-b border-gray-50 my-1">
                        <div className="flex items-center gap-2 truncate">
                          <Mail size={13} className="text-gray-400 shrink-0" />
                          <span className="truncate">{member.email || 'No email registered'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-gray-400 shrink-0" />
                          <span>{member.phone || 'No phone registered'}</span>
                        </div>
                      </div>

                      {/* Active Status */}
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="font-bold text-emerald-600">Active</span>
                        </div>
                        <div className="flex gap-2">
                          {canManageEmployeeProfile && (
                            <>
                              <button
                                onClick={() => handleEditClick(member.id)}
                                title="View & Edit Employee Profile"
                                className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] border-none cursor-pointer flex items-center justify-center hover:bg-[#0F766E] hover:text-white transition-all duration-200"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(member.id, member.fullName)}
                                title="Remove Team Member"
                                className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border-none cursor-pointer flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all duration-200"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination at the bottom */}
        <div className="pt-6 mt-6 border-t border-gray-100 bg-white shrink-0">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredTeam.length / pageSize)}
            totalElements={filteredTeam.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            isLoading={loading}
            activeBtnClass="bg-[#C8F04A] text-gray-900"
          />
        </div>
      </div>

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployeeId(null);
        }}
        employeeId={selectedEmployeeId}
      />

      {/* Delete Confirmation Popup */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1100] p-5">
          <div className="bg-white rounded-2xl w-full max-w-[420px] p-7 shadow-2xl text-center animate-in scale-in duration-200">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4 text-rose-600">
              <Trash2 size={26} />
            </div>
            <h3 className="text-[17px] font-extrabold text-gray-900 mt-0 mb-2">
              Confirm Removal
            </h3>
            <p className="text-xs text-gray-500 mt-0 mb-6 leading-relaxed">
              Are you sure you want to remove <strong>{deleteConfirmName}</strong> from the team directory?<br />
              This profile data will be deactivated.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteConfirmName(null);
                }}
                className="px-4.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold text-xs cursor-pointer flex-1 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4.5 py-2.5 rounded-xl border-none bg-rose-600 text-white font-bold text-xs cursor-pointer flex-1 shadow-lg hover:bg-rose-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 bg-emerald-50 border border-emerald-200 px-5 py-4 rounded-xl flex items-center gap-2.5 text-emerald-700 text-[13px] font-bold shadow-lg z-[1200] animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 size={18} />
          {successMessage}
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 bg-rose-50 border border-rose-200 px-5 py-4 rounded-xl flex items-center gap-2.5 text-rose-700 text-[13px] font-bold shadow-lg z-[1200] animate-in slide-in-from-bottom duration-300">
          <AlertCircle size={18} />
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default TeamManagement;

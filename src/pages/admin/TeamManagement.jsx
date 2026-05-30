import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMyTeam } from '../../redux/actions/teamActions';
import {
  Plus,
  Search,
  Mail,
  Phone,
  User,
  Loader2,
  Briefcase,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import EditEmployeeModal from './EditEmployeeModal';

const ROLE_COLORS = {
  MR: { bgClass: 'bg-[#ECFDF5]', textClass: 'text-[#059669]' },
  HR: { bgClass: 'bg-[#EFF6FF]', textClass: 'text-[#2563EB]' },
  REGIONAL_MANAGER: { bgClass: 'bg-[#FDF4FF]', textClass: 'text-[#9333EA]' },
  AREA_MANAGER: { bgClass: 'bg-[#FFF7ED]', textClass: 'text-[#EA580C]' },
  MEDICAL_MANAGER: { bgClass: 'bg-[#F5F3FF]', textClass: 'text-[#7C3AED]' },
  DOCTOR: { bgClass: 'bg-[#FEF2F2]', textClass: 'text-[#DC2626]' },
  PHARMACIST: { bgClass: 'bg-[#FEFCE8]', textClass: 'text-[#CA8A04]' },
  DISTRIBUTOR: { bgClass: 'bg-[#F0FDF4]', textClass: 'text-[#16A34A]' },
  PATIENT: { bgClass: 'bg-[#F0F9FF]', textClass: 'text-[#0284C7]' },
  MEDICAL_EXECUTIVE: { bgClass: 'bg-[#EEF2FF]', textClass: 'text-[#4F46E5]' },
  MEDICAL_SALES_EXECUTIVE: { bgClass: 'bg-[#F0FDFA]', textClass: 'text-[#0D9488]' },
};

const TeamManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { team, loading } = useSelector((state) => state.team);

  const [searchQuery, setSearchQuery] = useState('');
  const [resumeId, setResumeId] = useState('');

  // Edit / Delete states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleEditClick = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (employeeId, name) => {
    setDeleteConfirmId(employeeId);
    setDeleteConfirmName(name);
  };

  const confirmDelete = () => {
    setSuccessMessage(`Employee ${deleteConfirmName} (${deleteConfirmId}) delete confirmed (API pending)`);
    setDeleteConfirmId(null);
    setDeleteConfirmName(null);
    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  useEffect(() => {
    dispatch(getMyTeam());
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
      navigate(`/admin/myteam/onboard?employeeId=${resumeId.trim()}`);
    }
  };

  const stats = [
    { label: 'Total Members', value: team?.length || 0, textClass: 'text-[#6366F1]' },
    {
      label: 'Med. Reps',
      value: team?.filter((m) => m.role === 'MR').length || 0,
      textClass: 'text-[#10B981]',
    },
    {
      label: 'Managers',
      value:
        team?.filter((m) => m.role?.includes('MANAGER')).length || 0,
      textClass: 'text-[#F59E0B]',
    },
    {
      label: 'Medical Staff',
      value:
        team?.filter((m) => ['DOCTOR', 'PHARMACIST'].includes(m.role)).length ||
        0,
      textClass: 'text-[#EF4444]',
    },
  ];

  return (
    <div className="animate-[fadeIn_0.35s_ease-out]">
      {/* ── Action Bar ────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        {/* Resume search */}
        <form
          onSubmit={handleResumeSubmit}
          className="flex gap-2 items-center"
        >
          <div className="relative">
            <RefreshCw
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              placeholder="Enter Employee ID to resume onboarding…"
              className="pl-9 pr-3.5 py-[11px] rounded-xl border-[1.5px] border-gray-200 w-[310px] text-[13px] outline-none transition-[border-color] duration-200 focus:border-indigo-500 bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={!resumeId.trim()}
            className={`px-4.5 py-[11px] rounded-xl border-[1.5px] border-gray-200 font-bold text-[13px] transition-all duration-200 ${
              resumeId.trim()
                ? 'bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200'
                : 'bg-[#FAFAFA] text-gray-400 cursor-not-allowed'
            }`}
          >
            Resume Onboarding
          </button>
        </form>

        <div className="flex gap-2.5">
          {/* New onboarding button */}
          <button
            onClick={() => navigate('/admin/myteam/onboard')}
            className="flex items-center gap-2 bg-gray-900 text-white px-5.5 py-3 rounded-xl border-none font-bold text-sm cursor-pointer shadow-[0_4px_14px_rgba(17,24,39,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(17,24,39,0.25)]"
          >
            <Plus size={18} strokeWidth={3} />
            Onboard New Member
          </button>

          {/* New doctor onboarding button */}
          <button
            onClick={() => navigate('/admin/myteam/onboard-doctor')}
            className="flex items-center gap-2 bg-[#C8F04A] text-gray-900 px-5.5 py-3 rounded-xl border-none font-extrabold text-sm cursor-pointer shadow-[0_4px_14px_rgba(200,240,74,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(200,240,74,0.35)]"
          >
            <Plus size={18} strokeWidth={3} />
            Onboard Doctor
          </button>
        </div>
      </div>

      {/* ── Stats Bar ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white px-5.5 py-4.5 rounded-2xl border-[1.5px] border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)]"
          >
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.5px]">
              {s.label}
            </div>
            <div
              className={`text-3xl font-extrabold mt-1.5 leading-none ${s.textClass}`}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Team Table ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Table toolbar */}
        <div className="px-6 py-4.5 border-b-[1.5px] border-gray-100 flex justify-between items-center">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              placeholder="Search by name, email or role…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-2.5 rounded-lg border-[1.5px] border-gray-200 w-[280px] text-[13px] outline-none transition-[border-color] duration-200 focus:border-indigo-500 bg-white"
            />
          </div>
          <span className="text-[13px] text-gray-400 font-semibold">
            {filteredTeam.length} member{filteredTeam.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50">
                {['Member', 'Contact', 'Role', 'Status', 'Action'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider border-b-[1.5px] border-gray-100"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-[60px] text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2
                        size={28}
                        color="#6366F1"
                        className="animate-spin"
                      />
                      <p className="text-gray-400 text-sm m-0">
                        Loading your team…
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredTeam.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-[60px] text-center text-gray-400 text-sm"
                  >
                    {searchQuery
                      ? 'No members match your search.'
                      : 'No team members yet. Click "Onboard New Member" to get started.'}
                  </td>
                </tr>
              ) : (
                filteredTeam.map((member) => {
                  const roleColor = ROLE_COLORS[member.role] || {
                    bgClass: 'bg-[#F3F4F6]',
                    textClass: 'text-[#4B5563]',
                  };
                  const initials =
                    member.fullName
                      ?.split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('') || '?';
                  return (
                    <tr
                      key={member.id}
                      className="border-b border-gray-50 transition-colors duration-150 cursor-default hover:bg-gray-50/50"
                    >
                      {/* Member */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-[42px] h-[42px] rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                            {initials || <User size={18} />}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">
                              {member.fullName || '—'}
                            </div>
                            <div className="text-xs text-gray-400">
                              ID:{' '}
                              {member.employeeId ||
                                String(member.id || '').slice(-8) ||
                                'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                            <Mail size={13} className="text-gray-400" />
                            {member.email || '—'}
                          </div>
                          <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                            <Phone size={13} className="text-gray-400" />
                            {member.phone || '—'}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${roleColor.bgClass} ${roleColor.textClass}`}
                        >
                          <Briefcase size={11} />
                          {member.role?.replace(/_/g, ' ') || '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[13px] font-semibold text-emerald-600">
                            Active
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => handleEditClick(member.employeeId || member.id)}
                            title="View Employee"
                            className="bg-transparent border-none cursor-pointer text-gray-400 p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center hover:text-indigo-600 hover:bg-indigo-50"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(member.employeeId || member.id, member.fullName)}
                            title="Delete Employee"
                            className="bg-transparent border-none cursor-pointer text-gray-400 p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
        <div className="fixed inset-0 bg-black/55 backdrop-blur-md flex items-center justify-center z-[1100] p-5 animate-[fadeIn_0.25s_ease-out]">
          <div className="bg-white rounded-2xl w-full max-w-[440px] p-7.5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-center animate-[scaleIn_0.25s_cubic-bezier(0.34,1.56,0.64,1)]">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5 text-red-600">
              <Trash2 size={28} />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mt-0 mb-2 mx-0">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-500 mt-0 mb-6 mx-0 leading-normal">
              Are you sure you want to delete <strong>{deleteConfirmName}</strong>?<br />
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteConfirmName(null);
                }}
                className="px-5.5 py-[11px] rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer flex-1 transition-colors duration-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5.5 py-[11px] rounded-xl border-none bg-red-600 text-white font-bold text-[13px] cursor-pointer flex-1 transition-opacity duration-200 shadow-[0_4px_12px_rgba(220,38,38,0.2)] hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 bg-emerald-50 border-[1.5px] border-emerald-200 px-5 py-4 rounded-xl flex items-center gap-2.5 text-emerald-700 text-[13px] font-bold shadow-[0_10px_25px_rgba(0,0,0,0.05)] z-[1200] animate-[slideIn_0.3s_ease-out]">
          <CheckCircle2 size={18} />
          {successMessage}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default TeamManagement;

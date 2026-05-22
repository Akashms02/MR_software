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
  MR: { bg: '#ECFDF5', text: '#059669' },
  HR: { bg: '#EFF6FF', text: '#2563EB' },
  REGIONAL_MANAGER: { bg: '#FDF4FF', text: '#9333EA' },
  AREA_MANAGER: { bg: '#FFF7ED', text: '#EA580C' },
  DOCTOR: { bg: '#FEF2F2', text: '#DC2626' },
  PHARMACIST: { bg: '#FEFCE8', text: '#CA8A04' },
  DISTRIBUTOR: { bg: '#F0FDF4', text: '#16A34A' },
  PATIENT: { bg: '#F0F9FF', text: '#0284C7' },
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
    { label: 'Total Members', value: team?.length || 0, color: '#6366F1', bg: '#EEF2FF' },
    {
      label: 'Med. Reps',
      value: team?.filter((m) => m.role === 'MR').length || 0,
      color: '#10B981',
      bg: '#ECFDF5',
    },
    {
      label: 'Managers',
      value:
        team?.filter((m) => m.role?.includes('MANAGER')).length || 0,
      color: '#F59E0B',
      bg: '#FFFBEB',
    },
    {
      label: 'Medical Staff',
      value:
        team?.filter((m) => ['DOCTOR', 'PHARMACIST'].includes(m.role)).length ||
        0,
      color: '#EF4444',
      bg: '#FEF2F2',
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.35s ease-out' }}>
      {/* ── Action Bar ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Resume search */}
        <form
          onSubmit={handleResumeSubmit}
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <div style={{ position: 'relative' }}>
            <RefreshCw
              size={15}
              color="#9CA3AF"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <input
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              placeholder="Enter Employee ID to resume onboarding…"
              style={{
                padding: '11px 14px 11px 36px',
                borderRadius: '12px',
                border: '1.5px solid #E5E7EB',
                width: '310px',
                fontSize: '13px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
            />
          </div>
          <button
            type="submit"
            disabled={!resumeId.trim()}
            style={{
              padding: '11px 18px',
              borderRadius: '12px',
              border: '1.5px solid #E5E7EB',
              background: resumeId.trim() ? '#F3F4F6' : '#FAFAFA',
              color: resumeId.trim() ? '#374151' : '#9CA3AF',
              fontWeight: 700,
              fontSize: '13px',
              cursor: resumeId.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            Resume Onboarding
          </button>
        </form>

        {/* New onboarding button */}
        <button
          onClick={() => navigate('/admin/myteam/onboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#111827',
            color: '#fff',
            padding: '12px 22px',
            borderRadius: '12px',
            border: 'none',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(17,24,39,0.18)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(17,24,39,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(17,24,39,0.18)';
          }}
        >
          <Plus size={18} strokeWidth={3} />
          Onboard New Member
        </button>
      </div>

      {/* ── Stats Bar ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              padding: '18px 22px',
              borderRadius: '16px',
              border: '1.5px solid #F3F4F6',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: s.color,
                marginTop: '6px',
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Team Table ────────────────────────────────────────────── */}
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          border: '1.5px solid #F3F4F6',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Table toolbar */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1.5px solid #F3F4F6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="#9CA3AF"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <input
              placeholder="Search by name, email or role…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '10px 14px 10px 36px',
                borderRadius: '10px',
                border: '1.5px solid #E5E7EB',
                width: '280px',
                fontSize: '13px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#6366F1')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
            />
          </div>
          <span
            style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 600 }}
          >
            {filteredTeam.length} member{filteredTeam.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Member', 'Contact', 'Role', 'Status', 'Action'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '14px 20px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: '1.5px solid #F3F4F6',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ padding: '60px', textAlign: 'center' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <Loader2
                        size={28}
                        color="#6366F1"
                        style={{ animation: 'spin 0.8s linear infinite' }}
                      />
                      <p
                        style={{
                          color: '#9CA3AF',
                          fontSize: '14px',
                          margin: 0,
                        }}
                      >
                        Loading your team…
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredTeam.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      padding: '60px',
                      textAlign: 'center',
                      color: '#9CA3AF',
                      fontSize: '14px',
                    }}
                  >
                    {searchQuery
                      ? 'No members match your search.'
                      : 'No team members yet. Click "Onboard New Member" to get started.'}
                  </td>
                </tr>
              ) : (
                filteredTeam.map((member) => {
                  const roleColor = ROLE_COLORS[member.role] || {
                    bg: '#F3F4F6',
                    text: '#4B5563',
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
                      style={{
                        borderBottom: '1px solid #F9FAFB',
                        transition: 'background 0.15s',
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = '#FAFAFA')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      {/* Member */}
                      <td style={{ padding: '16px 20px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                          }}
                        >
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '12px',
                              background:
                                'linear-gradient(135deg, #6366F1, #8B5CF6)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: '14px',
                              flexShrink: 0,
                            }}
                          >
                            {initials || <User size={18} />}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                color: '#111827',
                                fontSize: '14px',
                              }}
                            >
                              {member.fullName || '—'}
                            </div>
                            <div
                              style={{ fontSize: '12px', color: '#9CA3AF' }}
                            >
                              ID:{' '}
                              {member.employeeId ||
                                String(member.id || '').slice(-8) ||
                                'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '16px 20px' }}>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '13px',
                              color: '#4B5563',
                            }}
                          >
                            <Mail size={13} color="#9CA3AF" />
                            {member.email || '—'}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '13px',
                              color: '#4B5563',
                            }}
                          >
                            <Phone size={13} color="#9CA3AF" />
                            {member.phone || '—'}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: roleColor.bg,
                            color: roleColor.text,
                            padding: '4px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          <Briefcase size={11} />
                          {member.role?.replace(/_/g, ' ') || '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: '#10B981',
                            }}
                          />
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#059669',
                            }}
                          >
                            Active
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => handleEditClick(member.employeeId || member.id)}
                            title="View Employee"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#9CA3AF',
                              padding: '6px',
                              borderRadius: '8px',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#4F46E5';
                              e.currentTarget.style.background = '#EEF2FF';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#9CA3AF';
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(member.employeeId || member.id, member.fullName)}
                            title="Delete Employee"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#9CA3AF',
                              padding: '6px',
                              borderRadius: '8px',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#DC2626';
                              e.currentTarget.style.background = '#FEF2F2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#9CA3AF';
                              e.currentTarget.style.background = 'transparent';
                            }}
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
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '440px',
              padding: '30px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
              textAlign: 'center',
              animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#FEF2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                color: '#DC2626',
              }}
            >
              <Trash2 size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>
              Confirm Deletion
            </h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>{deleteConfirmName}</strong>?<br />
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteConfirmName(null);
                }}
                style={{
                  padding: '11px 22px',
                  borderRadius: '12px',
                  border: '1.5px solid #E5E7EB',
                  background: '#fff',
                  color: '#374151',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  flex: 1,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '11px 22px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#DC2626',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  flex: 1,
                  transition: 'opacity 0.2s',
                  boxShadow: '0 4px 12px rgba(220,38,38,0.2)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#ECFDF5',
            border: '1.5px solid #A7F3D0',
            padding: '16px 20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#047857',
            fontSize: '13px',
            fontWeight: 700,
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            zIndex: 1200,
            animation: 'slideIn 0.3s ease-out',
          }}
        >
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

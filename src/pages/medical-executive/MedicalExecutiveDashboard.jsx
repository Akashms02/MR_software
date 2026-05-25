import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeamDcrsAction, reviewDcrAction } from '../../redux/actions/dcrActions';
import { Loader2, Check, X, FileText, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';

const MedicalExecutiveDashboard = () => {
  const dispatch = useDispatch();
  const { teamDcrs, loading, error, success } = useSelector((state) => state.dcr);

  const [reviewingId, setReviewingId] = useState(null);
  const [remarksMap, setRemarksMap] = useState({});
  const [localSuccess, setLocalSuccess] = useState(null);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    dispatch(fetchTeamDcrsAction());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setLocalSuccess(success);
      const t = setTimeout(() => setLocalSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      const t = setTimeout(() => setLocalError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleReview = async (dcrId, status) => {
    const remarks = remarksMap[dcrId] || (status === 'APPROVED' ? 'Approved via Executive Dashboard' : 'Rejected');
    setReviewingId(dcrId);
    try {
      await dispatch(reviewDcrAction(dcrId, status, remarks));
      // Refresh the team list
      dispatch(fetchTeamDcrsAction());
      // Clear input
      setRemarksMap(prev => {
        const copy = { ...prev };
        delete copy[dcrId];
        return copy;
      });
    } catch (err) {
      // Handled by Redux error state
    } finally {
      setReviewingId(null);
    }
  };

  const handleApproveAll = async () => {
    const pendings = teamDcrs.filter(d => d.status === 'SUBMITTED');
    if (pendings.length === 0) return;
    setReviewingId('all');
    try {
      for (const d of pendings) {
        await dispatch(reviewDcrAction(d.id, 'APPROVED', 'Approved all pending DCRs'));
      }
      dispatch(fetchTeamDcrsAction());
    } catch (err) {
      // Error is caught by store
    } finally {
      setReviewingId(null);
    }
  };

  const pendingDcrList = teamDcrs.filter(d => d.status === 'SUBMITTED');
  const pendingCount = pendingDcrList.length;
  const totalCount = teamDcrs.length;

  const stats = [
    { label: 'DCRs Awaiting Review', value: `${pendingCount} / ${totalCount}`, sub: pendingCount > 0 ? 'Pending action' : 'All caught up!', color: pendingCount > 0 ? '#F59E0B' : '#10B981', bg: pendingCount > 0 ? '#FFFBEB' : '#ECFDF5', icon: '📋' },
    { label: 'Active Campaigns', value: '6 Products', sub: 'Q2 Rollout', color: '#06B6D4', bg: '#ECFEFF', icon: '🚀' },
    { label: 'Medical Seminars', value: '3 Confirmed', sub: 'This Month', color: '#6366F1', bg: '#EEF2FF', icon: '🎓' },
    { label: 'Field Coverage', value: '94.2%', sub: 'Active Territories', color: '#10B981', bg: '#ECFDF5', icon: '🗺️' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', padding: '10px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #3730A3 0%, #6366F1 100%)',
        borderRadius: '20px',
        padding: '30px',
        color: '#fff',
        marginBottom: '28px',
        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>
            PORTAL: MEDICAL EXECUTIVE
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '14px 0 6px 0', letterSpacing: '-0.5px' }}>
            Executive Dashboard
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '500px' }}>
            Review daily call reports, monitor regional product campaigns, and allocate marketing samples.
          </p>
        </div>
        <div style={{
          position: 'absolute', right: '-40px', bottom: '-40px', fontSize: '180px', opacity: 0.1, userSelect: 'none', pointerEvents: 'none'
        }}>
          👔
        </div>
      </div>

      {/* Notifications */}
      {localSuccess && (
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '12px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
          <CheckCircle2 size={16} />
          {localSuccess}
        </div>
      )}
      {localError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#B91C1C', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
          <AlertCircle size={16} />
          {localError}
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: '#fff',
            border: '1.5px solid #F3F4F6',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)';
          }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px', background: s.bg, fontSize: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', margin: '2px 0' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: s.color }}>
                {s.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Daily Schedule & Visits */}
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>Daily Call Reports (DCR) Pending Approval</h3>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366F1' }}>Count: {pendingCount} reports</span>
          </div>

          {loading && teamDcrs.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', gap: '10px' }}>
              <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', color: '#6366F1' }} />
              <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Loading submitted DCRs...</span>
            </div>
          ) : pendingCount === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', background: '#FAFAFA', borderRadius: '12px', border: '1px dashed #E5E7EB' }}>
              <CheckCircle2 size={36} style={{ margin: '0 auto 10px auto', color: '#10B981' }} />
              <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: '#4B5563' }}>All caught up! No DCRs awaiting review.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingDcrList.map((dcr) => (
                <div key={dcr.id} style={{
                  display: 'flex', flexDirection: 'column', gap: '12px', padding: '18px', borderRadius: '16px', background: '#FAFAFA', border: '1px solid #F3F4F6', transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', background: '#E0E7FF', color: '#4F46E5', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px'
                      }}>
                        {dcr.mrName ? dcr.mrName.charAt(0) : 'M'}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>{dcr.mrName || 'Medical Representative'}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '1px' }}>Date Logged: <span style={{ fontWeight: 600 }}>{dcr.reportDate}</span></div>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', background: '#FFFBEB', color: '#B45309' }}>
                      Pending
                    </span>
                  </div>

                  {/* Visits Summary */}
                  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Visits Detail</div>
                    {dcr.visits?.map((v, i) => (
                      <div key={i} style={{ fontSize: '12.5px', color: '#4B5563', display: 'flex', justifyContent: 'space-between', borderBottom: i < dcr.visits.length - 1 ? '1px solid #F3F4F6' : 'none', paddingBottom: i < dcr.visits.length - 1 ? '6px' : 0 }}>
                        <span>👨‍⚕️ Doctor ID: <span style={{ fontWeight: 600 }}>{v.doctorId}</span></span>
                        <span>Promoted: <span style={{ fontWeight: 600 }}>{v.productsDiscussed || 'N/A'}</span></span>
                        <span>Time: <span style={{ fontWeight: 600 }}>{v.visitTime ? v.visitTime.slice(0, 5) : '—'}</span></span>
                      </div>
                    ))}
                  </div>

                  {/* Remarks Input and Review Buttons */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="text"
                        placeholder="Add manager remarks (optional)..."
                        value={remarksMap[dcr.id] || ''}
                        onChange={(e) => setRemarksMap(prev => ({ ...prev, [dcr.id]: e.target.value }))}
                        disabled={reviewingId === dcr.id}
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <button
                      onClick={() => handleReview(dcr.id, 'APPROVED')}
                      disabled={reviewingId !== null}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px', background: '#10B981', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '12.5px', transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      {reviewingId === dcr.id ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={14} />} Approve
                    </button>
                    <button
                      onClick={() => handleReview(dcr.id, 'REJECTED')}
                      disabled={reviewingId !== null}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px', background: '#EF4444', color: '#fff', border: 'none', padding: '9px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '12.5px', transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div style={{ background: '#fff', border: '1.5px solid #F3F4F6', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 18px 0', fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>Executive Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleApproveAll}
              disabled={pendingCount === 0 || reviewingId !== null}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                background: pendingCount === 0 ? '#E5E7EB' : '#6366F1',
                color: pendingCount === 0 ? '#9CA3AF' : '#fff',
                fontWeight: 700, fontSize: '13px', cursor: pendingCount === 0 ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
              onMouseEnter={e => { if (pendingCount > 0) e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={e => { if (pendingCount > 0) e.currentTarget.style.opacity = '1' }}
            >
              {reviewingId === 'all' ? (
                <>
                  <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Processing approvals...
                </>
              ) : (
                '✅ Approve All Pending DCRs'
              )}
            </button>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              📢 Launch New Product Campaign
            </button>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              📊 Allocate Regional Quotas
            </button>
            <button style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              📁 Download Analytics Dossier
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default MedicalExecutiveDashboard;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTeamDcrsAction, reviewDcrAction } from '../../redux/actions/dcrActions';
import { Loader2, Check, X, AlertCircle, CheckCircle2 } from 'lucide-react';

const MedicalExecutiveDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      dispatch(fetchTeamDcrsAction());
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
    { label: 'DCRs Awaiting Review', value: `${pendingCount} / ${totalCount}`, sub: pendingCount > 0 ? 'Pending action' : 'All caught up!', colorClass: pendingCount > 0 ? 'text-amber-500' : 'text-emerald-500', bgClass: pendingCount > 0 ? 'bg-amber-50' : 'bg-emerald-50', icon: '📋' },
    { label: 'Active Campaigns', value: '6 Products', sub: 'Q2 Rollout', colorClass: 'text-cyan-500', bgClass: 'bg-cyan-50', icon: '🚀' },
    { label: 'Medical Seminars', value: '3 Confirmed', sub: 'This Month', colorClass: 'text-indigo-500', bgClass: 'bg-indigo-50', icon: '🎓' },
    { label: 'Field Coverage', value: '94.2%', sub: 'Active Territories', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50', icon: '🗺️' },
  ];

  return (
    <div className="animate-[fadeIn_0.4s_ease-out] p-2.5">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[20px] p-[30px] text-white mb-7" style={{ background: 'linear-gradient(135deg, #3730A3 0%, #6366F1 100%)', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.15)' }}>
        <div className="relative z-10">
          <span className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest">
            PORTAL: MEDICAL EXECUTIVE
          </span>
          <h2 className="text-[28px] font-extrabold mt-3.5 mb-1.5 tracking-tight">
            Executive Dashboard
          </h2>
          <p className="text-sm text-white/85 max-w-[500px] m-0">
            Review daily call reports, monitor regional product campaigns, and allocate marketing samples.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 text-[180px] opacity-10 select-none pointer-events-none">
          👔
        </div>
      </div>

      {/* Notifications */}
      {localSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl flex items-center gap-2 text-emerald-700 text-[13px] font-semibold mb-5">
          <CheckCircle2 size={16} />
          {localSuccess}
        </div>
      )}
      {localError && (
        <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-xl flex items-center gap-2 text-red-700 text-[13px] font-semibold mb-5">
          <AlertCircle size={16} />
          {localError}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 mb-7">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`w-12 h-12 rounded-xl ${s.bgClass} text-2xl flex items-center justify-center shrink-0`}>
              {s.icon}
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {s.label}
              </div>
              <div className="text-xl font-extrabold text-gray-800 my-0.5">
                {s.value}
              </div>
              <div className={`text-[11px] font-semibold ${s.colorClass}`}>
                {s.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-6 items-start">
        {/* DCR Pending Approval */}
        <div className="bg-white border border-gray-100 rounded-[18px] p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div className="flex justify-between items-center mb-5">
            <h3 className="m-0 text-base font-extrabold text-gray-800">Daily Call Reports (DCR) Pending Approval</h3>
            <span className="text-xs font-bold text-indigo-500">Count: {pendingCount} reports</span>
          </div>

          {loading && teamDcrs.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2.5">
              <Loader2 size={24} className="animate-spin text-indigo-500" />
              <span className="text-[13px] text-gray-400">Loading submitted DCRs...</span>
            </div>
          ) : pendingCount === 0 ? (
            <div className="py-10 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <CheckCircle2 size={36} className="mx-auto mb-2.5 text-emerald-500" />
              <p className="m-0 text-[13.5px] font-semibold text-gray-600">All caught up! No DCRs awaiting review.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {pendingDcrList.map((dcr) => (
                <div key={dcr.id} className="flex flex-col gap-3 p-[18px] rounded-2xl bg-gray-50 border border-gray-100 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-extrabold text-sm">
                        {dcr.mrName ? dcr.mrName.charAt(0) : 'M'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">{dcr.mrName || 'Medical Representative'}</div>
                        <div className="text-xs text-gray-500 mt-px">Date Logged: <span className="font-semibold">{dcr.reportDate}</span></div>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                      Pending
                    </span>
                  </div>

                  {/* Visits Summary */}
                  <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
                    <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wide">Visits Detail</div>
                    {dcr.visits?.map((v, i) => (
                      <div key={i} className={`text-xs text-gray-500 flex justify-between ${i < dcr.visits.length - 1 ? 'border-b border-gray-100 pb-1.5' : ''}`}>
                        <span>👨‍⚕️ Doctor ID: <span className="font-semibold">{v.doctorId}</span></span>
                        <span>Promoted: <span className="font-semibold">{v.productsDiscussed || 'N/A'}</span></span>
                        <span>Time: <span className="font-semibold">{v.visitTime ? v.visitTime.slice(0, 5) : '—'}</span></span>
                      </div>
                    ))}
                  </div>

                  {/* Remarks & Review Buttons */}
                  <div className="flex gap-2.5 items-center mt-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Add manager remarks (optional)..."
                        value={remarksMap[dcr.id] || ''}
                        onChange={(e) => setRemarksMap(prev => ({ ...prev, [dcr.id]: e.target.value }))}
                        disabled={reviewingId === dcr.id}
                        className="w-full py-2 px-3 rounded-[10px] border border-gray-200 text-[13px] outline-none bg-white box-border"
                      />
                    </div>
                    <button
                      onClick={() => handleReview(dcr.id, 'APPROVED')}
                      disabled={reviewingId !== null}
                      className="flex items-center gap-1 bg-emerald-500 text-white border-none py-2 px-3.5 rounded-[10px] cursor-pointer font-bold text-[12.5px] transition-opacity hover:opacity-90"
                    >
                      {reviewingId === dcr.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />} Approve
                    </button>
                    <button
                      onClick={() => handleReview(dcr.id, 'REJECTED')}
                      disabled={reviewingId !== null}
                      className="flex items-center gap-1 bg-red-500 text-white border-none py-2 px-3.5 rounded-[10px] cursor-pointer font-bold text-[12.5px] transition-opacity hover:opacity-90"
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
        <div className="bg-white border border-gray-100 rounded-[18px] p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 className="m-0 mb-4 text-base font-extrabold text-gray-800">Executive Actions</h3>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleApproveAll}
              disabled={pendingCount === 0 || reviewingId !== null}
              className={`w-full py-3 rounded-xl border-none font-bold text-[13px] text-center flex items-center justify-center gap-1.5 transition-opacity ${pendingCount === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-500 text-white cursor-pointer hover:opacity-90'}`}
            >
              {reviewingId === 'all' ? (
                <><Loader2 size={14} className="animate-spin" /> Processing approvals...</>
              ) : (
                '✅ Approve All Pending DCRs'
              )}
            </button>
            <button
              onClick={() => navigate('/medical-executive/onboard-doctor')}
              className="w-full py-3 rounded-xl border-none bg-indigo-600 text-white font-bold text-[13px] hover:opacity-90 transition-opacity text-center cursor-pointer"
            >
              ➕ Onboard Doctor / Pharmacist
            </button>
            <button
              onClick={() => navigate('/medical-executive/fieldtracking')}
              className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer transition-colors hover:bg-gray-50 text-center"
            >
              📍 Field Tracking
            </button>
            <button
              onClick={() => navigate('/medical-executive/leaves')}
              className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer transition-colors hover:bg-gray-50 text-center"
            >
              📅 Leaves & Approvals
            </button>
            <button className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer transition-colors hover:bg-gray-50 text-center">
              📢 Launch New Product Campaign
            </button>
            <button className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer transition-colors hover:bg-gray-50 text-center">
              📊 Allocate Regional Quotas
            </button>
            <button className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] cursor-pointer transition-colors hover:bg-gray-50 text-center">
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

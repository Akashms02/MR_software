import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ExternalLink, ChevronRight, Plus, Calendar, Clock, Loader2, Send, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
  fetchMyLeavesAction,
  applyLeaveAction,
  fetchMyBalancesAction,
  fetchLeaveTypesAction,
  fetchTeamLeavesAction,
  clearLeaveErrorsAction,
  clearLeaveSuccessAction
} from '../../redux/actions/leaveActions';
import { fetchActiveUpcomingHolidaysAction } from '../../redux/actions/holidayActions';

/* ── Small Donut Chart (SVG) ─────────────────────────────────────────── */
function DonutChart({ used, total, color }) {
  const safeTotal = total > 0 ? total : 1;
  const remaining = Math.max(0, total - used);
  const r = 26;
  const circ = 2 * Math.PI * r;
  const usedDash = (used / safeTotal) * circ;
  const remDash = (remaining / safeTotal) * circ;

  return (
    <svg width="68" height="68" viewBox="0 0 68 68">
      <circle cx="34" cy="34" r={r} fill="none" stroke="#F3F4F6" strokeWidth="7" />
      {/* Used portion (Soft Red/Rose) */}
      <circle cx="34" cy="34" r={r} fill="none" stroke="#FCA5A5" strokeWidth="7"
        strokeDasharray={`${usedDash} ${circ - usedDash}`}
        strokeLinecap="round"
        transform="rotate(-90 34 34)"
      />
      {/* Unused/Remaining portion (Theme Color) */}
      <circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${remDash} ${circ - remDash}`}
        strokeLinecap="round"
        transform={`rotate(${(used / safeTotal) * 360 - 90} 34 34)`}
      />
    </svg>
  );
}

/* ── Leave Balance Card ───────────────────────────────────────────────── */
function LeaveCard({ label, total, used, color }) {
  const available = Math.max(0, total - used);

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-[18px] py-4 hover:shadow-md transition-shadow">
      <div className="text-xs font-bold text-[#111827] mb-3 truncate" title={label}>{label}</div>
      <div className="flex items-center gap-3.5">
        <DonutChart used={used} total={total} color={color} />
        <div className="flex flex-col gap-1 min-w-0">
          <div className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wider">Available</div>
          <div className="text-sm font-extrabold text-[#111827]">{available}</div>
          <div className="text-[10px] text-[#9CA3AF] mt-1 font-semibold uppercase tracking-wider">Total</div>
          <div className="text-xs font-bold text-[#374151]">{total}</div>
          <div className="flex items-center gap-1 text-[10px] text-[#6B7280] font-medium mt-1">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            Used {used}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Leave History Row ─────────────────────────────────────────────────── */
function LeaveHistoryRow({ type, sub, date, status }) {
  const badgeClasses = {
    'APPROVED': 'bg-[#F0FDF4] text-[#22C55E]',
    'PENDING':  'bg-[#FFFBEB] text-[#F59E0B]',
    'REJECTED': 'bg-[#FFF1F2] text-[#F43F5E]',
  }[status?.toUpperCase()] || 'bg-[#F3F4F6] text-[#6B7280]';

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#F9FAFB] hover:bg-gray-50/50 transition-colors">
      <div className="min-w-0 flex-1 pr-3">
        <div className="text-[13px] font-bold text-[#111827] truncate">{type}</div>
        <div className="text-[11px] text-[#9CA3AF] truncate">{sub}</div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-[11.5px] text-[#9CA3AF] font-medium">{date}</div>
        <div className={`px-2.5 py-[3px] rounded-md text-[10px] font-extrabold tracking-wide uppercase ${badgeClasses}`}>
          {status}
        </div>
      </div>
    </div>
  );
}

/* ── Calendar Event Row ─────────────────────────────────────────────────── */
function CalendarRow({ dateBg, dateColor, dateText, title, sub, actionLabel, actionColor, onAction }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#F9FAFB] hover:bg-gray-50/50 transition-colors">
      <div className="w-9 h-9 rounded-xl shrink-0 flex flex-col items-center justify-center font-sans" style={{ backgroundColor: dateBg }}>
        <div className="text-xs font-extrabold" style={{ color: dateColor }}>{dateText}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-[#111827] truncate">{title}</div>
        <div className="text-[11px] text-[#9CA3AF] truncate">{sub}</div>
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className={`px-3 py-1 rounded-md text-[10px] font-bold border-0 cursor-pointer transition-all active:scale-95 ${
            actionColor === 'lime' 
              ? 'bg-[#C8F04A] text-[#1A1A1A] hover:opacity-90' 
              : 'bg-[#FFF1F2] text-[#F43F5E] hover:bg-[#FFE4E6]'
          }`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────── */
export default function AdminAttendance() {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { leaves, myBalances, leaveTypes, teamLeaves, error, success } = useSelector((state) => state.leave);
  const { activeUpcomingHolidays } = useSelector((state) => state.holiday);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [reason, setReason] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Sync redux messages
  useEffect(() => {
    if (success) {
      showToast(success, 'success');
      dispatch(clearLeaveSuccessAction());
    }
  }, [success, dispatch, showToast]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      dispatch(clearLeaveErrorsAction());
    }
  }, [error, dispatch, showToast]);

  // Fetch data
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    dispatch(fetchMyLeavesAction());
    dispatch(fetchMyBalancesAction(currentYear));
    dispatch(fetchActiveUpcomingHolidaysAction());
    dispatch(fetchLeaveTypesAction());

    const isSupervisor = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR' || 
                         user?.role === 'MANAGER' || user?.role === 'VP' || user?.role === 'ZONE_MANAGER' || 
                         user?.role === 'REGIONAL_MANAGER' || user?.role === 'AREA_MANAGER';
    if (isSupervisor) {
      dispatch(fetchTeamLeavesAction());
    }
  }, [dispatch, user]);

  // Listen for Apply Leave trigger from layout Header
  useEffect(() => {
    const handleOpenModal = () => setIsApplyModalOpen(true);
    window.addEventListener('open-apply-leave-modal', handleOpenModal);
    return () => window.removeEventListener('open-apply-leave-modal', handleOpenModal);
  }, []);

  // Default leave type setup
  useEffect(() => {
    if (leaveTypes?.length > 0 && !leaveTypeId) {
      setLeaveTypeId(leaveTypes[0].id.toString());
    }
  }, [leaveTypes, leaveTypeId]);

  const handleApplyLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !leaveTypeId || !reason.trim()) {
      showToast('All fields are required.', 'error');
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      showToast('End Date cannot be before Start Date.', 'error');
      return;
    }
    if (reason.trim().length < 10) {
      showToast('Please provide a detailed reason (minimum 10 characters).', 'error');
      return;
    }

    setFormLoading(true);
    try {
      await dispatch(applyLeaveAction({
        leaveTypeId: parseInt(leaveTypeId, 10),
        fromDate: startDate,
        toDate: endDate,
        reason: reason.trim(),
        leaveSession: 'FULL_DAY'
      }));
      setStartDate('');
      setEndDate('');
      setReason('');
      setIsApplyModalOpen(false);
      
      const currentYear = new Date().getFullYear();
      dispatch(fetchMyLeavesAction());
      dispatch(fetchMyBalancesAction(currentYear));
    } catch (_) {
      // Redux handles toast error
    } finally {
      setFormLoading(false);
    }
  };

  const getBalanceCardColor = (code) => {
    const uc = (code || '').toUpperCase();
    if (uc.includes('CASUAL') || uc === 'CL') return '#A78BFA';
    if (uc.includes('SICK') || uc === 'SL') return '#F43F5E';
    if (uc.includes('PRIVILEGE') || uc === 'PL') return '#10B981';
    return '#3B82F6';
  };

  const formatLeaveTypeName = (type) => {
    const t = (type && typeof type === 'object') ? (type.name || type.code || '') : (type || '');
    return t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || 'Leave';
  };

  // Filter approved team leaves
  const approvedTeamLeaves = (teamLeaves || [])
    .filter(item => item.status?.toUpperCase() === 'APPROVED')
    .slice(0, 5);

  const upcomingHolidays = (activeUpcomingHolidays || []).slice(0, 4);
  const myLeavesHistory = (leaves || []).slice(0, 4);

  return (
    <div className="animate-[fadeSlideIn_0.3s_ease-out] relative">

      {/* ── Leave Balance Cards Row ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
        {myBalances?.length > 0 ? (
          myBalances.map((bal, idx) => {
            const code = bal.leaveCode || bal.leaveType?.code || bal.leaveTypeCode || '';
            const name = bal.leaveName || bal.leaveType?.name || bal.leaveTypeName || code || 'Leave';
            const used = bal.usedDays ?? bal.used ?? 0;
            const limit = bal.allocatedDays ?? bal.limit ?? bal.totalDays ?? 12;
            const color = getBalanceCardColor(code || name);

            return (
              <LeaveCard
                key={bal.id || idx}
                label={name}
                total={limit}
                used={used}
                color={color}
              />
            );
          })
        ) : (
          <>
            <LeaveCard label="Casual Leave" total={12} used={0} color="#A78BFA" />
            <LeaveCard label="Sick Leave" total={10} used={0} color="#F43F5E" />
            <LeaveCard label="Privilege Leave" total={15} used={0} color="#10B981" />
            <LeaveCard label="Compensatory Off" total={5} used={0} color="#3B82F6" />
          </>
        )}
        {/* Holidays Card */}
        <LeaveCard
          label="Upcoming Holidays"
          total={activeUpcomingHolidays?.length || 0}
          used={0}
          color="#F59E0B"
        />
      </div>

      {/* ── Middle Row: Leave History + Calendar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Leave History */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-extrabold text-[#111827]">Leave History</div>
              <Calendar size={14} className="text-[#9CA3AF]" />
            </div>
            
            {myLeavesHistory.length > 0 ? (
              <div className="space-y-1">
                {myLeavesHistory.map((leave, idx) => (
                  <LeaveHistoryRow
                    key={leave.id || leave.leaveId || idx}
                    type={formatLeaveTypeName(leave.leaveName || leave.leaveCode || leave.leaveType)}
                    sub={leave.reason || "No reason specified"}
                    date={leave.startDate || leave.fromDate || "—"}
                    status={leave.status}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                <Clock size={28} strokeWidth={1.5} className="mb-2" />
                <span className="text-xs font-semibold">No recent leave history</span>
              </div>
            )}
          </div>
        </div>

        {/* Leave Calendar (Holidays) */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
          <div className="text-sm font-extrabold text-[#111827] mb-3">Upcoming Holidays</div>
          {upcomingHolidays.length > 0 ? (
            <div className="space-y-1">
              {upcomingHolidays.map((holiday, idx) => {
                const dateObj = new Date(holiday.date);
                const dayStr = dateObj.toLocaleDateString(undefined, { day: '2-digit' });
                const monthStr = dateObj.toLocaleDateString(undefined, { month: 'short' });
                return (
                  <CalendarRow
                    key={holiday.id || idx}
                    dateBg="#F0FDF4"
                    dateColor="#22C55E"
                    dateText={`${dayStr} ${monthStr}`}
                    title={holiday.name}
                    sub={holiday.primaryType || "Public Holiday"}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
              <Calendar size={28} strokeWidth={1.5} className="mb-2" />
              <span className="text-xs font-semibold">No upcoming holidays</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Team Leave Calendar (only for supervisors/managers) ── */}
      {approvedTeamLeaves.length > 0 && (
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
          <div className="text-sm font-extrabold text-[#111827] mb-3">Team On Leave</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {approvedTeamLeaves.map((leave, idx) => {
              const name = leave.employeeName || leave.fullName || "Team Member";
              const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
              const fromDate = leave.startDate || leave.fromDate || "";
              const toDate = leave.endDate || leave.toDate || "";
              
              return (
                <div key={leave.id || idx} className="bg-[#FFF8F0] border border-[#FEF3C7] rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold text-amber-800 shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-extrabold text-[#374151] truncate">{name}</div>
                    <div className="text-[10px] text-[#9CA3AF] mt-0.5">{formatLeaveTypeName(leave.leaveTypeName || leave.leaveType)}</div>
                  </div>
                  <div className="text-[9px] font-extrabold text-amber-700 bg-amber-100/60 border border-amber-200/50 px-2 py-0.5 rounded-md whitespace-nowrap">
                    {fromDate.substring(5)} to {toDate.substring(5)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Leave Application Modal ────────────────────────────── */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 bg-[#111827]/40 backdrop-blur-[3px] z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col animate-in scale-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 leading-tight">Apply for Leave</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Submit a leave request for supervisor review</p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1.5 hover:bg-gray-150 rounded-lg text-gray-400 hover:text-gray-600 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleApplyLeaveSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#C8F04A] transition-colors"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#C8F04A] transition-colors"
                  />
                </div>
              </div>

              {/* Leave Type */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Leave Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={leaveTypeId}
                  onChange={(e) => setLeaveTypeId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-[#C8F04A] transition-colors"
                >
                  {leaveTypes?.length > 0 ? (
                    leaveTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="2">Casual Leave</option>
                      <option value="3">Sick Leave</option>
                      <option value="4">Earned Leave</option>
                      <option value="5">Paternity Leave</option>
                    </>
                  )}
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Reason for Leave <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain the purpose of your leave request..."
                  required
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none outline-none focus:border-[#C8F04A] transition-colors font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-xs cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl border-none bg-[#C8F04A] text-[#111827] font-extrabold text-xs cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {formLoading ? (
                    <><Loader2 size={13} className="animate-spin" /> Submitting...</>
                  ) : (
                    <><Send size={12} /> Submit Request</>
                  )}
                </button>
              </div>
            </form>
          </div>
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

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DailyQuote from '../../components/DailyQuote';
import { 
  Users, Calendar, FileText, Search, UserPlus, Navigation, BarChart2, Gift, Map as MapIcon,
  Loader2, Check, X, AlertCircle, CheckCircle2, ExternalLink, HelpCircle, Bell, Coffee
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';
import { fetchProfile } from '../../redux/actions/authActions';
import { getMyTeam } from '../../redux/actions/teamActions';
import { fetchTeamLeavesAction } from '../../redux/actions/leaveActions';
import { fetchTeamAttendanceAction, fetchTeamVisitsAction } from '../../redux/actions/attendanceActions';
import { fetchTeamDcrsAction, reviewDcrAction } from '../../redux/actions/dcrActions';
import { getFullAssetUrl } from '../../utils/getFullAssetUrl';
import { fetchActiveUpcomingHolidaysAction } from '../../redux/actions/holidayActions';
import { getActiveNotices } from '../../redux/actions/noticeActions';
import Pagination from '../../components/common/Pagination';

/* ── Stat Card ── */
function StatCard({ label, value, type }) {
  const configs = {
    teal:   { from: '#6EC6C2', to: '#4AAFA9', Icon: Users },
    orange: { from: '#FFB07A', to: '#FF8F4E', Icon: FileText },
    coral:  { from: '#FF9090', to: '#FF6B6B', Icon: Search },
    purple: { from: '#B8A6FB', to: '#9B87F5', Icon: Calendar },
  };
  const c = configs[type] || configs.teal;
  const { Icon } = c;

  return (
    <div
      className="rounded-[18px] px-[22px] py-5 flex flex-col min-h-[160px] relative overflow-hidden text-white shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
      style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
    >
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-xl bg-white/28 flex items-center justify-center">
          <Icon size={20} color="#fff" strokeWidth={2} />
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3">
        <div className="text-[13px] font-semibold opacity-90 max-w-[120px] leading-snug">
          {label}
        </div>
        <div className="text-[20px] font-extrabold leading-tight tracking-tight text-right select-all">
          {value}
        </div>
      </div>
    </div>
  );
}

/* ── Birthday Row ── */
function BirthdayRow({ name, date, role, photoUrl }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'E';
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-none">
      {photoUrl ? (
        <img 
          src={getFullAssetUrl(photoUrl)} 
          alt={name} 
          className="w-[34px] h-[34px] rounded-full object-cover shrink-0" 
        />
      ) : (
        <div className="w-[34px] h-[34px] rounded-full shrink-0 bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1] flex items-center justify-center text-[12px] font-bold text-[#334155]">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-[#111827] truncate">{name}</div>
        <div className="text-[11px] text-[#9CA3AF] truncate">{role || 'Team Member'}</div>
      </div>
      <div className="flex flex-col items-end">
        <div className="text-xs font-bold text-[#111827]">
          {date}
        </div>
      </div>
    </div>
  );
}

/* ── Quick Action Tile ── */
function QATile({ icon: Icon, label, onClick }) {
  return (
    <div 
      onClick={onClick} 
      className="bg-[#F9FAFB] rounded-xl px-2.5 py-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-150 hover:bg-[#F3F4F6] hover:-translate-y-0.5 border border-gray-100 hover:border-gray-200"
    >
      <Icon size={20} color="#111827" strokeWidth={2} />
      <div className="text-[11.5px] font-bold text-gray-700 text-center">{label}</div>
    </div>
  );
}

/* ── Card Wrapper ── */
function Card({ children, style, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 ${className}`} style={style}>
      {children}
    </div>
  );
}

const MedicalExecutiveDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State from Redux
  const { user } = useSelector((state) => state.auth);
  const { team = [] } = useSelector((state) => state.team || {});
  const { teamLeaves = [] } = useSelector((state) => state.leave || {});
  const { teamAttendance = [], teamVisits = [] } = useSelector((state) => state.attendance || {});
  const { teamDcrs = [], loading: dcrLoading, error: dcrError, success: dcrSuccess } = useSelector((state) => state.dcr || {});
  const { activeUpcomingHolidays = [] } = useSelector((state) => state.holiday || {});
  const { activeNotices = [] } = useSelector((state) => state.notices || {});

  const [reviewingId, setReviewingId] = useState(null);
  const [remarksMap, setRemarksMap] = useState({});
  const { showToast } = useToast();
  const [localSuccess, _setLocalSuccess] = useState(null);
  const [localError, _setLocalError] = useState(null);

  const setLocalSuccess = (msg) => {
    _setLocalSuccess(msg);
    if (msg) showToast(msg, 'success');
  };
  const setLocalError = (msg) => {
    _setLocalError(msg);
    if (msg) showToast(msg, 'error');
  };
  const [selectedNotice, setSelectedNotice] = useState(null);

  const [mrPage, setMrPage] = useState(0);
  const mrPageSize = 5;

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(getMyTeam());
    dispatch(fetchTeamLeavesAction());
    dispatch(fetchTeamAttendanceAction(todayStr, 0, 1000));
    dispatch(fetchTeamVisitsAction());
    dispatch(fetchTeamDcrsAction());
    dispatch(fetchActiveUpcomingHolidaysAction());
    dispatch(getActiveNotices());
  }, [dispatch, todayStr]);

  useEffect(() => {
    if (dcrSuccess) {
      setLocalSuccess(dcrSuccess);
      const t = setTimeout(() => setLocalSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [dcrSuccess]);

  useEffect(() => {
    if (dcrError) {
      setLocalError(dcrError);
      const t = setTimeout(() => setLocalError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [dcrError]);

  const handleReview = async (dcrId, status) => {
    const remarks = remarksMap[dcrId] || '';
    if (status === 'REJECTED' && !remarks.trim()) {
      setLocalError('Feedback/Remarks is mandatory when rejecting a DCR report.');
      return;
    }
    const finalRemarks = remarks || (status === 'APPROVED' ? 'Approved via Executive Dashboard' : 'Rejected');
    setReviewingId(dcrId);
    try {
      await dispatch(reviewDcrAction(dcrId, status, finalRemarks));
      dispatch(fetchTeamDcrsAction());
      setRemarksMap(prev => {
        const copy = { ...prev };
        delete copy[dcrId];
        return copy;
      });
    } catch (err) {
      // Handled by Redux
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
      // Handled by Redux
    } finally {
      setReviewingId(null);
    }
  };

  const displayName = user?.fullName || 'Medical Executive';

  // Time-based greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Dynamic next upcoming holiday
  const getNextHoliday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = activeUpcomingHolidays.map(h => {
      if (!h.date) return { ...h, dateObj: new Date(0) };
      const dateParts = h.date.split('-');
      const dateObj = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
      return { ...h, dateObj };
    })
      .filter(h => h.dateObj >= today)
      .sort((a, b) => a.dateObj - b.dateObj);
    
    if (upcoming.length > 0) {
      const next = upcoming[0];
      const day = next.dateObj.getDate();
      const month = next.dateObj.toLocaleDateString('en-US', { month: 'short' });
      return {
        dateStr: `${day} ${month}`,
        name: next.name
      };
    }
    return { dateStr: 'N/A', name: 'No Holidays' };
  };

  const nextHoliday = getNextHoliday();

  // Filter MRs from team list (same logic as tracking page)
  const mrEmployees = team.filter((member) => {
    const role = (member.role || '').toUpperCase().trim();
    const name = (member.fullName || member.name || '').toLowerCase();
    const isMr = role === 'MR' || role === 'MEDICAL_REPRESENTATIVE';
    const isSuperAdmin = name.includes('superadmin') || name.includes('admin');
    return isMr && !isSuperAdmin;
  });

  const paginatedEmployees = mrEmployees.slice(mrPage * mrPageSize, (mrPage + 1) * mrPageSize);

  useEffect(() => {
    setMrPage(0);
  }, [mrEmployees.length]);

  // Leaves calculation
  const pendingLeavesCount = teamLeaves.filter(l => l.status === 'PENDING').length;
  const activeOnLeaveCount = teamLeaves.filter(leave => {
    if (leave.status !== 'APPROVED') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(leave.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(leave.endDate);
    end.setHours(0, 0, 0, 0);
    return today >= start && today <= end;
  }).length;

  // DCR calculation
  const pendingDcrList = teamDcrs.filter(d => d.status === 'SUBMITTED');
  const pendingCount = pendingDcrList.length;

  // Role distribution helper
  const formatRole = (roleStr) => {
    if (!roleStr) return 'Employee';
    return roleStr.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  // Attendance Punch-in mapping helper
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      return (
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear()
      );
    } catch (e) {
      return false;
    }
  };

  const getTodayPunchRecord = (empId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return teamAttendance.find(a => {
      const logEmpId = String(a.employeeId || a.mrId || '');
      const targetEmpId = String(empId);
      return logEmpId === targetEmpId && a.punchInTime && isSameDay(a.punchInTime, todayStr);
    });
  };

  const getAttendanceDistribution = () => {
    let punchIn = 0;
    let visiteIn = 0;
    let punchOut = 0;
    let leavesApproved = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    mrEmployees.forEach(member => {
      const empId = member.id || member.employeeId;
      
      // Check leave
      const isLeave = teamLeaves.some(leave => {
        const logEmpId = String(leave.employeeId || leave.mrId || '');
        const targetEmpId = String(empId);
        if (logEmpId !== targetEmpId) return false;
        if (leave.status !== 'APPROVED') return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(leave.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(leave.endDate);
        end.setHours(0, 0, 0, 0);
        return today >= start && today <= end;
      });

      if (isLeave) {
        leavesApproved++;
        return;
      }

      // Check punch
      const punchRec = getTodayPunchRecord(empId);
      if (punchRec) {
        if (punchRec.punchOutTime) {
          punchOut++;
        } else {
          // Check if currently checked-in to a visit (Visite In)
          const hasActiveVisit = teamVisits.some(v => {
            const logMrId = String(v.mrId || v.employeeId || '');
            const targetMrId = String(empId);
            return logMrId === targetMrId && 
                   v.checkInTime && 
                   isSameDay(v.checkInTime, todayStr) && 
                   (!v.checkOutTime || v.status === 'CHECKED_IN');
          });

          if (hasActiveVisit) {
            visiteIn++;
          } else {
            punchIn++;
          }
        }
      }
    });

    return [
      { status: 'Punch In', count: punchIn, hex: '#059669' },
      { status: 'Visite In', count: visiteIn, hex: '#DC2626' },
      { status: 'Punch Out', count: punchOut, hex: '#D97706' },
      { status: 'Leaves Approved', count: leavesApproved, hex: '#4F46E5' }
    ];
  };

  const attDist = getAttendanceDistribution();

  // Birthdays dynamic list
  const getUpcomingBirthdays = () => {
    const currentMonth = new Date().getMonth();
    const list = team
      .filter(emp => emp.dateOfBirth)
      .filter(emp => {
        const dob = new Date(emp.dateOfBirth);
        return dob.getMonth() === currentMonth;
      })
      .map(emp => {
        const dob = new Date(emp.dateOfBirth);
        return {
          name: emp.fullName,
          date: dob.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          role: formatRole(emp.role),
          photoUrl: emp.photoUrl
        };
      });
    
    if (list.length === 0 && team.length > 0) {
      const monthStr = new Date().toLocaleDateString('en-US', { month: 'short' });
      const dates = [`12 ${monthStr}`, `20 ${monthStr}`, `25 ${monthStr}`];
      return team.slice(0, 3).map((emp, i) => ({
        name: emp.fullName,
        date: dates[i % dates.length],
        role: formatRole(emp.role),
        photoUrl: emp.photoUrl
      }));
    }
    return list.slice(0, 4);
  };

  const birthdayList = getUpcomingBirthdays();



  const formatIsoToTime = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="animate-[fadeIn_0.35s_ease-out]">
      {/* ── Welcome Header Card ── */}
      <div className="rounded-[20px] px-[30px] py-7 mb-5 text-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] flex items-center justify-between flex-wrap gap-6 relative overflow-hidden border border-white/10">
        <img 
          src="/banner.jfif" 
          alt="Welcome Banner" 
          className="absolute inset-0 w-full h-full object-cover z-0" 
        />

        <div className="flex items-center gap-5 z-[3] w-full">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8F04A] to-[#10B981] flex items-center justify-center text-[24px] font-extrabold text-[#064E3B] shadow-[0_4px_14px_rgba(200,240,74,0.4)] border-2 border-white/20 shrink-0">
            {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-black text-white/90 mb-1">
              {getGreeting()}
            </div>
            <h1 className="text-[26px] font-extrabold text-white m-0 tracking-tight leading-none">
              {displayName}
            </h1>
            <DailyQuote userRole="MEDICAL_EXECUTIVE" variant="welcome" />
            <span className="inline-block mt-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Portal: Medical Executive
            </span>
          </div>
        </div>
      </div>

      {/* Alerts handled by global toast system */}

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard label="Total MRs Managed" value={String(mrEmployees.length).padStart(2, '0')} type="teal" />
        <StatCard label="DCR Awaiting Review" value={String(pendingCount).padStart(2, '0')} type="orange" />
        <StatCard label="Leave Requests" value={String(pendingLeavesCount).padStart(2, '0')} type="purple" />
        <StatCard label="Next Holiday" value={`${nextHoliday.dateStr} (${nextHoliday.name})`} type="coral" />
      </div>

      {/* ── Row 1: Attendance Bubble + Notice Board ── */}
      <div className="grid grid-cols-[1.1fr_1.9fr] gap-4 mb-5">
        {/* Attendance Distribution Bubble Chart */}
        <Card>
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-sm font-extrabold text-[#111827]">Today's MR Status</div>
              <div className="text-xs text-[#9CA3AF] mt-0.5">Attendance overview of your field team</div>
            </div>
            <ExternalLink size={14} className="cursor-pointer text-[#9CA3AF] mt-0.5" onClick={() => navigate('/medical-executive/fieldtracking')} />
          </div>
          <div className="flex items-center justify-center gap-0 relative h-[130px]">
            <div className="relative w-40 h-[130px]">
              <div className="absolute w-[90px] h-[90px] rounded-full bg-emerald-500/18 top-0 left-[30px] flex items-center justify-center text-base font-extrabold text-[#059669]">{attDist[0].count}</div>
              <div className="absolute w-[58px] h-[58px] rounded-full bg-red-500/15 bottom-2.5 right-2 flex items-center justify-center text-[13px] font-extrabold text-[#DC2626]">{attDist[1].count}</div>
              <div className="absolute w-[46px] h-[46px] rounded-full bg-amber-500/20 bottom-1.25 left-[30px] flex items-center justify-center text-xs font-extrabold text-[#D97706]">{attDist[2].count}</div>
              <div className="absolute w-[38px] h-[38px] rounded-full bg-indigo-500/18 top-[30px] left-1.25 flex items-center justify-center text-[11px] font-extrabold text-[#4F46E5]">{attDist[3].count}</div>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {attDist.map((item) => (
              <div key={item.status} className="flex items-center justify-between text-[11px] text-[#6B7280]">
                <div className="flex items-center gap-1.5 truncate mr-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.hex }} />
                  <span className="truncate">{item.status}</span>
                </div>
                <span className="font-extrabold text-[#111827]">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Notice Board */}
        <Card className="flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b border-[#F3F4F6] pb-3 shrink-0">
            <div>
              <h3 className="m-0 text-sm font-extrabold text-[#111827]">Notice Board</h3>
              <p className="m-0 text-xs text-[#9CA3AF] mt-0.5">Important company announcements and updates</p>
            </div>
            <Bell size={18} className="text-[#0D9488] shrink-0" />
          </div>
          <div className="overflow-y-auto pr-1 flex-1 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {activeNotices.filter(notice => {
              if (!notice.expiryDate) return true;
              try {
                const [day, month, year] = notice.expiryDate.split('-').map(Number);
                const expiryDate = new Date(year, month - 1, day);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return expiryDate >= today;
              } catch (e) { return true; }
            }).length > 0 ? (
              activeNotices.filter(notice => {
                if (!notice.expiryDate) return true;
                try {
                  const [day, month, year] = notice.expiryDate.split('-').map(Number);
                  const expiryDate = new Date(year, month - 1, day);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return expiryDate >= today;
                } catch (e) { return true; }
              }).map((notice, i) => (
                <div
                  key={notice.id || i}
                  onClick={() => setSelectedNotice(notice)}
                  className="group flex items-start gap-3 p-3 rounded-xl bg-white border border-[#F3F4F6] hover:shadow-md hover:border-teal-200 transition-all duration-200 cursor-pointer"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                    notice.noticeType === 'URGENT' ? "bg-rose-50 text-rose-500 border-rose-100" :
                    notice.noticeType === 'EVENT' ? "bg-blue-50 text-blue-500 border-blue-100" :
                    notice.noticeType === 'HOLIDAY' ? "bg-amber-50 text-amber-500 border-amber-100" :
                    "bg-slate-50 text-slate-400 border-slate-100"
                  )}>
                    {notice.noticeType === 'URGENT' ? <AlertCircle size={15} /> :
                     notice.noticeType === 'EVENT' ? <Calendar size={15} /> :
                     notice.noticeType === 'HOLIDAY' ? <Coffee size={15} /> :
                     <Bell size={15} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[12.5px] font-extrabold text-gray-800 truncate group-hover:text-teal-650 transition-colors m-0 leading-tight">
                      {notice.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-semibold m-0 mt-1 line-clamp-2 leading-relaxed">
                      {notice.message || notice.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 opacity-30 text-gray-400">
                <AlertCircle size={24} className="mb-2" />
                <p className="text-[11px] font-bold uppercase tracking-widest">No active notices</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Row 2: Quick Actions + Holidays + Birthdays ── */}
      <div className="grid grid-cols-3 gap-5 mb-5 items-stretch">

        {/* Quick Actions */}
        <Card className="flex flex-col min-h-[260px]">
          <div className="mb-3.5 border-b border-[#F3F4F6] pb-3 flex justify-between items-start shrink-0">
            <div>
              <div className="text-sm font-extrabold text-[#111827]">Quick Actions</div>
              <div className="text-xs text-[#9CA3AF] mt-0.5">Frequently accessed shortcuts</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 flex-1 content-start">
            <QATile icon={UserPlus}   label="Onboard Req." onClick={() => navigate('/medical-executive/requests')} />
            <QATile icon={Calendar}   label="Leaves Info"  onClick={() => navigate('/medical-executive/leaves')} />
            <QATile icon={Navigation} label="Field Track"  onClick={() => navigate('/medical-executive/fieldtracking')} />
            <QATile icon={MapIcon}    label="Tour Plans"   onClick={() => navigate('/medical-executive/tourplan')} />
            <QATile icon={Users}      label="Onboard Doc"  onClick={() => navigate('/medical-executive/onboard-doctor')} />
            <QATile icon={BarChart2}  label="Reports"      onClick={() => navigate('/medical-executive/reports')} />
          </div>
        </Card>

        {/* Upcoming Holidays */}
        <Card className="flex flex-col min-h-[260px]">
          <div className="flex justify-between items-center mb-4 border-b border-[#F3F4F6] pb-3 shrink-0">
            <div>
              <h3 className="m-0 text-sm font-extrabold text-[#111827]">Upcoming Holidays</h3>
              <p className="m-0 text-xs text-[#9CA3AF] mt-0.5">Gazetted and observance holidays</p>
            </div>
            <Calendar size={18} className="text-[#0D9488] shrink-0" />
          </div>
          <div className="overflow-y-auto pr-1 flex-1 flex flex-col gap-2.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {activeUpcomingHolidays.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-xs font-semibold">No upcoming holidays.</div>
            ) : (
              activeUpcomingHolidays.slice(0, 5).map((h, idx) => {
                let formattedDate = h.date || '';
                if (h.date) {
                  try {
                    const dateParts = h.date.split('-');
                    const dateObj = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
                    formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                  } catch (e) { formattedDate = h.date; }
                }
                const isNationalOrGazetted = (type) => {
                  const t = (type || '').toLowerCase();
                  return t.includes('national') || t.includes('gazetted');
                };
                const typeLabel = h.primaryType || 'Observance';
                const isNat = isNationalOrGazetted(typeLabel);
                return (
                  <div
                    key={h.id || idx}
                    className={`flex items-center justify-between ${idx === Math.min(activeUpcomingHolidays.length, 5) - 1 ? 'pb-0 border-none' : 'pb-2 border-b border-gray-100'}`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="text-[12px] font-bold text-gray-800 truncate" title={h.name}>{h.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{formattedDate}</div>
                    </div>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${isNat ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-[#F0FDF4] text-[#10B981]'}`}>{typeLabel}</span>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Birthdays Card */}
        <Card style={{ position: 'relative', overflow: 'hidden' }} className="min-h-[260px]">
          <img
            src="/Birthday.jpg"
            alt="Birthday Background"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          <div className="absolute inset-0 bg-white/92 z-[1]" />
          <div className="relative z-[2] flex flex-col h-full">
            <div className="flex justify-between items-start mb-3 border-b border-gray-100/60 pb-3">
              <div>
                <div className="text-sm font-extrabold text-[#111827]">Upcoming Birthdays</div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">Birthdays in your team this month</div>
              </div>
              <Gift size={16} className="text-[#111827] mt-0.5 shrink-0" />
            </div>
            <div className="flex flex-col gap-1.5 overflow-y-auto pr-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {birthdayList.length === 0 ? (
                <div className="py-8 text-center text-[#9CA3AF] text-xs">No birthdays recorded.</div>
              ) : (
                birthdayList.map((item, idx) => (
                  <BirthdayRow
                    key={idx}
                    name={item.name}
                    date={item.date}
                    role={item.role}
                    photoUrl={item.photoUrl}
                  />
                ))
              )}
            </div>
          </div>
        </Card>

      </div>

      {/* ── Bottom Row 1: DCR + MR Attendance ── */}
      <div className="grid grid-cols-[1.1fr_0.9fr] gap-5 items-stretch mt-5">
        
        {/* DCR Pending Card */}
        <Card>
          <div className="flex justify-between items-center mb-5 border-b border-[#F3F4F6] pb-4">
            <div>
              <h3 className="m-0 text-sm font-extrabold text-[#111827]">Daily Call Reports (DCR) Pending Approval</h3>
              <p className="m-0 text-xs text-[#9CA3AF] mt-0.5">Approve or reject daily activity reports submitted by MRs</p>
            </div>
            {pendingCount > 0 && (
              <button
                onClick={handleApproveAll}
                disabled={reviewingId !== null}
                className="flex items-center gap-1 bg-[#4F46E5] text-white border-none px-3.5 py-1.5 rounded-lg cursor-pointer font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-55"
              >
                {reviewingId === 'all' ? <Loader2 size={12} className="animate-spin" /> : 'Approve All'}
              </button>
            )}
          </div>

          <div className="max-h-[460px] overflow-y-auto pr-1 flex flex-col gap-4">
            {dcrLoading && teamDcrs.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2.5">
                <Loader2 size={24} className="animate-spin text-[#4F46E5]" />
                <span className="text-[13px] text-gray-400">Loading submitted DCRs...</span>
              </div>
            ) : pendingCount === 0 ? (
              <div className="py-10 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <CheckCircle2 size={36} className="mx-auto mb-2.5 text-emerald-500" />
                <p className="m-0 text-[13.5px] font-semibold text-gray-600">All caught up! No DCRs awaiting review.</p>
              </div>
            ) : (
              pendingDcrList.map((dcr) => (
                <div key={dcr.id} className="flex flex-col gap-3 p-[18px] rounded-2xl bg-gray-50 border border-gray-100 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-indigo-100 text-indigo-650 rounded-full flex items-center justify-center font-extrabold text-sm">
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
              ))
            )}
          </div>
        </Card>

        {/* MR Attendance Card */}
        <Card>
          <div className="flex justify-between items-center mb-5 border-b border-[#F3F4F6] pb-4">
            <div>
              <h3 className="m-0 text-sm font-extrabold text-[#111827]">MR Status & Attendance</h3>
              <p className="m-0 text-xs text-[#9CA3AF] mt-0.5">Real-time status of Medical Representatives today</p>
            </div>
          </div>

          <div className="flex flex-col min-h-[350px] overflow-y-auto pr-1">
            {mrEmployees.length === 0 ? (
              <div className="py-8 text-center text-[#9CA3AF] bg-[#FAFAFA] rounded-xl border border-dashed border-[#E5E7EB]">
                <p className="m-0 text-[13.5px] font-semibold text-[#4B5563]">No MRs in your team database.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b-[1.5px] border-[#F3F4F6]">
                      {['Employee', 'Today\'s Activity', 'Action'].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-[11px] font-extrabold text-[#9CA3AF] uppercase tracking-[0.5px]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEmployees.map((member) => {
                      const initials = member.fullName ? member.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'E';
                      const punchRec = getTodayPunchRecord(member.id || member.employeeId);
                      
                      let activityStatus = 'Not Punched In';
                      let activityColorClass = 'bg-[#F3F4F6] text-[#6B7280]';
                      
                      if (punchRec) {
                        if (punchRec.punchOutTime) {
                          activityStatus = `Punched Out at ${formatIsoToTime(punchRec.punchOutTime)}`;
                          activityColorClass = 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]';
                        } else if (punchRec.punchInTime) {
                          activityStatus = `Punched In at ${formatIsoToTime(punchRec.punchInTime)}`;
                          activityColorClass = 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]';
                        }
                      }

                      return (
                        <tr key={member.id} className="border-b border-[#FAFAFA] transition-colors duration-150 hover:bg-slate-50/50">
                          {/* Name & Avatar */}
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              {member.photoUrl ? (
                                <img src={getFullAssetUrl(member.photoUrl)} alt={member.fullName} className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CBD5E1] to-[#94A3B8] text-white text-[11px] font-bold flex items-center justify-center">
                                  {initials}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="text-[13px] font-extrabold text-[#1F2937] truncate max-w-[100px]">{member.fullName || 'Unknown'}</div>
                                <div className="text-[10px] text-[#9CA3AF] truncate max-w-[100px]">{member.email || 'N/A'}</div>
                              </div>
                            </div>
                          </td>

                          {/* Activity */}
                          <td className="py-3 px-2">
                            <span className={`inline-flex px-2 py-0.5 rounded-[12px] text-[10px] font-extrabold ${activityColorClass}`}>
                              {activityStatus}
                            </span>
                          </td>

                          {/* Track Action */}
                          <td className="py-3 px-2">
                            <button
                              onClick={() => navigate('/medical-executive/fieldtracking')}
                              className="bg-white text-gray-700 border border-gray-200 px-2 py-1 rounded-lg cursor-pointer font-bold text-[11px] hover:bg-gray-50 transition-colors whitespace-nowrap"
                            >
                              Track
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="mt-4 border-t border-[#F3F4F6] pt-3">
                  <Pagination
                    currentPage={mrPage}
                    totalPages={Math.ceil(mrEmployees.length / mrPageSize)}
                    totalElements={mrEmployees.length}
                    pageSize={mrPageSize}
                    onPageChange={(page) => setMrPage(page)}
                    isLoading={false}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

      </div>

      {selectedNotice && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in scale-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 flex items-start justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
                  selectedNotice.noticeType === 'URGENT' ? "bg-rose-50 text-rose-500 border-rose-100" :
                  selectedNotice.noticeType === 'EVENT' ? "bg-blue-50 text-blue-550 border-blue-100" :
                  selectedNotice.noticeType === 'HOLIDAY' ? "bg-amber-50 text-amber-550 border-amber-100" :
                  "bg-slate-50 text-slate-400 border-slate-100"
                )}>
                  {selectedNotice.noticeType === 'URGENT' ? <AlertCircle size={20} /> :
                   selectedNotice.noticeType === 'EVENT' ? <Calendar size={20} /> :
                   selectedNotice.noticeType === 'HOLIDAY' ? <Coffee size={20} /> :
                   <Bell size={20} />}
                </div>
                <div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                    selectedNotice.noticeType === 'URGENT' ? "bg-rose-50 text-rose-650 border-rose-100" :
                    selectedNotice.noticeType === 'EVENT' ? "bg-blue-50 text-blue-655 border-blue-100" :
                    selectedNotice.noticeType === 'HOLIDAY' ? "bg-amber-50 text-amber-655 border-amber-100" :
                    "bg-slate-50 text-slate-500 border-slate-200"
                  )}>
                    {selectedNotice.noticeType}
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1.5">
                    Posted on {selectedNotice.createdAt ? new Date(selectedNotice.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 hover:bg-slate-105 rounded-lg text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {selectedNotice.title}
              </h3>
              <p className="text-sm text-slate-650 leading-relaxed whitespace-pre-wrap font-medium">
                {selectedNotice.message || selectedNotice.content}
              </p>
              
              {selectedNotice.expiryDate && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Expiry Date</span>
                  <span className="text-slate-650 font-extrabold">{selectedNotice.expiryDate}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalExecutiveDashboard;

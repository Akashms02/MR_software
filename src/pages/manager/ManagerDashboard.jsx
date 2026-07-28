import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DailyQuote from '../../components/DailyQuote';
import { getMyTeam } from '../../redux/actions/teamActions';
import axios from '../../api/axiosInstance';
import { API_ROUTE } from '../../data/env';
import { 
  Users, 
  MapPin, 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { team = [] } = useSelector(state => state.team);

  const [pendingDcrCount, setPendingDcrCount] = useState(0);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [pendingTourPlanCount, setPendingTourPlanCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    dispatch(getMyTeam());
  }, [dispatch]);

  // Fetch pending review counts dynamically from backend APIs
  useEffect(() => {
    const fetchPendingCounts = async () => {
      setLoadingStats(true);
      try {
        // Fetch team DCRs and filter for pending (SUBMITTED)
        const dcrRes = await axios.get(`${API_ROUTE}/dcr/team`);
        if (dcrRes.data && dcrRes.data.data) {
          const pending = dcrRes.data.data.filter(item => item.status === 'SUBMITTED');
          setPendingDcrCount(pending.length);
        }
        
        // Fetch team leaves and filter for pending
        const leaveRes = await axios.get(`${API_ROUTE}/leaves/requests/team?size=1000`);
        if (leaveRes.data && leaveRes.data.data && leaveRes.data.data.content) {
          const pending = leaveRes.data.data.content.filter(item => item.status === 'PENDING');
          setPendingLeaveCount(pending.length);
        }

        // Fetch team tour plans and filter for pending (SUBMITTED)
        const tourRes = await axios.post(`${API_ROUTE}/tour-plan/team`, { size: 1000 });
        if (tourRes.data && tourRes.data.data && tourRes.data.data.content) {
          const pending = tourRes.data.data.content.filter(item => item.status === 'SUBMITTED');
          setPendingTourPlanCount(pending.length);
        }
      } catch (err) {
        console.error('Failed to fetch supervisor pending counts:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchPendingCounts();
  }, []);

  const displayName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'Manager';

  const allowedModules = user?.allowedModules || 'all';
  const isModuleAllowed = (moduleId) => {
    if (allowedModules === 'all') return true;
    const list = allowedModules.split(',').map(s => s.trim().toLowerCase());
    return list.includes(moduleId.toLowerCase());
  };

  const stats = [
    { 
      label: 'Team Size', 
      value: `${team.length} Active`, 
      sub: 'Reporting to you', 
      color: 'text-teal-600', 
      bg: 'bg-teal-50', 
      icon: Users, 
      path: '/manager/myteam',
      module: 'myteam'
    },
    { 
      label: 'Pending DCRs', 
      value: pendingDcrCount, 
      sub: 'Needs approval', 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      icon: FileText, 
      path: '/manager/dcr-approvals',
      module: 'dcr-approvals'
    },
    { 
      label: 'Pending Leaves', 
      value: pendingLeaveCount, 
      sub: 'Requires review', 
      color: 'text-rose-600', 
      bg: 'bg-rose-50', 
      icon: Calendar, 
      path: '/manager/leaves',
      module: 'leaves'
    },
    { 
      label: 'Pending Tour Plans', 
      value: pendingTourPlanCount, 
      sub: 'Review itinerary', 
      color: 'text-amber-600', 
      bg: 'bg-amber-50', 
      icon: MapPin, 
      path: '/manager/tourplans',
      module: 'tourplans'
    },
  ];

  return (
    <div className="p-2.5 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#0F766E] to-[#0D9488] rounded-[24px] p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="bg-white/20 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            Supervisor Control Portal
          </span>
          <h2 className="text-[32px] font-extrabold my-4 tracking-tight leading-tight">
            Hello, {displayName}!
          </h2>
          <p className="m-0 text-sm text-teal-50 leading-relaxed font-medium">
            Supervise field representatives, review and approve daily logs, map coordinates, and track overall territory targets.
          </p>
          <DailyQuote userRole="MANAGER" variant="welcome" />
        </div>
        <div className="absolute right-[-20px] bottom-[-40px] text-[180px] opacity-10 select-none pointer-events-none">
          📋
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.filter(s => isModuleAllowed(s.module)).map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              onClick={() => navigate(s.path)}
              className="bg-white border border-gray-150 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.bg} ${s.color}`}>
                <Icon size={24} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">
                  {s.label}
                </div>
                <div className="text-[22px] font-extrabold text-gray-900 my-0.5">
                  {s.value}
                </div>
                <div className="text-[11px] text-gray-500 font-medium">
                  {s.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Quick Actions Panel */}
        <div className="bg-white border border-gray-150 rounded-[20px] p-6 shadow-sm">
          <h3 className="m-0 mb-4 text-base font-extrabold text-gray-900">Supervisor Quick Actions</h3>
          <div className="flex flex-col gap-3">
            {isModuleAllowed('fieldtracking') && (
              <button 
                onClick={() => navigate('/manager/fieldtracking')}
                className="flex items-center justify-between w-full p-4 rounded-xl border border-gray-100 bg-slate-50 text-left cursor-pointer hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="block text-[13px] font-bold text-gray-900">Locate Team</span>
                    <span className="block text-[10px] text-gray-400 font-medium">View active reps on GPS Map</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            )}

            {isModuleAllowed('myteam') && (
              <button 
                onClick={() => navigate('/manager/myteam/onboard')}
                className="flex items-center justify-between w-full p-4 rounded-xl border border-gray-100 bg-slate-50 text-left cursor-pointer hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="block text-[13px] font-bold text-gray-900">Onboard Employee</span>
                    <span className="block text-[10px] text-gray-400 font-medium">Initiate new onboarding wizard</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            )}

            {isModuleAllowed('sales') && (
              <button 
                onClick={() => navigate('/manager/sales')}
                className="flex items-center justify-between w-full p-4 rounded-xl border border-gray-100 bg-slate-50 text-left cursor-pointer hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <span className="block text-[13px] font-bold text-gray-900">Distributor Sales</span>
                    <span className="block text-[10px] text-gray-400 font-medium">Log and trace primary orders</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Live Team Status List */}
        <div className="lg:col-span-2 bg-white border border-gray-150 rounded-[20px] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="m-0 text-base font-extrabold text-gray-900">Direct Team Status</h3>
            <span 
              onClick={() => navigate('/manager/myteam')}
              className="text-[12px] font-bold text-teal-600 hover:text-teal-700 cursor-pointer flex items-center gap-1"
            >
              Manage Team <ChevronRight size={14} />
            </span>
          </div>

          <div className="flex flex-col gap-3.5 max-h-[295px] overflow-y-auto pr-1">
            {team.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2.5">
                  <Users size={20} className="text-gray-300" />
                </div>
                <p className="text-[13px] font-bold text-gray-800 m-0">No team members assigned</p>
                <p className="text-[11px] text-gray-400 m-0 mt-0.5">Use the onboarding wizard to add members.</p>
              </div>
            ) : (
              team.map((member, idx) => {
                const roleName = member.role || '';
                const normRole = roleName.toUpperCase().replace(/_/g, ' ').replace(/-/g, ' ').trim();
                let badgeLabel = 'MR';
                let badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-100';

                if (normRole.includes('AREA') || normRole === 'ABM' || normRole === 'ASM') {
                  badgeLabel = 'ABM';
                  badgeStyle = 'bg-orange-50 text-orange-700 border-orange-100';
                } else if (normRole.includes('REGIONAL') || normRole === 'RBM' || normRole === 'RSM') {
                  badgeLabel = 'RBM';
                  badgeStyle = 'bg-purple-50 text-purple-700 border-purple-100';
                } else if (normRole.includes('ZONE') || normRole.includes('ZONAL') || normRole === 'ZBM' || normRole === 'ZSM') {
                  badgeLabel = 'ZBM';
                  badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-100';
                } else if (normRole.includes('VICE') || normRole === 'VP') {
                  badgeLabel = 'VP';
                  badgeStyle = 'bg-rose-50 text-rose-700 border-rose-100';
                }

                const initials = member.fullName
                  ? member.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                  : badgeLabel;

                return (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 font-bold text-sm">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[13px] font-bold text-gray-900 truncate">{member.fullName}</span>
                        <span className={`text-[11px] font-bold shrink-0 px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
                          {badgeLabel}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1 truncate">
                        {member.email}{member.phone ? ` • ${member.phone}` : ''}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;

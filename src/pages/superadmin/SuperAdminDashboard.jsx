import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, ChevronRight, ShieldCheck, Network, Users, Server, Key, Database, Globe } from 'lucide-react'
import { fetchProfile } from '../../redux/actions/authActions'
import { getAdmins } from '../../redux/actions/adminActions'

/* ── Stat Card ── */
function StatCard({ label, value, type }) {
  const configs = {
    teal:   { bgClass: 'from-[#6EC6C2] to-[#4AAFA9]', Icon: Users },
    orange: { bgClass: 'from-[#FFB07A] to-[#FF8F4E]', Icon: Globe },
    coral:  { bgClass: 'from-[#FF9090] to-[#FF6B6B]', Icon: ShieldCheck },
    purple: { bgClass: 'from-[#B8A6FB] to-[#9B87F5]', Icon: Server },
  }
  const c = configs[type] || configs.teal
  const { Icon } = c

  return (
    <div className={`rounded-[18px] bg-gradient-to-br ${c.bgClass} px-5.5 py-5 flex flex-col min-h-[160px] relative overflow-hidden text-white shadow-[0_4px_16px_rgba(0,0,0,0.10)]`}>
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-xl bg-white/30 flex items-center justify-center">
          <Icon size={20} className="text-white" strokeWidth={2} />
        </div>
        <div className="w-5.5 h-5.5 rounded-full bg-white/25 flex items-center justify-center text-sm cursor-pointer text-white font-bold leading-none">×</div>
      </div>
      <div className="mt-auto flex items-end justify-between">
        <div className="text-[13px] font-semibold opacity-90 max-w-[90px] leading-snug">
          {label}
        </div>
        <div className="text-[52px] font-extrabold leading-none tracking-tighter">
          {value}
        </div>
      </div>
    </div>
  )
}

/* ── Event Row ── */
function EventRow({ date, month, title, sub, color }) {
  const colorMap = {
    '#A78BFA': { bg: 'bg-[#A78BFA]/10', border: 'border-[#A78BFA]', text: 'text-[#A78BFA]' },
    '#10B981': { bg: 'bg-[#10B981]/10', border: 'border-[#10B981]', text: 'text-[#10B981]' },
    '#F59E0B': { bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]', text: 'text-[#F59E0B]' },
    '#EF4444': { bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]', text: 'text-[#EF4444]' },
    '#3B82F6': { bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]', text: 'text-[#3B82F6]' },
    '#8B5CF6': { bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]', text: 'text-[#8B5CF6]' },
  }[color] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-500' }

  return (
    <div className="flex items-start gap-2.5 py-2">
      <div className={`w-10 h-10 rounded-xl shrink-0 border-[1.5px] ${colorMap.bg} ${colorMap.border} flex flex-col items-center justify-center`}>
        <div className="text-[13px] font-black text-secondary leading-none">{date}</div>
        <div className={`text-[8px] font-bold uppercase ${colorMap.text}`}>{month}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-secondary truncate">{title}</div>
        <div className="text-[11px] text-muted truncate">{sub}</div>
      </div>
    </div>
  )
}

/* ── Quick Action Tile ── */
function QATile({ icon: Icon, label }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3.5 flex flex-col items-center gap-2 cursor-pointer transition-colors duration-150 hover:bg-gray-100">
      <Icon size={19} className="text-gray-500" strokeWidth={1.8} />
      <div className="text-[11px] font-semibold text-gray-500 text-center">{label}</div>
    </div>
  )
}

function Card({ children, className }) {
  return (
    <div className={`bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 ${className || ''}`}>
      {children}
    </div>
  )
}

export default function SuperAdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { admins = [] } = useSelector((state) => state.admin || {});

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(getAdmins());
  }, [dispatch]);

  const displayName = user?.fullName || 'Super Admin';
  const displayEmail = user?.email || 'superadmin@mrmedical.com';
  const displayPhone = user?.phone || '9876543210';
  const displayRole = user?.role?.replace('_', ' ') || 'SUPER ADMIN';
  const displayRefCode = user?.adminReferenceCode || 'ROOT';

  const activeAdminsCount = admins.filter(a => a.enabled !== false).length;
  const inactiveAdminsCount = admins.filter(a => a.enabled === false).length;
  const draftAdminsCount = 0;
  const totalAdminsCount = admins.length;

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="animate-fade">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-2 text-[13px] text-white/80 font-medium mt-3.5">
              <span className="flex items-center gap-2">
                <span className="text-base">📧</span>
                <span className="truncate">{displayEmail}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-base">📱</span>
                <span>{displayPhone}</span>
              </span>
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-[2px] px-3 py-1 rounded-lg border border-white/15 text-white max-w-fit">
                <span className="text-base">🔑</span>
                <span>{displayRefCode}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <StatCard label="Registered Companies" value={String(totalAdminsCount).padStart(2, '0')} type="teal" />
        <StatCard label="Active Admins" value={String(activeAdminsCount).padStart(2, '0')} type="coral" />
        <StatCard label="Server Uptime" value="99.9%" type="purple" />
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-4 mb-4">

        <Card>
          <div className="flex justify-between items-center mb-3">
            <div className="text-[13px] font-bold text-[#111827]">Admin Accounts Status</div>
            <ExternalLink size={14} className="cursor-pointer text-gray-400" onClick={() => navigate('/superadmin/admins')} />
          </div>
          <div className="flex items-center justify-center gap-0 relative h-[130px]">
            {/* Overlapping Bubble Cluster */}
            <div className="relative w-40 h-[130px]">
              <div className="absolute w-[90px] h-[90px] rounded-full bg-[#10B981]/15 top-0 left-[30px] flex flex-col items-center justify-center text-[#10B981] z-[3]">
                <span className="text-[18px] font-black">{activeAdminsCount}</span>
                <span className="text-[9px] font-bold uppercase">Active</span>
              </div>
              <div className="absolute w-[58px] h-[58px] rounded-full bg-[#EF4444]/15 bottom-2.5 right-2 flex flex-col items-center justify-center text-[#EF4444] z-[2]">
                <span className="text-[13px] font-black">{inactiveAdminsCount}</span>
                <span className="text-[7.5px] font-bold uppercase">Suspended</span>
              </div>
              <div className="absolute w-[46px] h-[46px] rounded-full bg-[#F59E0B]/20 bottom-1.25 left-[25px] flex flex-col items-center justify-center text-[#F59E0B] z-[1]">
                <span className="text-[11px] font-black">{draftAdminsCount}</span>
                <span className="text-[7px] font-bold uppercase">Draft</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Active Admins</span>
              </div>
              <span className="font-bold text-gray-700">{totalAdminsCount > 0 ? Math.round((activeAdminsCount / totalAdminsCount) * 100) : 0}%</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span>Suspended Admins</span>
              </div>
              <span className="font-bold text-gray-700">{totalAdminsCount > 0 ? Math.round((inactiveAdminsCount / totalAdminsCount) * 100) : 0}%</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span>Draft Admins</span>
              </div>
              <span className="font-bold text-gray-700">0%</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-extrabold text-secondary">Registered Admins</div>
            <button 
              onClick={() => navigate('/superadmin/admins')}
              className="flex items-center gap-1 px-3 py-1.25 bg-[#C8F04A] border-none rounded-lg text-xs font-bold cursor-pointer"
            >
              Manage
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-1.5 px-0.5 text-[10px] font-bold text-gray-500 uppercase">Admin</th>
                  <th className="py-1.5 px-0.5 text-[10px] font-bold text-gray-500 uppercase">Ref Code</th>
                  <th className="py-1.5 px-0.5 text-[10px] font-bold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {totalAdminsCount === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-4 px-0.5 text-xs text-gray-500 text-center">
                      No active admins found.
                    </td>
                  </tr>
                ) : (
                  admins.slice(0, 4).map((admin) => {
                    const initials = admin.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A';
                    const isEnabled = admin.enabled !== false;
                    return (
                      <tr key={admin.id} className="border-b border-gray-100">
                        <td className="py-2 px-0.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                              {initials}
                            </div>
                            <div className="text-xs font-bold text-[#111827] truncate max-w-[70px]">
                              {admin.fullName}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-0.5 text-xs text-[#4B5563] font-semibold">
                          {admin.adminReferenceCode || 'ROOT'}
                        </td>
                        <td className="py-2 px-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isEnabled ? 'bg-[#EFF6FF] text-[#1E40AF]' : 'bg-[#FEF2F2] text-[#991B1B]'}`}>
                            {isEnabled ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  )
}

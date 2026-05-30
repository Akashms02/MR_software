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
  const { admins } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(getAdmins());
  }, [dispatch]);

  const displayName = user?.fullName || 'Super Admin';
  const displayEmail = user?.email || 'superadmin@mrmedical.com';
  const displayPhone = user?.phone || '9876543210';
  const displayRole = user?.role?.replace('_', ' ') || 'SUPER ADMIN';
  const displayRefCode = user?.adminReferenceCode || 'ROOT';

  return (
    <div className="animate-fade">
      {/* ── Welcome Header Card ── */}
      <div className="bg-white rounded-[18px] p-8 md:p-10 mb-6 text-[#111827] shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_6px_rgba(0,0,0,0.07)] flex items-center justify-between flex-wrap gap-8 border border-gray-100 transition-all duration-300">
        <div className="flex items-center gap-6 z-10">
          <div className="w-[72px] h-[72px] rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-2xl font-black text-white shadow-[0_8px_16px_rgba(79,70,229,0.2)] cursor-default">
            {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="mb-3">
              <h2 className="text-[26px] font-black text-secondary m-0 leading-tight tracking-[-0.5px]">
                {displayName}
              </h2>
              <p className="text-[13px] text-muted m-0 mt-2 font-bold uppercase tracking-wider">
                {displayRole}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-[13px] text-secondary font-medium">
              <span className="flex items-center gap-2">
                <span className="text-base">📧</span>
                <span>{displayEmail}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-base">📱</span>
                <span>{displayPhone}</span>
              </span>
              <span className="flex items-center gap-2 bg-gradient-to-br from-blue-50 to-purple-50 px-3.5 py-1.5 rounded-lg font-semibold text-indigo-600 border border-indigo-50">
                <span className="text-base">🔑</span>
                <span>{displayRefCode}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 z-10">
          <button className="bg-gray-100 border border-gray-200 rounded-lg text-secondary px-5 py-2.5 text-[13px] font-bold cursor-pointer transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5">
            View Status
          </button>
          <button
            onClick={() => navigate('/superadmin/system-settings')}
            className="bg-gradient-to-br from-[#C8F04A] to-[#B8E03A] border-none rounded-lg text-[#111827] px-6 py-2.5 text-[13px] font-extrabold cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(200,240,74,0.3)] hover:shadow-[0_8px_16px_rgba(200,240,74,0.4)] hover:-translate-y-0.5 tracking-wider"
          >
            Manage Platform
          </button>
        </div>
      </div>

      {/* ── Info Banner ── */}
      <div className="bg-white rounded-xl p-3 md:p-5 flex items-center justify-between mb-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="text-base">🛡️</span>
          <span className="text-[13px] text-secondary">
            <strong className="text-secondary font-black">System Alert :</strong> Global system backup completed successfully. No vulnerabilities detected.
          </span>
        </div>
        <button className="btn-lime text-[13px] px-4.5 py-2 rounded-xl whitespace-nowrap">
          View Logs
        </button>
      </div>

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <StatCard label="Global Users"    value="12,482" type="teal"   />
        <StatCard label="Total Branches"  value="18"     type="orange" />
        <StatCard label="Active Admins"   value={admins ? admins.length : "0"}     type="coral"  />
        <StatCard label="Server Status"   value="99%"    type="purple" />
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr_1fr] gap-4 mb-4">

        <Card>
          <div className="flex justify-between items-center mb-3">
            <div className="text-[13px] font-bold text-[#111827]">Global Distribution</div>
            <ExternalLink size={14} className="cursor-pointer text-gray-400" />
          </div>
          <div className="flex items-center justify-center gap-0 relative h-[130px]">
            <div className="relative w-40 h-[130px]">
              <div className="absolute w-[90px] h-[90px] rounded-full bg-indigo-500/15 top-0 left-[30px] flex items-center justify-center text-base font-black text-indigo-600">USHQ</div>
              <div className="absolute w-[58px] h-[58px] rounded-full bg-emerald-500/15 bottom-2.5 right-2 flex items-center justify-center text-[13px] font-black text-emerald-600">EMEA</div>
              <div className="absolute w-[46px] h-[46px] rounded-full bg-amber-500/20 bottom-1.25 left-[30px] flex items-center justify-center text-xs font-black text-amber-600">APAC</div>
              <div className="absolute w-[38px] h-[38px] rounded-full bg-rose-500/15 top-[30px] left-1 flex items-center justify-center text-[11px] font-black text-rose-600">LATAM</div>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {[
              ['bg-indigo-600','North America'],
              ['bg-emerald-600','Europe'],
              ['bg-amber-600','Asia Pacific'],
              ['bg-rose-600','South America']
            ].map(([bg, label]) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <div className={`w-2 h-2 rounded-full shrink-0 ${bg}`} />
                {label}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-extrabold text-secondary">System Updates</div>
            <ExternalLink size={14} className="cursor-pointer text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">
            <EventRow date="01" month="Sep" title="Server Migration" sub="Database cluster switch" color="#A78BFA" />
            <EventRow date="05" month="Sep" title="Security Patch"   sub="v4.2 Auth Module"        color="#10B981" />
            <EventRow date="12" month="Sep" title="Global Sync"      sub="Cross-region replication" color="#F59E0B" />
            <EventRow date="18" month="Sep" title="Downtime"         sub="Scheduled maintenance"    color="#EF4444" />
            <EventRow date="22" month="Sep" title="API Update"       sub="Deprecating v1 endpoints" color="#3B82F6" />
            <EventRow date="25" month="Sep" title="Audit Review"     sub="Quarterly compliance check" color="#8B5CF6" />
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-extrabold text-secondary">Active Admins</div>
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
                {!admins || admins.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-4 px-0.5 text-xs text-gray-500 text-center">
                      No active admins found.
                    </td>
                  </tr>
                ) : (
                  admins.slice(0, 4).map((admin) => {
                    const initials = admin.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A';
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
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${admin.enabled ? 'bg-[#EFF6FF] text-[#1E40AF]' : 'bg-[#FEF2F2] text-[#991B1B]'}`}>
                            {admin.enabled ? 'Active' : 'Inactive'}
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

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="text-sm font-extrabold text-[#111827] mb-3.5">Administration Actions</div>
          <div className="flex flex-col gap-2.5">
            {[
              { label: 'Review Global Policies' },
              { label: 'Manage Data Retention' },
              { label: 'Configure SSO Integration' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors duration-150">
                <span className="text-xs font-semibold text-[#374151]">{item.label}</span>
                <ChevronRight size={16} className="text-[#C8F04A]" strokeWidth={2.5} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="text-sm font-extrabold text-[#111827] mb-3.5">Super Admin Tools</div>
          <div className="grid grid-cols-3 gap-3">
            <QATile icon={Database}       label="Database"    />
            <QATile icon={Key}            label="API Keys"    />
            <QATile icon={ShieldCheck}    label="Audit Logs"  />
            <QATile icon={Server}         label="Backups"     />
            <QATile icon={Network}        label="Routing"     />
            <QATile icon={Globe}          label="Regions"     />
          </div>
        </Card>
      </div>
    </div>
  )
}

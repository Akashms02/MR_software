import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Briefcase, 
  Network, 
  User, 
  UsersRound, 
  Coffee, 
  FileText, 
  Settings,
  BarChart2,
  Map,
  Calendar,
  Navigation,
  UserPlus,
  Bell,
  X,
  Trash2,
  Check,
  Megaphone,
  TrendingUp
} from 'lucide-react'
import { logout } from '../../redux/actions/authActions'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../../redux/actions/notificationActions'

function SidebarAvatar({ name, size = 38 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%',
      background: 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: `${size * 0.36}px`, fontWeight: 700, color: '#fff',
      flexShrink: 0, overflow: 'hidden'
    }}>
      {initials}
    </div>
  )
}

function SnowflakeLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
      <line x1="12" y1="2"    x2="12" y2="22" />
      <line x1="2"  y1="12"   x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
      <circle cx="12" cy="12" r="2" fill="white" stroke="none" />
    </svg>
  )
}

function AdminHeader({ onBellClick, unreadCount }) {
  const location = useLocation()
  const pathParts = location.pathname.split('/')
  const activePage = pathParts[pathParts.length - 1] || 'dashboard'

  const getTitle = () => {
    if (activePage === 'dashboard') return 'Admin Dashboard'
    if (activePage === 'requests') return 'Onboarding Requests'
    if (activePage === 'employees') return 'Employees'
    if (activePage === 'reports') return 'Reports & Analytics'
    if (activePage === 'tourplans') return 'Tour Plans'
    if (activePage === 'fieldtracking') return 'Field Tracking'
    if (activePage === 'leaves') return 'Leave Approvals'
    if (activePage === 'holidays') return 'Holidays'
    if (activePage === 'myteam') return 'My Team'
    if (activePage === 'hrdocuments') return 'HR Documents'
    if (activePage === 'notices') return 'Notice Board'
    if (activePage === 'settings') return 'Settings'
    if (activePage === 'sales') return 'Distributor Sales'
    return 'Admin Dashboard'
  }

  return (
    <header className="h-[72px] bg-transparent flex items-center px-8 gap-4 shrink-0">
      <div className="shrink-0">
        <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight leading-tight m-0">
          {getTitle()}
        </h1>
      </div>
      <div className="flex-1" />
      <button 
        onClick={onBellClick}
        className="relative w-[38px] h-[38px] rounded-[10px] bg-white border border-gray-200 flex items-center justify-center cursor-pointer shrink-0 hover:bg-gray-50 active:scale-95 transition-all duration-200 focus:outline-none"
      >
        <motion.div
          animate={unreadCount > 0 ? {
            rotate: [0, -10, 10, -10, 10, 0],
            scale: [1, 1.05, 0.95, 1.05, 1]
          } : {}}
          transition={unreadCount > 0 ? {
            repeat: Infinity,
            repeatDelay: 3.5,
            duration: 0.6,
            ease: "easeInOut"
          } : {}}
        >
          <Bell size={18} color="#4B5563" />
        </motion.div>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>
    </header>
  )
}

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  const displayName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'Admin'
  const displayRole = 'Admin'

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  
  const { notifications = [], unreadCount = 0 } = useSelector(state => state.notification || {})

  useEffect(() => {
    dispatch(getUnreadCount())
    if (isNotificationsOpen) {
      dispatch(getNotifications())
    }
  }, [dispatch, isNotificationsOpen])

  const handleBellClick = () => {
    setIsNotificationsOpen(true)
    dispatch(getNotifications())
  }

  const handleNotificationClick = (notification) => {
    const id = notification.id || notification._id;
    const isRead = notification.read === true || notification.isRead === true;
    if (!isRead) {
      dispatch(markNotificationAsRead(id));
    }
    setIsNotificationsOpen(false);

    const titleLower = (notification.title || '').toLowerCase();
    const descLower = (notification.description || notification.message || notification.content || '').toLowerCase();
    const typeLower = (notification.type || '').toLowerCase();

    if (typeLower.includes('leave') || titleLower.includes('leave') || descLower.includes('leave')) {
      navigate('/admin/leaves');
    } else if (typeLower.includes('payslip') || titleLower.includes('payslip') || descLower.includes('payslip') || descLower.includes('salary') || titleLower.includes('document') || descLower.includes('document')) {
      navigate('/admin/hrdocuments');
    } else if (typeLower.includes('tour') || titleLower.includes('tour') || descLower.includes('tour') || titleLower.includes('plan') || descLower.includes('plan')) {
      navigate('/admin/tourplans');
    } else if (typeLower.includes('onboard') || titleLower.includes('onboard') || descLower.includes('onboard') || typeLower.includes('request') || titleLower.includes('request')) {
      navigate('/admin/requests');
    } else if (typeLower.includes('track') || titleLower.includes('track') || descLower.includes('track')) {
      navigate('/admin/fieldtracking');
    } else if (typeLower.includes('employee') || titleLower.includes('employee') || descLower.includes('employee')) {
      navigate('/admin/employees');
    } else if (typeLower.includes('holiday') || titleLower.includes('holiday') || descLower.includes('holiday')) {
      navigate('/admin/holidays');
    } else {
      navigate('/admin/dashboard');
    }
  };

  const formatNotificationTime = (dateStr) => {
    if (!dateStr) return 'Recent'
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    } catch (e) {
      return 'Recent'
    }
  }

  const pathParts = location.pathname.split('/')
  const activePage = pathParts[pathParts.length - 1] || 'dashboard'

  const navItems = [
    { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard',     path: '/admin/dashboard' },
    { id: 'requests',     icon: UserPlus,        label: 'Onboarding Requests', path: '/admin/requests' },
    { id: 'employees',    icon: Users,           label: 'Employees',     path: '/admin/employees' },
    // { id: 'finance',      icon: Wallet,          label: 'Finance',       path: '/admin/finance' },
    { id: 'reports',      icon: BarChart2,       label: 'Reports & Analytics', path: '/admin/reports' },
    { id: 'sales',        icon: TrendingUp,      label: 'Distributor Sales', path: '/admin/sales' },
    { id: 'tourplans',    icon: Map,             label: 'Tour Plans',    path: '/admin/tourplans' },
    { id: 'fieldtracking', icon: Navigation,      label: 'Field Tracking', path: '/admin/fieldtracking' },
    { id: 'leaves',       icon: Calendar,        label: 'Leave Approvals', path: '/admin/leaves' },
    { id: 'holidays',     icon: Calendar,        label: 'Holidays',      path: '/admin/holidays' },
    // { id: 'recruitment',  icon: Briefcase,       label: 'Recruitment',   path: '/admin/recruitment' },
    // { id: 'orgstructure', icon: Network,         label: 'Org Structure', path: '/admin/orgstructure' },
    // { id: 'me',           icon: User,            label: 'Me',            path: '/admin/me' },
    { id: 'myteam',       icon: UsersRound,      label: 'My Team',       path: '/admin/myteam' },
    // { id: 'watercooler',  icon: Coffee,          label: 'Water Cooler',  path: '/admin/watercooler' },
    { id: 'hrdocuments',  icon: FileText,        label: 'HR Documents',  path: '/admin/hrdocuments' },
    { id: 'notices',      icon: Megaphone,       label: 'Notice Board',  path: '/admin/notices' },
    { id: 'settings',     icon: Settings,        label: 'Settings',      path: '/admin/settings' },
  ]

  const userAllowedModules = user?.allowedModules || "all";
  const filteredNavItems = navItems.filter(item => {
    if (item.id === 'dashboard' || item.id === 'settings') return true;
    if (userAllowedModules === 'all') return true;
    const allowedList = userAllowedModules.split(',').map(s => s.trim().toLowerCase());
    return allowedList.includes(item.id.toLowerCase());
  });

  return (
    <div className="flex min-h-screen bg-[#F0F2F5] font-[Inter,sans-serif]">
      <aside className="w-[220px] shrink-0 bg-white flex flex-col fixed top-0 left-0 bottom-0 z-[100] shadow-[2px_0_16px_rgba(0,0,0,0.04)]">
        {/* Logo */}
        <div className="h-[72px] flex items-center px-5 gap-2.5 shrink-0 border-b border-gray-100">
          <div className="w-9 h-9 rounded-[10px] bg-gray-900 flex items-center justify-center shrink-0">
            <SnowflakeLogo />
          </div>
          <span className="font-extrabold text-[18px] text-gray-900 tracking-tight">
            HRMS
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          {filteredNavItems.map(item => {
            const isActive = activePage === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2.5 w-full py-2.5 px-3.5 rounded-[10px] mb-0.5 cursor-pointer border-none font-[inherit] text-left text-[13.5px] transition-all duration-[180ms] outline-none ${isActive ? 'bg-[#C8F04A] text-gray-900 font-bold' : 'bg-transparent text-gray-500 font-medium hover:bg-gray-50'}`}
              >
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  color={isActive ? '#1A1A1A' : '#9CA3AF'}
                />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5 p-2.5 rounded-[10px] mb-1 bg-gray-50">
            <SidebarAvatar name={displayName} size={38} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                {displayName}
              </div>
              <div className="text-[11px] text-gray-400">{displayRole}</div>
            </div>
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center gap-2 w-full py-[9px] px-3.5 rounded-[10px] bg-transparent border-none cursor-pointer text-gray-400 text-[13px] font-medium font-[inherit] mt-0.5 hover:bg-gray-50 transition-colors"
          >
            <LogOut size={16} color="#9CA3AF" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <div className="ml-[220px] flex-1 flex flex-col min-w-0">
        <AdminHeader onBellClick={handleBellClick} unreadCount={unreadCount} />
        <main className="flex-1 px-8 pb-8 overflow-y-auto">
          {children}
        </main>
      </div>

      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="fixed inset-0 bg-black/15 backdrop-blur-[2px] z-[998] cursor-pointer"
            />
            
            {/* Notification Drawer Card */}
            <motion.div
              initial={{ opacity: 0, x: 120, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 120, scale: 0.96 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-4 top-4 bottom-4 w-[380px] bg-white/95 backdrop-blur-md rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col z-[999] overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100/80 flex items-center justify-between shrink-0 bg-gray-50/40">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[17px] font-bold text-gray-900 m-0">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="bg-[#C8F04A] text-gray-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all duration-200 hover:rotate-90"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                    <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                      <Bell size={24} className="stroke-[1.5] text-gray-300" />
                    </div>
                    <p className="text-[14px] font-bold text-gray-900 m-0">All caught up!</p>
                    <p className="text-[12px] text-gray-400 m-0 mt-1">No new notifications here.</p>
                  </div>
                ) : (
                  notifications.map(notification => {
                    const id = notification.id || notification._id;
                    const isRead = notification.read === true || notification.isRead === true;
                    const title = notification.title || 'System Notification';
                    const description = notification.description || notification.message || notification.content || '';
                    const timeText = formatNotificationTime(notification.createdAt || notification.time);

                    // Determine icon and color based on notification type/title
                    const typeLower = (notification.type || '').toLowerCase();
                    const titleLower = title.toLowerCase();

                    let IconComponent = Bell;
                    let iconBg = 'bg-slate-50 text-slate-600 border border-slate-100';

                    if (typeLower.includes('request') || typeLower.includes('onboard') || titleLower.includes('request') || titleLower.includes('onboard')) {
                      IconComponent = UserPlus;
                      iconBg = 'bg-blue-50 text-blue-600 border border-blue-100';
                    } else if (typeLower.includes('tour') || typeLower.includes('plan') || titleLower.includes('tour') || titleLower.includes('plan')) {
                      IconComponent = Map;
                      iconBg = 'bg-amber-50 text-amber-600 border border-amber-100';
                    } else if (typeLower.includes('leave') || titleLower.includes('leave')) {
                      IconComponent = Calendar;
                      iconBg = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                    } else if (typeLower.includes('system') || typeLower.includes('alert') || titleLower.includes('system') || titleLower.includes('alert') || typeLower.includes('payroll')) {
                      IconComponent = FileText;
                      iconBg = 'bg-purple-50 text-purple-600 border border-purple-100';
                    }

                    return (
                      <div 
                        key={id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-3.5 rounded-[16px] border transition-all duration-200 cursor-pointer flex gap-3 relative overflow-hidden group ${isRead ? 'bg-white hover:bg-gray-50/50 border-gray-100' : 'bg-blue-50/20 border-blue-100/40 hover:bg-blue-50/30 shadow-[0_2px_8px_rgba(59,130,246,0.02)]'}`}
                      >
                        {/* Unread indicator dot */}
                        {!isRead && (
                          <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        )}
                        
                        {/* Delete button (visible on hover) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(deleteNotification(id));
                          }}
                          className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-gray-50 border border-gray-150 text-gray-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                        
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${iconBg}`}>
                          <IconComponent size={18} />
                        </div>
                        
                        {/* Text content */}
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className={`text-[13px] font-bold text-gray-900 m-0 ${!isRead ? 'text-blue-950 font-extrabold' : ''}`}>
                            {title}
                          </h4>
                          <p className="text-[12px] text-gray-500 m-0 mt-1 leading-relaxed">
                            {description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-gray-400 font-medium">
                              {timeText}
                            </span>
                            {!isRead && (
                              <span className="text-[10px] text-blue-500 font-semibold flex items-center gap-0.5">
                                <Check size={10} strokeWidth={2.5} /> Mark read
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-gray-100/80 bg-gray-50/40 flex gap-2 shrink-0">
                  <button
                    onClick={() => dispatch(markAllNotificationsAsRead())}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 text-[12.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <Check size={13} />
                    Mark All Read
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Briefcase, 
  Network,
  User,
  UsersRound,
  Coffee,
  FileText,
  Settings
} from 'lucide-react'

export const SUPER_ADMIN_NAV = [
  { id: 'dashboard',    icon: LayoutDashboard, label: 'Global Dashboard' },
  { id: 'branches',     icon: Network,         label: 'All Branches'     },
  { id: 'admins',       icon: Users,           label: 'Manage Admins'    },
  { id: 'finance',      icon: Wallet,          label: 'Global Finance'   },
  { id: 'settings',     icon: Settings,        label: 'System Settings'  },
]

export const ADMIN_NAV = [
  { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard'     },
  { id: 'employees',    icon: Users,            label: 'Employees'     },
  { id: 'finance',      icon: Wallet,           label: 'Finance'       },
  { id: 'recruitment',  icon: Briefcase,        label: 'Recruitment'   },
  { id: 'orgstructure', icon: Network,          label: 'Org Structure' },
  { id: 'me',           icon: User,             label: 'Me'            },
  { id: 'myteam',       icon: UsersRound,       label: 'My Team'       },
  { id: 'watercooler',  icon: Coffee,           label: 'Water Cooler'  },
  { id: 'hrdocuments',  icon: FileText,         label: 'HR Documents'  },
  { id: 'settings',     icon: Settings,         label: 'Settings'      },
]

export const EMPLOYEE_NAV = [
  { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard'     },
  { id: 'finance',      icon: FileText,         label: 'My Payslips'   },
  { id: 'me',           icon: User,             label: 'Me'            },
  { id: 'watercooler',  icon: Coffee,           label: 'Water Cooler'  },
  { id: 'settings',     icon: Settings,         label: 'Settings'      },
]

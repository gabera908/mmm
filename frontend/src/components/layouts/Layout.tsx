import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { LayoutDashboard, BookOpen, FileText, Users, Wallet, PieChart, Settings, LogOut, Menu, X, Key, DollarSign, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'

const menuItems = [
  { path: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/accounts', label: 'شجرة الحسابات', icon: BookOpen },
  { path: '/journals', label: 'القيود اليومية', icon: FileText },
  { path: '/american-journal', label: 'اليومية الأمريكية', icon: FileText },
  { path: '/ledger', label: 'الأستاذ العام', icon: FileText },
  { path: '/trial-balance', label: 'ميزان المراجعة', icon: PieChart },
  { path: '/funds', label: 'Funds', icon: Wallet },
  { path: '/projects', label: 'المشاريع', icon: PieChart },
  { path: '/donors', label: 'المانحون', icon: Users },
  { path: '/donations', label: 'التبرعات', icon: Wallet },
  { path: '/budgets', label: 'الموازنات', icon: PieChart },
  { path: '/reports', label: 'التقارير', icon: FileText },
  { path: '/cost-centers', label: 'مراكز التكلفة', icon: PieChart },
]

const settingsMenuItems = [
  { path: '/settings/general', label: 'إعدادات عامة', icon: Settings },
  { path: '/settings/users', label: 'المستخدمون', icon: Users, adminOnly: true },
  { path: '/settings/roles', label: 'الصلاحيات', icon: Settings, adminOnly: true },
  { path: '/settings/fiscal-years', label: 'السنوات المالية', icon: Settings, adminOnly: true },
  { path: '/settings/currencies', label: 'العملات', icon: DollarSign, adminOnly: true },
  { path: '/settings/audit-logs', label: 'سجل المراجعة', icon: FileText, adminOnly: true },
  { path: '/settings/backups', label: 'النسخ الاحتياطي', icon: Settings, adminOnly: true },
  { path: '/settings/change-password', label: 'تغيير كلمة المرور', icon: Key },
  { path: '/settings/system', label: 'مدير النظام', icon: Settings, adminOnly: true },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname.startsWith('/settings')) {
      setSettingsOpen(true)
    }
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isSettingsActive = location.pathname.startsWith('/settings')

  const handleSettingsClick = () => {
    const newOpen = !settingsOpen
    setSettingsOpen(newOpen)
    if (newOpen && !location.pathname.startsWith('/settings')) {
      navigate('/settings/general')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-screen">
        <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h1 className="text-xl font-bold">نظام المحاسبة</h1>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} />
                  {item.label}
                </NavLink>
              )
            })}

            {user?.is_superuser && (
              <div className="pt-2">
                <button
                  onClick={handleSettingsClick}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full ${isSettingsActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                >
                  <Settings size={20} />
                  الإعدادات
                  <ChevronDown size={16} className={`mr-auto transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
                </button>
                {settingsOpen && (
                  <div className="mt-1 space-y-1 pr-6">
                    {settingsMenuItems.filter(item => !item.adminOnly || user?.is_superuser).map((item) => {
                      const Icon = item.icon
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
                          }
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon size={16} />
                          {item.label}
                        </NavLink>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>
          <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium">{user?.full_name}</p>
                <p className="text-xs text-slate-400">{user?.username}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
              <LogOut size={18} />
              تسجيل الخروج
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800">نظام المحاسبة المركزي</h2>
            <div className="text-sm text-slate-500" dir="ltr">
              {new Date().toLocaleDateString('ar-EG')}
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

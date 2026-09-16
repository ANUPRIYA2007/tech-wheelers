import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, Home, MapPin, Users, BarChart3, UserCog, LogOut, Moon, Sun } from 'lucide-react';

const NAV = [
  { path: '/super-admin', icon: Home, label: 'Dashboard', end: true },
  { path: '/super-admin/centres', icon: MapPin, label: 'Centres' },
  { path: '/super-admin/farmers', icon: Users, label: 'Farmers' },
  { path: '/super-admin/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/super-admin/admins', icon: UserCog, label: 'Admins' },
];

export default function SuperAdminLayout() {
  const { signOut } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 z-30">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-surface-200 dark:border-surface-700">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center"><Sprout className="w-4 h-4 text-white" /></div>
          <div>
            <span className="text-lg font-bold text-surface-900 dark:text-white">Crop Dairy</span>
            <p className="text-[10px] text-surface-400 -mt-0.5">Super Admin</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => (
            <NavLink key={item.path} to={item.path} end={item.end}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700/50'}`}>
              <item.icon className="w-5 h-5" />{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-surface-200 dark:border-surface-700 space-y-1">
          <button onClick={toggleDarkMode} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700/50 w-full">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}{t('darkMode')}
          </button>
          <button onClick={async () => { await signOut(); navigate('/landing', { replace: true }); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 w-full">
            <LogOut className="w-5 h-5" />{t('logout')}
          </button>
        </div>
      </aside>
      <div className="lg:ml-64 p-4 md:p-6"><Outlet /></div>
    </div>
  );
}

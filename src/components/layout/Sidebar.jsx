import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sprout, Home, CalendarCheck, Users, Truck, CreditCard,
  User, LogOut, Moon, Sun
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/farmer', icon: Home, label: 'home', end: true },
  { path: '/farmer/slots', icon: CalendarCheck, label: 'mySlot' },
  { path: '/farmer/queue', icon: Users, label: 'queue' },
  { path: '/farmer/procurement', icon: Truck, label: 'procurement' },
  { path: '/farmer/payments', icon: CreditCard, label: 'payment' },
  { path: '/farmer/profile', icon: User, label: 'profile' },
];

export default function Sidebar() {
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/landing', { replace: true });
  };

  return (
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 z-30">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-surface-200 dark:border-surface-700">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
          <Sprout className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-surface-900 dark:text-white">Crop Dairy</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700/50'
              }
            `}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {t(item.label)}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-surface-200 dark:border-surface-700 space-y-1">
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors w-full"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {t('darkMode')}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          {t('logout')}
        </button>
      </div>
    </aside>
  );
}

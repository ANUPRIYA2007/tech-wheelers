import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sprout, Home, CalendarCheck, Users, Package, CreditCard,
  Bell, HelpCircle, Settings, LogOut, Sun, Moon
} from 'lucide-react';
import FarmerRobotCanvas from '../3d/FarmerRobotCanvas';

const NAV_ITEMS = [
  { path: '/farmer', icon: Home, label: 'home', end: true },
  { path: '/farmer/slots', icon: CalendarCheck, label: 'mySlot' },
  { path: '/farmer/queue', icon: Users, label: 'queue' },
  { path: '/farmer/procurement', icon: Package, label: 'procurement' },
  { path: '/farmer/payments', icon: CreditCard, label: 'payment' },
  { path: '/farmer/notifications', icon: Bell, label: 'notifications', badge: '2' },
  { path: '/farmer/help', icon: HelpCircle, label: 'help' },
  { path: '/farmer/settings', icon: Settings, label: 'settings' },
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
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 z-30 shadow-sm">
      {/* Brand Logo & Tagline */}
      <div className="pt-5 pb-4 px-5 border-b border-surface-100 dark:border-surface-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/30">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-emerald-800 dark:text-emerald-400">Crop Dairy</span>
            <p className="text-[10px] text-surface-500 font-medium leading-tight">{t('tagline')}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `
              flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
              ${isActive
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-surface-700 dark:text-surface-300 hover:bg-emerald-50 dark:hover:bg-surface-800 hover:text-emerald-700'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-surface-500 dark:text-surface-400'}`} />
                  <span>{t(item.label)}</span>
                </div>
                {item.badge && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section: 3D Hero + Speech Bubble + Dark Mode + Logout */}
      <div className="p-3 border-t border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 space-y-2">
        {/* Speech Bubble */}
        <div className="relative p-2.5 rounded-2xl bg-sky-50 dark:bg-surface-800 border border-sky-100 dark:border-surface-700 shadow-sm text-center">
          <p className="text-xs font-bold text-sky-900 dark:text-sky-300">
            {t('heroBubbleTitle')}
          </p>
          <p className="text-[11px] text-sky-700 dark:text-sky-400 leading-tight mt-0.5">
            {t('heroBubbleText')}
          </p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-50 dark:bg-surface-800 border-r border-b border-sky-100 dark:border-surface-700 rotate-45" />
        </div>

        {/* 3D Hero Model */}
        <div className="w-full h-36 rounded-xl overflow-hidden shadow-inner border border-emerald-500/20 bg-emerald-950/20">
          <FarmerRobotCanvas className="w-full h-full" />
        </div>

        {/* Dark Mode Switch */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors w-full border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800"
        >
          <div className="flex items-center gap-2">
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-surface-500" />}
            <span>{t('darkMode')}</span>
          </div>
          <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${darkMode ? 'bg-emerald-600' : 'bg-surface-300'}`}>
            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900/40 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}

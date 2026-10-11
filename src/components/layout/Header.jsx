import React from 'react';
import { ChevronDown, ShieldCheck, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useFarmerNotifications from '../../hooks/useFarmerNotifications';
import { Link, useLocation } from 'react-router-dom';
import LanguageSelector from '../common/LanguageSelector';
import ThemeToggleSwitch from '../common/ThemeToggleSwitch';

export default function Header() {
  const { profile } = useAuth();
  const { unreadCount } = useFarmerNotifications();
  const location = useLocation();
  const isProfileActive = location.pathname === '/farmer/profile';
  const isNotificationsActive = location.pathname === '/farmer/notifications';
  
  const farmerName = profile?.full_name || 'Ramesh Kumar';
  const farmerInitial = farmerName.charAt(0).toUpperCase();

  return (
    <header className="py-3 px-4 sm:px-6 lg:px-8 bg-transparent flex items-center justify-end gap-3 select-none">
      
      {/* Language Selector Dropdown */}
      <LanguageSelector />

      {/* Illuminated Glassmorphic Theme Toggle Switch */}
      <ThemeToggleSwitch size="sm" />

      {/* Real-time Notifications Bell Entry */}
      <Link
        to="/farmer/notifications"
        className={`relative p-2.5 rounded-full border shadow-2xs transition-all duration-200 cursor-pointer flex items-center justify-center ${
          isNotificationsActive
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 ring-2 ring-emerald-500/20'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:border-emerald-500 dark:hover:text-emerald-400'
        }`}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </Link>

      {/* Authenticated Farmer Profile Avatar & Entry */}
      <Link 
        to="/farmer/profile" 
        className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border shadow-2xs transition-all duration-200 cursor-pointer ${
          isProfileActive
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500'
        }`}
        title="View Farmer Profile & Settings"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-black text-xs shadow-xs flex-shrink-0 relative">
          <span>{farmerInitial}</span>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white dark:border-slate-800 rounded-full" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
            {farmerName}
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold leading-none mt-0.5 flex items-center gap-0.5">
            <ShieldCheck className="w-2.5 h-2.5" />
            <span>Farmer Profile</span>
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </Link>

    </header>
  );
}

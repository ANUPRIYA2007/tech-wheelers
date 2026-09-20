import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sprout, Home, CalendarCheck, Users, Package, CreditCard,
  Bell, HelpCircle, LogOut, Sun, Moon
} from 'lucide-react';
import HeroModel from '../hero/HeroModel';

const NAV_ITEMS = [
  { path: '/farmer', icon: Home, label: 'home', end: true },
  { path: '/farmer/slots', icon: CalendarCheck, label: 'mySlot' },
  { path: '/farmer/queue', icon: Users, label: 'queue' },
  { path: '/farmer/procurement', icon: Package, label: 'procurement' },
  { path: '/farmer/payments', icon: CreditCard, label: 'payment' },
  { path: '/farmer/notifications', icon: Bell, label: 'notifications', badge: '2' },
  { path: '/farmer/help', icon: HelpCircle, label: 'help' },
];

export default function Sidebar() {
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [animState, setAnimState] = useState('idle');

  const handleLogout = async () => {
    await signOut();
    navigate('/portal', { replace: true });
  };

  const handleWaveComplete = () => {
    setAnimState('idle');
  };

  const handleRobotClick = () => {
    setAnimState('greeting');
  };

  return (
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-30 shadow-xs select-none">
      
      {/* Brand Logo & Tagline */}
      <div className="pt-5 pb-4 px-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#16A34A] flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-[#172033] dark:text-white block leading-none">
              Crop Dairy
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-1">
              Smart Procurement. Less Waiting.<br />Better Decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `
              flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
              ${isActive
                ? 'bg-[#16A34A] text-white shadow-md shadow-emerald-600/20'
                : 'text-[#172033] dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{t(item.label)}</span>
                </div>
                {item.badge && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section: 3D Hero Model Box + Dark Mode + Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
        
        {/* Light Mint Hero AI Box */}
        <div className="bg-[#E6F4EA] dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 rounded-2xl p-3 shadow-2xs text-center relative overflow-visible">
          
          {/* Full-Body 3D Farmer Model (180px Height) */}
          <div 
            onClick={handleRobotClick}
            className="w-full h-[180px] relative overflow-visible cursor-pointer"
            title="Click Hero AI to greet"
          >
            <HeroModel
              animState={animState}
              onWaveComplete={handleWaveComplete}
              className="w-full h-full"
            />
          </div>

          {/* Status Pill directly below feet */}
          <div className="flex justify-center mt-1">
            <div className="bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hero AI · Online</span>
            </div>
          </div>

          {/* Speech Bubble Box */}
          <div className="mt-2.5 p-2.5 rounded-xl bg-[#DCFCE7]/70 dark:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-800/60 text-center">
            <p className="text-[11px] font-medium text-emerald-900 dark:text-emerald-200 leading-snug">
              {t('heroBubbleText', "Hello! I'm your Crop Dairy assistant. How can I help you today?")}
            </p>
          </div>
        </div>

        {/* Dark Mode Switch */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors w-full shadow-2xs"
        >
          <div className="flex items-center gap-2">
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            <span>{t('darkMode')}</span>
          </div>
          <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${darkMode ? 'bg-emerald-600' : 'bg-slate-300'}`}>
            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        {/* Logout Button (Must be visible) */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 transition-colors w-full shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>

      </div>

    </aside>
  );
}

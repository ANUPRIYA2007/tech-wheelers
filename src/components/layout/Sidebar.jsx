import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sprout, Home, CalendarCheck, Users, Package, CreditCard,
  Bell, Settings, ChevronRight
} from 'lucide-react';
import HeroModel from '../hero/HeroModel';

const NAV_ITEMS = [
  { path: '/farmer', icon: Home, label: 'Home', end: true },
  { path: '/farmer/slots', icon: CalendarCheck, label: 'My Slot' },
  { path: '/farmer/queue', icon: Users, label: 'My Queue' },
  { path: '/farmer/procurement', icon: Package, label: 'Procurement Status' },
  { path: '/farmer/payments', icon: CreditCard, label: 'Payment' },
  { path: '/farmer/notifications', icon: Bell, label: 'Notifications', badge: '2' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [animState, setAnimState] = useState('idle');

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
          <div className="w-10 h-10 rounded-xl bg-[#16A34A] flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-[#0F172A] dark:text-white block leading-none">
              Crop Dairy
            </span>
            <span className="text-xs text-[#16A34A] font-extrabold block mt-1">
              Farmer Portal
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `
              flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150
              ${isActive
                ? 'bg-[#16A34A] text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-[#16A34A]'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{t(item.label.toLowerCase()) || item.label}</span>
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

      {/* Bottom Section: 3D Hero Model Box + Settings */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
        
        {/* Light Mint Hero AI Card */}
        <div className="bg-[#E6F4EA] dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 rounded-2xl p-3 shadow-2xs text-center relative overflow-visible">
          
          {/* Full-Body 3D Farmer Model */}
          <div 
            onClick={handleRobotClick}
            className="w-full h-[170px] relative overflow-visible cursor-pointer"
            title="Click Hero AI to greet"
          >
            <HeroModel
              animState={animState}
              onWaveComplete={handleWaveComplete}
              className="w-full h-full"
            />
          </div>

          {/* Floating Status Pill Directly Below Feet */}
          <div className="flex justify-center mt-1">
            <button
              onClick={() => navigate('/farmer')}
              className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-2xs inline-flex items-center gap-1.5 hover:scale-105 transition-transform"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hero AI</span>
              <ChevronRight className="w-3 h-3 text-emerald-600" />
            </button>
          </div>

          {/* Tagline Box */}
          <div className="mt-2 text-center">
            <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 leading-tight">
              Better Farming<br />Brighter Future
            </p>
          </div>
        </div>

        {/* Settings Button */}
        <NavLink
          to="/farmer/profile"
          className={({ isActive }) => `
            flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all
            ${isActive 
              ? 'bg-[#16A34A] text-white' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }
          `}
        >
          <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>Settings</span>
        </NavLink>

      </div>

    </aside>
  );
}

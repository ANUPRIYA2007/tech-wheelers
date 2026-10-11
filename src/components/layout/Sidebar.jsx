import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sprout, Home, CalendarCheck, Users, Package, CreditCard,
  ChevronRight, LogOut
} from 'lucide-react';
import HeroModel from '../hero/HeroModel';

const NAV_ITEMS = [
  { path: '/farmer', icon: Home, label: 'Home', end: true },
  { path: '/farmer/slots', icon: CalendarCheck, label: 'My Slot' },
  { path: '/farmer/queue', icon: Users, label: 'My Queue' },
  { path: '/farmer/procurement', icon: Package, label: 'Procurement Status' },
  { path: '/farmer/payments', icon: CreditCard, label: 'Payment' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signOut } = useAuth();
  const [animState, setAnimState] = useState('idle');

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login', { replace: true });
    }
  };

  const handleWaveComplete = () => {
    setAnimState('idle');
  };

  const handleRobotClick = () => {
    setAnimState('greeting');
  };

  return (
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-30 shadow-xs select-none transition-colors duration-200">
      
      {/* Brand Logo & Tagline */}
      <div className="pt-5 pb-4 px-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
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
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{t(item.label.toLowerCase()) || item.label}</span>
              </div>
            )}
          </NavLink>
        ))}

        {/* 3D Hero AI Mini Box in nav area */}
        <div className="pt-2">
          <div className="bg-[#E6F4EA] dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 rounded-2xl p-2.5 text-center relative overflow-visible">
            {/* Full-Body 3D Farmer Model */}
            <div 
              onClick={handleRobotClick}
              className="w-full h-[140px] relative overflow-visible cursor-pointer"
              title="Click Hero AI to greet"
            >
              <HeroModel
                animState={animState}
                onWaveComplete={handleWaveComplete}
                className="w-full h-full"
              />
            </div>

            {/* Floating Status Pill */}
            <div className="flex justify-center mt-1">
              <button
                onClick={() => navigate('/farmer')}
                className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow-2xs inline-flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Hero AI</span>
                <ChevronRight className="w-3 h-3 text-emerald-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Section: Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 group cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-500 dark:text-red-400 group-hover:scale-110 transition-transform" />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}

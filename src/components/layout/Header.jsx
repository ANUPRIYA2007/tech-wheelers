import React from 'react';
import { User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import LanguageSelector from '../common/LanguageSelector';

export default function Header() {
  const { profile } = useAuth();
  const farmerName = profile?.full_name || 'Ramesh Kumar';

  return (
    <header className="py-3 px-4 sm:px-6 lg:px-8 bg-transparent flex items-center justify-end gap-3 select-none">
      
      {/* Language Selector Dropdown */}
      <LanguageSelector />

      {/* Authenticated Farmer Profile Pill */}
      <Link 
        to="/farmer/profile" 
        className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-emerald-500 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold flex-shrink-0">
          <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
            {farmerName}
          </p>
          <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
            Farmer
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </Link>

    </header>
  );
}

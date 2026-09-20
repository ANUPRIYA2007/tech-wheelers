import { Bell, User, ChevronDown, Sprout } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import LanguageSelector from '../common/LanguageSelector';

export default function Header() {
  const { profile } = useAuth();
  const { t } = useLanguage();

  const farmerName = profile?.full_name || 'Ramesh';

  return (
    <header className="pt-6 pb-4 px-4 sm:px-6 lg:px-8 bg-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      {/* Dynamic Greeting matching Image 1 */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sprout className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172033] dark:text-white tracking-tight leading-tight">
            {t('greetingPrefix')}{farmerName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            {t('greetingSubtitle', "Here's your procurement journey for today. Stay informed and on track.")}
          </p>
        </div>
      </div>

      {/* Right side controls: Language Dropdown + Notifications + Profile */}
      <div className="flex items-center gap-3 self-end md:self-auto">
        
        {/* Language Selector Dropdown */}
        <LanguageSelector />

        {/* Notifications Bell */}
        <Link 
          to="/farmer/notifications" 
          className="relative p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-2xs">
            2
          </span>
        </Link>

        {/* Profile Pill */}
        <Link 
          to="/farmer/profile" 
          className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold">
            <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-[#172033] dark:text-slate-100 leading-tight">{farmerName}</p>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">{t('farmerRole', 'Farmer')}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </Link>

      </div>

    </header>
  );
}

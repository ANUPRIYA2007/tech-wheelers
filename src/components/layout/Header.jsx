import { Bell, User, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';

export default function Header() {
  const { profile } = useAuth();
  const { t, language, changeLanguage, languages } = useLanguage();

  const farmerName = profile?.full_name || 'ரமேஷ்';

  return (
    <header className="pt-6 pb-4 px-4 sm:px-6 lg:px-8 bg-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Dynamic Greeting matching reference */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          {t('greetingPrefix')}{farmerName}!
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          {t('greetingSubtitle')}
        </p>
      </div>

      {/* Right side controls: Language Pill + Notification + Profile */}
      <div className="flex items-center gap-3 self-end md:self-auto">
        {/* Language Selector Pill */}
        <div className="relative inline-flex items-center">
          <Globe className="w-4 h-4 text-slate-600 dark:text-slate-300 absolute left-3 pointer-events-none" />
          <select
            value={language}
            onChange={e => changeLanguage(e.target.value)}
            className="pl-9 pr-7 py-1.5 rounded-full bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
          >
            {languages.map(l => (
              <option key={l.code} value={l.code}>{l.nativeName}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
        </div>

        {/* Notifications Bell */}
        <Link to="/farmer/notifications" className="relative p-2 rounded-full bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            2
          </span>
        </Link>

        {/* Profile Pill */}
        <Link to="/farmer/profile" className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 shadow-sm hover:bg-slate-50 transition-colors">
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-surface-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{farmerName}</p>
            <p className="text-[10px] text-slate-400 font-medium leading-none">விவசாயி</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>
    </header>
  );
}

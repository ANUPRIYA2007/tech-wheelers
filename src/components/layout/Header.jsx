import { Bell, User, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';

export default function Header() {
  const { profile } = useAuth();
  const { t, language, changeLanguage, languages } = useLanguage();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  const userName = profile?.full_name || profile?.user_metadata?.full_name || 'Farmer';

  return (
    <header className="h-16 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
          {getGreeting()}, <span className="text-primary-600">{userName}</span>
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Selector */}
        <select
          value={language}
          onChange={e => changeLanguage(e.target.value)}
          className="bg-surface-100 dark:bg-surface-700 border-none rounded-lg px-2 py-1.5 text-xs font-medium text-surface-700 dark:text-surface-300 focus:ring-primary-500 focus:outline-none"
        >
          {languages.map(l => (
            <option key={l.code} value={l.code}>{l.nativeName}</option>
          ))}
        </select>

        {/* Notifications */}
        <Link to="/farmer/notifications" className="relative p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
          <Bell className="w-5 h-5 text-surface-600 dark:text-surface-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-600 rounded-full" />
        </Link>

        {/* Profile */}
        <Link to="/farmer/profile" className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </Link>
      </div>
    </header>
  );
}

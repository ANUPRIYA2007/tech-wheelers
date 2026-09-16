import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Home, CalendarCheck, Users, Truck, Bot } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/farmer', icon: Home, label: 'home', end: true },
  { path: '/farmer/slots', icon: CalendarCheck, label: 'mySlot' },
  { path: '/farmer/queue', icon: Users, label: 'queue' },
  { path: '/farmer/procurement', icon: Truck, label: 'procurement' },
];

export default function MobileNavigation() {
  const { t } = useLanguage();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 z-30 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `
              flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]
              ${isActive
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-surface-400 dark:text-surface-500'
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t(item.label)}</span>
          </NavLink>
        ))}
        {/* Hero Button */}
        <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-primary-600 dark:text-primary-400">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center -mt-3 shadow-lg">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-[10px] font-medium">Hero</span>
        </button>
      </div>
    </nav>
  );
}

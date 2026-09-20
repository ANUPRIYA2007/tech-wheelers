import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSelector({ className = '' }) {
  const { language, changeLanguage, languages } = useLanguage();

  return (
    <div className={`relative flex items-center bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 rounded-full px-3.5 py-1.5 shadow-sm hover:border-emerald-500 transition-colors ${className}`}>
      <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2 flex-shrink-0" />
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
        aria-label="Select Application Language"
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code} className="bg-white dark:bg-surface-900 text-slate-800 dark:text-slate-200">
            {l.flag} {l.nativeName} ({l.name})
          </option>
        ))}
      </select>
    </div>
  );
}

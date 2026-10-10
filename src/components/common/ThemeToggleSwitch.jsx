import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggleSwitch({ 
  size = 'md', 
  className = '', 
  showLabel = true 
}) {
  const { darkMode, toggleDarkMode } = useTheme();

  // Size variations
  const sizeClasses = {
    sm: {
      track: 'w-20 h-8 p-1',
      thumb: 'w-6 h-6',
      icon: 'w-3.5 h-3.5',
      text: 'text-[11px]',
      thumbTranslate: 'translate-x-12',
    },
    md: {
      track: 'w-28 h-10 p-1',
      thumb: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-xs',
      thumbTranslate: 'translate-x-[4.25rem]',
    },
    lg: {
      track: 'w-36 h-12 p-1.5',
      thumb: 'w-9 h-9',
      icon: 'w-5 h-5',
      text: 'text-sm',
      thumbTranslate: 'translate-x-[5.5rem]',
    },
  }[size] || {
    track: 'w-28 h-10 p-1',
    thumb: 'w-8 h-8',
    icon: 'w-4 h-4',
    text: 'text-xs',
    thumbTranslate: 'translate-x-[4.25rem]',
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={darkMode}
      onClick={toggleDarkMode}
      className={`
        relative inline-flex items-center rounded-full transition-all duration-300 ease-out cursor-pointer select-none
        ${sizeClasses.track}
        ${!darkMode
          ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 shadow-[0_0_22px_rgba(245,158,11,0.55)] border border-amber-300/60 ring-2 ring-amber-400/20'
          : 'bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 shadow-[0_0_22px_rgba(16,185,129,0.4)] border border-emerald-500/40 ring-2 ring-emerald-500/20'
        }
        hover:scale-105 active:scale-95
        ${className}
      `}
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Background ambient glow blur */}
      <span 
        className={`
          absolute inset-0 rounded-full blur-sm transition-opacity duration-300 -z-10
          ${!darkMode ? 'bg-amber-400/50 opacity-100' : 'bg-emerald-500/30 opacity-100'}
        `} 
      />

      {/* Sliding Glass Thumb */}
      <span
        className={`
          ${sizeClasses.thumb}
          rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform
          backdrop-blur-md shadow-md z-10
          ${!darkMode
            ? 'translate-x-0 bg-white/35 border-2 border-white text-white shadow-[0_2px_10px_rgba(245,158,11,0.3)] ring-1 ring-white/60'
            : `${sizeClasses.thumbTranslate} bg-emerald-500/25 border-2 border-emerald-300/80 text-emerald-300 shadow-[0_2px_10px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/50`
          }
        `}
      >
        {!darkMode ? (
          <Sun className={`${sizeClasses.icon} text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.9)] animate-pulse-soft`} />
        ) : (
          <Moon className={`${sizeClasses.icon} text-emerald-200 drop-shadow-[0_0_4px_rgba(52,211,153,0.9)]`} />
        )}
      </span>

      {/* Label Text inside the Track */}
      {showLabel && (
        <span
          className={`
            absolute font-extrabold tracking-wide uppercase transition-all duration-300 select-none
            ${sizeClasses.text}
            ${!darkMode
              ? 'right-3 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
              : 'left-3 text-emerald-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]'
            }
          `}
        >
          {!darkMode ? 'light' : 'dark'}
        </span>
      )}
    </button>
  );
}

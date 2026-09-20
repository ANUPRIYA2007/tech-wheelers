import React from 'react';

export default function HeroStatus({ status = 'Idle' }) {
  const getStatusText = () => {
    switch (status.toLowerCase()) {
      case 'waving':
      case 'greeting':
        return 'Greeting...';
      case 'thinking':
        return 'Thinking...';
      case 'ready':
        return 'Ready';
      default:
        return 'Idle';
    }
  };

  const getDotColor = () => {
    if (status.toLowerCase() === 'thinking') return 'bg-amber-400 animate-ping';
    if (status.toLowerCase() === 'waving' || status.toLowerCase() === 'greeting') return 'bg-emerald-400 animate-pulse';
    return 'bg-emerald-500';
  };

  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 dark:bg-surface-900/90 backdrop-blur border border-slate-200 dark:border-surface-700 shadow-md text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all select-none">
      <span className={`w-2 h-2 rounded-full ${getDotColor()}`} />
      <span>Hero AI · {getStatusText()}</span>
    </div>
  );
}

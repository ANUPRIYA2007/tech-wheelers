import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import HeroModel from './HeroModel';

export default function SidebarHeroRobot({ onOpenChat }) {
  const containerRef = useRef(null);
  const [animState, setAnimState] = useState('greeting');
  const [heroStatus, setHeroStatus] = useState('Greeting');

  // Load entrance animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.1 }
      );
    }
  }, []);

  const handleWaveComplete = () => {
    setAnimState('idle');
    setHeroStatus('Idle');
  };

  const handleMouseEnter = () => {
    if (animState === 'idle') {
      setAnimState('greeting');
      setHeroStatus('Greeting');
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onClick={onOpenChat}
      className="w-full flex flex-col items-center justify-end overflow-visible select-none cursor-pointer group py-1"
      title="Click to talk to Hero AI Assistant"
    >
      {/* Full-Body 3D Farmer Model (240px height inside sidebar) */}
      <div className="w-full h-[240px] overflow-visible pointer-events-auto">
        <HeroModel
          animState={animState}
          onWaveComplete={handleWaveComplete}
          className="w-full h-full"
        />
      </div>

      {/* Hero AI Status Pill */}
      <div className="mt-1 flex items-center gap-2 bg-slate-900 dark:bg-emerald-950 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 text-[11px] font-extrabold shadow-xs group-hover:scale-105 transition-transform pointer-events-auto">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Hero AI {heroStatus}</span>
      </div>
    </div>
  );
}

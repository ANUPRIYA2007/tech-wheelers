import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import HeroModel from './HeroModel';
import HeroStatus from './HeroStatus';

export default function HeroAssistant({ onOpenChat }) {
  const containerRef = useRef(null);
  const [animState, setAnimState] = useState('greeting');
  const [heroStatus, setHeroStatus] = useState('Greeting');

  // GSAP load entrance: fade in + slide upward on page load
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
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
      style={{ left: '70px', bottom: '0px', height: '300px', width: '250px' }}
      className="hero-agent-fixed fixed z-30 flex flex-col items-center justify-end overflow-visible pointer-events-none select-none cursor-pointer group"
      title="Click to talk to Hero AI"
    >
      {/* Full-Body 3D Farmer Model (100% visible, no clipping) */}
      <div className="w-full h-[250px] overflow-visible pointer-events-auto">
        <HeroModel
          animState={animState}
          onWaveComplete={handleWaveComplete}
          className="w-full h-full"
        />
      </div>

      {/* Floating Status Pill Directly Below Feet */}
      <div className="mt-1 pointer-events-auto group-hover:scale-105 transition-transform z-30">
        <HeroStatus status={heroStatus} />
      </div>
    </div>
  );
}


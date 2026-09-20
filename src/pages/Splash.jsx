import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Sprout } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const taglineRef = useRef(null);
  const loaderRef = useRef(null);
  const leafRefs = useRef([]);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.4,
          onComplete: () => navigate('/portal', { replace: true }),
        });
      },
    });

    tl.fromTo(logoRef.current, 
      { scale: 0, opacity: 0, rotation: -20 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' }
    )
    .fromTo(leafRefs.current,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
      '-=0.2'
    )
    .fromTo(titleRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
      '-=0.2'
    )
    .fromTo(taglineRef.current,
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
    )
    .fromTo(loaderRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.2, ease: 'power1.inOut' },
      '-=0.1'
    );

    return () => tl.kill();
  }, [navigate]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-50 dark:from-surface-900 dark:via-surface-900 dark:to-surface-800 flex flex-col items-center justify-center px-6"
    >
      {/* Floating Leaves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            ref={el => leafRefs.current[i] = el}
            className="absolute text-primary-300 dark:text-primary-800 opacity-0"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 20}%`,
              transform: `rotate(${i * 60}deg)`,
            }}
          >
            <Sprout className="w-6 h-6" />
          </div>
        ))}
      </div>

      {/* Logo */}
      <div ref={logoRef} className="opacity-0 mb-6">
        <div className="w-20 h-20 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg">
          <Sprout className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Title */}
      <h1 ref={titleRef} className="opacity-0 text-3xl md:text-4xl font-bold text-surface-900 dark:text-white tracking-tight">
        Crop Dairy
      </h1>

      {/* Tagline */}
      <p ref={taglineRef} className="opacity-0 text-sm md:text-base text-surface-500 dark:text-surface-400 mt-2 text-center max-w-xs">
        Smart Procurement. Less Waiting. Better Decisions.
      </p>

      {/* Loader Bar */}
      <div className="mt-8 w-48 h-1 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
        <div
          ref={loaderRef}
          className="h-full bg-primary-600 rounded-full origin-left"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </div>
  );
}

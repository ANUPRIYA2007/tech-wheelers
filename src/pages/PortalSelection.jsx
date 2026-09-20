import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { gsap } from 'gsap';
import { 
  Sprout, 
  UserCheck, 
  Building2, 
  ShieldCheck 
} from 'lucide-react';
import HeroAssistant from '../components/hero/HeroAssistant';
import HeroChatbot from '../components/common/HeroChatbot';
import LanguageSelector from '../components/common/LanguageSelector';

export default function PortalSelection() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const headerRef = useRef(null);
  const cardsRef = useRef([]);
  const cardIconRefs = useRef([]);
  const arrowRefs = useRef([]);

  const [isChatOpen, setIsChatOpen] = useState(false);

  // GSAP Entrance & Stagger Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Fade & Slide down
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { y: -25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
        );
      }

      // Portal Cards Sequential Stagger Entrance
      if (cardsRef.current.length > 0) {
        gsap.fromTo(
          cardsRef.current,
          { y: 40, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.75,
            stagger: 0.12,
            ease: 'power3.out',
            delay: 0.15
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // GSAP Card Hover Animation Handlers
  const handleCardMouseEnter = (index) => {
    const card = cardsRef.current[index];
    const icon = cardIconRefs.current[index];
    const arrow = arrowRefs.current[index];

    if (card) {
      gsap.to(card, {
        y: -5,
        boxShadow: index === 1 
          ? '0 20px 30px -10px rgba(16, 185, 129, 0.25), 0 10px 15px -5px rgba(0, 0, 0, 0.05)'
          : '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        borderColor: index === 1 ? '#059669' : '#10B981',
        duration: 0.3,
        ease: 'power2.out'
      });
    }

    if (icon) {
      gsap.to(icon, {
        scale: 1.08,
        duration: 0.25,
        ease: 'power2.out'
      });
    }

    if (arrow) {
      gsap.to(arrow, {
        x: 4,
        duration: 0.2,
        ease: 'power2.out'
      });
    }
  };

  const handleCardMouseLeave = (index) => {
    const card = cardsRef.current[index];
    const icon = cardIconRefs.current[index];
    const arrow = arrowRefs.current[index];

    if (card) {
      gsap.to(card, {
        y: 0,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        borderColor: index === 1 ? '#10B981' : 'rgba(226, 232, 240, 0.9)',
        duration: 0.3,
        ease: 'power2.out'
      });
    }

    if (icon) {
      gsap.to(icon, {
        scale: 1,
        duration: 0.25,
        ease: 'power2.out'
      });
    }

    if (arrow) {
      gsap.to(arrow, {
        x: 0,
        duration: 0.2,
        ease: 'power2.out'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-x-hidden font-sans">
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header ref={headerRef} className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/portal')}
        >
          <div className="w-11 h-11 rounded-2xl bg-[#059669] flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-300">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-slate-900 block">
              Crop Dairy
            </span>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-600 -mt-1">
              {t('procurementSystem', 'PROCUREMENT SYSTEM')}
            </span>
          </div>
        </div>

        {/* Global Language Selector (Top Right) */}
        <div className="flex items-center gap-3">
          <LanguageSelector />
        </div>
      </header>

      {/* 2. MAIN PORTAL SELECTION CONTENT */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-4 sm:py-6 flex flex-col justify-center">
        
        {/* Page Titles */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#0F172A]">
            {t('selectPortalTitle', 'Select Your Portal to Get Started')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base md:text-lg font-medium max-w-xl mx-auto">
            {t('selectPortalSubtitle', 'Access the Crop Dairy platform based on your role.')}
          </p>
        </div>

        {/* 3. THREE PORTAL CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto w-full">
          
          {/* CARD 1: FARMER PORTAL */}
          <div
            ref={(el) => (cardsRef.current[0] = el)}
            onMouseEnter={() => handleCardMouseEnter(0)}
            onMouseLeave={() => handleCardMouseLeave(0)}
            className="group relative bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Top Icon & Pill Badge */}
              <div className="flex items-center justify-between mb-6">
                <div 
                  ref={(el) => (cardIconRefs.current[0] = el)}
                  className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs"
                >
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100/80">
                  PRIMARY PORTAL
                </span>
              </div>

              {/* Sub-label & Main Title */}
              <div className="space-y-1 mb-2">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  {t('farmerPortalLabel', 'FARMER PORTAL')}
                </span>
                <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
                  {t('farmerTitle', 'FARMER')}
                </h2>
              </div>

              {/* Description */}
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium mb-6">
                {t('farmerDesc', 'Book procurement slots, track your live queue, view procurement status, and monitor payment updates.')}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate('/login?role=farmer')}
                className="w-full py-3 px-5 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{t('farmerLogin', 'Farmer Login')}</span>
                <span ref={(el) => (arrowRefs.current[0] = el)} className="inline-block">›</span>
              </button>

              <button
                onClick={() => navigate('/register')}
                className="w-full py-2.5 px-5 rounded-2xl bg-[#F1F5F9] hover:bg-slate-200 text-[#334155] font-bold text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <span>{t('newFarmerRegister', 'New Farmer? Register')}</span>
              </button>
            </div>
          </div>

          {/* CARD 2: LOCAL PROCUREMENT CENTRE (FEATURED GREEN BORDER - DIRECT WORKSPACE ROUTE) */}
          <div
            ref={(el) => (cardsRef.current[1] = el)}
            onMouseEnter={() => handleCardMouseEnter(1)}
            onMouseLeave={() => handleCardMouseLeave(1)}
            onClick={() => navigate('/local-admin')}
            className="group relative bg-white rounded-3xl p-7 border-2 border-[#10B981] shadow-sm transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Top Icon & Pill Badge */}
              <div className="flex items-center justify-between mb-6">
                <div 
                  ref={(el) => (cardIconRefs.current[1] = el)}
                  className="w-12 h-12 rounded-2xl bg-[#0D9488] flex items-center justify-center text-white shadow-xs"
                >
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-100">
                  CENTRE LEVEL
                </span>
              </div>

              {/* Sub-label & Main Title */}
              <div className="space-y-1 mb-2">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-teal-600">
                  {t('centreAdminLabel', 'CENTRE ADMINISTRATION')}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight leading-snug">
                  {t('localProcurementCentreTitle', 'LOCAL PROCUREMENT CENTRE')}
                </h2>
              </div>

              {/* Description */}
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium mb-6">
                {t('localAdminDesc', 'Manage your procurement centre, monitor the live farmer queue, update procurement progress, and manage daily operations.')}
              </p>
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/local-admin'); }}
                className="w-full py-3 px-5 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{t('enterProcurementWorkspace', 'Enter Procurement Centre Workspace')}</span>
                <span ref={(el) => (arrowRefs.current[1] = el)} className="inline-block">›</span>
              </button>
            </div>
          </div>

          {/* CARD 3: SUPER ADMIN */}
          <div
            ref={(el) => (cardsRef.current[2] = el)}
            onMouseEnter={() => handleCardMouseEnter(2)}
            onMouseLeave={() => handleCardMouseLeave(2)}
            className="group relative bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Top Icon & Pill Badge */}
              <div className="flex items-center justify-between mb-6">
                <div 
                  ref={(el) => (cardIconRefs.current[2] = el)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shadow-xs"
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-600 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
                  PLATFORM ADMIN
                </span>
              </div>

              {/* Sub-label & Main Title */}
              <div className="space-y-1 mb-2">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {t('platformAdminLabel', 'PLATFORM ADMINISTRATION')}
                </span>
                <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
                  {t('superAdminTitle', 'SUPER ADMIN')}
                </h2>
              </div>

              {/* Description */}
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium mb-6">
                {t('superAdminDesc', 'Manage procurement centres, administrators, farmers, platform operations, analytics, and system configuration.')}
              </p>
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                onClick={() => navigate('/login?role=super_admin')}
                className="w-full py-3 px-5 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{t('superAdminLogin', 'Super Admin Login')}</span>
                <span ref={(el) => (arrowRefs.current[2] = el)} className="inline-block">›</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* 4. LOWER-LEFT 3D HERO AGENT & STATUS PILL */}
      <HeroAssistant onOpenChat={() => setIsChatOpen(true)} />

      {/* 5. FLOATING HERO AI CHATBOT (DRAWER) */}
      <HeroChatbot
        isOpenProp={isChatOpen}
        onCloseProp={() => setIsChatOpen(false)}
      />

      {/* Footer Copyright */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 text-center">
        <p className="text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} Crop Dairy. Smart Procurement & Agriculture Govt.
        </p>
      </footer>

    </div>
  );
}

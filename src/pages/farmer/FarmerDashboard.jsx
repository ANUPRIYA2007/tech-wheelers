import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Bot, Sun, MapPin, Clock, Users, Ticket, Leaf, Calendar, 
  Package, CreditCard, Bell, ArrowRight, Mic, Send, CheckCircle2,
  AlertTriangle, Info, Check, Navigation, CalendarCheck, Map
} from 'lucide-react';
import { askHeroAI } from '../../services/aiGateway';

export default function FarmerDashboard() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();

  const [aiInput, setAiInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Dynamic values initialized with high-fidelity reference defaults
  const [dashboard] = useState({
    tokenNumber: '#128',
    tokenStatus: 'WAITING',
    farmersAhead: 14,
    estimatedWaitMins: 32,
    recommendedArrival: '11:15 AM',
    centreName: 'Govt Procurement Centre - Main DPC',
    centreStatus: 'IN_OPERATION',
    currentToken: '#114',
    distanceKm: '4.2',
    slotDate: 'Today',
    slotTime: '10:30 AM',
    slotCentre: 'Main DPC',
    slotStatus: 'ACTIVE',
    procurementStage: 3,
    paymentAmount: '₹12,450',
    paymentStatus: 'PROCESSING',
    expectedPaymentDate: 'Today',
    weatherTemp: '32°C',
    weatherLocation: 'Thanjavur, TN',
  });

  const handleAiSend = async (customQuery) => {
    const q = customQuery || aiInput;
    if (!q.trim() || aiLoading) return;
    setAiLoading(true);
    try {
      const res = await askHeroAI(q, language);
      alert(`Hero AI:\n\n${res}`);
      if (!customQuery) setAiInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const toggleMic = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
    setIsListening(true);
    rec.start();
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setAiInput(text);
      setIsListening(false);
      handleAiSend(text);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-slate-800 dark:text-slate-100">
      
      {/* ROW 1: Hero AI Card (Left ~65%) + Weather Card (Right ~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Hero AI Input & Quick Actions Card */}
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/50 dark:from-surface-800 dark:to-surface-900 border border-emerald-100 dark:border-surface-700 p-5 shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 flex-shrink-0">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {t('heroCardTitle')}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('online')}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {t('heroCardSubtitle')}
              </p>
            </div>
          </div>

          {/* Search/Ask Pill Input */}
          <div className="relative flex items-center mb-4">
            <button
              onClick={toggleMic}
              className={`absolute left-3 p-1.5 rounded-full transition-colors ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-emerald-600'
              }`}
              title="Voice Input"
            >
              <Mic className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
              placeholder={t('typeOrSpeakPlaceholder')}
              className="w-full pl-11 pr-12 py-3 rounded-full bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-sm text-slate-800 dark:text-white placeholder-slate-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => handleAiSend()}
              disabled={aiLoading}
              className="absolute right-2 w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action Chips */}
          <div className="flex flex-wrap gap-2">
            {[
              { icon: '🏷️', label: t('chipToken'), query: 'Where is my queue token?' },
              { icon: '📅', label: t('chipSlot'), query: 'How to book a slot?' },
              { icon: '📦', label: t('chipProcurement'), query: 'Check procurement status' },
              { icon: '💳', label: t('chipPayment'), query: 'When will my payment arrive?' },
              { icon: '❓', label: t('chipHelp'), query: 'Give me general help' },
            ].map((chip, i) => (
              <button
                key={i}
                onClick={() => handleAiSend(chip.query)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-700 transition-all shadow-2xs"
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Weather Card */}
        <div className="rounded-2xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{dashboard.weatherTemp}</span>
                  <span className="text-xs font-semibold text-slate-500">{dashboard.weatherCondition}</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{dashboard.weatherLocation}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{dashboard.weatherDate}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                <Sun className="w-7 h-7" />
              </div>
            </div>

            {/* Weather Advisory Box */}
            <div className="mt-4 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{t('weatherAdvisoryTitle')}</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
                {dashboard.weatherAdvisory}
              </p>
              <button className="mt-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline flex items-center gap-1">
                <span>{t('moreInfo')}</span>
              </button>
            </div>
          </div>
        </div>

      </div>


      {/* ROW 2: Four Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Your Token */}
        <div className="rounded-2xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('yourToken')}
            </span>
          </div>

          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {dashboard.tokenNumber}
            </span>
          </div>

          <div className="mt-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              {t('active')}
            </span>
          </div>
        </div>

        {/* 2. Farmers Ahead */}
        <div className="rounded-2xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('farmersAheadTitle')}
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {dashboard.farmersAhead}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {t('farmers')}
            </span>
          </div>

          <div className="mt-3 flex justify-end">
            <Users className="w-5 h-5 text-blue-400 opacity-60" />
          </div>
        </div>

        {/* 3. Estimated Wait */}
        <div className="rounded-2xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('estimatedWaitTitle')}
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {dashboard.estimatedWaitMins}
            </span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
              {t('minutesWait')}
            </span>
          </div>

          <div className="mt-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {t('normalStatus')}
            </span>
          </div>
        </div>

        {/* 4. Smart Arrival */}
        <div className="rounded-2xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('recommendedArrivalTitle')}
            </span>
          </div>

          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {dashboard.recommendedArrival}
            </span>
          </div>

          <div className="mt-3">
            <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
              <span>{t('viewRoute')}</span>
            </button>
          </div>
        </div>

      </div>


      {/* ROW 3: Procurement Centre Card (Left ~60%) + My Slot Card (Right ~40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        
        {/* Procurement Centre Card (~3 cols = 60%) */}
        <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t('yourProcurementCentre')}
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                {t('inOperation')}
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {dashboard.centreName}
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Details List */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-surface-700">
                  <span className="text-slate-500">{t('currentToken')} :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{dashboard.currentToken}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-surface-700">
                  <span className="text-slate-500">{t('yourToken')} :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{dashboard.tokenNumber}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 font-semibold pt-1">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{dashboard.distanceKm} km {t('approx')}</span>
                </div>
              </div>

              {/* Map Preview Box */}
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-surface-700 bg-slate-100 dark:bg-surface-900 flex items-center justify-center">
                {/* SVG Route Graphic Map Fallback */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative flex items-center gap-8">
                  <div className="flex flex-col items-center">
                    <MapPin className="w-6 h-6 text-red-500 animate-bounce" />
                    <span className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded shadow">Start</span>
                  </div>
                  <div className="w-16 h-1 border-t-2 border-dashed border-emerald-600" />
                  <div className="flex flex-col items-center">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                    <span className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded shadow">Centre</span>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-white dark:bg-surface-800 text-[10px] font-bold shadow text-slate-700">
                  {dashboard.distanceKm} km
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <button className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 inline-flex items-center justify-center gap-2 transition-colors">
              <Map className="w-4 h-4" />
              <span>{t('openRoute')}</span>
            </button>
          </div>
        </div>

        {/* My Slot Card (~2 cols = 40%) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t('mySlot')}
                </h3>
              </div>
              <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                {t('viewAll')}
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-surface-700">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{dashboard.slotDate}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                {t('inOperation')}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-lg">
                <Clock className="w-5 h-5 text-slate-500" />
                <span>{dashboard.slotTime}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{dashboard.slotCentre}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button className="px-3 py-2 rounded-xl bg-white dark:bg-surface-700 border border-slate-200 dark:border-surface-600 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('changeTime')}</span>
            </button>
            <button className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-100 transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs">
              <span>{t('cancelSlot')}</span>
            </button>
          </div>
        </div>

      </div>


      {/* ROW 4: Procurement Status (Left ~33%) + Payment (Middle ~33%) + Notifications (Right ~33%) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* 1. Procurement Status Card */}
        <div className="rounded-2xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {t('procurement')}
                </h3>
              </div>
              <button className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                {t('viewDetails')}
              </button>
            </div>

            {/* Vertical Timeline Stages matching reference */}
            <div className="space-y-3 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-surface-700 pl-1">
              {[
                { label: 'Slot Confirmed', status: 'completed' },
                { label: 'Farmer Arrived', status: 'completed' },
                { label: 'Quality Verification', status: 'active' },
                { label: 'Weight Verification', status: 'pending' },
                { label: 'Accepted', status: 'pending' },
                { label: 'Payment', status: 'pending' },
              ].map((step, idx) => (
                <div key={idx} className="relative flex items-center gap-3 z-10">
                  {step.status === 'completed' ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold ring-4 ring-white dark:ring-surface-800">
                      <Check className="w-3 h-3" />
                    </div>
                  ) : step.status === 'active' ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold ring-4 ring-blue-100 dark:ring-blue-900/30 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-surface-700 text-slate-400 flex items-center justify-center text-[10px] ring-4 ring-white dark:ring-surface-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    </div>
                  )}

                  <span className={`text-xs font-semibold ${
                    step.status === 'completed'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : step.status === 'active'
                      ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                      : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Payment Card */}
        <div className="rounded-2xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {t('paymentTitle')}
              </h3>
            </div>

            <div className="my-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {dashboard.paymentAmount}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                  {t('inOperation')}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-2">
                {t('expectedDate')} : <span className="text-slate-800 dark:text-white">{dashboard.expectedPaymentDate}</span>
              </p>
            </div>
          </div>

          <div className="mt-5">
            <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
              <span>{t('viewDetails')}</span>
            </button>
          </div>
        </div>

        {/* 3. Notifications Card */}
        <div className="rounded-2xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {t('notifications')}
                </h3>
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  2
                </span>
              </div>
              <button className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                {t('viewAll')}
              </button>
            </div>

            <div className="space-y-3">
              {/* Notification 1 */}
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/30 flex gap-2.5 items-start">
                <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {t('queueNotificationText', { token: '#128', count: 10 }, 'Only 10 farmers ahead of Token #128.')}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">{t('minsAgo', { mins: 5 }, '5 mins ago')}</p>
                </div>
              </div>

              {/* Notification 2 */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 flex gap-2.5 items-start">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {t('delayNotificationText', 'Minor delay at procurement centre. Expected arrival time updated to 11:35 AM.')}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">{t('minsAgo', { mins: 15 }, '15 mins ago')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>


      {/* ROW 5: Bottom Advisory Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-emerald-200 flex-shrink-0 border border-white/30">
            <Leaf className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white tracking-tight">
              {t('bottomAdvisoryTitle')}
            </h4>
            <p className="text-xs text-emerald-100 mt-0.5 font-medium max-w-xl">
              {dashboard.bottomAdvisory}
            </p>
          </div>
        </div>

        <button className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 flex-shrink-0 border border-emerald-400/30">
          <span>{t('moreAdvisory')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
